'use strict';

/* 改这个数字，刷新后看右下角：若显示 v3 说明新代码生效，否则是缓存 */
window.PIXEL_VER = 3;

/* ══════════════════════════════════
   APP — Home + Bottle logic
══════════════════════════════════ */

/* ── Routing ── */
var mapReady = false;

window.switchTo = function(id) {
  document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById(id).classList.add('active');
  ['s-home', 's-map', 's-bottle'].forEach(function(sid, i) {
    document.getElementById(['nb-home', 'nb-map', 'nb-btl'][i]).classList.toggle('active', sid === id);
  });
  var cal = document.getElementById('home-px-cal');
  if (cal) cal.classList.toggle('cal-on-home', id === 's-home');
  var nav = document.getElementById('home-state-nav');
  if (nav) nav.style.display = (id === 's-home') ? 'flex' : 'none';
  var poem = document.getElementById('home-poem');
  if (poem) poem.style.display = (id === 's-home') ? 'block' : 'none';
  var tz = document.getElementById('home-tap-zone');
  if (tz) tz.style.display = (id === 's-home') ? 'block' : 'none';
  if (id === 's-map') {
    if (!mapReady) { mapReady = true; }
    initLeaflet();
  }
  if (id === 's-home') {
    refreshHomeScreenIfNewDay();
  }
};

/* ══════════════════════════════════
   HOME — 顶栏月历 + 四张背景图
   1) 换图文件名：改 HOME_BG_FILES（顺序 = HOME 1～4）
   2) 换按钮上的字：改 HOME_LABELS
   3) 图换了刷新仍旧：把 HOME_ASSET_V 改成新数字（强制绕过缓存）
══════════════════════════════════ */

var HOME_BG_FILES = [
  'images/carcamping.png',   // 1  FOREST
  'images/beachparty.png',   // 2  SEASIDE
  'images/citywalk.png',     // 3  CITY
  'images/diving.png',       // 4  DIVING
  'images/citymotor.png',    // 5  MOTO
  'images/driving.png',      // 6  DRIVE
  'images/working.png',      // 7  WORK
  'images/sleep.png',        // 8  SLEEP
  'images/movie.png',        // 9  MOVIE
  'images/adventure.png'     // 10 ADVENTURE
];

var HOME_LABELS = ['FOREST', 'SEASIDE', 'CITY', 'DIVING', 'MOTO', 'DRIVE', 'WORK', 'SLEEP', 'MOVIE', 'ADVENTURE'];

var DAILY_POEMS = [
  'I carry your heart with me.',
  'You are my sun in winter.',
  'Love is the only gold.',
  'You and me. Always.',
  'Together is beautiful.',
  'You make me whole.',
  'My heart is yours.',
  'Every day I think of you.',
  'Still I love you.',
  'You are my peace.',
  'Near or far, we are ours.',
  'Two hearts, one path.',
  'Thank you. For all of it.',
  'You complete me.',
  'I love you more today.',
  'Missing you always.',
  'Home is where you are.',
  'You are my light.',
  'Always and forever, yours.',
  'Love never ends.',
  'You are enough.',
  'My favorite person.',
  'Stay with me. Please.',
  'Our story is my favorite.',
  'I found you. Lucky me.',
  'You are the poem.',
  'Forever is not long enough.',
  'Counting days. Not long now.',
  'I think of you. Always.',
  'Soon. Very soon. Promise.',
  'You are worth every mile.'
];

/** 换素材后改成 2、3… 即可让浏览器重新拉图片 */
var HOME_ASSET_V = '2';

var homeDayKey = '';

function dayKey(d) {
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

function homeBgUrl(n) {
  var path = HOME_BG_FILES[n - 1] || 'images/home' + n + '.png';
  var sep = path.indexOf('?') >= 0 ? '&' : '?';
  return path + sep + 'v=' + encodeURIComponent(HOME_ASSET_V);
}

function applyHomeLabels() {
  var btns = document.querySelectorAll('.home-state-btn .home-state-label');
  for (var i = 0; i < btns.length; i++) {
    if (HOME_LABELS[i]) btns[i].textContent = HOME_LABELS[i];
  }
}

window.setHomeState = function(n) {
  n = parseInt(n, 10);
  if (n < 1 || n > 10) return;
  var root = document.getElementById('s-home');
  if (!root) return;
  root.setAttribute('data-home-state', String(n));
  document.querySelectorAll('#phone-home-bg .phone-bg-img').forEach(function(img) {
    img.classList.toggle('active', parseInt(img.getAttribute('data-state'), 10) === n);
  });
  document.querySelectorAll('.home-state-btn').forEach(function(b) {
    b.classList.toggle('active', parseInt(b.getAttribute('data-state'), 10) === n);
  });
  try {
    localStorage.setItem('pixelHomeScene', String(n));
  } catch (e) {}
};

function renderDailyPoem() {
  var el = document.getElementById('poem-text');
  if (!el) return;
  var d = new Date();
  var start = new Date(d.getFullYear(), 0, 0);
  var dayOfYear = Math.floor((d - start) / 86400000);
  var idx = dayOfYear % DAILY_POEMS.length;
  el.textContent = '\u201c' + DAILY_POEMS[idx] + '\u201d';
}

function renderHomeCalendar() {
  var now = new Date();
  var mons = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  var elM = document.getElementById('cal-month-abbr');
  var elD = document.getElementById('cal-day-n');
  if (elM) elM.textContent = mons[now.getMonth()];
  if (elD) elD.textContent = String(now.getDate());
}

function applyHudDate() {
  var el = document.getElementById('hud-date');
  if (!el) return;
  var n = new Date();
  var wk = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  el.textContent = wk[n.getDay()] + ' · 今日 ' + n.getDate() + ' 日';
}

function initHomeScreen() {
  applyHomeLabels();
  applyHudDate();
  renderHomeCalendar();
  renderDailyPoem();
  homeDayKey = dayKey(new Date());
  var saved = 1;
  try {
    saved = parseInt(localStorage.getItem('pixelHomeScene'), 10) || 1;
  } catch (e) {}
  if (saved < 1 || saved > 10) saved = 1;
  setHomeState(saved);
}

function refreshHomeScreenIfNewDay() {
  var k = dayKey(new Date());
  if (k !== homeDayKey) {
    homeDayKey = k;
    applyHudDate();
    renderHomeCalendar();
    renderDailyPoem();
  }
}

(function() {
  initHomeScreen();
  var v = document.createElement('div');
  v.className = 'pixel-ver';
  v.textContent = 'v' + (window.PIXEL_VER || 1);
  v.title = '改 app.js 里 PIXEL_VER 再刷新，数字变了就说明新代码生效';
  var home = document.getElementById('s-home');
  if (home) home.appendChild(v);
})();

/* ══ TAP INTERACTION: hearts · stars · bubble · ripple · combo ══ */

var TAP_BUBBLE_MSGS = [
  'hihi !', '\u2665  \u2665', '*blush*', 'yay ~!',
  '\u2661  !!', 'hehe~', '\u2665\u2665\u2665', 'so cute~', 'aww !!'
];
var TAP_COMBO_MSGS = {
  3:  'LOVELY \u2665',
  5:  'SO CUTE !!',
  8:  'LOVE MAX \u2665',
  12: '\u221e LOVE \u221e'
};
var _tapCount = 0, _tapTimer = null;

function _spawnOne(phone, cls, text, x, y, props, delay) {
  var el = document.createElement('div');
  el.className = cls;
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  for (var k in props) el.style.setProperty(k, props[k]);
  if (delay) el.style.animationDelay = delay + 's';
  phone.appendChild(el);
  el.addEventListener('animationend', function() { el.remove(); });
  return el;
}

window.spawnTapEffect = function(x, y) {
  var phone = document.querySelector('.phone');
  if (!phone) return;
  var pw = phone.clientWidth || 320;

  /* — ripple ring — */
  var rip = document.createElement('div');
  rip.className = 'tap-ripple';
  rip.style.left = x + 'px';
  rip.style.top  = y + 'px';
  phone.appendChild(rip);
  rip.addEventListener('animationend', function() { rip.remove(); });

  /* — hearts (6, float upward with spread) — */
  var hChars  = ['\u2665', '\u2764', '\u2661'];
  var hColors = ['#ff6b8a','#ff9eb5','#f5c842','#ff4d6d','#e87898','#c880c8'];
  for (var i = 0; i < 6; i++) {
    (function(i) {
      _spawnOne(phone, 'tap-heart', hChars[i % hChars.length],
        x + (Math.random() - 0.5) * 40, y,
        {
          '--hx':  ((Math.random() - 0.5) * 70) + 'px',
          '--hy':  -(50 + Math.random() * 80) + 'px',
          '--rot':  ((Math.random() - 0.5) * 28) + 'deg',
          '--rot2': ((Math.random() - 0.5) * 45) + 'deg',
          '--dur':  (0.8 + Math.random() * 0.6) + 's',
          'color':     hColors[Math.floor(Math.random() * hColors.length)],
          'font-size': (10 + Math.floor(Math.random() * 14)) + 'px'
        },
        i * 0.07
      );
    })(i);
  }

  /* — stars (8, burst in all directions) — */
  var sChars  = ['\u2726', '\u2605', '\u2727', '\u22c6', '\u2729', '\u00b7'];
  var sColors = ['#f5c842','#ffffff','#b0d8f8','#ffbcd9','#ffe066','#c8f0b0'];
  for (var j = 0; j < 8; j++) {
    (function(j) {
      var angle = (j / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
      var dist  = 38 + Math.random() * 55;
      _spawnOne(phone, 'tap-star', sChars[j % sChars.length],
        x + (Math.random() - 0.5) * 14, y + (Math.random() - 0.5) * 14,
        {
          '--sx':  (Math.cos(angle) * dist) + 'px',
          '--sy':  (Math.sin(angle) * dist) + 'px',
          '--sr':  (120 + Math.random() * 200) + 'deg',
          '--dur': (0.65 + Math.random() * 0.5) + 's',
          'color':     sColors[j % sColors.length],
          'font-size': (8 + Math.floor(Math.random() * 10)) + 'px'
        },
        j * 0.04
      );
    })(j);
  }

  /* — speech bubble — */
  var bub = document.createElement('div');
  bub.className = 'tap-bubble';
  bub.textContent = TAP_BUBBLE_MSGS[Math.floor(Math.random() * TAP_BUBBLE_MSGS.length)];
  bub.style.left = Math.max(8, Math.min(x - 34, pw - 110)) + 'px';
  bub.style.top  = Math.max(8, y - 65) + 'px';
  phone.appendChild(bub);
  bub.addEventListener('animationend', function() { bub.remove(); });

  /* — background bounce — */
  var activeBg = document.querySelector('#phone-home-bg .phone-bg-img.active');
  if (activeBg) {
    activeBg.classList.remove('tap-bounce');
    void activeBg.offsetWidth;
    activeBg.classList.add('tap-bounce');
    setTimeout(function() { activeBg.classList.remove('tap-bounce'); }, 460);
  }

  /* — combo tracking — */
  _tapCount++;
  clearTimeout(_tapTimer);
  var cnt = _tapCount;
  var comboMsg = cnt >= 12 ? TAP_COMBO_MSGS[12]
               : cnt >= 8  ? TAP_COMBO_MSGS[8]
               : cnt >= 5  ? TAP_COMBO_MSGS[5]
               : cnt >= 3  ? TAP_COMBO_MSGS[3]
               : null;
  if (comboMsg) {
    var combo = document.createElement('div');
    combo.className = 'tap-combo';
    combo.textContent = comboMsg;
    combo.style.left = Math.max(8, Math.min(x - 45, pw - 130)) + 'px';
    combo.style.top  = Math.max(8, y - 95) + 'px';
    phone.appendChild(combo);
    combo.addEventListener('animationend', function() { combo.remove(); });
  }
  _tapTimer = setTimeout(function() { _tapCount = 0; }, 1100);
};

/* — tap handler called by #home-tap-zone onclick — */
window._htap = function(e) {
  var pr = document.querySelector('.phone').getBoundingClientRect();
  window.spawnTapEffect(e.clientX - pr.left, e.clientY - pr.top);
};

/* ── Miss You ── */
window.sendMiss = function() {
  var t = document.getElementById('mtst');
  t.classList.add('show');
  spawnParts(document.getElementById('hbtn'), ['♥', '✦', '·', '★']);
  setTimeout(function() { t.textContent = '♥ HE WILL KNOW.'; }, 600);
  setTimeout(function() {
    t.classList.remove('show');
    setTimeout(function() { t.textContent = '💌 SENDING MISS YOU…'; }, 400);
  }, 2800);
};

function spawnParts(el, chars) {
  var pr = document.querySelector('.phone').getBoundingClientRect();
  var er = el.getBoundingClientRect();
  for (var i = 0; i < 8; i++) (function(i) {
    var p = document.createElement('div');
    p.className = 'prt';
    p.textContent = chars[Math.floor(Math.random() * chars.length)];
    p.style.left  = (er.left - pr.left + er.width  / 2 + (Math.random() - .5) * 30) + 'px';
    p.style.top   = (er.top  - pr.top  + er.height / 2) + 'px';
    p.style.color = ['#e8708a','#f5c842','#f8b0c8','#c880c8'][Math.floor(Math.random() * 4)];
    p.style.zIndex = 150;
    p.style.setProperty('--px', ((Math.random() - .5) * 60) + 'px');
    p.style.setProperty('--py', (-40 - Math.random() * 30) + 'px');
    p.style.animationDelay = (i * .07) + 's';
    document.querySelector('.phone').appendChild(p);
    p.addEventListener('animationend', function() { p.remove(); });
  })(i);
}

/* ── Bottle ── */
var bOpen = false, musicOn = false;

window.openBottle = function() {
  if (bOpen) return;
  var ck = document.createElement('div');
  ck.className = 'cpop';
  document.getElementById('bwrap').appendChild(ck);
  setTimeout(function() {
    ck.remove();
    bOpen = true;
    document.getElementById('rpanel').classList.add('open');
  }, 500);
};

window.closeRecv = function() {
  document.getElementById('rpanel').classList.remove('open');
  bOpen = false;
};

window.setTab = function(i, btn) {
  document.querySelectorAll('.btab').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  var wp = document.getElementById('wpanel');
  if (i === 1) {
    wp.classList.add('open');
    document.getElementById('dft').textContent = '~' + (Math.floor(Math.random() * 23) + 1) + ' HOURS';
  } else {
    wp.classList.remove('open');
  }
};

window.closeWrite = function() {
  document.getElementById('wpanel').classList.remove('open');
  document.querySelectorAll('.btab').forEach(function(b) { b.classList.remove('active'); });
  document.querySelectorAll('.btab')[0].classList.add('active');
};

window.sendBottle = function() {
  if (!document.getElementById('btxt').value.trim()) { showToast('WRITE SOMETHING FIRST!'); return; }
  showToast('🍾 BOTTLE THROWN INTO THE SEA!');
  document.getElementById('btxt').value = '';
  var w = document.getElementById('bwrap');
  w.style.transition = 'transform .8s, opacity .8s';
  w.style.transform  = 'translateX(200%) translateY(-100px) rotate(45deg)';
  w.style.opacity    = '0';
  setTimeout(function() {
    w.style.transition = 'none';
    w.style.transform  = 'translateX(-50%)';
    w.style.opacity    = '1';
  }, 1200);
  window.closeWrite();
};

window.toggleMusic = function() {
  musicOn = !musicOn;
  var btn = document.getElementById('mbtn');
  btn.style.background = musicOn ? '#4a9a4a' : '#3a2a6a';
  btn.innerHTML = musicOn ? '<span>▶</span> ATTACHED!' : '<span>📼</span> ATTACH SONG';
  if (musicOn) showToast('♪ SONG ATTACHED');
};

/* ── Global toast ── */
var tT;
function showToast(msg) {
  var t = document.getElementById('gtst');
  t.textContent = msg;
  t.style.opacity   = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(tT);
  tT = setTimeout(function() {
    t.style.opacity   = '0';
    t.style.transform = 'translateX(-50%) translateY(60px)';
  }, 2600);
}

/* ── Search shortcut (Enter key) ── */
document.getElementById('srch').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') window.doSearch();
});

/* ── PWA：注册后主动检查更新（配合 sw 网络优先） ── */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('sw.js', { scope: './' })
    .then(function (reg) {
      reg.update();
      setInterval(function () {
        reg.update();
      }, 60 * 60 * 1000);
    })
    .catch(function () {});
}
