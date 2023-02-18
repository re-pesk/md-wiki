/**
 * disqus.js
 */

(() => {
  const $ = window.jQuery;

  let alreadyDone = false;
  const disqus = ($links, opt /* , text */) => {
    const defaultOptions = {
      identifier: '',
    };
    /* var options = */ $.extend(defaultOptions, opt);
    const disqusDiv = $('<div id="disqus_thread" class="md-external md-external-noheight md-external-nowidth" ><a href="https://disqus.com" class="dsq-brlink">comments powered by <span class="logo-disqus">Disqus</span></a></div>');
    disqusDiv.css('margin-top', '2em');
    return $links.each((i, link) => {
      if (alreadyDone === true) {
        return;
      }
      alreadyDone = true;

      const $link = $(link);
      const disqusShortname = $link.attr('href');

      if (disqusShortname !== undefined && disqusShortname.length > 0) {
        // insert the div
        $link.remove();
        // since disqus need lot of height, always but it on the bottom of the page
        $('#md-content').append(disqusDiv);
        if ($('#disqus_thread').length > 0) {
          (() => {
            // all disqus_ variables are used by the script, they
            // change the config behavious.
            // see: http://help.disqus.com/customer/portal/articles/472098-javascript-configuration-variables
            // set to 1 if developing, or the site is password protected or not
            // publicaly accessible
            // var disqus_developer = 1;
            // by default, disqus will use the current url to determine a thread
            // since we might have different parameters present, we remove them
            // disqus_* vars HAVE TO BE IN GLOBAL SCOPE
            // var disqus_url = window.location.href;
            // var disqus_identifier;
            // if (options.identifier.length > 0) {
            //   disqus_identifier = options.identifier;
            // } else {
            //   disqus_identifier = disqus_url;
            // }
            // dynamically load the disqus script
            const dsq = document.createElement('script');
            dsq.type = 'text/javascript';
            dsq.async = true;
            dsq.src = `https://${disqusShortname}.disqus.com/embed.js`;
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
          })();
        }
      }
    });
  };

  const disqusGimmick = {
    name: 'disqus',
    version: $.md.version,
    once() {
      $.md.linkGimmick(this, 'disqus', disqus);
    },
  };

  $.md.registerGimmick(disqusGimmick);
})(window.jQuery);
