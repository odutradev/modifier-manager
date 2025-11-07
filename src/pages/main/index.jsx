import { useState, useEffect } from 'react';
import JSZip from 'jszip';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { githubDark } from '@uiw/codemirror-theme-github';
import * as S from './styles';

const ICONS = {
  UPLOAD: '<svg fill="currentColor" viewBox="0 0 16 16" width="16" height="16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/></svg>',
  FILE: '<svg fill="currentColor" viewBox="0 0 16 16" width="14" height="14"><path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/></svg>',
  TRASH: '<svg fill="currentColor" viewBox="0 0 16 16" width="14" height="14"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>',
  CLOSE: '<svg fill="currentColor" viewBox="0 0 16 16" width="16" height="16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>',
  DOWNLOAD: '<svg fill="currentColor" viewBox="0 0 16 16" width="14" height="14"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>',
  PREVIEW: '<svg fill="currentColor" viewBox="0 0 16 16" width="14" height="14"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg>',
  PLUS: '<svg fill="currentColor" viewBox="0 0 16 16" width="14" height="14"><path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/></svg>',
  IMPORT: '<svg fill="currentColor" viewBox="0 0 16 16" width="14" height="14"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/></svg>',
  MORE: '<svg fill="currentColor" viewBox="0 0 16 16" width="16" height="16"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>'
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

const CodeEditor = () => {
  const [files, setFiles] = useState({});
  const [zipName, setZipName] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [content, setContent] = useState('');
  const [selectedText, setSelectedText] = useState('');
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
      setSelectedText(selected);
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
      // Support both directly pasted instructions array or the export format { instructions: [] }
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
              modifiedFiles[path] = modifiedFiles[path].replace(new RegExp(inst.pattern, 'g'), inst.replacement || '');
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
    <S.Container>
      <S.Header>
        <S.Title>Code Editor</S.Title>
        <S.HeaderControls>
          {zipName ? (
            <>
              <S.ZipName>{zipName}</S.ZipName>
              <S.ClearButton onClick={handleClear}>
                <span dangerouslySetInnerHTML={{ __html: ICONS.TRASH }} />
                Clear
              </S.ClearButton>
            </>
          ) : (
            <S.UploadLabel>
              <S.UploadIcon dangerouslySetInnerHTML={{ __html: ICONS.UPLOAD }} />
              Import ZIP
              <S.FileInput type="file" accept=".zip" onChange={handleZipUpload} />
            </S.UploadLabel>
          )}
        </S.HeaderControls>
      </S.Header>

      <S.Content>
        <S.Sidebar>
          <S.SidebarTitle>Files</S.SidebarTitle>
          <S.FileList>
            {Object.keys(files).sort().map((path) => (
              <S.FileItem
                key={path}
                active={path === currentFile}
                onClick={() => setCurrentFile(path)}
              >
                <S.FileIcon dangerouslySetInnerHTML={{ __html: ICONS.FILE }} />
                {path}
              </S.FileItem>
            ))}
          </S.FileList>
        </S.Sidebar>

        <S.Editor>
          <S.EditorHeader>
            <S.FilePath>{currentFile || 'No file selected'}</S.FilePath>
            <S.ActionButton 
              onClick={handleOpenInstructionBuilder}
              disabled={!currentFile && !Object.keys(files).length}
            >
              <span dangerouslySetInnerHTML={{ __html: ICONS.PLUS }} />
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
                   <span dangerouslySetInnerHTML={{ __html: ICONS.MORE }} />
                </S.MenuButton>
                {showMenu && (
                  <>
                    <S.MenuBackdrop onClick={() => setShowMenu(false)} />
                    <S.MenuDropdown>
                      <S.MenuItem onClick={handlePreview} disabled={instructions.length === 0}>
                        <span dangerouslySetInnerHTML={{ __html: ICONS.PREVIEW }} />
                        Preview
                      </S.MenuItem>
                      <S.MenuItem onClick={handleExportClick} disabled={instructions.length === 0}>
                        <span dangerouslySetInnerHTML={{ __html: ICONS.DOWNLOAD }} />
                        Export
                      </S.MenuItem>
                      <S.MenuSeparator />
                      <S.MenuItem as="label">
                        <span dangerouslySetInnerHTML={{ __html: ICONS.IMPORT }} />
                        Import File
                        <S.FileInput type="file" accept=".json" onChange={handleImportFile} />
                      </S.MenuItem>
                      <S.MenuItem onClick={() => { setShowImportModal(true); setShowMenu(false); }}>
                        <span dangerouslySetInnerHTML={{ __html: ICONS.IMPORT }} />
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
                  <S.RemoveButton onClick={(e) => removeInstruction(e, index)}>
                    <span dangerouslySetInnerHTML={{ __html: ICONS.TRASH }} />
                  </S.RemoveButton>
                </S.InstructionHeader>
                <S.InstructionPath>{inst.path}</S.InstructionPath>
                {inst.pattern && <S.InstructionDetail>Pattern: {inst.pattern}</S.InstructionDetail>}
                {inst.content && <S.InstructionDetail>Content: {inst.content.substring(0, 50)}...</S.InstructionDetail>}
              </S.InstructionCard>
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
                <span dangerouslySetInnerHTML={{ __html: ICONS.CLOSE }} />
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
                <span dangerouslySetInnerHTML={{ __html: ICONS.CLOSE }} />
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
                <span dangerouslySetInnerHTML={{ __html: ICONS.CLOSE }} />
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
                <span dangerouslySetInnerHTML={{ __html: ICONS.CLOSE }} />
              </S.CloseButton>
            </S.ModalHeader>
            <S.PreviewModalBody>
              <S.PreviewWarning>
                Note: This is a simulation. Unsupported actions (like INSERT_PROP) are not reflected.
              </S.PreviewWarning>
              <S.PreviewLayout>
                <S.Sidebar>
                  <S.SidebarTitle>Modified Files</S.SidebarTitle>
                  <S.FileList>
                    {previewFiles && Object.keys(previewFiles).sort().map((path) => (
                      <S.FileItem
                        key={path}
                        active={path === previewFile}
                        onClick={() => setPreviewFile(path)}
                      >
                        <S.FileIcon dangerouslySetInnerHTML={{ __html: ICONS.FILE }} />
                        {path}
                      </S.FileItem>
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