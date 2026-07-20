document.addEventListener('DOMContentLoaded', function () {
  var layout = document.querySelector('.layout');
  var toggle = document.getElementById('sidebar-toggle');
  var backdrop = document.querySelector('.sidebar-backdrop');

  // на узких экранах панель по умолчанию скрыта, на широких — открыта
  if (window.innerWidth <= 768) {
    layout.classList.add('sidebar-hidden');
  }

  function toggleSidebar() {
    layout.classList.toggle('sidebar-hidden');
  }

  toggle.addEventListener('click', toggleSidebar);

  if (backdrop) {
    backdrop.addEventListener('click', function () {
      layout.classList.add('sidebar-hidden');
    });
  }

  // на телефоне после перехода по ссылке в меню — сразу закрываем панель
  var navLinks = document.querySelectorAll('.sidebar nav a');
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.innerWidth <= 768) {
        layout.classList.add('sidebar-hidden');
      }
    });
  });
});
