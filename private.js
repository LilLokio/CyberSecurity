const correctAnswers = {
  private: ["phone", "address", "passport", "birthday"],
  friends: ["friends_photo", "personal_stories", "city"],
  public: ["public_posts"]
};

const itemNames = {
  phone: "Номер телефона",
  address: "Домашний адрес",
  passport: "Паспортные данные",
  birthday: "Дата рождения",
  friends_photo: "Фото с друзьями",
  personal_stories: "Личные истории",
  city: "Город проживания",
  public_posts: "Публичные посты"
};

let draggedItem = null;

function initDragAndDrop() {
  const chips = document.querySelectorAll(".privacy-chip");
  const zones = document.querySelectorAll(".privacy-zone");

  chips.forEach(chip => {
    chip.addEventListener("dragstart", (e) => {
      draggedItem = chip;
      chip.classList.add("dragging");
      e.dataTransfer.setData("text/plain", chip.getAttribute("data-item"));
      e.dataTransfer.effectAllowed = "move";
    });

    chip.addEventListener("dragend", () => {
      draggedItem = null;
      chip.classList.remove("dragging");
    });
  });

  zones.forEach(zone => {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      zone.classList.add("hover");
    });

    zone.addEventListener("dragleave", () => {
      zone.classList.remove("hover");
    });

    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("hover");
      
      if (draggedItem) {
        const zoneItems = zone.querySelector(".zone-items");
        const itemClone = document.createElement("div");
        itemClone.className = "zone-item";
        const itemId = draggedItem.getAttribute("data-item");
        itemClone.innerHTML = `
          ${itemNames[itemId]}
          <button class="remove-item" data-item="${itemId}">✕</button>
        `;
        
        itemClone.querySelector(".remove-item").addEventListener("click", () => {
          itemClone.remove();
          returnToDragContainer(itemId);
        });
        
        zoneItems.appendChild(itemClone);
        draggedItem.remove();
        draggedItem = null;
      }
    });
  });
}

function returnToDragContainer(itemId) {
  const container = document.getElementById("dragContainer");
  const newChip = document.createElement("div");
  newChip.className = "privacy-chip";
  newChip.setAttribute("draggable", "true");
  newChip.setAttribute("data-item", itemId);
  newChip.textContent = itemNames[itemId];
  
  newChip.addEventListener("dragstart", (e) => {
    draggedItem = newChip;
    newChip.classList.add("dragging");
    e.dataTransfer.setData("text/plain", itemId);
  });
  
  newChip.addEventListener("dragend", () => {
    draggedItem = null;
    newChip.classList.remove("dragging");
  });
  
  container.appendChild(newChip);
}

function resetAll() {
  document.querySelectorAll(".zone-items").forEach(zone => {
    zone.innerHTML = "";
  });
  
  const container = document.getElementById("dragContainer");
  container.innerHTML = "";
  
  Object.keys(itemNames).forEach(itemId => {
    const chip = document.createElement("div");
    chip.className = "privacy-chip";
    chip.setAttribute("draggable", "true");
    chip.setAttribute("data-item", itemId);
    chip.textContent = itemNames[itemId];
    
    chip.addEventListener("dragstart", (e) => {
      draggedItem = chip;
      chip.classList.add("dragging");
      e.dataTransfer.setData("text/plain", itemId);
    });
    
    chip.addEventListener("dragend", () => {
      draggedItem = null;
      chip.classList.remove("dragging");
    });
    
    container.appendChild(chip);
  });
}

function checkPrivacy() {
  const privateItems = [];
  const friendsItems = [];
  const publicItems = [];
  
  const privateZone = document.querySelector('[data-zone="private"] .zone-items');
  const friendsZone = document.querySelector('[data-zone="friends"] .zone-items');
  const publicZone = document.querySelector('[data-zone="public"] .zone-items');
  
  if (privateZone) {
    privateZone.querySelectorAll(".zone-item").forEach(item => {
      const btn = item.querySelector(".remove-item");
      if (btn) {
        privateItems.push(btn.getAttribute("data-item"));
      }
    });
  }
  
  if (friendsZone) {
    friendsZone.querySelectorAll(".zone-item").forEach(item => {
      const btn = item.querySelector(".remove-item");
      if (btn) {
        friendsItems.push(btn.getAttribute("data-item"));
      }
    });
  }
  
  if (publicZone) {
    publicZone.querySelectorAll(".zone-item").forEach(item => {
      const btn = item.querySelector(".remove-item");
      if (btn) {
        publicItems.push(btn.getAttribute("data-item"));
      }
    });
  }
  
  const isPrivateCorrect = privateItems.length === correctAnswers.private.length &&
    correctAnswers.private.every(item => privateItems.includes(item));
  
  const isFriendsCorrect = friendsItems.length === correctAnswers.friends.length &&
    correctAnswers.friends.every(item => friendsItems.includes(item));
  
  const isPublicCorrect = publicItems.length === correctAnswers.public.length &&
    correctAnswers.public.every(item => publicItems.includes(item));
  
  const feedback = document.getElementById("privacyFeedback");
  
  if (isPrivateCorrect && isFriendsCorrect && isPublicCorrect) {
    feedback.innerHTML = `
      ✅ Отлично! Вы правильно распределили данные.<br><br>
      <b>🔒 Только я:</b> номер телефона, домашний адрес, паспортные данные, дата рождения.<br>
      <b>👥 Друзья:</b> фото с друзьями, личные истории, город проживания.<br>
      <b>🌍 Все:</b> публичные посты.
    `;
    feedback.classList.remove("error");
    feedback.classList.add("show");
  } else {
    feedback.innerHTML = "❌ Неправильно. Попробуйте ещё раз!";
    feedback.classList.add("show", "error");
    setTimeout(() => {
      feedback.classList.remove("show", "error");
    }, 2000);
  }
}

document.getElementById("checkBtn").addEventListener("click", checkPrivacy);
document.getElementById("resetBtn").addEventListener("click", resetAll);

initDragAndDrop();