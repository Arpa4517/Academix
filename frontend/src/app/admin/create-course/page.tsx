"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";

interface DecodedToken {
  username: string;
  role: string;
}

export default function CreateCourse() {
  const router = useRouter();
  const [code, setCode] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [authorized, setAuthorized] = useState<boolean>(false);

  // Check if user is admin
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/");
      return;
    }
    try {
      const decoded: DecodedToken = jwtDecode(token);
      if (decoded.role === "admin") {
        setAuthorized(true);
      } else {
        alert("Access denied. Admin only.");
        router.push("/");
      }
    } catch (error) {
      console.error("Token decode failed:", error);
      router.push("/");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch("http://localhost:8080/academix/create-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
        },
        credentials: "include",
        body: JSON.stringify({ Code: code, Title: title, Description: description }),
      });
      const result = await response.json();
      if (response.ok) {
        alert("Course created successfully!");
        router.push("/courseList");
      } else {
        alert(result.error || "Failed to create course.");
      }
    } catch (error) {
      console.error("Error creating course:", error);
    }
  };

  if (!authorized) return null;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", backgroundColor: "#F7F4F3", padding: "20px", color: "#000" }}>
      <div style={{ maxWidth: "500px", margin: "20px auto", backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)" }}>
        <h2 style={{ textAlign: "center" }}>Create New Course</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
          <label style={{ color: "#000" }}>
            Course Code:
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required style={{ padding: "8px", width: "100%" }} />
          </label>
          <label style={{ color: "#000" }}>
            Title:
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ padding: "8px", width: "100%" }} />
          </label>
          <label style={{ color: "#000" }}>
            Description:
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ padding: "8px", width: "100%" }} />
          </label>
          <button type="submit" style={{ padding: "10px", backgroundColor: "#4F7C82", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Create Course
          </button>
        </form>
      </div>
    </div>
  );
}