var TOOLTIP_MAX_LEN = 180;
var activeTooltip = null;

function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/\{\{(.+?)\|.+?\}\}/g, '$1')
    .replace(/:::[\s\S]*?:::/g, '')
    .replace(/[*_`>]/g, '')
    .trim();
}

function extractExcerpt(md, maxLen) {
  var stripped = stripMarkdown(md).replace(/\s+/g, ' ').trim();
  if (stripped.length <= maxLen) return stripped;
  return stripped.slice(0, maxLen).trim() + '…';
}

function extractFirstParagraph(md) {
  var stripped = stripMarkdown(md);
  var paragraphs = stripped.split(/\n\s*\n/).map(function (p) { return p.replace(/\s+/g, ' ').trim(); }).filter(Boolean);
  return paragraphs[0] || '';
}

// --- превью обычных ссылок (наведение, только десктоп) ---

function showTooltip(anchorEl, text, variant) {
  hideTooltip();
  activeTooltip = document.createElement('div');
  activeTooltip.className = 'hover-tooltip hover-tooltip-' + variant;
  activeTooltip.textContent = text;
  document.body.appendChild(activeTooltip);

  var rect = anchorEl.getBoundingClientRect();
  var tRect = activeTooltip.getBoundingClientRect();

  var top = rect.top + window.scrollY - tRect.height - 8;
  var left = rect.left + window.scrollX;

  if (left + tRect.width > window.innerWidth - 16) {
    left = window.innerWidth - tRect.width - 16 + window.scrollX;
  }

  activeTooltip.style.top = top + 'px';
  activeTooltip.style.left = left + 'px';
}

function hideTooltip() {
  if (activeTooltip) {
    activeTooltip.remove();
    activeTooltip = null;
  }
}

function initLinkPreviews() {
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!canHover) return;

  document.querySelectorAll('.content a[href$="/"]').forEach(function (a) {
    if (a.dataset.bound) return;
    a.dataset.bound = '1';
    var cache = null;

    a.addEventListener('mouseenter', function () {
      if (cache) { showTooltip(a, cache, 'preview'); return; }
      var mdUrl = new URL('document.md', a.href).href;
      fetch(mdUrl)
        .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
        .then(function (text) {
          cache = extractExcerpt(text, TOOLTIP_MAX_LEN);
          showTooltip(a, cache, 'preview');
        })
        .catch(function () { /* нет document.md по этому пути — просто не показываем превью */ });
    });
    a.addEventListener('mouseleave', hideTooltip);
  });
}

// --- {{...}}-подсказки (клик, модальное окно с заголовком) ---

var activeModal = null;

function openHintModal(title, text) {
  closeHintModal();

  var backdrop = document.createElement('div');
  backdrop.className = 'hint-modal-backdrop';

  var modal = document.createElement('div');
  modal.className = 'hint-modal';

  var close = document.createElement('button');
  close.className = 'hint-modal-close';
  close.setAttribute('aria-label', 'Закрыть');
  close.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  close.addEventListener('click', closeHintModal);

  var scroll = document.createElement('div');
  scroll.className = 'hint-modal-scroll';

  var titleEl = document.createElement('h3');
  titleEl.className = 'hint-modal-title';
  titleEl.textContent = title;

  var textEl = document.createElement('div');
  textEl.className = 'hint-modal-text';
  textEl.textContent = text;

  scroll.appendChild(titleEl);
  scroll.appendChild(textEl);
  modal.appendChild(close);
  modal.appendChild(scroll);
  backdrop.appendChild(modal);

  backdrop.addEventListener('click', function (e) {
    if (e.target === backdrop) closeHintModal();
  });

  document.addEventListener('keydown', escCloseHandler);

  document.body.appendChild(backdrop);
  activeModal = backdrop;
}

function escCloseHandler(e) {
  if (e.key === 'Escape') closeHintModal();
}

function closeHintModal() {
  if (activeModal) {
    activeModal.remove();
    activeModal = null;
    document.removeEventListener('keydown', escCloseHandler);
  }
}

function initTermHints() {
  document.querySelectorAll('.term-hint').forEach(function (el) {
    if (el.dataset.bound) return;
    el.dataset.bound = '1';
    var src = el.getAttribute('data-src');
    var title = el.textContent;
    var cache = null;

    el.addEventListener('click', function () {
      if (cache) { openHintModal(title, cache); return; }
      var basePath = location.pathname.replace(/[^\/]*$/, '');
      fetch(basePath + src)
        .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
        .then(function (text) {
          cache = extractFirstParagraph(text);
          openHintModal(title, cache);
        })
        .catch(function () {
          cache = 'Не удалось загрузить определение.';
          openHintModal(title, cache);
        });
    });
  });
}

window.initTooltips = function () {
  initTermHints();
  initLinkPreviews();
};