import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import JSZip from 'jszip';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { githubDark } from '@uiw/codemirror-theme-github';
import * as S from './styles';

const ICONS = {
  UPLOAD: 'folder_zip',
  FILE: 'description',
  FOLDER: 'folder',
  FOLDER_OPEN: 'folder_open',
  CHEVRON_RIGHT: 'chevron_right',
  CHEVRON_DOWN: 'expand_more',
  TRASH: 'delete',
  CLOSE: 'close',
  DOWNLOAD: 'download',
  PREVIEW: 'visibility',
  PLUS: 'add',
  IMPORT: 'file_upload',
  IMPORT_TEXT: 'post_add',
  MORE: 'more_vert'
};

const ModifierActions = {
  CREATE_FILE: 'CREATE_FILE',
  DELETE_FILE: 'DELETE_FILE',
  INSERT_IMPORT: 'INSERT_IMPORT',
  INSERT_AFTER: 'INSERT_AFTER',
  INSERT_BEFORE: 'INSERT_BEFORE',
  REPLACE_CONTENT: 'REPLACE_CONTENT',
  APPEND_TO_FILE: 'APPEND_TO_FILE',
  INSERT_PROP: 'INSERT_PROP'
};

const defaultInstructionState = {
  action: ModifierActions.INSERT_AFTER,
  path: '',
  content: '',
  pattern: '',
  replacement: '',
  componentName: '',
  propName: '',
  propValue: ''
};

const buildFileTree = (files) => {
  const root = [];
  Object.keys(files).forEach(path => {
    const parts = path.split('/');
    let currentLevel = root;
    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      let existingPath = currentLevel.find(item => item.name === part && item.type === (isFile ? 'file' : 'folder'));
      if (!existingPath) {
        const newItem = {
          name: part,
          type: isFile ? 'file' : 'folder',
          path: isFile ? path : null,
          children: isFile ? null : []
        };
        currentLevel.push(newItem);
        existingPath = newItem;
      }
      currentLevel = existingPath.children;
    });
  });

  const sortTree = (level) => {
    level.sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
    level.forEach(item => {
      if (item.type === 'folder') {
        sortTree(item.children);
      }
    });
  };

  sortTree(root);
  return root;
};

const FileTreeNode = ({ item, level, onSelect, currentFile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = item.path === currentFile;

  if (item.type === 'folder') {
    return (
      <>
        <S.FolderItem level={level} onClick={() => setIsOpen(!isOpen)}>
          <S.ChevronIcon>{isOpen ? ICONS.CHEVRON_DOWN : ICONS.CHEVRON_RIGHT}</S.ChevronIcon>
          <S.FileIcon style={{ color: '#dcb67a' }}>{isOpen ? ICONS.FOLDER_OPEN : ICONS.FOLDER}</S.FileIcon>
          {item.name}
        </S.FolderItem>
        {isOpen && item.children.map(child => (
          <FileTreeNode key={child.path || child.name} item={child} level={level + 1} onSelect={onSelect} currentFile={currentFile} />
        ))}
      </>
    );
  }

  return (
    <S.FileItem level={level} active={isSelected} onClick={() => onSelect(item.path)}>
      <S.FileIcon>{ICONS.FILE}</S.FileIcon>
      {item.name}
    </S.FileItem>
  );
};

const CodeEditor = () => {
  const [files, setFiles] = useState({});
  const [zipName, setZipName] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [content, setContent] = useState('');
  const [instructions, setInstructions] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newInstruction, setNewInstruction] = useState(defaultInstructionState);
  const [showExportModal, setShowExportModal] = useState(false);
  const [jsonContent, setJsonContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFiles, setPreviewFiles] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  const fileTree = useMemo(() => buildFileTree(files), [files]);
  const previewFileTree = useMemo(() => previewFiles ? buildFileTree(previewFiles) : [], [previewFiles]);

  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((mouseMoveEvent) => {
    if (isResizing) {
      const newWidth = mouseMoveEvent.clientX - sidebarRef.current.getBoundingClientRect().left;
      if (newWidth > 150 && newWidth < 600) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  useEffect(() => {
    if (currentFile && files[currentFile]) {
      setContent(files[currentFile]);
    } else if (!currentFile) {
      setContent('');
    }
  }, [currentFile, files]);

  const handleZipUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setZipName(file.name);
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    const newFiles = {};

    const filePaths = Object.keys(contents.files).filter(path => !contents.files[path].dir && !path.startsWith('__MACOSX'));
    
    if (filePaths.length === 0) return;

    const firstPathParts = filePaths[0].split('/');
    let rootPrefix = '';
    if (firstPathParts.length > 1) {
      const potentialRoot = firstPathParts[0] + '/';
      if (filePaths.every(p => p.startsWith(potentialRoot))) {
        rootPrefix = potentialRoot;
      }
    }

    for (const [path, zipEntry] of Object.entries(contents.files)) {
      if (!zipEntry.dir && !path.startsWith('__MACOSX')) {
        const fileContent = await zipEntry.async('text');
        const normalizedPath = path.startsWith(rootPrefix)
          ? path.substring(rootPrefix.length)
          : path;
        
        if(normalizedPath) {
          newFiles[normalizedPath] = fileContent;
        }
      }
    }

    setFiles(newFiles);
    setInstructions([]);
    const firstFile = Object.keys(newFiles)[0];
    if (firstFile) {
      setCurrentFile(firstFile);
    } else {
      setCurrentFile(null);
    }
    e.target.value = null; 
  };
  
  const handleClear = () => {
    setFiles({});
    setCurrentFile(null);
    setZipName(null);
    setInstructions([]);
  };

  const handleTextSelect = () => {
    const selection = window.getSelection();
    const selected = selection.toString();
    if (selected) {
      setNewInstruction(prev => ({
        ...defaultInstructionState,
        path: currentFile,
        pattern: selected,
        action: ModifierActions.INSERT_AFTER,
      }));
      setEditingIndex(null);
      setShowBuilder(true);
    }
  };
  
  const handleOpenInstructionBuilder = () => {
    setNewInstruction(prev => ({
      ...defaultInstructionState,
      path: currentFile,
    }));
    setEditingIndex(null);
    setShowBuilder(true);
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
    setFiles(prev => ({
      ...prev,
      [currentFile]: newContent
    }));
  };

  const handleCloseModal = () => {
    setShowBuilder(false);
    setEditingIndex(null);
    setNewInstruction(defaultInstructionState);
  };

  const addInstruction = () => {
    const instruction = {
      path: newInstruction.path,
      action: newInstruction.action,
      ...(newInstruction.content && { content: newInstruction.content }),
      ...(newInstruction.pattern && { pattern: newInstruction.pattern }),
      ...(newInstruction.replacement && { replacement: newInstruction.replacement }),
      ...(newInstruction.componentName && { componentName: newInstruction.componentName }),
      ...(newInstruction.propName && { propName: newInstruction.propName }),
      ...(newInstruction.propValue && { propValue: newInstruction.propValue })
    };
    
    if (editingIndex !== null) {
      setInstructions(prev => prev.map((item, i) => i === editingIndex ? instruction : item));
    } else {
      setInstructions(prev => [...prev, instruction]);
    }
    
    handleCloseModal();
  };
  
  const handleEditInstruction = (index) => {
    const inst = instructions[index];
    setNewInstruction({
      ...defaultInstructionState,
      ...inst,
    });
    setEditingIndex(index);
    setShowBuilder(true);
  };

  const removeInstruction = (e, index) => {
    e.stopPropagation(); 
    setInstructions(prev => prev.filter((_, i) => i !== index));
  };

  const handleExportClick = () => {
    const json = JSON.stringify({ instructions }, null, 2);
    setJsonContent(json);
    setShowExportModal(true);
    setShowMenu(false);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modifier-instructions.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (json.instructions && Array.isArray(json.instructions)) {
          setInstructions(json.instructions);
        } else {
          alert('Invalid instructions file format');
        }
      } catch (error) {
        alert('Error parsing JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = null;
    setShowMenu(false);
  };

  const handleImportTextSubmit = () => {
    try {
      const json = JSON.parse(importText);
      let newInstructions = [];
      if (Array.isArray(json)) {
          newInstructions = json;
      } else if (json.instructions && Array.isArray(json.instructions)) {
          newInstructions = json.instructions;
      } else {
        throw new Error('Invalid format');
      }
      
      setInstructions(newInstructions);
      setShowImportModal(false);
      setImportText('');
    } catch (error) {
      alert('Invalid JSON. Please check your text.');
    }
  };

  const handlePreview = () => {
    let modifiedFiles = { ...files };

    for (const inst of instructions) {
      const path = inst.path;
      if (!path) continue;

      try {
        switch (inst.action) {
          case ModifierActions.CREATE_FILE:
            modifiedFiles[path] = inst.content || '';
            break;
            
          case ModifierActions.DELETE_FILE:
            delete modifiedFiles[path];
            break;
            
          case ModifierActions.INSERT_IMPORT:
            if (modifiedFiles[path] !== undefined) {
              modifiedFiles[path] = `${inst.content}\n${modifiedFiles[path]}`;
            }
            break;
            
          case ModifierActions.APPEND_TO_FILE:
            if (modifiedFiles[path] !== undefined) {
              modifiedFiles[path] += `\n${inst.content}`;
            }
            break;
            
          case ModifierActions.INSERT_AFTER:
            if (modifiedFiles[path] !== undefined && inst.pattern) {
              modifiedFiles[path] = modifiedFiles[path].split(inst.pattern).join(`${inst.pattern}\n${inst.content}`);
            }
            break;
            
          case ModifierActions.INSERT_BEFORE:
            if (modifiedFiles[path] !== undefined && inst.pattern) {
              modifiedFiles[path] = modifiedFiles[path].split(inst.pattern).join(`${inst.content}\n${inst.pattern}`);
            }
            break;
            
          case ModifierActions.REPLACE_CONTENT:
            if (modifiedFiles[path] !== undefined && inst.pattern) {
              modifiedFiles[path] = modifiedFiles[path].split(inst.pattern).join(inst.replacement || '');
            }
            break;
          
          default:
            break;
        }
      } catch (error) {
        console.error("Error applying instruction:", inst, error);
      }
    }
    
    setPreviewFiles(modifiedFiles);
    const firstFile = Object.keys(modifiedFiles).length > 0 ? Object.keys(modifiedFiles)[0] : null;
    setPreviewFile(firstFile);
    setShowPreviewModal(true);
    setShowMenu(false);
  };

  const getActionFields = () => {
    const action = newInstruction.action;
    
    switch (action) {
      case ModifierActions.CREATE_FILE:
        return (
          <S.Field>
            <S.Label>Content</S.Label>
            <S.Textarea
              value={newInstruction.content}
              onChange={(e) => setNewInstruction(prev => ({ ...prev, content: e.target.value }))}
              placeholder="File content..."
              rows={6}
            />
          </S.Field>
        );
      
      case ModifierActions.INSERT_IMPORT:
      case ModifierActions.APPEND_TO_FILE:
        return (
          <S.Field>
            <S.Label>Content</S.Label>
            <S.Input
              value={newInstruction.content}
              onChange={(e) => setNewInstruction(prev => ({ ...prev, content: e.target.value }))}
              placeholder="import { Component } from './Component';"
            />
          </S.Field>
       );
      
      case ModifierActions.INSERT_AFTER:
      case ModifierActions.INSERT_BEFORE:
        return (
          <>
            <S.Field>
              <S.Label>Pattern</S.Label>
              <S.Input
                value={newInstruction.pattern}
                onChange={(e) => setNewInstruction(prev => ({ ...prev, pattern: e.target.value }))}
                placeholder="Text to find..."
              />
            </S.Field>
            <S.Field>
              <S.Label>Content</S.Label>
              <S.Textarea
                value={newInstruction.content}
                onChange={(e) => setNewInstruction(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Content to insert..."
                rows={4}
              />
            </S.Field>
          </>
        );
      
      case ModifierActions.REPLACE_CONTENT:
        return (
          <>
            <S.Field>
              <S.Label>Pattern (regex)</S.Label>
              <S.Input
                value={newInstruction.pattern}
                onChange={(e) => setNewInstruction(prev => ({ ...prev, pattern: e.target.value }))}
                placeholder="Pattern to match..."
              />
            </S.Field>
            <S.Field>
              <S.Label>Replacement</S.Label>
              <S.Input
                value={newInstruction.replacement}
                onChange={(e) => setNewInstruction(prev => ({ ...prev, replacement: e.target.value }))}
                placeholder="Replacement text..."
              />
            </S.Field>
          </>
        );
      
      case ModifierActions.INSERT_PROP:
        return (
          <>
            <S.Field>
              <S.Label>Component Name</S.Label>
              <S.Input
                value={newInstruction.componentName}
                onChange={(e) => setNewInstruction(prev => ({ ...prev, componentName: e.target.value }))}
                placeholder="Button"
              />
            </S.Field>
            <S.Field>
              <S.Label>Prop Name</S.Label>
              <S.Input
                value={newInstruction.propName}
                onChange={(e) => setNewInstruction(prev => ({ ...prev, propName: e.target.value }))}
                placeholder="variant"
              />
            </S.Field>
            <S.Field>
              <S.Label>Prop Value (optional)</S.Label>
              <S.Input
                value={newInstruction.propValue}
                onChange={(e) => setNewInstruction(prev => ({ ...prev, propValue: e.target.value }))}
                placeholder='"primary"'
              />
            </S.Field>
          </>
        );
        
      case ModifierActions.DELETE_FILE:
        return null; 
      
      default:
        return null;
    }
  };

  return (
    <S.Container ref={sidebarRef}>
      <S.Header>
        <S.Title>Code Editor</S.Title>
        <S.HeaderControls>
          {zipName ? (
            <>
              <S.ZipName>{zipName}</S.ZipName>
              <S.ClearButton onClick={handleClear}>
                <S.Icon>{ICONS.TRASH}</S.Icon>
                Clear
              </S.ClearButton>
            </>
          ) : (
            <S.UploadLabel>
              <S.Icon style={{ marginRight: 8 }}>{ICONS.UPLOAD}</S.Icon>
              Import ZIP
              <S.FileInput type="file" accept=".zip" onChange={handleZipUpload} />
            </S.UploadLabel>
          )}
        </S.HeaderControls>
      </S.Header>

      <S.Content style={{ gridTemplateColumns: `${sidebarWidth}px 1fr 350px` }}>
        <S.SidebarContainer>
          <S.Sidebar>
            <S.SidebarTitle>Explorer</S.SidebarTitle>
            <S.FileList>
              {fileTree.map(item => (
                <FileTreeNode 
                  key={item.path || item.name} 
                  item={item} 
                  level={0} 
                  onSelect={setCurrentFile} 
                  currentFile={currentFile} 
                />
              ))}
            </S.FileList>
          </S.Sidebar>
          <S.Resizer onMouseDown={startResizing} />
        </S.SidebarContainer>

        <S.Editor>
          <S.EditorHeader>
            <S.FilePath>{currentFile || 'No file selected'}</S.FilePath>
            <S.ActionButton 
              onClick={handleOpenInstructionBuilder}
              disabled={!currentFile && !Object.keys(files).length}
            >
              <S.Icon>{ICONS.PLUS}</S.Icon>
              New Instruction
            </S.ActionButton>
          </S.EditorHeader>
          
          <S.CodeEditorWrapper onMouseUp={handleTextSelect}>
            <CodeMirror
              value={content}
              onChange={handleContentChange}
              theme={githubDark}
              extensions={[javascript({ jsx: true })]}
              height="100%"
              readOnly={!currentFile}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                autocompletion: true,
                bracketMatching: true,
              }}
            />
          </S.CodeEditorWrapper>

        </S.Editor>

        <S.Panel>
          <S.PanelHeader>
            <S.PanelTitle>Instructions ({instructions.length})</S.PanelTitle>
            <S.PanelActions>
              <S.MenuContainer>
                <S.MenuButton onClick={() => setShowMenu(!showMenu)} active={showMenu}>
                   <S.Icon>{ICONS.MORE}</S.Icon>
                </S.MenuButton>
                {showMenu && (
                  <>
                    <S.MenuBackdrop onClick={() => setShowMenu(false)} />
                    <S.MenuDropdown>
                      <S.MenuItem onClick={handlePreview} disabled={instructions.length === 0}>
                        <S.Icon>{ICONS.PREVIEW}</S.Icon>
                        Preview
                      </S.MenuItem>
                      <S.MenuItem onClick={handleExportClick} disabled={instructions.length === 0}>
                        <S.Icon>{ICONS.DOWNLOAD}</S.Icon>
                        Export
                      </S.MenuItem>
                      <S.MenuSeparator />
                      <S.MenuItem as="label">
                        <S.Icon>{ICONS.IMPORT}</S.Icon>
                        Import File
                        <S.FileInput type="file" accept=".json" onChange={handleImportFile} />
                      </S.MenuItem>
                      <S.MenuItem onClick={() => { setShowImportModal(true); setShowMenu(false); }}>
                        <S.Icon>{ICONS.IMPORT_TEXT}</S.Icon>
                        Import Text
                      </S.MenuItem>
                    </S.MenuDropdown>
                  </>
                )}
              </S.MenuContainer>
            </S.PanelActions>
          </S.PanelHeader>

          <S.InstructionList>
            {instructions.map((inst, index) => (
              <S.InstructionCard key={index} onClick={() => handleEditInstruction(index)}>
                <S.InstructionHeader>
                  <S.ActionBadge>{inst.action}</S.ActionBadge>
      _             <S.RemoveButton onClick={(e) => removeInstruction(e, index)}>
                    <S.Icon>{ICONS.TRASH}</S.Icon>
                  </S.RemoveButton>
                </S.InstructionHeader>
                <S.InstructionPath>{inst.path}</S.InstructionPath>
                {inst.pattern && <S.InstructionDetail>Pattern: {inst.pattern}</S.InstructionDetail>}
                {inst.content && <S.InstructionDetail>Content: {inst.content.substring(0, 50)}...</S.InstructionDetail>}
      M       </S.InstructionCard>
            ))}
          </S.InstructionList>
        </S.Panel>
      </S.Content>

      {showBuilder && (
        <S.Modal onClick={handleCloseModal}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>{editingIndex !== null ? 'Edit Instruction' : 'New Instruction'}</S.ModalTitle>
              <S.CloseButton onClick={handleCloseModal}>
                <S.Icon style={{ fontSize: 20 }}>{ICONS.CLOSE}</S.Icon>
              </S.CloseButton>
            </S.ModalHeader>

            <S.Form>
              <S.Field>
                <S.Label>Action</S.Label>
                <S.Select
                  value={newInstruction.action}
                  onChange={(e) => setNewInstruction(prev => ({ ...prev, action: e.target.value }))}
                >
                  {Object.values(ModifierActions).map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </S.Select>
              </S.Field>

              <S.Field>
                <S.Label>File Path</S.Label>
                <S.Input
                  value={newInstruction.path || ''}
                  onChange={(e) => setNewInstruction(prev => ({ ...prev, path: e.target.value }))}
                  placeholder="path/to/file.js"
                  disabled={![ModifierActions.CREATE_FILE, ModifierActions.DELETE_FILE].includes(newInstruction.action)}
                />
              </S.Field>

              {getActionFields()}

            </S.Form>
            
            <S.ButtonGroup>
              <S.CancelButton onClick={handleCloseModal}>
                Cancel
              </S.CancelButton>
              <S.AddButton onClick={addInstruction}>
                {editingIndex !== null ? 'Update Instruction' : 'Add Instruction'}
              </S.AddButton>
            </S.ButtonGroup>
          </S.ModalContent>
        </S.Modal>
      )}
      
      {showExportModal && (
        <S.Modal onClick={() => setShowExportModal(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>Export Instructions</S.ModalTitle>
              <S.CloseButton onClick={() => setShowExportModal(false)}>
                <S.Icon style={{ fontSize: 20 }}>{ICONS.CLOSE}</S.Icon>
              </S.CloseButton>
            </S.ModalHeader>
            <S.JsonViewerWrapper>
              <CodeMirror
                value={jsonContent}
                theme={githubDark}
                extensions={[javascript({ jsx: true })]}
                height="100%"
                readOnly={true}
              />
            </S.JsonViewerWrapper>
            <S.ButtonGroup>
              <S.CancelButton onClick={() => setShowExportModal(false)}>
                Close
              </S.CancelButton>
              <S.CopyButton onClick={handleCopyJson}>
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </S.CopyButton>
              <S.DownloadButton onClick={handleDownloadJson}>
                Download JSON
              </S.DownloadButton>
            </S.ButtonGroup>
          </S.ModalContent>
        </S.Modal>
      )}

      {showImportModal && (
        <S.Modal onClick={() => setShowImportModal(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>Import Instructions (JSON Text)</S.ModalTitle>
              <S.CloseButton onClick={() => setShowImportModal(false)}>
                <S.Icon style={{ fontSize: 20 }}>{ICONS.CLOSE}</S.Icon>
              </S.CloseButton>
            </S.ModalHeader>
            <S.Form>
               <S.Field>
                <S.Label>Paste JSON here</S.Label>
                <S.Textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder='{"instructions": [...]}'
                  rows={15}
                  style={{ fontFamily: 'monospace' }}
                />
              </S.Field>
            </S.Form>
            <S.ButtonGroup>
              <S.CancelButton onClick={() => setShowImportModal(false)}>
                Cancel
              </S.CancelButton>
              <S.AddButton onClick={handleImportTextSubmit} disabled={!importText.trim()}>
                Import
              </S.AddButton>
            </S.ButtonGroup>
          </S.ModalContent>
        </S.Modal>
      )}
      
      {showPreviewModal && (
        <S.Modal onClick={() => setShowPreviewModal(false)}>
          <S.PreviewModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>Execution Preview</S.ModalTitle>
              <S.CloseButton onClick={() => setShowPreviewModal(false)}>
                <S.Icon style={{ fontSize: 20 }}>{ICONS.CLOSE}</S.Icon>
              </S.CloseButton>
            </S.ModalHeader>
            <S.PreviewModalBody>
              <S.PreviewLayout>
                <S.Sidebar>
                  <S.SidebarTitle>Modified Files</S.SidebarTitle>
                  <S.FileList>
                    {previewFileTree.map(item => (
                      <FileTreeNode 
                        key={item.path || item.name} 
                        item={item} 
                        level={0} 
                        onSelect={setPreviewFile} 
                        currentFile={previewFile} 
          _           />
                    ))}
                  </S.FileList>
                </S.Sidebar>
                <S.PreviewEditor>
                  <CodeMirror
                    value={(previewFile && previewFiles[previewFile]) || ''}
                    theme={githubDark}
                    extensions={[javascript({ jsx: true })]}
                    height="100%"
                    readOnly={true}
                    basicSetup={{
                      lineNumbers: true,
                    }}
                  />
                </S.PreviewEditor>
              </S.PreviewLayout>
            </S.PreviewModalBody>
          </S.PreviewModalContent>
        </S.Modal>
      )}

    </S.Container>
  );
};

export default CodeEditor;