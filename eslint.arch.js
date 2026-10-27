import path from 'node:path';

// Архитектурные слои монорепо (см. AGENTS.md «Architecture & import layers»):
//
//   client:  src/app → src/components → src/helpers → src/model → src/utils
//   backend: src/app → src/controllers → src/model → src/utils
//   common:  src/entities → src/shared
//
//   * импорты только «вниз» по уровням (в свою папку и между папками одного
//     уровня — можно; в более высокий уровень — нельзя);
//   * извне папки компонента/сущности доступен только главный файл
//     <Name>/<Name>.* (или index.*) — «кишки» (css, доп. модули) только из своей папки;
//   * страницы/компоненты/сущности лежат в собственных папках (colocation);
//   * в helpers клиента и в model/utils — без React; из common нельзя тянуть в
//     прикладные пакеты и наоборот (common — общий нижний слой).

const PKG_DIRS = ['client', 'backend', 'common'];

const CONFIGS = {
  client: {
    // уровень = индекс в этом списке (1-based), null — вне слоёв
    layers: ['src/app', 'src/components', 'src/helpers', 'src/model', 'src/utils'],
    // папки, к которым применяется «главный файл» и colocation
    componentRoots: [
      'src/app/layouts',
      'src/app/pages',
      'src/components',
      'src/helpers',
      'src/model',
      'src/utils',
    ],
    // где запрещён react и не должно быть .tsx
    noReact: ['src/helpers', 'src/model', 'src/utils'],
    noTsxIn: ['src/helpers'],
  },
  backend: {
    layers: ['src/app', 'src/controllers', 'src/model', 'src/utils'],
    componentRoots: ['src/controllers', 'src/model', 'src/utils'],
    // react в бэкенде не используется; кросс-запрет — на уровне common ↔ приложения
    noReact: [],
    noTsxIn: [],
  },
  common: {
    layers: ['src/entities', 'src/shared'],
    componentRoots: ['src/entities', 'src/shared'],
    noReact: ['src/entities', 'src/shared'],
    noTsxIn: [],
  },
};

const MAIN_FILE_EXTENSIONS = ['.ts', '.tsx', '.jsx', '.js'];

function inDir(relPath, dir) {
  return relPath === dir || relPath.startsWith(`${dir}/`);
}

// 'client/src/app/main.tsx' → 'client'; иначе null
function pkgOf(relPath) {
  const first = relPath.split('/')[0];
  return PKG_DIRS.includes(first) ? first : null;
}

function relInPkg(relPath, pkg) {
  return relPath.startsWith(`${pkg}/`) ? relPath.slice(pkg.length + 1) : null;
}

function getLevel(pkg, relInPkgPath) {
  const cfg = CONFIGS[pkg];
  const idx = cfg.layers.findIndex((dir) => inDir(relInPkgPath, dir));
  return idx === -1 ? null : idx + 1;
}

function getRelPath(context) {
  return path.relative(context.cwd, context.filename).split(path.sep).join('/');
}

// Спецификатор импорта → путь относительно корня монорепо ('client/src/…',
// 'common/src/…'); null — для внешних модулей.
function resolveSpec(sourceRel, spec) {
  const sourcePkg = pkgOf(sourceRel);

  if (spec.startsWith('@common/')) {
    return `common/src/${spec.slice('@common/'.length)}`;
  }
  if (spec.startsWith('@/')) {
    return sourcePkg ? `${sourcePkg}/src/${spec.slice(2)}` : null;
  }
  if (spec.startsWith('./') || spec.startsWith('../')) {
    const dir = path.posix.dirname(sourceRel);
    return path.posix.normalize(path.posix.join(dir, spec));
  }
  return null;
}

// Папка компонента/сущности, в которой лежит цель: <root>/<Name>/…
function getComponentFolder(targetRelInPkg, cfg) {
  for (const root of cfg.componentRoots) {
    if (!inDir(targetRelInPkg, root)) continue;
    const name = targetRelInPkg.slice(root.length + 1).split('/')[0];
    return { root, name, folder: `${root}/${name}` };
  }
  return null;
}

// Главный файл папки: index.<ext> или <Folder>.<ext>, где ext ∈ MAIN_FILE_EXTENSIONS
// (то есть theme.css.ts для папки theme — НЕ главный, нужен theme.ts)
function isMainFile(targetRelInPkg, component) {
  const relInFolder = targetRelInPkg.slice(component.folder.length + 1);
  if (relInFolder.includes('/')) return false;
  const dot = relInFolder.lastIndexOf('.');
  const ext = dot === -1 ? '' : relInFolder.slice(dot);
  if (ext && !MAIN_FILE_EXTENSIONS.includes(ext)) return false;
  const base = relInFolder.slice(0, relInFolder.length - ext.length);
  return base === component.name || base === 'index';
}

function isReactPackage(spec) {
  return (
    spec === 'react' ||
    spec === 'react-dom' ||
    spec.startsWith('react/') ||
    spec.startsWith('react-dom/')
  );
}

// true, если import «кишки» чужой папки (наружу тянут не главный файл)
function isInsideForeignFolder(sourceRelInPkg, targetRelInPkg, cfg) {
  const component = getComponentFolder(targetRelInPkg, cfg);
  if (!component) return false;
  if (inDir(sourceRelInPkg, component.folder)) return false;
  return !isMainFile(targetRelInPkg, component);
}

function checkImport(context, sourceRel, spec, node) {
  const sourcePkg = pkgOf(sourceRel);
  if (!sourcePkg) return;

  // Бан react в helpers/model/utils (client) и в entities/shared (common)
  if (
    isReactPackage(spec) &&
    CONFIGS[sourcePkg].noReact.some((dir) => inDir(relInPkg(sourceRel, sourcePkg), dir))
  ) {
    context.report({ node, messageId: 'bannedPackage', data: { spec } });
    return;
  }

  const targetRel = resolveSpec(sourceRel, spec);
  if (targetRel === null) return; // внешний модуль — на уровни не распространяется
  const targetPkg = pkgOf(targetRel);
  if (!targetPkg) return;

  const sourceInPkg = relInPkg(sourceRel, sourcePkg);
  const targetInPkg = relInPkg(targetRel, targetPkg);

  if (sourcePkg !== targetPkg) {
    // common разрешён как общий нижний слой; всё остальное между пакетами — нельзя
    if (!(targetPkg === 'common' && sourcePkg !== 'common')) {
      context.report({ node, messageId: 'crossPackage', data: { spec, sourcePkg, targetPkg } });
      return;
    }
    // common всегда снизу: сверяем только «внутренности» папок по конфигам common
    if (isInsideForeignFolder(sourceInPkg, targetInPkg, CONFIGS[targetPkg])) {
      context.report({ node, messageId: 'componentInnards', data: { spec } });
    }
    return;
  }

  const sourceLevel = getLevel(sourcePkg, sourceInPkg);
  const targetLevel = getLevel(targetPkg, targetInPkg);
  if (sourceLevel === null || targetLevel === null) return; // файлы вне слоёв

  // Уровни: вверх нельзя; внутри уровня cross-folder разрешён; вниз — можно
  if (targetLevel < sourceLevel) {
    context.report({
      node,
      messageId: 'higherLevel',
      data: { spec, sourceLevel, targetLevel },
    });
    return;
  }

  // Правило «главного файла» наружу из папки
  if (isInsideForeignFolder(sourceInPkg, targetInPkg, CONFIGS[sourcePkg])) {
    context.report({ node, messageId: 'componentInnards', data: { spec } });
    return;
  }

  // В src/helpers (клиент) не тащим .tsx
  if (
    CONFIGS[sourcePkg].noTsxIn.some((dir) => inDir(sourceInPkg, dir)) &&
    /\.(tsx|jsx)$/.test(path.posix.basename(targetRel))
  ) {
    context.report({ node, messageId: 'noTsx', data: { spec } });
  }
}

function checkColocation(context) {
  const relPath = getRelPath(context);
  const pkg = pkgOf(relPath);
  if (!pkg) return;
  const inPkg = relInPkg(relPath, pkg);
  for (const root of CONFIGS[pkg].componentRoots) {
    if (!inDir(inPkg, root)) continue;
    const rest = inPkg.slice(root.length + 1);
    if (!rest.includes('/')) {
      context.report({
        loc: { line: 1, column: 0 },
        messageId: 'noOwnFolder',
        data: { file: relPath, expected: `${pkg}/${root}/<name>/<file>` },
      });
    }
    return;
  }
}

export default {
  meta: { name: 'eslint-plugin-arch', version: '2.0.0' },
  rules: {
    layers: {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Слойная архитектура пакетов: импорты только вниз по уровням, только главный файл папки снаружи, без react в helpers/model/utils',
        },
        messages: {
          higherLevel:
            'Импорт «{{spec}}» запрещён: файл уровня {{sourceLevel}} импортирует из более высокого уровня {{targetLevel}}. Разрешены импорты только вниз по слоям (или из своей папки).',
          crossPackage:
            'Импорт «{{spec}}» запрещён: пакет {{sourcePkg}} не может импортировать из {{targetPkg}} (common — общий нижний слой, cross-импорты прикладных пакетов недопустимы).',
          componentInnards:
            'Импорт «{{spec}}» запрещён: извне папки компонента/сущности можно импортировать только главный файл (<имя>/<имя>) или index. Внутренние файлы (стили, хелперы, данные) доступны только из своей папки.',
          noTsx:
            'Импорт «{{spec}}» запрещён: в src/helpers (клиент) не должно быть React-компонентов (.tsx) — только общие небескомпонентные утилиты/хуки.',
          bannedPackage:
            'Импорт «{{spec}}» запрещён: в helpers/model/utils (клиент) и в entities/shared (common) нет привязки к React.',
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
            'Компоненты/страницы/сущности лежат в собственных папках, а не в корне уровня',
        },
        messages: {
          noOwnFolder:
            '«{{file}}» должен лежать в своей папке: {{expected}}. Плоские файлы в корне уровня запрещены.',
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
