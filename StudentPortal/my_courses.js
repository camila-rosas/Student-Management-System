document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  axios.get("http://localhost:8080/api/registration/my", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(res => {
    const registrations = res.data;
    const container = document.getElementById("my-courses-list");

    container.innerHTML = "";

    if (registrations.length === 0) {
      container.innerHTML = "<p>No enrolled courses.</p>";
      return;
    }

    registrations.forEach(reg => {
      const course = reg.course;

      // Only show enrolled courses
      if (reg.status !== "ENROLLED") return;

      const div = document.createElement("div");
      div.classList.add("course-card");

      div.innerHTML = `
        <h3>${course.courseName}</h3>
        <p>Code: ${course.courseCode}</p>
        <p>Instructor: ${course.instructor}</p>
        <p>Credits: ${course.courseHours}</p>
        <button onclick="dropCourse(${reg.registrationId})">Drop</button>
      `;

      container.appendChild(div);
    });
  })
  .catch(err => console.error(err));
});


// DROP FUNCTION
function dropCourse(registrationId){
  const token = localStorage.getItem("token");

  axios.delete(`http://localhost:8080/api/registration/drop/${registrationId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(() => {
    alert("Course dropped!");
    location.reload();
  })
  .catch(err => {
    alert(err.response?.data || "Error dropping course");
  });
}
