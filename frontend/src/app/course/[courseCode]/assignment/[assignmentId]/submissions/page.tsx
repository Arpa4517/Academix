"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {jwtDecode} from "jwt-decode";

interface Submission {
  ID: number;
  Student: { Name: string; Username: string };
  Submission: string;
  Marks?: number;
  Feedback?: string;
}

interface DecodedToken {
  username: string;
  role: string;
}

export default function SubmissionList() {
  const router = useRouter();
  const params = useParams() as { courseCode: string; assignmentId: string };
  const { courseCode, assignmentId } = params;
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/");
      return;
    }
    try {
      const decoded: DecodedToken = jwtDecode(token);
      // Ensure teacher or admin here
    } catch (error) {
      console.error("Token decode error:", error);
      router.push("/");
      return;
    }
    fetch(`http://localhost:8080/academix/${courseCode}/assignment/${assignmentId}/submissions`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.submissions) {
          setSubmissions(data.submissions);
        } else {
          alert("No submissions found.");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching submissions:", error);
        setLoading(false);
      });
  }, [courseCode, assignmentId, router]);
  
  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "50px", color: "#000" }}>Loading submissions...</div>;
  }
  
  return (
    <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", backgroundColor: "#F7F4F3", color: "#000", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Assignment Submissions</h2>
      {submissions.length > 0 ? (
        submissions.map((sub) => (
          <div key={sub.ID} style={{ backgroundColor: "#FFFFFF", padding: "15px", borderRadius: "10px", marginBottom: "15px", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)" }}>
            <p><strong>Student:</strong> {sub.Student.Name} ({sub.Student.Username})</p>
            <p><strong>Marks:</strong> {sub.Marks !== undefined ? sub.Marks : "Not graded"}</p>
            <p><strong>Feedback:</strong> {sub.Feedback || "No feedback"}</p>
            {sub.Submission && (
              <p>
                <a href={`data:application/octet-stream;base64,${sub.Submission}`} download={`submission_${sub.ID}`} style={{ textDecoration: "underline", color: "#000" }}>
                  Download Submission
                </a>
              </p>
            )}
          </div>
        ))
      ) : (
        <p style={{ textAlign: "center" }}>No submissions found.</p>
      )}
    </div>
  );
}