import { useState, useEffect } from 'react';
import JSZip from 'jszip';
import * as S from './styles';

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

const CodeEditor = () => {
  const [files, setFiles] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [content, setContent] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [instructions, setInstructions] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [newInstruction, setNewInstruction] = useState({
    action: ModifierActions.INSERT_AFTER,
    content: '',
    pattern: '',
    replacement: '',
    componentName: '',
    propName: '',
    propValue: ''
  });

  useEffect(() => {
    if (currentFile && files[currentFile]) {
      setContent(files[currentFile]);
    }
  }, [currentFile, files]);

  const handleZipUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    const newFiles = {};

    for (const [path, zipEntry] of Object.entries(contents.files)) {
      if (!zipEntry.dir) {
        const content = await zipEntry.async('text');
        newFiles[path] = content;
      }
    }

    setFiles(newFiles);
    const firstFile = Object.keys(newFiles)[0];
    if (firstFile) setCurrentFile(firstFile);
  };

  const handleTextSelect = (e) => {
    const selection = window.getSelection();
    const selected = selection.toString();
    if (selected) {
      setSelectedText(selected);
      setShowBuilder(true);
      setNewInstruction(prev => ({
        ...prev,
        pattern: selected,
        content: ''
      }));
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setFiles(prev => ({
      ...prev,
      [currentFile]: newContent
    }));
  };

  const addInstruction = () => {
    if (!currentFile) return;

    const instruction = {
      path: currentFile,
      action: newInstruction.action,
      ...(newInstruction.content && { content: newInstruction.content }),
      ...(newInstruction.pattern && { pattern: newInstruction.pattern }),
      ...(newInstruction.replacement && { replacement: newInstruction.replacement }),
      ...(newInstruction.componentName && { componentName: newInstruction.componentName }),
      ...(newInstruction.propName && { propName: newInstruction.propName }),
      ...(newInstruction.propValue && { propValue: newInstruction.propValue })
    };

    setInstructions(prev => [...prev, instruction]);
    setShowBuilder(false);
    setNewInstruction({
      action: ModifierActions.INSERT_AFTER,
      content: '',
      pattern: '',
      replacement: '',
      componentName: '',
      propName: '',
      propValue: ''
    });
  };

  const removeInstruction = (index) => {
    setInstructions(prev => prev.filter((_, i) => i !== index));
  };

  const exportInstructions = () => {
    const json = JSON.stringify({ instructions }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modifier-instructions.json';
    a.click();
    URL.revokeObjectURL(url);
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
      
      default:
        return null;
    }
  };

  return (
    <S.Container>
      <S.Header>
        <S.Title>Code Editor</S.Title>
        <S.UploadLabel>
          <S.UploadIcon>📦</S.UploadIcon>
          Import ZIP
          <S.FileInput type="file" accept=".zip" onChange={handleZipUpload} />
        </S.UploadLabel>
      </S.Header>

      <S.Content>
        <S.Sidebar>
          <S.SidebarTitle>Files</S.SidebarTitle>
          <S.FileList>
            {Object.keys(files).map((path) => (
              <S.FileItem
                key={path}
                active={path === currentFile}
                onClick={() => setCurrentFile(path)}
              >
                <S.FileIcon>📄</S.FileIcon>
                {path}
              </S.FileItem>
            ))}
          </S.FileList>
        </S.Sidebar>

        <S.Editor>
          <S.EditorHeader>
            <S.FilePath>{currentFile || 'No file selected'}</S.FilePath>
            <S.ActionButton onClick={() => setShowBuilder(true)}>
              + New Instruction
            </S.ActionButton>
          </S.EditorHeader>
          <S.CodeArea
            value={content}
            onChange={handleContentChange}
            onMouseUp={handleTextSelect}
            spellCheck={false}
            placeholder="Select a file to edit..."
          />
        </S.Editor>

        <S.Panel>
          <S.PanelHeader>
            <S.PanelTitle>Instructions ({instructions.length})</S.PanelTitle>
            {instructions.length > 0 && (
              <S.ExportButton onClick={exportInstructions}>
                ⬇ Export JSON
              </S.ExportButton>
            )}
          </S.PanelHeader>

          <S.InstructionList>
            {instructions.map((inst, index) => (
              <S.InstructionCard key={index}>
                <S.InstructionHeader>
                  <S.ActionBadge>{inst.action}</S.ActionBadge>
                  <S.RemoveButton onClick={() => removeInstruction(index)}>
                    ✕
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
        <S.Modal onClick={() => setShowBuilder(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>New Instruction</S.ModalTitle>
              <S.CloseButton onClick={() => setShowBuilder(false)}>✕</S.CloseButton>
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
                  value={currentFile || ''}
                  disabled
                />
              </S.Field>

              {getActionFields()}

              <S.ButtonGroup>
                <S.CancelButton onClick={() => setShowBuilder(false)}>
                  Cancel
                </S.CancelButton>
                <S.AddButton onClick={addInstruction}>
                  Add Instruction
                </S.AddButton>
              </S.ButtonGroup>
            </S.Form>
          </S.ModalContent>
        </S.Modal>
      )}
    </S.Container>
  );
};

export default CodeEditor;