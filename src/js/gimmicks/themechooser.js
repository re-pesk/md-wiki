/**
 * themechooser.js
 */

(() => {
  const $ = window.jQuery;

  const themes = [
    { name: 'bootstrap', url: 'cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css' },
    { name: 'cerulean', url: 'cdn.jsdelivr.net/npm/bootswatch@3.4.1/cerulean/bootstrap.min.css' },
    { name: 'cosmo', url: 'cdn.jsdelivr.net/npm/bootswatch@3.4.1/cosmo/bootstrap.min.css' },
    { name: 'cyborg', url: 'cdn.jsdelivr.net/npm/bootswatch@3.4.1/cyborg/bootstrap.min.css' },
    { name: 'flatly', url: 'cdn.jsdelivr.net/npm/bootswatch@3.4.1/flatly/bootstrap.min.css' },
    { name: 'journal', url: 'cdn.jsdelivr.net/npm/bootswatch@3.4.1/journal/bootstrap.min.css' },
    { name: 'lumen', url: 'cdn.jsdelivr.net/npm/bootswatch@3.4.1/lumen/bootstrap.min.css' },
    { name: 'readable', url: 'cdn.jsdelivr.net/npm/bootswatch@3.4.1/readable/bootstrap.min.css' },
    { name: 'simplex', url: 'cdn.jsdelivr.net/npm/bootswatch@3.4.1/simplex/bootstrap.min.css' },
    { name: 'slate', url: 'cdn.jsdelivr.net/npm/bootswatch@3.4.1/slate/bootstrap.min.css' },
    { name: 'spacelab', url: 'cdn.jsdelivr.net/npm/bootswatch@3.4.1/spacelab/bootstrap.min.css' },
    { name: 'united', url: 'cdn.jsdelivr.net/npm/bootswatch@3.4.1/united/bootstrap.min.css' },
    { name: 'yeti', url: 'cdn.jsdelivr.net/npm/bootswatch@3.4.1/yeti/bootstrap.min.css' },
  ];

  let useChooser = false;
  const log = $.md.getLogger();

  const setTheme = (themeArg) => {
    let theme = themeArg;
    theme.inverse = theme.inverse || false;

    if (theme.url === undefined) {
      if (!theme.name) {
        log.error('Theme name must be given!');
        return;
      }
      const savedTheme = themes.filter((t) => t.name === theme.name)[0];
      if (!savedTheme) {
        // eslint-disable-next-line no-restricted-globals
        log.error(`Theme ${name} not found, removing link`);
        return;
      }
      theme = $.extend(theme, savedTheme);
    }

    $('link[rel=stylesheet][href*="netdna.bootstrapcdn.com"]')
      .remove();

    // slim instance has no bootstrap hardcoded in
    const hasDefaultBootstrapCss = $('style[id*=bootstrap]').length > 0;

    if (theme.name !== 'bootstrap' || !hasDefaultBootstrapCss) {
      // in devel & fat version the style is inlined, remove it
      $('style[id*=bootstrap]').remove();

      $('<link rel="stylesheet" type="text/css">')
        .attr('href', $.md.prepareLink(theme.url))
        .appendTo('head');
    }

    if (theme.inverse === true) {
      $('#md-main-navbar').removeClass('navbar-default');
      $('#md-main-navbar').addClass('navbar-inverse');
    } else {
      $('#md-main-navbar').addClass('navbar-default');
      $('#md-main-navbar').removeClass('navbar-inverse');
    }
  };

  const applyTheme = ($links, optArg, text) => {
    const opt = optArg;
    opt.name = opt.name || text;
    $links.each((/* i, link */) => {
      $.md.stage('postgimmick').subscribe((done) => {
        // var $link = $(link);
        // only set a theme if no theme from the chooser is selected,
        // or if the chooser isn't enabled
        if (window.localStorage.theme === undefined || !useChooser) {
          setTheme(opt);
        }

        done();
      });
    });
    $links.remove();
  };

  const restoreTheme = (optArg) => {
    let opt = optArg;
    if (window.localStorage.theme) {
      opt = $.extend({ name: window.localStorage.theme }, opt);
      setTheme(opt);
    }
  };

  const themechooser = ($links, opt, text) => {
    useChooser = true;
    $.md.stage('bootstrap').subscribe((done) => {
      restoreTheme(opt);
      done();
    });

    return $links.each((i, e) => {
      const $this = $(e);
      const $chooser = $('<a href=""></a><ul></ul>');
      $chooser.eq(0).text(text);

      $.each(themes, (_i, theme) => {
        const $li = $('<li></li>');
        $chooser.eq(1).append($li);
        /* var $a = */ $('<a/>')
          .text(theme.name)
          .attr('href', '')
          .click((ev) => {
            ev.preventDefault();
            window.localStorage.theme = theme.name;
            window.location.reload();
          })
          .appendTo($li);
      });

      $chooser.eq(1).append('<li class="divider" />');
      const $li = $('<li/>');
      const $aUseDefault = $('<a>Use default</a>');
      $aUseDefault.click((ev) => {
        ev.preventDefault();
        window.localStorage.removeItem('theme');
        window.location.reload();
      });
      $li.append($aUseDefault);
      $chooser.eq(1).append($li);

      $chooser.eq(1).append('<li class="divider" />');
      $chooser.eq(1).append('<li><a href="http://www.bootswatch.com">Powered by Bootswatch</a></li>');
      $this.replaceWith($chooser);
    });
  };

  const themeChooserGimmick = {
    name: 'Themes',
    version: $.md.version,
    once() {
      $.md.linkGimmick(this, 'themechooser', themechooser, 'skel_ready');
      $.md.linkGimmick(this, 'theme', applyTheme);
    },
  };
  $.md.registerGimmick(themeChooserGimmick);
})();
