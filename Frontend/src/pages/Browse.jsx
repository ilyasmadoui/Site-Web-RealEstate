import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import noProfilePicture from '../assets/images/emptyImagePlaceHolder.png';
import HomeBluePrint from '../assets/images/home-blueprints.jpeg';
import landBluePrint from '../assets/images/lands-bluePrint.jpg';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, MapPin, Home, DollarSign, Landmark, Calendar, Heart, FilterIcon } from "lucide-react";
import { useNavigate , useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/Browse.scss';

function Browse() {
  const { t, i18n } = useTranslation();

  const categories = [
    { title: t('houses_title'), description: t('findYourDreamHome'), img: HomeBluePrint },
    { title: t('lands_title'), description: t('exploreAvailableLands'), img: landBluePrint },
  ];

   const [currentPage, setCurrentPage] = useState(1);
   const [posts, setPosts] = useState([]); 
   const [loading, setLoading] = useState(false); 
   const [error, setError] = useState(null);
   const [showStatusPanel, setShowStatusPanel] = useState(false);
   const [statusMessage, setStatusMessage] = useState("");
   const [favoritePosts, setFavoritePosts] = useState({}); 
   
   const navigate = useNavigate();
   const userID = localStorage.getItem("userID");
   const token = localStorage.getItem("token");

   useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("Before fetching...");
  
        const response = await fetch("http://localhost:5000/api/auth/all-posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userID })
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
  
        const result = await response.json();
        console.log("All posts fetch result:", result);
  
        setPosts(result.data || []);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        setError("Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  

   const formatPostDate = (postDate) => {
    if (!postDate) return "Date inconnue"; 
  
    const postDateObj = new Date(postDate);
    if (isNaN(postDateObj)) return "Date inconnue";
  
    const today = new Date();
    
    postDateObj.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
  
    const differenceInDays = Math.floor((today - postDateObj) / (1000 * 60 * 60 * 24));
  
    if (differenceInDays === 0) {
      return "Aujourd'hui";
    } else if (differenceInDays === 1) {
      return "Il y a 1 jour";
    } else if (differenceInDays < 7) {
      return `Il y a ${differenceInDays} jours`;
    } else if (differenceInDays < 14) {
      return "Il y a une semaine";
    } else {
      return "Il y a plus d'une semaine";
    }
  };
   
   const pageRows = 5;
   const cardsPerRow = 5;
 
   const totalPage = Math.max(1, Math.ceil(posts.length / pageRows));
   const startIndex = (currentPage - 1) * pageRows;
   const currentPageData = posts.slice(startIndex, startIndex + pageRows);
 
   const rows = [];
   for (let i = 0; i < currentPageData.length; i += cardsPerRow) {
     rows.push(currentPageData.slice(i, i + cardsPerRow));
   }
 
   useEffect(() => {
    const fetchFavs = async () => {
      try {
        const result = await fetch(`http://localhost:5000/api/auth/getFavorites/${userID}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
  
        if (!result.ok) {
          console.log("Favs fetch Error");
          return;
        }
  
        const response = await result.json();
        
        const favPosts = response.data.reduce((acc, postID) => {
          acc[postID] = "red";  
          return acc;
        }, {});
  
        setFavoritePosts(favPosts);
      } catch (error) {
        console.error("Error fetching favorite posts:", error);
      }
    };
  
    fetchFavs();
  }, [userID, token]);
  

   const handleToggleFavorite = async (postID) => {

    const isCurrentlyFavorite = favoritePosts[postID] === "red";
  
    setFavoritePosts((prevFavorites) => ({
      ...prevFavorites,
      [postID]: isCurrentlyFavorite ? "white" : "red",
    }));
  
    const requestBody = { userID, postID };
  
    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/${isCurrentlyFavorite ? "deleteFromFavorite" : "insertToFavorite"}`,
        {
          method: isCurrentlyFavorite ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        setStatusMessage(data.Message || t("message_error"));

        setFavoritePosts((prevFavorites) => ({
          ...prevFavorites,
          [postID]: isCurrentlyFavorite ? "red" : "white",
        }));
      } else {
        setStatusMessage(isCurrentlyFavorite ? t("favorite_deleted_message") : t("favorite_added_message"));
      }
  
      setShowStatusPanel(true);
    } catch (error) {
      setStatusMessage(t("message_error"));
      setShowStatusPanel(true);
      
      setFavoritePosts((prevFavorites) => ({
        ...prevFavorites,
        [postID]: isCurrentlyFavorite ? "red" : "white",
      }));
    }
  };

  return (
    <div className="browse-container">
        <div className="options-section">
        <h2>{t('categorie_title')}</h2>
        <div className="options-container">
          {categories.map((option, index) => (
            <div className={`category-row ${index % 2 === 0 ? 'row-reverse' : ''}`} key={index}>
              <div className="text-content">
                <h3>{option.title}</h3>
                <p>{option.description}</p>
              </div>
              <div className="option-card" style={{ backgroundImage: `url(${option.img})` }}>
                <div className="overlay">
                  <img src={option.img} alt={option.title} />
                </div>
              </div>
            </div>
          ))}

        <div className="contact-panel suggest-category">
                  <div className="description">
                  <h3>{t('description_title')}</h3>
                  <p>{t('descritption_context')}</p>
        </div>
  <div className="input-section">
    <input 
      type="text" 
      placeholder={t('suggest-placeholder')} 
      className="suggestion-input"
    />
    <button className="submit-btn">{t('subm-btn')}</button>
  </div>
</div>
        </div>
      </div>
      <div className="products-container" id="products-container">
        <h2>{t('product_list_title')}</h2>
          {userID === null ? (
              <h3 className="no-posts">{t('SignUpRequest')}</h3>
          ) : rows.length === 0 ? (
            <h3 className="no-posts">{t('No_Offers_to_be_displayed')}</h3>
          ) : null}
        {rows.map((row, index) => (
          <div className="browse-row" key={index}>
            {row.map((item) => (
              <div className="product-card" key={item.postID}>
                   <div className="card-header">
                          <div className='favorite-icon'>
                          <Heart 
                                size={20} 
                                fill={favoritePosts[item.postID] === "red" ? "red" : "white"}
                                onClick={() => handleToggleFavorite(item.postID)}
                          />;
                          </div>
                          <div className='date-text'>{formatPostDate(item.created_at)}</div>
                    </div>
                <img
                  src={item.pic1 || noProfilePicture}
                  alt="property pic"
                />
                <div className="post_info">
                  <div className="info-row">
                    <p className="title"><MapPin size={16} color="#cccccc" /> {t('state_text')}</p>
                    <p className="text">{item.state}</p>
                  </div>
                  <div className="info-row">
                    <p className="title"><Landmark size={16} color="#cccccc" /> {t('muniplicit_text')}</p>
                    <p className="text">{item.Muniplicyt}</p>
                  </div>
                  <div className="info-row">
                    <p className="title"><Home size={16} color="#cccccc" /> {t('street_text')}</p>
                    <p className="text">{item.street}</p>
                  </div>
                  <div className="info-row">
                    <p className="title"><DollarSign size={16} color="#cccccc" /> {t('price_text')}</p>
                    <p className="price">{item.price.toLocaleString()}Da</p>
                  </div>
                </div>
                <button
                  className="det-btn"
                  onClick={() => navigate(`/post/${item.postID}`, { state: { from: "/browse" } })}>
                  <FontAwesomeIcon icon={faArrowLeft} /> {t('det_btn_text')}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="pagination">
  <button
    onClick={() => {
      setCurrentPage((prev) => Math.max(prev - 1, 1));
      document.getElementById("products-container")?.scrollIntoView({ behavior: "smooth" });
    }}
    disabled={currentPage === 1}
  >
    <ArrowLeft size={20}  />
  </button>

  <span>{t('Page')} {currentPage} {t('of')} {totalPage}</span>

  <button
    onClick={() => {
      setCurrentPage((prev) => Math.min(prev + 1, totalPage));
      document.getElementById("products-container")?.scrollIntoView({ behavior: "smooth" });
    }}
    disabled={currentPage === totalPage}
  >
    <ArrowRight size={20} />
  </button>
</div>

{showStatusPanel && (
                <div className="Info-Panel">
                    <button className="closeContact-btn" onClick={() => setShowStatusPanel(false)}>x</button>
                    <h1>{t('notifications_status')}</h1>
                    <p>{statusMessage}</p>
                </div>
            )}

    </div>
  );
}

export default Browse;
