/**
 * youtube_embed.js
 */

(() => {
  const $ = window.jQuery;
  function youtubeLinkToIframe() {
    const $youtubeLinks = $('a[href*=youtube\\.com]:empty, a[href*=youtu\\.be]:empty');

    $youtubeLinks.each((i, _this) => {
      const $this = $(_this);
      const href = $this.attr('href');
      if (href !== undefined) {
        // extract the v parameter from youtube
        const exp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;
        const m = href.match(exp);

        if (m && m[1].length === 11) {
          // insert the iframe
          const shortHandle = m[1];
          const frame = $('<iframe class="md-external" frameborder="0" allowfullscreen></iframe>');
          frame.attr('src', `//youtube.com/embed/${shortHandle}`);
          // remove the a tag
          $this.replaceWith(frame);
        }
      }
    });
  }

  const youtubeGimmick = {
    name: 'youtube',
    load() {
      $.md.stage('gimmick').subscribe((done) => {
        youtubeLinkToIframe();
        done();
      });
    },
  };

  $.md.registerGimmick(youtubeGimmick);
})();
