import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/Favorite.scss';

import { useNavigate , useLocation } from 'react-router-dom';
export default function Favorite() {
  const [favsPosts, setFavPosts] = useState([]);
  const [isFavsEmpty, setIsFavsEmpty] = useState(false);
  const userID = localStorage.getItem("userID");
  const token = localStorage.getItem("token");

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchProfileFetch = async () => {
      try {
        const result = await fetch(`http://localhost:5000/api/auth/favsPosts/${userID}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
  
        if (!result.ok) {
          console.log("Fetch error has occurred for favs in profile");
          setIsFavsEmpty(true);
          return;
        }
  
        const responseData = await result.json();
        console.log("API Response:", responseData);
  
        // Check if data is an empty array
        if (!responseData.data || responseData.data.length === 0) {
          setIsFavsEmpty(true);
          setFavPosts([]); 
          console.log("isFavsEmpty:", isFavsEmpty);
          console.log("favsPosts:", favsPosts);

          return;
        }
  
        setFavPosts(responseData.data);
        setIsFavsEmpty(false); 
        console.log("isFavsEmpty:", isFavsEmpty);
        console.log("favsPosts:", favsPosts);

  
      } catch (error) {
        console.log("Fetch Error:", error);
      }
    };
  
    fetchProfileFetch();
  }, [userID, token]);
  
  

  return (
    <div className="favorite-container">
      <div className="header">{t('Favorite_list_header')}</div>
      {isFavsEmpty ? (
        <div className="empty-message">{t('posts_not_available')}</div>
      ) : (
        <div className="favorite-list">
          {favsPosts.map((post) => (
            <div className="fav-card" key={post.postID} onClick={() => navigate(`/post/${post.postID}`, { state: { from: "/browse" } })}>
              <img className="fav-img" src={post.pic1} alt={post.Muniplicyt} />
              <div className="fav-info">
                <h3>{post.Muniplicyt}</h3>
                <div className="price">{post.price.toLocaleString()}Da</div>
                <div className="location">{post.street}, {post.state}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
