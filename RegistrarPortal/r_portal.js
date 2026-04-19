/* Registrar portal JavaScript
   Dynamic localStorage version with student-portal bridge
*/

const SHARED_CATALOG_KEY = 'sms_shared_catalog_v1';

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
  if (!name) return 'RG';

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function guardRegistrarAccess() {
  const user = getLoggedInUser();

  if (!user || user.role !== 'registrar') {
    window.location.href = 'index.html';
    return null;
  }

  return user;
}

function hydrateRegistrarUser(user) {
  const displayName = user.name || 'Registrar';
  const firstName = displayName.split(' ')[0] || 'Registrar';
  const initials = getInitials(displayName);

  document.querySelectorAll('.user-name').forEach(function (el) {
    el.textContent = displayName;
  });

  document.querySelectorAll('.user-role').forEach(function (el) {
    el.textContent = 'Registrar';
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

function validateCourse(course, existingCode) {
  const catalog = getSharedCatalog();
  const normalized = normalizeCourse(course);

  if (!normalized.code || !normalized.name || !normalized.instructor || !normalized.location || !normalized.schedule) {
    return 'Please fill in all course fields.';
  }

  if (!Number.isInteger(normalized.hours) || normalized.hours <= 0) {
    return 'Credit hours must be a positive whole number.';
  }

  if (!Number.isInteger(normalized.capacity) || normalized.capacity <= 0) {
    return 'Capacity must be a positive whole number.';
  }

  if (!Number.isInteger(normalized.enrolled) || normalized.enrolled < 0) {
    return 'Enrolled count must be zero or greater.';
  }

  if (normalized.enrolled > normalized.capacity) {
    return 'Enrolled count cannot be greater than capacity.';
  }

  const duplicate = catalog.find(function (item) {
    return item.code.toLowerCase() === normalized.code.toLowerCase() &&
      item.code.toLowerCase() !== String(existingCode || '').toLowerCase();
  });

  if (duplicate) {
    return 'A course with that code already exists.';
  }

  return '';
}

function addCourse(course) {
  const error = validateCourse(course);
  if (error) {
    return { ok: false, message: error };
  }

  const catalog = getSharedCatalog();
  catalog.push(normalizeCourse(course));
  saveSharedCatalog(catalog);

  return { ok: true };
}

function updateCourse(existingCode, updatedCourse) {
  const error = validateCourse(updatedCourse, existingCode);
  if (error) {
    return { ok: false, message: error };
  }

  const catalog = getSharedCatalog();
  const index = catalog.findIndex(function (course) {
    return course.code === existingCode;
  });

  if (index === -1) {
    return { ok: false, message: 'Course not found.' };
  }

  catalog[index] = normalizeCourse(updatedCourse);
  saveSharedCatalog(catalog);

  return { ok: true };
}

function deleteCourse(code) {
  const catalog = getSharedCatalog();
  const course = catalog.find(function (item) {
    return item.code === code;
  });

  if (!course) {
    return { ok: false, message: 'Course not found.' };
  }

  if (Number(course.enrolled) > 0) {
    return { ok: false, message: 'Cannot delete a course that still has enrolled students.' };
  }

  const nextCatalog = catalog.filter(function (item) {
    return item.code !== code;
  });

  saveSharedCatalog(nextCatalog);
  return { ok: true };
}

/* -----------------------------
   Derived analytics
------------------------------ */

function getSeatsLeft(course) {
  return Math.max(0, Number(course.capacity) - Number(course.enrolled));
}

function getUtilization(course) {
  if (!Number(course.capacity)) return 0;
  return Math.round((Number(course.enrolled) / Number(course.capacity)) * 100);
}

function getCatalogStats(catalog) {
  const totalCourses = catalog.length;
  const totalCapacity = catalog.reduce(function (sum, course) {
    return sum + Number(course.capacity || 0);
  }, 0);
  const filledSeats = catalog.reduce(function (sum, course) {
    return sum + Number(course.enrolled || 0);
  }, 0);
  const availableSeats = Math.max(0, totalCapacity - filledSeats);
  const avgEnrollmentRate = totalCapacity ? Math.round((filledSeats / totalCapacity) * 100) : 0;

  const fullCount = catalog.filter(function (course) {
    return getUtilization(course) >= 100;
  }).length;

  const highCount = catalog.filter(function (course) {
    const rate = getUtilization(course);
    return rate >= 75 && rate < 100;
  }).length;

  const mediumCount = catalog.filter(function (course) {
    const rate = getUtilization(course);
    return rate >= 50 && rate < 75;
  }).length;

  const lowCount = catalog.filter(function (course) {
    return getUtilization(course) < 50;
  }).length;

  return {
    totalCourses: totalCourses,
    totalCapacity: totalCapacity,
    filledSeats: filledSeats,
    availableSeats: availableSeats,
    avgEnrollmentRate: avgEnrollmentRate,
    fullCount: fullCount,
    highCount: highCount,
    mediumCount: mediumCount,
    lowCount: lowCount
  };
}

/* -----------------------------
   Notifications
------------------------------ */

function createNoticeSystem() {
  const wraps = document.querySelectorAll('.bell-wrap');

  wraps.forEach(function (wrap) {
    const panel = wrap.querySelector('.notice-panel');
    const button = wrap.querySelector('.bell-btn');
    const list = wrap.querySelector('.notice-list');
    const clearButton = wrap.querySelector('.notice-clear');
    const badge = wrap.querySelector('.badge');
    const raw = wrap.dataset.notices || '[]';
    let notices = [];

    try {
      notices = JSON.parse(raw);
    } catch (error) {
      notices = [];
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
        renderNotices();
      });
    }

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        notices = [];
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
   Dashboard render
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

function renderRegistrarDashboard() {
  const overviewList = document.querySelector('.overview-list');
  const pageTitle = document.querySelector('.page-title');

  if (!overviewList || !pageTitle || !pageTitle.textContent.includes('Welcome back')) {
    return;
  }

  const catalog = getSharedCatalog();
  const stats = getCatalogStats(catalog);

  updateStatCard('Total Students', String(stats.filledSeats), stats.totalCourses ? 'Across all course seats' : 'No courses yet');
  updateStatCard('Active Courses', String(stats.totalCourses), 'Current offerings');
  updateStatCard('Total Enrollments', String(stats.filledSeats), 'Across active offerings');
  updateStatCard('Avg. Enrollment Rate', stats.avgEnrollmentRate + '%', 'Course capacity usage');

  const topCourses = catalog
    .slice()
    .sort(function (a, b) {
      return getUtilization(b) - getUtilization(a);
    })
    .slice(0, 5);

  overviewList.innerHTML = '';

  if (!topCourses.length) {
    overviewList.innerHTML =
      '<div class="empty-wrap">' +
        '<div class="empty-icon">📘</div>' +
        '<div class="empty-title">No Courses Available</div>' +
        '<div class="empty-copy">Add a course from Course Management to get started.</div>' +
      '</div>';
    return;
  }

  topCourses.forEach(function (course) {
    const item = document.createElement('div');
    item.className = 'overview-item';
    item.innerHTML =
      '<div class="overview-top">' +
        '<span><strong>' + escapeHtml(course.code) + '</strong> ' + escapeHtml(course.name) + '</span>' +
        '<span>' + course.enrolled + '/' + course.capacity + '</span>' +
      '</div>' +
      '<div class="progress-track"><div class="progress-fill" style="width:' + getUtilization(course) + '%;"></div></div>';

    overviewList.appendChild(item);
  });
}

/* -----------------------------
   Registrar catalog render/filter
------------------------------ */

function getCatalogFilterValue() {
  const select = document.querySelector('.catalog-filter');
  return select ? select.value : 'all';
}

function getCatalogSearchValue() {
  const input = document.querySelector('.catalog-search-input');
  return input ? input.value.trim().toLowerCase() : '';
}

function matchesCatalogFilter(course, filterValue) {
  const seatsLeft = getSeatsLeft(course);
  const rate = getUtilization(course);

  if (filterValue === 'open') return seatsLeft > 0;
  if (filterValue === 'nearly-full') return seatsLeft > 0 && rate >= 85;
  if (filterValue === 'full') return seatsLeft <= 0;

  return true;
}

function renderRegistrarCatalog() {
  const container = document.querySelector('.catalog-grid');
  if (!container) return;

  const catalog = getSharedCatalog();
  const searchValue = getCatalogSearchValue();
  const filterValue = getCatalogFilterValue();

  const visibleCourses = catalog.filter(function (course) {
    const haystack = (
      course.code + ' ' +
      course.name + ' ' +
      course.instructor + ' ' +
      course.location + ' ' +
      course.schedule
    ).toLowerCase();

    const matchesSearch = !searchValue || haystack.includes(searchValue);
    const matchesFilter = matchesCatalogFilter(course, filterValue);

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
    const seatsLeft = getSeatsLeft(course);
    const seatClass = seatsLeft <= 0 ? 'seat-pill full' : 'seat-pill';

    return (
      '<article class="course-card">' +
        '<div class="course-top">' +
          '<div>' +
            '<div class="course-code">' + escapeHtml(course.code) + ' <span class="hours-pill">' + course.hours + ' hrs</span></div>' +
            '<div class="course-name">' + escapeHtml(course.name) + '</div>' +
          '</div>' +
          '<div class="' + seatClass + '">' + (seatsLeft <= 0 ? 'Full' : seatsLeft + ' seats') + '</div>' +
        '</div>' +
        '<div class="course-desc">Managed by registrar catalog.</div>' +
        '<div class="meta-stack">' +
          '<div class="meta-row"><span>👤 ' + escapeHtml(course.instructor) + '</span><span>📍 ' + escapeHtml(course.location) + '</span></div>' +
          '<div class="meta-row"><span>🕒 ' + escapeHtml(course.schedule) + '</span><span></span></div>' +
          '<div class="meta-row"><span class="enrolled-text">' + course.enrolled + '/' + course.capacity + ' enrolled</span><span></span></div>' +
        '</div>' +
      '</article>'
    );
  }).join('');
}

function bindCatalogControls() {
  const searchInput = document.querySelector('.catalog-search-input');
  const filterSelect = document.querySelector('.catalog-filter');

  if (searchInput) {
    searchInput.addEventListener('input', renderRegistrarCatalog);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', renderRegistrarCatalog);
  }
}

/* -----------------------------
   Course management
------------------------------ */

function ensureManagementHost() {
  const searchRow = document.querySelector('.registrar-search-only');
  if (!searchRow) return null;

  let host = document.querySelector('.registrar-form-host');

  if (!host) {
    host = document.createElement('div');
    host.className = 'registrar-form-host';
    searchRow.insertAdjacentElement('afterend', host);
  }

  return host;
}

function getCourseFormHtml(course) {
  return (
    '<div class="editor-grid">' +
      '<label><span>Course Code</span><input type="text" name="code" value="' + escapeHtml(course.code) + '"></label>' +
      '<label><span>Course Name</span><input type="text" name="name" value="' + escapeHtml(course.name) + '"></label>' +
      '<label><span>Hours</span><input type="number" min="1" name="hours" value="' + escapeHtml(course.hours) + '"></label>' +
      '<label><span>Instructor</span><input type="text" name="instructor" value="' + escapeHtml(course.instructor) + '"></label>' +
      '<label><span>Location</span><input type="text" name="location" value="' + escapeHtml(course.location) + '"></label>' +
      '<label><span>Schedule</span><input type="text" name="schedule" value="' + escapeHtml(course.schedule) + '"></label>' +
      '<label><span>Capacity</span><input type="number" min="1" name="capacity" value="' + escapeHtml(course.capacity) + '"></label>' +
      '<label><span>Enrolled</span><input type="number" min="0" name="enrolled" value="' + escapeHtml(course.enrolled) + '"></label>' +
    '</div>'
  );
}

function renderAddCourseForm() {
  const host = ensureManagementHost();
  if (!host) return;

  host.innerHTML =
    '<div class="editor-shell editor-shell-open">' +
      '<div class="editor-title-row">' +
        '<strong>Add Course</strong>' +
        '<button type="button" class="outline-btn registrar-cancel-add">Cancel</button>' +
      '</div>' +
      getCourseFormHtml({
        code: '',
        name: '',
        hours: 3,
        instructor: '',
        location: '',
        schedule: '',
        capacity: 30,
        enrolled: 0
      }) +
      '<div class="editor-actions">' +
        '<button type="button" class="primary-btn registrar-save-add">Save Course</button>' +
      '</div>' +
      '<div class="inline-note registrar-form-message"></div>' +
    '</div>';
}

function closeAddCourseForm() {
  const host = document.querySelector('.registrar-form-host');
  if (host) host.innerHTML = '';
}

function readFormValues(scope) {
  return {
    code: scope.querySelector('[name="code"]').value,
    name: scope.querySelector('[name="name"]').value,
    hours: Number(scope.querySelector('[name="hours"]').value),
    instructor: scope.querySelector('[name="instructor"]').value,
    location: scope.querySelector('[name="location"]').value,
    schedule: scope.querySelector('[name="schedule"]').value,
    capacity: Number(scope.querySelector('[name="capacity"]').value),
    enrolled: Number(scope.querySelector('[name="enrolled"]').value)
  };
}

function renderCourseManagement() {
  const list = document.querySelector('.manage-list');
  const title = document.querySelector('.section-title');

  if (!list || !title || !title.textContent.includes('Course Offerings')) {
    return;
  }

  const catalog = getSharedCatalog();

  title.textContent = 'Course Offerings (' + catalog.length + ')';

  if (!catalog.length) {
    list.innerHTML =
      '<div class="empty-wrap">' +
        '<div class="empty-icon">📋</div>' +
        '<div class="empty-title">No Courses Yet</div>' +
        '<div class="empty-copy">Use Add Course to create the first offering.</div>' +
      '</div>';
    return;
  }

  list.innerHTML = catalog.map(function (course) {
    return (
      '<div class="manage-item" data-code="' + escapeHtml(course.code) + '">' +
        '<div class="manage-main">' +
          '<div class="course-code">' + escapeHtml(course.code) + ' <span class="hours-pill">' + course.hours + ' hrs</span></div>' +
          '<div class="course-name">' + escapeHtml(course.name) + '</div>' +
          '<div class="manage-meta">' + escapeHtml(course.instructor) + ' • ' + escapeHtml(course.schedule) + ' • ' + escapeHtml(course.location) + '</div>' +
          '<div class="manage-enrollment-label">Enrollment</div>' +
          '<div class="progress-track"><div class="progress-fill" style="width:' + getUtilization(course) + '%;"></div></div>' +
          '<div class="manage-editor" hidden>' +
            '<div class="editor-shell">' +
              '<div class="editor-title-row">' +
                '<strong>Edit Course</strong>' +
                '<button type="button" class="outline-btn registrar-cancel-edit">Close</button>' +
              '</div>' +
              getCourseFormHtml(course) +
              '<div class="editor-actions">' +
                '<button type="button" class="primary-btn registrar-save-edit">Save Changes</button>' +
              '</div>' +
              '<div class="inline-note registrar-edit-message"></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="manage-side">' +
          '<div class="manage-buttons">' +
            '<button class="outline-btn registrar-edit-toggle" type="button">✎ Edit</button>' +
            '<button class="outline-btn danger-outline registrar-delete-course" type="button">🗑</button>' +
          '</div>' +
          '<div class="manage-count">' + course.enrolled + '/' + course.capacity + '</div>' +
        '</div>' +
      '</div>'
    );
  }).join('');
}

function bindCourseManagement() {
  const addButton = document.querySelector('.registrar-add-btn');
  const list = document.querySelector('.manage-list');
  const searchInput = document.querySelector('.management-search-input');

  if (addButton) {
    addButton.addEventListener('click', function () {
      const host = document.querySelector('.registrar-form-host');

      if (host && host.innerHTML.trim()) {
        closeAddCourseForm();
      } else {
        renderAddCourseForm();
      }
    });
  }

  document.addEventListener('click', function (event) {
    if (event.target.closest('.registrar-cancel-add')) {
      closeAddCourseForm();
    }

    if (event.target.closest('.registrar-save-add')) {
      const shell = event.target.closest('.editor-shell');
      const message = shell.querySelector('.registrar-form-message');
      const values = readFormValues(shell);
      const result = addCourse(values);

      if (!result.ok) {
        if (message) message.textContent = result.message;
        return;
      }

      closeAddCourseForm();
      renderAllRegistrarViews();
    }
  });

  if (list) {
    list.addEventListener('click', function (event) {
      const item = event.target.closest('.manage-item');
      if (!item) return;

      const code = item.dataset.code;
      const editor = item.querySelector('.manage-editor');

      if (event.target.closest('.registrar-edit-toggle')) {
        if (editor) {
          editor.hidden = !editor.hidden;
        }
      }

      if (event.target.closest('.registrar-cancel-edit')) {
        if (editor) {
          editor.hidden = true;
        }
      }

      if (event.target.closest('.registrar-save-edit')) {
        const shell = event.target.closest('.editor-shell');
        const message = shell.querySelector('.registrar-edit-message');
        const values = readFormValues(shell);
        const result = updateCourse(code, values);

        if (!result.ok) {
          if (message) message.textContent = result.message;
          return;
        }

        renderAllRegistrarViews();
      }

      if (event.target.closest('.registrar-delete-course')) {
        const course = getSharedCourseByCode(code);
        if (!course) return;

        const confirmDelete = window.confirm(
          'Delete ' + course.code + ' - ' + course.name + '?\n\nThis only works when enrolled is 0.'
        );

        if (!confirmDelete) return;

        const result = deleteCourse(code);

        if (!result.ok) {
          window.alert(result.message);
          return;
        }

        renderAllRegistrarViews();
      }
    });
  }

  if (searchInput && list) {
    searchInput.addEventListener('input', function () {
      const value = searchInput.value.trim().toLowerCase();

      list.querySelectorAll('.manage-item').forEach(function (item) {
        const text = item.textContent.toLowerCase();
        item.style.display = !value || text.includes(value) ? '' : 'none';
      });
    });
  }
}

/* -----------------------------
   Reports render
------------------------------ */

function setDonutChart(stats) {
  const chart = document.querySelector('.donut-chart');
  const legend = document.querySelector('.donut-legend');

  if (!chart) return;

  const total = stats.fullCount + stats.highCount + stats.mediumCount + stats.lowCount;

  if (!total) {
    chart.style.background = '#ece7e5';
  } else {
    const fullPercent = (stats.fullCount / total) * 100;
    const highPercent = (stats.highCount / total) * 100;
    const mediumPercent = (stats.mediumCount / total) * 100;
    const lowPercent = (stats.lowCount / total) * 100;

    const stop1 = fullPercent;
    const stop2 = stop1 + highPercent;
    const stop3 = stop2 + mediumPercent;
    const stop4 = stop3 + lowPercent;

    chart.style.background =
      'conic-gradient(' +
      'var(--school) 0 ' + stop1 + '%,' +
      'rgba(10, 31, 68, 0.75) ' + stop1 + '% ' + stop2 + '%,' +
      'rgba(10, 31, 68, 0.5) ' + stop2 + '% ' + stop3 + '%,' +
      'rgba(10, 31, 68, 0.28) ' + stop3 + '% ' + stop4 + '%' +
      ')';
  }

  if (legend) {
    legend.innerHTML =
      '<span><i class="dot dot-full"></i> Full (' + stats.fullCount + ')</span>' +
      '<span><i class="dot dot-high"></i> High (' + stats.highCount + ')</span>' +
      '<span><i class="dot dot-medium"></i> Medium (' + stats.mediumCount + ')</span>' +
      '<span><i class="dot dot-low"></i> Low (' + stats.lowCount + ')</span>';
  }
}

function renderReportsPage() {
  const chartList = document.querySelector('.chart-list');
  const reportTable = document.querySelector('.report-table tbody');

  if (!chartList || !reportTable) return;

  const catalog = getSharedCatalog();
  const stats = getCatalogStats(catalog);

  updateStatCard('Total Students', String(stats.filledSeats));
  updateStatCard('Active Courses', String(stats.totalCourses));
  updateStatCard('Active Enrollments', String(stats.filledSeats));
  updateStatCard('Avg. Enrollment Rate', stats.avgEnrollmentRate + '%');

  const sorted = catalog.slice().sort(function (a, b) {
    return getUtilization(b) - getUtilization(a);
  });

  chartList.innerHTML = sorted.map(function (course) {
    return (
      '<div class="chart-row">' +
        '<span>' + escapeHtml(course.code) + '</span>' +
        '<div class="bar-bg"><div class="bar-fill" style="width:' + getUtilization(course) + '%;"></div></div>' +
        '<span>' + course.enrolled + '/' + course.capacity + '</span>' +
      '</div>'
    );
  }).join('');

  reportTable.innerHTML = sorted.map(function (course) {
    const rate = getUtilization(course);
    let statusClass = 'available';
    let statusText = 'Available';

    if (rate >= 100) {
      statusClass = 'full-status';
      statusText = 'Full';
    } else if (rate >= 85) {
      statusClass = 'nearly-full';
      statusText = 'Nearly Full';
    }

    return (
      '<tr>' +
        '<td><strong>' + escapeHtml(course.code) + '</strong><br><small>' + escapeHtml(course.name) + '</small></td>' +
        '<td>' + escapeHtml(course.instructor) + '</td>' +
        '<td>' + escapeHtml(course.schedule) + '</td>' +
        '<td>' + course.enrolled + '</td>' +
        '<td>' + course.capacity + '</td>' +
        '<td><span class="status-pill ' + statusClass + '">' + statusText + '</span></td>' +
        '<td><div class="mini-util"><div style="width:' + rate + '%;"></div></div>' + rate + '%</td>' +
      '</tr>'
    );
  }).join('');

  setDonutChart(stats);

  const bottomCards = document.querySelectorAll('.registrar-bottom-stats .stat-card');
  if (bottomCards[0]) {
    bottomCards[0].querySelector('.card-value').textContent = stats.totalCapacity;
  }
  if (bottomCards[1]) {
    bottomCards[1].querySelector('.card-value').textContent = stats.filledSeats;
  }
  if (bottomCards[2]) {
    bottomCards[2].querySelector('.card-value').textContent = stats.availableSeats;
  }
}

/* -----------------------------
   Global rerender
------------------------------ */

function renderAllRegistrarViews() {
  renderRegistrarDashboard();
  renderRegistrarCatalog();
  renderCourseManagement();
  renderReportsPage();
}

function bindStorageSync() {
  window.addEventListener('storage', function (event) {
    if (event.key === SHARED_CATALOG_KEY) {
      renderAllRegistrarViews();
    }
  });
}

/* -----------------------------
   Startup
------------------------------ */

document.addEventListener('DOMContentLoaded', function () {
  const user = guardRegistrarAccess();
  if (!user) return;

  ensureSharedCatalog();
  hydrateRegistrarUser(user);
  bindSignOut();
  createNoticeSystem();
  bindCatalogControls();
  bindCourseManagement();
  bindStorageSync();
  renderAllRegistrarViews();
});