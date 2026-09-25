// 테스트용: TS 모듈을 메모리에서 CommonJS로 변환해 불러온다 (별도 빌드 없이 실행).
// 상대 경로 import는 같은 로더로, 그 밖의 모듈은 stubs에 있으면 stub을, 없으면 require로 해석한다.
const path = require('node:path');
const { existsSync, readFileSync } = require('node:fs');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');

function createTsLoader({ stubs = {} } = {}) {
  const cache = new Map();

  function loadTs(relativePath) {
    const file = path.resolve(root, relativePath);
    if (cache.has(file)) return cache.get(file).exports;
    const { outputText } = ts.transpileModule(readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    });
    const module = { exports: {} };
    cache.set(file, module);
    const localRequire = (request) => {
      if (request in stubs) return stubs[request];
      if (!request.startsWith('.')) return require(request);
      const base = path.resolve(path.dirname(file), request);
      const target = ['.ts', '.tsx', '.js'].map((ext) => base + ext).find(existsSync);
      if (!target) throw new Error(`cannot resolve ${request} from ${relativePath}`);
      return target.endsWith('.js') ? require(target) : loadTs(path.relative(root, target));
    };
    new Function('exports', 'require', 'module', outputText)(module.exports, localRequire, module);
    return module.exports;
  }

  return loadTs;
}

module.exports = { createTsLoader, root };
