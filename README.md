# Academix

A centralized academic platform for managing courses, assignments, and quizzes built for System Analysis and Design course.
It is a full-stack web application designed to streamline academic activities for colleges and universities. Managing quizzes, assignments, and student progress — whether conducted online or offline — becomes effortless through a single centralized platform.


## Features

### Account Management
- User registration with role selection: **Admin**, **Teacher**, or **Student**
- Profile and password management for all users
- Admin control over all user accounts (view, manage student and teacher lists)

### Course Management
- Admin can create courses and assign teachers
- Teachers and Admins can create and manage assignments
- Students can browse and enroll in available courses
- Role-based course views (enrolled courses vs. teaching courses)

### Assignment & Quiz System
- Teachers can create, update, and manage assignments per course
- Students can submit assignments (PDF and .docx supported)
- Offline quiz handling supported
- Submission tracking with marks and teacher feedback

### Score Tracking
- Students can view their submitted work and received grades
- Teachers can review and grade submissions with feedback
- Score history accessible per course and assignment

---

## Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Language | Go (Golang) |
| Framework | Gin Web Framework |
| Database | PostgreSQL |
| Auth | JWT Authentication |

### Frontend
| Layer | Technology |
|-------|-----------|
| Language | TypeScript |
| Library | React |
| Framework | Next.js |

---



## User Roles

### Student
- Register and log in to the platform
- Browse all available courses and enroll
- View course details and assigned work
- Submit assignments (PDF and .docx files)
- Track submission history, grades, and teacher feedback

### Teacher
- View and manage courses assigned by Admin
- Create and update assignments and quizzes for their courses
- Review student submissions and provide marks and feedback
- View the roster of enrolled students

### Admin
- Create courses and assign teachers to them
- View and manage all student and teacher accounts
- Create and manage assignments across any course
- Full platform oversight and user control

---

## Contribution
Developed the full frontend of this project.
