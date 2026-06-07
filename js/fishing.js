const totalDangers = 6;
let foundCount = 0;
let foundItems = new Set();

const dangerDescriptions = {
  sender: "Подозрительный адрес отправителя (sberb4nk-online.ru — фейковый домен)",
  subject: "Давление срочностью и угроза блокировки — типичный приём фишеров",
  suspicious_activity: "Общие фразы без конкретики ('подозрительная активность')",
  request_data: "Запрос личных данных — настоящие банки так не делают",
  link: "Подозрительная ссылка (не на официальном домене sberbank.ru)",
  file: "Опасный .exe файл — вероятно, вирус или троян"
};

function markDanger(element) {
  const dangerId = element.getAttribute("data-danger");
  
  if (!foundItems.has(dangerId)) {
    foundItems.add(dangerId);
    foundCount++;
    element.classList.add("found");
    
    document.getElementById("foundText").innerHTML = `Найдено: ${foundCount} из ${totalDangers}`;
    
    if (foundCount === totalDangers) {
      showSuccess();
    }
  }
}

function showSuccess() {
  const feedback = document.getElementById("phishingFeedback");
  
  let html = `
    ✅ Отлично! Вы нашли все 6 признаков фишингового письма!
    <br><br>
    <strong>Что было подозрительным:</strong>
    <ul class="phishing-list">
  `;
  
  Object.entries(dangerDescriptions).forEach(([id, desc]) => {
    html += `<li>${desc}</li>`;
  });
  
  html += `
    </ul>
    <br>
    <strong>💡 Совет:</strong> Никогда не переходите по подозрительным ссылкам, 
    не открывайте вложения из неизвестных писем и не сообщайте личные данные.
  `;
  
  feedback.innerHTML = html;
  feedback.classList.add("show");
}

function resetPhishing() {
  foundCount = 0;
  foundItems.clear();
  
  document.querySelectorAll(".danger").forEach(el => {
    el.classList.remove("found");
  });
  
  document.getElementById("foundText").innerHTML = `Найдено: 0 из ${totalDangers}`;
  
  const feedback = document.getElementById("phishingFeedback");
  feedback.classList.remove("show");
}

document.querySelectorAll(".danger").forEach(el => {
  el.addEventListener("click", function() {
    markDanger(this);
  });
});

document.getElementById("resetPhishingBtn").addEventListener("click", resetPhishing);

function checkFishingComplete() {
  if (foundCount === totalDangers) {
    showNextPageButton();
  }
}

document.querySelectorAll(".danger").forEach(el => {
  el.addEventListener("click", checkFishingComplete);
});