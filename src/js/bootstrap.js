/**
 * bootstrap.js
 */
/* eslint-disable func-names */

(() => {
  const $ = window.jQuery;
  // var navStyle = '';

  // PRIVATE FUNCTIONS:
  // the navbar has different height depending on theme, number of navbar entries,
  // and window/device width. Therefore recalculate on start and upon window resize
  function setOffsetToNavbar() {
    const height = $('#md-main-navbar').height() + 10;
    $('#md-body').css('margin-top', `${height}px`);
  }
  function checkOffsetToNavbar() {
    // HACK this is VERY UGLY. When an external theme is used, we don't know when the
    // css style will be finished loading - and we can only correctly calculate
    // the height AFTER it has completely loaded.
    let navbarHeight = 0;

    const dfd1 = $.md.util.repeatUntil(40, () => {
      navbarHeight = $('#md-main-navbar').height();
      return (navbarHeight > 35) && (navbarHeight < 481);
    }, 25);

    dfd1.done(() => {
      navbarHeight = $('#md-main-navbar').height();
      setOffsetToNavbar();
      // now bootstrap changes this maybe after a while, again watch for changes
      const dfd2 = $.md.util.repeatUntil(20, () => navbarHeight !== $('#md-main-navbar').height(), 25);
      dfd2.done(() => {
        // it changed, so we need to change it again
        setOffsetToNavbar();
      });
      // and finally, for real slow computers, make sure it is changed if changin very late
      $.md.util.wait(2000).done(() => {
        setOffsetToNavbar();
      });
    });
  }

  function buildTopNav() {
    // replace with the navbar skeleton
    if ($('#md-menu').length <= 0) {
      return;
    }
    // navStyle = 'top';
    const $menuContent = $('#md-menu').children();

    // $('#md-menu').addClass ('navbar navbar-default navbar-fixed-top');
    // var menusrc = '';
    // menusrc += '<div id="md-menu-inner" class="container">';
    // menusrc += '<ul id="md-menu-ul" class="nav navbar-nav">';
    // menusrc += '</ul></div>';
    let navbar = '';
    navbar += '<div id="md-main-navbar" class="navbar navbar-default navbar-fixed-top" role="navigation">';
    navbar += '<div class="navbar-header">';
    navbar += '<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">';
    navbar += '<span class="sr-only">Toggle navigation</span>';
    navbar += '<span class="icon-bar"></span>';
    navbar += '<span class="icon-bar"></span>';
    navbar += '<span class="icon-bar"></span>';
    navbar += '</button>';
    navbar += '<a class="navbar-brand" href="#"></a>';
    navbar += '</div>';

    navbar += '<div class="collapse navbar-collapse navbar-ex1-collapse">';
    navbar += '<ul class="nav navbar-nav" />';
    navbar += '<ul class="nav navbar-nav navbar-right" />';
    navbar += '</div>';
    navbar += '</div>';
    const $navbar = $(navbar);

    $navbar.appendTo('#md-menu');
    // .eq(0) becase we dont want navbar-right to be appended to
    $('#md-menu ul.nav').eq(0).append($menuContent);

    // the menu should be the first element in the body
    $('#md-menu').prependTo('#md-all');

    const brandText = $('#md-menu h1').toptext();
    $('#md-menu h1').remove();
    $('a.navbar-brand').text(brandText);

    // initial offset
    $('#md-body').css('margin-top', '70px');
    $.md.stage('pregimmick').subscribe((done) => {
      checkOffsetToNavbar();
      done();
    });
  }
  // function buildSubNav() {
  // replace with the navbar skeleton
  /* BROKEN CODE
  if ($('#md-menu').length <= 0) {
      return;
  }
  navStyle = 'sub';
  var $menuContent = $('#md-menu').html ();

  var menusrc = '';
  menusrc += '<div id="md-menu-inner" class="subnav">';
  menusrc += '<ul id="md-menu-ul" class="nav nav-pills">';
  menusrc += $menuContent;
  menusrc += '</ul></div>';
  $('#md-menu').empty();
  $('#md-menu').wrapInner($(menusrc));
  $('#md-menu').addClass ('col-md-12');

  $('#md-menu-container').insertAfter ($('#md-title-container'));
  */
  // }
  function buildMenu() {
    if ($('#md-menu a').length === 0) {
      return;
    }
    const h = $('#md-menu');

    // make toplevel <a> a dropdown
    h.find('> a[href=""]')
      .attr('data-toggle', 'dropdown')
      .addClass('dropdown-toggle')
      .attr('href', '')
      .append('<b class="caret"/>');
    h.find('ul').addClass('dropdown-menu');
    h.find('ul li').addClass('dropdown');

    // replace hr with dividers
    $('#md-menu hr').each((i, e) => {
      const hr = $(e);
      const prev = hr.prev();
      const next = hr.next();
      if (prev.is('ul') && prev.length >= 0) {
        prev.append($('<li class="divider"/>'));
        hr.remove();
        if (next.is('ul')) {
          next.find('li').appendTo(prev);
          next.remove();
        }
        // next ul should now be empty
      }
    });

    // remove empty uls
    $('#md-menu ul').each((i, e) => {
      const ul = $(e);
      if (ul.find('li').length === 0) {
        ul.remove();
      }
    });

    $('#md-menu hr').replaceWith($('<li class="divider-vertical"/>'));

    // wrap the toplevel links in <li>
    $('#md-menu > a').wrap('<li />');
    $('#md-menu ul').each((i, e) => {
      const ul = $(e);
      ul.appendTo(ul.prev());
      ul.parent('li').addClass('dropdown');
    });

    // submenu headers
    $('#md-menu li.dropdown').find('h1, h2, h3').each((i, e) => {
      const $e = $(e);
      const text = $e.toptext();
      const header = $('<li class="dropdown-header" />');
      header.text(text);
      $e.replaceWith(header);
    });

    // call the user specifed menu function
    buildTopNav();
  }
  function isVisibleInViewport(e) {
    const el = $(e);
    const top = $(window).scrollTop();
    const bottom = top + $(window).height();

    const eltop = el.offset().top;
    const elbottom = eltop + el.height();

    return (elbottom <= bottom) && (eltop >= top);
  }

  function createPageContentMenu() {
    // assemble the menu
    const $headings = $('#md-content').find('h2').clone();
    // we dont want the text of any child nodes
    $headings.children().remove();

    if ($headings.length <= 1) {
      return;
    }

    $('#md-content').removeClass('col-md-12');
    $('#md-content').addClass('col-md-9');
    $('#md-content-row').prepend('<div class="col-md-3" id="md-left-column"/>');

    const recalcWidth = function () {
      // if the page menu is affixed, it is not a child of the
      // <md-left-column> anymore and therefore does not inherit
      // its width. On every resize, change the class accordingly
      const widthLeftColumn = $('#md-left-column').width();
      $('#md-page-menu').css('width', widthLeftColumn);
    };

    $(window).scroll(() => {
      recalcWidth($('#md-page-menu'));
      let $first;
      $('*.md-inpage-anchor').each((i, e) => {
        if ($first === undefined) {
          const h = $(e);
          if (isVisibleInViewport(h)) {
            $first = h;
          }
        }
      });
      // highlight in the right menu
      $('#md-page-menu a').each((i, e) => {
        const $a = $(e);
        if ($first && $a.toptext() === $first.toptext()) {
          $('#md-page-menu a.active').removeClass('active');
          // $a.parent('a').addClass('active');
          $a.addClass('active');
        }
      });
    });

    const affixDiv = $('<div id="md-page-menu" />');

    // var topSpacing = $('#md-menu').height() + 15;
    const topSpacing = 70;
    affixDiv.affix({
      // offset: affix.position() - 50,
      offset: 130,
    });
    affixDiv.css('top', topSpacing);
    // affix.css('top','-250px');
    const $pannel = $('<div class="panel panel-default"><ul class="list-group"/></div>');
    const $ul = $pannel.find('ul');
    affixDiv.append($pannel);

    $headings.each((i, e) => {
      const $heading = $(e);
      const $li = $('<li class="list-group-item" />');
      const $a = $('<a />');
      $a.attr('href', $.md.util.getInpageAnchorHref($heading.toptext()));
      $a.click(function (ev) {
        ev.preventDefault();

        const $this = $(this);
        const anchortext = $.md.util.getInpageAnchorText($this.toptext());
        $.md.scrollToInPageAnchor(anchortext);
      });
      $a.text($heading.toptext());
      $li.append($a);
      $ul.append($li);
    });

    $(window).resize(() => {
      recalcWidth($('#md-page-menu'));
      checkOffsetToNavbar();
    });
    $.md.stage('postgimmick').subscribe((done) => {
      // recalcWidth();
      done();
    });

    // menu.css('width','100%');
    $('#md-left-column').append(affixDiv);
  }

  function createPageSkeleton() {
    $('#md-title').wrap('<div class="container" id="md-title-container"/>');
    $('#md-title').wrap('<div class="row" id="md-title-row"/>');

    $('#md-menu').wrap('<div class="container" id="md-menu-container"/>');
    $('#md-menu').wrap('<div class="row" id="md-menu-row"/>');

    $('#md-content').wrap('<div class="container" id="md-content-container"/>');
    $('#md-content').wrap('<div class="row" id="md-content-row"/>');

    $('#md-body').wrap('<div class="container" id="md-body-container"/>');
    $('#md-body').wrap('<div class="row" id="md-body-row"/>');

    $('#md-title').addClass('col-md-12');
    $('#md-content').addClass('col-md-12');
  }
  // function pullRightBumper() {
  /*     $("span.bumper").each (function () {
       $this = $(this);
       $this.prev().addClass ("pull-right");
     });
     $('span.bumper').addClass ('pull-right');
 */
  // }
  function changeHeading() {
    // HEADING
    const jumbo = $('<div class="page-header" />');
    $('#md-title').wrapInner(jumbo);
  }

  function highlightActiveLink() {
    // when no menu is used, return
    if ($('#md-menu').find('li').length === 0) {
      return;
    }
    let filename = window.location.hash;

    if (filename.length === 0) {
      filename = '#!index.md';
    }
    const selector = `li:has(a[href="${filename}"])`;
    $('#md-menu').find(selector).addClass('active');
  }

  // replace all <p> around images with a <div class="thumbnail" >
  function replaceImageParagraphs() {
    // only select those paragraphs that have images in them
    const $pars = $('p img').parents('p');
    $pars.each(function () {
      const $p = $(this);
      const $images = $(this).find('img')
        .filter(function () {
          // only select those images that have no parent anchor
          return $(this).parents('a').length === 0;
        })
        // add those anchors including images
        .add($(this).find('img'))
        .addClass('img-responsive')
        .addClass('img-thumbnail');

      // create a new url group at the fron of the paragraph
      // $p.prepend($('<ul class="thumbnails" />'));
      // move the images to the newly created ul
      // $p.find('ul').eq(0).append($images);
      // wrap each image with a <li> that limits their space
      // the number of images in a paragraphs determines thei width / span
      // if the image is a link, wrap around the link to avoid
      function wrapImage($imgages, wrapElement) {
        return $images.each((i, img) => {
          const $img = $(img);
          const $parentImg = $img.parent('a');
          if ($parentImg.length > 0) {
            $parentImg.wrap(wrapElement);
          } else {
            $img.wrap(wrapElement);
          }
        });
      }

      if ($p.hasClass('md-floatenv')) {
        if ($images.length === 1) {
          wrapImage($images, '<div class="col-sm-8" />');
        } else if ($images.length === 2) {
          wrapImage($images, '<div class="col-sm-4" />');
        } else {
          wrapImage($images, '<div class="col-sm-2" />');
        }
      } else
      // non-float => images are on their own single paragraph, make em larger
      // but remember, our image resizing will make them only as large as they are
      // but do no upscaling
      // TODO replace by calculation
      if ($images.length === 1) {
        wrapImage($images, '<div class="col-sm-12" />');
      } else if ($images.length === 2) {
        wrapImage($images, '<div class="col-sm-6" />');
      } else if ($images.length === 3) {
        wrapImage($images, '<div class="col-sm-4" />');
      } else if ($images.length === 4) {
        wrapImage($images, '<div class="col-sm-3" />');
      } else {
        wrapImage($images, '<div class="col-sm-2" />');
      }

      $p.addClass('row');
      // finally, every img gets its own wrapping thumbnail div
      // $images.wrap('<div class="thumbnail" />');
    });

    // apply float to the ul thumbnails
    // $('.md-floatenv.md-float-left ul').addClass ('pull-left');
    // $('.md-floatenv.md-float-right ul').addClass ('pull-right');
  }

  function adjustExternalContent() {
    // external content are usually iframes or divs that are integrated
    // by gimmicks
    // example: youtube iframes, google maps div canvas
    // all external content are in the md-external class
    $('iframe.md-external').not('.md-external-nowidth')
      .attr('width', '450')
      .css('width', '450px');

    $('iframe.md-external').not('.md-external-noheight')
      .attr('height', '280')
      .css('height', '280px');

    // make it appear like an image thumbnal
    // $('.md-external').addClass('img-thumbnail');
    // .wrap($("<ul class='thumbnails' />")).wrap($("<li class='col-md-6' />"));
    $('div.md-external').not('.md-external-noheight')
      .css('height', '280px');
    $('div.md-external').not('.md-external-nowidth')
      .css('width', '450px');

    // // make it appear like an image thumbnal
    // $("div.md-external").addClass("thumbnail")
    // .wrap($("<ul class='thumbnails' />")).wrap($("<li class='col-md-10' />"));
    // $("div.md-external-large").css('width', "700px")
  }

  // note: the footer is part of the GPLv3 legal information
  // and may not be removed or hidden to comply with licensing conditions.
  function addFooter() {
    let navbar = '';
    navbar += '<hr><div class="scontainer">';
    navbar += '<div class="pull-right md-copyright-footer"> ';
    navbar += '<span id="md-footer-additional"></span>';
    navbar += 'Website generated with <a href="http://www.mdwiki.info">MDwiki</a> ';
    navbar += '&copy; Timo D&ouml;rr and contributors. ';
    navbar += '</div>';
    navbar += '</div>';
    const $navbar = $(navbar);
    $navbar.css('position', 'relative');
    $navbar.css('margin-top', '1em');
    $('#md-all').append($navbar);
  }

  function addAdditionalFooterText() {
    const text = $.md.config.additionalFooterText;
    if (text) {
      $('.md-copyright-footer #md-footer-additional').html(text);
    }
  }

  // END PRIVATE FUNCTIONS
  // call the gimmick
  $.mdbootstrap = function (method, ...args) {
    if (!$.mdbootstrap.publicMethods[method]) {
      $.error(`Method ${method} does not exist on jquery.mdbootstrap`);
    }
    return $.mdbootstrap.publicMethods[method].apply(this, args);
  };
  // simple wrapper around $().bind
  $.mdbootstrap.events = [];
  $.mdbootstrap.bind = function (ev, func) {
    $(document).bind(ev, func);
    $.mdbootstrap.events.push(ev);
  };
  $.mdbootstrap.trigger = function (ev) {
    $(document).trigger(ev);
  };

  // PUBLIC API functions that are exposed
  const publicMethods = {
    bootstrapify() {
      createPageSkeleton();
      buildMenu();
      changeHeading();
      replaceImageParagraphs();

      $('table').addClass('table').addClass('table-bordered');
      // pullRightBumper ();
      // remove the margin for headings h1 and h2 that are the first
      // on page
      // if (navStyle == "sub" || (navStyle == "top"
      // && $('#md-title').text ().trim ().length === 0))
      //    $(".md-first-heading").css ("margin-top", "0");
      // external content should run after gimmicks were run
      $.md.stage('pregimmick').subscribe((done) => {
        if ($.md.config.useSideMenu !== false) {
          createPageContentMenu();
        }
        addFooter();
        addAdditionalFooterText();
        done();
      });
      $.md.stage('postgimmick').subscribe((done) => {
        adjustExternalContent();
        highlightActiveLink();

        done();
      });
    },
  };
  // register the public API functions
  $.mdbootstrap.publicMethods = $.extend({}, $.mdbootstrap.publicMethods, publicMethods);
})();
