let currentStep = 1;
let userAnswers = { 1: [], 2: null, 3: [] };
let answerChecked = { 1: false, 2: false, 3: false };

const questions = {
  1: {
    title: "Что может быть дополнительным подтверждением?",
    options: [
      { id: "code", text: "Одноразовый код", correct: true },
      { id: "app", text: "Код из приложения-аутентификатора", correct: true },
      { id: "push", text: "Push-уведомление", correct: true },
      { id: "key", text: "Аппаратный ключ безопасности", correct: true }
    ],
    type: "checkbox",
    correctAnswers: ["code", "app", "push", "key"]
  },
  2: {
    title: "Порядок надёжности 2FA",
    description: "Расположите методы 2FA от самого надёжного к наименее надёжному",
    options: [
      { text: "Аппаратный ключ", correctOrder: 1 },
      { text: "Приложение-аутентификатор", correctOrder: 2 },
      { text: "Push-уведомления", correctOrder: 3 },
      { text: "SMS-коды", correctOrder: 4 },
      { text: "Резервные коды", correctOrder: 5 }
    ],
    type: "order"
  },
  3: {
    title: "Выберите неверные утверждения",
    options: [
      { id: "sms", text: "SMS-коды — самый надёжный метод 2FA", correct: true },
      { id: "risk", text: "2FA значительно снижает риск взлома аккаунта", correct: false },
      { id: "key", text: "Аппаратный ключ не может быть подтверждением", correct: true },
      { id: "leak", text: "2FA защищает даже при утечке пароля", correct: false }
    ],
    type: "checkbox",
    correctAnswers: ["sms", "key"]
  }
};

function renderSteps() {
  const stepsContainer = document.getElementById("steps");
  stepsContainer.innerHTML = "";
  for (let i = 1; i <= 3; i++) {
    const stepDiv = document.createElement("div");
    stepDiv.className = `step ${currentStep === i ? "active" : ""}`;
    stepDiv.textContent = i;
    stepsContainer.appendChild(stepDiv);
  }
}

function renderQuestion() {
  const container = document.getElementById("questionContent");
  const q = questions[currentStep];

  let html = `<span class="badge">Задание ${currentStep} из 3</span>`;
  html += `<h3>${q.title}</h3>`;
  if (q.description) html += `<p>${q.description}</p>`;

  if (q.type === "checkbox") {
    q.options.forEach(opt => {
      const checked = userAnswers[currentStep]?.includes(opt.id) ? "checked" : "";
      html += `
        <label class="option">
          <input type="checkbox" data-id="${opt.id}" ${checked}>
          ${opt.text}
        </label>
      `;
    });
  } else if (q.type === "order") {
    const currentOrder = userAnswers[currentStep] || q.options.map((_, i) => i);
    html += `<div id="orderList">`;
    currentOrder.forEach((index, position) => {
      html += `
        <div class="drag-item" draggable="true" data-index="${index}" data-position="${position}">
          ${position + 1}. ${q.options[index].text}
        </div>
      `;
    });
    html += `</div>`;
    html += `<p style="font-size: 14px; color: #666; margin-top: 12px;"> Перетаскивайте элементы мышкой для изменения порядка</p>`;
  }

  html += `<div class="feedback" id="questionFeedback"></div>`;
  container.innerHTML = html;

  if (q.type === "checkbox") {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
      cb.addEventListener("change", (e) => {
        if (!userAnswers[currentStep]) userAnswers[currentStep] = [];
        const id = e.target.getAttribute("data-id");
        if (e.target.checked) {
          if (!userAnswers[currentStep].includes(id)) {
            userAnswers[currentStep].push(id);
          }
        } else {
          userAnswers[currentStep] = userAnswers[currentStep].filter(i => i !== id);
        }
        answerChecked[currentStep] = false;
        document.getElementById("questionFeedback").classList.remove("show", "error");
      });
    });
  } else if (q.type === "order") {
    initDragAndDrop();
  }

  document.getElementById("progressFill").style.width = `${currentStep * 33.3}%`;

  const feedback = document.getElementById("questionFeedback");
  if (answerChecked[currentStep]) {
    feedback.classList.add("show");
  }
}

function initDragAndDrop() {
  const items = document.querySelectorAll('.drag-item');
  let draggedItem = null;

  items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedItem = item;
      e.dataTransfer.effectAllowed = 'move';
      item.style.opacity = '0.5';
    });

    item.addEventListener('dragend', () => {
      draggedItem = null;
      item.style.opacity = '1';
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      if (draggedItem && draggedItem !== item) {
        const parent = document.getElementById('orderList');
        const draggedIndex = Array.from(parent.children).indexOf(draggedItem);
        const targetIndex = Array.from(parent.children).indexOf(item);
        
        if (draggedIndex < targetIndex) {
          item.parentNode.insertBefore(draggedItem, item.nextSibling);
        } else {
          item.parentNode.insertBefore(draggedItem, item);
        }
        
        // Обновляем порядок
        const newOrder = Array.from(parent.children).map(child => 
          parseInt(child.getAttribute('data-index'))
        );
        userAnswers[currentStep] = newOrder;
        answerChecked[currentStep] = false;
        
        // Обновляем нумерацию
        Array.from(parent.children).forEach((child, idx) => {
          const originalIndex = parseInt(child.getAttribute('data-index'));
          child.textContent = `${idx + 1}. ${questions[2].options[originalIndex].text}`;
          child.setAttribute('data-position', idx);
        });
      }
    });
  });
}

function checkAnswer() {
  const q = questions[currentStep];
  const feedback = document.getElementById("questionFeedback");
  let isCorrect = false;

  if (q.type === "checkbox") {
    const selected = userAnswers[currentStep] || [];
    const correctAnswers = q.correctAnswers;
    
    isCorrect = selected.length === correctAnswers.length &&
      correctAnswers.every(answer => selected.includes(answer));
    
    if (isCorrect) {
      if (currentStep === 1) {
        feedback.textContent = "✅ Правильно! Все эти варианты могут использоваться в 2FA.";
      } else if (currentStep === 3) {
        feedback.textContent = "✅ Верно! Неверные утверждения: SMS — самый надёжный метод; аппаратный ключ не может быть 2FA.";
      }
      feedback.classList.remove("error");
      feedback.classList.add("show");
    } else {
      feedback.textContent = "❌ Неправильно. Попробуйте ещё раз.";
      feedback.classList.add("show", "error");
    }
  } else if (q.type === "order") {
    const order = userAnswers[currentStep] || [];
    const correctOrder = [0, 1, 2, 3, 4];
    
    isCorrect = JSON.stringify(order) === JSON.stringify(correctOrder);
    
    if (isCorrect) {
      feedback.textContent = "✅ Правильно! Аппаратный ключ — самый надёжный, SMS и резервные коды требуют осторожности.";
      feedback.classList.remove("error");
      feedback.classList.add("show");
    } else {
      feedback.textContent = "❌ Неправильный порядок. Самый надёжный — аппаратный ключ, затем приложение-аутентификатор, потом Push, SMS и резервные коды.";
      feedback.classList.add("show", "error");
    }
  }
  
  if (isCorrect) {
    answerChecked[currentStep] = true;
  }
}

function nextQuestion() {
  if (currentStep < 3) {
    if (!answerChecked[currentStep]) {
      alert("Сначала проверьте ответ!");
      return;
    }
    currentStep++;
    renderQuestion();
    renderSteps();
  }
}

function prevQuestion() {
  if (currentStep > 1) {
    currentStep--;
    renderQuestion();
    renderSteps();
  }
}

document.getElementById("checkBtn").addEventListener("click", checkAnswer);
document.getElementById("nextBtn").addEventListener("click", nextQuestion);
document.getElementById("prevBtn").addEventListener("click", prevQuestion);

renderSteps();
renderQuestion();