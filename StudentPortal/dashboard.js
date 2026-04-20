const token = localStorage.getItem("token");

axios.get("http://localhost:8080/api/students/dashboard", {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
.then(res => {
  const data = res.data;

  // Update UI
  document.querySelectorAll(".card-value")[0].innerText = data.courses;
  document.querySelectorAll(".card-value")[1].innerText = data.credits;
  document.querySelectorAll(".card-value")[2].innerText = "$" + data.balance;
})
.catch(err => console.error(err));
