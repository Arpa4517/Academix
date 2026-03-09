"use client";

import { useRouter, useParams } from "next/navigation";
import React, { useState } from "react";
import {jwtDecode} from "jwt-decode";

interface DecodedToken {
  username: string;
  role: string;
}

export default function ManageCourseUsers() {
  const router = useRouter();
  const params = useParams() as { courseCode: string };
  const { courseCode } = params;
  
  const [assignUsername, setAssignUsername] = useState<string>("");
  const [removeUsername, setRemoveUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [authorized, setAuthorized] = useState<boolean>(false);
  
  // Check admin authentication
  React.useEffect(() => {
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
  
  const handleAssignUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("Do you want to assign this user to the course?")) return;
    setLoading(true);
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(`http://localhost:8080/academix/admin/assign-user/${courseCode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
        },
        credentials: "include",
        body: JSON.stringify({ assignableUsername: assignUsername }),
      });
      const result = await response.json();
      if (response.ok) {
        alert("User assigned successfully!");
        setAssignUsername("");
      } else {
        alert(result.error || "Failed to assign user.");
      }
    } catch (error) {
      console.error("Error assigning user:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("Do you want to remove this user from the course?")) return;
    setLoading(true);
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(`http://localhost:8080/academix/admin/remove-user/${courseCode}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
        },
        credentials: "include",
        body: JSON.stringify({ removableUsername: removeUsername }),
      });
      const result = await response.json();
      if (response.ok) {
        alert("User removed successfully!");
        setRemoveUsername("");
      } else {
        alert(result.error || "Failed to remove user.");
      }
    } catch (error) {
      console.error("Error removing user:", error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!authorized) return null;
  
  return (
    <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", backgroundColor: "#F7F4F3", color: "#000", padding: "20px" }}>
      <div style={{ maxWidth: "600px", margin: "20px auto", backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)" }}>
        <h2 style={{ textAlign: "center" }}>Manage Users for Course: {courseCode}</h2>
        <hr style={{ margin: "20px 0" }} />
        {/* Assign User Form */}
        <form onSubmit={handleAssignUser} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h3 style={{ color: "#000" }}>Assign User</h3>
          <input
            type="text"
            placeholder="Username to assign"
            value={assignUsername}
            onChange={(e) => setAssignUsername(e.target.value)}
            required
            style={{ padding: "8px", color: "#000" }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "10px", backgroundColor: "#4F7C82", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            Assign User
          </button>
        </form>
        <hr style={{ margin: "20px 0" }} />
        {/* Remove User Form */}
        <form onSubmit={handleRemoveUser} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h3 style={{ color: "#000" }}>Remove User</h3>
          <input
            type="text"
            placeholder="Username to remove"
            value={removeUsername}
            onChange={(e) => setRemoveUsername(e.target.value)}
            required
            style={{ padding: "8px", color: "#000" }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "10px", backgroundColor: "#4F7C82", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            Remove User
          </button>
        </form>
      </div>
    </div>
  );
}