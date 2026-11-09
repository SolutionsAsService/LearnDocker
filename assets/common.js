/* Learn Docker: chrome, data, transcripts. No dependencies. Everything printed as a result comes from data/lessons.json,
   which scripts/check.mjs fills from real runs against a Docker daemon. */
(function () {
  'use strict';
  var REPO = 'https://github.com/SolutionsAsService/LearnDocker';
  var NAV = [['concepts', 'concepts.html', 'Concepts'], ['dockerfile', 'dockerfile.html', 'Images'], ['compose', 'compose.html', 'Compose'], ['networking', 'networking.html', 'Networks'], ['swarm', 'swarm.html', 'Swarm'], ['commands', 'commands.html', 'Commands'], ['about', 'about.html', 'How this is checked']];
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function get(p, text) {
    return fetch(new URL(p, document.baseURI)).then(function (r) {
      if (!r.ok) throw new Error(p + ': HTTP ' + r.status);
      return text ? r.text() : r.json();
    });
  }
  function fmtBytes(b) {
    if (b < 1000) return b + ' B';
    if (b < 1e6) return (b / 1e3).toFixed(b < 1e4 ? 1 : 0) + ' kB';
    if (b < 1e9) return (b / 1e6).toFixed(b < 1e7 ? 1 : 0) + ' MB';
    return (b / 1e9).toFixed(2) + ' GB';
  }

  function chrome(active) {
    var h = document.createElement('header');
    h.className = 'site';
    h.innerHTML = '<a class="skip" href="#main">Skip to content</a><div class="wrap topbar"><a class="brand" href="index.html" aria-label="Learn Docker, home">' +
      '<svg width="26" height="22" viewBox="0 0 26 22" aria-hidden="true"><g fill="currentColor"><rect x="1" y="12" width="7" height="8" /><rect x="9" y="12" width="7" height="8" /><rect x="17" y="12" width="7" height="8" /><rect x="9" y="3" width="7" height="8" /></g><rect x="17" y="3" width="7" height="8" fill="var(--ran)"/></svg>Learn Docker</a>' +
      '<nav aria-label="Main">' + NAV.map(function (n) { return '<a href="' + n[1] + '"' + (n[0] === active ? ' aria-current="page"' : '') + '>' + n[2] + '</a>'; }).join('') + '</nav></div>';
    document.body.insertBefore(h, document.body.firstChild);
    var f = document.createElement('footer');
    f.className = 'site';
    f.innerHTML = '<div class="wrap"><p>Unofficial. Not affiliated with Docker, Inc. Docker is its owners’ trademark; the source of truth is the <a href="https://docs.docker.com/">Docker documentation</a>.</p>' +
      '<p><span id="stamp-foot"></span> <a href="about.html">How this is checked</a> · <a href="' + REPO + '/issues">Report a mistake</a> · <a href="' + REPO + '">Source</a> · MIT licence</p></div>';
    document.body.appendChild(f);
  }

  function copyBtn(text) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'copy'; b.textContent = 'Copy'; b.setAttribute('aria-label', 'Copy: ' + String(text).split('\n')[0].slice(0, 70));
    b.addEventListener('click', function () {
      var done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () { b.textContent = 'Select and copy'; }); else b.textContent = 'Select and copy';
    });
    return b;
  }

  function step(s) {
    var d = document.createElement('div');
    d.className = 'step';
    if (s.note) d.insertAdjacentHTML('beforeend', '<p class="note">' + esc(s.note) + '</p>');
    var t = document.createElement('div');
    t.className = 'term';
    t.innerHTML = '<code class="cmd" style="background:none;border:0">' + esc(s.cmd) + '</code>' + (s.out ? '<pre class="out" tabindex="0" role="region" aria-label="Output of that command">' + esc(s.out) + '</pre>' : '');
    t.insertBefore(copyBtn(s.cmd), t.firstChild);
    d.appendChild(t);
    return d;
  }
  function fileBlock(name, body) {
    var d = document.createElement('div');
    d.className = 'file';
    d.innerHTML = '<span class="name">' + esc(name) + '</span><pre tabindex="0" role="region" aria-label="' + esc(name) + '"><code style="background:none;border:0;padding:0">' + esc(body.replace(/\n$/, '')) + '</code></pre>';
    d.insertBefore(copyBtn(body), d.firstChild);
    return d;
  }

  function boot(active, fn) {
    chrome(active);
    Promise.all([get('data/lessons.json'), get('data/verified.json'), get('data/measured.json')]).then(function (d) {
      var G = { lessons: d[0], verified: d[1], measured: d[2], esc: esc, $: $, $$: $$, fmtBytes: fmtBytes, get: get, step: step, fileBlock: fileBlock };
      G.byId = {}; G.lessons.forEach(function (l) { G.byId[l.id] = l; });
      var v = G.verified;
      var stamp = 'Every command shown was run on Docker ' + v.docker + ' (Compose ' + v.compose + '), ' + v.arch + ', on ' + v.date + '. The output is from that run.';
      $$('.stamp').forEach(function (el) { el.textContent = stamp; });
      var foot = $('#stamp-foot'); if (foot) foot.textContent = 'Checked on Docker ' + v.docker + ' on ' + v.date + '.';
      function layerBytes(re) { var l = G.measured.layers.filter(function (x) { return re.test(x.by); })[0]; return l ? l.bytes : 0; }
      $$('[data-fig]').forEach(function (el) {
        var k = el.getAttribute('data-fig');
        var steps = G.lessons.reduce(function (n, l) { return n + l.steps.length; }, 0);
        var val = { docker: v.docker, compose: v.compose, date: v.date, arch: v.arch, base: v.base, lessons: G.lessons.length, commands: steps, image: fmtBytes(G.measured.imageBytes), copybytes: fmtBytes(layerBytes(/^COPY \. \./)), npmbytes: fmtBytes(layerBytes(/npm install/)) }[k];
        if (val !== undefined) el.textContent = val;
      });
      // [data-lesson="id"] renders that lesson's steps; [data-file="path"] fetches and shows a file from the repo; [data-extra="lesson:name"] shows a file the lesson writes
      $$('[data-lesson]').forEach(function (el) {
        var l = G.byId[el.getAttribute('data-lesson')]; if (!l) return;
        var only = el.getAttribute('data-steps'); // "0-2" to show a range
        var from = 0, to = l.steps.length;
        if (only) { var p = only.split('-'); from = +p[0]; to = +p[1] + 1; }
        l.steps.slice(from, to).forEach(function (s) { el.appendChild(step(s)); });
      });
      $$('[data-extra]').forEach(function (el) {
        var p = el.getAttribute('data-extra').split(':'), l = G.byId[p[0]];
        if (l && l.extra && l.extra[p[1]]) el.replaceWith(fileBlock(p[1], l.extra[p[1]]));
      });
      var files = $$('[data-file]');
      Promise.all(files.map(function (el) {
        var path = el.getAttribute('data-file');
        return get(path, true).then(function (t) { el.replaceWith(fileBlock(el.getAttribute('data-name') || path.replace('lab/hello-node/', ''), t)); });
      })).then(function () { if (fn) fn(G); });
    }).catch(function (err) {
      console.error(err);
      var m = $('#main'); if (m) m.insertAdjacentHTML('afterbegin', '<p class="notice" role="alert">Data could not be loaded (' + esc(err.message) + '). Serve this folder instead of opening the file, for example with <code>npx serve .</code>.</p>');
    });
  }
  window.LD = { boot: boot, esc: esc, $: $, $$: $$, fmtBytes: fmtBytes };
})();
