LD.boot('dockerfile', function (G) {
  'use strict';
  var esc = G.esc;
  var first = G.measured.scenarios[0];
  G.$('#scen tbody').innerHTML = G.measured.scenarios.map(function (s) {
    var ran = s.steps.filter(function (x) {
      var base = first.steps.filter(function (f) { return f.n === x.n; })[0];
      return x.n > 1 ? x.state === 'rebuilt' : (base && x.text !== base.text);
    });
    var total = s.steps.reduce(function (a, x) { return a + (x.secs || 0); }, 0);
    return '<tr><th scope="row" style="text-transform:none;letter-spacing:0;font-family:var(--ui);font-size:.92rem;color:var(--ink)">' + esc(s.label) + '<br><small style="font-weight:400;color:var(--ink2)">' + esc(s.change) + '</small></th><td>' +
      (ran.length ? ran.map(function (x) { return '<code>' + esc(x.text) + '</code>'; }).join('<br>') : 'none: every step was reused') + '</td><td style="text-align:right;white-space:nowrap">' + total.toFixed(1) + ' s</td></tr>';
  }).join('');
});
