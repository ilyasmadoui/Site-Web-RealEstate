import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faEdit, faUser, faPhone, faEnvelope, faImage, faTimes } from "@fortawesome/free-solid-svg-icons";
import emptyPFP from "../assets/images/noProfilePicture.png";
import "../styles/Settings.scss";
import { useTranslation } from "react-i18next";

function Settings({ user, setUser }) {
  const [editMode, setEditMode] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({ ...user });
  const [image, setImage] = useState(null);
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar"; 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setUpdatedUser({ ...user });
    setImage(null);
  };

  const saveChanges = async () => {
    try {
      const formData = new FormData();
      formData.append("fullName", updatedUser.fullName);
      formData.append("email", updatedUser.email);
      formData.append("phoneNum", updatedUser.phoneNum);
      if (image) {
        formData.append("image", image);
      }

      const response = await fetch(`http://localhost:5000/api/auth/profile/${user.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) throw new Error("Échec de la mise à jour.");

      const data = await response.json();
      if (setUser) {
        setUser(data.user);
        window.location.reload()
      }
      setEditMode(false);
      alert(t("updateSuccess"));
    } catch (error) {
      console.error("Erreur :", error);
      alert(t("updateError"));
    }
  };

  return (
    <div className="settings-container">
      <h2>{t("settings")}</h2>
      <hr /><br />
      <div className="settings-info">
        <img
          src={image ? URL.createObjectURL(image) : updatedUser.image || emptyPFP}
          alt="Profile"
          className="profile-pic"
        />
        {editMode ? (
          <>
            <input type="text" name="fullName" value={updatedUser.fullName || ""} onChange={handleInputChange} />
            <input type="text" name="phoneNum" value={updatedUser.phoneNum || ""} onChange={handleInputChange} />
            <input type="email" name="email" value={updatedUser.email || ""} onChange={handleInputChange} />
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <div className="button-group">
              <button className="save-btn" onClick={saveChanges}>
                <FontAwesomeIcon icon={faSave} /> {t("save")}
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
                <FontAwesomeIcon icon={faTimes} /> {t("cancel")}
              </button>
            </div>
          </>
        ) : (
          <div className="editInfo_container" dir={isArabic ? "rtl" : "ltr"}>
            <p><FontAwesomeIcon icon={faUser} /> <strong>{t("edit_fullName")}:</strong> {user.fullName}</p>
            <p><FontAwesomeIcon icon={faPhone} /> <strong>{t("edit_phone")}:</strong> {user.phoneNum}</p>
            <p><FontAwesomeIcon icon={faEnvelope} /> <strong>{t("edit_email")}:</strong> {user.email}</p><br />
            <button className="edit-btn" onClick={() => setEditMode(true)}>
              <FontAwesomeIcon icon={faEdit} /> {t("edit")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
