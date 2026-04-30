Student Management System Frontend
=================================

This folder is the HTML/CSS frontend that you can run from XAMPP Apache and MySQL

The Java backend manages:
- users and role login
- course creation, update, and delete
- enrollments and drops
- billing calculations
- payments and fees
- reports and dashboards
- student/course/account records stored in MySQL


How to run with XAMPP Apache
---------------------------
1. Copy this folder into your XAMPP htdocs folder.
   Example: C:\xampp\htdocs\student_Management_System

2. Start Apache and MySQL in XAMPP.

3. Start the Java backend from the sms_backend folder using SpringBoot API.
   The backend MUST be running at http://localhost:8080.

4. Open:
   http://localhost/student_Management_System/index.html


Demo accounts
-------------
Password for all accounts: demo123

Student:    alex.johnson@mavs.uta.edu
Registrar:  sarah.miller@uta.edu
Accounts:   david.accounts@uta.edu
Admin:      maria.garcia@uta.edu