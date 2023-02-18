/**
 * yuml.js
 */

/* # YUML GIMMICK
 *
 * Create diagrams in no time with [yUML][yUML].
 *
 * ## Usage
 *
 *  [gimmick:yuml]( [HttpContext]uses -.->[Response] )
 *
 *  [gimmick:yuml (style: 'scruffy', dir: 'TB') ]( [Customer]->[Billing Address] )
 *
 *  [gimmick:yuml (diag: 'activity', style: 'plain') ]( `Make Coffee´->`want more coffee´ )
 *
 *  [gimmick:yuml (diag: 'usecase', scale: 200) ]( [Customer]-`Sign In´, [Customer]-`Buy Products´ )
 *
 * ## Options
 *
 *  * **diag**: `class`, `activity`, `usecase`
 *  * **style**: `plain`, `scruffy`
 *  * **dir**: `LR`, `TB`, `RL`
 *  * **scale**: number (original size: 100)
 *
 * ## Author
 *
 * Copyright 2014 Guillermo Calvo
 *
 * <https://github.com/guillermocalvo/>
 *
 * ## License
 *
 * Licensed under the [GNU Lesser General Public License][LGPL].
 *
 * [yUML]: http://www.yuml.me/
 * [LGPL]: http://www.gnu.org/copyleft/lesser.html
 */

(() => {
  const $ = window.jQuery;
  function yuml($link, opt /* , text */) {
    const defaultOptions = {
      type: 'class',
      style: 'plain',
      direction: 'LR',
      scale: '100',
    };
    const options = $.extend({}, defaultOptions, opt);

    return $link.each((i, e) => {
      const $this = $(e);
      let url = 'https://yuml.me/diagram/';
      let data = $this.attr('href');
      let title = $this.attr('title');

      title = (title || '');

      /* `FOOBAR´ => (FOOBAR) */
      data = data.replace(/`/g, '(').replace(/´/g, ')');

      url += `${options.style};dir:${options.direction};scale:${options.scale}/${options.type}/${data}`;

      const $img = $(`<img src="${url}" title="${title}" alt="${title}">`);

      $this.replaceWith($img);
    });
  }
  const yumlGimmick = {
    name: 'yuml',
    version: $.md.version,
    once() {
      $.md.linkGimmick(this, 'yuml', yuml);
      $.md.registerScript(this, '', {
        license: 'LGPL',
        loadstage: 'postgimmick',
        finishstage: 'all_ready',
      });
    },
  };

  $.md.registerGimmick(yumlGimmick);
})();
