document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // =========================
  // LOAD ACCOUNT SUMMARY
  // =========================
  axios.get("http://localhost:8080/accounts/my", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(res => {
    const acc = res.data;

    document.getElementById("balance").innerText = "$" + acc.currentBalance;
    document.getElementById("charges").innerText = "$" + acc.totalCharges;
    document.getElementById("payments").innerText = "$" + acc.totalPayments;
  })
  .catch(err => console.error(err));


  // =========================
  // LOAD TRANSACTIONS
  // =========================
  axios.get("http://localhost:8080/accounts/transactions", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(res => {
    const transactions = res.data;
    const container = document.getElementById("transaction-list");

    container.innerHTML = "";

    if (transactions.length === 0) {
      container.innerHTML = "<p>No transactions found.</p>";
      return;
    }

    transactions.forEach(t => {
      const div = document.createElement("div");
      div.classList.add("transaction-card");

      div.innerHTML = `
        <p><strong>${t.type}</strong> - $${t.amount}</p>
        <p>${t.description}</p>
        <p>Date: ${t.date}</p>
        <hr>
      `;

      container.appendChild(div);
    });
  })
  .catch(err => console.error(err));
});
