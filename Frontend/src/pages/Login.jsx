import React, { useState } from "react"; 
import { Link, useNavigate } from "react-router-dom"; 
import "../styles/Login.scss";
import Navbar from "../component/Navbar";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Footer from "../component/Footer";
import LangSelector from "../component/LangSelector";
import { useTranslation } from 'react-i18next';

function Login() {

  const [passwordVisible, setPasswordVisible] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate(); 

  const [dataForm, setDataForm] = useState({
    email : "",
    password : ""
  })


  const handleChange = (e)=>{
    const {name, value} = e.target;
    setDataForm((prev)=>({
      ...prev,
      [name] : value
    }));
  }
  const handleLogin = async (event) => {
    event.preventDefault();
  
    if (!dataForm.email || !dataForm.password) {
      window.alert("Veuillez entrer un email et un mot de passe.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataForm),
      });
  
      const data = await response.json();
      if (response.ok) {
        console.log(`User id: ${data.id}`);
        localStorage.setItem("userID", data.userID); // Store user ID
        localStorage.setItem("token", data.token); // Store authentication token
        localStorage.setItem("role",data.role);
        window.dispatchEvent(new Event("storage")); // Notify other components
      
        // Redirection selon le rôle
      if (data.role === 0) {
        navigate("/admin"); // Redirection vers la page admin
      } else {
        navigate(`/profile/${data.userID}`); // Redirection vers le profil utilisateur
      }        
      
      window.location.reload(); // Ensure UI updates        
      } else {
        window.alert("Email ou mot de passe incorrect !");
        console.error("Error:", data.error);
      }
    } catch (error) {
      console.error("Request failed:", error);
      window.alert("Une erreur s'est produite. Veuillez réessayer plus tard.");
    }
  };
  
 
  return (
    <div>
      <Navbar />
      <div className="login-container">
        <div className="login-box">
          <h2>{t('Login_title')}</h2>
          <div className="input-group">
            <label><Mail size={15} className="input-icon" /> {t('first_input')}</label>
            <input
              name = "email"
              type="email"
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group password-group">
            <label><Lock size={15} className="input-icon" /> {t('second_input')}</label>
            <input
              type={passwordVisible ? "text" : "password"}
              name="password"
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

          {/* Lien d'inscription */}
          <p className="register-link">
            {t("register_link")} 
            <Link to="/register"> {t('register_link_main')}</Link>
          </p>

          {/* Bouton connexion */}
          <button className="login-btn" onClick={handleLogin}>
            {t('Login_btn')}
          </button>
        </div>
      </div>
      <LangSelector />
      <Footer />
    </div>
  );
}

export default Login;
