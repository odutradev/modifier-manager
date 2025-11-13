import styled from 'styled-components';

export const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0d1117;
  color: #c9d1d9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

export const Icon = styled.span.attrs({ className: 'material-icons' })`
  font-size: 16px;
  line-height: 1;
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
  user-select: none;
`;

export const Header = styled.header`
  height: 60px;
  background: #161b22;
  border-bottom: 1px solid #30363d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
`;

export const Title = styled.h1`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #58a6ff;
`;

export const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const ZipName = styled.span`
  font-size: 14px;
  color: #8b949e;
  font-family: 'Courier New', monospace;
`;

export const ClearButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #c9d1d9;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #b52a2a;
    color: white;
    border-color: #da3633;
  }
`;

export const UploadLabel = styled.label`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: #238636;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2ea043;
  }
`;

export const FileInput = styled.input`
  display: none;
`;

export const Content = styled.main`
  flex: 1;
  display: grid;
  overflow: hidden;
`;

export const SidebarContainer = styled.div`
  display: flex;
  overflow: hidden;
`;

export const Sidebar = styled.aside`
  flex: 1;
  background: #0d1117;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #30363d;
    border-radius: 4px;
  }
`;

export const Resizer = styled.div`
  width: 5px;
  background: transparent;
  cursor: col-resize;
  transition: background 0.2s;
  border-right: 1px solid #30363d;

  &:hover {
    background: #58a6ff;
  }
`;

export const SidebarTitle = styled.h2`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #8b949e;
  margin: 0;
  padding: 10px 16px;
`;

export const FileList = styled.div`
  display: flex;
  flex-direction: column;
`;

export const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 16px;
  padding-left: ${props => (props.level * 12 + 16) + 'px'};
  cursor: pointer;
  font-size: 13px;
  color: ${props => props.active ? '#c9d1d9' : '#8b949e'};
  background: ${props => props.active ? '#30363d' : 'transparent'};
  transition: all 0.1s;
  white-space: nowrap;
  user-select: none;

  &:hover {
    color: #c9d1d9;
    background: ${props => props.active ? '#30363d' : '#161b22'};
  }
`;

export const FolderItem = styled(FileItem)`
  color: #c9d1d9;
  font-weight: 600;
`;

export const FileIcon = styled(Icon)`
  font-size: 16px;
  color: #8b949e;
`;

export const ChevronIcon = styled(Icon)`
  font-size: 16px;
  color: #8b949e;
  margin-right: 2px;
`;

export const Editor = styled.div`
  display: flex;
  flex-direction: column;
  background: #0d1117;
  overflow: hidden;
`;

export const EditorHeader = styled.div`
  height: 40px;
  background: #161b22;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
`;

export const FilePath = styled.span`
  font-size: 13px;
  color: #c9d1d9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #238636;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: #2ea043;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #21262d;
    border: 1px solid #30363d;
  }
`;

export const CodeEditorWrapper = styled.div`
  flex: 1;
  overflow: auto;
  position: relative;

  .cm-editor {
    height: 100%;
    font-size: 14px;
    font-family: 'Consolas', 'Monaco', monospace;
    background-color: #0d1117;
  }

  .cm-gutters {
    background-color: #0d1117;
    border-right: 1px solid #30363d;
    color: #484f58;
  }

  .cm-activeLineGutter {
    background-color: #161b22;
  }

  .cm-scroller {
    &::-webkit-scrollbar {
      width: 14px;
      height: 14px;
    }

    &::-webkit-scrollbar-corner {
      background: #161b22;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #30363d;
      border: 3px solid transparent;
      background-clip: content-box;
    }

    &::-webkit-scrollbar-thumb:hover {
      background-color: #484f58;
    }
  }
`;

export const InlineEditorWrapper = styled.div`
  border: 1px solid #30363d;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.2s;

  &:focus-within {
    border-color: #58a6ff;
  }

  .cm-editor {
    font-size: 13px;
    font-family: 'Consolas', 'Monaco', monospace;
    background-color: #0d1117;
  }

  .cm-gutters {
    background-color: #0d1117;
    border-right: 1px solid #30363d;
    color: #484f58;
  }

  .cm-scroller {
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #30363d;
      border-radius: 4px;
    }
  }
`;

export const Panel = styled.aside`
  background: #0d1117;
  border-left: 1px solid #30363d;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const PanelHeader = styled.div`
  height: 40px;
  background: #161b22;
  border-bottom: 1px solid #30363d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
`;

export const PanelTitle = styled.h2`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #8b949e;
  margin: 0;
`;

export const PanelActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const MenuContainer = styled.div`
  position: relative;
`;

export const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: ${props => props.active ? '#30363d' : 'transparent'};
  border: none;
  border-radius: 6px;
  color: #c9d1d9;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #30363d;
  }
`;

export const MenuBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
`;

export const MenuDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 6px;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  box-shadow: 0 8px 24px #010409;
  z-index: 100;
  min-width: 180px;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
`;

export const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px 16px;
  background: transparent;
  border: 0;
  color: #c9d1d9;
  font-size: 13px;
  font-family: inherit;
  line-height: 20px;
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
  appearance: none;
  margin: 0;
  box-sizing: border-box;

  &:hover:not(:disabled) {
    background: #1f6feb;
    color: white;
    text-decoration: none;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${Icon} {
    font-size: 18px;
    opacity: 0.7;
  }
`;

export const MenuSeparator = styled.div`
  height: 1px;
  background: #30363d;
  margin: 8px 0;
  width: 100%;
`;

export const InstructionList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #30363d;
    border-radius: 4px;
  }
`;

export const InstructionCard = styled.div`
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: #8b949e;
  }
`;

export const InstructionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export const ActionBadge = styled.span`
  padding: 4px 8px;
  background: #388bfd26;
  border: 1px solid #388bfd;
  border-radius: 4px;
  color: #58a6ff;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const ConditionBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #6e409826;
  border: 1px solid #8957e5;
  border-radius: 4px;
  color: #bc8cff;
  font-size: 11px;
  font-weight: 500;
  margin-top: 8px;
`;

export const RemoveButton = styled.button`
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  color: #8b949e;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: #da3633;
    color: white;
  }
`;

export const InstructionPath = styled.div`
  font-size: 11px;
  color: #8b949e;
  font-family: 'Courier New', monospace;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const InstructionDetail = styled.div`
  font-size: 12px;
  color: #c9d1d9;
  margin-top: 4px;
  padding: 4px 8px;
  background: #0d1117;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

export const ModalContent = styled.div`
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const PreviewModalContent = styled(ModalContent)`
  width: 90vw;
  max-width: 1400px;
  height: 90vh;
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #30363d;
  flex-shrink: 0;
`;

export const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #c9d1d9;
`;

export const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  color: #8b949e;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #30363d;
    color: #c9d1d9;
  }
`;

export const Form = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #30363d;
    border-radius: 4px;
  }
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #c9d1d9;
`;

export const Input = styled.input`
  padding: 8px 12px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #c9d1d9;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #58a6ff;
  }

  &:disabled {
    opacity: 0.5;
    background: #21262d;
    cursor: not-allowed;
  }
`;

export const Select = styled.select`
  padding: 8px 12px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #c9d1d9;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #58a6ff;
  }

  option {
    background: #161b22;
  }
`;

export const Textarea = styled.textarea`
  padding: 8px 12px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #c9d1d9;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  resize: vertical;
  min-height: 80px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #58a6ff;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
  border-top: 1px solid #30363d;
  padding: 16px 24px 20px;
  flex-shrink: 0;
`;

export const CancelButton = styled.button`
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #c9d1d9;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #30363d;
  }
`;

export const AddButton = styled.button`
  padding: 8px 16px;
  background: #238636;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2ea043;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #238636;
  }
`;

export const JsonViewerWrapper = styled.div`
  height: 400px;
  overflow: auto;
  border: 1px solid #30363d;
  border-radius: 6px;
  margin: 0 24px 16px;

  .cm-editor {
    height: 100%;
  }
`;

export const DownloadButton = styled(AddButton)``;

export const CopyButton = styled(AddButton)`
  background: #1f6feb;
  &:hover {
    background: #388bfd;
  }
`;

export const PreviewModalBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const PreviewLayout = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 250px 1fr;
  overflow: hidden;
`;

export const PreviewEditor = styled.div`
  display: flex;
  flex-direction: column;
  overflow: auto;
  position: relative;
  min-height: 0;

  .cm-editor {
    height: 100% !important;
  }

  .cm-scroller {
    &::-webkit-scrollbar {
      width: 12px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #30363d;
      border-radius: 6px;
    }
  }
`;

export const ConditionsSection = styled.div`
  margin-top: 8px;
  padding: 16px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
`;

export const ConditionsSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const AddConditionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #8957e526;
  border: 1px solid #8957e5;
  border-radius: 4px;
  color: #bc8cff;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #8957e540;
  }
`;

export const ConditionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
`;

export const ConditionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #8957e5;
    background: #1c1f26;
  }
`;

export const ConditionContent = styled.div`
  font-size: 12px;
  color: #c9d1d9;
  font-family: 'Courier New', monospace;
`;