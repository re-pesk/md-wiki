module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
    'node': true
  },
  'extends': 'eslint:recommended',
  'globals': {
    'Chart': true,
    'console': true,
    'google': true,
    'hljs': true,
    'jQuery': true,
    'L': true,
    'marked': true,
    'Prism': true
  },
  'rules': {
    'no-bitwise': 'error',
    'camelcase': 0,
    'curly': 0,
    'eqeqeq': 'error',
    'no-eq-null': 'error',
    'wrap-iife': ['error', 'any'],
    'no-use-before-define': ['error', { 'functions': false }],
    'new-cap': ['error', { 'capIsNew': false }],
    'no-caller': 'error',
    'no-irregular-whitespace': 'error',
    'no-new': 'error',
    'quotes': ['error', 'single'],
    'strict': ['error', 'function'],
    'dot-notation': 0,
    'no-undef': 'error',
    'no-unused-vars': 'error',
    'no-eval': ['error', {'allowIndirect': true}],
  },
  'parserOptions': {
    'sourceType': 'module'
  },
  'overrides': [{
    'files': 'src/**/*.js',
  }],
  'ignorePatterns': ['*_.*', '*.*_', '*_', 'lib/', '_compiled/'],
}
