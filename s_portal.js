/* David Vargas

Note: MOSTLY INCOMPLETE

    JavaScript code */

// Build notifications
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
            '<span>' + note + '</span>' +
            '<button class="notice-dismiss" type="button" data-index="' + index + '">Dismiss</button>' +
          '</div>';
        list.appendChild(item);
      });

      updateBadge();
    }

    button.addEventListener('click', function (event) {
      event.stopPropagation();

      document.querySelectorAll('.notice-panel.open').forEach(function (openPanel) {
        if (openPanel !== panel) {
          openPanel.classList.remove('open');
        }
      });

      panel.classList.toggle('open');
    });

    panel.addEventListener('click', function (event) {
      const dismiss = event.target.closest('.notice-dismiss');
      if (!dismiss) return;

      const index = Number(dismiss.dataset.index);
      notices.splice(index, 1);
      renderNotices();
    });

    clearButton.addEventListener('click', function () {
      notices = [];
      renderNotices();
    });

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

// Toggle enrollment
function createCatalogDemo() {
  const cards = document.querySelectorAll('[data-course-card]');
  if (!cards.length) return;

  cards.forEach(function (card) {
    const button = card.querySelector('.catalog-action');
    const seatPill = card.querySelector('.seat-pill');
    const enrolledText = card.querySelector('.enrolled-text');
    const courseCode = card.dataset.code;
    let enrolled = Number(card.dataset.enrolled);
    const capacity = Number(card.dataset.capacity);

    function drawCard() {
      const seatsLeft = capacity - enrolled;

      if (seatPill) {
        seatPill.textContent = seatsLeft > 0 ? seatsLeft + ' seats' : 'Full';
        seatPill.classList.toggle('full', seatsLeft <= 0);
      }

      if (enrolledText) {
        enrolledText.textContent = enrolled + '/' + capacity + ' enrolled';
      }

      if (!button) return;

      if (card.dataset.selected === 'true') {
        button.textContent = 'Drop Course';
        button.classList.add('drop');
        button.classList.remove('full');
        button.disabled = false;
      } else if (seatsLeft <= 0) {
        button.textContent = 'Course Full';
        button.classList.add('full');
        button.classList.remove('drop');
        button.disabled = true;
      } else {
        button.textContent = 'Enroll';
        button.classList.remove('drop', 'full');
        button.disabled = false;
      }
    }

    button.addEventListener('click', function () {
      if (card.dataset.selected === 'true') {
        enrolled -= 1;
        card.dataset.selected = 'false';
      } else if (enrolled < capacity) {
        enrolled += 1;
        card.dataset.selected = 'true';
      }

      drawCard();
    });

    drawCard();
  });
}

document.addEventListener('DOMContentLoaded', function () {
  createNoticeSystem();
  createCatalogDemo();
});
