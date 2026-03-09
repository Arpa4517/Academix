"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";

// Define TypeScript interfaces for the course data and decoded token
interface Course {
  Code: string;
  Title: string;
  Description: string;
}

interface DecodedToken {
  username: string;
  role: string;
}

export default function AllCourses() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Decode the token to get the user's role
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/");
      return;
    }
    try {
      const decoded: DecodedToken = jwtDecode(token);
      setUserRole(decoded.role);
    } catch (error) {
      console.error("Token decode failed:", error);
      router.push("/");
      return;
    }
  }, [router]);

  // Fetch the courses from the backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("http://localhost:8080/academix/course", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
          },
          credentials: "include",
        });
        const result = await response.json();
        if (response.ok) {
          setCourses(result.courses);
        } else {
          alert(result.error || "Failed to fetch courses.");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        alert("Something went wrong. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Handle enrolling in a course
  const handleEnroll = async (courseCode: string) => {
    if (!confirm("Do you want to enroll in this course?")) return;
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:8080/academix/enroll-course/${courseCode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
        },
        credentials: "include",
      });
      const result = await response.json();
      if (response.ok) {
        alert("Enrolled successfully!");
      } else {
        alert(result.error || "Enrollment failed.");
      }
    } catch (error) {
      console.error("Error during enrollment:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ fontFamily: "Arial, sans-serif", textAlign: "center", marginTop: "50px" }}>
        <h2>Loading courses...</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#F7F4F3",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >
      <h1 style={{ color: "#0B2E33", textAlign: "center" }}>All Courses</h1>
      <div style={{ marginTop: "20px" }}>
        {courses.length === 0 ? (
          <p style={{ textAlign: "center" }}>No courses available.</p>
        ) : (
          courses.map((course) => (
            <div
              key={course.Code}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#FFFFFF",
                padding: "10px 20px",
                margin: "10px auto",
                borderRadius: "10px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                maxWidth: "600px",
              }}
            >
              {/* Course Info: Code : Title */}
              <div style={{ fontSize: "16px", color: "#0B2E33" }}>
                {course.Code} : {course.Title}
              </div>
              {/* Only for students, display the Enroll button */}
              {userRole === "student" && (
                <button
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#93B1B5")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#B8E3E9")}
                  onClick={() => handleEnroll(course.Code)}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#B8E3E9",
                    color: "#0B2E33",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Enroll
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}