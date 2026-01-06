(function () {
  var header = document.querySelector('.hf-header');
  var toggle = document.querySelector('.hf-nav-toggle');
  var nav = document.getElementById('hf-main-nav');

  if (!header || !toggle || !nav) {
    return;
  }

  function closeNav() {
    header.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function openNav() {
    header.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  toggle.addEventListener('click', function () {
    if (header.classList.contains('is-open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  nav.addEventListener('click', function (event) {
    var target = event.target;
    if (target && target.closest('a')) {
      closeNav();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) {
      closeNav();
    }
  });

  var yearEl = document.querySelector('.hf-footer-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
