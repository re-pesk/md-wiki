/**
 * init.js
 */

(() => {
  const $ = window.jQuery;
  // hide the whole page so we dont see the DOM flickering
  // will be shown upon page load complete or error
  $('html').addClass('md-hidden-load');

  // register our $.md object
  // eslint-disable-next-line func-names
  $.md = function (method, ...args) {
    if (!$.md.publicMethods[method]) {
      $.error(`Method ${method} does not exist on jquery.md`);
    }
    return $.md.publicMethods[method].apply(this, args);
  };
  // default config
  $.md.config = {
    title: null,
    useSideMenu: true,
    lineBreaks: 'gfm',
    additionalFooterText: '',
    anchorCharacter: '&para;',
    tocAnchor: '[ &uarr; ]',
  };

  $.md.gimmicks = [];
  $.md.stages = [];

  // the location of the main markdown file we display
  $.md.mainHref = '';

  // the in-page anchor that is specified after the !
  $.md.inPageAnchor = '';

  $.md.loglevel = {
    TRACE: 10,
    DEBUG: 20,
    INFO: 30,
    WARN: 40,
    ERROR: 50,
    FATAL: 60,
  };
  // $.md.logThreshold = $.md.loglevel.DEBUG;
  $.md.logThreshold = $.md.loglevel.WARN;
})();
