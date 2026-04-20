document.addEventListener('DOMContentLoaded', async () => {
  const sms = window.SMSStudent;
  const panel = document.querySelector('.panel');
  const summaryStrip = document.querySelector('.summary-strip');

  try {
    await sms.bootShared();
    await loadCourses();
  } catch (error) {
    console.error(error);
    renderError(error);
  }

  async function loadCourses() {
    const registrations = await sms.apiRequest('/api/registration/my');
    const enrolled = registrations.filter((registration) => registration.status === 'ENROLLED');

    updateSummary(enrolled);
    renderCourses(enrolled);
  }

  function updateSummary(registrations) {
    if (!summaryStrip) return;

    const totalHours = registrations.reduce((sum, registration) => {
      return sum + Number(registration.course?.courseHours || 0);
    }, 0);

    const summaryBlocks = summaryStrip.querySelectorAll('.summary-block');

    if (summaryBlocks[0]) {
      const strong = summaryBlocks[0].querySelector('strong');
      if (strong) strong.textContent = `${registrations.length} course${registrations.length === 1 ? '' : 's'}`;
    }

    if (summaryBlocks[1]) {
      const strong = summaryBlocks[1].querySelector('strong');
      if (strong) strong.textContent = `${totalHours} / ${sms.MAX_STUDENT_HOURS}`;
    }
  }

  function renderCourses(registrations) {
    if (!panel) return;

    panel.innerHTML = '';

    if (!registrations.length) {
      sms.showInlineMessage(
        panel,
        'No Courses Enrolled',
        'You have no registered courses this semester.',
        's_course_catalog.html',
        'Browse Course Catalog',
        '📖'
      );
      return;
    }

    panel.innerHTML = `
      <div class="section-title">Enrolled Courses</div>
      <div class="section-subtitle">Manage your registered courses for the current term</div>
    `;

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
          <div class="course-actions">
            <button class="catalog-action drop" type="button" data-drop-id="${registration.registrationId}">Drop</button>
          </div>
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

    panel.querySelectorAll('[data-drop-id]').forEach((button) => {
      button.addEventListener('click', async () => {
        try {
          await sms.apiRequest(`/api/registration/drop/${button.dataset.dropId}`, {
            method: 'delete'
          });

          window.alert('Course dropped successfully.');
          await loadCourses();
        } catch (error) {
          console.error(error);
          window.alert(sms.extractErrorMessage(error, 'Unable to drop this course.'));
        }
      });
    });
  }

  function renderError(error) {
    if (!panel) return;
    const message = sms.extractErrorMessage(error, 'Unable to load your enrolled courses right now.');
    sms.showInlineMessage(panel, 'My Courses Unavailable', message, 'my_courses.html', 'Try Again');
  }
});
