document.addEventListener('DOMContentLoaded', async () => {
  const sms = window.SMSStudent;
  const container = document.querySelector('.catalog-grid');
  const searchInput = document.querySelector('.search-row .search-input');
  const filterSelect = document.querySelector('.search-row select');
  const alertBar = document.querySelector('.alert-bar');

  const state = {
    courses: [],
    registrations: []
  };

  try {
    await sms.bootShared();
    await loadCatalog();
  } catch (error) {
    console.error(error);
    renderCatalogError(error);
  }

  if (searchInput) {
    searchInput.addEventListener('input', renderCatalog);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', renderCatalog);
  }

  if (container) {
    container.addEventListener('click', async (event) => {
      const enrollButton = event.target.closest('[data-enroll-id]');
      const dropButton = event.target.closest('[data-drop-id]');

      if (enrollButton) {
        await enrollInCourse(Number(enrollButton.dataset.enrollId));
      }

      if (dropButton) {
        await dropCourse(Number(dropButton.dataset.dropId));
      }
    });
  }

  async function loadCatalog() {
    const [courses, registrations] = await Promise.all([
      sms.apiRequest('/api/students/courses'),
      sms.apiRequest('/api/registration/my')
    ]);

    state.courses = Array.isArray(courses) ? courses : [];
    state.registrations = Array.isArray(registrations) ? registrations : [];

    if (alertBar) {
      alertBar.textContent = 'ⓘ Live catalog connected to Spring Boot. Enroll and drop actions now update your student records.';
    }

    renderCatalog();
  }

  function renderCatalog() {
    if (!container) return;

    const searchValue = (searchInput?.value || '').trim().toLowerCase();
    const filterValue = (filterSelect?.value || 'All Courses').toLowerCase();
    const enrolledMap = new Map();

    state.registrations
      .filter((registration) => registration.status === 'ENROLLED')
      .forEach((registration) => {
        enrolledMap.set(registration.course.courseId, registration);
      });

    const visibleCourses = state.courses.filter((course) => {
      const haystack = [
        course.courseCode,
        course.courseName,
        course.instructor,
        course.roomNum,
        course.schedule,
        course.description
      ].join(' ').toLowerCase();

      const matchesSearch = !searchValue || haystack.includes(searchValue);
      const matchesFilter = matchesCourseFilter(course, filterValue);
      return matchesSearch && matchesFilter;
    });

    if (!visibleCourses.length) {
      sms.showInlineMessage(container, 'No Courses Found', 'Try adjusting the search or filter.', '', '', '📖');
      return;
    }

    container.innerHTML = visibleCourses.map((course) => buildCourseCard(course, enrolledMap.get(course.courseId))).join('');
  }

  function matchesCourseFilter(course, filterValue) {
    const seatsLeft = Math.max(0, Number(course.enrollmentLimit) - Number(course.enrolledCount));

    if (filterValue === 'open seats') return seatsLeft > 0;
    if (filterValue === '3 hours') return Number(course.courseHours) === 3;
    if (filterValue === '4 hours') return Number(course.courseHours) === 4;
    return true;
  }

  function buildCourseCard(course, registration) {
    const seatsLeft = Math.max(0, Number(course.enrollmentLimit) - Number(course.enrolledCount));
    const isFull = seatsLeft <= 0;

    let buttonHtml = `<button class="catalog-action" type="button" data-enroll-id="${course.courseId}">Enroll</button>`;

    if (registration) {
      buttonHtml = `<button class="catalog-action drop" type="button" data-drop-id="${registration.registrationId}">Drop Course</button>`;
    } else if (isFull) {
      buttonHtml = '<button class="catalog-action full" type="button" disabled>Course Full</button>';
    }

    return `
      <article class="course-card">
        <div class="course-top">
          <div>
            <div class="course-code">${sms.escapeHtml(course.courseCode)} <span class="hours-pill">${course.courseHours} hrs</span></div>
            <div class="course-name">${sms.escapeHtml(course.courseName)}</div>
          </div>
          <div class="seat-pill${isFull ? ' full' : ''}">${isFull ? 'Full' : `${seatsLeft} seats`}</div>
        </div>

        <div class="course-desc">${sms.escapeHtml(course.description || 'No course description available.')}</div>

        <div class="meta-stack">
          <div class="meta-row"><span>👤 ${sms.escapeHtml(course.instructor || 'TBA')}</span><span>📍 ${sms.escapeHtml(course.roomNum || 'TBA')}</span></div>
          <div class="meta-row"><span>🕒 ${sms.escapeHtml(course.schedule || 'TBA')}</span><span></span></div>
          <div class="meta-row"><span class="enrolled-text">${course.enrolledCount}/${course.enrollmentLimit} enrolled</span><span></span></div>
        </div>

        <div class="course-actions">${buttonHtml}</div>
      </article>
    `;
  }

  async function enrollInCourse(courseId) {
    try {
      await sms.apiRequest('/api/students/enroll', {
        method: 'post',
        params: { courseId }
      });

      await loadCatalog();
      window.alert('Enrolled successfully.');
    } catch (error) {
      console.error(error);
      window.alert(sms.extractErrorMessage(error, 'Unable to enroll in this course.'));
    }
  }

  async function dropCourse(registrationId) {
    try {
      await sms.apiRequest(`/api/registration/drop/${registrationId}`, {
        method: 'delete'
      });

      await loadCatalog();
      window.alert('Course dropped successfully.');
    } catch (error) {
      console.error(error);
      window.alert(sms.extractErrorMessage(error, 'Unable to drop this course.'));
    }
  }

  function renderCatalogError(error) {
    if (!container) return;
    const message = sms.extractErrorMessage(error, 'Unable to load the course catalog right now.');
    sms.showInlineMessage(container, 'Catalog Unavailable', message, 's_course_catalog.html', 'Try Again', '⚠');
  }
});
