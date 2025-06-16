import React, { useState } from "react";
import { CognitoUserAttribute, CognitoUserPool } from "amazon-cognito-identity-js";
import { userPool } from "../config/cognito";


const AdminSignup = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    familyName: "",
    formattedName: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    const attributeList = [
      new CognitoUserAttribute({ Name: "email", Value: form.email }),
      new CognitoUserAttribute({ Name: "custom:role", Value: "Super Admin" }),
      new CognitoUserAttribute({ Name: "phone_number", Value: form.phoneNumber }), // Ensure this is allowed
      new CognitoUserAttribute({ Name: "custom:familyName", Value: form.familyName }), // Use custom prefix if needed
      new CognitoUserAttribute({ Name: "custom:formattedName", Value: form.formattedName }) // Use custom prefix if needed
    ];

    userPool.signUp(form.email, form.password, attributeList, [], (err, result) => {
      setLoading(false);
      if (err) {
        setMessage(err.message);
      } else {
        setMessage("Signup successful. Please verify your email.");
      }
    });
  };

  return (
    <div className="signup-container">
      <h2>Admin Signup</h2>
      <form onSubmit={handleSignup} className="signup-form">
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />
        <input type="text" name="phoneNumber" placeholder="Phone Number" onChange={handleChange} required />
        <input type="text" name="familyName" placeholder="Family Name" onChange={handleChange} required />
        <input type="text" name="formattedName" placeholder="Formatted Name" onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? "Signing up..." : "Sign Up"}</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default AdminSignup;