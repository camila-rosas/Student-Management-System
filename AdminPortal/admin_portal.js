/*
  admin_portal.js
*/

function getLoggedInUser() {
  try {
    const raw = localStorage.getItem('loggedInUser');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function getInitials(name) {
  if (!name) return 'AD';

  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function guardAdminAccess() {
  const user = getLoggedInUser();

  if (!user) {
    window.location.href = 'index.html';
    return null;
  }

  const role = String(user.role || '').toLowerCase();
  const allowedRoles = ['admin', 'administrator'];

  if (!allowedRoles.includes(role)) {
    window.location.href = 'index.html';
    return null;
  }

  return user;
}

function hydrateAdminUser(user) {
  const displayName = user.name || 'Administrator';
  const initials = getInitials(displayName);
  const firstName = displayName.split(' ')[0] || displayName;

  document.querySelectorAll('.user-name').forEach(function (el) {
    el.textContent = displayName;
  });

  document.querySelectorAll('.user-role').forEach(function (el) {
    el.textContent = 'Administrator';
  });

  document.querySelectorAll('.avatar').forEach(function (el) {
    el.textContent = initials;
  });

  document.querySelectorAll('.page-user-name').forEach(function (el) {
    el.textContent = firstName;
  });
}

function bindSignOut() {
  document.querySelectorAll('.sign-out').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      localStorage.removeItem('loggedInUser');
      window.location.href = 'index.html';
    });
  });
}

function createNoticeSystem() {
  const wraps = document.querySelectorAll('.bell-wrap');

  wraps.forEach(function (wrap, wrapIndex) {
    const panel = wrap.querySelector('.notice-panel');
    const button = wrap.querySelector('.bell-btn');
    const list = wrap.querySelector('.notice-list');
    const clearButton = wrap.querySelector('.notice-clear');
    const badge = wrap.querySelector('.badge');
    const raw = wrap.dataset.notices || '[]';
    const page = document.body.getAttribute('data-page') || 'admin';
    const storageKey = 'sms_admin_notices_' + page + '_' + wrapIndex;

    let notices = [];

    try {
      const stored = localStorage.getItem(storageKey);

      if (stored !== null) {
        notices = JSON.parse(stored);
      } else {
        notices = JSON.parse(raw);
        localStorage.setItem(storageKey, JSON.stringify(notices));
      }
    } catch (error) {
      notices = [];
    }

    function saveNotices() {
      localStorage.setItem(storageKey, JSON.stringify(notices));
    }

    function updateBadge() {
      if (!badge) return;

      badge.textContent = notices.length;
      badge.style.display = notices.length ? 'flex' : 'none';
    }

    function renderNotices() {
      if (!list) return;

      list.innerHTML = '';

      if (!notices.length) {
        list.innerHTML = '<div class="notice-empty">No new notifications.</div>';
        updateBadge();
        return;
      }

      notices.forEach(function (note, index) {
        const item = document.createElement('div');
        item.className = 'notice-item';
        item.innerHTML =
          '<div class="notice-row">' +
            '<span>' + note + '</span>' +
            '<button class="notice-dismiss" type="button" data-index="' + index + '">Dismiss</button>' +
          '</div>';
        list.appendChild(item);
      });

      updateBadge();
    }

    if (button && panel) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();

        document.querySelectorAll('.notice-panel.open').forEach(function (openPanel) {
          if (openPanel !== panel) {
            openPanel.classList.remove('open');
          }
        });

        panel.classList.toggle('open');
      });
    }

    if (panel) {
      panel.addEventListener('click', function (event) {
        const dismissButton = event.target.closest('.notice-dismiss');
        if (!dismissButton) return;

        const index = Number(dismissButton.dataset.index);
        notices.splice(index, 1);
        saveNotices();
        renderNotices();
      });
    }

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        notices = [];
        saveNotices();
        renderNotices();
      });
    }

    renderNotices();
  });

  document.addEventListener('click', function (event) {
    document.querySelectorAll('.bell-wrap').forEach(function (wrap) {
      if (!wrap.contains(event.target)) {
        const panel = wrap.querySelector('.notice-panel');
        if (panel) {
          panel.classList.remove('open');
        }
      }
    });
  });
}

function setupCatalogFilter() {
  const searchInput = document.getElementById('catalogSearch');
  const filterSelect = document.getElementById('catalogFilter');
  const cards = document.querySelectorAll('.catalog-course-card');

  if (!searchInput || !cards.length) return;

  function matchesFilter(card) {
    if (!filterSelect) return true;

    const filterValue = filterSelect.value;
    const hours = String(card.dataset.hours || '');
    const seats = Number(card.dataset.seats || 0);

    if (filterValue === 'all') return true;
    if (filterValue === 'open') return seats > 0;
    if (filterValue === '3') return hours === '3';
    if (filterValue === '4') return hours === '4';

    return true;
  }

  function applyFilter() {
    const value = searchInput.value.trim().toLowerCase();

    cards.forEach(function (card) {
      const searchText = String(card.dataset.search || card.textContent).toLowerCase();
      const matchesSearch = !value || searchText.includes(value);
      const matchesSelect = matchesFilter(card);

      card.style.display = matchesSearch && matchesSelect ? '' : 'none';
    });
  }

  searchInput.addEventListener('input', applyFilter);

  if (filterSelect) {
    filterSelect.addEventListener('change', applyFilter);
  }

  applyFilter();
}

function setupManagementSearch() {
  const searchInput = document.getElementById('courseManagementSearch');
  const cards = document.querySelectorAll('.management-course-card');

  if (!searchInput || !cards.length) return;

  function filterCards() {
    const value = searchInput.value.trim().toLowerCase();

    cards.forEach(function (card) {
      const searchText = String(card.dataset.search || card.textContent).toLowerCase();
      card.style.display = !value || searchText.includes(value) ? '' : 'none';
    });
  }

  searchInput.addEventListener('input', filterCards);
  filterCards();
}

function setupAccountSearch() {
  const searchInput = document.getElementById('studentAccountSearch');
  const rows = document.querySelectorAll('.account-row');

  if (!searchInput || !rows.length) return;

  function filterRows() {
    const value = searchInput.value.trim().toLowerCase();

    rows.forEach(function (row) {
      const searchText = String(row.dataset.search || row.textContent).toLowerCase();
      row.style.display = !value || searchText.includes(value) ? '' : 'none';
    });
  }

  searchInput.addEventListener('input', filterRows);
  filterRows();
}

function setupAccountSelection() {
  const rows = document.querySelectorAll('.account-row');
  const detailCards = document.querySelectorAll('[data-account-detail]');
  const emptyState = document.querySelector('.account-detail-empty');

  if (!rows.length || !detailCards.length) return;

  function showDetail(studentId) {
    rows.forEach(function (row) {
      row.classList.toggle('active', row.dataset.studentId === studentId);
    });

    detailCards.forEach(function (card) {
      card.style.display = card.dataset.accountDetail === studentId ? '' : 'none';
    });

    if (emptyState) {
      emptyState.style.display = studentId ? 'none' : '';
    }
  }

  rows.forEach(function (row) {
    row.addEventListener('click', function () {
      showDetail(row.dataset.studentId);
    });
  });

  showDetail('');
}

function initAdminPortal() {
  const user = guardAdminAccess();
  if (!user) return;

  hydrateAdminUser(user);
  bindSignOut();
  createNoticeSystem();
  setupCatalogFilter();
  setupManagementSearch();
  setupAccountSearch();
  setupAccountSelection();
}

document.addEventListener('DOMContentLoaded', initAdminPortal);