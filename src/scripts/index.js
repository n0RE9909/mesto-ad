import api from './components/api.js';
import { createCardElement } from './components/card.js';
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from './components/modal.js';
import { enableValidation, clearValidation } from './components/validation.js';

const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

let userId = null;

function initApp() {
  function openStatisticsPopup() {
    const statsPopup = document.querySelector('.popup_type_info');
    
    const infoList = statsPopup.querySelector('.popup__info');
    const userList = statsPopup.querySelector('.popup__list');
    if (infoList) infoList.innerHTML = '<p>Загрузка статистики...</p>';
    if (userList) userList.innerHTML = '';
    
    api.getCardList()
      .then(cards => {
        const stats = calculateStatistics(cards);
        populateStatisticsPopup(stats);
        openModalWindow(statsPopup);
      })
      .catch(() => {
        if (infoList) {
          infoList.innerHTML = '<p>Не удалось загрузить статистику</p>';
        }
      });
  }

  function calculateStatistics(cards) {
    const stats = {
      totalCards: cards.length,
      totalLikes: 0,
      avgLikes: 0,
      maxLikesFromOne: 0,
      championCard: null,
      users: {}
    };
    
    cards.forEach(card => {
      stats.totalLikes += card.likes.length;
      
      if (!stats.championCard || card.likes.length > stats.championCard.likes.length) {
        stats.championCard = card;
      }
      
      const userLikesCount = {};
      
      card.likes.forEach(like => {
        const userId = like._id;
        userLikesCount[userId] = (userLikesCount[userId] || 0) + 1;
        
        if (!stats.users[userId]) {
          stats.users[userId] = {
            id: userId,
            name: like.name,
            about: like.about,
            avatar: like.avatar,
            cardsCreated: 0,
            likesReceived: 0,
            likesGiven: 0
          };
        }
        stats.users[userId].likesGiven++;
      });
      
      Object.values(userLikesCount).forEach(count => {
        if (count > stats.maxLikesFromOne) {
          stats.maxLikesFromOne = count;
        }
      });
      
      const authorId = card.owner._id;
      if (!stats.users[authorId]) {
        stats.users[authorId] = {
          id: authorId,
          name: card.owner.name,
          about: card.owner.about,
          avatar: card.owner.avatar,
          cardsCreated: 0,
          likesReceived: 0,
          likesGiven: 0
        };
      }
      stats.users[authorId].cardsCreated++;
      stats.users[authorId].likesReceived += card.likes.length;
    });
    
    stats.avgLikes = stats.totalCards > 0 
      ? (stats.totalLikes / stats.totalCards).toFixed(1) 
      : 0;
    
    return stats;
  }

  function populateStatisticsPopup(stats) {
    const infoContainer = document.querySelector('.popup__info');
    const userList = document.querySelector('.popup__list');
    
    if (!infoContainer || !userList) return;
    
    infoContainer.innerHTML = '';
    userList.innerHTML = '';
    
    const statsData = [
      { term: 'Всего карточек', value: stats.totalCards },
      { term: 'Всего лайков', value: stats.totalLikes },
      { term: 'Среднее лайков на карточку', value: stats.avgLikes },
      { term: 'Максимально лайков от одного', value: stats.maxLikesFromOne }
    ];
    
    statsData.forEach(item => {
      const div = document.createElement('div');
      div.className = 'popup__info-item';
      div.innerHTML = `
        <dt class="popup__info-term">${item.term}</dt>
        <dd class="popup__info-description">${item.value}</dd>
      `;
      infoContainer.appendChild(div);
    });
    
    if (stats.championCard) {
      const div = document.createElement('div');
      div.className = 'popup__info-item';
      div.innerHTML = `
        <dt class="popup__info-term">Чемпион лайков</dt>
        <dd class="popup__info-description">${stats.championCard.name} (${stats.championCard.likes.length} лайков)</dd>
      `;
      infoContainer.appendChild(div);
    }
    
    const topUsers = Object.values(stats.users)
      .filter(user => user.cardsCreated > 0)
      .sort((a, b) => b.likesReceived - a.likesReceived)
      .slice(0, 5);
    
    topUsers.forEach(user => {
      const li = document.createElement('li');
      li.className = 'popup__list-item';
      li.innerHTML = `
        <strong>${user.name || 'Аноним'}</strong><br>
        Карточек: ${user.cardsCreated} | 
        Лайков получил: ${user.likesReceived} | 
        Лайков поставил: ${user.likesGiven}
      `;
      userList.appendChild(li);
    });
  }
  
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
    const submitButton = profileForm.querySelector('.popup__button');
    const originalText = submitButton.textContent;
    
    submitButton.textContent = 'Сохранение...';
    
    api.setUserInfo({
      name: nameInput.value,
      about: jobInput.value
    })
      .then((userData) => {
        profileName.textContent = userData.name;
        profileJob.textContent = userData.about;
        closeModalWindow(profilePopup);
      })
      .finally(() => {
        submitButton.textContent = originalText;
      });
  }
  
  function handleCardFormSubmit(evt) {
    evt.preventDefault();
    const submitButton = cardForm.querySelector('.popup__button');
    const originalText = submitButton.textContent;
    
    submitButton.textContent = 'Создание...';
    
    const name = cardForm.querySelector('.popup__input_type_card-name').value;
    const link = cardForm.querySelector('.popup__input_type_url').value;
    
    api.addCard({ name, link })
      .then((cardData) => {
        const newCard = createCardElement(
          cardData,
          userId,
          {
            onPreviewPicture: () => openImagePopup(cardData.name, cardData.link),
            onLikeIcon: handleLikeClick,
            onDeleteCard: handleDeleteClick
          }
        );
        
        placesList.prepend(newCard);
        cardForm.reset();
        closeModalWindow(cardPopup);
      })
      .finally(() => {
        submitButton.textContent = originalText;
      });
  }
  
  function handleAvatarFormSubmit(evt) {
    evt.preventDefault();
    const submitButton = avatarForm.querySelector('.popup__button');
    const originalText = submitButton.textContent;
    
    submitButton.textContent = 'Сохранение...';
    
    api.setUserAvatar({ avatar: avatarInput.value })
      .then((userData) => {
        profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
        avatarForm.reset();
        closeModalWindow(avatarPopup);
      })
      .finally(() => {
        submitButton.textContent = originalText;
      });
  }
  
  function handleLikeClick(cardId, isLiked, likeButton, likeCountElement) {
    api.changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
        likeButton.classList.toggle('card__like-button_is-active');
        if (likeCountElement) {
            likeCountElement.textContent = updatedCard.likes.length;
        }
    });
  }
  
  function handleDeleteClick(cardId, cardElement) {
    api.deleteCard(cardId)
      .then(() => {
        cardElement.remove();
      });
  }
  
  profileEditButton.addEventListener('click', () => {
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
  
  Promise.all([api.getUserInfo(), api.getCardList()])
    .then(([userData, cards]) => {
      userId = userData._id;
      
      profileName.textContent = userData.name;
      profileJob.textContent = userData.about;
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      
      cards.reverse().forEach(cardData => {
        const cardElement = createCardElement(
          cardData,
          userId,
          {
            onPreviewPicture: () => openImagePopup(cardData.name, cardData.link),
            onLikeIcon: handleLikeClick,
            onDeleteCard: handleDeleteClick
          }
        );
        placesList.append(cardElement);
      });
    });
  
  [profilePopup, cardPopup, imagePopup, avatarPopup].forEach(popup => {
    setCloseModalWindowEventListeners(popup);
  });
  
  enableValidation(validationConfig);

  const logo = document.querySelector('.header__logo');
  if (logo) {
    logo.addEventListener('click', openStatisticsPopup);
  }

  const statsPopup = document.querySelector('.popup_type_info');
  if (statsPopup) {
    setCloseModalWindowEventListeners(statsPopup);
  }
}

document.addEventListener('DOMContentLoaded', initApp);
