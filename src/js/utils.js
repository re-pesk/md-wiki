/**
 * utils.js
 */

(() => {
  const $ = window.jQuery;
  const publicMethods = {
    isRelativeUrl(url) {
      if (url === undefined) {
        return false;
      }
      // if there is :// in it, its considered absolute
      // else its relative
      if (url.indexOf('://') === -1) {
        return true;
      }
      return false;
    },

    isRelativePath(path) {
      if (path === undefined) {
        return false;
      }
      if (path.startsWith('/')) {
        return false;
      }
      return true;
    },

    isGimmickLink(domAnchor) {
      if (domAnchor.toptext().indexOf('gimmick:') !== -1) {
        return true;
      }
      return false;
    },

    hasMarkdownFileExtension(str) {
      if (!str) {
        return str;
      }
      const markdownExtensions = ['.md', '.markdown', '.mdown'];
      let result = false;
      const value = str.toLowerCase().split('#')[0];
      $(markdownExtensions).each((i, ext) => {
        if (value.toLowerCase().endsWith(ext)) {
          result = true;
        }
      });
      return result;
    },

    wait(time) {
      return $.Deferred((dfd) => {
        setTimeout(dfd.resolve, time);
      });
    },
  };
  $.md.util = $.extend({}, $.md.util, publicMethods);

  if (typeof String.prototype.startsWith !== 'function') {
    // eslint-disable-next-line no-extend-native, func-names
    String.prototype.startsWith = function (str) {
      return this.slice(0, str.length) === str;
    };
  }
  if (typeof String.prototype.endsWith !== 'function') {
    // eslint-disable-next-line no-extend-native, func-names
    String.prototype.endsWith = function (str) {
      return this.slice(this.length - str.length, this.length) === str;
    };
  }

  $.fn.extend({
    toptext() {
      return this.clone()
        .children()
        .remove()
        .end()
        .text();
    },
  });

  // adds a :icontains selector to jQuery that is case insensitive
  $.expr[':'].icontains = $.expr.createPseudo((arg) => (elem) => ($(elem).toptext().toUpperCase().indexOf(arg.toUpperCase()) >= 0));

  $.md.util.getInpageAnchorText = (text) => {
    const subhash = text.replace(/ /g, '_');
    // TODO remove more unwanted characters like ?/,- etc.
    return subhash;
  };
  $.md.util.getInpageAnchorHref = (text, href = $.md.mainHref) => {
    const subhash = $.md.util.getInpageAnchorText(text);
    return `#!${href}#${subhash}`;
  };

  $.md.util.repeatUntil = (oInterval, oPredicate, oMaxRepeats = 10) => {
    const dfd = $.Deferred();
    function recursiveRepeat(interval, predicate, maxRepeats) {
      if (maxRepeats === 0) {
        dfd.reject();
        return;
      }
      if (predicate()) {
        dfd.resolve();
      } else {
        $.md.util.wait(interval).always(() => {
          recursiveRepeat(interval, predicate, maxRepeats - 1);
        });
      }
    }
    recursiveRepeat(oInterval, oPredicate, oMaxRepeats);
    return dfd;
  };

  // a count-down latch as in Java7.
  $.md.util.countDownLatch = (capacity, min = 0) => {
    const dfd = $.Deferred();
    if (capacity <= min) {
      dfd.resolve();
    }
    dfd.capacity = capacity;
    dfd.countDown = () => {
      dfd.capacity -= 1;
      if (dfd.capacity <= min) {
        dfd.resolve();
      }
    };
    return dfd;
  };
})();
