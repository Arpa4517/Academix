"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import {jwtDecode} from "jwt-decode";

interface Assignment {
  ID: number;
  Serial: number;
  Instructions?: string;
  PublishTime?: string;
  Deadline?: string;
  Question?: string;
}

interface DecodedToken {
  username: string;
  role: string;
}
const formatToRFC3339Nano = (dateStr: string | undefined): string => {
    if (!dateStr) return "";

    const date = new Date(dateStr);

    // Get high-precision UTC timestamp
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');

    
    const rfc3339NanoString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}000000Z`;

    return rfc3339NanoString;
};



const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) +
         " " +
         date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

export default function AssignmentDetails() {
  const router = useRouter();
  const params = useParams() as { courseCode: string; assignmentId: string };
  const { courseCode, assignmentId } = params;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string>("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);

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
      console.error("Token decode error:", error);
      router.push("/");
      return;
    }
    fetch(`http://localhost:8080/academix/${courseCode}/assignments/${assignmentId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.assignment) {
          setAssignment(data.assignment);
        } else {
          alert("Assignment not found.");
          router.push(`/course/${courseCode}`);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching assignment:", error);
        setLoading(false);
      });
  }, [courseCode, assignmentId, router]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSubmissionFile(file);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!submissionFile) {
      alert("Select a file to submit.");
      return;
    }
    const token = localStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("submission", submissionFile);
    try {
      const response = await fetch(`http://localhost:8080/academix/${courseCode}/assignment/${assignmentId}`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        credentials: "include",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        alert("Assignment submitted successfully!");
        router.push("/dashboard");
      } else {
        alert(result.error || "Submission failed.");
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "50px", color: "#000" }}>Loading assignment...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F7F4F3", fontFamily: "Arial, sans-serif", color: "#000" }}>
      {/* Navbar assumed from global layout */}
      <div style={{ padding: "20px" }}>
        {assignment && (
          <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)", maxWidth: "800px", margin: "20px auto" }}>
            <h2 style={{ textAlign: "center", fontWeight: "bold", fontSize: "24px", marginBottom: "10px" }}>
              Assignment {assignment.Serial}
            </h2>
            {assignment.Instructions && (
              <p style={{ textAlign: "center", marginBottom: "10px" }}>
                <strong>Description:</strong> {assignment.Instructions}
              </p>
            )}
            {assignment.Question && (
              <p style={{ textAlign: "center", marginBottom: "10px" }}>
                <strong>Question:</strong>{" "}
                <a href={assignment.Question} target="_blank" rel="noopener noreferrer" download={`assignment_${assignment.ID}_question`} style={{ textDecoration: "underline" }}>
                  Download Question
                </a>
              </p>
            )}
            <p style={{ textAlign: "center", marginBottom: "10px" }}>
              <strong>Published on:</strong> {formatToRFC3339Nano(assignment.PublishTime)}
            </p>
            <p style={{ textAlign: "center", marginBottom: "20px" }}>
              <strong>Deadline:</strong> {formatToRFC3339Nano(assignment.Deadline)}
            </p>
            {userRole === "student" && (
              <form onSubmit={handleSubmit} style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "10px" }}>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} style={{ padding: "8px" }} />
                <button type="submit" style={{ padding: "8px 12px", backgroundColor: "#4F7C82", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                  Submit Assignment
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}