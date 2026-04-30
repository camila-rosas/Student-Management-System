/* 
	Team #7 Group Project
	Names: David Vargas, Camila Rosas, Maria Barco, Zinia Noorani
	
	============================================================================
	| THIS FILE IS MEANT TO BE A DEMO AND NOT THE FINAL PRODUCT. BUGS MAY OCCUR. |
	============================================================================
*/

(function () {
  const API_BASE_KEY = 'sms_api_base_url';
  const TOKEN_KEY = 'sms_java_token';
  const ROLE_KEY = 'sms_java_role';
  const USER_KEY = 'sms_java_user';

  const CONFIG = {
    term: 'Spring 2026',
    tuitionPerCredit: 450,
    serviceFee: 50,
    maxStudentHours: 18,
    dueDate: '2026-02-14'
  };

  function apiBase() {
    return (localStorage.getItem(API_BASE_KEY) || 'http://localhost:8080').replace(/\/$/, '');
  }

  function buildUrl(path, params) {
    const url = new URL(apiBase() + path);

    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          url.searchParams.set(key, params[key]);
        }
      });
    }

    return url.toString();
  }

  function request(method, path, options) {
    options = options || {};

    const xhr = new XMLHttpRequest();

    xhr.open(method.toUpperCase(), buildUrl(path, options.params), false);
    xhr.setRequestHeader('Accept', 'application/json');

    const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');

    if (token) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    }

    let body = null;

    if (options.body !== undefined && options.body !== null) {
      xhr.setRequestHeader('Content-Type', 'application/json');
      body = JSON.stringify(options.body);
    }

    xhr.send(body);

    let data = null;

    if (xhr.responseText) {
      try {
        data = JSON.parse(xhr.responseText);
      } catch (error) {
        data = xhr.responseText;
      }
    }

    if (xhr.status < 200 || xhr.status >= 300) {
      const message = data && typeof data === 'object' && data.message
        ? data.message
        : (typeof data === 'string' ? data : 'Backend request failed.');

      throw new Error(message + ' (' + xhr.status + ')');
    }

    return data;
  }

  function asyncRequest(method, path, options) {
    return Promise.resolve().then(() => request(method, path, options));
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
    return Number(value || 0).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  }

  function getInitials(name) {
    if (!name) return 'SM';

    const parts = String(name).trim().split(/\s+/).filter(Boolean);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function normalizeCourse(course) {
    if (!course) return course;

    const out = Object.assign({}, course);

    out.courseId = String(out.courseId ?? out.id ?? '');
    out.id = out.courseId;
    out.courseCode = out.courseCode || out.code || '';
    out.code = out.courseCode;
    out.courseName = out.courseName || out.name || '';
    out.name = out.courseName;
    out.courseHours = Number(out.courseHours ?? out.hours ?? 0);
    out.hours = out.courseHours;
    out.enrollmentLimit = Number(out.enrollmentLimit || 0);
    out.enrolledCount = Number(out.enrolledCount || 0);
    out.seatsLeft = Math.max(0, out.enrollmentLimit - out.enrolledCount);

    if (out.registrationId != null) {
      out.registrationId = String(out.registrationId);
    }

    return out;
  }

  function normalizeRegistration(registration) {
    if (!registration) return registration;

    const out = Object.assign({}, registration);

    out.registrationId = String(out.registrationId ?? out.id ?? '');
    out.id = out.registrationId;
    out.studentId = String(out.studentId || '');
    out.course = normalizeCourse(out.course);

    return out;
  }

  function normalizeStudent(student) {
    if (!student) return student;

    const out = Object.assign({}, student);

    out.studentId = String(out.studentId || out.id || '');
    out.id = out.studentId;
    out.username = out.username || out.email || '';
    out.email = out.email || out.username;
    out.currentBalance = Number(out.currentBalance ?? out.balance ?? 0);
    out.balance = out.currentBalance;
    out.totalCharges = Number(out.totalCharges || 0);
    out.totalPayments = Number(out.totalPayments || 0);
    out.creditHours = Number(out.creditHours || 0);
    out.enrollments = Number(out.enrollments || 0);
    out.avatar = out.avatar || getInitials(out.name);
    out.registrations = (out.registrations || []).map(normalizeRegistration);

    return out;
  }

  function normalizeAccount(account) {
    if (!account) return account;

    const out = Object.assign({}, account);

    out.accountId = String(out.accountId || '');
    out.student = normalizeStudent(out.student);
    out.currentBalance = Number(out.currentBalance || 0);
    out.totalCharges = Number(out.totalCharges || 0);
    out.totalPayments = Number(out.totalPayments || 0);
    out.transactions = (out.transactions || []).map((item) => Object.assign({}, item, {
      transactionId: String(item.transactionId || ''),
      amount: Number(item.amount || 0)
    }));

    return out;
  }

  function normalizeStats(stats) {
    stats = stats || {};
    stats.students = (stats.students || []).map(normalizeStudent);
    stats.courses = (stats.courses || []).map(normalizeCourse);

    return stats;
  }

  function login(username, password) {
    const response = request('POST', '/api/auth/login', {
      body: {
        username,
        password
      }
    });

    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(ROLE_KEY, response.role);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    localStorage.setItem('token', response.token);
    localStorage.setItem('role', response.role);
    localStorage.setItem('loggedInUser', JSON.stringify(response.user));

    return response.user;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('loggedInUser');
  }

  function resetDemo() {
    logout();
  }

  function getCurrentUser() {
    try {
      const stored = localStorage.getItem(USER_KEY) || localStorage.getItem('loggedInUser');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }

  function requireRole(roles) {
    const user = getCurrentUser();

    if (!user || roles.indexOf(String(user.role || '').toUpperCase()) === -1) {
      logout();
      window.location.href = 'index.html';
      return null;
    }

    return user;
  }

  function currentUserFromBackend() {
    const user = request('GET', '/api/users/me');

    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem('loggedInUser', JSON.stringify(user));

    return user;
  }

  function getCourses() {
    return request('GET', '/api/courses').map(normalizeCourse);
  }

  function getStudents() {
    return request('GET', '/api/students').map(normalizeStudent);
  }

  function getStats() {
    return normalizeStats(request('GET', '/api/reports/summary'));
  }

  function getStudentByStudentId(studentId) {
    return getStudents().find((s) => s.studentId === String(studentId)) || null;
  }

  function getRegistrationsByStudent(studentId) {
    return request('GET', '/api/students/' + encodeURIComponent(studentId) + '/registrations')
      .map(normalizeRegistration);
  }

  function getBillingForStudent(studentId) {
    return normalizeAccount(request('GET', '/api/accounts/' + encodeURIComponent(studentId)));
  }

  function getStudentDashboard(studentId) {
    return request('GET', '/api/students/' + encodeURIComponent(studentId) + '/dashboard');
  }

  function getCatalogForStudent(studentId) {
    const registrations = getRegistrationsByStudent(studentId)
      .filter((r) => r.status === 'ENROLLED');

    const map = new Map(registrations.map((r) => [r.course.courseId, r.registrationId]));

    return getCourses().map((course) => Object.assign({}, course, {
      isEnrolled: map.has(course.courseId),
      registrationId: map.get(course.courseId) || null
    }));
  }

  function getStudentCourseHours(studentId) {
    return getRegistrationsByStudent(studentId)
      .filter((r) => r.status === 'ENROLLED')
      .reduce((sum, r) => sum + Number(r.course.courseHours || 0), 0);
  }

  function getStudentCourseOptions(studentId) {
    const enrolled = new Set(
      getRegistrationsByStudent(studentId)
        .filter((r) => r.status === 'ENROLLED')
        .map((r) => r.course.courseId)
    );

    return getCourses().filter((course) => !enrolled.has(course.courseId) && course.seatsLeft > 0);
  }

  function coursePayload(payload) {
    return {
      courseCode: payload.courseCode || payload.code,
      courseName: payload.courseName || payload.name,
      courseHours: Number(payload.courseHours || payload.hours),
      instructor: payload.instructor,
      roomNum: payload.roomNum || payload.location,
      schedule: payload.schedule,
      enrollmentLimit: Number(payload.enrollmentLimit || payload.capacity),
      description: payload.description
    };
  }

  function addCourse(payload) {
    return normalizeCourse(request('POST', '/api/courses', {
      body: coursePayload(payload)
    }));
  }

  function updateCourse(courseId, payload) {
    return normalizeCourse(request('PUT', '/api/courses/' + encodeURIComponent(courseId), {
      body: coursePayload(payload)
    }));
  }

  function deleteCourse(courseId) {
    return request('DELETE', '/api/courses/' + encodeURIComponent(courseId));
  }

  function enrollStudentInCourse(studentId, courseId) {
    return normalizeRegistration(request('POST', '/api/students/' + encodeURIComponent(studentId) + '/enroll', {
      params: {
        courseId
      }
    }));
  }

  function dropRegistration(registrationId) {
    return normalizeRegistration(request('DELETE', '/api/registration/drop/' + encodeURIComponent(registrationId)));
  }

  window.SMSDemo = {
    CONFIG,
    apiBase,
    setApiBase: function (base) {
      localStorage.setItem(API_BASE_KEY, base);
    },
    request,
    asyncRequest,
    escapeHtml,
    formatCurrency,
    getInitials,
    login,
    logout,
    resetDemo,
    getCurrentUser,
    currentUserFromBackend,
    requireRole,
    onChange: function () {},
    offChange: function () {},
    getState: function () {
      return getStats();
    },
    getCourses,
    getStudents,
    getStudentByStudentId,
    getStudentDashboard,
    getRegistrationsByStudent,
    getBillingForStudent,
    getCatalogForStudent,
    getStats,
    getStudentCourseHours,
    getStudentCourseOptions,
    addCourse,
    updateCourse,
    deleteCourse,
    enrollStudentInCourse,
    dropRegistration
  };
})();