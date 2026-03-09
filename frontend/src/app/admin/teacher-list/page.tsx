"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";

interface User {
  ID: number;
  Name: string;
  Username: string;
  Email: string;
  Role: string;
}

interface DecodedToken {
  username: string;
  role: string;
}

export default function TeacherList() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authorized, setAuthorized] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/");
      return;
    }
    try {
      const decoded: DecodedToken = jwtDecode(token);
      if (decoded.role === "admin") setAuthorized(true);
      else {
        alert("Access denied. Admin only.");
        router.push("/");
      }
    } catch (error) {
      console.error("Token decode failed:", error);
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      fetch("http://localhost:8080/academix/admin/teacher-list", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
        },
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.teachers) setTeachers(data.teachers);
          else alert("Could not fetch teacher list.");
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching teacher list:", error);
          setLoading(false);
        });
    }
  }, []);

  if (!authorized) return null;
  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "50px", color: "#000" }}>Loading teacher list...</div>;
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", backgroundColor: "#F7F4F3", padding: "20px", color: "#000" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Teacher List</h2>
      {teachers.length > 0 ? (
        teachers.map((teacher) => (
          <div
            key={teacher.ID}
            style={{ backgroundColor: "#FFFFFF", padding: "15px", borderRadius: "10px", marginBottom: "15px", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)", maxWidth: "600px", margin: "0 auto 15px" }}
          >
            <p><strong>Name:</strong> {teacher.Name}</p>
            <p><strong>Username:</strong> {teacher.Username}</p>
            <p><strong>Email:</strong> {teacher.Email}</p>
          </div>
        ))
      ) : (
        <p style={{ textAlign: "center" }}>No teachers found.</p>
      )}
    </div>
  );
}