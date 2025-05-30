import React, { useState, useEffect } from "react";
import { Doughnut, Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from "chart.js";
import ProgressCircle from "../component/ProgressCircle";
import { useNavigate } from "react-router-dom";
import "../styles/Admin.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { XIcon, LoaderIcon, Check, Combine, LogOut } from "lucide-react";
import {useTranslation} from 'react-i18next';
import axios from "axios";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

function Admin() {
  const [statsSection, setStatsSection] = useState(true);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ reviewed: 0, rejected: 0, total: 0 });
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  const navigate = useNavigate();
  const {t} = useTranslation();
  const [error ,setError] = useState("");
  const role = localStorage.getItem("role");

  if (role !== "0") {
    return <h1>Acces Denied</h1>
  }

  useEffect(() => {
    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/auth/all-posts-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userID: 1, status: "pending" }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Erreur inconnue");
            }

            setPosts(result.data);
            console.log("Role :",role);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchPosts();
  }, []);

  const updatePostStatus = async (postID, status) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/update-post-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postID, status }),
      });
  
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du statut");
      }
  
      setPosts(prevPosts => prevPosts.filter(post => post.postID !== postID));

      setPendingCount(prev => prev - 1);
      if (status === "Accepted") {
        setAcceptedCount(prev => prev + 1);
      } else if (status === "Rejected") {
        setRejectedCount(prev => prev + 1);
      }
  
    } catch (err) {
      console.error("Erreur:", err);
    }
  };
  

useEffect(() => {
  Promise.all([
    fetch("http://localhost:5000/api/auth/pending-posts-count").then(res => res.json()),
    fetch("http://localhost:5000/api/auth/accepted-posts-count").then(res => res.json()),
    fetch("http://localhost:5000/api/auth/rejected-posts-count").then(res => res.json()) 
  ])
  .then(([pendingData, acceptedData, rejectedData]) => {
    console.log("Données reçues:", pendingData, acceptedData, rejectedData, role);
    
    setPendingCount(Number(pendingData.pendingCount) || 0);
    setAcceptedCount(Number(acceptedData.acceptedCount) || 0);
    setRejectedCount(Number(rejectedData.rejectedCount) || 0);
    
    setLoading(false);
  })
  .catch(err => {
    console.error("Erreur lors de la récupération des données:", err);
    setError("Impossible de récupérer les données.");
    setLoading(false);
  });
}, []);

useEffect(() => {
  fetch("http://localhost:5000/api/auth/all-posts-Day", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userID: "123" }) // استبدل بمعرف المستخدم الحقيقي
  })
    .then(res => res.json())
    .then(data => {
      console.log("Data received:", data); // تأكيد استقبال البيانات
      setLineData(prevData => ({
        ...prevData,
        labels: data.labels,
        datasets: [
          {
            ...prevData.datasets[0],
            data: data.data
          }
        ]
      }));
    })
    .catch(error => console.error("Error fetching data:", error));
}, []);

useEffect(() => {
  fetch("http://localhost:5000/api/auth/all-posts-Month", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userID: "123" }),
  })
    .then(res => res.json())
    .then(data => {
      console.log("Data received for monthly stats:", data);

      setBarData({
        labels: data.labels, // Mois
        datasets: [
          {
            label: "Requests per Month",
            data: data.data,
            backgroundColor: "#3F51B5",
          },
        ],
      });
    })
    .catch(error => console.error("Error fetching monthly data:", error));
}, []);

  const totalRequests = pendingCount + acceptedCount + rejectedCount;
  const approvedRate = totalRequests > 0 ? (acceptedCount / totalRequests) * 100 : 0;
  const rejectedRate = totalRequests > 0 ? (rejectedCount / totalRequests) * 100 : 0;


  const doughnutData = {
    labels: ["Approved", "Rejected", "Pending"],
    datasets: [
      {
        data: [acceptedCount, rejectedCount, pendingCount],
        backgroundColor: ["#4CAF50", "#F44336", "#FFC107"],
      },
    ],
  };

  const [lineData, setLineData] = useState({
    labels: [],
    datasets: [
      {
        label: "Requests per Day",
        data: [],
        borderColor: "rgba(33, 150, 243, 1)",
        backgroundColor: "rgba(33, 150, 243, 0.2)", 
        borderWidth: 3, 
        pointBackgroundColor: "white", 
        pointBorderColor: "rgba(33, 150, 243, 1)", 
        pointRadius: 6, 
        pointHoverRadius: 8, 
        tension: 0.4, 
        fill: true 
      }
    ]
  });
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "#333",
          font: {
            size: 14
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: "#555",
          font: {
            size: 13
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        ticks: {
          color: "#555",
          font: {
            size: 13
          },
          beginAtZero: true
        },
        grid: {
          color: "rgba(200, 200, 200, 0.2)"
        }
      }
    }
  };

  const [barData, setBarData] = useState({
    labels: [],
    datasets: [
      {
        label: "Requests per Month",
        data: [],
        backgroundColor: "#3F51B5",
      },
    ],
  });
  
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
    localStorage.removeItem("role");
    
    window.dispatchEvent(new Event("storage"));
  
    navigate("/");
    window.location.reload();
  };

  useEffect(()=>{
    const handleBeforeUnload = (event)=>{
      handleLogout();
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload",handleBeforeUnload);

    return ()=>{
      window.addEventListener("beforeunload",handleBeforeUnload);
    }
  },[]);


  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="logo-container">
          <span className='logo-text'>Homora</span>
        </div>
        <div className="section-container">
          <p className="admin-header-section" onClick={() => setStatsSection(true)}>{t('DashBoard_text')}</p>
          <p className="admin-header-section" onClick={() => setStatsSection(false)}>{t('Requests_text')}</p>
        </div>
        <div className="logOut-container" onClick={handleLogout}>
          <LogOut size={16}/>  
        </div>
      </div>
      {statsSection ? (
        <div className="stats-section-container">
          <div className="request-progress-section">
            <div className="request-section-first">
              <div className="progress-circle">
                <ProgressCircle reviewed={acceptedCount + rejectedCount} total={totalRequests} />
                <p> <strong>{acceptedCount + rejectedCount}</strong>/{totalRequests}</p>
              </div>
              <div className="request-summary">
                <h3>{t('Request_Summary')}</h3><hr className="hrr"/>
                <ul className="summary-list">
                  <li className="summary-item"><Combine /><span>{totalRequests}</span><p>{t('Total_text')}</p></li>
                  <li className="summary-item"><Check /><span>{acceptedCount}</span><p>{t('Approved_text')}</p></li>
                  <li className="summary-item"><LoaderIcon  /><span>{pendingCount}</span><p>{t('Pending_text')}</p></li>
                  <li className="summary-item"><XIcon /><span>{rejectedCount}</span><p>{t('Rejected_text')}</p></li>
                </ul>
              </div>
            </div>
            <div className="approval-rate">
              <h3>{t('Approval_Rejection_Rate')}</h3>
              <div className="progress-bar-admin">
                <div className="approved-bar" style={{ width: `${approvedRate}%` }}></div>
                <div className="rejected-bar" style={{ width: `${rejectedRate}%` }}></div>
              </div>
              <p>✅ {Math.round(approvedRate)}% {t('Approved_text')} | ❌ {Math.round(rejectedRate)}% {t('Rejected_text')}</p>
            </div>
          </div>
          <div className="charts-section">
            <div className="chart-row">
              <div className="chart-container">
                <h3>{t('Requests_Distribution')}</h3>
                <Doughnut data={doughnutData} />
              </div>
              <div className="chart-container">
                <h3 style={{ textAlign: "center", color: "#333", marginBottom: "15px" }}>{t('Requests_per_Day')}</h3>
                <Line data={lineData} options={options} />
              </div>
              <div className="chart-container">
                <h3>{t('Requests_per_Month')}</h3>
                <Bar data={barData}  />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="request-section">
          <h3 className="all-posts">{t('All_Posts')}</h3>
          {posts.length > 0 ? (
            posts.map(post => (
              <li 
                key={post.postID} 
                className="post-item" 
                onClick={() => navigate(`/post/${post.postID}`, { state: { from: location.pathname } })}
              >          
                <img src={post.pic1} alt={t('Post_Image')} className="post-image"  />
                <div className="post-details">
                  <p><strong> {post.state} </strong></p>
                  <p><strong> {post.price} </strong> </p>
                  <p><strong> {post.Muniplicyt}, {post.street} </strong> </p>
                </div>
                {!post.hideButtons && (
                  <div className="post-actions">
                    <button className="accept-button" onClick={(e) => { e.stopPropagation(); updatePostStatus(post.postID, "Accepted"); }}>
                      <FontAwesomeIcon icon={faCheck} /> {t('Accept_text')}
                    </button>
                    <button className="reject-button" onClick={(e) => { e.stopPropagation(); updatePostStatus(post.postID, "Rejected"); }}>
                      <FontAwesomeIcon icon={faTimes} /> {t('Reject_text')}
                    </button>
                  </div>
                )}
              </li>
            ))
          ) : (
            <p className="no-posts"> {t('No_Posts')}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Admin;