/**
 * facebooklike.js
 */

(() => {
  const $ = window.jQuery;

  const language = window.navigator.userLanguage || window.navigator.language;
  const code = `${language}_${language.toUpperCase()}`;
  const fbRootDiv = $('<div id="fb-root" />');
  const fbScriptHref = $.md.prepareLink(`connect.facebook.net/${code}/all.js#xfbml=1`);
  const fbscript = `(function(d, s, id) { var js, fjs = d.getElementsByTagName(s)[0]; if (d.getElementById(id)) return; js = d.createElement(s); js.id = id; js.src = "${fbScriptHref}"; fjs.parentNode.insertBefore(js, fjs);}(document, "script", "facebook-jssdk"));`;

  function facebooklike($link, opt /* , text */) {
    const defaultOptions = {
      layout: 'standard',
      showfaces: true,
    };
    const options = $.extend({}, defaultOptions, opt);
    // Due to a bug, we can have underscores _ in a markdown link
    // so we insert the underscores needed by facebook here
    if (options.layout === 'boxcount') {
      options.layout = 'box_count';
    }
    if (options.layout === 'buttoncount') {
      options.layout = 'button_count';
    }

    return $link.each((i, e) => {
      const $this = $(e);
      const href = $this.attr('href');
      $('body').append(fbRootDiv);

      const $fbDiv = $('<div class="fb-like" data-send="false" data-width="450"></div>');
      $fbDiv.attr('data-href', href);
      $fbDiv.attr('data-layout', options.layout);
      $fbDiv.attr('data-show-faces', options.showfaces);

      $this.replaceWith($fbDiv);
    });
  }

  const facebookLikeGimmick = {
    name: 'FacebookLike',
    version: $.md.version,
    once() {
      $.md.linkGimmick(this, 'facebooklike', facebooklike);
      $.md.registerScript(this, fbscript, {
        license: 'APACHE2',
        loadstage: 'postgimmick',
        finishstage: 'all_ready',
      });
    },
  };

  $.md.registerGimmick(facebookLikeGimmick);
})();
