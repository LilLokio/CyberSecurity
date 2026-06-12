const questions = [
  "Пароль длиной от 12 символов",
  "Пароль уникальный, не используется на других сайтах",
  "Двухфакторная аутентификация включена",
  "Закрыт или ограничен показ личной информации",
  "Пароль меняется раз в 6–12 месяцев",
  "Я знаю, что нельзя говорить код из СМС",
  "В аккаунте нет старых или чужих активных сессий",
  "Привязанный email защищён"
];

const checklist = document.getElementById("checklist");

questions.forEach((question, index) => {
  checklist.innerHTML += `
    <div class="item">
      <div class="num">${index + 1}</div>
      <div>${question}</div>

      <div class="answers">
        <input type="radio" id="yes${index}" name="q${index}" value="yes">
        <label for="yes${index}">Да</label>

        <input type="radio" id="no${index}" name="q${index}" value="no">
        <label for="no${index}">Нет</label>
      </div>
    </div>
  `;
});

const saved = JSON.parse(localStorage.getItem("checklist") || "{}");

questions.forEach((question, index) => {
  if (saved[index]) {
    const input = document.getElementById(`${saved[index]}${index}`);
    if (input) input.checked = true;
  }

  document.querySelectorAll(`input[name="q${index}"]`).forEach(input => {
    input.addEventListener("change", () => {
      saved[index] = input.value;
      localStorage.setItem("checklist", JSON.stringify(saved));
    });
  });
});

function showResult() {
  let result = 0;

  questions.forEach((question, index) => {
    const yes = document.getElementById(`yes${index}`);

    if (yes.checked) {
      result++;
    }
  });

  const total = questions.length;
  const degrees = (result / total) * 360;

  document.getElementById("diagram").style.setProperty(
    "background",
    `conic-gradient(#7a5be8 ${degrees}deg, #c4b5f5 ${degrees}deg)`,
    "important"
  );

  document.getElementById("score").textContent = `${result} / ${total}`;

  let level = "";

  if (result >= 7) {
    level = "Очень хороший уровень безопасности";
  } else if (result >= 5) {
    level = "Хороший уровень безопасности";
  } else if (result >= 3) {
    level = "Средний уровень безопасности";
  } else {
    level = "Низкий уровень безопасности";
  }

  document.getElementById("level").textContent = level;
}

showResult();