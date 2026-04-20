document.addEventListener('DOMContentLoaded', async () => {
  const sms = window.SMSStudent;

  try {
    await sms.bootShared();

    const [dashboard, courses, registrations] = await Promise.all([
      sms.apiRequest('/api/students/dashboard'),
      sms.apiRequest('/api/students/courses'),
      sms.apiRequest('/api/registration/my')
    ]);

    const enrolledRegistrations = registrations.filter((registration) => registration.status === 'ENROLLED');
    const availableCourses = courses.filter((course) => Number(course.enrolledCount) < Number(course.enrollmentLimit)).length;

    sms.updateStatCard('Enrolled Courses', String(dashboard.courses || 0), `${dashboard.credits || 0} credit hours`);
    sms.updateStatCard('Credit Hours', `${dashboard.credits || 0}/${sms.MAX_STUDENT_HOURS}`, 'Maximum allowed');
    sms.updateStatCard(
      'Current Balance',
      sms.formatCurrency(dashboard.balance || 0),
      Number(dashboard.balance || 0) > 0 ? 'Current tuition charges' : 'Paid in full'
    );
    sms.updateStatCard('Available Courses', String(availableCourses), 'With open seats');

    renderEnrolledCourses(enrolledRegistrations, sms);
  } catch (error) {
    console.error(error);
    renderDashboardError(error, sms);
  }
});

function renderEnrolledCourses(registrations, sms) {
  const panel = document.querySelector('.panel');
  const panelHead = panel?.querySelector('.panel-head');

  if (!panel || !panelHead) return;

  Array.from(panel.children).forEach((child) => {
    if (child !== panelHead) {
      child.remove();
    }
  });

  if (!registrations.length) {
    sms.showInlineMessage(
      panel,
      'No Courses Enrolled',
      'You have no registered courses yet.',
      's_course_catalog.html',
      'Browse Course Catalog',
      '📖'
    );
    panel.prepend(panelHead);
    return;
  }

  const list = document.createElement('div');
  list.style.display = 'grid';
  list.style.gap = '12px';
  list.style.marginTop = '16px';

  registrations.forEach((registration) => {
    const course = registration.course;
    const card = document.createElement('article');
    card.className = 'course-card';

    card.innerHTML = `
      <div class="course-top">
        <div>
          <div class="course-code">${sms.escapeHtml(course.courseCode)} <span class="hours-pill">${course.courseHours} hrs</span></div>
          <div class="course-name">${sms.escapeHtml(course.courseName)}</div>
        </div>
        <div class="seat-pill">Enrolled</div>
      </div>
      <div class="course-desc">${sms.escapeHtml(course.description || 'Registered course for the current term.')}</div>
      <div class="meta-stack">
        <div class="meta-row"><span>👤 ${sms.escapeHtml(course.instructor || 'TBA')}</span><span>📍 ${sms.escapeHtml(course.roomNum || 'TBA')}</span></div>
        <div class="meta-row"><span>🕒 ${sms.escapeHtml(course.schedule || 'TBA')}</span><span></span></div>
      </div>
    `;

    list.appendChild(card);
  });

  panel.appendChild(list);
}

function renderDashboardError(error, sms) {
  const panel = document.querySelector('.panel');
  if (!panel) return;

  const message = sms.extractErrorMessage(error, 'Unable to load your dashboard right now.');
  sms.showInlineMessage(panel, 'Dashboard Unavailable', message, 'studentHomepage.html', 'Try Again', '⚠');
}
