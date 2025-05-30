import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import arLang from '../assets/images/ar.png';
import frLang from '../assets/images/fr.png';
import engLang from '../assets/images/eng.png';
import '../styles/Lang.scss';

function LangSelector() {
    const { i18n } = useTranslation();
    const [selectedLang, setSelectedLang] = useState(localStorage.getItem("language") || "en");
    const [isOpen, setIsOpen] = useState(false);
    const langs = [
        { lang: "ar", pic: arLang },
        { lang: "fr", pic: frLang },
        { lang: "en", pic: engLang }
    ];

    useEffect(() => {
        i18n.changeLanguage(selectedLang);
    }, [selectedLang, i18n]);

    const toggleLangMenu = () => {
        setIsOpen(!isOpen);
    };

    const selectLanguage = (lang) => {
        setSelectedLang(lang);
        localStorage.setItem("language", lang);
        i18n.changeLanguage(lang);
        setIsOpen(false);
    };

    return (
        <div className={`langs-container ${isOpen ? 'open' : ''}`} onClick={toggleLangMenu}>
            <div className='selected-lang'>
                <img src={langs.find(l => l.lang === selectedLang)?.pic} alt={selectedLang} />
            </div>
            <ul className={`langs-list ${isOpen ? 'visible' : ''}`}>
                {langs.filter(l => l.lang !== selectedLang).map((lang, index) => (
                    <li key={index} className='lang' onClick={() => selectLanguage(lang.lang)}>
                        <img src={lang.pic} alt={lang.lang} />
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default LangSelector;
