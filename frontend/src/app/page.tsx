"use client"; 

import { useRouter } from "next/navigation";
import React, { useState } from "react";


export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
 
  
  // Check if the user is already logged in
  //useEffect(() => {
  //  const token = localStorage.getItem("authToken");
  //  if (token) {
  //    setIsAuthenticated(true);
  //    router.push("/dashboard"); 
  //  }
  //}, [router]);



  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:8080/academix/login", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials : "include",
        body: JSON.stringify({ 
          username: username.trim(), //trim removes accidental empty spaces
          password: password.trim() 
        })
      });
  
      const result = await response.json();
      const token = result.token; 
      
      if (response.ok && token) {
        localStorage.setItem("authToken", token);  
        router.push("/dashboard"); 
      } else {
        alert(result.error || "Invalid username or password.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    
    <div style={{
      backgroundColor: "#F7F4F3",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Arial, sans-serif"
    }}>

      <h2 style={{
        marginTop: "15px",
        color: "#0B2E33",
        fontSize: "24px",
        marginBottom: "15px",
        fontWeight: "bold",
      }}>
        Welcome to Academix
      </h2>

      {/* Centered Box */}
      <div style={{
        backgroundColor: "#FFFFFF",
        padding: "20px",
        borderRadius: "20px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        width: "350px"
      }}>
        <h2 style={{ 
          marginBottom: "20px", 
          fontSize: "22px", 
          color: "#333" 
          }}>
          Log in to your account
        </h2>
        
        <input 
          type="text" 
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            color: "#000000",
            width: "80%",
            padding: "8px",
            marginBottom: "10px",
            border: "1px solid #aaa",
            borderRadius: "5px"
          }} 
        />
        
        <input 
          type="password" 
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            color: "#000000",
            width: "80%",
            padding: "8px",
            marginBottom: "15px",
            border: "1px solid #aaa",
            borderRadius: "5px"
          }} 
        />

        
        <button 
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0B2E33"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#4F7C82"}
        onClick={handleLogin} style={{
          width: "60%",
          padding: "10px",
          backgroundColor: "#4F7C82",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "10px"
        }}>
          Log in
        </button>
        
        
        <p style={{ 
          margin: "15px ", 
          marginBottom: "10px",
          fontSize: "14px",
          color: "#333" 
        }}>
            Don't have an account?
        </p>
        <button 
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0B2E33"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#4F7C82"}        
        onClick={() => router.push("/signup")} style={{
          width: "60%",
          padding: "10px",
          backgroundColor: "#4F7C82",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}>
          Sign Up
        </button>


        <p onClick={() => router.push("/signup")} style={{
          marginTop: "15px",
          color: "#0B2E33",
          cursor: "pointer",
          textDecoration: "underline"
        }}>
          Forgot Password?
        </p>
      </div>
    </div>
  );
}