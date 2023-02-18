/**
 * gimmickers.js
 */

(() => {
  const $ = window.jQuery;

  // eslint-disable-next-line func-names
  $.fn.gimmicks = function (method, ...args) {
    if (method === undefined) {
      return;
    }
    // call the gimmick
    if (!$.fn.gimmicks.methods[method]) {
      $.error(`Gimmick ${method} does not exist on jQuery.gimmicks`);
    }
    // eslint-disable-next-line consistent-return
    return $.fn.gimmicks.methods[method].apply(this, args);
  };

  $.gimmicks = $.fn.gimmicks;

  // TODO underscores _ in Markdown links are not allowed! bug in our MD imlemenation
})();
