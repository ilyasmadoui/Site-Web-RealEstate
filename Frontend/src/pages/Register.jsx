import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Upload, User, Mail, Phone, Lock } from "lucide-react";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import LangSelector from "../component/LangSelector";
import emptyPFP from '../assets/images/noProfilePicture.png';
import "../styles/Register.scss";
import { useTranslation } from 'react-i18next';

function Register() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [dataForm, setDataForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phoneNum: "",
    pic: emptyPFP
  });

  // Handle profile picture upload
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setDataForm((prev) => ({ ...prev, pic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDataForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (dataForm.password !== dataForm.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const userRole = 1;
    const userstatus = 'pending'
    
    // Create FormData for API request
    setLoading(true);
    const formData = new FormData();
    formData.append("fullName", dataForm.fullName);
    formData.append("email", dataForm.email);
    formData.append("password", dataForm.password);
    formData.append("phoneNum", dataForm.phoneNum);
    formData.append("role", userRole);
    formData.append("status", userstatus);
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        console.log("User registered:", data);
        navigate("/login");
      } else {
        setErrorMessage(data.error || "Registration failed!");
        console.error("Error:", data.error);
      }
    } catch (error) {
      setErrorMessage("Server error. Please try again later.");
      console.error("Request failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="register-container">
        <div className="register-box">
          <h2>{t("register_title")}</h2>

          {/* Affichage des erreurs */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {/* Image de profil */}
          <div className="profile-pic-container">
            <label className="profile-pic-label">{t("profile_picture")}</label>
            <div className="profile-pic-box">
              {dataForm.pic ? (
                <img src={dataForm.pic} alt="Profile Preview" className="profile-pic-preview" />
              ) : (
                <Upload size={40} className="upload-icon" />
              )}
              <input type="file" accept="image/*" onChange={handleProfilePicChange} />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label><User size={15} className="input-icon" /> {t("username_label")}</label>
              <input type="text" name="fullName" placeholder={t("username_placeholder")} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label><Mail size={15} className="input-icon" /> {t("email_label")}</label>
              <input type="email" name="email" placeholder={t("email_placeholder")} onChange={handleChange} required />
            </div>

            <div className="input-group password-group">
              <label><Lock size={15} className="input-icon" /> {t("password_label")}</label>
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                placeholder={t("password_placeholder")}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="input-group password-group">
              <label><Lock size={15} className="input-icon" /> {t("confirm_password_label")}</label>
              <input
                type={confirmPasswordVisible ? "text" : "password"}
                name="confirmPassword"
                placeholder={t("confirm_password_placeholder")}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              >
                {confirmPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="input-group">
              <label><Phone size={15} className="input-icon" /> {t("phone_label")}</label>
              <input type="tel" name="phoneNum" placeholder={t("phone_placeholder")} onChange={handleChange} required />
            </div>

            <p className="login-link">
              {t("already_account")} <Link to="/login">{t("login")}</Link>
            </p>

            <button className="register-btn" type="submit">
            {loading ? t("loading") :t("create_button")}
            </button>
          </form>
        </div>
      </div>

      <LangSelector />
      <Footer />
    </div>
  );
}

export default Register;
