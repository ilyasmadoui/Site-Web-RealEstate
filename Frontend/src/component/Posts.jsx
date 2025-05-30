import React, { useState, useEffect } from "react";
import "../styles/Posts.scss";
import { useTranslation } from "react-i18next";
import { useNavigate , useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, MapPin, Home, DollarSign, Landmark, Tag, Calendar } from "lucide-react";
import defaultPic from '../assets/images/emptyImagePlaceHolder.png';

function Posts({ user }) {
  const { t , i18n} = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isArabic = i18n.language === "ar";  
  const pageRows = 3;
  const cardsPerRow = 4;

  useEffect(() => {
    if (!user?.id) return;
  
    const fetchPosts = async () => {
      try {
        console.log("Fetching posts for ownerID:", user.id);
        const response = await fetch(`http://localhost:5000/api/auth/posts?ownerID=${encodeURIComponent(user.id)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        if (!response.ok) {
          throw new Error(t('posts_not_available'));
        }
  
        const result = await response.json();
        console.log("Fetched posts data:", result);
  
        if (result.error) {
          throw new Error(result.error);
        }
  
        setPosts(result.data.map(post => ({
          ...post,
          created_at: post.created_at ? new Date(post.created_at).toLocaleDateString() : "N/A"
        })));

      } catch (error) {
        console.error("Failed to fetch posts:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchPosts();
  }, []);
  
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!posts.length) {
    return <div className="no-posts">{t("no_posts_text")}</div>;
  }

  const totalPage = Math.max(1, Math.ceil(posts.length / pageRows)); 
  const startIndex = (currentPage - 1) * pageRows;
  const currentPageData = posts.slice(startIndex, startIndex + pageRows);

  const rows = [];
  for (let i = 0; i < currentPageData.length; i += cardsPerRow) {
    rows.push(currentPageData.slice(i, i + cardsPerRow));
  }

  const handleDelete = async (postID) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;
  
    try {
      const response = await fetch(`http://localhost:5000/api/auth/delete/${postID}`, {
        method: "DELETE",
      });
  
      if (!response.ok) throw new Error("Failed to delete post");

      alert("Post deleted successfully");
      setPosts((prevPosts) => prevPosts.filter((post) => post.postID !== postID));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };
  

  return (
    <div className="posts-container">
      <h1>{t("posts_container_title")}</h1>

      {rows.map((row, rowIndex) => (
  <div key={rowIndex} className="posts-row" style={{ 
    direction: isArabic ? "rtl" : "ltr", 
    display: "flex", 
    flexDirection: isArabic ? "row-reverse" : "row" 
  }}>
    {row.map((item) => (
      <div key={item.postID} className="post-card">
        <button className="delete-btn" onClick={() => handleDelete(item.postID)}>
          ✖
        </button>
        <img
          src={item.pic1 && item.pic1.trim() !== "" ? item.pic1 : defaultPic} 
          alt="property pic"
          onError={(e) => (e.target.src = defaultPic)} 
        />
        <div className="post_info">
        <p>{t('Type')} : <strong >{item.type_product || "N/A"}</strong></p> 
          <p>{t('muniplicit_text')} : <strong>{item.Muniplicyt || "N/A"}</strong></p>
          <p>{t('state_text')} : <strong>{item.state || "N/A"}</strong></p>
          <p>{t('street_text')} : <strong>{item.street || "N/A"}</strong></p>
          <p>{t('price_text')} : <strong>{item.price? `${item.price.toLocaleString()}` : "N/A"} {t('Da')}</strong></p>
          <p>{t('Date')} : <strong>{item.created_at}</strong> </p>
        </div>
        <button className="post-btn" 
          onClick={() => navigate(`/post/${item.postID}`, { state: { from: location.pathname } })}>
          {t("details_btn_text")}
        </button>
      </div>
    ))}
  </div>
))}
    <div className="pagination">
  <button
    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
  >
    <ArrowLeft size={20} />
  </button>
  <span>
    {t('Page')} {currentPage} {t('of')} {totalPage}
  </span>
  {currentPage < totalPage && (
    <button
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPage))}
      disabled={currentPage === totalPage}
    >
       <ArrowRight size={20} />
    </button>
  )}
</div>
    </div>
  );
}

export default Posts;
