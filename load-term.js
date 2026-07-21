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
      container.innerHTML = marked.parse(md);

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
