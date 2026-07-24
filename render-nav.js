document.addEventListener('DOMContentLoaded', function () {
  var navEl = document.getElementById('site-nav');
  if (!navEl) return;

  var root = window.SITE_ROOT || '';

  fetch(root + 'nav.md')
    .then(function (res) {
      if (!res.ok) throw new Error('nav.md не найден');
      return res.text();
    })
    .then(function (text) {
      var tree = parseNavMd(text);
      var ul = buildList(tree, 1);
      navEl.appendChild(ul);
      autoExpandActive();
    })
    .catch(function (err) {
      console.error(err);
    });

  function parseNavMd(text) {
    var lines = text.split('\n').filter(function (l) { return l.trim().length > 0; });
    var rootItems = [];
    var stack = [{ level: 0, children: rootItems }];

    lines.forEach(function (line) {
      var match = line.match(/^(-+)\s*(.*)$/);
      if (!match) return;
      var level = match[1].length;
      var rest = match[2].trim();

      var linkMatch = rest.match(/^\[(.+?)\]\((.+?)\)$/);
      var item = linkMatch
        ? { label: linkMatch[1], href: linkMatch[2], children: [] }
        : { label: rest, href: null, children: [] };

      while (stack.length && stack[stack.length - 1].level >= level) {
        stack.pop();
      }
      stack[stack.length - 1].children.push(item);
      stack.push({ level: level, children: item.children });
    });

    return rootItems;
  }

  function buildList(items, depth) {
    var ul = document.createElement('ul');
    ul.className = 'site-nav-list';
    ul.style.setProperty('--depth', depth);

    items.forEach(function (item) {
      var li = document.createElement('li');
      li.className = 'site-nav-item';

      var row = document.createElement('div');
      row.className = 'site-nav-row';

      if (item.children.length > 0) {
        var toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'site-nav-toggle';
        toggle.setAttribute('aria-label', 'Развернуть раздел');
        toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        row.appendChild(toggle);
      } else {
        var spacer = document.createElement('span');
        spacer.className = 'site-nav-spacer';
        row.appendChild(spacer);
      }

      var label;
      if (item.href) {
        label = document.createElement('a');
        label.href = root + item.href;
        if (isActive(label.href)) label.classList.add('active');
      } else {
        label = document.createElement('span');
        label.className = 'site-nav-label-text';
      }
      label.textContent = item.label;
      row.appendChild(label);

      li.appendChild(row);

      if (item.children.length > 0) {
        var childUl = buildList(item.children, depth + 1);
        childUl.classList.add('site-nav-children');
        li.appendChild(childUl);
        li.classList.add('open');

        row.querySelector('.site-nav-toggle').addEventListener('click', function () {
          li.classList.toggle('open');
        });
      }

      ul.appendChild(li);
    });

    return ul;
  }

  function isActive(href) {
    var normalize = function (p) { return p.replace(/index\.html$/, '').replace(/\/+$/, ''); };
    var current = normalize(location.pathname);
    var target = normalize(new URL(href, location.href).pathname);
    return target !== '' && current === target;
  }

  function autoExpandActive() {
    var activeLink = navEl.querySelector('a.active');
    if (!activeLink) return;
    var li = activeLink.closest('.site-nav-item');
    while (li) {
      li.classList.add('open');
      var parentUl = li.parentElement;
      li = parentUl ? parentUl.closest('.site-nav-item') : null;
    }
  }
});