import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as S from './styles';
import { translations } from './translations';

const ICONS = {
  BACK: 'arrow_back',
  CODE: 'code',
  RULE: 'rule',
  LIGHTBULB: 'lightbulb',
  MENU: 'menu',
  CLOSE: 'close',
  LANGUAGE: 'language'
};

const Docs = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('instructions');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState('en');

  const t = translations[language];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
      setMobileMenuOpen(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'pt' : 'en');
  };

  return (
    <S.Container>
      <S.Header>
        <S.BackButton onClick={() => navigate('/')}>
          <S.Icon>{ICONS.BACK}</S.Icon>
          {t.backToEditor}
        </S.BackButton>
        <S.Title>{t.documentation}</S.Title>
        <S.HeaderControls>
          <S.LanguageToggle onClick={toggleLanguage}>
            <S.Icon>{ICONS.LANGUAGE}</S.Icon>
            <S.LanguageText>{language.toUpperCase()}</S.LanguageText>
          </S.LanguageToggle>
          <S.MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <S.Icon>{mobileMenuOpen ? ICONS.CLOSE : ICONS.MENU}</S.Icon>
          </S.MobileMenuButton>
        </S.HeaderControls>
      </S.Header>

      <S.Content>
        <S.Sidebar open={mobileMenuOpen}>
          <S.SidebarTitle>{t.contents}</S.SidebarTitle>
          <S.NavList>
            <S.NavItem active={activeSection === 'instructions'} onClick={() => scrollToSection('instructions')}>
              <S.Icon>{ICONS.CODE}</S.Icon>
              {t.instructions}
            </S.NavItem>
            <S.NavItem active={activeSection === 'conditions'} onClick={() => scrollToSection('conditions')}>
              <S.Icon>{ICONS.RULE}</S.Icon>
              {t.conditions}
            </S.NavItem>
            <S.NavItem active={activeSection === 'examples'} onClick={() => scrollToSection('examples')}>
              <S.Icon>{ICONS.LIGHTBULB}</S.Icon>
              {t.examples}
            </S.NavItem>
          </S.NavList>
        </S.Sidebar>

        <S.Main>
          <S.Section id="instructions">
            <S.SectionTitle>
              <S.Icon>{ICONS.CODE}</S.Icon>
              {t.instructions}
            </S.SectionTitle>
            <S.Description>
              {t.instructionsDescription}
            </S.Description>

            <S.Card>
              <S.CardTitle>CREATE_FILE</S.CardTitle>
              <S.CardDescription>{t.actions.createFile.description}</S.CardDescription>
              <S.CodeBlock>
{`{
  "path": "src/components/NewComponent.tsx",
  "action": "CREATE_FILE",
  "content": "import React from 'react';\\n\\nexport const NewComponent = () => {\\n  return <div>Hello</div>;\\n};"
}`}
              </S.CodeBlock>
              <S.ParamsTitle>{t.requiredParameters}</S.ParamsTitle>
              <S.ParamsList>
                <S.ParamItem><S.ParamName>path</S.ParamName> - {t.actions.createFile.params.path}</S.ParamItem>
                <S.ParamItem><S.ParamName>content</S.ParamName> - {t.actions.createFile.params.content}</S.ParamItem>
              </S.ParamsList>
            </S.Card>

            <S.Card>
              <S.CardTitle>DELETE_FILE</S.CardTitle>
              <S.CardDescription>{t.actions.deleteFile.description}</S.CardDescription>
              <S.CodeBlock>
{`{
  "path": "src/old-component.tsx",
  "action": "DELETE_FILE"
}`}
              </S.CodeBlock>
              <S.ParamsTitle>{t.requiredParameters}</S.ParamsTitle>
              <S.ParamsList>
                <S.ParamItem><S.ParamName>path</S.ParamName> - {t.actions.deleteFile.params.path}</S.ParamItem>
              </S.ParamsList>
            </S.Card>

            <S.Card>
              <S.CardTitle>INSERT_IMPORT</S.CardTitle>
              <S.CardDescription>{t.actions.insertImport.description}</S.CardDescription>
              <S.CodeBlock>
{`{
  "path": "src/App.tsx",
  "action": "INSERT_IMPORT",
  "content": "import { ThemeProvider } from './theme/ThemeProvider';"
}`}
              </S.CodeBlock>
              <S.ParamsTitle>{t.requiredParameters}</S.ParamsTitle>
              <S.ParamsList>
                <S.ParamItem><S.ParamName>path</S.ParamName> - {t.actions.insertImport.params.path}</S.ParamItem>
                <S.ParamItem><S.ParamName>content</S.ParamName> - {t.actions.insertImport.params.content}</S.ParamItem>
              </S.ParamsList>
            </S.Card>

            <S.Card>
              <S.CardTitle>INSERT_AFTER</S.CardTitle>
              <S.CardDescription>{t.actions.insertAfter.description}</S.CardDescription>
              <S.CodeBlock>
{`{
  "path": "src/App.tsx",
  "action": "INSERT_AFTER",
  "pattern": "const App = () => {",
  "content": "  const [theme, setTheme] = useState('dark');"
}`}
              </S.CodeBlock>
              <S.ParamsTitle>{t.requiredParameters}</S.ParamsTitle>
              <S.ParamsList>
                <S.ParamItem><S.ParamName>path</S.ParamName> - {t.actions.insertAfter.params.path}</S.ParamItem>
                <S.ParamItem><S.ParamName>pattern</S.ParamName> - {t.actions.insertAfter.params.pattern}</S.ParamItem>
                <S.ParamItem><S.ParamName>content</S.ParamName> - {t.actions.insertAfter.params.content}</S.ParamItem>
              </S.ParamsList>
            </S.Card>

            <S.Card>
              <S.CardTitle>INSERT_BEFORE</S.CardTitle>
              <S.CardDescription>{t.actions.insertBefore.description}</S.CardDescription>
              <S.CodeBlock>
{`{
  "path": "src/main.tsx",
  "action": "INSERT_BEFORE",
  "pattern": "ReactDOM.render(",
  "content": "initializeApp();"
}`}
              </S.CodeBlock>
              <S.ParamsTitle>{t.requiredParameters}</S.ParamsTitle>
              <S.ParamsList>
                <S.ParamItem><S.ParamName>path</S.ParamName> - {t.actions.insertBefore.params.path}</S.ParamItem>
                <S.ParamItem><S.ParamName>pattern</S.ParamName> - {t.actions.insertBefore.params.pattern}</S.ParamItem>
                <S.ParamItem><S.ParamName>content</S.ParamName> - {t.actions.insertBefore.params.content}</S.ParamItem>
              </S.ParamsList>
            </S.Card>

            <S.Card>
              <S.CardTitle>REPLACE_CONTENT</S.CardTitle>
              <S.CardDescription>{t.actions.replaceContent.description}</S.CardDescription>
              <S.CodeBlock>
{`{
  "path": "src/config.ts",
  "action": "REPLACE_CONTENT",
  "pattern": "API_URL = 'localhost'",
  "replacement": "API_URL = 'production.com'"
}`}
              </S.CodeBlock>
              <S.ParamsTitle>{t.requiredParameters}</S.ParamsTitle>
              <S.ParamsList>
                <S.ParamItem><S.ParamName>path</S.ParamName> - {t.actions.replaceContent.params.path}</S.ParamItem>
                <S.ParamItem><S.ParamName>pattern</S.ParamName> - {t.actions.replaceContent.params.pattern}</S.ParamItem>
                <S.ParamItem><S.ParamName>replacement</S.ParamName> - {t.actions.replaceContent.params.replacement}</S.ParamItem>
              </S.ParamsList>
            </S.Card>

            <S.Card>
              <S.CardTitle>APPEND_TO_FILE</S.CardTitle>
              <S.CardDescription>{t.actions.appendToFile.description}</S.CardDescription>
              <S.CodeBlock>
{`{
  "path": "src/routes.ts",
  "action": "APPEND_TO_FILE",
  "content": "\\nexport { authRoutes } from './auth-routes';"
}`}
              </S.CodeBlock>
              <S.ParamsTitle>{t.requiredParameters}</S.ParamsTitle>
              <S.ParamsList>
                <S.ParamItem><S.ParamName>path</S.ParamName> - {t.actions.appendToFile.params.path}</S.ParamItem>
                <S.ParamItem><S.ParamName>content</S.ParamName> - {t.actions.appendToFile.params.content}</S.ParamItem>
              </S.ParamsList>
            </S.Card>

            <S.Card>
              <S.CardTitle>INSERT_PROP</S.CardTitle>
              <S.CardDescription>{t.actions.insertProp.description}</S.CardDescription>
              <S.CodeBlock>
{`{
  "path": "src/App.tsx",
  "action": "INSERT_PROP",
  "componentName": "Button",
  "propName": "variant",
  "propValue": "\\"primary\\""
}`}
              </S.CodeBlock>
              <S.ParamsTitle>{t.requiredParameters}</S.ParamsTitle>
              <S.ParamsList>
                <S.ParamItem><S.ParamName>path</S.ParamName> - {t.actions.insertProp.params.path}</S.ParamItem>
                <S.ParamItem><S.ParamName>componentName</S.ParamName> - {t.actions.insertProp.params.componentName}</S.ParamItem>
                <S.ParamItem><S.ParamName>propName</S.ParamName> - {t.actions.insertProp.params.propName}</S.ParamItem>
                <S.ParamItem><S.ParamName>propValue</S.ParamName> - {t.actions.insertProp.params.propValue}</S.ParamItem>
              </S.ParamsList>
            </S.Card>
          </S.Section>

          <S.Divider />

          <S.Section id="conditions">
            <S.SectionTitle>
              <S.Icon>{ICONS.RULE}</S.Icon>
              {t.conditions}
            </S.SectionTitle>
            <S.Description>
              {t.conditionsDescription}
            </S.Description>

            <S.SubSection>
              <S.SubTitle>{t.conditionStructure}</S.SubTitle>
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
              <S.SubTitle>{t.logicOperators}</S.SubTitle>
              <S.ParamsList>
                <S.ParamItem><S.ParamName>AND</S.ParamName> - {t.logicOperatorsDesc.and}</S.ParamItem>
                <S.ParamItem><S.ParamName>OR</S.ParamName> - {t.logicOperatorsDesc.or}</S.ParamItem>
              </S.ParamsList>
            </S.SubSection>

            <S.SubSection>
              <S.SubTitle>{t.conditionTypes}</S.SubTitle>

              <S.Card>
                <S.CardTitle>MODULE_EXISTS</S.CardTitle>
                <S.CardDescription>{t.conditionTypesDesc.moduleExists}</S.CardDescription>
                <S.CodeBlock>
{`{
  "type": "MODULE_EXISTS",
  "value": "authentication"
}`}
                </S.CodeBlock>
              </S.Card>

              <S.Card>
                <S.CardTitle>MODULE_NOT_EXISTS</S.CardTitle>
                <S.CardDescription>{t.conditionTypesDesc.moduleNotExists}</S.CardDescription>
                <S.CodeBlock>
{`{
  "type": "MODULE_NOT_EXISTS",
  "value": "theme"
}`}
                </S.CodeBlock>
              </S.Card>

              <S.Card>
                <S.CardTitle>PATTERN_EXISTS</S.CardTitle>
                <S.CardDescription>{t.conditionTypesDesc.patternExists}</S.CardDescription>
                <S.CodeBlock>
{`{
  "type": "PATTERN_EXISTS",
  "value": "import React",
  "target": "src/App.tsx"
}`}
                </S.CodeBlock>
                <S.Note>{t.targetNote}</S.Note>
              </S.Card>

              <S.Card>
                <S.CardTitle>PATTERN_NOT_EXISTS</S.CardTitle>
                <S.CardDescription>{t.conditionTypesDesc.patternNotExists}</S.CardDescription>
                <S.CodeBlock>
{`{
  "type": "PATTERN_NOT_EXISTS",
  "value": "ThemeProvider"
}`}
                </S.CodeBlock>
              </S.Card>

              <S.Card>
                <S.CardTitle>PATTERN_COUNT</S.CardTitle>
                <S.CardDescription>{t.conditionTypesDesc.patternCount}</S.CardDescription>
                <S.CodeBlock>
{`{
  "type": "PATTERN_COUNT",
  "value": "export default",
  "operator": "LESS_THAN",
  "count": 2
}`}
                </S.CodeBlock>
                <S.ParamsTitle>{t.operators}:</S.ParamsTitle>
                <S.ParamsList>
                  <S.ParamItem><S.ParamName>EQUALS</S.ParamName> - {t.operatorsDesc.equals}</S.ParamItem>
                  <S.ParamItem><S.ParamName>NOT_EQUALS</S.ParamName> - {t.operatorsDesc.notEquals}</S.ParamItem>
                  <S.ParamItem><S.ParamName>GREATER_THAN</S.ParamName> - {t.operatorsDesc.greaterThan}</S.ParamItem>
                  <S.ParamItem><S.ParamName>LESS_THAN</S.ParamName> - {t.operatorsDesc.lessThan}</S.ParamItem>
                  <S.ParamItem><S.ParamName>GREATER_OR_EQUAL</S.ParamName> - {t.operatorsDesc.greaterOrEqual}</S.ParamItem>
                  <S.ParamItem><S.ParamName>LESS_OR_EQUAL</S.ParamName> - {t.operatorsDesc.lessOrEqual}</S.ParamItem>
                </S.ParamsList>
              </S.Card>

              <S.Card>
                <S.CardTitle>FILE_EXISTS</S.CardTitle>
                <S.CardDescription>{t.conditionTypesDesc.fileExists}</S.CardDescription>
                <S.CodeBlock>
{`{
  "type": "FILE_EXISTS",
  "target": "src/config/theme.ts"
}`}
                </S.CodeBlock>
              </S.Card>

              <S.Card>
                <S.CardTitle>FILE_NOT_EXISTS</S.CardTitle>
                <S.CardDescription>{t.conditionTypesDesc.fileNotExists}</S.CardDescription>
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
              {t.practicalExamples}
            </S.SectionTitle>

            <S.SubSection>
              <S.SubTitle>{t.examplesContent.example1.title}</S.SubTitle>
              <S.Description>{t.examplesContent.example1.description}</S.Description>
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
              <S.SubTitle>{t.examplesContent.example2.title}</S.SubTitle>
              <S.Description>{t.examplesContent.example2.description}</S.Description>
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
              <S.SubTitle>{t.examplesContent.example3.title}</S.SubTitle>
              <S.Description>{t.examplesContent.example3.description}</S.Description>
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
              <S.SubTitle>{t.examplesContent.example4.title}</S.SubTitle>
              <S.Description>{t.examplesContent.example4.description}</S.Description>
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
              <S.SubTitle>{t.examplesContent.example5.title}</S.SubTitle>
              <S.Description>{t.examplesContent.example5.description}</S.Description>
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
              {t.footerText}{' '}
              <S.FooterLink href="https://github.com/odutradev/zeck-templates" target="_blank" rel="noopener noreferrer">
                {t.githubRepo}
              </S.FooterLink>
              {' '}{t.footerText2}
            </S.FooterText>
          </S.Footer>
        </S.Main>
      </S.Content>
    </S.Container>
  );
};

export default Docs;