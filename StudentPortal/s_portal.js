window.SMSStudent = (() => {
  const API_BASE = 'http://localhost:8080';
  const MAX_STUDENT_HOURS = 18;
  let bootPromise = null;

  function getToken() {
    return localStorage.getItem('token');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatCurrency(value) {
    const amount = Number(value || 0);
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  }

  function getInitials(name) {
    if (!name) return 'ST';

    const parts = String(name).trim().split(/\s+/).filter(Boolean);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function redirectToLogin() {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('role');
    window.location.href = 'index.html';
  }

  function bindSignOut() {
    document.querySelectorAll('.sign-out').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        redirectToLogin();
      });
    });
  }

  function getDisplayName(student) {
    return (
      student?.user?.name ||
      student?.user?.username ||
      'Student'
    );
  }

  function hydrateStudentUser(student) {
    const displayName = getDisplayName(student);
    const firstName = displayName.split(' ')[0] || 'Student';
    const initials = getInitials(displayName);

    document.querySelectorAll('.user-name').forEach((el) => {
      el.textContent = displayName;
    });

    document.querySelectorAll('.user-role').forEach((el) => {
      el.textContent = 'Student';
    });

    document.querySelectorAll('.avatar').forEach((el) => {
      el.textContent = initials;
    });

    const pageTitle = document.querySelector('.page-title');
    if (pageTitle && pageTitle.textContent.trim().startsWith('Welcome back')) {
      pageTitle.innerHTML = `Welcome back, <span class="page-user-name">${escapeHtml(firstName)}</span>`;
    }
  }

  function getNoticeStorageKey(student, index) {
    const page = window.location.pathname.split('/').pop() || 'page';
    const userKey = student?.user?.userId || student?.studentId || 'student';
    return `sms_student_notice_${userKey}_${page}_${index}`;
  }

  function initNotifications(student) {
    const wraps = document.querySelectorAll('.bell-wrap');

    wraps.forEach((wrap, index) => {
      const button = wrap.querySelector('.bell-btn');
      const panel = wrap.querySelector('.notice-panel');
      const list = wrap.querySelector('.notice-list');
      const clearButton = wrap.querySelector('.notice-clear');
      const badge = wrap.querySelector('.badge');
      const rawNotices = wrap.dataset.notices || '[]';
      const storageKey = getNoticeStorageKey(student, index);

      let notices = [];

      try {
        const stored = localStorage.getItem(storageKey);
        notices = stored ? JSON.parse(stored) : JSON.parse(rawNotices);
        if (!stored) {
          localStorage.setItem(storageKey, JSON.stringify(notices));
        }
      } catch (error) {
        notices = [];
      }

      function persist() {
        localStorage.setItem(storageKey, JSON.stringify(notices));
      }

      function updateBadge() {
        if (!badge) return;
        badge.textContent = String(notices.length);
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

        notices.forEach((notice, noticeIndex) => {
          const item = document.createElement('div');
          item.className = 'notice-item';
          item.innerHTML = `
            <div class="notice-row">
              <span>${escapeHtml(notice)}</span>
              <button class="notice-dismiss" type="button" data-index="${noticeIndex}">Dismiss</button>
            </div>
          `;
          list.appendChild(item);
        });

        updateBadge();
      }

      if (button && panel) {
        button.addEventListener('click', (event) => {
          event.stopPropagation();

          document.querySelectorAll('.notice-panel.open').forEach((openPanel) => {
            if (openPanel !== panel) {
              openPanel.classList.remove('open');
            }
          });

          panel.classList.toggle('open');
        });
      }

      if (panel) {
        panel.addEventListener('click', (event) => {
          const dismissButton = event.target.closest('.notice-dismiss');
          if (!dismissButton) return;

          const dismissIndex = Number(dismissButton.dataset.index);
          notices.splice(dismissIndex, 1);
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
          if (panel) {
            panel.classList.remove('open');
          }
        }
      });
    });
  }

  async function apiRequest(path, options = {}) {
    const token = getToken();

    if (!token) {
      redirectToLogin();
      throw new Error('Missing authentication token.');
    }

    try {
      const response = await axios({
        url: API_BASE + path,
        method: options.method || 'get',
        data: options.data,
        params: options.params,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        redirectToLogin();
      }
      throw error;
    }
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
        <div class="empty-icon">${escapeHtml(icon)}</div>
        <div class="empty-title">${escapeHtml(title)}</div>
        <div class="empty-copy">${escapeHtml(copy)}</div>
        ${actionHref && actionText ? `<a class="primary-btn" href="${escapeHtml(actionHref)}">${escapeHtml(actionText)}</a>` : ''}
      </div>
    `;
  }

  function extractErrorMessage(error, fallback = 'Something went wrong.') {
    const responseData = error?.response?.data;

    if (typeof responseData === 'string' && responseData.trim()) {
      return responseData;
    }

    if (responseData?.message) {
      return responseData.message;
    }

    if (error?.message) {
      return error.message;
    }

    return fallback;
  }

  async function bootShared() {
    if (bootPromise) {
      return bootPromise;
    }

    bootPromise = (async () => {
      bindSignOut();
      const student = await apiRequest('/api/students/me');
      hydrateStudentUser(student);
      initNotifications(student);
      return student;
    })();

    return bootPromise;
  }

  return {
    API_BASE,
    MAX_STUDENT_HOURS,
    apiRequest,
    bootShared,
    escapeHtml,
    extractErrorMessage,
    formatCurrency,
    getDisplayName,
    showInlineMessage,
    updateStatCard
  };
})();
