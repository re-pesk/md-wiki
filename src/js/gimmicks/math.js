/**
 * math.js
 */

(() => {
  const $ = window.jQuery;
  function loadMathjax($links /* , opt, ref */) {
    $links.remove();
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = $.md.prepareLink('cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML');
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  const mathGimmick = {
    name: 'math',
    once() {
      $.md.linkGimmick(this, 'math', loadMathjax);
    },
  };

  $.md.registerGimmick(mathGimmick);
})();
