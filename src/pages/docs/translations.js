export const translations = {
  en: {
    backToEditor: 'Back to Editor',
    documentation: 'Documentation',
    contents: 'Contents',
    instructions: 'Instructions',
    conditions: 'Conditions',
    examples: 'Examples',
    instructionsDescription: 'Instructions define what actions should be performed on your code files. Each instruction specifies a target file and an action to execute.',
    requiredParameters: 'Required Parameters',
    conditionsDescription: 'Conditions allow you to execute instructions only when specific criteria are met. You can combine multiple conditions using AND/OR logic operators.',
    conditionStructure: 'Condition Structure',
    logicOperators: 'Logic Operators',
    logicOperatorsDesc: {
      and: 'All conditions must be true',
      or: 'At least one condition must be true'
    },
    conditionTypes: 'Condition Types',
    conditionTypesDesc: {
      moduleExists: 'Checks if a module is selected in the installation',
      moduleNotExists: 'Checks if a module is NOT selected',
      patternExists: 'Checks if a pattern exists in the target file',
      patternNotExists: 'Checks if a pattern does NOT exist',
      patternCount: 'Checks the number of pattern occurrences',
      fileExists: 'Checks if a file exists',
      fileNotExists: 'Checks if a file does NOT exist'
    },
    targetNote: 'If target is not specified, uses the instruction\'s path',
    operators: 'Operators',
    operatorsDesc: {
      equals: 'Exactly equals count',
      notEquals: 'Does not equal count',
      greaterThan: 'Greater than count',
      lessThan: 'Less than count',
      greaterOrEqual: 'Greater than or equal',
      lessOrEqual: 'Less than or equal'
    },
    practicalExamples: 'Practical Examples',
    actions: {
      createFile: {
        description: 'Creates a new file with specified content',
        params: {
          path: 'File path to create',
          content: 'File content'
        }
      },
      deleteFile: {
        description: 'Deletes an existing file',
        params: {
          path: 'File path to delete'
        }
      },
      insertImport: {
        description: 'Inserts an import statement at the top of the file',
        params: {
          path: 'Target file path',
          content: 'Import statement'
        }
      },
      insertAfter: {
        description: 'Inserts content after a matching pattern',
        params: {
          path: 'Target file path',
          pattern: 'Text to find',
          content: 'Content to insert'
        }
      },
      insertBefore: {
        description: 'Inserts content before a matching pattern',
        params: {
          path: 'Target file path',
          pattern: 'Text to find',
          content: 'Content to insert'
        }
      },
      replaceContent: {
        description: 'Replaces all occurrences of a pattern with new content',
        params: {
          path: 'Target file path',
          pattern: 'Text to find',
          replacement: 'Replacement text'
        }
      },
      appendToFile: {
        description: 'Appends content to the end of the file',
        params: {
          path: 'Target file path',
          content: 'Content to append'
        }
      },
      insertProp: {
        description: 'Inserts a prop into React component instances',
        params: {
          path: 'Target file path',
          componentName: 'Component name',
          propName: 'Prop name',
          propValue: 'Prop value (optional)'
        }
      }
    },
    examplesContent: {
      example1: {
        title: 'Example 1: Conditional Import',
        description: 'Only import ThemeProvider if theme module is installed and import doesn\'t exist yet'
      },
      example2: {
        title: 'Example 2: Wrap Component Based on Module',
        description: 'Wrap app with ThemeProvider only if theme module exists'
      },
      example3: {
        title: 'Example 3: Complex Multi-Condition',
        description: 'Add auth routes only if: auth module exists, routes file exists, and auth routes not already imported'
      },
      example4: {
        title: 'Example 4: OR Logic - Fallback Behavior',
        description: 'Create global styles if neither styled-components nor tailwind is installed'
      },
      example5: {
        title: 'Example 5: Pattern Count Validation',
        description: 'Only add export if there are less than 2 default exports'
      }
    },
    footerText: 'Need help? Check out the',
    githubRepo: 'GitHub repository',
    footerText2: 'for more examples and templates.'
  },
  pt: {
    backToEditor: 'Voltar ao Editor',
    documentation: 'Documentação',
    contents: 'Conteúdo',
    instructions: 'Instruções',
    conditions: 'Condições',
    examples: 'Exemplos',
    instructionsDescription: 'Instruções definem quais ações devem ser executadas nos seus arquivos de código. Cada instrução especifica um arquivo alvo e uma ação a executar.',
    requiredParameters: 'Parâmetros Obrigatórios',
    conditionsDescription: 'Condições permitem executar instruções apenas quando critérios específicos são atendidos. Você pode combinar múltiplas condições usando operadores lógicos AND/OR.',
    conditionStructure: 'Estrutura da Condição',
    logicOperators: 'Operadores Lógicos',
    logicOperatorsDesc: {
      and: 'Todas as condições devem ser verdadeiras',
      or: 'Pelo menos uma condição deve ser verdadeira'
    },
    conditionTypes: 'Tipos de Condição',
    conditionTypesDesc: {
      moduleExists: 'Verifica se um módulo está selecionado na instalação',
      moduleNotExists: 'Verifica se um módulo NÃO está selecionado',
      patternExists: 'Verifica se um padrão existe no arquivo alvo',
      patternNotExists: 'Verifica se um padrão NÃO existe',
      patternCount: 'Verifica o número de ocorrências do padrão',
      fileExists: 'Verifica se um arquivo existe',
      fileNotExists: 'Verifica se um arquivo NÃO existe'
    },
    targetNote: 'Se target não for especificado, usa o caminho da instrução',
    operators: 'Operadores',
    operatorsDesc: {
      equals: 'Exatamente igual ao valor',
      notEquals: 'Diferente do valor',
      greaterThan: 'Maior que o valor',
      lessThan: 'Menor que o valor',
      greaterOrEqual: 'Maior ou igual',
      lessOrEqual: 'Menor ou igual'
    },
    practicalExamples: 'Exemplos Práticos',
    actions: {
      createFile: {
        description: 'Cria um novo arquivo com o conteúdo especificado',
        params: {
          path: 'Caminho do arquivo a criar',
          content: 'Conteúdo do arquivo'
        }
      },
      deleteFile: {
        description: 'Deleta um arquivo existente',
        params: {
          path: 'Caminho do arquivo a deletar'
        }
      },
      insertImport: {
        description: 'Insere uma declaração de import no topo do arquivo',
        params: {
          path: 'Caminho do arquivo alvo',
          content: 'Declaração de import'
        }
      },
      insertAfter: {
        description: 'Insere conteúdo após um padrão correspondente',
        params: {
          path: 'Caminho do arquivo alvo',
          pattern: 'Texto a encontrar',
          content: 'Conteúdo a inserir'
        }
      },
      insertBefore: {
        description: 'Insere conteúdo antes de um padrão correspondente',
        params: {
          path: 'Caminho do arquivo alvo',
          pattern: 'Texto a encontrar',
          content: 'Conteúdo a inserir'
        }
      },
      replaceContent: {
        description: 'Substitui todas as ocorrências de um padrão com novo conteúdo',
        params: {
          path: 'Caminho do arquivo alvo',
          pattern: 'Texto a encontrar',
          replacement: 'Texto de substituição'
        }
      },
      appendToFile: {
        description: 'Adiciona conteúdo ao final do arquivo',
        params: {
          path: 'Caminho do arquivo alvo',
          content: 'Conteúdo a adicionar'
        }
      },
      insertProp: {
        description: 'Insere uma prop em instâncias de componentes React',
        params: {
          path: 'Caminho do arquivo alvo',
          componentName: 'Nome do componente',
          propName: 'Nome da prop',
          propValue: 'Valor da prop (opcional)'
        }
      }
    },
    examplesContent: {
      example1: {
        title: 'Exemplo 1: Import Condicional',
        description: 'Importar ThemeProvider apenas se o módulo theme estiver instalado e o import ainda não existir'
      },
      example2: {
        title: 'Exemplo 2: Envolver Componente Baseado em Módulo',
        description: 'Envolver app com ThemeProvider apenas se o módulo theme existir'
      },
      example3: {
        title: 'Exemplo 3: Multi-Condição Complexa',
        description: 'Adicionar rotas de autenticação apenas se: módulo auth existe, arquivo de rotas existe, e rotas auth ainda não foram importadas'
      },
      example4: {
        title: 'Exemplo 4: Lógica OR - Comportamento de Fallback',
        description: 'Criar estilos globais se nem styled-components nem tailwind estiverem instalados'
      },
      example5: {
        title: 'Exemplo 5: Validação de Contagem de Padrão',
        description: 'Adicionar export apenas se houver menos de 2 exports default'
      }
    },
    footerText: 'Precisa de ajuda? Confira o',
    githubRepo: 'repositório no GitHub',
    footerText2: 'para mais exemplos e templates.'
  }
};