/**
 * basic_skeleton.js
 */

(() => {
  const $ = window.jQuery;

  // set the page title to the browser document title, optionally picking
  // the first h1 element as title if no title is given
  function setPageTitle() {
    if ($.md.config.title) {
      $('title').text($.md.config.title);
    }

    const $pageTitle = $('#md-content h1').eq(0);
    if ($.trim($pageTitle.toptext()).length > 0) {
      $('#md-title').prepend($pageTitle);
      // var title = $pageTitle.toptext();
      // document.title = title;
    } else {
      $('#md-title').remove();
    }
  }

  function getFloatClass(par) {
    const $p = $(par);
    let floatClass = '';

    // reduce content of the paragraph to images
    const nonTextContents = $p.contents().filter((i, _this) => {
      if (_this.tagName === 'IMG' || _this.tagName === 'IFRAME') {
        return true;
      }
      if (_this.tagName === 'A') {
        return $(_this).find('img').length > 0;
      }

      return $.trim($(_this).text()).length > 0;
    });
    // check the first element - if its an image or a link with image, we go left
    const elem = nonTextContents[0];
    if (elem !== undefined && elem !== null) {
      if (elem.tagName === 'IMG' || elem.tagName === 'IFRAME') {
        floatClass = 'md-float-left';
      } else if (elem.tagName === 'A' && $(elem).find('img').length > 0) {
        floatClass = 'md-float-left';
      } else {
        floatClass = 'md-float-right';
      }
    }
    return floatClass;
  }

  function wrapParagraphText() {
    // TODO is this true for marked.js?
    // markdown gives us sometime paragraph that contain child tags (like img),
    // but the containing text is not wrapped. Make sure to wrap the text in the
    // paragraph into a <div>
    // this also moves ANY child tags to the front of the paragraph!
    $('#md-content p').each((i, _this) => {
      const $p = $(_this);
      // nothing to do for paragraphs without text
      if ($.trim($p.text()).length === 0) {
        // make sure no whitespace are in the p and then exit
        // $p.text ('');
        return;
      }
      // children elements of the p
      const children = $p.contents().filter((_i, __this) => {
        const $child = $(__this);
        // we extract images and hyperlinks with images out of the paragraph
        if (__this.tagName === 'A' && $child.find('img').length > 0) {
          return true;
        }
        if (__this.tagName === 'IMG') {
          return true;
        }
        // else
        return false;
      });
      const floatClass = getFloatClass($p);
      $p.wrapInner('<div class="md-text" />');

      // if there are no children, we are done
      if (children.length === 0) {
        return;
      }
      // move the children out of the wrapped div into the original p
      children.prependTo($p);

      // at this point, we now have a paragraph that holds text AND images
      // we mark that paragraph to be a floating environment
      // TODO determine floatenv left/right
      $p.addClass('md-floatenv').addClass(floatClass);
    });
  }
  function removeBreaks() {
    // since we use non-markdown-standard line wrapping, we get lots of
    // <br> elements we don't want.
    // remove a leading <br> from floatclasses, that happen to
    // get insertet after an image
    $('.md-floatenv').find('.md-text').each((j, _this) => {
      const $first = $(_this).find('*').eq(0);
      if ($first.is('br')) {
        $first.remove();
      }
    });

    // remove any breaks from image groups
    $('.md-image-group').find('br').remove();
  }
  // images are put in the same image group as long as there is
  // not separating paragraph between them
  function groupImages() {
    const par = $('p img').parents('p');
    // add an .md-image-group class to the p
    par.addClass('md-image-group');
  }

  // takes a standard <img> tag and adds a hyperlink to the image source
  // needed since we scale down images via css and want them to be accessible
  // in original format
  function linkImagesToSelf() {
    function selectNonLinkedImages() {
      // only select images that do not have a non-empty parent link
      const $images = $('img').filter((index, _this) => {
        const $parentLink = $(_this).parents('a').eq(0);
        if ($parentLink.length === 0) { return true; }
        const attr = $parentLink.attr('href');
        return (attr && attr.length === 0);
      });
      return $images;
    }
    const $nonLinkedImages = selectNonLinkedImages();
    return $nonLinkedImages.each((i, _this) => {
      const $this = $(_this);
      const imgSrc = $this.attr('src');
      let imgTitle = $this.attr('title');
      if (imgTitle === undefined) {
        imgTitle = '';
      }
      // wrap the <img> tag in an anchor and copy the title of the image
      $this.wrap(`<a class="md-image-selfref" href="${imgSrc}" title="${imgTitle}"/> `);
    });
  }

  function addInpageAnchors() {
    // adds a pilcrow (paragraph) character to heading with a link for the
    // inpage anchor
    function addPilcrow($heading, href) {
      const c = $.md.config.anchorCharacter;
      const $pilcrow = $(`<span class="anchor-highlight"><a>${c}</a></span>`);
      $pilcrow.find('a').attr('href', href);
      $pilcrow.hide();

      let mouseEntered = false;
      $heading.mouseenter(() => {
        mouseEntered = true;
        $.md.util.wait(300).then(() => {
          if (!mouseEntered) { return; }
          $pilcrow.fadeIn(200);
        });
      });
      $heading.mouseleave(() => {
        mouseEntered = false;
        $pilcrow.fadeOut(200);
      });
      $pilcrow.appendTo($heading);
    }

    // adds a link to the navigation at the top of the page
    function addJumpLinkToTOC($heading) {
      if ($.md.config.useSideMenu === false) { return; }
      if ($heading.prop('tagName') !== 'H2') { return; }

      const c = $.md.config.tocAnchor;
      if (c === '') { return; }

      const $jumpLink = $(`<a class="visible-xs visible-sm jumplink" href="#md-page-menu">${c}</a>`);
      $jumpLink.click((ev) => {
        ev.preventDefault();

        $('body').scrollTop($('#md-page-menu').position().top);
      });

      if ($heading.parents('#md-menu').length === 0) {
        $jumpLink.insertAfter($heading);
      }
    }

    // adds a page inline anchor to each h1,h2,h3,h4,h5,h6 element
    // which can be accessed by the headings text
    $('h1,h2,h3,h4,h5,h6').not('#md-title h1').each((i, _this) => {
      const $heading = $(_this);
      $heading.addClass('md-inpage-anchor');
      const text = $heading.clone().children('.anchor-highlight').remove().end()
        .text();
      const href = $.md.util.getInpageAnchorHref(text);
      addPilcrow($heading, href);

      // add jumplink to table of contents
      addJumpLinkToTOC($heading);
    });
  }

  $.md.scrollToInPageAnchor = (anchortextArg) => {
    let anchortext = anchortextArg;
    if (anchortext.startsWith('#')) { anchortext = anchortext.substring(1, anchortext.length); }
    // we match case insensitive
    let doBreak = false;
    $('.md-inpage-anchor').each((i, _this) => {
      if (doBreak) { return; }
      const $this = $(_this);
      // don't use the text of any subnode
      const text = $this.toptext();
      const match = $.md.util.getInpageAnchorText(text);
      if (anchortext === match) {
        _this.scrollIntoView(true);
        const navbarOffset = $('.navbar-collapse').height() + 5;
        window.scrollBy(0, -navbarOffset + 5);
        doBreak = true;
      }
    });
  };

  const publicMethods = {
    createBasicSkeleton() {
      setPageTitle();
      wrapParagraphText();
      linkImagesToSelf();
      groupImages();
      removeBreaks();
      addInpageAnchors();

      $.md.stage('all_ready').subscribe((done) => {
        if ($.md.inPageAnchor !== '') {
          $.md.util.wait(500).then(() => {
            $.md.scrollToInPageAnchor($.md.inPageAnchor);
          });
        }
        done();
      });
    },
  };

  $.md.publicMethods = $.extend({}, $.md.publicMethods, publicMethods);
})();
