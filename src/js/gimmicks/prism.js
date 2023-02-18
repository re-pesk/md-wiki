/**
 * prism.js
 */

// eslint-disable-next-line no-var
var Prism;

(() => {
  const $ = window.jQuery;
  const supportedLangs = [
    'abap',
    'actionscript',
    'apacheconf',
    'apl',
    'applescript',
    'asciidoc',
    'aspnet',
    'autohotkey',
    'autoit',
    'bash',
    'basic',
    'batch',
    'bison',
    'brainfuck',
    'c',
    'clike',
    'coffeescript',
    'core',
    'cpp',
    'crystal',
    'csharp',
    'css',
    'd',
    'dart',
    'diff',
    'docker',
    'eiffel',
    'elixir',
    'erlang',
    'fortran',
    'fsharp',
    'gherkin',
    'git',
    'glsl',
    'go',
    'groovy',
    'haml',
    'handlebars',
    'haskell',
    'haxe',
    'http',
    'icon',
    'inform7',
    'ini',
    'j',
    'jade',
    'java',
    'javascript',
    'json',
    'jsx',
    'julia',
    'keyman',
    'kotlin',
    'latex',
    'less',
    'lolcode',
    'lua',
    'makefile',
    'markdown',
    'markup',
    'matlab',
    'mel',
    'mizar',
    'monkey',
    'nasm',
    'nginx',
    'nim',
    'nix',
    'nsis',
    'objectivec',
    'ocaml',
    'oz',
    'parigp',
    'parser',
    'pascal',
    'perl',
    'php',
    'powershell',
    'processing',
    'prolog',
    'puppet',
    'pure',
    'python',
    'q',
    'qore',
    'r',
    'rest',
    'rip',
    'roboconf',
    'ruby',
    'rust',
    'sas',
    'sass',
    'scala',
    'scheme',
    'scss',
    'smalltalk',
    'smarty',
    'sql',
    'stylus',
    'svg',
    'swift',
    'tcl',
    'textile',
    'twig',
    'typescript',
    'verilog',
    'vhdl',
    'vim',
    'wiki',
    'xml',
    'yaml',
  ];

  function prismHighlight() {
    // marked adds lang-ruby, lang-csharp etc to the <code> block like in GFM
    const $codeblocks = $('pre code[class^=lang-]');
    $codeblocks.each((i, _this) => {
      const $this = $(_this);
      const classes = $this.attr('class');
      const lang = classes.substring(5);
      if (supportedLangs.indexOf(lang) < 0) {
        return;
      }
      $this.removeClass(classes);
      $this.addClass(`language-${lang}`);
    });
    Prism.highlightAll();
  }

  const prismGimmick = {
    name: 'prism',
    load() {
      $.md.stage('gimmick').subscribe((done) => {
        prismHighlight();
        done();
      });
    },
  };

  $.md.registerGimmick(prismGimmick);
})();
