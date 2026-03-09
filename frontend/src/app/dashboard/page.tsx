"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";

// Define TypeScript interfaces for a course and the decoded token
interface Course {
  Code: string;
  Title: string;
  Description: string;
}

interface DecodedToken {
  username: string;
  role: string;
  // Additional fields if needed
}

export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(true);

  // Check token and decode user info
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (error) {
        console.error("Token decode failed:", error);
      }
    } else {
      router.push("/"); // Redirect to login if no token found
    }
  }, [router]);

  // Fetch courses.
  // For admin, fetch ALL courses; for others, fetch only their courses.
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // Assuming that for admin, the backend returns all courses at this endpoint.
      const url =
        userRole === "admin"
          ? "http://localhost:8080/academix/course"
          : "http://localhost:8080/academix/own-course";
      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
        },
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data && data.courses) {
            setCourses(data.courses);
          }
          setLoadingCourses(false);
        })
        .catch((error) => {
          console.error("Error fetching courses:", error);
          setLoadingCourses(false);
        });
    }
  }, [isAuthenticated, userRole]);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8080/academix/logout", {
        method: "POST",
        credentials: "include", // Allows backend to clear the cookie
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      console.log("Logout response:", result);
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      localStorage.removeItem("authToken");
      router.push("/");
    }
  };

  // Header styling for admin global options
  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  };

  const adminOptionsStyle: React.CSSProperties = {
    display: "flex",
    gap: "10px",
  };

  const btnStyle: React.CSSProperties = {
    padding: "6px 12px",
    backgroundColor: "#B8E3E9",
    color: "#0B2E33",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", backgroundColor: "#F7F4F3" }}>
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          backgroundColor: "#0B2E33",
          padding: "15px",
          color: "white",
        }}
      >
        {/* Left side */}
        <h1 style={{ fontSize: "22px", fontWeight: "bold", marginLeft: "20px" }}>Academix</h1>
        {/* Right side */}
        <div style={{ display: "flex", gap: "15px", marginRight: "20px" }}>
          <button
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#285E61")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4F7C82")}
            onClick={() => router.push("/courseList")}
            style={{
              padding: "8px 15px",
              backgroundColor: "#4F7C82",
              color: "white",
              border: "none",
              borderRadius: "18px",
              cursor: "pointer",
            }}
          >
            View All Courses
          </button>
          <button
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#285E61")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4F7C82")}
            onClick={() => router.push("/profile")}
            style={{
              padding: "8px 15px",
              backgroundColor: "#4F7C82",
              color: "white",
              border: "none",
              borderRadius: "18px",
              cursor: "pointer",
            }}
          >
            Profile
          </button>
          <button
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#285E61")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4F7C82")}
            onClick={handleLogout}
            style={{
              padding: "8px 15px",
              backgroundColor: "#4F7C82",
              color: "white",
              border: "none",
              borderRadius: "18px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div style={{ padding: "20px", color: "#333" }}>
        <div style={headerStyle}>
          <h3>My Courses</h3>
          {userRole === "admin" && (
            <div style={adminOptionsStyle}>
              <button style={btnStyle} onClick={() => router.push("/admin/create-course")}>
                Create Course
              </button>
              <button style={btnStyle} onClick={() => router.push("/admin/student-list")}>
                Student List
              </button>
              <button style={btnStyle} onClick={() => router.push("/admin/teacher-list")}>
                Teacher List
              </button>
            </div>
          )}
        </div>
        {loadingCourses ? (
          <p style={{ textAlign: "center" }}>Loading your courses...</p>
        ) : courses.length === 0 ? (
          <p style={{ textAlign: "center" }}>No courses available.</p>
        ) : (
          courses.map((course) => (
            <div
              key={course.Code}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#FFFFFF",
                padding: "10px 20px",
                margin: "10px auto",
                borderRadius: "10px",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                maxWidth: "600px",
              }}
            >
              <div style={{ fontSize: "16px", color: "#0B2E33" }}>
                {course.Code} : {course.Title}
              </div>
              {userRole === "admin" ? (
                <button
                  onClick={() => router.push(`/admin/manage-course-users/${course.Code}`)}
                  style={btnStyle}
                >
                  Manage Users
                </button>
              ) : (
                <button
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#93B1B5")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#B8E3E9")
                  }
                  onClick={() => router.push(`/course/${course.Code}`)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#B8E3E9",
                    color: "#0B2E33",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  View Details
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}