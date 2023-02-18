/**
 * alerts.js
 */

(() => {
  const $ = window.jQuery;

  // picks out the paragraphs that start with a trigger word
  function selectParagraphs() {
    const note = ['note', 'beachte'];
    const warning = ['achtung', 'attention', 'warnung', 'warning', 'atención', 'guarda', 'advertimiento'];
    const hint = ['hint', 'tipp', 'tip', 'hinweis'];
    let exp = note.concat(warning);
    exp = exp.concat(hint);
    const matches = [];

    $('p').each((i, _this) => {
      const $par = $(_this);
      // check against each expression
      $(exp).each((_i, trigger) => {
        const txt = $par.text().toLowerCase();
        // we match only paragrachps in which the 'trigger' expression
        // is follow by a ! or :
        const re = new RegExp(`${trigger}(:|!)+.*`, 'i');
        let alertType = 'none';
        if (txt.match(re) !== null) {
          if ($.inArray(trigger, note) >= 0) {
            alertType = 'note';
          } else if ($.inArray(trigger, warning) >= 0) {
            alertType = 'warning';
          } else if ($.inArray(trigger, hint) >= 0) {
            alertType = 'hint';
          }
          matches.push({
            p: $par,
            alertType,
          });
        }
      });
    });
    return matches;
  }

  // takes a standard <img> tag and adds a hyperlink to the image source
  // needed since we scale down images via css and want them to be accessible
  // in original format
  function createAlerts() {
    const matches = $(selectParagraphs());
    matches.each((i, _this) => {
      const $p = $(_this.p);
      const type = _this.alertType;
      $p.addClass('alert');

      if (type === 'note') {
        $p.addClass('alert-info');
      } else if (type === 'hint') {
        $p.addClass('alert-success');
      } else if (type === 'warning') {
        $p.addClass('alert-warning');
      }
    });
  }

  const alertsGimmick = {
    name: 'alerts',
    // TODO
    // version: $.md.version,
    load() {
      $.md.stage('bootstrap').subscribe((done) => {
        createAlerts();
        done();
      });
    },
  };
  $.md.registerGimmick(alertsGimmick);
})();
