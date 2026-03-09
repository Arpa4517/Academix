"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";

interface DecodedToken {
  username: string;
  role: string;
}

interface Profile {
  Name: string;
  Username: string;
  Email: string;
  Role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [newEmail, setNewEmail] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/");
      return;
    }
    // Fetch profile information
    fetch("http://localhost:8080/academix/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
          setNewEmail(data.profile.Email);
        } else {
          alert("Profile not found.");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        setLoading(false);
      });
  }, [router]);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch("http://localhost:8080/academix/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        credentials: "include",
        body: JSON.stringify({ email: newEmail }),
      });
      const result = await response.json();
      if (response.ok) {
        alert("Email updated successfully!");
        setProfile({ ...profile!, Email: newEmail });
        setEditMode(false);
      } else {
        alert(result.error || "Update failed.");
      }
    } catch (error) {
      console.error("Error updating email:", error);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          textAlign: "center",
          marginTop: "50px",
          color: "#000",
        }}
      >
        <h2>Loading profile...</h2>
      </div>
    );
  }

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
        <h1 style={{ fontSize: "22px", fontWeight: "bold", marginLeft: "20px" }}>Academix</h1>
        <div style={{ display: "flex", gap: "15px", marginRight: "20px" }}>
          <button
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
            onClick={() => router.push("/dashboard")}
            style={{
              padding: "8px 15px",
              backgroundColor: "#4F7C82",
              color: "white",
              border: "none",
              borderRadius: "18px",
              cursor: "pointer",
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("authToken");
              router.push("/");
            }}
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

      {/* Profile Content */}
      <div
        style={{
          padding: "20px",
          maxWidth: "600px",
          margin: "20px auto",
          backgroundColor: "#FFFFFF",
          borderRadius: "10px",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ color: "#000", textAlign: "center" }}>My Profile</h2>
        {profile && (
          <div style={{ marginTop: "20px" }}>
            <p style={{ color: "#000" }}>
              <strong>Name:</strong> {profile.Name}
            </p>
            <p style={{ color: "#000" }}>
              <strong>Username:</strong> {profile.Username}
            </p>
            <p style={{ color: "#000" }}>
              <strong>Email:</strong> {profile.Email}
            </p>
            <p style={{ color: "#000" }}>
              <strong>Role:</strong> {profile.Role}
            </p>
            {!editMode ? (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#93B1B5")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#B8E3E9")}
                  onClick={() => setEditMode(true)}
                  style={{
                    padding: "10px",
                    backgroundColor: "#B8E3E9",
                    color: "#0B2E33",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Update Email
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateEmail} style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <label style={{ color: "#000" }}>
                  New Email:
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    style={{ padding: "8px", width: "100%", marginTop: "5px" }}
                  />
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#93B1B5")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#B8E3E9")}
                    type="submit"
                    style={{
                      padding: "10px",
                      backgroundColor: "#B8E3E9",
                      color: "#0B2E33",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                  <button
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#93B1B5")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#B8E3E9")}
                    onClick={() => setEditMode(false)}
                    type="button"
                    style={{
                      padding: "10px",
                      backgroundColor: "#B8E3E9",
                      color: "#000",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}