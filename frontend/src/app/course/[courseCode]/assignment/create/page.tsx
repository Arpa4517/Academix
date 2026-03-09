"use client";

import { useRouter, useParams } from "next/navigation";
import React, { useState } from "react";

export default function CreateAssignment() {
  const router = useRouter();
  const { courseCode } = useParams() as { courseCode: string };
  const [serial, setSerial] = useState<number>(0);
  const [instruction, setInstruction] = useState<string>("");
  const [publishTime, setPublishTime] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    if (!questionFile) {
      alert("Please attach a question file.");
      return;
    } 
    const formData = new FormData();
    formData.append("serial", serial.toString());
    formData.append("instruction", instruction);
    formData.append("publishTime", publishTime);
    formData.append("deadline", deadline);
    formData.append("question", questionFile);
    formData.append("message",message);
    try {
      const response = await fetch(`http://localhost:8080/academix/${courseCode}/assignment`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        credentials: "include",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        alert("Assignment created successfully!");
        router.push(`/course/${courseCode}`);
      } else {
        alert(result.error || "Failed to create assignment.");
      }
    } catch (error) {
      console.error("Error creating assignment:", error);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F7F4F3", padding: "20px", fontFamily: "Arial, sans-serif", color: "#000" }}>
      {/* Navbar assumed to be provided via global layout */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <span style={{ textDecoration: "underline", fontWeight: "bold", fontSize: "18px" }}>Create Assignment</span>
      </div>
      <div style={{ maxWidth: "600px", margin: "20px auto", backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <label style={{ color: "#000" }}>
            Serial:
            <input type="number" value={serial} onChange={(e) => setSerial(Number(e.target.value))} required style={{ padding: "8px", width: "100%" }} />
          </label>
          <label style={{ color: "#000" }}>
            Instructions:
            <textarea value={instruction} onChange={(e) => setInstruction(e.target.value)} style={{ padding: "8px", width: "100%" }} />
          </label>
          <label style={{ color: "#000" }}>
            Publish Time (ISO format):
            <input type="datetime-local" value={publishTime} onChange={(e) => setPublishTime(e.target.value)} required style={{ padding: "8px", width: "100%" }} />
          </label>
          <label style={{ color: "#000" }}>
            Deadline (ISO format):
            <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} required style={{ padding: "8px", width: "100%" }} />
          </label>
          <label style={{ color: "#000" }}>
            Question File (PDF/DOC/DOCX):
            <input type="file" onChange={(e) => setQuestionFile(e.target.files ? e.target.files[0] : null)} accept=".pdf,.doc,.docx" required style={{ padding: "8px", width: "100%" }} />
          </label>
          <label style={{ color: "#000" }}>
            Message:
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} style={{ padding: "8px", width: "100%" }} />
          </label>
          <button type="submit" style={{ padding: "10px", backgroundColor: "#4F7C82", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Create Assignment
          </button>
        </form>
      </div>
    </div>
  );
}