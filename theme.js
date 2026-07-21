document.addEventListener('DOMContentLoaded', function () {
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;

  var sunIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><line x1="12" y1="2" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22"></line><line x1="4" y1="12" x2="2" y2="12"></line><line x1="22" y1="12" x2="20" y2="12"></line><line x1="5.64" y1="5.64" x2="4.22" y2="4.22"></line><line x1="19.78" y1="19.78" x2="18.36" y2="18.36"></line><line x1="5.64" y1="18.36" x2="4.22" y2="19.78"></line><line x1="19.78" y1="4.22" x2="18.36" y2="5.64"></line></svg>';

  var moonIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';

  function updateIcon() {
    var isDark = root.getAttribute('data-theme') === 'dark';
    btn.innerHTML = (isDark ? moonIcon : sunIcon) + '<span>' + (isDark ? 'Тёмная тема' : 'Светлая тема') + '</span>';
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
