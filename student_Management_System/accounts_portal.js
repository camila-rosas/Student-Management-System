/* 
	Team #7 Group Project
	Names: David Vargas, Camila Rosas, Maria Barco, Zinia Noorani
	
	============================================================================
	| THIS FILE IS MEANT TO BE A DEMO AND NOT THE FINAL PRODUCT. BUGS MAY OCCUR. |
	============================================================================
*/

(function () {
  const demo = window.SMSDemo;

  function getStatus(balance) {
    return Number(balance || 0) > 0 ? 'warning' : 'success';
  }

  function formatDate(date) {
    if (!date) return 'No payment yet';

    return new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function hydrateUser(user) {
    const displayName = user.name || 'Accounts User';
    const initials = demo.getInitials(displayName);
    const firstName = displayName.split(' ')[0] || displayName;

    document.querySelectorAll('.user-name').forEach((el) => el.textContent = displayName);
    document.querySelectorAll('.user-role').forEach((el) => el.textContent = 'Accounts Office');
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
      const page = window.location.pathname.split('/').pop() || 'accounts';
      const storageKey = 'sms_accounts_notices_' + page + '_' + index;

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

  function renderDashboard() {
    const stats = demo.getStats();
    const studentsWithBalance = stats.students
      .filter((student) => Number(student.currentBalance) > 0)
      .sort((a, b) => b.currentBalance - a.currentBalance);

    const cards = document.querySelectorAll('.stat-card');
    const tbody = document.querySelector('.finance-table tbody');

    if (cards[0]) cards[0].querySelector('.card-value').textContent = demo.formatCurrency(stats.outstanding);
    if (cards[1]) cards[1].querySelector('.card-value').textContent = String(stats.studentsWithBalance);
    if (cards[2]) cards[2].querySelector('.card-value').textContent = String(stats.totalStudents);
    if (cards[3]) cards[3].querySelector('.card-value').textContent = String(stats.totalEnrollments);

    if (tbody) {
      tbody.innerHTML = studentsWithBalance.map((student) => {
        return '<tr><td>'
          + demo.escapeHtml(student.studentId)
          + '</td><td>'
          + demo.escapeHtml(student.name)
          + '</td><td>'
          + demo.escapeHtml(student.major)
          + '</td><td class="ta-right value-warning">'
          + demo.formatCurrency(student.currentBalance)
          + '</td></tr>';
      }).join('');
    }
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
          + '"><div class="account-row-main"><div class="account-row-name">'
          + demo.escapeHtml(student.name)
          + '</div><div class="account-row-id">'
          + demo.escapeHtml(student.studentId)
          + '</div></div><div class="account-row-side"><span class="balance-pill status-'
          + getStatus(student.currentBalance)
          + '">'
          + demo.formatCurrency(student.currentBalance)
          + '</span></div></button>';
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

      const transactions = billing.transactions.map((item) => {
        const isPayment = Number(item.amount) < 0;

        return '<tr><td>'
          + formatDate(item.date)
          + '</td><td>'
          + demo.escapeHtml(item.type)
          + '</td><td>'
          + demo.escapeHtml(item.description)
          + '</td><td class="ta-right '
          + (isPayment ? 'value-success' : 'value-warning')
          + '">'
          + (isPayment ? '-' : '')
          + demo.formatCurrency(Math.abs(Number(item.amount)))
          + '</td></tr>';
      }).join('');

      detailPanel.innerHTML = '<div class="account-detail-head"><div><div class="detail-name">'
        + demo.escapeHtml(student.name)
        + '</div><div class="detail-subline">'
        + demo.escapeHtml(student.studentId)
        + ' • '
        + demo.escapeHtml(student.username)
        + '</div></div><span class="detail-status detail-status-'
        + getStatus(student.currentBalance)
        + '">'
        + (student.currentBalance > 0 ? 'Balance Due' : 'Paid in Full')
        + '</span></div><div class="detail-grid"><div class="detail-card"><small>Major</small><strong>'
        + demo.escapeHtml(student.major)
        + '</strong></div><div class="detail-card"><small>Total Billed</small><strong>'
        + demo.formatCurrency(student.totalCharges)
        + '</strong></div><div class="detail-card"><small>Payments</small><strong>'
        + demo.formatCurrency(student.totalPayments)
        + '</strong></div><div class="detail-card"><small>Current Balance</small><strong class="value-'
        + getStatus(student.currentBalance)
        + '">'
        + demo.formatCurrency(student.currentBalance)
        + '</strong></div><div class="detail-card"><small>Enrollments</small><strong>'
        + student.enrollments
        + '</strong></div><div class="detail-card"><small>Last Payment</small><strong>'
        + demo.escapeHtml(formatDate(student.lastPaymentDate))
        + '</strong></div></div><div class="detail-section"><div class="detail-section-label">Finance Notes</div><p class="detail-note-copy">'
        + (student.currentBalance > 0 ? 'This student still has a remaining balance and should be reviewed before the next billing deadline.' : 'This account is fully resolved for the current term.')
        + '</p></div><div class="transaction-table-wrap"><table class="finance-table"><thead><tr><th>Date</th><th>Type</th><th>Description</th><th class="ta-right">Amount</th></tr></thead><tbody>'
        + transactions
        + '</tbody></table></div>';
    }

    if (searchInput) searchInput.addEventListener('input', drawList);

    if (list) {
      list.addEventListener('click', (event) => {
        const row = event.target.closest('.account-row');

        if (!row) return;

        showDetails(row.dataset.studentId);
      });
    }

    drawList();
  }

  function renderFinancialReports() {
    const stats = demo.getStats();
    const students = demo.getStudents().slice().sort((a, b) => b.currentBalance - a.currentBalance);
    const cards = document.querySelectorAll('.stat-card');
    const tables = document.querySelectorAll('.finance-table tbody');
    const panels = document.querySelectorAll('.reports-grid .panel');

    if (cards[0]) cards[0].querySelector('.card-value').textContent = demo.formatCurrency(stats.totalRevenue);
    if (cards[1]) cards[1].querySelector('.card-value').textContent = demo.formatCurrency(stats.totalCollected);
    if (cards[2]) cards[2].querySelector('.card-value').textContent = demo.formatCurrency(stats.outstanding);
    if (cards[3]) cards[3].querySelector('.card-value').textContent = stats.collectionRate + '%';

    if (tables[0]) {
      const tuition = stats.totalRevenue - (stats.totalStudents * demo.CONFIG.serviceFee);
      const fees = stats.totalStudents * demo.CONFIG.serviceFee;

      tables[0].innerHTML = '<tr><td>Tuition Charges</td><td class="ta-right">'
        + demo.formatCurrency(tuition)
        + '</td><td class="ta-right">'
        + Math.round((tuition / stats.totalRevenue) * 100)
        + '%</td></tr><tr><td>Fees</td><td class="ta-right">'
        + demo.formatCurrency(fees)
        + '</td><td class="ta-right">'
        + Math.round((fees / stats.totalRevenue) * 100)
        + '%</td></tr><tr><td><strong>Total Revenue</strong></td><td class="ta-right"><strong>'
        + demo.formatCurrency(stats.totalRevenue)
        + '</strong></td><td class="ta-right"><strong>100%</strong></td></tr>';
    }

    if (tables[1]) {
      tables[1].innerHTML = '<tr><td>Payments Received</td><td class="ta-right value-success">'
        + demo.formatCurrency(stats.totalCollected)
        + '</td><td class="ta-right value-success">'
        + stats.collectionRate
        + '%</td></tr><tr><td>Outstanding Balance</td><td class="ta-right value-warning">'
        + demo.formatCurrency(stats.outstanding)
        + '</td><td class="ta-right value-warning">'
        + (100 - stats.collectionRate)
        + '%</td></tr><tr><td><strong>Total Billed</strong></td><td class="ta-right"><strong>'
        + demo.formatCurrency(stats.totalRevenue)
        + '</strong></td><td class="ta-right"><strong>100%</strong></td></tr>';
    }

    if (tables[2]) {
      tables[2].innerHTML = students.map((student) => {
        return '<tr><td>'
          + demo.escapeHtml(student.name)
          + '</td><td>'
          + demo.escapeHtml(student.major)
          + '</td><td class="ta-right">'
          + demo.formatCurrency(student.totalCharges)
          + '</td><td class="ta-right">'
          + demo.formatCurrency(student.totalPayments)
          + '</td><td class="ta-right '
          + (student.currentBalance > 0 ? 'value-warning' : 'value-success')
          + '">'
          + demo.formatCurrency(student.currentBalance)
          + '</td></tr>';
      }).join('');
    }

    if (panels[0]) {
      const feeShare = Math.round(((stats.totalStudents * demo.CONFIG.serviceFee) / stats.totalRevenue) * 100);
      const tuitionShare = 100 - feeShare;

      panels[0].insertAdjacentHTML(
        'beforeend',
        '<div style="margin-top:14px;display:grid;gap:10px;"><div style="font-size:12px;color:#7a6a73;">Revenue mix</div><div style="height:14px;background:#ece7e2;border-radius:999px;overflow:hidden;"><div style="height:100%;width:' + tuitionShare + '%;background:#0a1f44;"></div></div><div style="display:flex;justify-content:space-between;font-size:11px;color:#7a6a73;"><span>Tuition ' + tuitionShare + '%</span><span>Fees ' + feeShare + '%</span></div></div>'
      );
    }

    if (panels[1]) {
      panels[1].insertAdjacentHTML(
        'beforeend',
        '<div style="margin-top:14px;display:grid;gap:10px;"><div style="font-size:12px;color:#7a6a73;">Collection progress</div><div style="height:14px;background:#ece7e2;border-radius:999px;overflow:hidden;"><div style="height:100%;width:' + stats.collectionRate + '%;background:#1ea853;"></div></div><div style="display:flex;justify-content:space-between;font-size:11px;color:#7a6a73;"><span>Collected ' + stats.collectionRate + '%</span><span>Outstanding ' + (100 - stats.collectionRate) + '%</span></div></div>'
      );
    }
  }

  function init() {
    const user = demo.requireRole(['ACCOUNTS']);

    if (!user) return;

    hydrateUser(user);
    bindSignOut();
    initNotifications();

    const page = window.location.pathname.split('/').pop() || 'accountHomepage.html';

    if (page === 'accountHomepage.html') renderDashboard();
    if (page === 'finance_accounts.html') renderStudentAccounts();
    if (page === 'financial_reports.html') renderFinancialReports();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
