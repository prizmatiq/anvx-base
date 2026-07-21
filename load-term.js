function parseDoDontItems(block) {
  return block
    .split('\n')
    .map(function (line) { return line.trim(); })
    .filter(function (line) { return line.indexOf('-') === 0; })
    .map(function (line) { return line.replace(/^-+\s*/, '').trim(); });
}

var CHECK_ICON = '<span class="li-icon check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>';
var CROSS_ICON = '<span class="li-icon cross"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>';

function buildList(items, icon) {
  return items.map(function (i) { return '<li>' + icon + '<span>' + i + '</span></li>'; }).join('\n');
}

var TELEGRAM_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
var EMAIL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22 6 12 13 2 6"></polyline></svg>';

// Преобразует :::contact <адрес> в кнопку-ссылку. Понимает три формата:
// :::contact @username        -> https://t.me/username
// :::contact user@mail.com    -> mailto:user@mail.com
// :::contact https://t.me/... -> ссылка как есть (например, инвайт в чат)
function transformContact(md) {
  return md.replace(/^:::contact\s+(\S+)\s*$/gm, function (match, value) {
    var href, label, icon;
    if (/^https?:\/\//.test(value)) {
      href = value;
      label = 'Telegram';
      icon = TELEGRAM_ICON;
    } else if (/^@/.test(value)) {
      href = 'https://t.me/' + value.slice(1);
      label = value;
      icon = TELEGRAM_ICON;
    } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      href = 'mailto:' + value;
      label = value;
      icon = EMAIL_ICON;
    } else {
      href = 'https://t.me/' + value;
      label = '@' + value;
      icon = TELEGRAM_ICON;
    }
    return '\n<a class="contact-button" href="' + href + '" target="_blank" rel="noopener">' +
      icon + '<span>' + label + '</span></a>\n';
  });
}

// Преобразует пользовательский синтаксис :::do / :::do-not в готовый HTML-блок
// со списками ✅/❌, до того как текст попадёт в marked.parse.
function transformDoDont(md) {
  // парный случай: do сразу за которым идёт do-not — двухколоночный блок
  md = md.replace(
    /:::do\s*\n([\s\S]*?)\n:::\s*\n+:::do-not\s*\n([\s\S]*?)\n:::/g,
    function (match, doBlock, dontBlock) {
      var doItems = parseDoDontItems(doBlock);
      var dontItems = parseDoDontItems(dontBlock);
      return '\n<div class="do-dont">\n<div>\n<ul>\n' + buildList(doItems, CHECK_ICON) +
        '\n</ul>\n</div>\n<div>\n<ul>\n' + buildList(dontItems, CROSS_ICON) +
        '\n</ul>\n</div>\n</div>\n';
    }
  );

  // одиночный :::do без пары
  md = md.replace(/:::do\s*\n([\s\S]*?)\n:::/g, function (match, block) {
    return '\n<ul class="do-dont-list">\n' + buildList(parseDoDontItems(block), CHECK_ICON) + '\n</ul>\n';
  });

  // одиночный :::do-not без пары
  md = md.replace(/:::do-not\s*\n([\s\S]*?)\n:::/g, function (match, block) {
    return '\n<ul class="do-dont-list">\n' + buildList(parseDoDontItems(block), CROSS_ICON) + '\n</ul>\n';
  });

  return md;
}

document.addEventListener('DOMContentLoaded', function () {
  var container = document.getElementById('term-content');
  if (!container) return;

  var mdPath = location.pathname.replace(/\.html$/, '.md');

  fetch(mdPath)
    .then(function (res) {
      if (!res.ok) throw new Error('Файл не найден: ' + mdPath);
      return res.text();
    })
    .then(function (md) {
      container.innerHTML = marked.parse(transformDoDont(transformContact(md)));

      var h1 = container.querySelector('h1');
      if (h1) {
        document.title = h1.textContent + ' — База ANVX';

        var row = document.createElement('div');
        row.className = 'page-title-row';

        var back = document.createElement('a');
        back.href = 'index.html';
        back.className = 'back-button';
        back.setAttribute('aria-label', 'Назад к терминам');
        back.textContent = '←';

        h1.parentNode.insertBefore(row, h1);
        row.appendChild(back);
        row.appendChild(h1);
      }

      if (window.initTOC) window.initTOC();
    })
    .catch(function (err) {
      container.innerHTML = '<p>Не удалось загрузить содержимое термина (' + mdPath + ').</p>';
      console.error(err);
    });
});
