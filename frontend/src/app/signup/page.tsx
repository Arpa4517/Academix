"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: ""
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.username || !formData.email || !formData.password || !confirmPassword || !formData.role) {
      setErrorMessage("Please fill up all the information");
      return;
    }

    if (formData.password !== confirmPassword) {
      setErrorMessage("Confirm your password.");
      return;
    }

    setErrorMessage("");
    try {
      const response = await fetch("http://localhost:8080/academix/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        credentials: "include",
        body: new URLSearchParams(formData).toString()
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("authToken", result.Token || result.token);
        router.push("/dashboard");
      } else {
        setErrorMessage(result.error || "Sign-up failed. Try again.");
      }
    } catch (error) {
      console.error("Error submitting sign-up:", error);
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#F7F4F3",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          padding: "20px",
          borderRadius: "20px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          width: "350px"
        }}
      >
        <h2
          style={{
            marginBottom: "20px",
            fontSize: "22px",
            color: "#333"
          }}
        >
          Sign Up
        </h2>

        <input type="text" name="name" placeholder="Name" onChange={handleChange} style={inputStyle} />
        <input type="text" name="username" placeholder="Username" onChange={handleChange} style={inputStyle} />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} style={inputStyle} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} style={inputStyle} />
        <input type="password" placeholder="Confirm Password" onChange={handleConfirmPasswordChange} style={inputStyle} />

        <select name="role" onChange={handleChange} style={inputStyle}>
          <option value="">Select Role</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>

        {errorMessage && <p style={errorStyle}>{errorMessage}</p>}

        <button
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0B2E33")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4F7C82")}
          onClick={handleSubmit}
          style={buttonStyle}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  color: "#000000",
  width: "80%",
  padding: "8px",
  marginTop: "8px",
  marginBottom: "8px",
  border: "1px solid #aaa",
  borderRadius: "5px"
};

const buttonStyle = {
  width: "60%",
  padding: "10px",
  backgroundColor: "#4F7C82",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginTop: "15px",
  marginBottom: "10px"
};

const errorStyle = {
  color: "red",
  fontSize: "14px",
  marginTop: "10px"
};