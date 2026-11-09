LD.boot('commands', function (G) {
  'use strict';
  var esc = G.esc, q = G.$('#q'), list = G.$('#list'), count = G.$('#count');
  var PAGE = { 'first-containers': 'concepts.html', 'build-image': 'dockerfile.html', 'compose-two': 'compose.html', networks: 'networking.html', volumes: 'networking.html', swarm: 'swarm.html' };
  function render() {
    var term = q.value.trim().toLowerCase(), shown = 0;
    list.innerHTML = '';
    G.lessons.forEach(function (l) {
      var steps = l.steps.filter(function (s) { return !term || (s.cmd + ' ' + (s.note || '')).toLowerCase().indexOf(term) >= 0; });
      if (!steps.length) return;
      shown += steps.length;
      var sec = document.createElement('section');
      sec.innerHTML = '<h2>' + esc(l.title) + '</h2><p class="note" style="color:var(--ink2)">From the <a href="' + PAGE[l.id] + '">' + esc(PAGE[l.id].replace('.html', '')) + '</a> lesson.</p>';
      steps.forEach(function (s) { sec.appendChild(G.step(s)); });
      list.appendChild(sec);
    });
    count.textContent = shown + ' shown';
    if (!shown) list.innerHTML = '<p class="notice">No command matches that filter.</p>';
  }
  q.addEventListener('input', render);
  render();
});
