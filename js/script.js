document.querySelector('.dropdown-toggle').addEventListener('click', function(e) {
  e.preventDefault();
  this.closest('.dropdown').classList.toggle('open');
});

document.addEventListener('click', function(e) {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
  }
});