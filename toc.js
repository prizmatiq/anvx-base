function initTOC() {
  var existing = document.querySelector('.toc');
  if (existing) existing.remove();

  var headings = document.querySelectorAll('.content h1, .content h2, .content h3');
  if (headings.length === 0) return;

  var toc = document.createElement('div');
  toc.className = 'toc';

  var trigger = document.createElement('div');
  trigger.className = 'toc-trigger';

  var panel = document.createElement('div');
  panel.className = 'toc-panel';

  var dashEls = [];
  var linkEls = [];

  headings.forEach(function (h, i) {
    var dash = document.createElement('span');
    dash.className = 'toc-dash toc-dash-' + h.tagName.toLowerCase();
    trigger.appendChild(dash);
    dashEls.push(dash);

    if (!h.id) {
      h.id = 'section-' + i + '-' + h.textContent
        .trim()
        .toLowerCase()
        .replace(/[^a-zа-яё0-9]+/gi, '-')
        .replace(/(^-|-$)/g, '');
    }

    var link = document.createElement('a');
    link.className = 'toc-link-' + h.tagName.toLowerCase();
    link.href = '#' + h.id;
    link.textContent = h.textContent;
    linkEls.push(link);
    var isFirstH1 = (i === 0 && h.tagName === 'H1');
    link.addEventListener('click', function (e) {
      e.preventDefault();
      if (isFirstH1) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        document.getElementById(h.id).scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      h.classList.remove('toc-flash');
      void h.offsetWidth; // перезапуск анимации, если кликнули повторно
      h.classList.add('toc-flash');
      h.addEventListener('animationend', function handler() {
        h.classList.remove('toc-flash');
        h.removeEventListener('animationend', handler);
      });
    });
    panel.appendChild(link);
  });

  toc.appendChild(trigger);
  toc.appendChild(panel);
  document.body.appendChild(toc);

  // подсветка текущего раздела при скролле
  function updateActive() {
    var current = 0;
    for (var i = 0; i < headings.length; i++) {
      if (headings[i].getBoundingClientRect().top <= 120) current = i;
    }
    dashEls.forEach(function (d, i) { d.classList.toggle('active', i === current); });
    linkEls.forEach(function (l, i) { l.classList.toggle('active', i === current); });
  }

  updateActive();
  window.addEventListener('scroll', updateActive, { passive: true });
}

document.addEventListener('DOMContentLoaded', initTOC);
window.initTOC = initTOC;
