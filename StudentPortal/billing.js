document.addEventListener('DOMContentLoaded', async () => {
  const sms = window.SMSStudent;
  const historyPanel = document.querySelector('.billing-history');
  const billingNote = document.querySelector('.billing-note');

  try {
    await sms.bootShared();
    const account = await sms.apiRequest('/api/students/billing');
    renderBilling(account);
  } catch (error) {
    console.error(error);
    renderBillingError(error);
  }

  function renderBilling(account) {
    const currentBalance = Number(account?.currentBalance || 0);
    const totalCharges = Number(account?.totalCharges || 0);
    const totalPayments = Number(account?.totalPayments || 0);
    const estimatedHours = totalCharges > 0 ? (totalCharges / 450).toFixed(totalCharges % 450 === 0 ? 0 : 2) : 0;

    sms.updateStatCard('Current Balance', sms.formatCurrency(currentBalance), currentBalance > 0 ? 'Balance due' : 'No balance due');
    sms.updateStatCard('Total Charges', sms.formatCurrency(totalCharges), `${estimatedHours} credit hours`);
    sms.updateStatCard('Total Payments', sms.formatCurrency(totalPayments), 'Payments & refunds');

    if (billingNote) {
      const dueDateText = account?.dueDate ? ` • Due date: ${account.dueDate}` : '';
      billingNote.innerHTML = `Current tuition rate: <strong>$450</strong> per credit hour${dueDateText}`;
    }

    renderTransactions(Array.isArray(account?.transactions) ? account.transactions : []);
  }

  function renderTransactions(transactions) {
    if (!historyPanel) return;

    historyPanel.innerHTML = `
      <div class="section-title">Transaction History</div>
      <div class="section-subtitle">All charges, payments, and fees for Fall 2026</div>
    `;

    if (!transactions.length) {
      const emptyWrap = document.createElement('div');
      emptyWrap.className = 'empty-wrap';
      emptyWrap.innerHTML = `
        <div class="empty-icon"> $ </div>
        <div class="empty-copy">No transactions yet.</div>
      `;
      historyPanel.appendChild(emptyWrap);
      return;
    }

    const list = document.createElement('div');
    list.style.display = 'grid';
    list.style.gap = '12px';
    list.style.marginTop = '16px';

    transactions
      .slice()
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
      .forEach((transaction) => {
        const card = document.createElement('article');
        card.className = 'course-card';
        card.innerHTML = `
          <div class="course-top">
            <div>
              <div class="course-code">${sms.escapeHtml(transaction.type || 'Transaction')}</div>
              <div class="course-name">${sms.formatCurrency(transaction.amount || 0)}</div>
            </div>
            <div class="seat-pill">${sms.escapeHtml(transaction.date || 'No date')}</div>
          </div>
          <div class="course-desc">${sms.escapeHtml(transaction.description || 'No description available.')}</div>
        `;
        list.appendChild(card);
      });

    historyPanel.appendChild(list);
  }

  function renderBillingError(error) {
    if (!historyPanel) return;
    const message = sms.extractErrorMessage(error, 'Unable to load billing details right now.');
    sms.showInlineMessage(historyPanel, 'Billing Unavailable', message, 's_billing.html', 'Try Again', '⚠');
  }
});
