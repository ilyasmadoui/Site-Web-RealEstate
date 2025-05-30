import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from "react-scroll";
import { useTranslation } from 'react-i18next';
import "../styles/Navbar.scss";
import ProfileImagePlaceholder from '../assets/images/noProfilePicture.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUser, faCog, faSearch, faSignOutAlt, faHome } from '@fortawesome/free-solid-svg-icons';
import Settings from '../pages/Settings';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [user, setUser] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settingUser, setSettingsUser] = useState(null);
  const [currentPosts, setCurrentPost] = useState([]);
  const [query, setQuery] = useState("");

  const userID = localStorage.getItem("userID");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  
  const modalRef = useRef(null);
  const [position, setPosition] = useState({x: 500, y: -435 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Fetch user data
  useEffect(() => {
    const updateUser = async () => {
      if (userID && token) {
        try {
          const response = await fetch("http://localhost:5000/api/auth/navbarInfo", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ userID })
          });

          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

          const data = await response.json();
          setUser(data.user);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    updateUser();
    window.addEventListener("storage", updateUser);
    return () => window.removeEventListener("storage", updateUser);
  }, []);

  // Fetch user profile for settings
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/auth/profile/${userID}`);
        const data = await response.json();

        if (response.ok) {
          setSettingsUser(data.user);
        } else {
          console.error(`Error: ${data.error}`);
        }
      } catch (error) {
        console.error("Request failed:", error);
      }
    };
    fetchProfile();
  }, [user]);

   useEffect(() => {
       const fetchData = async () => {
         try {
           console.log("Before fetching...");
     
           const response = await fetch("http://localhost:5000/api/auth/all-posts", {
             method: "POST",  // Changed to POST to send data in the body
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ userID }) 
           });
     
           if (!response.ok) {
             throw new Error("Failed to fetch posts");
           }
     
           const result = await response.json();
           console.log("All posts fetch result:", result);
           
           setCurrentPost(result.data || []);
         } catch (error) {
           console.error("Failed to fetch posts:", error);
           setError("Failed to fetch posts");
         }
       };
     
       fetchData();
     }, []);
     
  const filteredPosts = currentPosts.filter((post) =>
    Object.values(post).some((value) =>
      value.toString().toLowerCase().includes(query.toLowerCase())
    )
  );

  // Draggable modal handlers
  const handleMouseDown = (e) => {
    setDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const handleMouseUp = () => setDragging(false);

  return (
    <nav className='navbar-container'>
      <div className='logo-section'>
        <span className='logo-text' onClick={() => navigate('/')}>Homora</span>
      </div>

      {location.pathname === "/" && (
        <div className='nav-links'>
          <Link to="Home" className='nav-link' smooth={true} duration={500}>{t("Home_link")}</Link>
          <Link to="about" className='nav-link' smooth={true} duration={500}>{t("Contact_link")}</Link>
          <Link to="contact" className='nav-link' smooth={true} duration={500}>{t("Follow_link")}</Link>
        </div>
      )}

      {(location.pathname !== "/" && location.pathname !== "/login" && location.pathname !== "/register") && (
        <div className="search-bar-nav">
          <input 
            type="text" 
            placeholder={t('search_nav_placeholder')} 
            className="inpt-search-nav" 
            onChange={(e) => setQuery(e.target.value)}
            value={query}
          />
          {query && (
            <ul className="filtered-posts">
              {filteredPosts.map((filteredPost) => (
                <li key={filteredPost.postID}>
                  <div className='filter-img-container'>
                    <img
                      src={filteredPost.pic1}
                      alt="property pic"
                      onError={(e) => (e.target.src = 'default-image.jpg')}
                    />
                  </div>
                  <div className='info-nav-container'>
                    <p className='text right'>{filteredPost.state}</p>
                    <p className='text left'>{filteredPost.Muniplicity}</p>
                    <p className='text right'>{filteredPost.street}</p>
                    <p className='price'>{filteredPost.price}Da</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!user ? (
        <div className='btn-container-navbar'>
          <button className='btn btn-login' onClick={() => navigate('/login')}>{t("login_button")}</button>
          <button className='btn btn-register' onClick={() => navigate('/register')}>{t("register_button")}</button>
        </div>
      ) : (
        <div className='registered-container'>
          <div className='profileImg-container' onClick={() => setDropdownOpen(!dropdownOpen)}>
            <img src={user?.image || ProfileImagePlaceholder} alt="profile" />
          </div>

          {dropdownOpen && (
            <div className='dropdown-menu'>
              <ul>
                <li onClick={() => navigate(`/profile/${userID}`)}><FontAwesomeIcon icon={faUser} /> {t('profile_text')}</li>
                <li onClick={() => setShowSettings(true)}><FontAwesomeIcon icon={faCog} /> {t('settings')}</li>
                <li onClick={() => navigate('/browse')}><FontAwesomeIcon icon={faSearch} /> {t('browse')}</li>
                <li onClick={() => navigate('/')}><FontAwesomeIcon icon={faHome} /> {t('home_text')}</li>
                <li onClick={() => {
                  localStorage.removeItem("userID");
                  localStorage.removeItem("token");
                  setUser(null);
                  navigate('/');
                  window.location.reload();
                }}>
                  <FontAwesomeIcon icon={faSignOutAlt} /> {t('logout')}
                </li>
              </ul>
            </div>
          )}

          {showSettings && (
            <div className="settings-overlay">
              <div
                className="settings-navbar-container"
                ref={modalRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{
                  position: "absolute",
                  top: `${position.y}px`,
                  left: `${position.x}px`,
                  cursor: "grab",
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "10px",
                  boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.3)",
                  zIndex: 1001,
                }}
              >
                <button onClick={() => setShowSettings(false)} style={{ backgroundColor: "red", color: "white" }}>X</button>
                <Settings user={settingUser} />
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
