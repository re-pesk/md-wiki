/**
 * main.js
 */

(() => {
  const $ = window.jQuery;
  const { marked } = window;
  const log = $.md.getLogger();

  function init() {
    $.md.stages = [
      $.Stage('init'),

      // loads config, initial markdown and navigation
      $.Stage('load'),

      // will transform the markdown to html
      $.Stage('transform'),

      // HTML transformation finished
      $.Stage('ready'),

      // after we have a polished html skeleton
      $.Stage('skel_ready'),

      // will bootstrapify the skeleton
      $.Stage('bootstrap'),

      // before we run any gimmicks
      $.Stage('pregimmick'),

      // after we have bootstrapified the skeleton
      $.Stage('gimmick'),

      // postprocess
      $.Stage('postgimmick'),

      $.Stage('all_ready'),

      // used for integration tests, not intended to use in MDwiki itself
      $.Stage('final_tests'),
    ];

    $.md.stage = (name) => {
      const m = $.grep($.md.stages, (e /* , i */) => (e.name === name));
      if (m.length === 0) {
        $.error(`A stage by name ${name}  does not exist`);
      }
      return m[0];
    };
  }
  init();

  function resetStages() {
    const oldStages = $.md.stages;
    $.md.stages = [];
    $(oldStages).each((i, e) => {
      $.md.stages.push($.Stage(e.name));
    });
  }

  const publicMethods = {};
  $.md.publicMethods = $.extend({}, $.md.publicMethods, publicMethods);

  function transformMarkdown(markdown) {
    const options = {
      gfm: true,
      tables: true,
      breaks: true,
    };
    if ($.md.config.lineBreaks === 'original') {
      options.breaks = false;
    } else if ($.md.config.lineBreaks === 'gfm') {
      options.breaks = true;
    }

    marked.setOptions(options);

    // get sample markdown
    const uglyHtml = marked(markdown);
    return uglyHtml;
  }

  // load [include](/foo/bar.md) external links
  function loadExternalIncludes(parentDfd) {
    function findExternalIncludes() {
      return $('a').filter((i, _this) => {
        const href = $(_this).attr('href');
        const text = $(_this).toptext();
        const isMarkdown = $.md.util.hasMarkdownFileExtension(href);
        const isInclude = text === 'include';
        const isPreview = text.startsWith('preview:');
        return (isInclude || isPreview) && isMarkdown;
      });
    }

    function selectPreviewElements($jqcol, numElements) {
      function isTextNode(node) {
        return node.nodeType === 3;
      }
      let count = 0;
      const elements = [];
      $jqcol.each((i, e) => {
        if (count < numElements) {
          elements.push(e);
          if (!isTextNode(e)) {
            count += 1;
          }
        }
      });
      return $(elements);
    }

    const externalLinks = findExternalIncludes();
    // continue execution when all external resources are fully loaded
    const latch = $.md.util.countDownLatch(externalLinks.length);
    latch.always(() => {
      parentDfd.resolve();
    });

    externalLinks.each((i, e) => {
      const $el = $(e);
      const href = $el.attr('href');
      const text = $el.toptext();

      $.ajax({
        url: href,
        dataType: 'text',
      })
        .done((data) => {
          const $html = $(transformMarkdown(data));
          if (text.startsWith('preview:')) {
            // only insert the selected number of paragraphs; default 3
            const numPreviewElements = parseInt(text.substring(8), 10) || 3;
            const $preview = selectPreviewElements($html, numPreviewElements);
            $preview.last().append(`<a href="${href}"> ...read more &#10140;</a>`);
            $preview.insertBefore($el.parent('p').eq(0));
            $el.remove();
          } else {
            $html.insertAfter($el.parents('p'));
            $el.remove();
          }
        }).always(() => {
          latch.countDown();
        });
    });
  }

  function registerFetchMarkdown() {
    let md = '';

    $.md.stage('init').subscribe((done) => {
      const ajaxReq = {
        url: $.md.mainHref,
        dataType: 'text',
      };

      // Request the md page
      $.ajax(ajaxReq)
        .done((data) => {
          md = data;
          done();
        })

        // Failed to find the md page we were looking for
        .fail(() => {
          // Warn that this page wasn't found
          log.warn(`Could not get ${$.md.mainHref}`);

          // Attempt to gracefully recover by displaying a user defined 404 page
          ajaxReq.url = '404.md';
          $.ajax(ajaxReq).done((data) => {
            md = data;
            done();
          })

            // The user has not defined a 404.md.
            .fail((/* data */) => {
              log.fatal('Could not get a user defined 404.md');

              // Our last attempt to provide a good user expierence by proving a hard coded
              // 'page not found' text.
              md = '# Page Not Found';

              done();
            });
        });
    });

    // find baseUrl
    $.md.stage('transform').subscribe((done) => {
      const len = $.md.mainHref.lastIndexOf('/');
      const baseUrl = $.md.mainHref.substring(0, len + 1);
      $.md.baseUrl = baseUrl;
      done();
    });

    $.md.stage('transform').subscribe((done) => {
      const uglyHtml = transformMarkdown(md);
      $('#md-content').html(uglyHtml);
      md = '';
      const dfd = $.Deferred();
      loadExternalIncludes(dfd);
      dfd.always(() => {
        done();
      });
    });
  }

  function isSpecialLink(href) {
    if (!href) { return false; }

    if (href.lastIndexOf('data:') >= 0) { return true; }

    if (href.startsWith('mailto:')) { return true; }

    if (href.startsWith('file:')) { return true; }

    if (href.startsWith('ftp:')) { return true; }

    return false;

    // TODO capture more special links: every non-http link with : like
    // torrent:// etc.
  }

  // modify internal links so we load them through our engine
  function processPageLinks(domElement, baseUrl = '') {
    const html = $(domElement);

    // HACK against marked: empty links will have empy href attribute
    // we remove the href attribute from the a tag
    html.find('a').not('#md-menu a').each((i, _this) => {
      const $this = $(_this);
      const attr = $this.attr('href');
      if (!attr || attr.length === 0) { $this.removeAttr('href'); }
    });

    html.find('a, img').each((i, e) => {
      const link = $(e);
      // link must be jquery collection
      let isImage = false;
      let hrefAttribute = 'href';

      if (!link.attr(hrefAttribute)) {
        isImage = true;
        hrefAttribute = 'src';
      }
      const href = link.attr(hrefAttribute);

      if (href && href.lastIndexOf('#!') >= 0) { return; }

      if (isSpecialLink(href)) { return; }

      if (!isImage && href.startsWith('#') && !href.startsWith('#!')) {
        // in-page link
        link.click((ev) => {
          ev.preventDefault();
          $.md.scrollToInPageAnchor(href);
        });
      }

      if (!$.md.util.isRelativeUrl(href)) { return; }

      if (isImage && !$.md.util.isRelativePath(href)) { return; }

      if (!isImage && $.md.util.isGimmickLink(link)) { return; }

      function buildLink(url) {
        if ($.md.util.hasMarkdownFileExtension(url)) return `#!${url}`;

        return url;
      }

      const newHref = baseUrl + href;
      if (isImage) {
        link.attr(hrefAttribute, newHref);
      } else if ($.md.util.isRelativePath(href)) {
        link.attr(hrefAttribute, buildLink(newHref));
      } else {
        link.attr(hrefAttribute, buildLink(href));
      }
    });
  }

  let navMD = '';
  $.md.NavigationDfd = $.Deferred();
  const ajaxReq = {
    url: 'navigation.md',
    dataType: 'text',
  };
  $.ajax(ajaxReq).done((data) => {
    navMD = data;
    $.md.NavigationDfd.resolve();
  }).fail(() => {
    $.md.NavigationDfd.reject();
  });

  function registerBuildNavigation() {
    $.md.stage('init').subscribe((done) => {
      $.md.NavigationDfd.done(() => {
        done();
      })
        .fail(() => {
          done();
        });
    });

    $.md.stage('transform').subscribe((done) => {
      if (navMD === '') {
        log.info('no navgiation.md found, not using a navbar');
        done();
        return;
      }

      const navHtml = marked(navMD);
      // TODO why are <script> tags from navHtml APPENDED to the jqcol?
      const $h = $(`<div>${navHtml}</div>`);

      // insert <scripts> from navigation.md into the DOM
      $h.each((i, e) => {
        if (e.tagName === 'SCRIPT') {
          $('script').first().before(e);
        }
      });

      // TODO .html() is evil!!!
      const $navContent = $h.eq(0);
      $navContent.find('p').each((i, e) => {
        const $el = $(e);
        $el.replaceWith($el.html());
      });
      $('#md-menu').append($navContent.html());
      done();
    });

    $.md.stage('bootstrap').subscribe((done) => {
      processPageLinks($('#md-menu'));
      done();
    });

    $.md.stage('postgimmick').subscribe((done) => {
      const numLinks = $('#md-menu a').length;
      const hasHeader = $('#md-menu .navbar-brand').eq(0).toptext().trim().length > 0;
      if (!hasHeader && numLinks <= 1) { $('#md-menu').hide(); }

      done();
    });
  }

  $.md.ConfigDfd = $.Deferred();
  $.ajax({ url: 'config.json', dataType: 'text' }).done((data) => {
    try {
      const dataJson = JSON.parse(data);
      $.md.config = $.extend($.md.config, dataJson);
      log.info('Found a valid config.json file, using configuration');
    } catch (err) {
      log.error(`config.json was not JSON parsable: ${err}`);
    }
    $.md.ConfigDfd.resolve();
  }).fail((err, textStatus) => {
    log.error(`unable to retrieve config.json: ${textStatus}`);
    $.md.ConfigDfd.reject();
  });
  function registerFetchConfig() {
    $.md.stage('init').subscribe((done) => {
      // TODO 404 won't get cached, requesting it every reload is not good
      // maybe use cookies? or disable re-loading of the page
      // $.ajax('config.json').done(function(data){
      $.md.ConfigDfd.done(() => {
        done();
      }).fail(() => {
        log.info('No config.json found, using default settings');
        done();
      });
    });
  }

  function registerClearContent() {
    $.md.stage('init').subscribe((done) => {
      $('#md-all').empty();
      const skel = '<div id="md-body"><div id="md-title"></div><div id="md-menu">'
        + '</div><div id="md-content"></div></div>';
      $('#md-all').prepend($(skel));
      done();
    });
  }

  function runStages() {
    // wire the stages up
    $.md.stage('init').done(() => {
      $.md.stage('load').run();
    });
    $.md.stage('load').done(() => {
      $.md.stage('transform').run();
    });
    $.md.stage('transform').done(() => {
      $.md.stage('ready').run();
    });
    $.md.stage('ready').done(() => {
      $.md.stage('skel_ready').run();
    });
    $.md.stage('skel_ready').done(() => {
      $.md.stage('bootstrap').run();
    });
    $.md.stage('bootstrap').done(() => {
      $.md.stage('pregimmick').run();
    });
    $.md.stage('pregimmick').done(() => {
      $.md.stage('gimmick').run();
    });
    $.md.stage('gimmick').done(() => {
      $.md.stage('postgimmick').run();
    });
    $.md.stage('postgimmick').done(() => {
      $.md.stage('all_ready').run();
    });
    $.md.stage('all_ready').done(() => {
      $('html').removeClass('md-hidden-load');

      // phantomjs hook when we are done
      if (typeof window.callPhantom === 'function') {
        window.callPhantom({});
      }

      $.md.stage('final_tests').run();
    });
    $.md.stage('final_tests').done(() => {
      // reset the stages for next iteration
      resetStages();

      // required by dalekjs so we can wait the element to appear
      $('body').append('<span id="start-tests"></span>');
      $('#start-tests').hide();
    });

    // trigger the whole process by runing the init stage
    $.md.stage('init').run();
  }

  function loadContent(hrefArg) {
    let href = hrefArg;
    if (href.startsWith('/')) {
      // prevent cross-domain inclusions to prevent possible XSS
      href = `/./${href}`;
    } else {
      href = `./${href}`;
    }
    $.md.mainHref = href;

    registerFetchMarkdown();
    registerClearContent();

    // find out which link gimmicks we need
    $.md.stage('ready').subscribe((done) => {
      $.md.initializeGimmicks();
      $.md.registerLinkGimmicks();
      done();
    });

    // wire up the load method of the modules
    $.each($.md.gimmicks, (i, module) => {
      if (module.load === undefined) {
        return;
      }
      $.md.stage('load').subscribe((done) => {
        module.load();
        done();
      });
    });

    $.md.stage('ready').subscribe((done) => {
      $.md('createBasicSkeleton');
      done();
    });

    $.md.stage('bootstrap').subscribe((done) => {
      $.mdbootstrap('bootstrapify');
      processPageLinks($('#md-content'), $.md.baseUrl);
      done();
    });
    runStages();
  }

  function extractHashData() {
    // first char is the # or #!
    let href;
    if (window.location.hash.startsWith('#!')) {
      href = window.location.hash.substring(2);
    } else {
      href = window.location.hash.substring(1);
    }
    href = decodeURIComponent(href);

    // extract possible in-page anchor
    const exPos = href.indexOf('#');
    if (exPos !== -1) {
      $.md.inPageAnchor = href.substring(exPos + 1);
      $.md.mainHref = href.substring(0, exPos);
    } else {
      $.md.mainHref = href;
    }
  }

  function appendDefaultFilenameToHash() {
    let newHashString = '';
    const currentHashString = window.location.hash || '';
    if (currentHashString === ''
      || currentHashString === '#'
      || currentHashString === '#!') {
      newHashString = '#!index.md';
    } else if (currentHashString.startsWith('#!')
      && currentHashString.endsWith('/')) {
      newHashString = `${currentHashString}index.md`;
    }
    if (newHashString) { window.location.hash = newHashString; }
  }

  $(document).ready(() => {
    // stage init stuff
    registerFetchConfig();
    registerBuildNavigation();
    extractHashData();

    appendDefaultFilenameToHash();

    $(window).bind('hashchange', () => {
      window.location.reload(false);
    });

    loadContent($.md.mainHref);
  });
})();
