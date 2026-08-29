import path from 'node:path';

// Правило слойной архитектуры src/ (см. README «Архитектура: уровни и правила
// импортов» и AGENTS.md «Architecture & import layers»):
//
//   L1 app/common     — файлы прямо в src/app/ (кроме pages/ и layouts/)
//   L2 app/layouts
//   L3 app/pages
//   L4 components/complex
//   L5 components/plain
//   L6 components/shared
//   L7 entities
//   L8 utils
//
// Импорты разрешены «вниз» (в более низкий уровень), из своей папки и (для
// L1/L4/L6) в пределах своего уровня. Отдельные правила: главный файл
// React-компонента, css из нижних уровней только из shared, plain без
// импортов других компонентов, запрет react в entities/utils.

const SHARED = 'src/components/shared';

// Папки React-компонентов: главный файл можно импортировать извне, «кишки» — нет
const COMPONENT_ROOTS = [
  'src/app/pages',
  'src/app/layouts',
  'src/components/complex',
  'src/components/plain',
];

// Уровни, где разрешены импорты из своего уровня (в разных папках)
const SAME_LEVEL_ALLOWED = new Set([1, 4, 6]);

// Уровни с запретом импорта react/react-dom
const NO_REACT_LEVELS = new Set([7, 8]);

const MAIN_FILE_EXTENSIONS = ['.ts', '.tsx', '.jsx', '.js'];

function inDir(relPath, dir) {
  return relPath === dir || relPath.startsWith(`${dir}/`);
}

function getLevel(relPath) {
  if (inDir(relPath, 'src/app/layouts')) return 2;
  if (inDir(relPath, 'src/app/pages')) return 3;
  if (inDir(relPath, 'src/app')) return 1;
  if (inDir(relPath, 'src/components/complex')) return 4;
  if (inDir(relPath, 'src/components/plain')) return 5;
  if (inDir(relPath, SHARED)) return 6;
  if (inDir(relPath, 'src/entities')) return 7;
  if (inDir(relPath, 'src/utils')) return 8;
  return null;
}

function getRelPath(context) {
  return path.relative(context.cwd, context.filename).split(path.sep).join('/');
}

// Спецификатор импорта → путь относительно корня (src/…); null для внешних модулей
function resolveSpec(sourceRel, spec) {
  const dir = path.posix.dirname(sourceRel);
  if (spec.startsWith('./') || spec.startsWith('../')) {
    return path.posix.normalize(path.posix.join(dir, spec));
  }
  if (spec.startsWith('@/')) {
    return `src/${spec.slice(2)}`;
  }
  return null;
}

// Компонентная папка, в которой лежит цель: <root>/<Name>/…
function getComponentFolder(targetRel) {
  for (const root of COMPONENT_ROOTS) {
    if (!inDir(targetRel, root)) continue;
    const name = targetRel.slice(root.length + 1).split('/')[0];
    return { root, name, folder: `${root}/${name}` };
  }
  return null;
}

// Главный файл компонента: <root>/<Name>/<Name>[.tsx|.ts|.jsx|.js]
function isComponentMainFile(targetRel) {
  const component = getComponentFolder(targetRel);
  if (!component) return false;
  const relInFolder = targetRel.slice(component.folder.length + 1);
  if (relInFolder.includes('/')) return false;
  const dot = relInFolder.lastIndexOf('.');
  const ext = dot === -1 ? '' : relInFolder.slice(dot);
  if (ext && !MAIN_FILE_EXTENSIONS.includes(ext)) return false;
  return relInFolder.slice(0, relInFolder.length - ext.length) === component.name;
}

function isReactPackage(spec) {
  return (
    spec === 'react' ||
    spec === 'react-dom' ||
    spec.startsWith('react/') ||
    spec.startsWith('react-dom/')
  );
}

function checkImport(context, sourceRel, spec, node) {
  const sourceLevel = getLevel(sourceRel);

  // Бан: react/react-dom в entities и utils
  if (sourceLevel !== null && NO_REACT_LEVELS.has(sourceLevel) && isReactPackage(spec)) {
    context.report({ node, messageId: 'bannedPackage', data: { spec } });
    return;
  }

  const targetRel = resolveSpec(sourceRel, spec);
  if (targetRel === null) return; // внешний модуль — на уровни не распространяется
  const targetLevel = getLevel(targetRel);
  if (targetLevel === null || sourceLevel === null) return; // файлы вне уровней

  const sourceDir = path.posix.dirname(sourceRel);
  const targetDir = path.posix.dirname(targetRel);
  const sameFolder = sourceDir === targetDir;

  // Правило plain: plain-компоненты не импортируют другие React-компоненты
  if (sourceLevel === 5 && isComponentMainFile(targetRel) && !sameFolder) {
    context.report({ node, messageId: 'plainImportsComponent', data: { spec } });
    return;
  }

  // Уровни: вверх нельзя
  if (targetLevel < sourceLevel) {
    context.report({
      node,
      messageId: 'higherLevel',
      data: { spec, sourceLevel, targetLevel },
    });
    return;
  }

  // Свой уровень: можно только в своей папке, либо для L1/L4/L6
  if (targetLevel === sourceLevel) {
    if (sameFolder) return;
    if (!SAME_LEVEL_ALLOWED.has(sourceLevel)) {
      context.report({ node, messageId: 'sameLevel', data: { spec, sourceLevel } });
      return;
    }
  }

  // Главный файл: извне папки компонента импортируется только <Name>/<Name>
  const component = getComponentFolder(targetRel);
  if (component && !inDir(sourceDir, component.folder)) {
    if (!isComponentMainFile(targetRel)) {
      context.report({ node, messageId: 'componentInnards', data: { spec } });
    }
    return;
  }

  // CSS: из нижних уровней — только из components/shared
  const isCss = spec.endsWith('.css') || spec.endsWith('.css.ts');
  if (isCss && !sameFolder) {
    if (sourceLevel === 1 && targetLevel === 1) return; // app/common: общие стили
    if (inDir(targetRel, SHARED)) return;
    context.report({ node, messageId: 'cssOutsideShared', data: { spec } });
  }
}

function checkColocation(context) {
  const relPath = getRelPath(context);
  for (const root of COMPONENT_ROOTS) {
    if (!inDir(relPath, root)) continue;
    const rest = relPath.slice(root.length + 1);
    if (!rest.includes('/')) {
      context.report({
        loc: { line: 1, column: 0 },
        messageId: 'noOwnFolder',
        data: { file: relPath, expected: `${root}/<name>/<file>` },
      });
    }
    return;
  }
}

export default {
  meta: { name: 'eslint-plugin-arch', version: '1.0.0' },
  rules: {
    layers: {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Слойная архитектура: импорты только вниз по уровням, главный файл компонента, css из shared, plain без компонентов, без react в entities/utils',
        },
        messages: {
          higherLevel:
            'Импорт «{{spec}}» запрещён: файл уровня {{sourceLevel}} импортирует из более высокого уровня {{targetLevel}}. Уровни разрешают импорт только вниз (L1 app/common → … → L8 utils) или из своей папки.',
          sameLevel:
            'Импорт «{{spec}}» запрещён: внутри уровня {{sourceLevel}} можно импортировать только из своей папки (свой уровень целиком разрешён только для app/common, components/complex и components/shared).',
          componentInnards:
            'Импорт «{{spec}}» запрещён: извне папки React-компонента можно импортировать только его главный файл (<имя папки>/<имя папки>). Внутренние файлы (стили, хуки, подкомпоненты) доступны только из своей папки.',
          cssOutsideShared:
            'Импорт «{{spec}}» запрещён: стили (*.css) из других папок/уровней можно импортировать только из components/shared (общие файлы). Стили из своей папки — без ограничений.',
          plainImportsComponent:
            'Импорт «{{spec}}» запрещён: plain-компоненты (components/plain) не импортируют другие React-компоненты. Если нужен другой компонент — вынесите его в components/complex.',
          bannedPackage:
            'Импорт «{{spec}}» запрещён: в entities и utils нет привязки к React (чистый TypeScript).',
        },
        schema: [],
      },
      create(context) {
        const sourceRel = getRelPath(context);
        const handle = (node, spec) => checkImport(context, sourceRel, spec, node);
        return {
          ImportDeclaration(node) {
            handle(node, node.source.value);
          },
          ExportNamedDeclaration(node) {
            if (node.source) handle(node, node.source.value);
          },
          ExportAllDeclaration(node) {
            handle(node, node.source.value);
          },
          ImportExpression(node) {
            if (node.source.type === 'Literal') handle(node, node.source.value);
          },
        };
      },
    },
    colocation: {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Страницы, layout-ы и компоненты (complex/plain) лежат в собственных папках, а не в корне уровня',
        },
        messages: {
          noOwnFolder:
            '«{{file}}» должен лежать в своей папке: {{expected}}. Плоские файлы в корне уровня (pages/layouts/complex/plain) не допускаются.',
        },
        schema: [],
      },
      create(context) {
        return {
          Program() {
            checkColocation(context);
          },
        };
      },
    },
  },
};
