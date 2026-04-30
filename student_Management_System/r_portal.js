/* 
	Team #7 Group Project
	Names: David Vargas, Camila Rosas, Maria Barco, Zinia Noorani
	
	============================================================================
	| THIS FILE IS MEANT TO BE A DEMO AND NOT THE FINAL PRODUCT. BUGS MAY OCCUR. |
	============================================================================
*/

(function () {
  const demo = window.SMSDemo;

  function showPromptForm(existing) {
    const defaults = existing || {
      code: '',
      name: '',
      hours: 3,
      instructor: '',
      roomNum: '',
      schedule: '',
      enrollmentLimit: 3,
      description: ''
    };

    const code = window.prompt('Course code', defaults.code);
    if (code === null) return null;

    const name = window.prompt('Course name', defaults.name);
    if (name === null) return null;

    const hours = window.prompt('Credit hours', String(defaults.hours));
    if (hours === null) return null;

    const instructor = window.prompt('Instructor', defaults.instructor);
    if (instructor === null) return null;

    const roomNum = window.prompt('Room / location', defaults.roomNum);
    if (roomNum === null) return null;

    const schedule = window.prompt('Schedule', defaults.schedule);
    if (schedule === null) return null;

    const enrollmentLimit = window.prompt('Capacity', String(defaults.enrollmentLimit));
    if (enrollmentLimit === null) return null;

    const description = window.prompt('Description', defaults.description);
    if (description === null) return null;

    return {
      code,
      name,
      hours: Number(hours),
      instructor,
      roomNum,
      schedule,
      enrollmentLimit: Number(enrollmentLimit),
      description
    };
  }

  function getUtilization(course) {
    return course.enrollmentLimit ? Math.round((course.enrolledCount / course.enrollmentLimit) * 100) : 0;
  }

  function getSeatLabel(course) {
    const seatsLeft = Math.max(0, Number(course.enrollmentLimit) - Number(course.enrolledCount));
    return seatsLeft <= 0 ? 'Full' : seatsLeft + ' seats';
  }

  function getStatus(course) {
    const rate = getUtilization(course);

    if (rate >= 100) return { text: 'Full', cls: 'full-status' };
    if (rate >= 85) return { text: 'Nearly Full', cls: 'nearly-full' };

    return { text: 'Available', cls: 'available' };
  }

  function hydrateUser(user) {
    const displayName = user.name || 'Registrar';
    const firstName = displayName.split(' ')[0] || displayName;
    const initials = demo.getInitials(displayName);

    document.querySelectorAll('.user-name').forEach((el) => el.textContent = displayName);
    document.querySelectorAll('.user-role').forEach((el) => el.textContent = 'Registrar');
    document.querySelectorAll('.avatar').forEach((el) => el.textContent = initials);
    document.querySelectorAll('.page-user-name').forEach((el) => el.textContent = firstName);
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

  function initNotifications() {
    const wraps = document.querySelectorAll('.bell-wrap');

    wraps.forEach((wrap, index) => {
      const panel = wrap.querySelector('.notice-panel');
      const button = wrap.querySelector('.bell-btn');
      const list = wrap.querySelector('.notice-list');
      const clearButton = wrap.querySelector('.notice-clear');
      const badge = wrap.querySelector('.badge');
      const raw = wrap.dataset.notices || '[]';
      const page = window.location.pathname.split('/').pop() || 'registrar';
      const storageKey = 'sms_registrar_notices_' + page + '_' + index;

      let notices = [];

      try {
        const stored = localStorage.getItem(storageKey);
        notices = stored !== null ? JSON.parse(stored) : JSON.parse(raw);

        if (stored === null) {
          localStorage.setItem(storageKey, JSON.stringify(notices));
        }
      } catch (error) {
        notices = [];
      }

      function save() {
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

          const idx = Number(dismissButton.dataset.index);

          notices.splice(idx, 1);
          save();
          render();
        });
      }

      if (clearButton) {
        clearButton.addEventListener('click', () => {
          notices = [];
          save();
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

  function renderDashboard() {
    const stats = demo.getStats();
    const cards = document.querySelectorAll('.stat-card');
    const overview = document.querySelector('.overview-list');

    if (cards[0]) {
      cards[0].querySelector('.card-value').textContent = String(stats.totalStudents);
      const note = cards[0].querySelector('.card-note');
      if (note) note.textContent = 'Live demo students';
    }

    if (cards[1]) {
      cards[1].querySelector('.card-value').textContent = String(stats.activeCourses);
      const note = cards[1].querySelector('.card-note');
      if (note) note.textContent = demo.CONFIG.term;
    }

    if (cards[2]) {
      cards[2].querySelector('.card-value').textContent = String(stats.totalEnrollments);
      const note = cards[2].querySelector('.card-note');
      if (note) note.textContent = 'Across active offerings';
    }

    if (cards[3]) {
      cards[3].querySelector('.card-value').textContent = stats.avgUtilization + '%';
      const note = cards[3].querySelector('.card-note');
      if (note) note.textContent = 'Course capacity usage';
    }

    if (overview) {
      const courses = demo.getCourses().slice().sort((a, b) => getUtilization(b) - getUtilization(a));

      overview.innerHTML = courses.map((course) => {
        return '<div class="overview-item"><div class="overview-top"><span><strong>'
          + demo.escapeHtml(course.courseCode)
          + '</strong> '
          + demo.escapeHtml(course.courseName)
          + '</span><span>'
          + course.enrolledCount
          + '/'
          + course.enrollmentLimit
          + '</span></div><div class="progress-track"><div class="progress-fill" style="width:'
          + getUtilization(course)
          + '%;"></div></div></div>';
      }).join('');
    }
  }

  function renderCatalog() {
    const container = document.querySelector('.catalog-grid');
    const searchInput = document.querySelector('.catalog-search-input');
    const filterSelect = document.querySelector('.catalog-filter');

    if (!container) return;

    function draw() {
      const searchValue = (searchInput?.value || '').trim().toLowerCase();
      const filterValue = filterSelect?.value || 'all';

      const courses = demo.getCourses().filter((course) => {
        const haystack = [
          course.courseCode,
          course.courseName,
          course.instructor,
          course.roomNum,
          course.schedule
        ].join(' ').toLowerCase();

        const rate = getUtilization(course);
        const seatsLeft = Math.max(0, course.enrollmentLimit - course.enrolledCount);
        const matchesSearch = !searchValue || haystack.includes(searchValue);

        let matchesFilter = true;

        if (filterValue === 'open') matchesFilter = seatsLeft > 0;
        if (filterValue === 'nearly-full') matchesFilter = rate >= 85 && rate < 100;
        if (filterValue === 'full') matchesFilter = rate >= 100;

        return matchesSearch && matchesFilter;
      });

      if (!courses.length) {
        container.innerHTML = '<div class="empty-wrap"><div class="empty-icon">📖</div><div class="empty-title">No Courses Found</div><div class="empty-copy">Try adjusting the search or filter.</div></div>';
        return;
      }

      container.innerHTML = courses.map((course) => {
        const full = course.enrolledCount >= course.enrollmentLimit;

        return '<article class="course-card"><div class="course-top"><div><div class="course-code">'
          + demo.escapeHtml(course.courseCode)
          + ' <span class="hours-pill">'
          + course.courseHours
          + ' hrs</span></div><div class="course-name">'
          + demo.escapeHtml(course.courseName)
          + '</div></div><div class="seat-pill'
          + (full ? ' full' : '')
          + '">'
          + getSeatLabel(course)
          + '</div></div><div class="course-desc">'
          + demo.escapeHtml(course.description)
          + '</div><div class="meta-stack"><div class="meta-row"><span>👤 '
          + demo.escapeHtml(course.instructor)
          + '</span><span>📍 '
          + demo.escapeHtml(course.roomNum)
          + '</span></div><div class="meta-row"><span>🕒 '
          + demo.escapeHtml(course.schedule)
          + '</span><span></span></div><div class="meta-row"><span class="enrolled-text">'
          + course.enrolledCount
          + '/'
          + course.enrollmentLimit
          + ' enrolled</span><span></span></div></div></article>';
      }).join('');
    }

    if (searchInput) searchInput.addEventListener('input', draw);
    if (filterSelect) filterSelect.addEventListener('change', draw);

    draw();
  }

  function renderManagement() {
    const container = document.querySelector('.manage-list');
    const searchInput = document.querySelector('.management-search-input');
    const addButton = document.querySelector('.registrar-add-btn');
    const sectionTitle = document.querySelector('.panel .section-title');

    if (!container) return;

    function getStudentSummary(student) {
      return student.studentId + ' - ' + student.name + ' (' + student.creditHours + '/' + demo.CONFIG.maxStudentHours + ' hrs)';
    }

    function promptStudentForAdd(course) {
      const availableStudents = demo.getStudents();
      const options = availableStudents.map((student) => getStudentSummary(student)).join('\n');

      return window.prompt(
        'Enter the student ID to add to ' + course.courseCode + '.\n\nStudents:\n' + options,
        availableStudents[0]?.studentId || ''
      );
    }

    function promptStudentForDrop(course) {
      const enrolledStudents = demo.getStudents().filter((student) => {
        return demo.getRegistrationsByStudent(student.studentId).some((registration) => {
          return registration.course.courseId === course.courseId;
        });
      });

      if (!enrolledStudents.length) {
        window.alert('No students are enrolled in ' + course.courseCode + ' yet.');
        return null;
      }

      const options = enrolledStudents.map((student) => getStudentSummary(student)).join('\n');

      return window.prompt(
        'Enter the student ID to remove from ' + course.courseCode + '.\n\nCurrently enrolled:\n' + options,
        enrolledStudents[0].studentId
      );
    }

    function draw() {
      const searchValue = (searchInput?.value || '').trim().toLowerCase();

      const courses = demo.getCourses().filter((course) => {
        const haystack = [
          course.courseCode,
          course.courseName,
          course.instructor,
          course.roomNum,
          course.schedule
        ].join(' ').toLowerCase();

        return !searchValue || haystack.includes(searchValue);
      }).sort((a, b) => a.courseCode.localeCompare(b.courseCode));

      if (sectionTitle) {
        sectionTitle.textContent = 'Course Offerings (' + courses.length + ')';
      }

      if (!courses.length) {
        container.innerHTML = '<div class="empty-wrap"><div class="empty-icon">📋</div><div class="empty-title">No Courses Yet</div><div class="empty-copy">Use Add Course to create the first offering.</div></div>';
        return;
      }

      container.innerHTML = courses.map((course) => {
        return '<div class="manage-item" data-course-id="'
          + course.courseId
          + '"><div class="manage-main"><div class="course-code">'
          + demo.escapeHtml(course.courseCode)
          + ' <span class="hours-pill">'
          + course.courseHours
          + ' hrs</span></div><div class="course-name">'
          + demo.escapeHtml(course.courseName)
          + '</div><div class="manage-meta">'
          + demo.escapeHtml(course.instructor)
          + ' • '
          + demo.escapeHtml(course.schedule)
          + ' • '
          + demo.escapeHtml(course.roomNum)
          + '</div><div class="manage-enrollment-label">Enrollment</div><div class="progress-track"><div class="progress-fill" style="width:'
          + getUtilization(course)
          + '%;"></div></div></div><div class="manage-side"><div class="manage-buttons"><button class="outline-btn registrar-edit" type="button">✎ Edit</button><button class="outline-btn registrar-assign" type="button">＋ Student</button><button class="outline-btn registrar-remove" type="button">－ Student</button><button class="outline-btn danger-outline registrar-delete" type="button">🗑</button></div><div class="manage-count">'
          + course.enrolledCount
          + '/'
          + course.enrollmentLimit
          + '</div></div></div>';
      }).join('');
    }

    if (searchInput) searchInput.addEventListener('input', draw);

    if (addButton) {
      addButton.addEventListener('click', () => {
        const payload = showPromptForm();

        if (!payload) return;

        try {
          demo.addCourse(payload);
          draw();
          window.alert('Course created successfully. Every portal now sees the new course.');
        } catch (error) {
          window.alert(error.message || 'Unable to create course.');
        }
      });
    }

    container.addEventListener('click', (event) => {
      const card = event.target.closest('[data-course-id]');

      if (!card) return;

      const courseId = card.dataset.courseId;
      const course = demo.getCourses().find((item) => item.courseId === courseId);

      if (!course) return;

      if (event.target.closest('.registrar-edit')) {
        const payload = showPromptForm({
          code: course.courseCode,
          name: course.courseName,
          hours: course.courseHours,
          instructor: course.instructor,
          roomNum: course.roomNum,
          schedule: course.schedule,
          enrollmentLimit: course.enrollmentLimit,
          description: course.description
        });

        if (!payload) return;

        try {
          demo.updateCourse(courseId, payload);
          draw();
          window.alert('Course updated successfully.');
        } catch (error) {
          window.alert(error.message || 'Unable to update course.');
        }
      }

      if (event.target.closest('.registrar-assign')) {
        const studentId = String(promptStudentForAdd(course) || '').trim();

        if (!studentId) return;

        try {
          demo.enrollStudentInCourse(studentId, courseId);
          draw();
          window.alert('Student added to the course. Student, finance, admin, and registrar pages all update from the same demo data.');
        } catch (error) {
          window.alert(error.message || 'Unable to add the student to this course.');
        }
      }

      if (event.target.closest('.registrar-remove')) {
        const studentId = String(promptStudentForDrop(course) || '').trim();

        if (!studentId) return;

        try {
          const registration = demo.getRegistrationsByStudent(studentId).find((item) => {
            return item.course.courseId === courseId;
          });

          if (!registration) throw new Error('That student is not enrolled in this course.');

          demo.dropRegistration(registration.registrationId);
          draw();
          window.alert('Student removed from the course successfully.');
        } catch (error) {
          window.alert(error.message || 'Unable to remove the student from this course.');
        }
      }

      if (event.target.closest('.registrar-delete')) {
        const confirmed = window.confirm(
          'Delete ' + course.courseCode + '? This will remove the course and drop any linked student registrations.'
        );

        if (!confirmed) return;

        try {
          demo.deleteCourse(courseId);
          draw();
          window.alert('Course deleted successfully. Any linked student enrollments were removed automatically.');
        } catch (error) {
          window.alert(error.message || 'Unable to delete course.');
        }
      }
    });

    draw();
  }

  function renderReports() {
    const stats = demo.getStats();
    const cards = document.querySelectorAll('.stat-card');
    const chartList = document.querySelector('.chart-list');
    const donut = document.querySelector('.donut-chart');
    const legend = document.querySelector('.donut-legend');
    const reportTable = document.querySelector('.report-table tbody');

    if (cards[0]) cards[0].querySelector('.card-value').textContent = String(stats.totalStudents);
    if (cards[1]) cards[1].querySelector('.card-value').textContent = String(stats.activeCourses);
    if (cards[2]) cards[2].querySelector('.card-value').textContent = String(stats.totalEnrollments);
    if (cards[3]) cards[3].querySelector('.card-value').textContent = stats.avgUtilization + '%';

    const courses = demo.getCourses().slice().sort((a, b) => getUtilization(b) - getUtilization(a));

    if (chartList) {
      chartList.innerHTML = courses.map((course) => {
        return '<div class="chart-row"><span>'
          + demo.escapeHtml(course.courseCode)
          + '</span><div class="bar-bg"><div class="bar-fill" style="width:'
          + getUtilization(course)
          + '%;"></div></div><span>'
          + course.enrolledCount
          + '/'
          + course.enrollmentLimit
          + '</span></div>';
      }).join('');
    }

    if (donut) {
      const full = stats.utilizationBuckets.full;
      const high = stats.utilizationBuckets.high;
      const medium = stats.utilizationBuckets.medium;
      const low = stats.utilizationBuckets.low;
      const total = Math.max(1, full + high + medium + low);
      const p1 = Math.round((full / total) * 100);
      const p2 = Math.round(((full + high) / total) * 100);
      const p3 = Math.round(((full + high + medium) / total) * 100);

      donut.style.background = `conic-gradient(#0a1f44 0% ${p1}%, #a1194f ${p1}% ${p2}%, #e98929 ${p2}% ${p3}%, #d7d0d4 ${p3}% 100%)`;
    }

    if (legend) {
      legend.innerHTML = '<span><i class="dot dot-full"></i> Full ('
        + stats.utilizationBuckets.full
        + ')</span><span><i class="dot dot-high"></i> High ('
        + stats.utilizationBuckets.high
        + ')</span><span><i class="dot dot-medium"></i> Medium ('
        + stats.utilizationBuckets.medium
        + ')</span><span><i class="dot dot-low"></i> Low ('
        + stats.utilizationBuckets.low
        + ')</span>';
    }

    if (reportTable) {
      reportTable.innerHTML = courses.map((course) => {
        const status = getStatus(course);
        const rate = getUtilization(course);

        return '<tr><td><strong>'
          + demo.escapeHtml(course.courseCode)
          + '</strong><br><small>'
          + demo.escapeHtml(course.courseName)
          + '</small></td><td>'
          + demo.escapeHtml(course.instructor)
          + '</td><td>'
          + demo.escapeHtml(course.schedule)
          + '</td><td>'
          + course.enrolledCount
          + '</td><td>'
          + course.enrollmentLimit
          + '</td><td><span class="status-pill '
          + status.cls
          + '">'
          + status.text
          + '</span></td><td><div class="mini-util"><div style="width:'
          + rate
          + '%;"></div></div>'
          + rate
          + '%</td></tr>';
      }).join('');
    }
  }

  function init() {
    const user = demo.requireRole(['REGISTRAR']);

    if (!user) return;

    hydrateUser(user);
    bindSignOut();
    initNotifications();

    const page = window.location.pathname.split('/').pop() || 'registrarHomepage.html';

    if (page === 'registrarHomepage.html') renderDashboard();
    if (page === 'r_course_catalog.html') renderCatalog();
    if (page === 'course_management.html') renderManagement();
    if (page === 'r_reports.html') renderReports();
  }

  document.addEventListener('DOMContentLoaded', init);
})();