document.addEventListener('DOMContentLoaded', function () {
  var h1 = document.querySelector('.content h1');
  var h2s = document.querySelectorAll('.content h2');
  if (!h1 && h2s.length === 0) return;

  var headings = [];
  if (h1) headings.push(h1);
  h2s.forEach(function (h) { headings.push(h); });

  var toc = document.createElement('div');
  toc.className = 'toc';

  var trigger = document.createElement('div');
  trigger.className = 'toc-trigger';

  var panel = document.createElement('div');
  panel.className = 'toc-panel';

  headings.forEach(function (h, i) {
    var dash = document.createElement('span');
    dash.className = 'toc-dash';
    trigger.appendChild(dash);

    if (!h.id) {
      h.id = 'section-' + i + '-' + h.textContent
        .trim()
        .toLowerCase()
        .replace(/[^a-zа-яё0-9]+/gi, '-')
        .replace(/(^-|-$)/g, '');
    }

    var link = document.createElement('a');
    link.href = '#' + h.id;
    link.textContent = h.textContent;
    link.addEventListener('click', function (e) {
      e.preventDefault();
      document.getElementById(h.id).scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    panel.appendChild(link);
  });

  toc.appendChild(trigger);
  toc.appendChild(panel);
  document.body.appendChild(toc);
});
