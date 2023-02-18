/**
 * gist.js
 */

(() => {
  const $ = window.jQuery;
  function gist($links, opt, href) {
    $().lazygist('init');
    return $links.each((i, link) => {
      const defaultOptions = {
        scheme: 'https',
        path: 'gist.github.com/',
      };
      const options = $.extend(defaultOptions, opt);
      const $link = $(link);
      const gistDiv = $(`<div class="gist_here" data-id="${href}" />`);
      $link.replaceWith(gistDiv);
      gistDiv.lazygist({
        // we dont want a specific file so modify the url template
        url_template: '{scheme}://{path}{id}.js'.replace(/\{scheme\}/g, options.scheme).replace(/\{path\}/g, options.path),
      });
    });
  }

  const gistGimmick = {
    name: 'gist',
    once() {
      $.md.linkGimmick(this, 'gist', gist);
    },
  };

  $.md.registerGimmick(gistGimmick);
})(window.jQuery);

/**
* Lazygist v0.2pre
*
* a jQuery plugin that will lazy load your gists.
*
* since jQuery 1.7.2
* https://github.com/tammo/jquery-lazy-gist
*
* Copyright, Tammo Pape
* http://tammopape.de
*
* Licensed under the MIT license.
*/

(() => {
  const $ = window.jQuery;
  //
  // note:
  // this plugin is not stateful
  // and will not communicate with own instances at different elements
  //
  const pluginName = 'lazygist';
  const version = '0.2pre';
  const defaults = {
    // adding the ?file parameter to choose a file
    url_template: 'https://gist.github.com/{id}.js?file={file}',

    // if these are strings, the attributes will be read from the element
    id: 'data-id',
    file: 'data-file',
  };
  let options;
  // will be replaced
  /* jshint -W060 */
  const originwrite = document.write;
  // stylesheet urls found in document.write calls
  // they are cached to write them once to the document,
  // not three times for three gists
  const stylesheets = [];
  // cache gist-ids to know which are already appended to the dom
  const idsDom = [];
  // remember gist-ids if their javascript is already loaded
  const idsAjax = [];

  /**
   * private special document.write function
   *
   * Filters the css file from github.com to add it to the head - once -
   *
   * It has a fallback to keep flexibility with other scripts as high as possible
   * (create a ticket if it messes things up!)
   *
   * Keep in mind, that a call to this function happens after
   * an ajax call by jQuery. One *cannot* know which gist-anchor
   * to use. You can only read the id from the content.
   */

  // eslint-disable-next-line no-underscore-dangle
  function _write(content, ...args) {
    let expression; // for regexp results
    let href; // from the url
    let id; // from the content

    if (content.indexOf('rel="stylesheet"') !== -1) {
      href = $(content).attr('href');

      // check if stylesheet is already inserted
      if ($.inArray(href, stylesheets) === -1) {
        $('head').append(content);
        stylesheets.push(href);
      }
    } else if (content.indexOf('id="gist') !== -1) {
      // This is the newer gist URL style, ignoring the hostname for GitHub EE instances
      expression = /https?:\/\/gist.*?\/.*\/(.*)#/.exec(content);
      if (expression == null) {
        // This will catch older versions of GitHub EE
        expression = /gist\/.+?\/([a-f0-9]+)\/raw/g.exec(content);
      }
      if (expression !== null) {
        [, id] = expression;
      }
      if (id !== undefined) {
        // test if id is already loaded
        if ($.inArray(id, idsDom) !== -1) {
          // just do nothin, if gist is already attached to the dom
          return;
        }

        idsDom.push(id);

        $(`.gist_here[data-id=${id}]`).append(content);
      }
    } else {
      // this is a fallback for interoperability
      originwrite.apply(document, [content, ...args]);
    }
  }

  const methods = {
    /**
     * Standard init function
     * No magic here
     */
    init(optionsInput) {
      // default options are default
      options = $.extend({}, defaults, optionsInput);

      // can be reset
      /* jshint -W061 */
      document.write = _write;

      $.each(options, (index, value) => {
        if (typeof value !== 'string') {
          throw new TypeError(`${value} (${typeof value}) is not a string`);
        }
      });

      return this.lazygist('load');
    },

    /**
     * Load the gists
     */
    load() {
      // (1) iterate over gist anchors
      // (2) append the gist-html through the new document.write func (see _write)
      // (1)
      return this.filter(`[${options.id}]`).each((j, _this) => {
        const id = $(_this).attr(options.id);
        const file = $(_this).attr(options.file);
        let src;

        if (id !== undefined) {
          if ($.inArray(id, idsAjax) !== -1) {
            // just do nothin, if gist is already ajaxed
            return;
          }

          idsAjax.push(id);

          src = options.url_template.replace(/\{id\}/g, id).replace(/\{file\}/g, file);

          // (2) this will trigger our _write function
          $.getScript(src, () => {
          });
        }
      });
    },

    /**
     * Just reset the write function
     */
    reset_write() {
      document.write = originwrite;

      return this;
    },
  };

  // method invocation - from jQuery.com
  // eslint-disable-next-line func-names
  $.fn[pluginName] = function (method, ...args) {
    if (methods[method]) {
      return methods[method].apply(this, args);
    }
    if (typeof method === 'object' || !method) {
      return methods.init.apply(this, [method, ...args]);
    }
    return $.error(`Method ${method} does not exist on jQuery.lazygist`);
  };

  // expose version for your interest
  $.fn[pluginName].version = version;
})();
