document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // Load all courses
  axios.get("http://localhost:8080/api/courses", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(res => {
    const courses = res.data;
    const container = document.getElementById("course-list");

    container.innerHTML = ""; // clear

    courses.forEach(course => {
      const div = document.createElement("div");
      div.classList.add("course-card");

      div.innerHTML = `
        <h3>${course.courseName}</h3>
        <p>Code: ${course.courseCode}</p>
        <p>Instructor: ${course.instructor}</p>
        <p>Credits: ${course.courseHours}</p>
        <p>Enrolled: ${course.enrolledCount}/${course.enrollmentLimit}</p>
        <button onclick="enroll(${course.courseId})">Enroll</button>
      `;

      container.appendChild(div);
    });
  })
  .catch(err => console.error(err));
});


// ENROLL FUNCTION
function enroll(courseId){
  const token = localStorage.getItem("token");

  axios.post("http://localhost:8080/api/students/enroll", null, {
    params: { courseId: courseId },
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(() => {
    alert("Enrolled successfully!");
    location.reload(); // refresh page
  })
  .catch(err => {
    alert(err.response?.data || "Error enrolling");
  });
}
