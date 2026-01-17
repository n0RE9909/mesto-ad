export const createCardElement = (
  cardData,
  userId,
  { onPreviewPicture, onLikeIcon, onDeleteCard }
) => {
  const template = document.querySelector('#card-template').content;
  const cardElement = template.querySelector('.card').cloneNode(true);
  
  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');
  const likeButton = cardElement.querySelector('.card__like-button');
  const deleteButton = cardElement.querySelector('.card__control-button_type_delete');
  const likeCountElement = cardElement.querySelector('.card__like-count');
  
  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;
  
  const isOwner = cardData.owner._id === userId;
  
  if (!isOwner) {
    deleteButton.style.display = 'none';
  }
  
  const isLiked = cardData.likes.some(like => like._id === userId);
  
  if (isLiked) {
    likeButton.classList.add('card__like-button_is-active');
  }
  
  if (likeCountElement) {
    likeCountElement.textContent = cardData.likes.length;
  }
  
  likeButton.addEventListener('click', () => {
    const currentIsLiked = likeButton.classList.contains('card__like-button_is-active');
    
    onLikeIcon(cardData._id, currentIsLiked, likeButton, likeCountElement);
  });
  
  if (isOwner) {
    deleteButton.addEventListener('click', () => {
      onDeleteCard(cardData._id, cardElement);
    });
  }
  
  cardImage.addEventListener('click', () => {
    onPreviewPicture();
  });
  
  return cardElement;
};
