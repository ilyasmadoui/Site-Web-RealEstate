import React, { useState, useEffect } from 'react';
import '../styles/Notifications.scss';
import { useTranslation } from "react-i18next";
import ProfileImage from '../assets/images/ProfileImage.jpg';
import { SendIcon } from 'lucide-react';

function Notifications() {
    const { t } = useTranslation();
    const [statusMessage, setStatusMessage] = useState("");
    const [showStatusPanel, setShowStatusPanel] = useState(false);
    const [userNotifications, setUserNotifications] = useState([]);
    const [showContact, setShowContact] = useState(false);
    const [selectedNotif, setSelectedNotif] = useState(null); // Store selected notification
    const [requestMessage, setRequestMessage] = useState(""); 

    useEffect(() => {
        // Fetch notifications
        const fetchNotif = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/auth/getNotifs/${localStorage.getItem("userID")}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch notifications");
                
                const result = await response.json();

                console.log("Fetch notif result is : ", result)
                setUserNotifications(result.length > 0 ? result : []);
            
            } catch (error) {
                console.error("Fetch error:", error);
            }
        };

        fetchNotif();
    }, []);

    const handleDelNotif = async (notifID) => {
        try {
            const response = await fetch(`http://localhost:5000/api/auth/delNotif/${notifID}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!response.ok) {
                setStatusMessage("Failed to delete notification.");
                setShowStatusPanel(true);
                throw new Error("Failed to delete notification.");
            }

            setUserNotifications((prev) => prev.filter((notif) => notif.idNotif !== notifID));
        } catch (error) {
            setStatusMessage("Failed to delete notification due to a server issue.");
            setShowStatusPanel(true);
        }
    };

    const handleReply = (notif) => {
        setSelectedNotif(notif);
        setShowContact(true);
    };

    const handleReplyMessage = async () => {
        if (!selectedNotif || !requestMessage) {
            setStatusMessage("Please enter a message before sending.");
            setShowStatusPanel(true);
            return;
        }
    
        const senderID = localStorage.getItem("userID");
        console.log("Selected Notification Data:", selectedNotif); 
    
        const payload = {
            notifID: selectedNotif?.idNotif?.trim(), 
            senderID,
            receiverID: selectedNotif?.idSender,
            message: requestMessage,
        };
    
        console.log("Sending replyNotif request with payload:", payload);
    
        try {
            const response = await fetch("http://localhost:5000/api/auth/replyNotif", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(payload),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Backend error:", errorData);
                throw new Error(errorData.error || "Failed to send reply.");
            }
    
            const result = await response.json();
            console.log("Reply sent successfully:", result);
    
            
            setUserNotifications((prev) => prev.filter((notif) => notif.idNotif !== selectedNotif.idNotif));
    
            setShowContact(false);
            setStatusMessage("Reply sent successfully!");
            setShowStatusPanel(true);
        } catch (error) {
            console.error("Error sending reply:", error);
            setStatusMessage("An error occurred while sending your reply.");
            setShowStatusPanel(true);
        }
    };
    
    

    return (
        <div className='notif-container'>
            <div className='header-Container'>
                <h1>{t("daily_notifications")}</h1>
            </div>

            <div className='Notifications-container'>
                {userNotifications.length > 0 ? (
                    userNotifications.map((notif) => (
                        <div key={notif.idNotif} className='notif-container'>
                            <div className='img-notif-container'>
                                <img src={notif.image || ProfileImage} alt="User Profile" />
                            </div>
                            <div className='info-notif-container'>
                                <p><strong>{t("from")}: {notif.FullName}</strong></p>
                                <h3>{t("content")}: {notif.Context}</h3>
                            </div>
                            <button 
                                className='reply-btn' 
                                onClick={() => handleReply(notif)}
                            >
                                {t("reply")}
                            </button>

                            <button 
                                className='del-btn-notif' 
                                onClick={() => handleDelNotif(notif.idNotif)}
                            >
                                {t("delete")}
                            </button>
                        </div>
                    ))
                ) : (
                    <p className='no-notifcations'>{t("no_notifications")}</p>
                )}
            </div>

            {showStatusPanel && (
                <div className="Info-Panel">
                    <button className="closeContact-btn" onClick={() => setShowStatusPanel(false)}>x</button>
                    <h1>{t('notifications_status')}</h1>
                    <p>{statusMessage}</p>
                </div>
            )}

            {showContact && selectedNotif && (
                <div className="contact-section-container">
                    <div className="contact-container">
                        <button className="closeContact-btn" onClick={() => setShowContact(false)}>x</button>
                        <div className="img-container">
                            <img src={selectedNotif.image || ProfileImage} alt="User Profile" />
                        </div>
                        <h2>{t("to")}: {selectedNotif.FullName}</h2>
                        <div className="contact-msg-container">
                            <input 
                                placeholder={t('Enter_your_message')}  
                                onChange={(e) => setRequestMessage(e.target.value)} 
                            />
                            <button onClick={handleReplyMessage}>
                                <SendIcon size={10}/>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Notifications;
