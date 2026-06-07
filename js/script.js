document.querySelector('.dropdown-toggle').addEventListener('click', function(e) {
  e.preventDefault();
  this.closest('.dropdown').classList.toggle('open');
});

document.addEventListener('click', function(e) {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
  }
});

const PAGE_ORDER = [
  'index.html',
  'passwords.html',
  '2fa.html',
  'fishing.html',
  'private.html',
  'telegram.html',
  'max.html',
  'discord.html'
];

function showNextPageButton() {
  const btn = document.getElementById('next-page-btn');
  if (!btn) return;
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const currentIndex = PAGE_ORDER.indexOf(currentPage);
  if (currentIndex !== -1 && currentIndex < PAGE_ORDER.length - 1) {
    btn.href = PAGE_ORDER[currentIndex + 1];
    btn.classList.add('visible');
  }
}