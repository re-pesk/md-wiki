/**
 * googlemaps.js
 */

// ugly, but the google loader requires the callback fn
// to be in the global scope

// eslint-disable-next-line no-var
var google;
// eslint-disable-next-line no-unused-vars
window.googlemapsReady = () => {
  window.googlemapsLoadDone.resolve();
};

(() => {
  const $ = window.jQuery;
  const scripturl = 'https://maps.google.com/maps/api/js?sensor=false&callback=googlemapsReady';

  function setMap(optArg /* , divId */) {
    const opt = optArg;
    // google uses rather complicated mapnames, we transform our simple ones
    const mt = opt.maptype.toUpperCase();
    opt.mapTypeId = google.maps.MapTypeId[mt];
    const geocoder = new google.maps.Geocoder();

    // geocode performs address to coordinate transformation
    geocoder.geocode({ address: opt.address }, (result, status) => {
      if (status !== 'OK') {
        return;
      }

      // add the retrieved coords to the options object
      const coords = result[0].geometry.location;

      const options = $.extend({}, opt, { center: coords });
      // var gmap = new google.maps.Map(document.getElementById(divId), options);
      if (options.marker === true) {
        // var marker = new google.maps.Marker({ position: coords, map: gmap });
      }
    });
  }

  function googlemaps($links, opt /* , text */) {
    const $mapsLinks = $links;
    // var counter = (new Date()).getTime();
    return $mapsLinks.each((i, e) => {
      const $link = $(e);
      const defaultOptions = {
        zoom: 11,
        marker: true,
        scrollwheel: false,
        maptype: 'roadmap',
      };
      const options = $.extend({}, defaultOptions, opt);
      if (options.address === undefined) {
        options.address = $link.attr('href');
      }
      const divId = `google-map-${Math.floor(Math.random() * 100000)}`;
      const $mapsdiv = $(`<div class="md-external md-external-nowidth" id="${divId}"/>`);
      /* TODO height & width must be set AFTER the theme script went through
      implement an on event, maybe?
      if (options["width"] !== undefined) {
          $mapsdiv.css('width', options["width"] + "px");
          options["width"] = null;
      }
      if (options["height"] !== undefined) {
          $mapsdiv.css('height', options["height"] + "px");
          options["height"] = null;
      }
      */
      $link.replaceWith($mapsdiv);
      // the div is already put into the site and will be formated,
      // we can now run async
      setMap(options, divId);
    });
  }

  const googleMapsGimmick = {
    name: 'googlemaps',
    version: $.md.version,
    once() {
      window.googlemapsLoadDone = $.Deferred();

      // register the gimmick:googlemaps identifier
      $.md.linkGimmick(this, 'googlemaps', googlemaps);

      // load the googlemaps js from the google server
      $.md.registerScript(this, scripturl, {
        license: 'EXCEPTION',
        loadstage: 'skel_ready',
        finishstage: 'bootstrap',
      });

      $.md.stage('bootstrap').subscribe((done) => {
        // defer the pregimmick phase until the google script fully loaded
        if ($.md.triggerIsActive('googlemaps')) {
          window.googlemapsLoadDone.done(() => {
            done();
          });
        } else {
          // immediately return as there will never a load success
          done();
        }
      });
    },
  };

  $.md.registerGimmick(googleMapsGimmick);
})();
