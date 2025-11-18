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
  MORE: 'more_vert',
  CONDITION: 'rule',
  CREATE_FOLDER: 'create_new_folder',
  NOTE_ADD: 'note_add',
  DRAG: 'drag_indicator',
  ARROW_UP: 'arrow_upward',
  ARROW_DOWN: 'arrow_downward',
  TEMPLATE: 'dashboard_customize',
  CHECK: 'check_circle',
  CLEAR: 'clear_all',
  MODULE: 'extension'
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

const ConditionTypes = {
  MODULE_EXISTS: 'MODULE_EXISTS',
  MODULE_NOT_EXISTS: 'MODULE_NOT_EXISTS',
  PATTERN_EXISTS: 'PATTERN_EXISTS',
  PATTERN_NOT_EXISTS: 'PATTERN_NOT_EXISTS',
  PATTERN_COUNT: 'PATTERN_COUNT',
  FILE_EXISTS: 'FILE_EXISTS',
  FILE_NOT_EXISTS: 'FILE_NOT_EXISTS'
};

const ConditionOperators = {
  EQUALS: 'EQUALS',
  NOT_EQUALS: 'NOT_EQUALS',
  GREATER_THAN: 'GREATER_THAN',
  LESS_THAN: 'LESS_THAN',
  GREATER_OR_EQUAL: 'GREATER_OR_EQUAL',
  LESS_OR_EQUAL: 'LESS_OR_EQUAL'
};

const LogicOperators = {
  AND: 'AND',
  OR: 'OR'
};

const defaultConditionState = {
  type: ConditionTypes.MODULE_EXISTS,
  value: '',
  operator: ConditionOperators.EQUALS,
  count: 0,
  target: ''
};

const defaultInstructionState = {
  action: ModifierActions.INSERT_AFTER,
  path: '',
  content: '',
  pattern: '',
  replacement: '',
  componentName: '',
  propName: '',
  propValue: '',
  condition: null
};

const buildFileTree = (files, virtualItems = {}) => {
  const root = [];
  const allPaths = { ...files, ...virtualItems };
  
  Object.keys(allPaths).forEach(path => {
    const parts = path.split('/');
    let currentLevel = root;
    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1 && !virtualItems[path]?.isFolder;
      let existingPath = currentLevel.find(item => item.name === part && item.type === (isFile ? 'file' : 'folder'));
      if (!existingPath) {
        const newItem = {
          name: part,
          type: isFile ? 'file' : 'folder',
          path: isFile ? path : null,
          isVirtual: !!virtualItems[path],
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

const evaluateCondition = (condition, files, loadedModules = []) => {
  try {
    switch (condition.type) {
      case ConditionTypes.MODULE_EXISTS:
        return loadedModules.includes(condition.value);

      case ConditionTypes.MODULE_NOT_EXISTS:
        return !loadedModules.includes(condition.value);

      case ConditionTypes.FILE_EXISTS:
        return files[condition.target || condition.value] !== undefined;

      case ConditionTypes.FILE_NOT_EXISTS:
        return files[condition.target || condition.value] === undefined;

      case ConditionTypes.PATTERN_EXISTS: {
        const targetFile = condition.target || condition.value;
        const fileContent = files[targetFile];
        if (!fileContent) return false;
        return fileContent.includes(condition.value);
      }

      case ConditionTypes.PATTERN_NOT_EXISTS: {
        const targetFile = condition.target || condition.value;
        const fileContent = files[targetFile];
        if (!fileContent) return true;
        return !fileContent.includes(condition.value);
      }

      case ConditionTypes.PATTERN_COUNT: {
        const targetFile = condition.target || condition.value;
        const fileContent = files[targetFile];
        if (!fileContent) return false;
        
        const count = (fileContent.match(new RegExp(condition.value, 'g')) || []).length;
        
        switch (condition.operator) {
          case ConditionOperators.EQUALS:
            return count === condition.count;
          case ConditionOperators.NOT_EQUALS:
            return count !== condition.count;
          case ConditionOperators.GREATER_THAN:
            return count > condition.count;
          case ConditionOperators.LESS_THAN:
            return count < condition.count;
          case ConditionOperators.GREATER_OR_EQUAL:
            return count >= condition.count;
          case ConditionOperators.LESS_OR_EQUAL:
            return count <= condition.count;
          default:
            return false;
        }
      }

      default:
        return true;
    }
  } catch (error) {
    console.error('Error evaluating condition:', condition, error);
    return false;
  }
};

const evaluateConditions = (conditionsObj, files, loadedModules = []) => {
  if (!conditionsObj || !conditionsObj.conditions || conditionsObj.conditions.length === 0) {
    return true;
  }

  const results = conditionsObj.conditions.map(cond => 
    evaluateCondition(cond, files, loadedModules)
  );

  if (conditionsObj.logic === LogicOperators.OR) {
    return results.some(r => r);
  }

  return results.every(r => r);
};

const applyInstructions = (files, instructions, loadedModules = []) => {
  let modifiedFiles = { ...files };

  for (const inst of instructions) {
    const path = inst.path;
    if (!path) continue;

    if (inst.condition && !evaluateConditions(inst.condition, modifiedFiles, loadedModules)) {
      console.log('Skipping instruction due to condition:', inst);
      continue;
    }

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

  return modifiedFiles;
};

const FileTreeNode = ({ item, level, onSelect, currentFile, onContextMenu, parentPath = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = item.path === currentFile;
  const fullPath = item.path || (parentPath ? `${parentPath}/${item.name}` : item.name);

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, item, fullPath);
  };

  if (item.type === 'folder') {
    return (
      <>
        <S.FolderItem 
          level={level} 
          onClick={() => setIsOpen(!isOpen)}
          onContextMenu={handleContextMenu}
          isVirtual={item.isVirtual}
        >
          <S.ChevronIcon>{isOpen ? ICONS.CHEVRON_DOWN : ICONS.CHEVRON_RIGHT}</S.ChevronIcon>
          <S.FileIcon style={{ color: item.isVirtual ? '#7ee787' : '#dcb67a' }}>
            {isOpen ? ICONS.FOLDER_OPEN : ICONS.FOLDER}
          </S.FileIcon>
          {item.name}
        </S.FolderItem>
        {isOpen && item.children.map(child => (
          <FileTreeNode 
            key={child.path || `${fullPath}/${child.name}`} 
            item={child} 
            level={level + 1} 
            onSelect={onSelect} 
            currentFile={currentFile}
            onContextMenu={onContextMenu}
            parentPath={fullPath}
          />
        ))}
      </>
    );
  }

  return (
    <S.FileItem 
      level={level} 
      active={isSelected} 
      onClick={() => onSelect(item.path)}
      onContextMenu={handleContextMenu}
      isVirtual={item.isVirtual}
    >
      <S.FileIcon style={{ color: item.isVirtual ? '#7ee787' : '#8b949e' }}>
        {ICONS.FILE}
      </S.FileIcon>
      {item.name}
    </S.FileItem>
  );
};

const CodeEditor = () => {
  const [files, setFiles] = useState({});
  const [virtualItems, setVirtualItems] = useState({});
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
  const [showConditionBuilder, setShowConditionBuilder] = useState(false);
  const [conditions, setConditions] = useState([]);
  const [logicOperator, setLogicOperator] = useState(LogicOperators.AND);
  const [editingConditionIndex, setEditingConditionIndex] = useState(null);
  const [newCondition, setNewCondition] = useState(defaultConditionState);
  const [contextMenu, setContextMenu] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState('file');
  const [createName, setCreateName] = useState('');
  const [createPath, setCreatePath] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templatesData, setTemplatesData] = useState(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedModules, setSelectedModules] = useState([]);
  const [templateZipFile, setTemplateZipFile] = useState(null);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [availableModules, setAvailableModules] = useState([]);
  const [selectedModuleToLoad, setSelectedModuleToLoad] = useState(null);
  const sidebarRef = useRef(null);

  const fileTree = useMemo(() => buildFileTree(files, virtualItems), [files, virtualItems]);
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
    } else if (currentFile && virtualItems[currentFile]) {
      setContent(virtualItems[currentFile].content || '');
    } else if (!currentFile) {
      setContent('');
    }
  }, [currentFile, files, virtualItems]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

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
    setVirtualItems({});
    setInstructions([]);
    const firstFile = Object.keys(newFiles)[0];
    if (firstFile) {
      setCurrentFile(firstFile);
    } else {
      setCurrentFile(null);
    }
    e.target.value = null; 
  };

  const handleTemplateZipUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setTemplateZipFile(file);
    e.target.value = null;
  };

  const loadTemplatesJson = async () => {
    if (!templateZipFile) return;

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(templateZipFile);
      
      console.log('ZIP structure:', Object.keys(contents.files));

      let templatesJsonFile = null;
      for (const [path, file] of Object.entries(contents.files)) {
        if (path.endsWith('templates.json') && !file.dir) {
          templatesJsonFile = file;
          console.log('Found templates.json at:', path);
          break;
        }
      }

      if (!templatesJsonFile) {
        console.error('Available files:', Object.keys(contents.files));
        alert('templates.json not found in ZIP. Check console for available files.');
        return;
      }

      const templatesContent = await templatesJsonFile.async('text');
      const templates = JSON.parse(templatesContent);
      setTemplatesData(templates);
      setShowTemplateModal(true);
      setShowMenu(false);
    } catch (error) {
      console.error('Error details:', error);
      alert('Error loading templates.json: ' + error.message);
    }
  };

  const handleEnvironmentSelect = (env) => {
    setSelectedEnvironment(env);
    setSelectedTemplate(null);
    setSelectedModules([]);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setSelectedModules([]);
  };

  const toggleModule = (moduleName) => {
    setSelectedModules(prev => {
      if (prev.includes(moduleName)) {
        return prev.filter(m => m !== moduleName);
      } else {
        return [...prev, moduleName];
      }
    });
  };

  const loadTemplateFiles = async () => {
    if (!templateZipFile || !selectedTemplate) return;

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(templateZipFile);
      
      const allPaths = Object.keys(contents.files).filter(p => !p.startsWith('__MACOSX'));
      console.log('All paths in ZIP:', allPaths.slice(0, 30));
      console.log('Looking for template:', selectedTemplate.url);

      let rootPrefix = '';
      const firstPath = allPaths[0];
      if (firstPath && firstPath.includes('/')) {
        const potentialRoot = firstPath.split('/')[0] + '/';
        if (allPaths.every(p => p.startsWith(potentialRoot) || p === potentialRoot.slice(0, -1))) {
          rootPrefix = potentialRoot;
          console.log('Detected root prefix:', rootPrefix);
        }
      }

      const templateName = selectedTemplate.url.split('/').pop();
      const templateParent = selectedTemplate.url.split('/').slice(-2, -1)[0];
      
      const templatePathOptions = [
        rootPrefix + selectedTemplate.url + '/',
        rootPrefix + templateParent + '/' + templateName + '/',
        rootPrefix + templateName + '/',
        selectedTemplate.url + '/',
        templateParent + '/' + templateName + '/',
        templateName + '/'
      ];

      console.log('Testing paths:', templatePathOptions);

      let foundPath = null;
      for (const testPath of templatePathOptions) {
        const matchingPaths = allPaths.filter(path => path.startsWith(testPath) && !contents.files[path].dir);
        console.log(`Path "${testPath}": ${matchingPaths.length} files found`);
        if (matchingPaths.length > 0) {
          foundPath = testPath;
          console.log('✓ Selected path:', testPath);
          break;
        }
      }

      if (!foundPath) {
        console.error('Could not find template files. Available directories:');
        const dirs = [...new Set(allPaths.map(p => p.split('/')[0]))];
        console.error(dirs);
        alert('Template files not found in ZIP. Check console for details.');
        return;
      }

      const newFiles = {};
      
      for (const [path, zipEntry] of Object.entries(contents.files)) {
        if (path.startsWith(foundPath) && !zipEntry.dir && !path.startsWith('__MACOSX')) {
          const relativePath = path.substring(foundPath.length);
          if (relativePath && !relativePath.startsWith('.modules/')) {
            try {
              const fileContent = await zipEntry.async('text');
              newFiles[relativePath] = fileContent;
              console.log('Loaded:', relativePath);
            } catch (e) {
              console.warn('Failed to load:', relativePath, e);
            }
          }
        }
      }

      console.log('Total files loaded:', Object.keys(newFiles).length);

      if (Object.keys(newFiles).length === 0) {
        alert('No files found in template directory');
        return;
      }

      const moduleInstructions = [];
      for (const moduleName of selectedModules) {
        const module = selectedTemplate.modules.find(m => m.name === moduleName);
        if (module && module.path) {
          const moduleFileName = module.path.split('/').pop();
          console.log('Looking for module:', moduleName, '(' + moduleFileName + ')');
          
          let moduleFile = null;
          for (const [path, file] of Object.entries(contents.files)) {
            if (path.endsWith(moduleFileName) && !file.dir && path.includes('.modules')) {
              moduleFile = file;
              console.log('Found module at:', path);
              break;
            }
          }

          if (moduleFile) {
            try {
              const moduleContent = await moduleFile.async('text');
              const moduleData = JSON.parse(moduleContent);
              if (moduleData.instructions && Array.isArray(moduleData.instructions)) {
                console.log(`✓ Loaded ${moduleData.instructions.length} instructions from ${moduleName}`);
                moduleInstructions.push(...moduleData.instructions);
              }
            } catch (e) {
              console.error('Error loading module', moduleName, ':', e);
            }
          } else {
            console.warn('Module file not found:', moduleFileName);
          }
        }
      }

      moduleInstructions.sort((a, b) => {
        const aPriority = a.priority || 999;
        const bPriority = b.priority || 999;
        return aPriority - bPriority;
      });

      console.log('✓ Total instructions loaded:', moduleInstructions.length);

      const modifiedFiles = applyInstructions(newFiles, moduleInstructions, selectedModules);

      setFiles(modifiedFiles);
      setVirtualItems({});
      setZipName(selectedTemplate.name);
      setInstructions([]);
      
      const firstFile = Object.keys(modifiedFiles)[0];
      if (firstFile) {
        setCurrentFile(firstFile);
      }

      setShowTemplateModal(false);
      setSelectedEnvironment(null);
      setSelectedTemplate(null);
      setSelectedModules([]);

      console.log('✓ Template loaded with modules applied successfully');
    } catch (error) {
      console.error('Error details:', error);
      alert('Error loading template: ' + error.message);
    }
  };

  const handleLoadModuleClick = async () => {
    if (!templateZipFile) {
      alert('Please load a templates ZIP file first');
      return;
    }

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(templateZipFile);
      
      const modules = [];
      
      for (const [path, file] of Object.entries(contents.files)) {
        if (path.includes('.modules/') && path.endsWith('.json') && !file.dir) {
          try {
            const moduleContent = await file.async('text');
            const moduleData = JSON.parse(moduleContent);
            
            if (moduleData.instructions && Array.isArray(moduleData.instructions)) {
              const moduleName = path.split('/').pop().replace('.json', '');
              modules.push({
                name: moduleData.name || moduleName,
                description: moduleData.description || 'No description',
                path: path,
                instructionsCount: moduleData.instructions.length
              });
            }
          } catch (e) {
            console.warn('Failed to parse module:', path, e);
          }
        }
      }

      if (modules.length === 0) {
        alert('No modules found in templates ZIP');
        return;
      }

      setAvailableModules(modules);
      setShowModuleModal(true);
      setShowMenu(false);
    } catch (error) {
      console.error('Error loading modules:', error);
      alert('Error loading modules: ' + error.message);
    }
  };

  const loadModuleInstructions = async () => {
    if (!selectedModuleToLoad || !templateZipFile) return;

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(templateZipFile);
      
      const moduleFile = contents.files[selectedModuleToLoad.path];
      if (!moduleFile) {
        alert('Module file not found');
        return;
      }

      const moduleContent = await moduleFile.async('text');
      const moduleData = JSON.parse(moduleContent);

      if (moduleData.instructions && Array.isArray(moduleData.instructions)) {
        setInstructions(prev => [...prev, ...moduleData.instructions]);
        console.log(`✓ Loaded ${moduleData.instructions.length} instructions from ${selectedModuleToLoad.name}`);
      }

      setShowModuleModal(false);
      setSelectedModuleToLoad(null);
    } catch (error) {
      console.error('Error loading module instructions:', error);
      alert('Error loading module instructions: ' + error.message);
    }
  };

  const handleClearInstructions = () => {
    if (instructions.length === 0) return;
    
    const confirmed = window.confirm(`Clear all ${instructions.length} instruction(s)?`);
    if (confirmed) {
      setInstructions([]);
      setShowMenu(false);
    }
  };
 
  const handleClear = () => {
    setFiles({});
    setVirtualItems({});
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
      setConditions([]);
      setLogicOperator(LogicOperators.AND);
      setShowBuilder(true);
    }
  };
 
  const handleOpenInstructionBuilder = () => {
    setNewInstruction(prev => ({
      ...defaultInstructionState,
      path: currentFile,
    }));
    setEditingIndex(null);
    setConditions([]);
    setLogicOperator(LogicOperators.AND);
    setShowBuilder(true);
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
    if (files[currentFile] !== undefined) {
      setFiles(prev => ({
        ...prev,
        [currentFile]: newContent
      }));
    } else if (virtualItems[currentFile]) {
      setVirtualItems(prev => ({
        ...prev,
        [currentFile]: {
          ...prev[currentFile],
          content: newContent
        }
      }));
    }
  };

  const handleCloseModal = () => {
    setShowBuilder(false);
    setEditingIndex(null);
    setNewInstruction(defaultInstructionState);
    setConditions([]);
    setLogicOperator(LogicOperators.AND);
  };

  const handleOpenConditionBuilder = () => {
    setNewCondition(defaultConditionState);
    setEditingConditionIndex(null);
    setShowConditionBuilder(true);
  };

  const handleCloseConditionBuilder = () => {
    setShowConditionBuilder(false);
    setEditingConditionIndex(null);
    setNewCondition(defaultConditionState);
  };

  const addCondition = () => {
    const condition = {
      type: newCondition.type,
      ...(newCondition.value && { value: newCondition.value }),
      ...(needsOperator(newCondition.type) && { operator: newCondition.operator }),
      ...(needsCount(newCondition.type) && { count: newCondition.count }),
      ...(needsTarget(newCondition.type) && newCondition.target && { target: newCondition.target })
    };

    if (editingConditionIndex !== null) {
      setConditions(prev => prev.map((item, i) => i === editingConditionIndex ? condition : item));
    } else {
      setConditions(prev => [...prev, condition]);
    }
   
    handleCloseConditionBuilder();
  };

  const handleEditCondition = (index) => {
    const cond = conditions[index];
    setNewCondition({
      ...defaultConditionState,
      ...cond,
    });
    setEditingConditionIndex(index);
    setShowConditionBuilder(true);
  };

  const removeCondition = (e, index) => {
    e.stopPropagation();
    setConditions(prev => prev.filter((_, i) => i !== index));
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
      ...(newInstruction.propValue && { propValue: newInstruction.propValue }),
      ...(conditions.length > 0 && {
        condition: {
          conditions: conditions,
          logic: logicOperator
        }
      })
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
   
    if (inst.condition) {
      setConditions(inst.condition.conditions || []);
      setLogicOperator(inst.condition.logic || LogicOperators.AND);
    } else {
      setConditions([]);
      setLogicOperator(LogicOperators.AND);
    }
   
    setEditingIndex(index);
    setShowBuilder(true);
  };

  const removeInstruction = (e, index) => {
    e.stopPropagation(); 
    setInstructions(prev => prev.filter((_, i) => i !== index));
  };

  const moveInstruction = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= instructions.length) return;
    
    setInstructions(prev => {
      const newInstructions = [...prev];
      const [movedItem] = newInstructions.splice(fromIndex, 1);
      newInstructions.splice(toIndex, 0, movedItem);
      return newInstructions;
    });
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      moveInstruction(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
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

  const handleContextMenu = (e, item, fullPath) => {
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
      fullPath
    });
  };

  const handleCreateItem = (type, basePath = '') => {
    setCreateType(type);
    setCreatePath(basePath);
    setCreateName('');
    setShowCreateModal(true);
    setContextMenu(null);
  };

  const handleConfirmCreate = () => {
    if (!createName.trim()) return;

    const fullPath = createPath ? `${createPath}/${createName}` : createName;
    
    if (createType === 'folder') {
      setVirtualItems(prev => ({
        ...prev,
        [fullPath]: { isFolder: true }
      }));
    } else {
      setVirtualItems(prev => ({
        ...prev,
        [fullPath]: { content: '' }
      }));
      setCurrentFile(fullPath);
    }

    setShowCreateModal(false);
    setCreateName('');
    setCreatePath('');
  };

  const handleDeleteVirtualItem = (path) => {
    setVirtualItems(prev => {
      const newItems = { ...prev };
      delete newItems[path];
      
      Object.keys(newItems).forEach(key => {
        if (key.startsWith(path + '/')) {
          delete newItems[key];
        }
      });
      
      return newItems;
    });
    
    if (currentFile === path || currentFile?.startsWith(path + '/')) {
      setCurrentFile(null);
    }
    
    setContextMenu(null);
  };

  const handlePreview = () => {
    const modifiedFiles = applyInstructions(files, instructions);
    setPreviewFiles(modifiedFiles);
    const firstFile = Object.keys(modifiedFiles).length > 0 ? Object.keys(modifiedFiles)[0] : null;
    setPreviewFile(firstFile);
    setShowPreviewModal(true);
    setShowMenu(false);
  };

  const needsValue = (type) => {
    return [
      ConditionTypes.MODULE_EXISTS,
      ConditionTypes.MODULE_NOT_EXISTS,
      ConditionTypes.PATTERN_EXISTS,
      ConditionTypes.PATTERN_NOT_EXISTS,
      ConditionTypes.PATTERN_COUNT,
      ConditionTypes.FILE_EXISTS,
      ConditionTypes.FILE_NOT_EXISTS
    ].includes(type);
  };

  const needsOperator = (type) => {
    return type === ConditionTypes.PATTERN_COUNT;
  };

  const needsCount = (type) => {
    return type === ConditionTypes.PATTERN_COUNT;
  };

  const needsTarget = (type) => {
    return [
      ConditionTypes.PATTERN_EXISTS,
      ConditionTypes.PATTERN_NOT_EXISTS,
      ConditionTypes.PATTERN_COUNT,
      ConditionTypes.FILE_EXISTS,
      ConditionTypes.FILE_NOT_EXISTS
    ].includes(type);
  };

  const getConditionLabel = (type) => {
    const labels = {
      [ConditionTypes.MODULE_EXISTS]: 'Module name',
      [ConditionTypes.MODULE_NOT_EXISTS]: 'Module name',
      [ConditionTypes.PATTERN_EXISTS]: 'Pattern to find',
      [ConditionTypes.PATTERN_NOT_EXISTS]: 'Pattern to find',
      [ConditionTypes.PATTERN_COUNT]: 'Pattern to count',
      [ConditionTypes.FILE_EXISTS]: 'File path',
      [ConditionTypes.FILE_NOT_EXISTS]: 'File path'
    };
    return labels[type] || 'Value';
  };

  const getConditionPlaceholder = (type) => {
    const placeholders = {
      [ConditionTypes.MODULE_EXISTS]: 'authentication',
      [ConditionTypes.MODULE_NOT_EXISTS]: 'theme',
      [ConditionTypes.PATTERN_EXISTS]: 'import React',
      [ConditionTypes.PATTERN_NOT_EXISTS]: 'ThemeProvider',
      [ConditionTypes.PATTERN_COUNT]: 'export default',
      [ConditionTypes.FILE_EXISTS]: 'src/config/theme.ts',
      [ConditionTypes.FILE_NOT_EXISTS]: 'src/old-file.ts'
    };
    return placeholders[type] || '';
  };

  const getConditionFields = () => {
    return (
      <>
        <S.Field>
          <S.Label>Condition Type</S.Label>
          <S.Select
            value={newCondition.type}
            onChange={(e) => setNewCondition(prev => ({ ...defaultConditionState, type: e.target.value }))}
          >
            {Object.entries(ConditionTypes).map(([key, value]) => (
              <option key={value} value={value}>
                {key.replace(/_/g, ' ')}
              </option>
            ))}
          </S.Select>
        </S.Field>

        {needsValue(newCondition.type) && (
          <S.Field>
            <S.Label>{getConditionLabel(newCondition.type)}</S.Label>
            <S.Input
              value={newCondition.value}
              onChange={(e) => setNewCondition(prev => ({ ...prev, value: e.target.value }))}
              placeholder={getConditionPlaceholder(newCondition.type)}
            />
          </S.Field>
        )}

        {needsTarget(newCondition.type) && (
          <S.Field>
            <S.Label>Target File (optional - defaults to instruction path)</S.Label>
            <S.Input
              value={newCondition.target}
              onChange={(e) => setNewCondition(prev => ({ ...prev, target: e.target.value }))}
              placeholder="src/App.tsx"
            />
          </S.Field>
        )}

        {needsOperator(newCondition.type) && (
          <S.Field>
            <S.Label>Operator</S.Label>
            <S.Select
              value={newCondition.operator}
              onChange={(e) => setNewCondition(prev => ({ ...prev, operator: e.target.value }))}
            >
              {Object.entries(ConditionOperators).map(([key, value]) => (
                <option key={value} value={value}>
                  {key.replace(/_/g, ' ')}
                </option>
              ))}
            </S.Select>
          </S.Field>
        )}

        {needsCount(newCondition.type) && (
          <S.Field>
            <S.Label>Count</S.Label>
            <S.Input
              type="number"
              value={newCondition.count}
              onChange={(e) => setNewCondition(prev => ({ ...prev, count: parseInt(e.target.value) || 0 }))}
              placeholder="0"
            />
          </S.Field>
        )}
      </>
    );
  };

  const getActionFields = () => {
    const action = newInstruction.action;
   
    switch (action) {
      case ModifierActions.CREATE_FILE:
        return (
          <S.Field>
            <S.Label>Content</S.Label>
            <S.InlineEditorWrapper>
              <CodeMirror
                value={newInstruction.content}
                onChange={(value) => setNewInstruction(prev => ({ ...prev, content: value }))}
                theme={githubDark}
                extensions={[javascript({ jsx: true })]}
                height="200px"
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                }}
              />
            </S.InlineEditorWrapper>
          </S.Field>
        );
     
      case ModifierActions.INSERT_IMPORT:
      case ModifierActions.APPEND_TO_FILE:
        return (
          <S.Field>
            <S.Label>Content</S.Label>
            <S.InlineEditorWrapper>
              <CodeMirror
                value={newInstruction.content}
                onChange={(value) => setNewInstruction(prev => ({ ...prev, content: value }))}
                theme={githubDark}
                extensions={[javascript({ jsx: true })]}
                height="80px"
                basicSetup={{
                  lineNumbers: false,
                }}
              />
            </S.InlineEditorWrapper>
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
              <S.InlineEditorWrapper>
                <CodeMirror
                  value={newInstruction.content}
                  onChange={(value) => setNewInstruction(prev => ({ ...prev, content: value }))}
                  theme={githubDark}
                  extensions={[javascript({ jsx: true })]}
                  height="150px"
                  basicSetup={{
                    lineNumbers: true,
                  }}
                />
              </S.InlineEditorWrapper>
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
              <S.InlineEditorWrapper>
                <CodeMirror
                  value={newInstruction.replacement}
                  onChange={(value) => setNewInstruction(prev => ({ ...prev, replacement: value }))}
                  theme={githubDark}
                  extensions={[javascript({ jsx: true })]}
                  height="100px"
                  basicSetup={{
                    lineNumbers: false,
                  }}
                />
              </S.InlineEditorWrapper>
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

  const formatConditionSummary = (condition) => {
    const parts = [condition.type.replace(/_/g, ' ')];
   
    if (condition.value) {
      parts.push(`"${condition.value}"`);
    }
   
    if (condition.operator && condition.count !== undefined) {
      parts.push(condition.operator.replace(/_/g, ' '));
      parts.push(condition.count);
    }
   
    if (condition.target) {
      parts.push(`in ${condition.target}`);
    }
   
    return parts.join(' ');
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
            <>
              <S.UploadLabel>
                <S.Icon style={{ marginRight: 8 }}>{ICONS.UPLOAD}</S.Icon>
                Import ZIP
                <S.FileInput type="file" accept=".zip" onChange={handleZipUpload} />
              </S.UploadLabel>
              <S.UploadLabel>
                <S.Icon style={{ marginRight: 8 }}>{ICONS.TEMPLATE}</S.Icon>
                Load Templates
                <S.FileInput type="file" accept=".zip" onChange={handleTemplateZipUpload} />
              </S.UploadLabel>
              {templateZipFile && (
                <S.TemplateButton onClick={loadTemplatesJson}>
                  <S.Icon style={{ marginRight: 8 }}>{ICONS.CHECK}</S.Icon>
                  Select Template
                </S.TemplateButton>
              )}
              <S.UploadLabel as="a" href="/docs" style={{ textDecoration: 'none' }}>
                <S.Icon style={{ marginRight: 8 }}>{ICONS.FILE}</S.Icon>
                Docs
              </S.UploadLabel>
            </>
          )}
        </S.HeaderControls>
      </S.Header>

      <S.Content style={{ gridTemplateColumns: `${sidebarWidth}px 1fr 350px` }}>
        <S.SidebarContainer>
          <S.Sidebar>
            <S.SidebarHeader>
              <S.SidebarTitle>Explorer</S.SidebarTitle>
              <S.SidebarActions>
                <S.SidebarActionButton 
                  onClick={() => handleCreateItem('file')}
                  title="New File"
                >
                  <S.Icon>{ICONS.NOTE_ADD}</S.Icon>
                </S.SidebarActionButton>
                <S.SidebarActionButton 
                  onClick={() => handleCreateItem('folder')}
                  title="New Folder"
                >
                  <S.Icon>{ICONS.CREATE_FOLDER}</S.Icon>
                </S.SidebarActionButton>
              </S.SidebarActions>
            </S.SidebarHeader>
            <S.FileList>
              {fileTree.map(item => (
                <FileTreeNode 
                  key={item.path || item.name} 
                  item={item} 
                  level={0} 
                  onSelect={setCurrentFile} 
                  currentFile={currentFile}
                  onContextMenu={handleContextMenu}
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
              disabled={!currentFile && !Object.keys(files).length && !Object.keys(virtualItems).length}
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
                      <S.MenuItem onClick={handleLoadModuleClick} disabled={!templateZipFile}>
                        <S.Icon>{ICONS.MODULE}</S.Icon>
                        Load Module
                      </S.MenuItem>
                      <S.MenuSeparator />
                      <S.MenuItem onClick={handleClearInstructions} disabled={instructions.length === 0}>
                        <S.Icon>{ICONS.CLEAR}</S.Icon>
                        Clear Instructions
                      </S.MenuItem>
                    </S.MenuDropdown>
                  </>
                )}
              </S.MenuContainer>
            </S.PanelActions>
          </S.PanelHeader>

          <S.InstructionList>
            {instructions.map((inst, index) => (
              <S.InstructionCard 
                key={index} 
                onClick={() => handleEditInstruction(index)}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                isDragging={draggedIndex === index}
                isDragOver={dragOverIndex === index}
              >
                <S.InstructionHeader>
                  <S.DragHandle>
                    <S.Icon>{ICONS.DRAG}</S.Icon>
                  </S.DragHandle>
                  <S.ActionBadge>{inst.action}</S.ActionBadge>
                  <S.InstructionControls>
                    <S.MoveButton 
                      onClick={(e) => { e.stopPropagation(); moveInstruction(index, index - 1); }}
                      disabled={index === 0}
                      title="Move Up"
                    >
                      <S.Icon>{ICONS.ARROW_UP}</S.Icon>
                    </S.MoveButton>
                    <S.MoveButton 
                      onClick={(e) => { e.stopPropagation(); moveInstruction(index, index + 1); }}
                      disabled={index === instructions.length - 1}
                      title="Move Down"
                    >
                      <S.Icon>{ICONS.ARROW_DOWN}</S.Icon>
                    </S.MoveButton>
                    <S.RemoveButton onClick={(e) => removeInstruction(e, index)}>
                      <S.Icon>{ICONS.TRASH}</S.Icon>
                    </S.RemoveButton>
                  </S.InstructionControls>
                </S.InstructionHeader>
                <S.InstructionPath>{inst.path}</S.InstructionPath>
                {inst.pattern && <S.InstructionDetail>Pattern: {inst.pattern}</S.InstructionDetail>}
                {inst.content && <S.InstructionDetail>Content: {inst.content.substring(0, 50)}...</S.InstructionDetail>}
                {inst.condition && (
                  <S.ConditionBadge>
                    <S.Icon style={{ fontSize: 14 }}>{ICONS.CONDITION}</S.Icon>
                    {inst.condition.conditions.length} condition{inst.condition.conditions.length !== 1 ? 's' : ''} ({inst.condition.logic || 'AND'})
                  </S.ConditionBadge>
                )}
              </S.InstructionCard>
            ))}
          </S.InstructionList>
        </S.Panel>
      </S.Content>

      {contextMenu && (
        <S.ContextMenu style={{ top: contextMenu.y, left: contextMenu.x }}>
          {contextMenu.item.type === 'folder' && (
            <>
              <S.ContextMenuItem onClick={() => handleCreateItem('file', contextMenu.fullPath)}>
                <S.Icon>{ICONS.NOTE_ADD}</S.Icon>
                New File
              </S.ContextMenuItem>
              <S.ContextMenuItem onClick={() => handleCreateItem('folder', contextMenu.fullPath)}>
                <S.Icon>{ICONS.CREATE_FOLDER}</S.Icon>
                New Folder
              </S.ContextMenuItem>
              {contextMenu.item.isVirtual && (
                <>
                  <S.ContextMenuSeparator />
                  <S.ContextMenuItem 
                    onClick={() => handleDeleteVirtualItem(contextMenu.fullPath)}
                    danger
                  >
                    <S.Icon>{ICONS.TRASH}</S.Icon>
                    Delete
                  </S.ContextMenuItem>
                </>
              )}
            </>
          )}
          {contextMenu.item.type === 'file' && contextMenu.item.isVirtual && (
            <S.ContextMenuItem 
              onClick={() => handleDeleteVirtualItem(contextMenu.fullPath)}
              danger
            >
              <S.Icon>{ICONS.TRASH}</S.Icon>
              Delete
            </S.ContextMenuItem>
          )}
        </S.ContextMenu>
      )}

      {showTemplateModal && templatesData && (
        <S.Modal onClick={() => setShowTemplateModal(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>Select Template</S.ModalTitle>
              <S.CloseButton onClick={() => setShowTemplateModal(false)}>
                <S.Icon style={{ fontSize: 20 }}>{ICONS.CLOSE}</S.Icon>
              </S.CloseButton>
            </S.ModalHeader>
            <S.Form>
              <S.Field>
                <S.Label>Environment</S.Label>
                <S.TemplateGrid>
                  {Object.keys(templatesData).map(env => (
                    <S.TemplateCard 
                      key={env} 
                      selected={selectedEnvironment === env}
                      onClick={() => handleEnvironmentSelect(env)}
                    >
                      <S.TemplateCardTitle>{env.toUpperCase()}</S.TemplateCardTitle>
                      <S.TemplateCardSubtitle>{templatesData[env].length} templates</S.TemplateCardSubtitle>
                    </S.TemplateCard>
                  ))}
                </S.TemplateGrid>
              </S.Field>

              {selectedEnvironment && (
                <S.Field>
                  <S.Label>Template</S.Label>
                  <S.TemplateGrid>
                    {templatesData[selectedEnvironment].map(template => (
                      <S.TemplateCard 
                        key={template.name}
                        selected={selectedTemplate?.name === template.name}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <S.TemplateCardTitle>{template.name}</S.TemplateCardTitle>
                        <S.TemplateCardDescription>{template.description}</S.TemplateCardDescription>
                      </S.TemplateCard>
                    ))}
                  </S.TemplateGrid>
                </S.Field>
              )}

              {selectedTemplate && selectedTemplate.modules && selectedTemplate.modules.length > 0 && (
                <S.Field>
                  <S.Label>Modules (optional)</S.Label>
                  <S.ModulesList>
                    {selectedTemplate.modules.map(module => (
                      <S.ModuleItem 
                        key={module.name}
                        selected={selectedModules.includes(module.name)}
                        onClick={() => toggleModule(module.name)}
                      >
                        <S.ModuleCheckbox selected={selectedModules.includes(module.name)}>
                          {selectedModules.includes(module.name) && <S.Icon>{ICONS.CHECK}</S.Icon>}
                        </S.ModuleCheckbox>
                        <S.ModuleContent>
                          <S.ModuleName>{module.name}</S.ModuleName>
                          <S.ModuleDescription>{module.description}</S.ModuleDescription>
                        </S.ModuleContent>
                      </S.ModuleItem>
                    ))}
                  </S.ModulesList>
                </S.Field>
              )}
            </S.Form>
            <S.ButtonGroup>
              <S.CancelButton onClick={() => setShowTemplateModal(false)}>
                Cancel
              </S.CancelButton>
              <S.AddButton onClick={loadTemplateFiles} disabled={!selectedTemplate}>
                Load Template
              </S.AddButton>
            </S.ButtonGroup>
          </S.ModalContent>
        </S.Modal>
      )}

      {showModuleModal && (
        <S.Modal onClick={() => setShowModuleModal(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>Load Module Instructions</S.ModalTitle>
              <S.CloseButton onClick={() => setShowModuleModal(false)}>
                <S.Icon style={{ fontSize: 20 }}>{ICONS.CLOSE}</S.Icon>
              </S.CloseButton>
            </S.ModalHeader>
            <S.Form>
              <S.Field>
                <S.Label>Select Module</S.Label>
                <S.ModulesList>
                  {availableModules.map(module => (
                    <S.ModuleItem 
                      key={module.path}
                      selected={selectedModuleToLoad?.path === module.path}
                      onClick={() => setSelectedModuleToLoad(module)}
                    >
                      <S.ModuleCheckbox selected={selectedModuleToLoad?.path === module.path}>
                        {selectedModuleToLoad?.path === module.path && <S.Icon>{ICONS.CHECK}</S.Icon>}
                      </S.ModuleCheckbox>
                      <S.ModuleContent>
                        <S.ModuleName>{module.name}</S.ModuleName>
                        <S.ModuleDescription>
                          {module.description} • {module.instructionsCount} instruction{module.instructionsCount !== 1 ? 's' : ''}
                        </S.ModuleDescription>
                      </S.ModuleContent>
                    </S.ModuleItem>
                  ))}
                </S.ModulesList>
              </S.Field>
            </S.Form>
            <S.ButtonGroup>
              <S.CancelButton onClick={() => setShowModuleModal(false)}>
                Cancel
              </S.CancelButton>
              <S.AddButton onClick={loadModuleInstructions} disabled={!selectedModuleToLoad}>
                Load Instructions
              </S.AddButton>
            </S.ButtonGroup>
          </S.ModalContent>
        </S.Modal>
      )}

      {showCreateModal && (
        <S.Modal onClick={() => setShowCreateModal(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>New {createType === 'folder' ? 'Folder' : 'File'}</S.ModalTitle>
              <S.CloseButton onClick={() => setShowCreateModal(false)}>
                <S.Icon style={{ fontSize: 20 }}>{ICONS.CLOSE}</S.Icon>
              </S.CloseButton>
            </S.ModalHeader>
            <S.Form>
              <S.Field>
                <S.Label>Name</S.Label>
                <S.Input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder={createType === 'folder' ? 'components' : 'component.jsx'}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmCreate();
                  }}
                />
              </S.Field>
              {createPath && (
                <S.Note>
                  Will be created in: {createPath}/
                </S.Note>
              )}
            </S.Form>
            <S.ButtonGroup>
              <S.CancelButton onClick={() => setShowCreateModal(false)}>
                Cancel
              </S.CancelButton>
              <S.AddButton onClick={handleConfirmCreate} disabled={!createName.trim()}>
                Create
              </S.AddButton>
            </S.ButtonGroup>
          </S.ModalContent>
        </S.Modal>
      )}

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
                />
              </S.Field>

              {getActionFields()}

              <S.ConditionsSection>
                <S.ConditionsSectionHeader>
                  <S.Label>Conditions (optional)</S.Label>
                  <S.AddConditionButton onClick={handleOpenConditionBuilder}>
                    <S.Icon>{ICONS.PLUS}</S.Icon>
                    Add Condition
                  </S.AddConditionButton>
                </S.ConditionsSectionHeader>

                {conditions.length > 0 && (
                  <>
                    <S.Field>
                      <S.Label>Logic Operator</S.Label>
                      <S.Select
                        value={logicOperator}
                        onChange={(e) => setLogicOperator(e.target.value)}
                      >
                        <option value={LogicOperators.AND}>AND (all must be true)</option>
                        <option value={LogicOperators.OR}>OR (at least one true)</option>
                      </S.Select>
                    </S.Field>

                    <S.ConditionsList>
                      {conditions.map((cond, index) => (
                        <S.ConditionItem key={index} onClick={() => handleEditCondition(index)}>
                          <S.ConditionContent>
                            {formatConditionSummary(cond)}
                          </S.ConditionContent>
                          <S.RemoveButton onClick={(e) => removeCondition(e, index)}>
                            <S.Icon>{ICONS.TRASH}</S.Icon>
                          </S.RemoveButton>
                        </S.ConditionItem>
                      ))}
                    </S.ConditionsList>
                  </>
                )}
              </S.ConditionsSection>
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

      {showConditionBuilder && (
        <S.Modal onClick={handleCloseConditionBuilder}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>{editingConditionIndex !== null ? 'Edit Condition' : 'New Condition'}</S.ModalTitle>
              <S.CloseButton onClick={handleCloseConditionBuilder}>
                <S.Icon style={{ fontSize: 20 }}>{ICONS.CLOSE}</S.Icon>
              </S.CloseButton>
            </S.ModalHeader>

            <S.Form>
              {getConditionFields()}
            </S.Form>
           
            <S.ButtonGroup>
              <S.CancelButton onClick={handleCloseConditionBuilder}>
                Cancel
              </S.CancelButton>
              <S.AddButton onClick={addCondition}>
                {editingConditionIndex !== null ? 'Update Condition' : 'Add Condition'}
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
                        onContextMenu={() => {}}
                      />
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