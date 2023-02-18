/**
 * iframe.js
 */

(() => {
  const $ = window.jQuery;
  function createIframe($links, opt /* , text */) {
    return $links.each((i, link) => {
      const $link = $(link);
      const href = $link.attr('href');
      const $iframe = $('<iframe class="col-md-12" style="border: 0px solid red; height: 650px;"></iframe>');
      $iframe.attr('src', href);
      $link.replaceWith($iframe);

      if (opt.width) {
        $iframe.css('width', opt.width);
      }
      if (opt.height) {
        $iframe.css('height', opt.height);
      } else {
        const updateSizeFn = () => {
          const offset = $iframe.offset();
          const winHeight = $(window).height();
          const newHeight = winHeight - offset.top - 5;
          $iframe.height(newHeight);
        };

        $iframe.on('load', (/* done */) => {
          updateSizeFn();
        });

        $(window).on('resize', () => {
          updateSizeFn();
        });
      }
    });
  }

  const iframeGimmick = {
    name: 'iframe',
    version: $.md.version,
    once() {
      $.md.linkGimmick(this, 'iframe', createIframe);
    },
  };

  $.md.registerGimmick(iframeGimmick);
})();
