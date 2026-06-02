export const router = {
  _routes: {},
  _currentPage: null,
  _container: null,
  _onBeforeNavigate: null,

  init(containerId) {
    this._container = document.getElementById(containerId);
    window.addEventListener('hashchange', () => this._handleRoute());
    this._handleRoute();
  },

  register(path, renderFn) {
    this._routes[path] = renderFn;
  },

  navigate(path) {
    window.location.hash = path;
  },

  getCurrentPath() {
    return window.location.hash.slice(1) || '/onboarding';
  },

  async _handleRoute() {
    const path = this.getCurrentPath();
    const renderFn = this._routes[path];

    if (!renderFn) {
      this.navigate('/onboarding');
      return;
    }

    // Page exit animation
    if (this._container.children.length > 0) {
      this._container.children[0].classList.add('page-exit');
      await new Promise(r => setTimeout(r, 200));
    }

    // Clear and render
    this._container.innerHTML = '';
    const pageEl = await renderFn();
    if (typeof pageEl === 'string') {
      this._container.innerHTML = pageEl;
    } else if (pageEl instanceof HTMLElement) {
      this._container.appendChild(pageEl);
    }

    // Page enter animation
    if (this._container.children.length > 0) {
      this._container.children[0].classList.add('page-enter');
    }

    this._currentPage = path;
    this._updateNavbar();
    window.scrollTo(0, 0);
  },

  _updateNavbar() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.route === this._currentPage);
    });
  }
};
