/* 
	Team #7 Group Project
	Names: David Vargas, Camila Rosas, Maria Barco, Zinia Noorani
	
	============================================================================
	| THIS FILE IS MEANT TO BE A DEMO AND NOT THE FINAL PRODUCT. BUGS MAY OCCUR. |
	============================================================================
*/

(function () {
  const demo = window.SMSDemo;
  let currentStudent = null;

  function redirectToLogin() {
    demo.logout();
    window.location.href = 'index.html';
  }

  function bindSignOut() {
    document.querySelectorAll('.sign-out').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        demo.logout();
        window.location.href = 'index.html';
      });
    });
  }

  function hydrateStudentUser(student) {
    const displayName = student?.name || 'Student';
    const firstName = displayName.split(' ')[0] || displayName;
    const initials = demo.getInitials(displayName);

    document.querySelectorAll('.user-name').forEach((el) => el.textContent = displayName);
    document.querySelectorAll('.user-role').forEach((el) => el.textContent = student?.major || 'Student');
    document.querySelectorAll('.avatar').forEach((el) => el.textContent = initials);
    document.querySelectorAll('.page-user-name').forEach((el) => el.textContent = firstName);
  }

  function initNotifications(student) {
    document.querySelectorAll('.bell-wrap').forEach((wrap, index) => {
      const panel = wrap.querySelector('.notice-panel');
      const button = wrap.querySelector('.bell-btn');
      const list = wrap.querySelector('.notice-list');
      const clearButton = wrap.querySelector('.notice-clear');
      const badge = wrap.querySelector('.badge');
      const raw = wrap.dataset.notices || '[]';
      const page = window.location.pathname.split('/').pop() || 'student';
      const storageKey = 'sms_student_notices_' + (student?.studentId || 'student') + '_' + page + '_' + index;

      let notices = [];

      try {
        const stored = localStorage.getItem(storageKey);
        notices = stored !== null ? JSON.parse(stored) : JSON.parse(raw);
        if (stored === null) localStorage.setItem(storageKey, JSON.stringify(notices));
      } catch (error) {
        notices = [];
      }

      function persist() {
        localStorage.setItem(storageKey, JSON.stringify(notices));
      }

      function updateBadge() {
        if (!badge) return;
        badge.textContent = notices.length;
        badge.style.display = notices.length ? 'flex' : 'none';
      }

      function render() {
        if (!list) return;
        list.innerHTML = '';

        if (!notices.length) {
          list.innerHTML = '<div class="notice-empty">No new notifications.</div>';
          updateBadge();
          return;
        }

        notices.forEach((note, idx) => {
          const item = document.createElement('div');
          item.className = 'notice-item';
          item.innerHTML = '<div class="notice-row"><span>' + demo.escapeHtml(note) + '</span><button class="notice-dismiss" type="button" data-index="' + idx + '">Dismiss</button></div>';
          list.appendChild(item);
        });

        updateBadge();
      }

      if (button && panel) {
        button.addEventListener('click', (event) => {
          event.stopPropagation();

          document.querySelectorAll('.notice-panel.open').forEach((openPanel) => {
            if (openPanel !== panel) openPanel.classList.remove('open');
          });

          panel.classList.toggle('open');
        });
      }

      if (panel) {
        panel.addEventListener('click', (event) => {
          const dismissButton = event.target.closest('.notice-dismiss');

          if (!dismissButton) return;

          notices.splice(Number(dismissButton.dataset.index), 1);
          persist();
          render();
        });
      }

      if (clearButton) {
        clearButton.addEventListener('click', () => {
          notices = [];
          persist();
          render();
        });
      }

      render();
    });

    document.addEventListener('click', (event) => {
      document.querySelectorAll('.bell-wrap').forEach((wrap) => {
        if (!wrap.contains(event.target)) {
          const panel = wrap.querySelector('.notice-panel');

          if (panel) panel.classList.remove('open');
        }
      });
    });
  }

  async function bootShared() {
    if (currentStudent) return currentStudent;

    const user = demo.getCurrentUser();

    if (!user || String(user.role || '').toUpperCase() !== 'STUDENT') {
      redirectToLogin();
      return null;
    }

    bindSignOut();

    try {
      const student = await demo.asyncRequest('GET', '/api/students/me');
      currentStudent = student;
      hydrateStudentUser(student);
      initNotifications(student);
      return student;
    } catch (error) {
      redirectToLogin();
      throw error;
    }
  }

  async function apiRequest(path, options = {}) {
    await bootShared();

    const method = String(options.method || 'GET').toUpperCase();

    return demo.asyncRequest(method, path, {
      params: options.params,
      body: options.body
    });
  }

  function updateStatCard(labelText, value, note) {
    document.querySelectorAll('.stat-card').forEach((card) => {
      const label = card.querySelector('.card-label');
      const valueEl = card.querySelector('.card-value');
      const noteEl = card.querySelector('.card-note');

      if (!label || label.textContent.trim() !== labelText) return;

      if (valueEl) valueEl.textContent = value;
      if (noteEl && note !== undefined) noteEl.textContent = note;
    });
  }

  function showInlineMessage(container, title, copy, actionHref, actionText, icon = 'ⓘ') {
    if (!container) return;

    container.innerHTML = `
      <div class="empty-wrap">
        <div class="empty-icon">${icon}</div>
        <div class="empty-title">${demo.escapeHtml(title)}</div>
        <div class="empty-copy">${demo.escapeHtml(copy)}</div>
        ${actionHref && actionText ? `<a class="outline-btn" href="${demo.escapeHtml(actionHref)}">${demo.escapeHtml(actionText)}</a>` : ''}
      </div>
    `;
  }

  function extractErrorMessage(error, fallback = 'Something went wrong.') {
    if (!error) return fallback;
    return error.message || fallback;
  }

  window.SMSStudent = {
    MAX_STUDENT_HOURS: demo.CONFIG.maxStudentHours,
    bootShared,
    apiRequest,
    updateStatCard,
    showInlineMessage,
    extractErrorMessage,
    escapeHtml: demo.escapeHtml,
    formatCurrency: demo.formatCurrency,
    getDisplayName: function (student) {
      return student?.name || 'Student';
    },
    getCurrentStudent: function () {
      return currentStudent;
    }
  };
})();