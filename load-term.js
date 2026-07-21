function parseDoDontItems(block) {
  return block
    .split('\n')
    .map(function (line) { return line.trim(); })
    .filter(function (line) { return line.indexOf('-') === 0; })
    .map(function (line) { return line.replace(/^-+\s*/, '').trim(); });
}

function buildList(items, mark) {
  return items.map(function (i) { return '<li>' + mark + ' ' + i + '</li>'; }).join('\n');
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
      return '\n<div class="do-dont">\n<div>\n<ul>\n' + buildList(doItems, '✅') +
        '\n</ul>\n</div>\n<div>\n<ul>\n' + buildList(dontItems, '❌') +
        '\n</ul>\n</div>\n</div>\n';
    }
  );

  // одиночный :::do без пары
  md = md.replace(/:::do\s*\n([\s\S]*?)\n:::/g, function (match, block) {
    return '\n<ul>\n' + buildList(parseDoDontItems(block), '✅') + '\n</ul>\n';
  });

  // одиночный :::do-not без пары
  md = md.replace(/:::do-not\s*\n([\s\S]*?)\n:::/g, function (match, block) {
    return '\n<ul>\n' + buildList(parseDoDontItems(block), '❌') + '\n</ul>\n';
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
      container.innerHTML = marked.parse(transformDoDont(md));

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
