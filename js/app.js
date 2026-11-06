/* ===== Движок сайта =====
   Здесь логика: масштабирование сцены, меню, показ реплик.
   Тексты и картинки уроков менять не здесь, а в js/data/. */
(function () {
  'use strict';

  /* Скорость печати текста: миллисекунды на букву. 0 — показывать весь текст сразу. */
  var TYPE_SPEED = 28;

  var $ = function (id) { return document.getElementById(id); };
  var stage = $('stage');
  var menuScreen = $('menu');
  var lessonScreen = $('lesson');
  var fadeEl = $('fade');
  var rotateEl = $('rotate');
  var cardsEl = $('cards');
  var charsEl = $('chars');
  var dialog = $('dialog');
  var nameTag = $('nameTag');
  var textEl = $('text');
  var nextArrow = $('nextArrow');
  var btnReplay = $('btnReplay');
  var layers = [$('bgA'), $('bgB')];

  /* ---------- Масштаб сцены 16:9 и подсказка про поворот ---------- */
  function fit() {
    var w = window.innerWidth, h = window.innerHeight;
    stage.style.setProperty('--scale', Math.min(w / 1600, h / 900));
    rotateEl.classList.toggle('show', h > w && w < 900);
  }
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  fit();

  /* ---------- Полный экран ---------- */
  var root = document.documentElement;
  var requestFs = root.requestFullscreen || root.webkitRequestFullscreen;
  function toggleFullscreen() {
    var d = document;
    if (d.fullscreenElement || d.webkitFullscreenElement) {
      (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      return;
    }
    if (!requestFs) return;
    var p = requestFs.call(root);
    if (p && p.then) {
      p.then(function () {
        try { screen.orientation.lock('landscape').catch(function () {}); } catch (e) {}
      }).catch(function () {});
    }
  }
  Array.prototype.forEach.call(document.querySelectorAll('.fs-btn'), function (b) {
    if (!requestFs) { b.style.display = 'none'; return; }
    b.addEventListener('click', function (e) { e.stopPropagation(); toggleFullscreen(); b.blur(); });
  });

  /* ---------- Загрузка картинок заранее, чтобы не было миганий ---------- */
  (function preload() {
    var list = [];
    Object.keys(window.BACKGROUNDS).forEach(function (k) { list.push(window.BACKGROUNDS[k]); });
    Object.keys(window.CHARACTERS).forEach(function (k) { list.push(window.CHARACTERS[k].image); });
    window.LESSONS.forEach(function (l) { list.push(l.card); });
    list.forEach(function (src) { var i = new Image(); i.src = src; });
  })();

  /* ---------- Переключение экранов с затемнением ---------- */
  var busy = false;
  function transition(change) {
    if (busy) return;
    busy = true;
    fadeEl.classList.add('on');
    setTimeout(function () {
      change();
      requestAnimationFrame(function () {
        fadeEl.classList.remove('on');
        setTimeout(function () { busy = false; }, 360);
      });
    }, 380);
  }
  function showScreen(name) {
    menuScreen.classList.toggle('active', name === 'menu');
    lessonScreen.classList.toggle('active', name === 'lesson');
  }

  /* ---------- Меню ---------- */
  window.LESSONS.forEach(function (lesson) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'card' + (lesson.soon ? ' soon' : '');
    btn.setAttribute('aria-label', lesson.title);
    if (lesson.soon) btn.setAttribute('aria-disabled', 'true');
    var img = document.createElement('img');
    img.src = lesson.card;
    img.alt = lesson.title;
    btn.appendChild(img);
    btn.addEventListener('click', function () {
      if (lesson.soon) return;
      startLesson(lesson);
    });
    cardsEl.appendChild(btn);
  });

  /* ---------- Герои ---------- */
  var charEls = {};
  Object.keys(window.CHARACTERS).forEach(function (id) {
    var c = window.CHARACTERS[id];
    var slot = document.createElement('div');
    slot.className = 'slot slot-' + c.slot;
    var img = document.createElement('img');
    img.className = 'char';
    img.src = c.image;
    img.alt = c.name;
    slot.appendChild(img);
    charsEl.appendChild(slot);
    charEls[id] = img;
  });

  /* ---------- Фон с плавной сменой ---------- */
  var bgState = { key: null, layer: 0 };
  function setBg(key, instant) {
    if (bgState.key === key) return;
    var url = window.BACKGROUNDS[key];
    if (!url) return;
    bgState.key = key;
    bgState.layer ^= 1;
    var next = layers[bgState.layer];
    var prev = layers[bgState.layer ^ 1];
    clearTimeout(next._t);
    clearTimeout(prev._t);
    next.style.transition = 'none';
    next.style.opacity = '0';
    next.style.zIndex = '2';
    next.style.backgroundImage = 'url("' + url + '")';
    prev.style.zIndex = '1';
    void next.offsetWidth;
    if (instant) {
      next.style.opacity = '1';
      prev.style.opacity = '0';
      return;
    }
    next.style.transition = 'opacity 0.7s ease';
    next.style.opacity = '1';
    prev._t = setTimeout(function () { prev.style.opacity = '0'; }, 760);
  }

  function setVisible(id, on) {
    if (charEls[id]) charEls[id].classList.toggle('visible', on);
  }

  /* ---------- Озвучка (если у шага есть audio) ---------- */
  var audio = null;
  var currentAudioSrc = null;
  function stopAudio() {
    if (audio) { audio.pause(); audio = null; }
  }
  function playAudio(src) {
    stopAudio();
    if (!src) return;
    audio = new Audio(src);
    var p = audio.play();
    if (p && p.catch) p.catch(function () {});
  }
  btnReplay.addEventListener('click', function (e) {
    e.stopPropagation();
    if (currentAudioSrc) playAudio(currentAudioSrc);
    btnReplay.blur();
  });

  /* ---------- Печать текста ---------- */
  var typing = null;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function renderText(shownCount) {
    var full = typing.full;
    textEl.textContent = '';
    var a = document.createElement('span');
    a.textContent = full.slice(0, shownCount);
    var b = document.createElement('span');
    b.className = 'rest';
    b.textContent = full.slice(shownCount);
    textEl.appendChild(a);
    textEl.appendChild(b);
  }
  function finishTyping() {
    if (!typing) return;
    clearInterval(typing.timer);
    typing.n = typing.full.length;
    renderText(typing.n);
    nextArrow.classList.add('ready');
  }
  function startTyping(text) {
    if (typing) clearInterval(typing.timer);
    nextArrow.classList.remove('ready');
    typing = { full: text, n: 0, timer: null };
    if (!TYPE_SPEED || reduceMotion) {
      finishTyping();
      return;
    }
    renderText(0);
    typing.timer = setInterval(function () {
      typing.n += 1;
      renderText(typing.n);
      if (typing.n >= typing.full.length) finishTyping();
    }, TYPE_SPEED);
  }
  function isTyping() { return typing && typing.n < typing.full.length; }

  /* ---------- Урок ---------- */
  var steps = [];
  var idx = -1;

  function applyCommands(step, instant) {
    if (step.bg) setBg(step.bg, instant);
    (step.hide || []).forEach(function (id) { setVisible(id, false); });
    (step.show || []).forEach(function (id) { setVisible(id, true); });
  }

  function showLine(step) {
    Object.keys(charEls).forEach(function (id) {
      charEls[id].classList.toggle('speaking', !step.who || id === step.who);
    });
    var c = step.who ? window.CHARACTERS[step.who] : null;
    if (c) {
      nameTag.textContent = c.name;
      nameTag.style.setProperty('--tag-bg', c.tagBg);
      nameTag.style.setProperty('--tag-fg', c.tagFg);
      nameTag.style.display = 'flex';
    } else if (step.tag) {
      nameTag.textContent = step.tag;
      nameTag.style.setProperty('--tag-bg', '#3b82f6');
      nameTag.style.setProperty('--tag-fg', '#ffffff');
      nameTag.style.display = 'flex';
    } else {
      nameTag.style.display = 'none';
    }
    dialog.classList.toggle('note', !!step.note);
    currentAudioSrc = step.audio || null;
    btnReplay.disabled = !currentAudioSrc;
    startTyping(step.text || '');
    playAudio(currentAudioSrc);
  }

  /* Перейти к шагу i. rebuild: true — восстановить всё с начала (для старта и «назад») */
  function goTo(i, rebuild) {
    if (rebuild) {
      Object.keys(charEls).forEach(function (id) { setVisible(id, false); });
      bgState.key = null;
      for (var k = 0; k <= i; k++) applyCommands(steps[k], true);
    } else {
      applyCommands(steps[i], false);
    }
    idx = i;
    showLine(steps[i]);
  }

  function startLesson(lesson) {
    var data = window.LESSON_STEPS[lesson.steps];
    if (!data || !data.length) return;
    transition(function () {
      steps = data;
      showScreen('lesson');
      goTo(0, true);
    });
  }

  function exitLesson() {
    transition(function () {
      stopAudio();
      if (typing) clearInterval(typing.timer);
      showScreen('menu');
    });
  }

  function lessonActive() { return lessonScreen.classList.contains('active') && !busy; }

  function advance() {
    if (!lessonActive()) return;
    if (isTyping()) { finishTyping(); return; }
    if (idx + 1 >= steps.length) { exitLesson(); return; }
    goTo(idx + 1, false);
  }
  function back() {
    if (!lessonActive() || idx <= 0) return;
    goTo(idx - 1, true);
  }

  lessonScreen.addEventListener('click', function (e) {
    if (e.target.closest('button')) return;
    advance();
  });
  $('btnMenu').addEventListener('click', function (e) {
    e.stopPropagation();
    this.blur();
    if (lessonActive()) exitLesson();
  });

  document.addEventListener('keydown', function (e) {
    if (!lessonScreen.classList.contains('active')) return;
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') {
      e.preventDefault();
      if (!e.repeat) advance();
    } else if (e.code === 'ArrowLeft' || e.code === 'Backspace') {
      e.preventDefault();
      back();
    } else if (e.code === 'Escape') {
      if (lessonActive()) exitLesson();
    }
  });
})();
