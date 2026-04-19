/* David Vargas

Student portal JavaScript
Synced with registrar shared catalog

Handles:
- Student login/session guard
- Logout
- Shared catalog sync with registrar
- Student enroll/drop
- Dashboard updates
- My Courses rendering
- Billing calculations
- Catalog search/filter
- Notifications
*/

const SHARED_CATALOG_KEY = 'sms_shared_catalog_v1';
const MAX_STUDENT_HOURS = 18;
const TUITION_PER_HOUR = 450;

const DEFAULT_SHARED_CATALOG = [
  {
    code: 'INSY 4325',
    name: 'Enterprise Systems Development',
    hours: 3,
    instructor: 'Dr. Amanda Foster',
    location: 'COBA 215',
    schedule: 'Mon/Wed 2:00 PM - 3:20 PM',
    capacity: 35,
    enrolled: 28
  },
  {
    code: 'CSE 3310',
    name: 'Fundamentals of Software Engineering',
    hours: 3,
    instructor: 'Dr. Robert Kim',
    location: 'ERB 103',
    schedule: 'Tue/Thu 11:00 AM - 12:20 PM',
    capacity: 40,
    enrolled: 40
  },
  {
    code: 'MATH 2326',
    name: 'Calculus III',
    hours: 3,
    instructor: 'Dr. Patricia Lee',
    location: 'PKH 101',
    schedule: 'Mon/Wed/Fri 10:00 AM - 10:50 AM',
    capacity: 45,
    enrolled: 32
  },
  {
    code: 'ENGL 1302',
    name: 'Rhetoric and Composition II',
    hours: 3,
    instructor: 'Prof. Michael Torres',
    location: 'LIBR 202',
    schedule: 'Tue/Thu 9:30 AM - 10:50 AM',
    capacity: 25,
    enrolled: 18
  },
  {
    code: 'PHYS 1441',
    name: 'General Technical Physics I',
    hours: 4,
    instructor: 'Dr. Jennifer Adams',
    location: 'SH 100',
    schedule: 'Mon/Wed 3:30 PM - 4:50 PM',
    capacity: 50,
    enrolled: 42
  },
  {
    code: 'ACCT 2301',
    name: 'Principles of Accounting I',
    hours: 3,
    instructor: 'Dr. Lisa Wang',
    location: 'COBA 140',
    schedule: 'Mon/Wed 1:00 PM - 2:20 PM',
    capacity: 60,
    enrolled: 55
  },
  {
    code: 'BIOL 1441',
    name: 'Cell and Molecular Biology',
    hours: 4,
    instructor: 'Dr. Susan Clark',
    location: 'LS 103',
    schedule: 'Tue/Thu 1:00 PM - 2:20 PM',
    capacity: 48,
    enrolled: 35
  },
  {
    code: 'PSYC 1315',
    name: 'Introduction to Psychology',
    hours: 3,
    instructor: 'Dr. Mark Johnson',
    location: 'UH 100',
    schedule: 'Mon/Wed/Fri 11:00 AM - 11:50 AM',
    capacity: 80,
    enrolled: 72
  }
];

/* -----------------------------
   Basic helpers
------------------------------ */

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getLoggedInUser() {
  try {
    const raw = localStorage.getItem('loggedInUser');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function getInitials(name) {
  if (!name) return 'ST';

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getUserKeySuffix(user) {
  return String(user.email || user.name || 'student')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_');
}

function getStudentStateKey(user) {
  return 'sms_student_state_' + getUserKeySuffix(user);
}

function getNoticeStateKey(user, index) {
  const page = window.location.pathname.split('/').pop() || 'page';
  return 'sms_student_notices_' + getUserKeySuffix(user) + '_' + page + '_' + index;
}

function guardStudentAccess() {
  const user = getLoggedInUser();

  if (!user || user.role !== 'student') {
    window.location.href = 'index.html';
    return null;
  }

  return user;
}

function hydrateStudentUser(user) {
  const displayName = user.name || 'Student';
  const firstName = displayName.split(' ')[0] || 'Student';
  const initials = getInitials(displayName);

  document.querySelectorAll('.user-name').forEach(function (el) {
    el.textContent = displayName;
  });

  document.querySelectorAll('.user-role').forEach(function (el) {
    el.textContent = 'Student';
  });

  document.querySelectorAll('.avatar').forEach(function (el) {
    el.textContent = initials;
  });

  document.querySelectorAll('.page-user-name').forEach(function (el) {
    el.textContent = firstName;
  });

  const pageTitle = document.querySelector('.page-title');
  if (pageTitle && pageTitle.textContent.trim().startsWith('Welcome back')) {
    pageTitle.innerHTML = 'Welcome back, <span class="page-user-name">' + escapeHtml(firstName) + '</span>';
  }
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

/* -----------------------------
   Shared catalog storage
------------------------------ */

function normalizeCourse(course) {
  return {
    code: String(course.code || '').trim(),
    name: String(course.name || '').trim(),
    hours: Number(course.hours || 0),
    instructor: String(course.instructor || '').trim(),
    location: String(course.location || '').trim(),
    schedule: String(course.schedule || '').trim(),
    capacity: Number(course.capacity || 0),
    enrolled: Number(course.enrolled || 0)
  };
}

function ensureSharedCatalog() {
  try {
    const raw = localStorage.getItem(SHARED_CATALOG_KEY);

    if (!raw) {
      localStorage.setItem(SHARED_CATALOG_KEY, JSON.stringify(DEFAULT_SHARED_CATALOG));
      return DEFAULT_SHARED_CATALOG.map(normalizeCourse);
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed) || !parsed.length) {
      localStorage.setItem(SHARED_CATALOG_KEY, JSON.stringify(DEFAULT_SHARED_CATALOG));
      return DEFAULT_SHARED_CATALOG.map(normalizeCourse);
    }

    return parsed.map(normalizeCourse);
  } catch (error) {
    localStorage.setItem(SHARED_CATALOG_KEY, JSON.stringify(DEFAULT_SHARED_CATALOG));
    return DEFAULT_SHARED_CATALOG.map(normalizeCourse);
  }
}

function getSharedCatalog() {
  return ensureSharedCatalog();
}

function saveSharedCatalog(catalog) {
  localStorage.setItem(
    SHARED_CATALOG_KEY,
    JSON.stringify(catalog.map(normalizeCourse))
  );
}

function getSharedCourseByCode(code) {
  return getSharedCatalog().find(function (course) {
    return course.code === code;
  });
}

function updateSharedEnrollment(code, enrolled) {
  const catalog = getSharedCatalog();
  const course = catalog.find(function (item) {
    return item.code === code;
  });

  if (!course) return;

  course.enrolled = Number(enrolled);
  saveSharedCatalog(catalog);
}

/* -----------------------------
   Student state
------------------------------ */

function readStudentState(user) {
  try {
    const raw = localStorage.getItem(getStudentStateKey(user));
    const parsed = raw ? JSON.parse(raw) : null;

    if (parsed && Array.isArray(parsed.selectedCodes)) {
      return parsed;
    }
  } catch (error) {
    // ignore bad state
  }

  return {
    selectedCodes: []
  };
}

function saveStudentState(user, state) {
  localStorage.setItem(getStudentStateKey(user), JSON.stringify(state));
}

function reconcileStudentState(user) {
  const state = readStudentState(user);
  const validCodes = new Set(
    getSharedCatalog().map(function (course) {
      return course.code;
    })
  );

  const filtered = state.selectedCodes.filter(function (code) {
    return validCodes.has(code);
  });

  if (filtered.length !== state.selectedCodes.length) {
    state.selectedCodes = filtered;
    saveStudentState(user, state);
  }
}

function isSelected(state, code) {
  return state.selectedCodes.includes(code);
}

function getSelectedCourses(user) {
  const state = readStudentState(user);
  const catalog = getSharedCatalog();

  return catalog.filter(function (course) {
    return isSelected(state, course.code);
  });
}

function getTotalHours(courses) {
  return courses.reduce(function (sum, course) {
    return sum + Number(course.hours || 0);
  }, 0);
}

function getTotalCharges(courses) {
  return courses.reduce(function (sum, course) {
    return sum + Number(course.hours || 0) * TUITION_PER_HOUR;
  }, 0);
}

function getOpenCourseCount(catalog) {
  return catalog.filter(function (course) {
    return Number(course.enrolled) < Number(course.capacity);
  }).length;
}

/* -----------------------------
   Notifications
------------------------------ */

function createNoticeSystem(user) {
  const wraps = document.querySelectorAll('.bell-wrap');

  wraps.forEach(function (wrap, wrapIndex) {
    const panel = wrap.querySelector('.notice-panel');
    const button = wrap.querySelector('.bell-btn');
    const list = wrap.querySelector('.notice-list');
    const clearButton = wrap.querySelector('.notice-clear');
    const badge = wrap.querySelector('.badge');
    const raw = wrap.dataset.notices || '[]';
    const storageKey = getNoticeStateKey(user, wrapIndex);

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

    function persistNotices() {
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
            '<span>' + escapeHtml(note) + '</span>' +
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
        const dismiss = event.target.closest('.notice-dismiss');
        if (!dismiss) return;

        const index = Number(dismiss.dataset.index);
        notices.splice(index, 1);
        persistNotices();
        renderNotices();
      });
    }

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        notices = [];
        persistNotices();
        renderNotices();
      });
    }

    renderNotices();
  });

  document.addEventListener('click', function (event) {
    document.querySelectorAll('.bell-wrap').forEach(function (wrap) {
      if (!wrap.contains(event.target)) {
        const panel = wrap.querySelector('.notice-panel');
        if (panel) panel.classList.remove('open');
      }
    });
  });
}

/* -----------------------------
   Dashboard helpers
------------------------------ */

function updateStatCard(labelText, value, note) {
  document.querySelectorAll('.stat-card').forEach(function (card) {
    const label = card.querySelector('.card-label');
    const valueEl = card.querySelector('.card-value');
    const noteEl = card.querySelector('.card-note');

    if (!label) return;
    if (label.textContent.trim() !== labelText) return;

    if (valueEl) valueEl.textContent = value;
    if (noteEl && note !== undefined) noteEl.textContent = note;
  });
}

/* -----------------------------
   Student catalog
------------------------------ */

function getCatalogSearchValue() {
  const input = document.querySelector('.search-row .search-input');
  return input ? input.value.trim().toLowerCase() : '';
}

function getCatalogFilterText() {
  const select = document.querySelector('.search-row select');
  return select ? select.options[select.selectedIndex].text.toLowerCase() : 'all courses';
}

function matchesStudentCatalogFilter(course, filterText) {
  const seatsLeft = Math.max(0, Number(course.capacity) - Number(course.enrolled));

  if (filterText === 'open seats') return seatsLeft > 0;
  if (filterText === '3 hours') return Number(course.hours) === 3;
  if (filterText === '4 hours') return Number(course.hours) === 4;

  return true;
}

function buildStudentCourseCard(course, selected) {
  const seatsLeft = Math.max(0, Number(course.capacity) - Number(course.enrolled));
  const isFull = seatsLeft <= 0;

  let buttonText = 'Enroll';
  let buttonClass = 'catalog-action';
  let buttonDisabled = '';

  if (selected) {
    buttonText = 'Drop Course';
    buttonClass = 'catalog-action drop';
  } else if (isFull) {
    buttonText = 'Course Full';
    buttonClass = 'catalog-action full';
    buttonDisabled = ' disabled';
  }

  return (
    '<article class="course-card" data-code="' + escapeHtml(course.code) + '">' +
      '<div class="course-top">' +
        '<div>' +
          '<div class="course-code">' + escapeHtml(course.code) + ' <span class="hours-pill">' + course.hours + ' hrs</span></div>' +
          '<div class="course-name">' + escapeHtml(course.name) + '</div>' +
        '</div>' +
        '<div class="seat-pill' + (isFull ? ' full' : '') + '">' + (isFull ? 'Full' : seatsLeft + ' seats') + '</div>' +
      '</div>' +
      '<div class="course-desc">Course synced with registrar catalog.</div>' +
      '<div class="meta-stack">' +
        '<div class="meta-row"><span>👤 ' + escapeHtml(course.instructor) + '</span><span>📍 ' + escapeHtml(course.location) + '</span></div>' +
        '<div class="meta-row"><span>🕒 ' + escapeHtml(course.schedule) + '</span><span></span></div>' +
        '<div class="meta-row"><span class="enrolled-text">' + course.enrolled + '/' + course.capacity + ' enrolled</span><span></span></div>' +
      '</div>' +
      '<div class="course-actions">' +
        '<button class="' + buttonClass + '" type="button" data-code="' + escapeHtml(course.code) + '"' + buttonDisabled + '>' + buttonText + '</button>' +
      '</div>' +
    '</article>'
  );
}

function renderStudentCatalog(user) {
  const container = document.querySelector('.catalog-grid');
  if (!container) return;

  const catalog = getSharedCatalog();
  const state = readStudentState(user);
  const searchValue = getCatalogSearchValue();
  const filterText = getCatalogFilterText();

  const alertBar = document.querySelector('.alert-bar');
  if (alertBar) {
    alertBar.textContent = 'ⓘ This course catalog is synced with registrar updates. Enrollments now update Dashboard, My Courses, and Billing automatically.';
  }

  const visibleCourses = catalog.filter(function (course) {
    const haystack = (
      course.code + ' ' +
      course.name + ' ' +
      course.instructor + ' ' +
      course.location + ' ' +
      course.schedule
    ).toLowerCase();

    const matchesSearch = !searchValue || haystack.includes(searchValue);
    const matchesFilter = matchesStudentCatalogFilter(course, filterText);

    return matchesSearch && matchesFilter;
  });

  if (!visibleCourses.length) {
    container.innerHTML =
      '<div class="empty-wrap">' +
        '<div class="empty-icon">📖</div>' +
        '<div class="empty-title">No Courses Found</div>' +
        '<div class="empty-copy">Try adjusting the search or filter.</div>' +
      '</div>';
    return;
  }

  container.innerHTML = visibleCourses.map(function (course) {
    return buildStudentCourseCard(course, isSelected(state, course.code));
  }).join('');
}

function bindStudentCatalogControls(user) {
  const searchInput = document.querySelector('.search-row .search-input');
  const filterSelect = document.querySelector('.search-row select');
  const container = document.querySelector('.catalog-grid');

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      renderStudentCatalog(user);
    });
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', function () {
      renderStudentCatalog(user);
    });
  }

  if (container && !container.dataset.boundCatalogActions) {
    container.dataset.boundCatalogActions = 'true';

    container.addEventListener('click', function (event) {
      const button = event.target.closest('.catalog-action');
      if (!button) return;

      const code = button.dataset.code;
      const course = getSharedCourseByCode(code);
      const state = readStudentState(user);

      if (!course) return;

      const selected = isSelected(state, code);
      const selectedCourses = getSelectedCourses(user);
      const currentHours = getTotalHours(selectedCourses);

      if (selected) {
        state.selectedCodes = state.selectedCodes.filter(function (item) {
          return item !== code;
        });

        updateSharedEnrollment(code, Number(course.enrolled) - 1);
        saveStudentState(user, state);
        renderAllStudentViews(user);
        return;
      }

      if (currentHours + Number(course.hours) > MAX_STUDENT_HOURS) {
        window.alert('You cannot exceed ' + MAX_STUDENT_HOURS + ' credit hours.');
        return;
      }

      if (Number(course.enrolled) >= Number(course.capacity)) {
        window.alert('This course is already full.');
        return;
      }

      state.selectedCodes.push(code);
      updateSharedEnrollment(code, Number(course.enrolled) + 1);
      saveStudentState(user, state);
      renderAllStudentViews(user);
    });
  }
}

/* -----------------------------
   Dashboard render
------------------------------ */

function renderDashboardPage(user) {
  const pageTitle = document.querySelector('.page-title');
  const panelHead = document.querySelector('.panel-head');

  if (!pageTitle || !panelHead || !pageTitle.textContent.includes('Welcome back')) {
    return;
  }

  const catalog = getSharedCatalog();
  const selectedCourses = getSelectedCourses(user);
  const totalHours = getTotalHours(selectedCourses);
  const totalCharges = getTotalCharges(selectedCourses);
  const availableCourses = getOpenCourseCount(catalog);

  updateStatCard('Enrolled Courses', String(selectedCourses.length), totalHours + ' credit hours');
  updateStatCard('Credit Hours', totalHours + '/' + MAX_STUDENT_HOURS, 'Maximum allowed');
  updateStatCard('Current Balance', '$' + totalCharges.toFixed(2), totalCharges > 0 ? 'Current tuition charges' : 'Paid in full');
  updateStatCard('Available Courses', String(availableCourses), 'With open seats');

  const panel = panelHead.closest('.panel');
  if (!panel) return;

  Array.from(panel.children).forEach(function (child) {
    if (child !== panelHead) {
      child.remove();
    }
  });

  if (!selectedCourses.length) {
    panel.insertAdjacentHTML(
      'beforeend',
      '<div class="empty-wrap">' +
        '<div class="empty-icon">📖</div>' +
        '<div class="empty-title">No Courses Enrolled</div>' +
        '<div class="empty-copy">You have no registered courses yet.</div>' +
        '<a class="primary-btn" href="s_course_catalog.html">Browse Course Catalog</a>' +
      '</div>'
    );
    return;
  }

  const list = document.createElement('div');
  list.style.display = 'grid';
  list.style.gap = '12px';
  list.style.marginTop = '16px';

  selectedCourses.forEach(function (course) {
    const item = document.createElement('div');
    item.style.border = '1px solid #dfd6d9';
    item.style.borderRadius = '12px';
    item.style.padding = '14px';
    item.style.background = '#ffffff';

    item.innerHTML =
      '<div style="font-weight:700; font-size:14px; margin-bottom:4px;">' + escapeHtml(course.code) + ' - ' + escapeHtml(course.name) + '</div>' +
      '<div style="font-size:12px; color:#7a6a73; margin-bottom:4px;">' + escapeHtml(course.schedule) + '</div>' +
      '<div style="font-size:12px; color:#7a6a73;">' + escapeHtml(course.instructor) + ' • ' + escapeHtml(course.location) + ' • ' + course.hours + ' hrs</div>';

    list.appendChild(item);
  });

  panel.appendChild(list);
}

/* -----------------------------
   My Courses render
------------------------------ */

function renderMyCoursesPage(user) {
  const pageTitle = document.querySelector('.page-title');
  const summaryStrip = document.querySelector('.summary-strip');
  const panel = document.querySelector('.panel');

  if (!pageTitle || !summaryStrip || !panel || pageTitle.textContent.trim() !== 'My Courses') {
    return;
  }

  const selectedCourses = getSelectedCourses(user);
  const totalHours = getTotalHours(selectedCourses);

  const summaryBlocks = summaryStrip.querySelectorAll('.summary-block');

  if (summaryBlocks[0]) {
    const strong = summaryBlocks[0].querySelector('strong');
    if (strong) strong.textContent = selectedCourses.length + ' courses';
  }

  if (summaryBlocks[1]) {
    const strong = summaryBlocks[1].querySelector('strong');
    if (strong) strong.textContent = totalHours + ' / ' + MAX_STUDENT_HOURS;
  }

  panel.innerHTML = '';

  if (!selectedCourses.length) {
    panel.innerHTML =
      '<div class="empty-wrap">' +
        '<div class="empty-icon">📖</div>' +
        '<div class="empty-title">No Courses Enrolled</div>' +
        '<div class="empty-copy">You have no registered courses this semester.</div>' +
        '<a class="primary-btn" href="s_course_catalog.html">Browse Course Catalog</a>' +
      '</div>';
    return;
  }

  panel.innerHTML =
    '<div class="section-title">Enrolled Courses</div>' +
    '<div class="section-subtitle">Manage your registered courses for the current term</div>';

  const list = document.createElement('div');
  list.style.display = 'grid';
  list.style.gap = '12px';
  list.style.marginTop = '16px';

  selectedCourses.forEach(function (course) {
    const item = document.createElement('div');
    item.style.border = '1px solid #dfd6d9';
    item.style.borderRadius = '12px';
    item.style.padding = '14px';
    item.style.background = '#ffffff';

    item.innerHTML =
      '<div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;">' +
        '<div>' +
          '<div style="font-weight:700; font-size:14px; margin-bottom:4px;">' + escapeHtml(course.code) + ' - ' + escapeHtml(course.name) + '</div>' +
          '<div style="font-size:12px; color:#7a6a73; margin-bottom:4px;">' + escapeHtml(course.schedule) + '</div>' +
          '<div style="font-size:12px; color:#7a6a73;">' + escapeHtml(course.instructor) + ' • ' + escapeHtml(course.location) + ' • ' + course.hours + ' hrs</div>' +
        '</div>' +
        '<button class="outline-btn student-drop-course" type="button" data-code="' + escapeHtml(course.code) + '">Drop</button>' +
      '</div>';

    list.appendChild(item);
  });

  panel.appendChild(list);

  panel.querySelectorAll('.student-drop-course').forEach(function (button) {
    button.addEventListener('click', function () {
      const code = button.dataset.code;
      const state = readStudentState(user);
      const course = getSharedCourseByCode(code);

      state.selectedCodes = state.selectedCodes.filter(function (item) {
        return item !== code;
      });

      if (course) {
        updateSharedEnrollment(code, Number(course.enrolled) - 1);
      }

      saveStudentState(user, state);
      renderAllStudentViews(user);
    });
  });
}

/* -----------------------------
   Billing render
------------------------------ */

function renderBillingPage(user) {
  const pageTitle = document.querySelector('.page-title');
  const billingGrid = document.querySelector('.billing-grid');
  const historyPanel = document.querySelector('.billing-history');

  if (!pageTitle || !billingGrid || !historyPanel || pageTitle.textContent.trim() !== 'Billing Account') {
    return;
  }

  const selectedCourses = getSelectedCourses(user);
  const totalHours = getTotalHours(selectedCourses);
  const totalCharges = getTotalCharges(selectedCourses);
  const totalPayments = 0;
  const currentBalance = totalCharges - totalPayments;

  updateStatCard('Current Balance', '$' + currentBalance.toFixed(2), currentBalance > 0 ? 'Current balance due' : 'No balance due');
  updateStatCard('Total Charges', '$' + totalCharges.toFixed(2), totalHours + ' credit hours');
  updateStatCard('Total Payments', '$' + totalPayments.toFixed(2), 'Payments & refunds');

  historyPanel.innerHTML =
    '<div class="section-title">Transaction History</div>' +
    '<div class="section-subtitle">All charges, payments, and fees for Fall 2026</div>';

  if (!selectedCourses.length) {
    historyPanel.innerHTML +=
      '<div class="empty-wrap">' +
        '<div class="empty-icon">💲</div>' +
        '<div class="empty-copy">No transactions yet.</div>' +
      '</div>';
    return;
  }

  const tableWrap = document.createElement('div');
  tableWrap.style.marginTop = '16px';
  tableWrap.style.overflowX = 'auto';

  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';

  let rows =
    '<thead>' +
      '<tr>' +
        '<th style="text-align:left; padding:10px; border-bottom:1px solid #dfd6d9;">Type</th>' +
        '<th style="text-align:left; padding:10px; border-bottom:1px solid #dfd6d9;">Course</th>' +
        '<th style="text-align:left; padding:10px; border-bottom:1px solid #dfd6d9;">Hours</th>' +
        '<th style="text-align:left; padding:10px; border-bottom:1px solid #dfd6d9;">Amount</th>' +
      '</tr>' +
    '</thead>' +
    '<tbody>';

  selectedCourses.forEach(function (course) {
    const amount = Number(course.hours) * TUITION_PER_HOUR;

    rows +=
      '<tr>' +
        '<td style="padding:10px; border-bottom:1px solid #eee;">Tuition</td>' +
        '<td style="padding:10px; border-bottom:1px solid #eee;">' + escapeHtml(course.code) + ' - ' + escapeHtml(course.name) + '</td>' +
        '<td style="padding:10px; border-bottom:1px solid #eee;">' + course.hours + '</td>' +
        '<td style="padding:10px; border-bottom:1px solid #eee;">$' + amount.toFixed(2) + '</td>' +
      '</tr>';
  });

  rows +=
      '<tr>' +
        '<td style="padding:10px; font-weight:700;">Total</td>' +
        '<td style="padding:10px;"></td>' +
        '<td style="padding:10px; font-weight:700;">' + totalHours + '</td>' +
        '<td style="padding:10px; font-weight:700;">$' + totalCharges.toFixed(2) + '</td>' +
      '</tr>' +
    '</tbody>';

  table.innerHTML = rows;
  tableWrap.appendChild(table);
  historyPanel.appendChild(tableWrap);
}

/* -----------------------------
   Global rerender
------------------------------ */

function renderAllStudentViews(user) {
  reconcileStudentState(user);
  renderStudentCatalog(user);
  renderDashboardPage(user);
  renderMyCoursesPage(user);
  renderBillingPage(user);
}

function bindStorageSync(user) {
  window.addEventListener('storage', function (event) {
    if (
      event.key === SHARED_CATALOG_KEY ||
      event.key === getStudentStateKey(user)
    ) {
      renderAllStudentViews(user);
    }
  });
}

/* -----------------------------
   Startup
------------------------------ */

document.addEventListener('DOMContentLoaded', function () {
  const user = guardStudentAccess();
  if (!user) return;

  ensureSharedCatalog();
  reconcileStudentState(user);
  hydrateStudentUser(user);
  bindSignOut();
  createNoticeSystem(user);
  bindStudentCatalogControls(user);
  bindStorageSync(user);
  renderAllStudentViews(user);
});