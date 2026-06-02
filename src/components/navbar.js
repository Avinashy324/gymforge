import { router } from '../router.js';
import { store } from '../store.js';

const navItems = [
  { route: '/dashboard', label: 'Home', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
  { route: '/workout', label: 'Workout', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767-1.768a2 2 0 1 1-2.829-2.829l-1.767-1.767a2 2 0 1 1-2.829-2.829L4.869 7.698a2 2 0 1 1-2.828-2.829l.707-.707a2 2 0 0 1 2.828 0L7.344 5.93a2 2 0 0 1 2.829 0l1.767 1.768a2 2 0 0 1 2.829 0l1.767 1.767a2 2 0 0 1 0 2.829"/><path d="m21.5 21.5-1.4-1.4"/></svg>' },
  { route: '/tracker', label: 'Track', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>' },
  { route: '/diet', label: 'Diet', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7zM8.64 14l-2.05-2.04M15.34 15l-2.46-2.46"/><path d="M22 9c0-4.97-5-3-5-3s2 4.97-3 4.97"/></svg>' },
  { route: '/profile', label: 'Profile', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
];

export function renderNavbar() {
  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.id = 'main-navbar';

  nav.innerHTML = navItems.map(item => `
    <div class="nav-item ${router.getCurrentPath() === item.route ? 'active' : ''}" data-route="${item.route}">
      ${item.icon}
      <span>${item.label}</span>
    </div>
  `).join('');

  nav.addEventListener('click', (e) => {
    const navItem = e.target.closest('.nav-item');
    if (navItem) {
      router.navigate(navItem.dataset.route);
    }
  });

  return nav;
}

export function showNavbar() {
  const existing = document.getElementById('main-navbar');
  if (existing) {
    existing.style.display = 'flex';
    return;
  }
  document.body.appendChild(renderNavbar());
}

export function hideNavbar() {
  const navbar = document.getElementById('main-navbar');
  if (navbar) navbar.style.display = 'none';
}

export function updateNavbar() {
  const navbar = document.getElementById('main-navbar');
  if (!navbar) return;
  navbar.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.route === router.getCurrentPath());
  });
}
