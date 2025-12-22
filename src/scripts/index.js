import { initialCards } from "./cards.js";
import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

const validationConfig = {
    formSelector: '.popup__form',
    inputSelector: '.popup__input',
    submitButtonSelector: '.popup__button',
    inactiveButtonClass: 'popup__button_disabled',
    inputErrorClass: 'popup__input_type_error',
    errorClass: 'popup__error_visible'
};

function initApp() {
    const profileEditButton = document.querySelector('.profile__edit-button');
    const profileAddButton = document.querySelector('.profile__add-button');
    const profileImage = document.querySelector('.profile__image');
    
    const profilePopup = document.querySelector('.popup_type_edit');
    const cardPopup = document.querySelector('.popup_type_new-card');
    const imagePopup = document.querySelector('.popup_type_image');
    const avatarPopup = document.querySelector('.popup_type_edit-avatar');
    
    const profileForm = profilePopup.querySelector('.popup__form');
    const cardForm = cardPopup.querySelector('.popup__form');
    const avatarForm = avatarPopup.querySelector('.popup__form');
    
    const nameInput = profileForm.querySelector('.popup__input_type_name');
    const jobInput = profileForm.querySelector('.popup__input_type_description');
    const avatarInput = avatarForm.querySelector('.popup__input_type_avatar');
    
    const profileName = document.querySelector('.profile__title');
    const profileJob = document.querySelector('.profile__description');
    const profileAvatar = document.querySelector('.profile__image');
    
    const placesList = document.querySelector('.places__list');
    const imageInPopup = imagePopup.querySelector('.popup__image');
    const captionInPopup = imagePopup.querySelector('.popup__caption');
    
    function openImagePopup(name, link) {
        imageInPopup.src = link;
        imageInPopup.alt = name;
        captionInPopup.textContent = name;
        openModalWindow(imagePopup);
    }
    
    function handleProfileFormSubmit(evt) {
        evt.preventDefault();
        profileName.textContent = nameInput.value;
        profileJob.textContent = jobInput.value;
        closeModalWindow(profilePopup);
    }
    
    function handleCardFormSubmit(evt) {
        evt.preventDefault();
        const name = cardForm.querySelector('.popup__input_type_card-name').value;
        const link = cardForm.querySelector('.popup__input_type_url').value;
        
        const newCard = createCardElement(
            { name, link },
            {
                onPreviewPicture: () => openImagePopup(name, link), 
                onLikeIcon: likeCard,                               
                onDeleteCard: deleteCard                            
            }
        );
        
        placesList.prepend(newCard);
        cardForm.reset();
        closeModalWindow(cardPopup);
    }
    
    function handleAvatarFormSubmit(evt) {
        evt.preventDefault();
        profileAvatar.style.backgroundImage = `url(${avatarInput.value})`;
        avatarForm.reset();
        closeModalWindow(avatarPopup);
    }
    
    profileEditButton.addEventListener('click', () => {
        if (!profileForm) {
            console.error('Форма профиля не найдена!');
            return;
        }
        nameInput.value = profileName.textContent;
        jobInput.value = profileJob.textContent;
        clearValidation(profileForm, validationConfig);
        openModalWindow(profilePopup);
    });
    
    profileAddButton.addEventListener('click', () => {
        cardForm.reset();
        clearValidation(cardForm, validationConfig);
        openModalWindow(cardPopup);
    });
    
    profileImage.addEventListener('click', () => {
        avatarForm.reset();
        clearValidation(avatarForm, validationConfig);
        openModalWindow(avatarPopup);
    });
    
    profileForm.addEventListener('submit', handleProfileFormSubmit);
    cardForm.addEventListener('submit', handleCardFormSubmit);
    avatarForm.addEventListener('submit', handleAvatarFormSubmit);
    
    initialCards.forEach(cardData => {
        const cardElement = createCardElement(
            cardData,
            {
                onPreviewPicture: () => openImagePopup(cardData.name, cardData.link),
                onLikeIcon: likeCard,                                                   
                onDeleteCard: deleteCard                                                
            }
        );
        placesList.append(cardElement);
    });
    
    [profilePopup, cardPopup, imagePopup, avatarPopup].forEach(popup => {
        setCloseModalWindowEventListeners(popup);
    });
    
    enableValidation(validationConfig);
}

document.addEventListener('DOMContentLoaded', initApp);
