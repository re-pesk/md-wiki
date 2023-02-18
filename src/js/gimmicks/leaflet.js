/**
 * leaflet.js
 */

// eslint-disable-next-line no-var
var L;

(() => {
  const $ = window.jQuery;
  const jsUrl = 'http://cdn.leafletjs.com/leaflet-0.5.1/leaflet.js';
  const cssUrl = 'http://cdn.leafletjs.com/leaflet-0.5.1/leaflet.css';

  function leafletMap($link, opt /* , linkText */) {
    const $mapsLinks = $link;
    // var counter = (new Date()).getTime();
    return $mapsLinks.each((i, link) => {
      const $this = $(link);
      const defaultOptions = {};
      const options = $.extend({}, defaultOptions, opt);

      if (options.address === undefined) {
        options.address = $this.attr('href');
      }
      const divId = `leaflet-map-${Math.floor(Math.random() * 100000)}`;
      const $mapsdiv = $(`<div class="md-external md-external-noheight md-external-nowidth" id="${divId}"/>`);
      $this.replaceWith($mapsdiv);

      $mapsdiv.css('height', '580px');
      $mapsdiv.css('width', '580px');
      // now leats create a map out of the div
      // create a map in the "map" div, set the view to a given place and zoom
      const map = L.map(divId).setView([51.505, -0.09], 13);

      // add an OpenStreetMap tile layer
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // add a marker in the given location, attach some popup content to it and open the popup
      L.marker([51.5, -0.09]).addTo(map);
    });
  }

  const leafletGimmick = {
    name: 'Leaflet.js',
    version: $.md.version,
    once() {
      $.md.linkGimmick(this, 'leaflet', leafletMap);
      $.md.registerCss(this, cssUrl, {
        stage: 'skel_ready',
      });

      $.md.registerScript(this, jsUrl, {
        loadstage: 'pregimmick',
        finishstage: 'pregimmick',
      });
    },
  };

  $.md.registerGimmick(leafletGimmick);
})();
