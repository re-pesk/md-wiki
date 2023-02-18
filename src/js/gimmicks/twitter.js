/**
 * twitter.js
 */

(() => {
  const $ = window.jQuery;
  // no license information given in the widget.js -> OTHER
  const widgetHref = $.md.prepareLink('platform.twitter.com/widgets.js');
  const twitterscript = `!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="${widgetHref}";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");`;

  const twitterfollow = ($links /* , opt, text */) => $links.each((i, link) => {
    const $link = $(link);
    let user;
    let href = $link.attr('href');
    if (href.indexOf('twitter.com') <= 0) {
      user = $link.attr('href');
      href = $.md.prepareLink(`twitter.com/${user}`);
    } else {
      return;
    }
    // remove the leading @ if given
    if (user[0] === '@') {
      user = user.substring(1);
    }
    const twitterSrc = $(`<a href="${href}" class="twitter-follow-button" data-show-count="false" data-lang="en" data-show-screen-name="false">@${user}</a>`);
    $link.replaceWith(twitterSrc);
  });

  const twitterGimmick = {
    name: 'TwitterGimmick',
    version: $.md.version,
    once() {
      $.md.linkGimmick(this, 'twitterfollow', twitterfollow);

      $.md.registerScript(this, twitterscript, {
        license: 'EXCEPTION',
        loadstage: 'postgimmick',
        finishstage: 'all_ready',
      });
    },
  };
  $.md.registerGimmick(twitterGimmick);
})();
