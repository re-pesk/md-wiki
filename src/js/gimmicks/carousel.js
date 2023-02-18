/**
 * carousel.js
 */

(() => {
  const $ = window.jQuery;

  function carousel($link, opt, href) {
    const $c = $('<div id="myCarousel" class="carousel slide"></div>');
    const $d = $('<div class="carousel-inner"/>');
    $c.append('<ol class="carousel-indicators" />');

    const imageUrls = [];
    // var i = 0;
    $.each(href.split(','), (i, e) => {
      imageUrls.push($.trim(e));
      $c.find('ol').append(`<li data-target="#myCarousel" data-slide-to="${i}" class="active" /`);
      let div;
      if (i === 0) {
        div = ('<div class="active item"/>');
      } else {
        div = ('<div class="item"/>');
      }
      $d.append($(div).append(`<img src="${e}"/>`));
    });
    $c.append($d);
    $c.append('<a class="carousel-control left" href="#myCarousel" data-slide="prev">&lsaquo;</a>');
    $c.append('<a class="carousel-control right" href="#myCarousel" data-slide="next">&rsaquo;</a>');
    $link.replaceWith($c);
  }

  const themeChooserGimmick = {
    name: 'Themes',
    version: $.md.version,
    once() {
      $.md.linkGimmick(this, 'carousel', carousel);
    },
  };

  $.md.registerGimmick(themeChooserGimmick);
})();
