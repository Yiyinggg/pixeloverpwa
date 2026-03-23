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
  'images/home1.png',
  'images/home2.png',
  'images/home3.png',
  'images/home4-indoor-placeholder.svg'
];

var HOME_LABELS = ['森林', '草地', '海边', '室内'];

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
  var btns = document.querySelectorAll('#s-home .home-state-btn .home-state-label');
  for (var i = 0; i < btns.length; i++) {
    if (HOME_LABELS[i]) btns[i].textContent = HOME_LABELS[i];
  }
}

window.setHomeState = function(n) {
  n = parseInt(n, 10);
  if (n < 1 || n > 4) return;
  var root = document.getElementById('s-home');
  if (!root) return;
  root.setAttribute('data-home-state', String(n));
  document.querySelectorAll('#phone-home-bg .phone-bg-img').forEach(function(img) {
    img.classList.toggle('active', parseInt(img.getAttribute('data-state'), 10) === n);
  });
  document.querySelectorAll('#s-home .home-state-btn').forEach(function(b) {
    b.classList.toggle('active', parseInt(b.getAttribute('data-state'), 10) === n);
  });
  try {
    localStorage.setItem('pixelHomeScene', String(n));
  } catch (e) {}
};

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
  homeDayKey = dayKey(new Date());
  var saved = 1;
  try {
    saved = parseInt(localStorage.getItem('pixelHomeScene'), 10) || 1;
  } catch (e) {}
  if (saved < 1 || saved > 4) saved = 1;
  setHomeState(saved);
}

function refreshHomeScreenIfNewDay() {
  var k = dayKey(new Date());
  if (k !== homeDayKey) {
    homeDayKey = k;
    applyHudDate();
    renderHomeCalendar();
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
