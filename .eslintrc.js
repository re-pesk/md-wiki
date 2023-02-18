module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
  },
  overrides: [{
    files: 'src/**/*.js',
  }],
  ignorePatterns: ['*_.*', '*.*_', '*_', 'lib/', '_compiled/'],
};
