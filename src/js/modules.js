/**
 * modules.js
 */

(() => {
  const $ = window.jQuery;
  const log = $.md.getLogger();

  // since we are GPL, we have to be cautious what other scripts we load
  // as delivering to the browser is considered delivering a derived work
  const licenses = [
    'MIT', 'BSD', 'GPL', 'GPL2', 'GPL3', 'LGPL', 'LGPL2',
    'APACHE2', 'PUBLICDOMAIN', 'EXCEPTION', 'OTHER',
  ];
  function checkLicense(license, module) {
    if ($.inArray(license, licenses) === -1) {
      const availLicenses = JSON.stringify(licenses);
      log.warn(`license ${license} is not known.`);
      log.warn(`Known licenses:${availLicenses}`);
    } else if (license === 'OTHER') {
      log.warn(`WARNING: Module ${module.name} uses a script with unknown license. This may be a GPL license violation if this website is publically available!`);
    }
  }

  const registeredScripts = [];
  // array of ScriptInfo
  function ScriptInfo(initial) {
    this.module = undefined;
    this.options = {};

    // can ba an URL or javascript sourcecode
    this.src = '';

    $.extend(this, initial);
  }

  // jQuery does some magic when inserting inline scripts, so better
  // use vanilla JS. See:
  // http://stackoverflow.com/questions/610995/jquery-cant-append-script-element
  function insertInlineScript(src) {
    // scripts always need to go directly into the DOM
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.text = src;
    document.body.appendChild(script);
  }

  // will actually schedule the script load into the DOM.
  function loadScript(scriptinfo) {
    const { module, src, options } = scriptinfo;

    const license = options.license || 'OTHER';
    const loadstage = options.loadstage || 'skel_ready';
    const finishstage = options.finishstage || 'pregimmick';
    const { callback } = options;

    const loadDone = $.Deferred();

    checkLicense(license, module);
    // start script loading
    log.debug(`subscribing ${module.name} to start: ${loadstage} end in: ${finishstage}`);
    $.md.stage(loadstage).subscribe((done) => {
      if (src.startsWith('//') || src.startsWith('http')) {
        $.getScript(src, () => {
          if (callback !== undefined) {
            callback(done);
          } else {
            log.debug(`module${module.name} script load done: ${src}`);
            done();
          }
          loadDone.resolve();
        });
      } else {
        // inline script that we directly insert
        insertInlineScript(src);
        log.debug(`module${module.name} script inject done`);
        loadDone.resolve();
        done();
      }
    });
    // if loading is not yet finished in stage finishstage, wait
    // for the loading to complete
    $.md.stage(finishstage).subscribe((done) => {
      loadDone.done(() => {
        done();
      });
    });
  }

  // array of linkTriggers
  const linkTriggers = [];
  function LinkTrigger(initial) {
    this.trigger = undefined;
    this.module = undefined;
    this.callback = undefined;

    $.extend(this, initial);
  }

  function findModuleByTrigger(trigger) {
    let ret;
    $.each(linkTriggers, (i, e) => {
      if (e.trigger === trigger) {
        ret = e.module;
      }
    });
    return ret;
  }

  // triggers that we actually found on the page
  // array of string
  const activeLinkTriggers = [];

  function loadRequiredScripts() {
    // find each module responsible for the link trigger
    $.each(activeLinkTriggers, (i, trigger) => {
      const module = findModuleByTrigger(trigger);
      if (module === undefined) {
        log.error(`Gimmick link: "${trigger}" found but no suitable gimmick loaded`);
        return;
      }
      const scriptinfo = registeredScripts.filter((info) => info.module.name === module.name)[0];
      // register to load the script
      if (scriptinfo !== undefined) {
        loadScript(scriptinfo);
      }
    });
  }

  function getGimmickLinkParts($link) {
    const linkText = $.trim($link.toptext());
    // returns linkTrigger, options, linkText
    if (linkText.match(/gimmick:/i) === null) {
      return null;
    }
    const href = $.trim($link.attr('href'));
    const r = /gimmick:\s*([^(\s]*)\s*(\(\s*{?(.*)\s*}?\s*\))*/i;
    const matches = r.exec(linkText);
    if (matches === null || matches[1] === undefined) {
      $.error(`Error matching a gimmick: ${linkText}`);
      return null;
    }
    const trigger = matches[1].toLowerCase();
    let args = null;
    // getting the parameters
    if (matches[2] !== undefined) {
      // remove whitespaces
      let params = $.trim(matches[3].toString());
      // remove the closing } if present
      if (params.charAt(params.length - 1) === '}') {
        params = params.substring(0, params.length - 1);
      }
      // add surrounding braces and paranthese
      params = `({${params}})`;
      // replace any single quotes by double quotes
      params = params.replace(/'/g, '"');
      // finally, try if the json object is valid
      try {
        // eslint-disable-next-line no-eval
        args = eval(params);
      } catch (err) {
        log.error(`error parsing argument of gimmick: ${linkText}giving error: ${err}`);
      }
    }
    return { trigger, options: args, href };
  }

  // finds out that kind of trigger words are acutally used on a given page
  // this is most likely a very small subset of all available gimmicks
  function findActiveLinkTrigger() {
    const $gimmicks = $('a:icontains(gimmick:)');
    $gimmicks.each((i, e) => {
      const parts = getGimmickLinkParts($(e));
      if (activeLinkTriggers.indexOf(parts.trigger) === -1) {
        activeLinkTriggers.push(parts.trigger);
      }
    });
    log.debug(`Scanning for required gimmick links: ${JSON.stringify(activeLinkTriggers)}`);
  }

  function runGimmicksOnce() {
    // runs the once: callback for each gimmick within the init stage
    $.each($.md.gimmicks, (i, module) => {
      if (module.once === undefined) {
        return;
      }
      module.once();
    });
  }

  function subscribeLinkTrigger($link, argsArg, linktrigger) {
    const args = argsArg;
    log.debug(`Subscribing gimmick ${linktrigger.module.name} to stage: ${linktrigger.stage}`);

    $.md.stage(linktrigger.stage).subscribe((done) => {
      args.options = args.options ?? {};

      // it is possible that broken modules or any other transformation removed the $link
      // from the dom in the meantime
      if (!$.contains(document.documentElement, $link[0])) {
        log.error('LINK IS NOT IN THE DOM ANYMORE: ');
        log.error($link);
      }

      log.debug(`Running gimmick ${linktrigger.module.name}`);
      linktrigger.callback($link, args.options, args.href, done);

      // if the gimmick didn't call done, we trigger it here
      done();
    });
  }

  // PUBLIC API
  $.md.registerGimmick = (module) => {
    $.md.gimmicks.push(module);
  };

  // registers a script for a gimmick, that is later dynamically loaded
  // by the core.
  // src may be an URL or direct javascript sourcecode. When options.callback
  // is provided, the done() function is passed to the function and needs to
  // be called.
  $.md.registerScript = (module, src, options) => {
    const scriptinfo = new ScriptInfo({ module, src, options });
    registeredScripts.push(scriptinfo);
  };

  // same as registerScript but for css. Note that we do not provide a
  // callback when the load finishes
  $.md.registerCss = (module, url, options) => {
    const { license, callback } = options;
    const stage = options.stage || 'skel_ready';

    checkLicense(license, module);
    const tag = `<link rel="stylesheet" href="${url}" type="text/css"></link>`;
    $.md.stage(stage).subscribe((done) => {
      $('head').append(tag);
      if (callback !== undefined) {
        callback(done);
      } else {
        done();
      }
    });
  };

  // turns hostname/path links into http://hostname/path links
  // we need to do this because if accessed by file:///, we need a different
  // transport scheme for external resources (like http://)
  $.md.prepareLink = (link, options = {}) => {
    const ownProtocol = window.location.protocol;

    if (options.forceSSL) { return `https://${link}`; }
    if (options.forceHTTP) { return `http://${link}`; }

    if (ownProtocol === 'file:') {
      return `http://${link}`;
    }
    // default: use the same as origin resource
    return `//${link}`;
  };

  // associate a link trigger for a gimmick. i.e. [gimmick:foo]() then
  // foo is the trigger and will invoke the corresponding gimmick
  $.md.linkGimmick = (module, trigger, callback, stage = 'gimmick') => {
    const linktrigger = new LinkTrigger({
      trigger,
      module,
      stage,
      callback,
    });
    linkTriggers.push(linktrigger);
  };

  $.md.triggerIsActive = (trigger) => {
    if (activeLinkTriggers.indexOf(trigger) === -1) {
      return false;
    }
    return true;
  };

  // var initialized = false;
  // TODO combine main.js and modules.js closure
  $.md.initializeGimmicks = () => {
    findActiveLinkTrigger();
    runGimmicksOnce();
    loadRequiredScripts();
  };

  // END PUBLIC API
  // activate all gimmicks on a page, that are contain the text gimmick:
  // TODO make private / merge closures
  $.md.registerLinkGimmicks = () => {
    const $gimmickLinks = $('a:icontains(gimmick:)');
    $gimmickLinks.each((i, e) => {
      const $link = $(e);
      const gimmickArguments = getGimmickLinkParts($link);

      $.each(linkTriggers, (_i, linktrigger) => {
        if (gimmickArguments.trigger === linktrigger.trigger) {
          subscribeLinkTrigger($link, gimmickArguments, linktrigger);
        }
      });
    });
  };
})();
