/* 
	Team #7 Group Project
	Names: David Vargas, Camila Rosas, Maria Barco, Zinia Noorani
	
	============================================================================
	| THIS FILE IS MEANT TO BE A DEMO AND NOT THE FINAL PRODUCT. BUGS MAY OCCUR. |
	============================================================================

	****AI ASSISTED WITH GEMINI****
*/

(function () {
  const demo = window.SMSDemo;

  function formatDate(date) {
    if (!date) return 'No payment yet';

    return new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function getUtilization(course) {
    return course.enrollmentLimit ? Math.round((course.enrolledCount / course.enrollmentLimit) * 100) : 0;
  }

  function getStatus(course) {
    const rate = getUtilization(course);

    if (rate >= 100) return { text: 'Full', cls: 'full' };
    if (rate >= 85) return { text: 'Nearly Full', cls: 'nearly' };

    return { text: 'Available', cls: 'available' };
  }

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

  function hydrateUser(user) {
    const displayName = user.name || 'Administrator';
    const firstName = displayName.split(' ')[0] || displayName;
    const initials = demo.getInitials(displayName);

    document.querySelectorAll('.user-name').forEach((el) => el.textContent = displayName);
    document.querySelectorAll('.user-role').forEach((el) => el.textContent = 'Administrator');
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
      const page = document.body.getAttribute('data-page') || 'admin';
      const storageKey = 'sms_admin_notices_' + page + '_' + index;

      let notices = [];

      try {
        const stored = localStorage.getItem(storageKey);
        notices = stored !== null ? JSON.parse(stored) : JSON.parse(raw);

        if (stored === null) localStorage.setItem(storageKey, JSON.stringify(notices));
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
          const dismiss = event.target.closest('.notice-dismiss');

          if (!dismiss) return;

          notices.splice(Number(dismiss.dataset.index), 1);
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

  function renderHome() {
    const stats = demo.getStats();
    const cards = document.querySelectorAll('.stat-card');
    const panel = document.querySelector('.panel');
    const courses = demo.getCourses().slice().sort((a, b) => getUtilization(b) - getUtilization(a));

    if (cards[0]) cards[0].querySelector('.card-value').textContent = String(stats.totalStudents);
    if (cards[1]) cards[1].querySelector('.card-value').textContent = String(stats.activeCourses);
    if (cards[2]) cards[2].querySelector('.card-value').textContent = String(stats.totalEnrollments);
    if (cards[3]) cards[3].querySelector('.card-value').textContent = stats.avgUtilization + '%';

    if (panel) {
      panel.innerHTML = '<div class="section-title">Course Enrollment Overview</div>'
        + '<div class="section-subtitle">Current enrollment status for ' + demo.CONFIG.term + '</div>'
        + '<div class="overview-list">'
        + courses.map((course) => {
          return '<div class="overview-item">'
            + '<div class="overview-top"><span><strong>'
            + demo.escapeHtml(course.courseCode)
            + '</strong> '
            + demo.escapeHtml(course.courseName)
            + '</span><span>'
            + course.enrolledCount
            + '/'
            + course.enrollmentLimit
            + '</span></div>'
            + '<div class="progress-track"><div class="progress-fill" style="width:'
            + getUtilization(course)
            + '%;"></div></div>'
            + '</div>';
        }).join('')
        + '</div>';
    }
  }

  function renderCatalog() {
    const container = document.querySelector('.catalog-grid');
    const searchInput = document.getElementById('catalogSearch');
    const filterSelect = document.getElementById('catalogFilter');

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

        const seatsLeft = course.enrollmentLimit - course.enrolledCount;
        const matchesSearch = !searchValue || haystack.includes(searchValue);

        let matchesFilter = true;

        if (filterValue === 'open') matchesFilter = seatsLeft > 0;
        if (filterValue === '3') matchesFilter = course.courseHours === 3;
        if (filterValue === '4') matchesFilter = course.courseHours === 4;

        return matchesSearch && matchesFilter;
      });

      container.innerHTML = courses.map((course) => {
        const full = course.enrolledCount >= course.enrollmentLimit;

        return '<article class="catalog-course-card"><div class="course-top"><div><div class="course-code">'
          + demo.escapeHtml(course.courseCode)
          + ' <span class="hours-pill">'
          + course.courseHours
          + ' hrs</span></div><div class="course-name">'
          + demo.escapeHtml(course.courseName)
          + '</div></div><div class="seat-pill'
          + (full ? ' full' : '')
          + '">'
          + (full ? 'Full' : (course.enrollmentLimit - course.enrolledCount) + ' seats')
          + '</div></div><div class="course-desc">'
          + demo.escapeHtml(course.description)
          + '</div><div class="meta-grid"><div class="meta-item">👤 '
          + demo.escapeHtml(course.instructor)
          + '</div><div class="meta-item">📍 '
          + demo.escapeHtml(course.roomNum)
          + '</div><div class="meta-item">🕒 '
          + demo.escapeHtml(course.schedule)
          + '</div><div class="meta-item">🎓 '
          + course.enrolledCount
          + '/'
          + course.enrollmentLimit
          + ' enrolled</div></div></article>';
      }).join('');
    }

    if (searchInput) searchInput.addEventListener('input', draw);
    if (filterSelect) filterSelect.addEventListener('change', draw);

    draw();
  }

  function renderManagement() {
    const container = document.querySelector('.management-stack');
    const searchInput = document.getElementById('adminCourseManagementSearch');
    const addButton = document.querySelector('.admin-add-course-btn');
    const countEl = document.getElementById('adminCourseManagementCount');

    if (!container) return;

    function getStudentSummary(student) {
      return student.studentId + ' - ' + student.name + ' (' + student.creditHours + '/' + demo.CONFIG.maxStudentHours + ' hrs)';
    }

    function promptStudentForAdd(course) {
      const students = demo.getStudents();
      const options = students.map((student) => getStudentSummary(student)).join('\n');

      return window.prompt(
        'Enter the student ID to add to ' + course.courseCode + '.\n\nStudents:\n' + options,
        students[0]?.studentId || ''
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

      if (countEl) countEl.textContent = String(courses.length);

      container.innerHTML = courses.map((course) => {
        return '<article class="management-course-card" data-course-id="'
          + course.courseId
          + '"><div class="management-card-head"><div><div class="management-course-title">'
          + demo.escapeHtml(course.courseCode)
          + ' • '
          + demo.escapeHtml(course.courseName)
          + '</div><div class="management-course-sub">'
          + demo.escapeHtml(course.instructor)
          + ' • '
          + demo.escapeHtml(course.schedule)
          + ' • '
          + demo.escapeHtml(course.roomNum)
          + '</div></div><div class="management-actions"><button class="icon-action admin-edit-course" type="button">✎ Edit</button><button class="icon-action admin-assign-course" type="button">＋ Student</button><button class="icon-action admin-remove-course" type="button">－ Student</button><button class="icon-action delete admin-delete-course" type="button">🗑 Delete</button></div></div><div class="management-enrollment-label">Enrollment</div><div class="progress-row"><div class="progress-track"><div class="progress-fill" style="width:'
          + getUtilization(course)
          + '%;"></div></div><div>'
          + course.enrolledCount
          + '/'
          + course.enrollmentLimit
          + '</div></div></article>';
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
          window.alert('Course created successfully. The catalog and every role now show it.');
        } catch (error) {
          window.alert(error.message || 'Unable to create course.');
        }
      });
    }

    container.addEventListener('click', (event) => {
      const card = event.target.closest('[data-course-id]');

      if (!card) return;

      const course = demo.getCourses().find((item) => item.courseId === card.dataset.courseId);

      if (!course) return;

      if (event.target.closest('.admin-edit-course')) {
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
          demo.updateCourse(course.courseId, payload);
          draw();
          window.alert('Course updated successfully.');
        } catch (error) {
          window.alert(error.message || 'Unable to update course.');
        }
      }

      if (event.target.closest('.admin-assign-course')) {
        const studentId = String(promptStudentForAdd(course) || '').trim();

        if (!studentId) return;

        try {
          demo.enrollStudentInCourse(studentId, course.courseId);
          draw();
          window.alert('Student added successfully. Every portal now reflects the shared change.');
        } catch (error) {
          window.alert(error.message || 'Unable to add the student to this course.');
        }
      }

      if (event.target.closest('.admin-remove-course')) {
        const studentId = String(promptStudentForDrop(course) || '').trim();

        if (!studentId) return;

        try {
          const registration = demo.getRegistrationsByStudent(studentId).find((item) => {
            return item.course.courseId === course.courseId;
          });

          if (!registration) throw new Error('That student is not enrolled in this course.');

          demo.dropRegistration(registration.registrationId);
          draw();
          window.alert('Student removed from the course successfully.');
        } catch (error) {
          window.alert(error.message || 'Unable to remove the student from this course.');
        }
      }

      if (event.target.closest('.admin-delete-course')) {
        const confirmed = window.confirm(
          'Delete ' + course.courseCode + '? Existing student registrations for this course will also be removed.'
        );

        if (!confirmed) return;

        try {
          demo.deleteCourse(course.courseId);
          draw();
          window.alert('Course deleted successfully. Any linked student enrollments were removed automatically.');
        } catch (error) {
          window.alert(error.message || 'Unable to delete course.');
        }
      }
    });

    draw();
  }

  function renderStudentAccounts() {
    const stats = demo.getStats();
    const students = demo.getStudents();
    const cards = document.querySelectorAll('.stat-card');
    const list = document.querySelector('.account-list');
    const detailPanel = document.querySelector('.account-detail-panel');
    const searchInput = document.getElementById('studentAccountSearch');

    if (cards[0]) cards[0].querySelector('.card-value').textContent = String(stats.totalStudents);
    if (cards[1]) cards[1].querySelector('.card-value').textContent = demo.formatCurrency(stats.outstanding);
    if (cards[2]) cards[2].querySelector('.card-value').textContent = String(stats.paidInFull);

    function drawList() {
      const searchValue = (searchInput?.value || '').trim().toLowerCase();

      const filtered = students.filter((student) => {
        const haystack = [
          student.name,
          student.studentId,
          student.username,
          student.major
        ].join(' ').toLowerCase();

        return !searchValue || haystack.includes(searchValue);
      });

      list.innerHTML = filtered.map((student, index) => {
        return '<button class="account-row'
          + (index === 0 ? ' active' : '')
          + '" type="button" data-student-id="'
          + student.studentId
          + '"><div><div class="account-row-name">'
          + demo.escapeHtml(student.name)
          + '</div><div class="account-row-id">'
          + demo.escapeHtml(student.studentId)
          + '</div></div><span class="balance-pill status-'
          + (student.currentBalance > 0 ? 'warning' : 'success')
          + '">'
          + demo.formatCurrency(student.currentBalance)
          + '</span></button>';
      }).join('');

      if (filtered[0]) {
        showDetails(filtered[0].studentId);
      } else if (detailPanel) {
        detailPanel.innerHTML = '<div class="account-detail-empty"><div class="empty-icon">◎</div><div>No students match this search.</div></div>';
      }
    }

    function showDetails(studentId) {
      const student = students.find((item) => item.studentId === studentId);

      if (!student || !detailPanel) return;

      document.querySelectorAll('.account-row').forEach((row) => {
        row.classList.toggle('active', row.dataset.studentId === studentId);
      });

      const billing = demo.getBillingForStudent(student.studentId);

      detailPanel.innerHTML = '<div class="account-detail-head"><div><div class="detail-name">'
        + demo.escapeHtml(student.name)
        + '</div><div class="detail-subline">'
        + demo.escapeHtml(student.studentId)
        + ' • '
        + demo.escapeHtml(student.username)
        + '</div></div><span class="detail-status detail-status-'
        + (student.currentBalance > 0 ? 'warning' : 'success')
        + '">'
        + (student.currentBalance > 0 ? 'Balance Due' : 'Paid in Full')
        + '</span></div><div class="detail-grid"><div class="detail-card"><small>Major</small><strong>'
        + demo.escapeHtml(student.major)
        + '</strong></div><div class="detail-card"><small>Total Billed</small><strong>'
        + demo.formatCurrency(student.totalCharges)
        + '</strong></div><div class="detail-card"><small>Payments</small><strong>'
        + demo.formatCurrency(student.totalPayments)
        + '</strong></div><div class="detail-card"><small>Current Balance</small><strong class="value-'
        + (student.currentBalance > 0 ? 'warning' : 'success')
        + '">'
        + demo.formatCurrency(student.currentBalance)
        + '</strong></div><div class="detail-card"><small>Enrollments</small><strong>'
        + student.enrollments
        + '</strong></div><div class="detail-card"><small>Last Payment</small><strong>'
        + demo.escapeHtml(formatDate(student.lastPaymentDate))
        + '</strong></div></div><div class="detail-section"><div class="detail-section-label">Finance Notes</div><p class="detail-note-copy">'
        + (student.currentBalance > 0 ? 'Finance follow-up is still needed for this student account.' : 'This account is fully resolved for the current term.')
        + '</p></div><div class="transaction-table-wrap"><table class="finance-table"><thead><tr><th>Date</th><th>Type</th><th>Description</th><th class="ta-right">Amount</th></tr></thead><tbody>'
        + billing.transactions.map((item) => {
          return '<tr><td>'
            + demo.escapeHtml(formatDate(item.date))
            + '</td><td>'
            + demo.escapeHtml(item.type)
            + '</td><td>'
            + demo.escapeHtml(item.description)
            + '</td><td class="ta-right '
            + (Number(item.amount) < 0 ? 'value-success' : 'value-warning')
            + '">'
            + (Number(item.amount) < 0 ? '-' : '')
            + demo.formatCurrency(Math.abs(Number(item.amount)))
            + '</td></tr>';
        }).join('')
        + '</tbody></table></div>';
    }

    if (searchInput) searchInput.addEventListener('input', drawList);

    if (list) {
      list.addEventListener('click', (event) => {
        const row = event.target.closest('.account-row');

        if (row) showDetails(row.dataset.studentId);
      });
    }

    drawList();
  }

function renderFinancialReports() {
  const stats = demo.getStats();
  const students = demo.getStudents().slice().sort((a, b) => {
    return Number(b.currentBalance || 0) - Number(a.currentBalance || 0);
  });

  const totalRevenue = Number(stats.totalRevenue || 0);
  const totalCollected = Number(stats.totalCollected || 0);
  const outstanding = Number(stats.outstanding || 0);
  const collectionRate = Number(stats.collectionRate || 0);
  const outstandingShare = Math.max(0, 100 - collectionRate);

  const feeTotal = Number(stats.totalStudents || students.length || 0) * Number(demo.CONFIG.serviceFee || 0);
  const tuition = Math.max(0, totalRevenue - feeTotal);

  const tuitionShare = totalRevenue ? Math.round((tuition / totalRevenue) * 100) : 0;
  const feeShare = totalRevenue ? Math.round((feeTotal / totalRevenue) * 100) : 0;

  const totalRevenueEl = document.getElementById('adminTotalRevenue');
  const paymentsCollectedEl = document.getElementById('adminPaymentsCollected');
  const outstandingBalanceEl = document.getElementById('adminOutstandingBalance');
  const collectionRateEl = document.getElementById('adminCollectionRate');
  const revenueBody = document.getElementById('adminRevenueSummaryBody');
  const collectionBody = document.getElementById('adminCollectionSummaryBody');
  const studentsBody = document.getElementById('adminOutstandingStudentsBody');

  if (totalRevenueEl) totalRevenueEl.textContent = demo.formatCurrency(totalRevenue);
  if (paymentsCollectedEl) paymentsCollectedEl.textContent = demo.formatCurrency(totalCollected);
  if (outstandingBalanceEl) outstandingBalanceEl.textContent = demo.formatCurrency(outstanding);
  if (collectionRateEl) collectionRateEl.textContent = collectionRate + '%';

  if (revenueBody) {
    revenueBody.innerHTML = ''
      + '<tr>'
      + '<td>Tuition Charges</td>'
      + '<td class="ta-right">'
      + demo.formatCurrency(tuition)
      + '</td>'
      + '<td class="ta-right">'
      + tuitionShare
      + '%</td>'
      + '</tr>'
      + '<tr>'
      + '<td>Fees</td>'
      + '<td class="ta-right">'
      + demo.formatCurrency(feeTotal)
      + '</td>'
      + '<td class="ta-right">'
      + feeShare
      + '%</td>'
      + '</tr>'
      + '<tr>'
      + '<td><strong>Total Revenue</strong></td>'
      + '<td class="ta-right"><strong>'
      + demo.formatCurrency(totalRevenue)
      + '</strong></td>'
      + '<td class="ta-right"><strong>100%</strong></td>'
      + '</tr>';
  }

  if (collectionBody) {
    collectionBody.innerHTML = ''
      + '<tr>'
      + '<td>Payments Received</td>'
      + '<td class="ta-right value-success">'
      + demo.formatCurrency(totalCollected)
      + '</td>'
      + '<td class="ta-right value-success">'
      + collectionRate
      + '%</td>'
      + '</tr>'
      + '<tr>'
      + '<td>Outstanding Balance</td>'
      + '<td class="ta-right value-warning">'
      + demo.formatCurrency(outstanding)
      + '</td>'
      + '<td class="ta-right value-warning">'
      + outstandingShare
      + '%</td>'
      + '</tr>'
      + '<tr>'
      + '<td><strong>Total Billed</strong></td>'
      + '<td class="ta-right"><strong>'
      + demo.formatCurrency(totalRevenue)
      + '</strong></td>'
      + '<td class="ta-right"><strong>100%</strong></td>'
      + '</tr>';
  }

  if (studentsBody) {
    if (!students.length) {
      studentsBody.innerHTML = '<tr><td colspan="5">No student finance records found.</td></tr>';
      return;
    }

    studentsBody.innerHTML = students.map((student) => {
      const billed = Number(student.totalCharges || 0);
      const paid = Number(student.totalPayments || 0);
      const balance = Number(student.currentBalance || 0);
      const balanceClass = balance > 0 ? 'value-warning' : 'value-success';

      return '<tr>'
        + '<td>'
        + demo.escapeHtml(student.name || '')
        + '</td>'
        + '<td>'
        + demo.escapeHtml(student.major || '')
        + '</td>'
        + '<td class="ta-right">'
        + demo.formatCurrency(billed)
        + '</td>'
        + '<td class="ta-right">'
        + demo.formatCurrency(paid)
        + '</td>'
        + '<td class="ta-right '
        + balanceClass
        + '">'
        + demo.formatCurrency(balance)
        + '</td>'
        + '</tr>';
    }).join('');
  }
}

function renderEnrollmentReports() {
  const stats = demo.getStats();
  const courses = demo.getCourses().slice().sort((a, b) => getUtilization(b) - getUtilization(a));
  const cards = document.querySelectorAll('.stat-card');
  const hbar = document.querySelector('.hbar-chart');
  const donutWrap = document.querySelector('.donut-utilization');
  const notes = document.querySelector('.utilization-notes');
  const tbody = document.querySelector('.finance-table tbody, .report-table tbody');
  const bottomMetricValues = document.querySelectorAll('.bottom-metric-value');
  const bottomMetricNotes = document.querySelectorAll('.bottom-metric-note');

  if (cards[0]) cards[0].querySelector('.card-value').textContent = String(stats.totalStudents);
  if (cards[1]) cards[1].querySelector('.card-value').textContent = String(stats.activeCourses);
  if (cards[2]) cards[2].querySelector('.card-value').textContent = String(stats.totalEnrollments);
  if (cards[3]) cards[3].querySelector('.card-value').textContent = stats.avgUtilization + '%';

  if (hbar) {
    hbar.innerHTML = courses.map((course) => {
      return '<div class="hbar-row">'
        + '<div class="hbar-label">'
        + demo.escapeHtml(course.courseCode)
        + '</div>'
        + '<div class="hbar-track">'
        + '<div class="hbar-fill" style="width:'
        + getUtilization(course)
        + '%;"></div>'
        + '</div>'
        + '<div>'
        + course.enrolledCount
        + '/'
        + course.enrollmentLimit
        + '</div>'
        + '</div>';
    }).join('');
  }

  if (donutWrap) {
    const buckets = stats.utilizationBuckets;
    const full = Number(buckets.full || 0);
    const high = Number(buckets.high || 0);
    const medium = Number(buckets.medium || 0);
    const low = Number(buckets.low || 0);
    const total = Math.max(1, full + high + medium + low);

    const p1 = Math.round((full / total) * 100);
    const p2 = Math.round(((full + high) / total) * 100);
    const p3 = Math.round(((full + high + medium) / total) * 100);

    donutWrap.innerHTML = '<div class="capacity-chart" style="background:conic-gradient('
      + 'var(--school) 0% '
      + p1
      + '%, rgba(10, 31, 68, 0.75) '
      + p1
      + '% '
      + p2
      + '%, rgba(10, 31, 68, 0.5) '
      + p2
      + '% '
      + p3
      + '%, rgba(10, 31, 68, 0.28) '
      + p3
      + '% 100%);"></div>';
  }

  if (notes) {
    notes.innerHTML = '<span><i class="utilization-dot full"></i> Full ('
      + stats.utilizationBuckets.full
      + ')</span>'
      + '<span><i class="utilization-dot high"></i> High ('
      + stats.utilizationBuckets.high
      + ')</span>'
      + '<span><i class="utilization-dot medium"></i> Medium ('
      + stats.utilizationBuckets.medium
      + ')</span>'
      + '<span><i class="utilization-dot low"></i> Low ('
      + stats.utilizationBuckets.low
      + ')</span>';
  }

  if (tbody) {
    tbody.innerHTML = courses.map((course) => {
      const status = getStatus(course);
      const rate = getUtilization(course);

      return '<tr>'
        + '<td><strong>'
        + demo.escapeHtml(course.courseCode)
        + '</strong><br><small>'
        + demo.escapeHtml(course.courseName)
        + '</small></td>'
        + '<td>'
        + demo.escapeHtml(course.instructor)
        + '</td>'
        + '<td>'
        + demo.escapeHtml(course.schedule)
        + '</td>'
        + '<td>'
        + course.enrolledCount
        + '</td>'
        + '<td>'
        + course.enrollmentLimit
        + '</td>'
        + '<td><span class="status-pill '
        + status.cls
        + '">'
        + status.text
        + '</span></td>'
        + '<td>'
        + '<div class="mini-util"><div style="width:'
        + rate
        + '%;"></div></div>'
        + rate
        + '%</td>'
        + '</tr>';
    }).join('');
  }

  if (bottomMetricValues[0]) bottomMetricValues[0].textContent = String(stats.totalCapacity);
  if (bottomMetricNotes[0]) bottomMetricNotes[0].textContent = 'Seats across all courses';

  if (bottomMetricValues[1]) {
    bottomMetricValues[1].textContent = String(courses.filter((course) => getUtilization(course) >= 100).length);
  }

  if (bottomMetricNotes[1]) bottomMetricNotes[1].textContent = 'Courses at full capacity';

  if (bottomMetricValues[2]) {
    bottomMetricValues[2].textContent = String(courses.filter((course) => getUtilization(course) < 50).length);
  }

  if (bottomMetricNotes[2]) bottomMetricNotes[2].textContent = 'Courses with low utilization';
}

  function init() {
    const user = demo.requireRole(['ADMIN']);

    if (!user) return;

    hydrateUser(user);
    bindSignOut();
    initNotifications();

    const page = window.location.pathname.split('/').pop() || 'adminHomepage.html';

    if (page === 'adminHomepage.html') renderHome();
    if (page === 'admin_course_catalog.html') renderCatalog();
    if (page === 'admin_course_management.html') renderManagement();
    if (page === 'admin_student_accounts.html') renderStudentAccounts();
    if (page === 'admin_financial_reports.html') renderFinancialReports();
    if (page === 'admin_enrollment_reports.html') renderEnrollmentReports();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
