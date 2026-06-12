const STORAGE_KEY = 'private_state';

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

function saveState() {
  const state = {
    private: [],
    friends: [],
    public: [],
    container: [],
    isComplete: false
  };

  ["private", "friends", "public"].forEach(zoneName => {
    const zone = document.querySelector(`[data-zone="${zoneName}"] .zone-items`);
    if (zone) {
      zone.querySelectorAll(".zone-item .remove-item").forEach(btn => {
        state[zoneName].push(btn.getAttribute("data-item"));
      });
    }
  });

  document.querySelectorAll("#dragContainer .privacy-chip").forEach(chip => {
    state.container.push(chip.getAttribute("data-item"));
  });

  const feedback = document.getElementById("privacyFeedback");
  state.isComplete = feedback.classList.contains("show") && !feedback.classList.contains("error");

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const saved = sessionStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  const state = JSON.parse(saved);

  document.querySelectorAll(".zone-items").forEach(z => z.innerHTML = "");
  document.getElementById("dragContainer").innerHTML = "";

  ["private", "friends", "public"].forEach(zoneName => {
    const zone = document.querySelector(`[data-zone="${zoneName}"] .zone-items`);
    state[zoneName].forEach(itemId => {
      const itemClone = createZoneItem(itemId);
      zone.appendChild(itemClone);
    });
  });

  state.container.forEach(itemId => {
    const chip = createChip(itemId);
    document.getElementById("dragContainer").appendChild(chip);
  });

  if (state.isComplete) {
    const feedback = document.getElementById("privacyFeedback");
    feedback.innerHTML = `
      ✅ Отлично! Вы правильно распределили данные.<br><br>
      <b>Только я:</b> номер телефона, домашний адрес, паспортные данные, дата рождения.<br>
      <b>Друзья:</b> фото с друзьями, личные истории, город проживания.<br>
      <b>Все:</b> публичные посты.
    `;
    feedback.classList.remove("error");
    feedback.classList.add("show");
    showNextPageButton();
  }
}

function createZoneItem(itemId) {
  const itemClone = document.createElement("div");
  itemClone.className = "zone-item";
  itemClone.innerHTML = `
    ${itemNames[itemId]}
    <button class="remove-item" data-item="${itemId}">✕</button>
  `;
  itemClone.querySelector(".remove-item").addEventListener("click", () => {
    itemClone.remove();
    returnToDragContainer(itemId);
    saveState();
  });
  return itemClone;
}

function createChip(itemId) {
  const chip = document.createElement("div");
  chip.className = "privacy-chip";
  chip.setAttribute("draggable", "true");
  chip.setAttribute("data-item", itemId);
  chip.textContent = itemNames[itemId];

  chip.addEventListener("dragstart", (e) => {
    draggedItem = chip;
    chip.classList.add("dragging");
    e.dataTransfer.setData("text/plain", itemId);
    e.dataTransfer.effectAllowed = "move";
  });

  chip.addEventListener("dragend", () => {
    draggedItem = null;
    chip.classList.remove("dragging");
  });

  return chip;
}

function initDragAndDrop() {
  document.querySelectorAll(".privacy-chip").forEach(chip => {
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

  document.querySelectorAll(".privacy-zone").forEach(zone => {
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
        const itemId = draggedItem.getAttribute("data-item");
        const itemClone = createZoneItem(itemId);
        zoneItems.appendChild(itemClone);
        draggedItem.remove();
        draggedItem = null;
        saveState();
      }
    });
  });
}

function returnToDragContainer(itemId) {
  const chip = createChip(itemId);
  document.getElementById("dragContainer").appendChild(chip);
}

function resetAll() {
  document.querySelectorAll(".zone-items").forEach(zone => {
    zone.innerHTML = "";
  });

  const container = document.getElementById("dragContainer");
  container.innerHTML = "";

  Object.keys(itemNames).forEach(itemId => {
    container.appendChild(createChip(itemId));
  });

  const feedback = document.getElementById("privacyFeedback");
  feedback.classList.remove("show", "error");

  sessionStorage.removeItem(STORAGE_KEY);
}

function checkPrivacy() {
  const privateItems = [];
  const friendsItems = [];
  const publicItems = [];

  document.querySelector('[data-zone="private"] .zone-items')
    .querySelectorAll(".remove-item").forEach(btn => privateItems.push(btn.getAttribute("data-item")));
  document.querySelector('[data-zone="friends"] .zone-items')
    .querySelectorAll(".remove-item").forEach(btn => friendsItems.push(btn.getAttribute("data-item")));
  document.querySelector('[data-zone="public"] .zone-items')
    .querySelectorAll(".remove-item").forEach(btn => publicItems.push(btn.getAttribute("data-item")));

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
      <b>Только я:</b> номер телефона, домашний адрес, паспортные данные, дата рождения.<br>
      <b>Друзья:</b> фото с друзьями, личные истории, город проживания.<br>
      <b>Все:</b> публичные посты.
    `;
    feedback.classList.remove("error");
    feedback.classList.add("show");
    saveState();
    showNextPageButton();
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

loadState();
initDragAndDrop();