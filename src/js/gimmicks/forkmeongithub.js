/**
 * forkmeongithub.js
 */

(() => {
  const $ = window.jQuery;

  function forkmeongithub($links, opt /* , text */) {
    return $links.each((i, link) => {
      const $link = $(link);
      // default options
      const defaultOptions = {
        color: 'red',
        position: 'right',
      };
      const options = $.extend({}, defaultOptions, opt);
      const { color, position } = options;

      // the filename for the ribbon
      // see: https://github.com/blog/273-github-ribbons
      let baseHref = 'https://s3.amazonaws.com/github/ribbons/forkme_';

      if (color === 'red') {
        baseHref += `${position}_red_aa0000.png`;
      }
      if (color === 'green') {
        baseHref += `${position}_green_007200.png`;
      }
      if (color === 'darkblue') {
        baseHref += `${position}_darkblue_121621.png`;
      }
      if (color === 'orange') {
        baseHref += `${position}_orange_ff7600.png`;
      }
      if (color === 'white') {
        baseHref += `${position}_white_ffffff.png`;
      }
      if (color === 'gray') {
        baseHref += `${position}_gray_6d6d6d.png`;
      }

      const href = $link.attr('href');
      // var bodyPosTop = $('#md-body').offset ().top;
      const bodyPosTop = 0;
      const githubLink = $(`<a class="forkmeongithub" href="${href}"><img style="position: absolute; top: ${bodyPosTop};${position}: 0; border: 0;" src="${baseHref}" alt="Fork me on GitHub"></a>`);
      // to avoid interfering with other div / scripts,
      // we remove the link and prepend it to the body
      // the fork me ribbon is positioned absolute anyways
      $('body').prepend(githubLink);
      githubLink.find('img').css('z-index', '2000');
      $link.remove();
    });
  }

  const forkmeongithubGimmick = {
    name: 'forkmeongithub',
    version: $.md.version,
    once() {
      $.md.linkGimmick(this, 'forkmeongithub', forkmeongithub);
    },
  };

  $.md.registerGimmick(forkmeongithubGimmick);
})();
