import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Upload, User, Home, Image, CheckCircle } from 'lucide-react';
import '../styles/Create.scss';

function Create({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [images, setImages] = useState([]);
  const [hoveredStep, setHoveredStep] = useState(null);
  const [typeProduct, setTypeProduct] = useState('');
  const [showStatusPanel, setShowStatusPanel] = useState(false)

  const token = localStorage.getItem("token");
  const userID = localStorage.getItem("userID");

  const [dataForm, setDataForm] = useState({
    ownerID: user.id,
    phoneNum: user.phoneNum,
    email: user.email,
    state: "",
    municipality: "",
    street: "",
    width: "",
    height: "",
    price: ""
  });

  const stepIcons = [User, Home, Image, CheckCircle];

  const handleSubmit = async () => {
    if (step < 3) {
      setStep(step + 1);
      setPrevButtonDisable(false); 
      return;
    }else{
      setShowStatusPanel(true)
    }

    const formData = new FormData();
    formData.append("ownerID", dataForm.ownerID);
    formData.append("phoneNum", dataForm.phoneNum);
    formData.append("email", dataForm.email);
    formData.append("state", dataForm.state);
    formData.append("municipality", dataForm.municipality);
    formData.append("street", dataForm.street);
    formData.append("type_product", typeProduct);
    formData.append("width", dataForm.width);
    formData.append("height", dataForm.height);
    formData.append("price", dataForm.price);
    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const response = await fetch("http://localhost:5000/api/auth/create", {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await response.json();
    } catch (error) {
      console.error("Failed to submit post:", error);
      alert("Failed to create post. Please try again.");
    }
  };

  const handleImageUpload = (event) => {
    if (images.length < 4) {
      const files = Array.from(event.target.files).slice(0, 4 - images.length);
      setImages([...images, ...files]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDataForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
      setPrevButtonDisable(step - 1 === 0);
    } 
  };

  const stepTitles = [
    t('steps.ownerInfo'),
    t('steps.propertyInfo'),
    t('steps.uploadImages'),
    t('steps.submitInfo')
  ];

  return (
    <div className='create-container'>
      <h1>{t('createTitle')}</h1>
      <div className='progress-bar'>
        <div className='progress-line'>
          <div className='filled' style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>
        {[1, 2, 3, 4].map((num, index) => {
          const Icon = stepIcons[index];
          return (
          <div
            key={index}
            className={`step-circle ${step >= index ? 'active' : ''}`}
            onMouseEnter={() => setHoveredStep(index)}
            onMouseLeave={() => setHoveredStep(null)}
          >
            <Icon size={20} />
            {hoveredStep === index && (
              <div className='tooltip'>{t('step')} {num}: {stepTitles[index]}</div>
            )}
          </div>
          );
        })}
      </div>
      <p className='step-info'>{t('step')} {step + 1}: {stepTitles[step]}</p>

      <div className='form-sections'>
        {step === 0 && (
          <div className='owner-input'>
            <h1>{t('steps.ownerInfo')}</h1>
            <input type='text' required placeholder={t('placeholders.fullName')} value={user.fullName} disabled />
            <input type='tel' name='phoneNum' required placeholder={t('placeholders.phone')} value={dataForm.phoneNum} onChange={handleChange} />
            <input type='email' name='email' required placeholder={t('placeholders.email')} value={dataForm.email} onChange={handleChange} />
          </div>
        )}

        {step === 1 && (
          <div className='propertie-input'>
            <h1>{t('steps.propertyInfo')}</h1>
            <input type='text' required placeholder={t('placeholders.state')} name="state" value={dataForm.state} onChange={handleChange} />
            <input type='text' required placeholder={t('placeholders.townHall')} name="municipality" value={dataForm.municipality} onChange={handleChange} />
            <input type='text' required placeholder={t('placeholders.street')} name="street" value={dataForm.street} onChange={handleChange} />
            
            <div className='measure-container'>
            <select id="typeProduct"required placeholder={t('type_product')} name="type_product" value={typeProduct} onChange={(e) => setTypeProduct(e.target.value)}>
                <option value="">{t("Choose_type")}</option>
                <option value="House">{t("House")}</option>
                <option value="Land">{t("Land")}</option>
                <option value="Company">{t("Company")}</option>
                <option value="Other">{t("Other")}</option>
            </select>
              <input type='number' required placeholder={t('placeholders.height')} name="height" value={dataForm.height} onChange={handleChange} />
              <input type='number' required placeholder={t('placeholders.width')} name="width" value={dataForm.width} onChange={handleChange} />
              <input type='text' required placeholder='10000.00Da' name="price" value={dataForm.price} onChange={handleChange} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className='image-upload'>
            <label htmlFor="file-input"><Upload size={18} /> {t('uploadPrompt')}</label>
            <input id="file-input" type='file' accept='image/*' multiple onChange={handleImageUpload} />
            <p>{images.length} / 4 {t('imagesUploaded')}</p>
            <div className='image-preview'>
              {images.map((img, index) => (
                <img key={index} src={URL.createObjectURL(img)} alt='Preview' />
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className='submit-info'>
            <h1>{t('steps.submitInfo')}</h1>
            <p>{t('submitMessage')}</p>
          </div>
        )}
      </div>
      <div className="btns-container">
    <button className="submit-btn" onClick={handleSubmit}>
      {step < 3 ? <ArrowRight size={20} /> : t("submit")}
    </button>
    <button className="back-button" onClick={handlePrev} disabled={step <= 0}>
      <ArrowLeft size={20} />
    </button>

    {showStatusPanel && (
      <div className="Info-Panel">
      <button className="closeContact-btn" onClick={() => setShowStatusPanel(false)}>x</button>
      <h1 style={{ color: "lightblue", fontWeight: 700 }}>{t('Post_Created')}</h1>
      <p style={{ color: "white", fontWeight: 900 }}>{t('Post_Created_Message')}</p>
    </div>    
    )}
  </div>
    </div>
  );
}

export default Create;
