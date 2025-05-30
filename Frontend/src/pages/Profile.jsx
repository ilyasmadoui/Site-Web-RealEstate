import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart ,faGear,
          faPlus, faListCheck, faMagnifyingGlass, 
          faChartSimple, faBell, faRightFromBracket, 
          faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import emptyPFP from '../assets/images/noProfilePicture.png';
import '../styles/Profile.scss';
import { useNavigate, useParams } from 'react-router-dom';
import Create from '../component/Create';
import Posts from '../component/Posts';
import { useTranslation } from 'react-i18next';
import Settings from './Settings';
import Notifications from '../component/Notifications';
import StatsPage from '../component/Stats';
import Favorite from '../component/Favorite';


function Profile() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [section, setSelectedSection] = useState("create");
  const [editMode, setEditMode] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({});
  const role = localStorage.getItem("role");

  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/auth/profile/${id}`);
        const data = await response.json();

        if (response.ok) {
          setUser(data.user);
          setUpdatedUser(data.user);
          console.log(data.user);
          console.log(role)
        } else {
          console.error(`Error: ${data.error}`);
        }
      } catch (error) {
        console.error("Request failed:", error);
      }finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (section === "browse") {
      navigate('/browse');
    }
  }, [section, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUpdatedUser((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveChanges = async () => {
    const formData = new FormData();
    formData.append("fullName", updatedUser.fullName);
    formData.append("email", updatedUser.email);
    formData.append("phoneNum", updatedUser.phoneNum);
    if (updatedUser.image instanceof File) {
        formData.append("image", updatedUser.image);
    }

    try {
        const response = await fetch(`http://localhost:5000/api/auth/profile/${id}`, {
            method: "PUT",
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setEditMode(false);
        } else {
            console.error("Failed to update profile");
        }
    } catch (error) {
        console.error("Error updating profile:", error);
    }
  };

  const renderContent = () => {
    if (!user) return <p>Loading...</p>;
    if (loading) {
      return (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      );
    }
    switch (section) {
      case "create":
        return <Create user={user} />;
      case "posts":
        return <Posts user={user} />;
      case "stats":
         return <StatsPage user = {user}/>;
      case "notifications":
        return <Notifications/>;
      case "settings":
        return <Settings user={user}/>;
      case "Favorite": 
        return <Favorite />
      default:
        return <Create user={user} />;
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
  
    if (token) {
      try {
        await fetch("http://localhost:5000/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Logout request failed:", error);
      }
    }
  
    localStorage.removeItem("token");
    localStorage.removeItem("userID");
  
    
    window.dispatchEvent(new Event("storage"));
  
    navigate("/");
    window.location.reload();
  };
  
  return (
    <div className='profile-container'>
      <div className='icons-container-header'>
          <div className='settings-icon' onClick={() => setSelectedSection("settings")}>
                <FontAwesomeIcon icon={faGear} />
           </div>
           <div className='heart-icon' onClick={() => setSelectedSection("Favorite")}>
                <FontAwesomeIcon icon={faHeart} />
           </div>
      </div>
         
     
      <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
      </button>

      <div className={`sideNavBar ${isOpen ? "active" : ""}`}>
        <div className="UserCredits-container">
          <div className="profileImg-container">
            <img src={user?.image || emptyPFP} alt="profile" />
          </div>
          <div className="profilInfo-container">
            <p className="username">{user?.fullName ?? "Loading..."}</p>
          </div>
        </div>

        <div className="NavBarFuncs-container">
          <div className="NavBarFunc" onClick={() => setSelectedSection("create")}>
            <FontAwesomeIcon icon={faPlus} />
            <p className="FuncName">{t("create")}</p>
          </div>
          <div className="NavBarFunc" onClick={() => setSelectedSection("posts")}>
            <FontAwesomeIcon icon={faListCheck} />
            <p className="FuncName">{t("posts")}</p>
          </div>
          <div className="NavBarFunc" onClick={() => setSelectedSection("browse")}>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            <p className="FuncName">{t("browse")}</p>
          </div>
          <div className="NavBarFunc" onClick={() => setSelectedSection("stats")}>
            <FontAwesomeIcon icon={faChartSimple} />
            <p className="FuncName">{t("stats")}</p>
          </div>
          <div className="NavBarFunc" onClick={() => setSelectedSection("notifications")}>
            <FontAwesomeIcon icon={faBell} />
            <p className="FuncName">{t("notifications")}</p>
          </div>
          <button className="logOut-btn" onClick={handleLogout}>
            <FontAwesomeIcon icon={faRightFromBracket} />
            <p className="FuncName">{t("logout")}</p>
          </button>
        </div>
      </div>

      <div className='profileContent-container'>
        {renderContent()}
      </div>
    </div>
  );
}

export default Profile;
