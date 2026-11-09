/* Landing: the build as layers. Every state is a measurement from data/measured.json (real `docker build` runs). */
LD.boot('home', function (G) {
  'use strict';
  var $ = G.$, esc = G.esc, M = G.measured, scen = M.scenarios;
  var cur = 'code', running = false, dfLines = [];

  var EXPLAIN = {
    first: 'The build cache was empty, so every step ran.',
    same: 'Nothing changed, so every step was reused and the build ran no instruction at all.',
    code: 'You edited server.js. The step that copies only package.json and the step that installs from it were reused, because their inputs did not change. Only COPY . . saw a changed file, and it is the last step that does any work.',
    pkg: 'You changed package.json. That file is copied first, so its step ran again, and so did every step after it, including the install. A step can be reused only if every step before it was.',
    base: 'You changed the base image. Every step after FROM ran again, because every step builds on the layers before it.'
  };
  var LABEL = { first: 'Empty cache', same: 'Change nothing', code: 'Edit server.js', pkg: 'Edit package.json', base: 'Change the base image' };

  $('#tabs').innerHTML = scen.map(function (s) { return '<button type="button" data-s="' + s.id + '" aria-pressed="' + (s.id === cur) + '">' + esc(LABEL[s.id] || s.label) + '</button>'; }).join('');

  function scenario() { return scen.filter(function (s) { return s.id === cur; })[0]; }
  function stepFor(s, n) { return s.steps.filter(function (x) { return x.n === n; })[0]; }
  function secs(x) { return x.secs ? ' · ' + x.secs.toFixed(1) + ' s' : ''; }

  // The Dockerfile's own lines, mapped to the build steps that report them.
  function mapLines() {
    var n = 0;
    dfLines = dfText.split('\n').filter(function (l) { return l.trim(); }).map(function (l) {
      var instr = /^(FROM|WORKDIR|COPY|RUN)\b/.test(l);
      if (instr) n++;
      return { text: l, n: instr ? n : 0 };
    });
  }
  var dfText = '';

  function draw() {
    var s = scenario(), first = scen[0], total = M.imageBytes;
    // Dockerfile
    $('#df').innerHTML = dfLines.map(function (l) {
      if (!l.n) return '<li class="meta"><code style="background:none;border:0;padding:0">' + esc(l.text) + '</code></li>';
      var st = stepFor(s, l.n), changedText = st && stepFor(first, l.n) && st.text !== stepFor(first, l.n).text;
      var shownText = changedText ? st.text : l.text;
      var state = st ? (changedText ? 'rebuilt' : st.state) : 'cached';
      return '<li class="' + state + '"><code style="background:none;border:0;padding:0">' + esc(shownText) + '</code></li>';
    }).join('');
    // Layers, newest on top. Layer sizes come from `docker history` of the same image.
    var baseBytes = 0, i;
    for (i = 0; i < M.layers.length; i++) { if (/WORKDIR/.test(M.layers[i].by)) break; baseBytes += M.layers[i].bytes; }
    var layerOf = {}; // n -> bytes
    layerOf[2] = (M.layers.filter(function (l) { return /WORKDIR/.test(l.by); })[0] || {}).bytes || 0;
    layerOf[3] = (M.layers.filter(function (l) { return /COPY package/.test(l.by); })[0] || {}).bytes || 0;
    layerOf[4] = (M.layers.filter(function (l) { return /npm install/.test(l.by); })[0] || {}).bytes || 0;
    layerOf[5] = (M.layers.filter(function (l) { return /^COPY \. \./.test(l.by); })[0] || {}).bytes || 0;
    var rows = [];
    if (running) rows.push('<li class="run"><span>Container: writable layer</span><span>' + esc(M.containerSize.split(' ')[0]) + ' at start</span></li>');
    [5, 4, 3, 2].forEach(function (n) {
      var st = stepFor(s, n); if (!st) return;
      var w = Math.max(total ? 100 * layerOf[n] / total : 0, 0.5);
      rows.push('<li class="' + st.state + '"><span>' + esc(st.text) + '<br><small>' + (st.state === 'cached' ? 'reused from cache' : 'ran again' + secs(st)) + '</small></span><span>' + G.fmtBytes(layerOf[n]) + '</span><span class="meter"><i style="width:' + w.toFixed(2) + '%"></i></span></li>');
    });
    var b = stepFor(s, 1), bchanged = b && stepFor(first, 1) && b.text !== stepFor(first, 1).text;
    rows.push('<li class="base' + (bchanged ? ' rebuilt' : '') + '"><span>' + esc(b ? b.text : 'FROM') + '<br><small>' + (bchanged ? 'a different base image' : 'base image, already on this machine') + ' · ' + M.layers.filter(function (l, k) { return k < i; }).length + ' layers</small></span><span>' + G.fmtBytes(baseBytes) + '</span><span class="meter"><i style="width:' + (100 * baseBytes / total).toFixed(2) + '%"></i></span></li>');
    $('#layers').innerHTML = rows.join('');
    // Readout
    var ran = s.steps.filter(function (x) { return x.state === 'rebuilt' && x.n > 1; }), n5 = s.steps.filter(function (x) { return x.n > 1; }).length;
    var tsum = s.steps.reduce(function (a, x) { return a + (x.secs || 0); }, 0);
    var ranAll = s.steps.filter(function (x) { return x.state === 'rebuilt' || (x.n === 1 && bchanged); }).length;
    var msg = '<b>' + esc(LABEL[s.id]) + ': ' + ran.length + ' of ' + n5 + ' build steps after FROM ran again, ' + tsum.toFixed(1) + ' s in total.</b> ' + EXPLAIN[s.id];
    if (running) msg += ' A running container adds one thin writable layer on top. It is ' + esc(M.containerSize.split(' ')[0]) + ' when it starts, and the layers under it are read-only and shared by every container made from the image. EXPOSE and CMD only record settings, so they add no layer and take no time.';
    $('#readout').innerHTML = msg;
  }

  $('#tabs').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-s]'); if (!b) return;
    cur = b.getAttribute('data-s');
    G.$$('#tabs button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    draw();
  });
  $('#run').addEventListener('click', function (e) { running = !running; e.currentTarget.setAttribute('aria-pressed', String(running)); e.currentTarget.textContent = running ? 'Remove the container' : 'Run a container from it'; draw(); });

  // chapters, each with a figure computed from the data
  var L = G.byId, cmds = G.lessons.reduce(function (n, l) { return n + l.steps.length; }, 0);
  var services = (L['compose-two'].extra['compose.yaml'].match(/^ {2}\w+:$/gm) || []).length;
  var items = [
    ['concepts.html', 'Concepts', 'Images, containers, the lifecycle', L['first-containers'].steps.length + ' commands run'],
    ['dockerfile.html', 'Images', 'Write a Dockerfile, build, run', G.fmtBytes(M.imageBytes) + ' image, 5 build steps'],
    ['compose.html', 'Compose', 'Several containers from one file', services + ' services, 1 file'],
    ['networking.html', 'Networks and volumes', 'Finding each other, keeping data', 'names resolve only on a network you create'],
    ['swarm.html', 'Swarm', 'Replicas and a rolling update', '3 replicas, scaled to 5'],
    ['commands.html', 'Commands', 'Every command used here, with its output', cmds + ' commands, all run'],
    ['about.html', 'How this is checked', 'Versions, gaps, sources', 'Docker ' + G.verified.docker],
  ];
  $('#chapters').innerHTML = items.map(function (i) { return '<li><a href="' + i[0] + '"><b>' + esc(i[1]) + '</b><span>' + esc(i[2]) + '</span><em>' + esc(i[3]) + '</em></a></li>'; }).join('');

  G.get('lab/hello-node/Dockerfile', true).then(function (t) { dfText = t; mapLines(); draw(); });
});
