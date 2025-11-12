import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as S from './styles';

const ICONS = {
  BACK: 'arrow_back',
  CODE: 'code',
  RULE: 'rule',
  LIGHTBULB: 'lightbulb',
  MENU: 'menu',
  CLOSE: 'close'
};

const Docs = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('instructions');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
      setMobileMenuOpen(false);
    }
  };

  return (
    <S.Container>
      <S.Header>
        <S.BackButton onClick={() => navigate('/')}>
          <S.Icon>{ICONS.BACK}</S.Icon>
          Back to Editor
        </S.BackButton>
        <S.Title>Documentation</S.Title>
        <S.MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <S.Icon>{mobileMenuOpen ? ICONS.CLOSE : ICONS.MENU}</S.Icon>
        </S.MobileMenuButton>
      </S.Header>

      <S.Content>
        <S.Sidebar open={mobileMenuOpen}>
          <S.SidebarTitle>Contents</S.SidebarTitle>
          <S.NavList>
            <S.NavItem active={activeSection === 'instructions'} onClick={() => scrollToSection('instructions')}>
              <S.Icon>{ICONS.CODE}</S.Icon>
              Instructions
            </S.NavItem>
            <S.NavItem active={activeSection === 'conditions'} onClick={() => scrollToSection('conditions')}>
              <S.Icon>{ICONS.RULE}</S.Icon>
              Conditions
            </S.NavItem>
            <S.NavItem active={activeSection === 'examples'} onClick={() => scrollToSection('examples')}>
              <S.Icon>{ICONS.LIGHTBULB}</S.Icon>
              Examples
            </S.NavItem>
          </S.NavList>
        </S.Sidebar>

        <S.Main>
          <S.Section id="instructions">
            <S.SectionTitle>
              <S.Icon>{ICONS.CODE}</S.Icon>
              Instructions
            </S.SectionTitle>
            <S.Description>
              Instructions define what actions should be performed on your code files. Each instruction specifies a target file and an action to execute.
            </S.Description>

            <S.Card>
              <S.CardTitle>CREATE_FILE</S.CardTitle>
              <S.CardDescription>Creates a new file with specified content</S.CardDescription>
              <S.CodeBlock>
{`{
  "path": "src/components/NewComponent.tsx",
  "action": "CREATE_FILE",
  "content": "import React from 'react';\\n\\nexport const NewComponent = () => {\\n  return <div>Hello</div>;\\n};"
}`}
              </S.CodeBlock>
              <S.ParamsTitle>Required Parameters:</S.ParamsTitle>
              <S.ParamsList>
                <S.ParamItem><S.ParamName>path</S.ParamName> - File path to create</S.ParamItem>
                <S.ParamItem><S.ParamName>content</S.ParamName> - File content</S.ParamItem>
              </S.ParamsList>
            </S.Card>

            <S.Card>
              <S.CardTitle>DELETE_FILE</S.CardTitle>
              <S.CardDescription>Deletes an existing file</S.CardDescription>
              <S.CodeBlock>
{`{
  "path": "src/old-component.tsx",
  "action": "DELETE_FILE"
}`}
              </S.CodeBlock>
              <S.ParamsTitle>Required Parameters:</S.ParamsTitle>
              <S.ParamsList>
                <S.ParamItem><S.ParamName>path</S.ParamName> - File path to delete</S.ParamItem>
              </S.ParamsList>
            </S.Card>

            <S.Card>
              <S.CardTitle>INSERT_IMPORT</S.CardTitle>
              <S.CardDescription>Inserts an import statement at the top of the file</S.CardDescription>
              <S.CodeBlock>
{`{
  "path": "src/App.tsx",
  "action": "INSERT_IMPORT",
  "content": "import { ThemeProvider } from './theme/ThemeProvider';"
}`}
              </S.CodeBlock>
              <S.ParamsTitle>Required Parameters:</S.ParamsTitle>
              <S.ParamsList>
                <S.ParamItem><S.ParamName>path</S.ParamName> - Target file path</S.ParamItem>
                <S.ParamItem><S.ParamName>content</S.ParamName> - Import statement</S.ParamItem>
              </S.ParamsList>
            </S.Card>

            <S.Card>
              <S.CardTitle>INSERT_AFTER</S.CardTitle>
              <S.CardDescription>Inserts content after a matching pattern</S.CardDescription>
              <S.CodeBlock>
{`{
  "path": "src/App.tsx",
  "action": "INSERT_AFTER",
  "pattern": "const App = () => {",
  "content": "  const [theme, setTheme] = useState('dark');"
}`}
              </S.CodeBlock>
              <S.ParamsTitle>Required Parameters:</S.ParamsTitle>
              <S.ParamsList>
                <S.ParamItem><S.ParamName>path</S.ParamName> - Target file path</S.ParamItem>
                <S.ParamItem><S.ParamName>pattern</S.ParamName> - Text to find</S.ParamItem>
                <S.ParamItem><S.ParamName>content</S.ParamName> - Content to insert</S.ParamItem>
              </S.ParamsList>
            </S.Card>

            <S.Card>
              <S.CardTitle>INSERT_BEFORE</S.CardTitle>
              <S.CardDescription>Inserts content before a matching pattern</S.CardDescription>
              <S.CodeBlock>
{`{
  "path": "src/main.tsx",
  "action": "INSERT_BEFORE",
  "pattern": "ReactDOM.render(",
  "content": "initializeApp();"
}`}
              </S.CodeBlock>
              <S.ParamsTitle>Required Parameters:</S.ParamsTitle>
              <S.ParamsList>
                <S.ParamItem><S.ParamName>path</S.ParamName> - Target file path</S.ParamItem>
                <S.ParamItem><S.ParamName>pattern</S.ParamName> - Text to find</S.ParamItem>
                <S.ParamItem><S.ParamName>content</S.ParamName> - Content to insert</S.ParamItem>
              </S.ParamsList>
            </S.Card>

            <S.Card>
              <S.CardTitle>REPLACE_CONTENT</S.CardTitle>
              <S.CardDescription>Replaces all occurrences of a pattern with new content</S.CardDescription>
              <S.CodeBlock>
{`{
  "path": "src/config.ts",
  "action": "REPLACE_CONTENT",
  "pattern": "API_URL = 'localhost'",
  "replacement": "API_URL = 'production.com'"
}`}
              </S.CodeBlock>
              <S.ParamsTitle>Required Parameters:</S.ParamsTitle>
              <S.ParamsList>
                <S.ParamItem><S.ParamName>path</S.ParamName> - Target file path</S.ParamItem>
                <S.ParamItem><S.ParamName>pattern</S.ParamName> - Text to find</S.ParamItem>
                <S.ParamItem><S.ParamName>replacement</S.ParamName> - Replacement text</S.ParamItem>
              </S.ParamsList>
            </S.Card>

            <S.Card>
              <S.CardTitle>APPEND_TO_FILE</S.CardTitle>
              <S.CardDescription>Appends content to the end of the file</S.CardDescription>
              <S.CodeBlock>
{`{
  "path": "src/routes.ts",
  "action": "APPEND_TO_FILE",
  "content": "\\nexport { authRoutes } from './auth-routes';"
}`}
              </S.CodeBlock>
              <S.ParamsTitle>Required Parameters:</S.ParamsTitle>
              <S.ParamsList>
                <S.ParamItem><S.ParamName>path</S.ParamName> - Target file path</S.ParamItem>
                <S.ParamItem><S.ParamName>content</S.ParamName> - Content to append</S.ParamItem>
              </S.ParamsList>
            </S.Card>

            <S.Card>
              <S.CardTitle>INSERT_PROP</S.CardTitle>
              <S.CardDescription>Inserts a prop into React component instances</S.CardDescription>
              <S.CodeBlock>
{`{
  "path": "src/App.tsx",
  "action": "INSERT_PROP",
  "componentName": "Button",
  "propName": "variant",
  "propValue": "\\"primary\\""
}`}
              </S.CodeBlock>
              <S.ParamsTitle>Required Parameters:</S.ParamsTitle>
              <S.ParamsList>
                <S.ParamItem><S.ParamName>path</S.ParamName> - Target file path</S.ParamItem>
                <S.ParamItem><S.ParamName>componentName</S.ParamName> - Component name</S.ParamItem>
                <S.ParamItem><S.ParamName>propName</S.ParamName> - Prop name</S.ParamItem>
                <S.ParamItem><S.ParamName>propValue</S.ParamName> - Prop value (optional)</S.ParamItem>
              </S.ParamsList>
            </S.Card>
          </S.Section>

          <S.Divider />

          <S.Section id="conditions">
            <S.SectionTitle>
              <S.Icon>{ICONS.RULE}</S.Icon>
              Conditions
            </S.SectionTitle>
            <S.Description>
              Conditions allow you to execute instructions only when specific criteria are met. You can combine multiple conditions using AND/OR logic operators.
            </S.Description>

            <S.SubSection>
              <S.SubTitle>Condition Structure</S.SubTitle>
              <S.CodeBlock>
{`{
  "path": "src/App.tsx",
  "action": "INSERT_IMPORT",
  "content": "import { Auth } from './auth';",
  "condition": {
    "logic": "AND",
    "conditions": [
      {
        "type": "MODULE_EXISTS",
        "value": "authentication"
      },
      {
        "type": "FILE_NOT_EXISTS",
        "target": "src/auth/index.ts"
      }
    ]
  }
}`}
              </S.CodeBlock>
            </S.SubSection>

            <S.SubSection>
              <S.SubTitle>Logic Operators</S.SubTitle>
              <S.ParamsList>
                <S.ParamItem><S.ParamName>AND</S.ParamName> - All conditions must be true</S.ParamItem>
                <S.ParamItem><S.ParamName>OR</S.ParamName> - At least one condition must be true</S.ParamItem>
              </S.ParamsList>
            </S.SubSection>

            <S.SubSection>
              <S.SubTitle>Condition Types</S.SubTitle>

              <S.Card>
                <S.CardTitle>MODULE_EXISTS</S.CardTitle>
                <S.CardDescription>Checks if a module is selected in the installation</S.CardDescription>
                <S.CodeBlock>
{`{
  "type": "MODULE_EXISTS",
  "value": "authentication"
}`}
                </S.CodeBlock>
              </S.Card>

              <S.Card>
                <S.CardTitle>MODULE_NOT_EXISTS</S.CardTitle>
                <S.CardDescription>Checks if a module is NOT selected</S.CardDescription>
                <S.CodeBlock>
{`{
  "type": "MODULE_NOT_EXISTS",
  "value": "theme"
}`}
                </S.CodeBlock>
              </S.Card>

              <S.Card>
                <S.CardTitle>PATTERN_EXISTS</S.CardTitle>
                <S.CardDescription>Checks if a pattern exists in the target file</S.CardDescription>
                <S.CodeBlock>
{`{
  "type": "PATTERN_EXISTS",
  "value": "import React",
  "target": "src/App.tsx"
}`}
                </S.CodeBlock>
                <S.Note>If target is not specified, uses the instruction's path</S.Note>
              </S.Card>

              <S.Card>
                <S.CardTitle>PATTERN_NOT_EXISTS</S.CardTitle>
                <S.CardDescription>Checks if a pattern does NOT exist</S.CardDescription>
                <S.CodeBlock>
{`{
  "type": "PATTERN_NOT_EXISTS",
  "value": "ThemeProvider"
}`}
                </S.CodeBlock>
              </S.Card>

              <S.Card>
                <S.CardTitle>PATTERN_COUNT</S.CardTitle>
                <S.CardDescription>Checks the number of pattern occurrences</S.CardDescription>
                <S.CodeBlock>
{`{
  "type": "PATTERN_COUNT",
  "value": "export default",
  "operator": "LESS_THAN",
  "count": 2
}`}
                </S.CodeBlock>
                <S.ParamsTitle>Operators:</S.ParamsTitle>
                <S.ParamsList>
                  <S.ParamItem><S.ParamName>EQUALS</S.ParamName> - Exactly equals count</S.ParamItem>
                  <S.ParamItem><S.ParamName>NOT_EQUALS</S.ParamName> - Does not equal count</S.ParamItem>
                  <S.ParamItem><S.ParamName>GREATER_THAN</S.ParamName> - Greater than count</S.ParamItem>
                  <S.ParamItem><S.ParamName>LESS_THAN</S.ParamName> - Less than count</S.ParamItem>
                  <S.ParamItem><S.ParamName>GREATER_OR_EQUAL</S.ParamName> - Greater than or equal</S.ParamItem>
                  <S.ParamItem><S.ParamName>LESS_OR_EQUAL</S.ParamName> - Less than or equal</S.ParamItem>
                </S.ParamsList>
              </S.Card>

              <S.Card>
                <S.CardTitle>FILE_EXISTS</S.CardTitle>
                <S.CardDescription>Checks if a file exists</S.CardDescription>
                <S.CodeBlock>
{`{
  "type": "FILE_EXISTS",
  "target": "src/config/theme.ts"
}`}
                </S.CodeBlock>
              </S.Card>

              <S.Card>
                <S.CardTitle>FILE_NOT_EXISTS</S.CardTitle>
                <S.CardDescription>Checks if a file does NOT exist</S.CardDescription>
                <S.CodeBlock>
{`{
  "type": "FILE_NOT_EXISTS",
  "target": "src/old-config.ts"
}`}
                </S.CodeBlock>
              </S.Card>
            </S.SubSection>
          </S.Section>

          <S.Divider />

          <S.Section id="examples">
            <S.SectionTitle>
              <S.Icon>{ICONS.LIGHTBULB}</S.Icon>
              Practical Examples
            </S.SectionTitle>

            <S.SubSection>
              <S.SubTitle>Example 1: Conditional Import</S.SubTitle>
              <S.Description>Only import ThemeProvider if theme module is installed and import doesn't exist yet</S.Description>
              <S.CodeBlock>
{`{
  "path": "src/App.tsx",
  "action": "INSERT_IMPORT",
  "content": "import { ThemeProvider } from './theme/ThemeProvider';",
  "condition": {
    "logic": "AND",
    "conditions": [
      {
        "type": "MODULE_EXISTS",
        "value": "theme"
      },
      {
        "type": "PATTERN_NOT_EXISTS",
        "value": "ThemeProvider"
      }
    ]
  }
}`}
              </S.CodeBlock>
            </S.SubSection>

            <S.SubSection>
              <S.SubTitle>Example 2: Wrap Component Based on Module</S.SubTitle>
              <S.Description>Wrap app with ThemeProvider only if theme module exists</S.Description>
              <S.CodeBlock>
{`{
  "path": "src/main.tsx",
  "action": "REPLACE_CONTENT",
  "pattern": "<App />",
  "replacement": "<ThemeProvider>\\n    <App />\\n  </ThemeProvider>",
  "condition": {
    "conditions": [
      {
        "type": "MODULE_EXISTS",
        "value": "theme"
      }
    ]
  }
}`}
              </S.CodeBlock>
            </S.SubSection>

            <S.SubSection>
              <S.SubTitle>Example 3: Complex Multi-Condition</S.SubTitle>
              <S.Description>Add auth routes only if: auth module exists, routes file exists, and auth routes not already imported</S.Description>
              <S.CodeBlock>
{`{
  "path": "src/config/routes.ts",
  "action": "APPEND_TO_FILE",
  "content": "\\nexport { authRoutes } from './auth-routes';",
  "condition": {
    "logic": "AND",
    "conditions": [
      {
        "type": "MODULE_EXISTS",
        "value": "authentication"
      },
      {
        "type": "FILE_EXISTS",
        "target": "src/config/auth-routes.ts"
      },
      {
        "type": "PATTERN_NOT_EXISTS",
        "value": "authRoutes"
      }
    ]
  }
}`}
              </S.CodeBlock>
            </S.SubSection>

            <S.SubSection>
              <S.SubTitle>Example 4: OR Logic - Fallback Behavior</S.SubTitle>
              <S.Description>Create global styles if neither styled-components nor tailwind is installed</S.Description>
              <S.CodeBlock>
{`{
  "path": "src/styles/global.css",
  "action": "CREATE_FILE",
  "content": "/* Global styles */\\n* {\\n  margin: 0;\\n  padding: 0;\\n}",
  "condition": {
    "logic": "OR",
    "conditions": [
      {
        "type": "MODULE_NOT_EXISTS",
        "value": "styled-components"
      },
      {
        "type": "MODULE_NOT_EXISTS",
        "value": "tailwind"
      }
    ]
  }
}`}
              </S.CodeBlock>
            </S.SubSection>

            <S.SubSection>
              <S.SubTitle>Example 5: Pattern Count Validation</S.SubTitle>
              <S.Description>Only add export if there are less than 2 default exports</S.Description>
              <S.CodeBlock>
{`{
  "path": "src/utils/helpers.ts",
  "action": "APPEND_TO_FILE",
  "content": "\\nexport default config;",
  "condition": {
    "conditions": [
      {
        "type": "PATTERN_COUNT",
        "value": "export default",
        "operator": "LESS_THAN",
        "count": 1
      }
    ]
  }
}`}
              </S.CodeBlock>
            </S.SubSection>
          </S.Section>

          <S.Footer>
            <S.FooterText>
              Need help? Check out the{' '}
              <S.FooterLink href="https://github.com/odutradev/zeck-templates" target="_blank" rel="noopener noreferrer">
                GitHub repository
              </S.FooterLink>
              {' '}for more examples and templates.
            </S.FooterText>
          </S.Footer>
        </S.Main>
      </S.Content>
    </S.Container>
  );
};

export default Docs;