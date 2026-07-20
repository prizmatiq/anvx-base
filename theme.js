document.addEventListener('DOMContentLoaded', function () {
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');

  function updateIcon() {
    btn.textContent = root.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  }
  updateIcon();

  btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateIcon();
  });

  // если пользователь ни разу не переключал вручную — следим за темой системы live
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem('theme')) {
      root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      updateIcon();
    }
  });
});
