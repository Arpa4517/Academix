"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import {jwtDecode} from "jwt-decode";

interface Course {
  Code: string;
  Title: string;
  Description: string;
  Assignments?: Assignment[];

}

interface Assignment {
  ID: number;
  Serial: number;
  Instructions?: string;
  PublishTime?: string;
  Deadline?: string;
  Question?: string;
  Message?: string;
}

interface DecodedToken {
  username: string;
  role: string;
}

// Custom date formatter
const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) +
         " " +
         date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

export default function CourseDetails() {
  const router = useRouter();
  const params = useParams() as { courseCode: string };
  const { courseCode } = params;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string>("");
  const [showAssignments, setShowAssignments] = useState<boolean>(false);

  // For student submission forms (keyed by assignment ID)
  const [submissionFormOpen, setSubmissionFormOpen] = useState<{ [key: number]: boolean }>({});
  const [submissionFiles, setSubmissionFiles] = useState<{ [key: number]: File | null }>({});

  // Toggle submission form
  const toggleSubmissionForm = (id: number) => {
    setSubmissionFormOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmissionFileChange = (id: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSubmissionFiles((prev) => ({ ...prev, [id]: file }));
    }
  };

  const handleSubmitAssignment = async (id: number, e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    const file = submissionFiles[id];
    if (!file) {
      alert("Please select a file.");
      return;
    }
    const formData = new FormData();
    formData.append("submission", file);
    try {
      const response = await fetch(`http://localhost:8080/academix/${course?.Code}/assignment/${id}`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        credentials: "include",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        alert("Assignment submitted successfully!");
        setSubmissionFormOpen((prev) => ({ ...prev, [id]: false }));
        setSubmissionFiles((prev) => ({ ...prev, [id]: null }));
      } else {
        alert(result.error || "Submission failed.");
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/");
      return;
    }
    try {
      const decoded: DecodedToken = jwtDecode(token);
      setUserRole(decoded.role);
      if (decoded.role === "teacher" || decoded.role === "admin") {
        setShowAssignments(true);
      }
    } catch (error) {
      console.error("Token decode error:", error);
      router.push("/");
      return;
    }
    fetch(`http://localhost:8080/academix/course/${courseCode}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.course) {
          setCourse(data.course);
        } else {
          alert("Course not found.");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching course:", error);
        setLoading(false);
      });
  }, [courseCode, router]);

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "50px", color: "#000" }}>Loading course details...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F7F4F3", fontFamily: "Arial, sans-serif", color: "#000" }}>
      {/* Navbar should be the same as dashboard (assumed to be provided by a global layout if available) */}
      <div style={{ padding: "20px" }}>
        {course ? (
          <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)", maxWidth: "800px", margin: "20px auto" }}>
            <h2 style={{ textAlign: "center", fontWeight: "bold", fontSize: "24px", marginBottom: "10px" }}>
              {course.Code}:{course.Title.toUpperCase()}
            </h2>
            <p style={{ textAlign: "center", marginBottom: "30px" }}>
              {course.Description}
            </p>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              {(userRole === "teacher" || userRole === "admin") && (
                <span onClick={() => router.push(`/course/${course.Code}/assignment/create`)}
                  style={{ cursor: "pointer", textDecoration: "underline", fontWeight: "bold", fontSize: "16px", marginRight: "20px" }}>
                  Create Assignment
                </span>
              )}
              {course.Assignments && course.Assignments.length > 0 ? (
                <span onClick={() => setShowAssignments(!showAssignments)}
                  style={{ cursor: "pointer", textDecoration: "underline", fontWeight: "bold", fontSize: "16px" }}>
                  {showAssignments ? "Hide Assignments" : "View Assignments"}
                </span>
              ) : (
                userRole === "student" && (
                  <span style={{ fontSize: "16px", fontStyle: "italic" }}>Assignments not published yet.</span>
                )
              )}
            </div>
            {showAssignments && (
              <div>
                {userRole === "teacher" || userRole === "admin" ? (
                  <>
                    <h3 style={{ textAlign: "center", marginBottom: "15px" }}>Created Assignments</h3>
                    {course.Assignments && course.Assignments.length > 0 ? (
                      course.Assignments.map((assignment) => (
                        <div key={assignment.ID} style={{ padding: "10px 20px", margin: "10px 0", borderRadius: "5px", backgroundColor: "#F7F4F3" }}>
                          <p style={{ fontWeight: "bold" }}>Assignment {assignment.Serial}</p>
                          {assignment.Question && (
                            <p>
                              <strong>Question:</strong>{" "}
                              <a href={assignment.Question} target="_blank" rel="noopener noreferrer" download={`assignment_${assignment.ID}_question`}
                                style={{ textDecoration: "underline" }}>
                                Download Question
                              </a>
                            </p>
                          )}
                          <p>
                            <strong>Uploaded on:</strong> {formatDate(assignment.PublishTime)}
                          </p>
                          <p>
                            <strong>Deadline:</strong> {formatDate(assignment.Deadline)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p style={{ textAlign: "center" }}>No assignments created yet.</p>
                    )}
                  </>
                ) : (
                  <>
                    {course.Assignments && course.Assignments.length > 0 ? (
                      course.Assignments.map((assignment) => (
                        <div key={assignment.ID} style={{ padding: "10px 20px", margin: "10px 0", borderRadius: "5px", backgroundColor: "#F7F4F3" }}>
                          <p style={{ fontWeight: "bold" }}>Assignment {assignment.Serial}</p>
                          {assignment.Instructions && (
                            <p>
                              <strong>Description:</strong> {assignment.Instructions}
                            </p>)}
                          {assignment.Message && (
                            <p>
                              <strong>Message:</strong> {assignment.Message}
                            </p>
                          )}
                          {assignment.Question && (
                            <p>
                              <strong>Question:</strong>{" "}
                              <a href={assignment.Question} target="_blank" rel="noopener noreferrer" download={`assignment_${assignment.ID}_question`}
                                style={{ textDecoration: "underline" }}>
                                Download Question
                              </a>
                            </p>
                          )}
                          <p>
                            <strong>Published on:</strong> {formatDate(assignment.PublishTime)}
                          </p>
                          <p>
                            <strong>Deadline:</strong> {formatDate(assignment.Deadline)}
                          </p>
                          <div style={{ textAlign: "center", marginTop: "10px" }}>
                            <span onClick={() => toggleSubmissionForm(assignment.ID)}
                              style={{ cursor: "pointer", textDecoration: "underline", fontWeight: "bold", fontSize: "14px" }}>
                              {submissionFormOpen[assignment.ID] ? "Cancel Submission" : "Submit"}
                            </span>
                          </div>
                          {submissionFormOpen[assignment.ID] && (
                            <form onSubmit={(e) => handleSubmitAssignment(assignment.ID, e)} style={{ marginTop: "10px", textAlign: "center", display: "flex", flexDirection: "column", gap: "10px" }}>
                              <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleSubmissionFileChange(assignment.ID, e)} style={{ padding: "8px" }} />
                              <button type="submit" style={{ padding: "8px 12px", backgroundColor: "#4F7C82", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                                Submit Assignment
                              </button>
                            </form>
                          )}
                        </div>
                      ))
                    ) : (
                      <p style={{ textAlign: "center", fontStyle: "italic" }}>Assignments not published yet.</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <p style={{ textAlign: "center" }}>Course details not available.</p>
        )}
      </div>
    </div>
  );
}