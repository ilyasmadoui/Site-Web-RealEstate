import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import "../styles/Home.scss";
import Homora from '../assets/images/Homora-image.png';
import Propertie from '../assets/images/houseImage.jpg';
import { Search } from "lucide-react"; 
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { fadeIn } from '../variants';
import Lottie from 'lottie-react';
import homeAnimation from '../assets/Animation - 1742770091651.json'
function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  const properties = [
    { name: "Owner 1", location: "Alger", price: '100.000,00', size: { length: '190m', wide: '200m' }, image: Propertie },
    { name: "Owner 2", location: "Biskra", price: '200.000,00', size: { length: '90m', wide: '1200m' }, image: Propertie },
    { name: "Owner 3", location: "Alger", price: '1.900.000,00', size: { length: '1900m', wide: '2000m' }, image: Propertie },
    { name: "Owner 3", location: "Alger", price: '1.900.000,00', size: { length: '1900m', wide: '2000m' }, image: Propertie },
    { name: "Owner 3", location: "Alger", price: '1.900.000,00', size: { length: '1900m', wide: '2000m' }, image: Propertie },
  ];

  const userID = localStorage.getItem("userID");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  useEffect(()=>{ 
    if(userID && token ){
      setIsUserLoggedIn(true);
    }
    if(role === 0) navigate("/admin");
  },[])

  /*<div className='search-section'>
         <motion.div 
          variants={fadeIn("up", 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.7 }}
          className='search-container'
        > 
         <h1>{t('search_title')}</h1>
          <div className="search-bar">
            <Search className="search-icon" size={22} />
            <input type='text' placeholder={t('search_placeholder')} className='inpt-search'/>
            <button className='btn-search'>{t('search_button')}</button>
        </div>
        </motion.div>
      </div>*/

  return (
    <div className='home-container'>
      
      <div className='first-section' id='Home'>
        <motion.div 
          variants={fadeIn("left", 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.7 }}
          className='img-container-homora'
        >
          <Lottie animationData={homeAnimation} loop = {true} />
        </motion.div>

        <motion.div 
          variants={fadeIn("left", 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.7 }}
          className='first-section-text'
        >
          <h1>{t('first_section_title')}</h1>
          <p>{t('first_section_desc')}</p>
          <div className='firstSection-btn-container'>
              <button className='btn-explore' onClick={() => navigate('/browse')}>{t('explore_button')}</button>
                {isUserLoggedIn && (
                              <button className='btn-explore'onClick={()=> navigate(`/profile/${userID}`)}>{t('profile-btn')}</button>
                                   )}
          </div>
        </motion.div>
      </div>

 <div className="subscription-section">
      <h2>{t('Subscription_Plans')}</h2>
      <div className="subscription-container">
        
        {/* Free Plan */}
        <div className="plan-card free-plan">
          <h3>{t('Free_Plan')}</h3>
          <ul>
            <li>✔ {t('Posting_Posts')}</li>
            <li>✔ {t('Browse_Properties')}</li>
            <li>✔ {t('Statistics_Overview')}</li>
            <li>✔ {t('Chat_Feature')}</li>
          </ul>
          <button disabled className="subscribe-btn">{t('Current_Plan')}</button>
        </div>

        {/* VIP Plan */}
        <div className="plan-card vip-plan">
          <h3>{t('VIP_Plan')}</h3>
          <ul>
            <li>✔ {t('Posting_Posts')}</li>
            <li>✔ {t('Browse_Properties')}</li>
            <li>✔ {t('Statistics_Overview')}</li>
            <li>✔ {t('Chat_Feature')}</li>
            <li>✔ {t('VIP_Section_in_Browse')}</li>
            <li>✔ {t('Posts_Always_Displayed_in_First_Line')}</li>
            <li>✔ {t('Notifications_Sent_to_All_Users_on_New_Post')}</li>
          </ul>
          <button className="subscribe-btn">{t('Upgrade_Now')}</button>
        </div>

      </div>
    </div>
    
      <motion.div 
        variants={fadeIn("up", 0.2)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.7 }}
        className='second-section'
      >
        <h1>{t('about_title')}</h1>
        <div className='section-container' id='about'>
        {t('about_points', { returnObjects: true })?.map((text, index) => (
            <motion.div 
              key={index}
              variants={fadeIn("down", 0.3 + index * 0.1)} 
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.7 }}
              className="section-box"
            >
              <p>{text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      <div className="cta-section">
        <h2>{t('cta_title')}</h2>
        <p>{t('cta_description')}</p>
        <button className="btn-signup" onClick={() => navigate('/Login')}>{t('cta_button')}</button>
      </div>
    </div>
  );
}

export default Home;
