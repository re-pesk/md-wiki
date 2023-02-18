/**
 * stage.js
 */

(() => {
  const $ = window.jQuery;
  const log = $.md.getLogger();

  $.Stage = (name) => {
    const self = $.extend($.Deferred(), {});
    self.name = name;
    self.events = [];
    self.started = false;

    self.reset = () => {
      self.complete = $.Deferred();
      self.outstanding = [];
    };

    self.reset();

    self.subscribe = (fn) => {
      if (self.started) {
        $.error('Subscribing to stage which already started!');
      }
      self.events.push(fn);
    };
    self.unsubscribe = (fn) => {
      self.events.remove(fn);
    };

    self.executeSubscribedFn = (fn) => {
      const d = $.Deferred();
      self.outstanding.push(d);

      // display an error if our done() callback is not called
      $.md.util.wait(2500).done(() => {
        if (d.state() !== 'resolved') {
          log.fatal(`Timeout reached for done callback in stage: ${self.name}. Did you forget a done() call in a .subscribe() ?`);
          log.fatal(`stage ${name} failed running subscribed function: ${fn}`);
        }
      });

      const done = () => {
        d.resolve();
      };
      fn(done);
    };

    self.run = () => {
      self.started = true;
      $(self.events).each((i, fn) => {
        self.executeSubscribedFn(fn);
      });

      // if no events are in our queue, we resolve immediately
      if (self.outstanding.length === 0) {
        self.resolve();
      }

      // we resolve when all our registered events have completed
      $.when(...self.outstanding)
        .done(() => {
          self.resolve();
        })
        .fail(() => {
          self.resolve();
        });
    };

    self.done(() => {
      log.debug(`stage ${self.name} completed successfully.`);
    });
    self.fail(() => {
      log.debug(`stage ${self.name} completed with errors!`);
    });
    return self;
  };
})();
