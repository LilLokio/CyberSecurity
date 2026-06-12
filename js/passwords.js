const STORAGE_KEY = 'passwords_state';

function saveState() {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
    currentStep,
    userAnswers,
    answerChecked
  }));
}

function loadState() {
  const saved = sessionStorage.getItem(STORAGE_KEY);
  if (saved) {
    const state = JSON.parse(saved);
    currentStep = state.currentStep;
    userAnswers = state.userAnswers;
    answerChecked = state.answerChecked;
  }
}

let currentStep = 1;
let userAnswers = { 1: null, 2: [], 3: null };
let answerChecked = { 1: false, 2: false, 3: false };

const questions = {
  1: {
    title: "Выберите самый надёжный пароль",
    options: [
      { value: "12345678", text: "12345678", correct: false },
      { value: "qwertyuiopаа", text: "qwertyuiopаа", correct: false },
      { value: "Maria2005", text: "Maria2005", correct: false },
      { value: "Tr@mway_Blue77?Starfish", text: "Tr@mway_Blue77?Starfish", correct: true },
      { value: "aaaaaa", text: "aaaaaa", correct: false }
    ],
    type: "radio",
    correctAnswer: "Tr@mway_Blue77?Starfish"
  },
  2: {
    title: "Где Саша ошибся?",
    description: "Саша придумал пароль Sasha2005 и записал его в заметках: «Пароль от почты: Sasha2005».",
    options: [
      { id: "short", text: "Пароль слишком короткий", correct: true },
      { id: "special", text: "Не использовал специальные символы", correct: true },
      { id: "notes", text: "Хранит пароль в незашифрованном виде в заметках телефона", correct: true },
      { id: "one", text: "Использует один пароль для важного сервиса", correct: false },
      { id: "cyr", text: "Использовал кириллическую букву в пароле", correct: false }
    ],
    type: "checkbox",
    correctAnswers: ["short", "special", "notes"]
  },
  3: {
    title: "Создайте надёжный пароль",
    description: "Пароль должен содержать минимум 12 символов, заглавные и строчные буквы, цифры и спецсимволы",
    type: "password"
  }
};

function isStrongPassword(pass) {
  return pass.length >= 12 &&
    /[A-Z]/.test(pass) &&
    /[a-z]/.test(pass) &&
    /\d/.test(pass) &&
    /[!@#$%^&*?_.,-]/.test(pass);
}

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

function checkStrengthLive(pass) {
  const text = document.getElementById("strengthText");
  if (text) {
    if (isStrongPassword(pass)) {
      text.textContent = "✅ Надёжный пароль!";
      text.style.color = "green";
    } else {
      text.textContent = "❌ Добавьте: длину 12+, заглавные, строчные, цифры и спецсимволы";
      text.style.color = "#d97706";
    }
  }
}

function restoreFeedbackText(feedback) {
  const q = questions[currentStep];
  if (q.type === "radio") {
    feedback.textContent = "✅ Правильно! Этот пароль длинный, содержит разные символы и не включает личную информацию.";
  } else if (q.type === "checkbox") {
    feedback.textContent = "✅ Верно! Ошибки: короткий пароль, нет спецсимволов, хранение пароля в заметках.";
  } else if (q.type === "password") {
    feedback.textContent = "✅ Хороший пароль! Он длинный, содержит буквы, цифры и специальные символы.";
  }
}

function renderQuestion() {
  const container = document.getElementById("questionContent");
  const q = questions[currentStep];

  let html = `<span class="badge">Задание ${currentStep} из 3</span>`;
  html += `<h3>${q.title}</h3>`;
  if (q.description) html += `<p>${q.description}</p>`;

  if (q.type === "radio") {
    q.options.forEach(opt => {
      const checked = userAnswers[currentStep] === opt.value ? "checked" : "";
      html += `
        <label class="option">
          <input type="radio" name="answer" value="${opt.value}" ${checked}>
          ${opt.text}
        </label>
      `;
    });
  } else if (q.type === "checkbox") {
    q.options.forEach(opt => {
      const checked = userAnswers[currentStep]?.includes(opt.id) ? "checked" : "";
      html += `
        <label class="option">
          <input type="checkbox" data-id="${opt.id}" ${checked}>
          ${opt.text}
        </label>
      `;
    });
  } else if (q.type === "password") {
    html += `<input type="password" id="newPassword" placeholder="Введите пароль" value="${userAnswers[3] || ""}">`;
    html += `<p id="strengthText" style="margin-top: 8px; font-size: 14px;"></p>`;
  }

  html += `<div class="feedback" id="questionFeedback"></div>`;
  container.innerHTML = html;

  if (q.type === "radio") {
    const radios = document.querySelectorAll('input[name="answer"]');
    radios.forEach(radio => {
      radio.addEventListener("change", (e) => {
        userAnswers[currentStep] = e.target.value;
        answerChecked[currentStep] = false;
        document.getElementById("questionFeedback").classList.remove("show", "error");
        saveState();
      });
    });
  } else if (q.type === "checkbox") {
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
        saveState();
      });
    });
  } else if (q.type === "password") {
    const input = document.getElementById("newPassword");
    input.addEventListener("input", (e) => {
      userAnswers[currentStep] = e.target.value;
      answerChecked[currentStep] = false;
      document.getElementById("questionFeedback").classList.remove("show", "error");
      checkStrengthLive(e.target.value);
      saveState();
    });
    if (userAnswers[3]) checkStrengthLive(userAnswers[3]);
  }

  document.getElementById("progressFill").style.width = `${currentStep * 33.3}%`;

  const feedback = document.getElementById("questionFeedback");
  if (answerChecked[currentStep]) {
    feedback.classList.add("show");
    restoreFeedbackText(feedback);
  }
}

function checkAnswer() {
  const q = questions[currentStep];
  const feedback = document.getElementById("questionFeedback");
  let isCorrect = false;

  if (q.type === "radio") {
    const selected = userAnswers[currentStep];
    isCorrect = selected === q.correctAnswer;

    if (isCorrect) {
      feedback.textContent = "✅ Правильно! Этот пароль длинный, содержит разные символы и не включает личную информацию.";
      feedback.classList.remove("error");
      feedback.classList.add("show");
    } else {
      feedback.textContent = "❌ Неправильно. Самый надёжный пароль — длинный, с разными символами, без личной информации.";
      feedback.classList.add("show", "error");
    }
  } else if (q.type === "checkbox") {
    const selected = userAnswers[currentStep] || [];
    const correctAnswers = q.correctAnswers;

    isCorrect = selected.length === correctAnswers.length &&
      correctAnswers.every(answer => selected.includes(answer));

    if (isCorrect) {
      feedback.textContent = "✅ Верно! Ошибки: короткий пароль, нет спецсимволов, хранение пароля в заметках.";
      feedback.classList.remove("error");
      feedback.classList.add("show");
    } else {
      const missing = correctAnswers.filter(a => !selected.includes(a));
      const extra = selected.filter(a => !correctAnswers.includes(a));
      let errorMsg = "❌ Неправильно. ";
      if (missing.length) errorMsg += `Не выбрано: ${missing.map(m => {
        const opt = q.options.find(o => o.id === m);
        return opt ? opt.text : m;
      }).join(", ")}. `;
      if (extra.length) errorMsg += `Лишнее: ${extra.map(e => {
        const opt = q.options.find(o => o.id === e);
        return opt ? opt.text : e;
      }).join(", ")}.`;
      feedback.textContent = errorMsg;
      feedback.classList.add("show", "error");
    }
  } else if (q.type === "password") {
    const password = userAnswers[currentStep] || "";
    isCorrect = isStrongPassword(password);

    if (isCorrect) {
      feedback.textContent = "✅ Хороший пароль! Он длинный, содержит буквы, цифры и специальные символы.";
      feedback.classList.remove("error");
      feedback.classList.add("show");
    } else {
      feedback.textContent = "❌ Пароль пока слабый. Добавьте длину 12+, заглавные и строчные буквы, цифры и спецсимволы.";
      feedback.classList.add("show", "error");
    }
  }

  if (isCorrect) {
    answerChecked[currentStep] = true;
    saveState();
  }
}

function nextQuestion() {
  if (currentStep < 3) {
    if (!answerChecked[currentStep]) {
      alert("Сначала проверьте ответ!");
      return;
    }
    currentStep++;
    saveState();
    renderQuestion();
    renderSteps();
  }
}

function prevQuestion() {
  if (currentStep > 1) {
    currentStep--;
    saveState();
    renderQuestion();
    renderSteps();
  }
}

document.getElementById("checkBtn").addEventListener("click", checkAnswer);
document.getElementById("nextBtn").addEventListener("click", nextQuestion);
document.getElementById("prevBtn").addEventListener("click", prevQuestion);

document.getElementById("checkBtn").addEventListener("click", function () {
  if (answerChecked[1] && answerChecked[2] && answerChecked[3]) {
    showNextPageButton();
  }
});


loadState();
renderSteps();
renderQuestion();


if (answerChecked[1] && answerChecked[2] && answerChecked[3]) {
  showNextPageButton();
}