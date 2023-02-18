/**
 * colorbox.js
 */

(() => {
  const $ = window.jQuery;

  // makes trouble, find out why
  const colorboxGimmick = {
    name: 'colorbox',
    load() {
      $.md.stage('gimmick').subscribe((done) => {
        $.gimmicks('colorbox');
        done();
      });
    },
  };
  $.md.registerGimmick(colorboxGimmick);

  const methods = {
    // takes a standard <img> tag and adds a hyperlink to the image source
    // needed since we scale down images via css and want them to be accessible
    // in original format
    colorbox() {
      let $imageGroups;
      if (!(this instanceof window.jQuery)) {
        // select the image groups of the page
        $imageGroups = $('.md-image-group');
      } else {
        $imageGroups = $(this);
      }
      // operate on md-image-group, which holds one
      // or more images that are to be colorbox'ed
      let counter = 0;
      return $imageGroups.each((i, _this) => {
        const $this = $(_this);

        // each group requires a unique name
        const galGroup = `gallery-group-${counter += 1}`;

        // create a hyperlink around the image
        $this.find('a.md-image-selfref img')
          // filter out images that already are a hyperlink
          // (so won't be part of the gallery)
          // apply colorbox on their parent anchors
          .parents('a').colorbox({
            rel: galGroup,
            opacity: 0.75,
            slideshow: true,
            maxWidth: '95%',
            maxHeight: '95%',
            scalePhotos: true,
            photo: true,
            slideshowAuto: false,
          });
      });
    },
  };

  $.gimmicks.methods = $.extend({}, $.fn.gimmicks.methods, methods);
})();
