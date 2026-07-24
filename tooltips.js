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

function showTooltip(anchorEl, text, variant) {
  hideTooltip();
  activeTooltip = document.createElement('div');
  activeTooltip.className = 'hover-tooltip hover-tooltip-' + variant;
  activeTooltip.textContent = text;
  document.body.appendChild(activeTooltip);

  var rect = anchorEl.getBoundingClientRect();
  activeTooltip.style.top = (rect.bottom + window.scrollY + 8) + 'px';
  activeTooltip.style.left = (rect.left + window.scrollX) + 'px';

  requestAnimationFrame(function () {
    if (!activeTooltip) return;
    var tRect = activeTooltip.getBoundingClientRect();
    if (tRect.right > window.innerWidth - 16) {
      activeTooltip.style.left = (window.innerWidth - tRect.width - 16 + window.scrollX) + 'px';
    }
  });
}

function hideTooltip() {
  if (activeTooltip) {
    activeTooltip.remove();
    activeTooltip = null;
  }
}

function initTermHints() {
  document.querySelectorAll('.term-hint').forEach(function (el) {
    if (el.dataset.bound) return;
    el.dataset.bound = '1';
    var src = el.getAttribute('data-src');
    var cache = null;

    el.addEventListener('mouseenter', function () {
      if (cache) { showTooltip(el, cache, 'hint'); return; }
      var basePath = location.pathname.replace(/[^\/]*$/, '');
      fetch(basePath + src)
        .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
        .then(function (text) {
          cache = extractFirstParagraph(text);
          showTooltip(el, cache, 'hint');
        })
        .catch(function () {
          cache = 'Не удалось загрузить определение.';
          showTooltip(el, cache, 'hint');
        });
    });
    el.addEventListener('mouseleave', hideTooltip);
  });
}

function initLinkPreviews() {
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

window.initTooltips = function () {
  initTermHints();
  initLinkPreviews();
};