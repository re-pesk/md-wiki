/**
 * logging.js
 */

(() => {
  const $ = window.jQuery;
  $.md.getLogger = () => {
    const { loglevel } = $.md;

    const log = (logtarget) => {
      // var self = this;
      const level = loglevel[logtarget];
      return (msg) => {
        if ($.md.logThreshold <= level) {
          // eslint-disable-next-line no-console
          console.log(`[${logtarget}] ${msg}`);
        }
      };
    };

    const logger = {
      trace: log('TRACE'),
      debug: log('DEBUG'),
      info: log('INFO'),
      warn: log('WARN'),
      error: log('ERROR'),
      fatal: log('FATAL'),
    };

    return logger;
  };
})();
