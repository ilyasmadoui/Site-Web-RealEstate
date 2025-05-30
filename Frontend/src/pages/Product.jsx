import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, LogOut, MapPin, Home, Phone, Mail, Ruler, DollarSign, User, SendIcon, MessageCircle } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import EmptyImage from "../assets/images/emptyImagePlaceHolder.png";
import EmptyProfilePicture from '../assets/images/noProfilePicture.png'
import "../styles/Product.scss";
import { faSave, faEdit, faHouse, faUserTie, faL } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Product() {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === "ar";  

    const { postID } = useParams();
    const navigate = useNavigate();
    const [isEditPanelOpen, setEditPanelOpen] = useState(false);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showContact, setShowContact] = useState(false);
    const [error, setError] = useState(null);
    const [imageSelected, setImageSelected] = useState(EmptyImage);
    const [isItOwner, setIsItOwner] = useState(false);
    const [requestMessage, setRequestMessage] = useState("");
    const [messageRequestState, setMessageRequestState] = useState("Initial text context");
    const [showInfoPanel,setShowInfoPanel] = useState(false);

    const location = useLocation();
    const previousPage = location.state?.from || "unknown";
    const cameFromProfile = previousPage.startsWith("/profile/");

    const userID = localStorage.getItem("userID");
    const token = localStorage.getItem("token")
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/auth/post/${postID}`);
                if (!response.ok) throw new Error("Failed to fetch product");
                const data = await response.json();

                console.log("Product data:", data);

                const formattedProduct = {
                    id: data.postID,
                    ownerID: data.ownerID,
                    price: data.price || "N/A",
                    owner: data.fullName || "Unknown",
                    phoneNum: data.phoneNum || "Not Provided",
                    email: data.email || "Not Provided",
                    state: data.state || "UNKNOWN",
                    Muniplicity: data.Muniplicyt || "UNKNOWN",
                    Rue: data.street || "N/A",
                    measures: {
                        x: data.width || 0,
                        y: data.height || 0
                    },
                    images: data.images.length ? data.images : [EmptyImage],
                    ownerImage : data.userImage
                };

                setProduct(formattedProduct);
                setImageSelected(formattedProduct.images[0]);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [postID]);

    const handleEdit = () => {
        setEditPanelOpen(true);
    };

    const handleCancel = () => {
        setEditPanelOpen(false);
    };

    useEffect(() => {
        if (product && ((userID === product.ownerID) || cameFromProfile)) {
            setIsItOwner(true);
        }
    }, [cameFromProfile, userID, product]); 
    

    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append("ownerID", product.ownerID);
            formData.append("phoneNum", product.phoneNum);
            formData.append("email", product.email);
            formData.append("state", product.state);
            formData.append("municipality", product.Muniplicity);
            formData.append("street", product.Rue);
            formData.append("width", product.measures.x);
            formData.append("height", product.measures.y);
            formData.append("price", product.price);

            if (product.images && product.images.length > 0) {
                product.images.forEach((image) => {
                    formData.append("images", image);
                });
            }

            const response = await fetch(`http://localhost:5000/api/auth/update/${postID}`, {
                method: "PUT",
                body: formData,
            });

            if (!response.ok) throw new Error(t("update_error"));

            alert(t("update_success"));
            setEditPanelOpen(false);
        } catch (err) {
            alert(t("update_error") + ": " + err.message);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(t("confirm_delete"))) return;

        try {
            const response = await fetch(`http://localhost:5000/api/auth/delete/${postID}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error(t("delete_error"));

            alert(t("delete_success"));
            navigate(`/profile/${product.ownerID}`);
        } catch (err) {
            alert(t("delete_error") + ": " + err.message);
        }
    };


    const handleMessageRequest = async ()=>{
        const RequestObject = {
            senderID: userID, 
            receiverD : product.ownerID,
            context : requestMessage }

        try {
                const response = await fetch("http://localhost:5000/api/auth/addNotif",{
                    method : "POST",
                    headers: { 
                        "Content-Type": "application/json", 
                        "Authorization": `Bearer ${token}` 
                    },
                    body: JSON.stringify(RequestObject) 
                });

                const result = await response.json();
                if(!response.ok) {
                    setMessageRequestState("An error has occured durring the Message Request sending ! , please try again later");
                    setShowInfoPanel(true)
                }
                else{
                    setMessageRequestState("Message request was sent succsefully");
                    setShowInfoPanel(true)
                }
            }
         catch (error) {
            setMessageRequestState("An error has occured durring the Message Request sending ! , please try again later");
            setShowInfoPanel(true)
            console.log(error);
        }
    }

    const handleExit =()=>{
        if(location.state?.from){
         navigate(location.state.from)
        }else{
            navigate("/browse")
        }
    }

    if (loading) return <p>Loading product details...</p>;
    if (error) return <p>{t("error")}: {error}</p>;
    if (!product) return <p>Product not found</p>;

    return (
        <div className="page-container">
            {isEditPanelOpen && (
                <div className="edit-panel-overlay">
                    <div className="edit-panel">
                        <h2>{t("edit_product")}</h2>
                        <label><DollarSign size={16} /> {t("price")}: <input type="number" value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} /></label>
                        <label><MapPin size={16} /> {t("state")}: <input type="text" value={product.state} onChange={(e) => setProduct({ ...product, state: e.target.value })} /></label>
                        <label><Home size={16} /> {t("municipality")}: <input type="text" value={product.Muniplicity} onChange={(e) => setProduct({ ...product, Muniplicity: e.target.value })} /></label>
                        <label><Home size={16} /> {t("street")}: <input type="text" value={product.Rue} onChange={(e) => setProduct({ ...product, Rue: e.target.value })} /></label>
                        <label><User size={16} /> {t("owner")}: <input type="text" value={product.owner} onChange={(e) => setProduct({ ...product, owner: e.target.value })} /></label>
                        <label><Phone size={16} /> {t("phone_number")}: <input type="text" value={product.phoneNum} onChange={(e) => setProduct({ ...product, phoneNum: e.target.value })} /></label>
                        <label><Mail size={16} /> {t("email")}: <input type="email" value={product.email} onChange={(e) => setProduct({ ...product, email: e.target.value })} /></label>
                        <label><Ruler size={16} /> {t("measures")}: 
                            <input type="number" placeholder={t("width")} value={product.measures.x} onChange={(e) => setProduct({ ...product, measures: { ...product.measures, x: e.target.value } })} />
                            <input type="number" placeholder={t("height")} value={product.measures.y} onChange={(e) => setProduct({ ...product, measures: { ...product.measures, y: e.target.value } })} />
                        </label>
                        <button className="btn save-btn" onClick={handleSave}><FontAwesomeIcon icon={faSave} /> {t("save")}</button>
                        <button className="btn cancel-btn" onClick={handleCancel}><LogOut size={17} /> {t("cancel")}</button>
                    </div>
                </div>
            )}
    
            <div className="product-container" style={{ 
                direction: isArabic ? "rtl" : "ltr", 
                display: "flex", 
                flexDirection: isArabic ? "row-reverse" : "row" 
            }}>
                <div className="details">
                    <div className='product-info'>
                        <h3>{t("property_info")} <FontAwesomeIcon icon={faHouse}/>:</h3>
                        <p><DollarSign size={16} /> <strong>{t("price")}:</strong> {product.price.toLocaleString()}Da</p>
                        <p><Ruler size={16} /> <strong>{t("measures")}:</strong> {product.measures.x}m x {product.measures.y}m</p>
                        <p>
                            <MapPin size={16} /> <strong>{t("location")}:</strong>{" "}
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    `${product.state}, ${product.Muniplicity}, ${product.Rue}`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: "none", color: "blue" }}
                                     >
                                    {product.state} // {product.Muniplicity} // {product.Rue}
                                </a>    
                        </p>
                    </div>
                    <div className='owner-info'>
                        <h3>{t("owner_info")} <FontAwesomeIcon icon={faUserTie}/>:</h3>
                        <p><User size={16} /> <strong>{t("owner")}:</strong> {product.owner}</p>
                        <p><Phone size={16} /> <strong>{t("phone_number")}:</strong> {product.phoneNum}</p>
                        <p><Mail size={16} /> <strong>{t("email")}:</strong> {product.email}</p> 
                    </div>
                </div>
                <div className="image-section">
                    <img className="main-image" src={imageSelected} alt="Main Property" />
                    <div className="image-preview">
                        {product.images.map((img, index) => (
                            <img 
                                key={index} 
                                src={img} 
                                alt={`Property preview ${index + 1}`}
                                tabIndex="0"
                                onClick={() => setImageSelected(img)} 
                            />                    
                        ))}
                    </div>
                </div>
            </div>
            
            <div className='btn-container' style={{ flexDirection: isArabic ? "row-reverse" : "row" }}>
                {isItOwner ? (
                    <>
                        <button className="btn cancel-btn" onClick={() => navigate(`/profile/${product.ownerID}`)}>
                            <LogOut size={17} /> {t("exit")}
                        </button>
                        <button className="btn edit-btn" onClick={handleEdit}>
                            <FontAwesomeIcon icon={faEdit} /> {t("edit")}
                        </button>
                        <button className="btn del-btn" onClick={handleDelete}>
                            <Trash2 size={17} /> {t("delete")}
                        </button>
                    </>
                ) : (
                    <>
                        <button className="btn exit-btn" onClick={handleExit} style={{ backgroundColor: "#dc3545", color: "white" }}><LogOut size={16} /> {t("exit")}</button>
                        <button className="btn contact-btn" onClick={()=> setShowContact(true)} style={{ backgroundColor: "#28a745", color: "white" }}><MessageCircle size={16} /> {t("contact")}</button>
                    </>
                )}
            </div>
            {showContact && (
                <div className="contact-section-container">
                        <div className="contact-container">
                        <button className="closeContact-btn" onClick={()=> setShowContact(false)}>x</button>
                        <div className="img-container">
                            <img src={product.ownerImage || EmptyProfilePicture} alt="Owner Image" />
                        </div>
                        <h2>{product.owner || "Unkown"}</h2>
                        <div className="contact-msg-container">
                            <input placeholder={t('Enter_your_message')}  onChange={(e) => setRequestMessage(e.target.value)} />
                            <button onClick={handleMessageRequest}><SendIcon size={10}/></button>
                        </div>
                        </div>
                </div>
            )}
            {
                showInfoPanel && (
                    <div className="Info-Panel">
                    <button className="closeContact-btn" onClick={()=>{
                        setShowInfoPanel(false)
                        setShowContact(false)
                    }}>x</button>
                              <h1>{t('message_status')}</h1>
                            <p>{messageRequestState}</p>
                    </div> 
                )
            }
           
        </div>
    );
    
}

export default Product;
