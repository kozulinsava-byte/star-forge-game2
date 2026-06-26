// ========== TUTORIAL МОДУЛЬ: ОБУЧЕНИЕ И СПРАВКА ==========

// ========== ФЛАГ ТУТОРИАЛА ==========
export function isTutorialCompleted() {
  return localStorage.getItem('tutorial_completed') === 'true';
}

export function markTutorialCompleted() {
  localStorage.setItem('tutorial_completed', 'true');
}

export function resetTutorialFlag() {
  localStorage.removeItem('tutorial_completed');
}

// ========== СПРАВОЧНЫЙ КОНТЕНТ ==========
const HELP_CONTENT = {
  expeditions: {
    title: '⛏️ Экспедиции',
    text: `
      <p><strong>Экспедиции</strong> — основной способ добычи жеод.</p>
      <p>📌 <strong>Как отправить шахтёров:</strong> нажмите на карточку локации → «Отправиться». Экспедиция займёт указанное время (от 30 секунд до 20 минут).</p>
      <p>📌 <strong>Жеоды:</strong> после завершения вы получите жеоду. Разбивайте её тапами, чтобы добыть слитки!</p>
      <p>📌 <strong>Особые жеоды:</strong> с небольшим шансом можно найти особую жеоду с коллекционным артефактом.</p>
      <p>📌 <strong>Разведка (📡):</strong> для Джунглей и Астероидов доступна мини-игра «Сигналы» — ловите 8 точек за 10 секунд, чтобы сократить время или повысить шанс особой жеоды.</p>
      <p>💡 <strong>Совет:</strong> начинайте с Шахт. Как только откроете Джунгли (уровень 5) — переключайтесь на них ради редких слитков.</p>
    `
  },
  
  ingot: {
    title: '⚒️ Слиток',
    text: `
      <p><strong>Слиток-Кликер</strong> — сердце игры и ваш главный инструмент прогрессии.</p>
      <p>📌 <strong>Стружка:</strong> тапайте по Слитку, чтобы добывать кузнечную стружку. Каждый тап тратит 1 энергию и приносит стружку в зависимости от уровня Слитка.</p>
      <p>📌 <strong>Энергия:</strong> восстанавливается автоматически (3 ед/сек). Синяя полоска под Слитком показывает запас.</p>
      <p>📌 <strong>Эволюция:</strong> когда шкала опыта заполнена — наступает «Заслонка». Соберите нужное количество стружки и слитков, затем нажмите «Переплавить Слиток» для повышения уровня!</p>
      <p>📌 <strong>🔥 Кузнечный Раж:</strong> с шансом 1% при тапе активируется режим ×4 стружки на 10 секунд! Экран загорается огненным свечением, а над Слитком появляется таймер. Тапайте как можно быстрее!</p>
      <p>📌 <strong>Уровни Слитка:</strong> всего 15 уровней от «Ржавого» до «Космониумного». Каждый новый уровень увеличивает силу тапа.</p>
      <p>💡 <strong>Совет:</strong> не тратьте энергию впустую! Тапайте регулярно и следите за заполнением шкалы опыта.</p>
    `
  },
  
  inventory: {
    title: '🎒 Инвентарь',
    text: `
      <p><strong>Инвентарь</strong> — хранилище ваших жеод и слитков.</p>
      <p>📌 <strong>Вкладка «Жеоды»:</strong> здесь лежат все добытые жеоды. Нажмите на жеоду → «Расколоть», чтобы открыть её и получить случайный слиток.</p>
      <p>📌 <strong>Вкладка «Слитки»:</strong> все добытые слитки. Нажмите на слиток, чтобы увидеть подробную информацию.</p>
      <p>📌 <strong>Редкость:</strong> слитки бывают Обычными, Редкими, Эпическими и Легендарными. Чем выше редкость — тем ценнее!</p>
      <p>💡 <strong>Совет:</strong> не продавайте редкие слитки сразу — они могут пригодиться для эволюции Слитка или крафта в Плавильне.</p>
    `
  },
  
  collection: {
    title: '📦 Коллекция',
    text: `
      <p><strong>Коллекция</strong> — ваша энциклопедия добытых слитков и Зал Славы.</p>
      <p>📌 <strong>Энциклопедия:</strong> показывает все слитки в игре. Открытые отображаются цветными, неоткрытые — силуэтами. Прогресс-бар вверху показывает общий процент открытий.</p>
      <p>📌 <strong>Зал Славы:</strong> здесь хранятся уникальные Коллекционные Артефакты — самые редкие предметы игры. Они добываются из особых жеод.</p>
      <p>📌 <strong>Коллекционные артефакты:</strong> нельзя продать или использовать в крафте — это чистый престиж!</p>
      <p>💡 <strong>Совет:</strong> следите за особыми жеодами — они выпадают с низким шансом, но содержат артефакты для Зала Славы.</p>
    `
  },
  
  events: {
    title: '🎮 Игры',
    text: `
      <p><strong>Вкладка Игр</strong> объединяет глобальные события, заказы Гильдии и мини-игры.</p>
      <p>📌 <strong>🌐 Глобальное событие:</strong> автоматически запускается каждые 30 минут на 15 минут. Бывает два типа:</p>
      <p>　• <strong>🔥 Великая Переплавка</strong> — открывает доступ к Плавильне, где можно создавать крафтовые слитки из ресурсов.</p>
      <p>　• <strong>☄️ Метеоритный Шторм</strong> — ловите падающие метеориты тапами, собирайте осколки и обменивайте их на редкие жеоды в Магазине.</p>
      <p>📌 <strong>📜 Заказы Гильдии:</strong> 3 случайных задания на доставку слитков. Выполняйте их для получения опыта и бонусных жеод.</p>
      <p>📌 <strong>🎰 Мини-игры:</strong> Закалка (ур. 1), Стопка (ур. 5), Кузнечный Апгрейд (ур. 10) — каждая со своими наградами.</p>
      <p>💡 <strong>Совет:</strong> заходите во вкладку Игр почаще — Заказы Гильдии обновляются, а ивенты дают огромные бонусы!</p>
    `
  },
  
  profile: {
    title: '👤 Профиль',
    text: `
      <p><strong>Профиль</strong> — информация о вашем персонаже.</p>
      <p>📌 <strong>Уровень и статус:</strong> растёт с эволюцией Слитка. От «Новичка» до «Легенды» — всего 20 уровней.</p>
      <p>📌 <strong>Опыт (XP):</strong> накапливается при открытии жеод, выполнении заказов и мини-играх. Когда шкала заполнена — можно повысить уровень Слитка.</p>
      <p>📌 <strong>💰 Сбыт сырья:</strong> здесь можно продать ненужные слитки за опыт. Коллекционные артефакты продать нельзя!</p>
      <p>📌 <strong>🏆 ТОП ИГРОКОВ:</strong> локальная таблица лидеров (заглушка).</p>
      <p>📌 <strong>🎨 Сменить тему:</strong> переключение между тёмной и светлой темой.</p>
      <p>💡 <strong>Совет:</strong> не продавайте слитки, которые нужны для эволюции Слитка или крафта! Проверьте требования заранее.</p>
    `
  }
};

// ========== ПОКАЗ СПРАВКИ ==========
export function showHelp(tabId) {
  const help = HELP_CONTENT[tabId];
  if (!help) return;
  
  import('./ui.js').then(ui => {
    const html = `
      <div class="modal-header">
        <div class="modal-title">${help.title}</div>
        <button class="modal-close" onclick="document.dispatchEvent(new Event('closeModal'))">✕</button>
      </div>
      <div class="modal-content" style="text-align:left; line-height:1.7; font-size:13px;">
        ${help.text}
      </div>
    `;
    ui.openModal(html);
  });
}

// ========== ТУТОРИАЛ: ШАГИ ==========
const TUTORIAL_STEPS = [
  {
    tabId: 'ingot',
    targetSelector: '#ingotImageContainer',
    title: '⚒️ Ваш Слиток',
    text: 'Это — сердце игры! Тапайте по Слитку, чтобы добывать кузнечную стружку. С шансом 1% активируется КУЗНЕЧНЫЙ РАЖ — ×4 стружки на 10 секунд! Попробуйте тапнуть прямо сейчас!',
    position: 'bottom'
  },
  {
    tabId: 'expeditions',
    targetSelector: '#mainContent .card:first-child',
    title: '⛏️ Экспедиции',
    text: 'Отправляйте шахтёров в экспедиции за жеодами. Разбивайте жеоды тапами — и получайте ценные слитки! Начните с Шахт.',
    position: 'bottom'
  },
  {
    tabId: 'inventory',
    targetSelector: '#mainContent .inventory-subtabs',
    title: '🎒 Инвентарь',
    text: 'Все ваши жеоды и добытые слитки хранятся здесь. Переключайтесь между вкладками «Жеоды» и «Слитки».',
    position: 'bottom'
  },
  {
    tabId: 'events',
    targetSelector: '#mainContent .card:first-of-type',
    title: '🎮 Игры и Ивенты',
    text: 'Глобальные события запускаются каждые 30 минут. Заказы Гильдии и мини-игры — здесь. Заглядывайте почаще!',
    position: 'bottom'
  },
  {
    tabId: 'profile',
    targetSelector: '#mainContent .profile-header',
    title: '👤 Профиль',
    text: 'Ваш прогресс, статистика и сбыт сырья. Кнопка <b>?</b> в правом верхнем углу любой вкладки всегда подскажет, если что-то забудете!',
    position: 'bottom'
  },
  {
    tabId: null,
    targetSelector: null,
    title: '🎉 Вы готовы!',
    text: 'Теперь вы — настоящий Старатель! Тапайте Слиток, собирайте коллекцию и становитесь Легендой космоса. Удачи!',
    position: 'center'
  }
];

let currentStep = 0;
let tutorialActive = false;
let tutorialElements = {};

// ========== ИНЖЕКТ СТИЛЕЙ ==========
function injectTutorialStyles() {
  if (document.getElementById('tutorialStyles')) return;
  
  const style = document.createElement('style');
  style.id = 'tutorialStyles';
  style.textContent = `
    .tutorial-overlay {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.82);
      z-index: 90;
      pointer-events: none;
    }
    
    .tutorial-spotlight-element {
      position: relative !important;
      z-index: 95 !important;
      pointer-events: auto !important;
      filter: brightness(1.3) drop-shadow(0 0 20px rgba(255, 215, 0, 0.7)) !important;
      transition: filter 0.3s ease !important;
    }
    
    .tutorial-skip-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 96;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.6);
      padding: 8px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-family: 'Montserrat', sans-serif;
      pointer-events: auto;
    }
    .tutorial-skip-btn:active {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
    }
    
    .tutorial-hint {
      position: absolute;
      z-index: 96;
      background: rgba(22, 22, 26, 0.97);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 215, 0, 0.35);
      border-radius: 22px;
      padding: 18px 16px 14px;
      max-width: 260px;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
      animation: hintSlideIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      pointer-events: auto;
    }
    
    @keyframes hintSlideIn {
      0% { opacity: 0; transform: translateY(12px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    
    [data-theme="light"] .tutorial-hint {
      background: rgba(255, 255, 255, 0.97);
      border-color: rgba(184, 134, 11, 0.35);
    }
    
    .tutorial-hint-arrow {
      position: absolute;
      width: 12px;
      height: 12px;
      background: rgba(22, 22, 26, 0.97);
      border-left: 1px solid rgba(255, 215, 0, 0.35);
      border-bottom: 1px solid rgba(255, 215, 0, 0.35);
      left: 50%;
      margin-left: -6px;
    }
    .tutorial-hint-arrow.top { top: -6px; transform: rotate(135deg); }
    .tutorial-hint-arrow.bottom { bottom: -6px; transform: rotate(-45deg); }
    
    [data-theme="light"] .tutorial-hint-arrow {
      background: rgba(255, 255, 255, 0.97);
      border-color: rgba(184, 134, 11, 0.35);
    }
    
    .tutorial-hint-pulse {
      position: absolute;
      top: 10px; right: 10px;
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #FFD700;
      animation: hintDotPulse 1.5s ease-in-out infinite;
    }
    @keyframes hintDotPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.3; transform: scale(2); }
    }
    
    .tutorial-hint-title {
      font-family: 'Unbounded', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: #FFD700;
      margin-bottom: 8px;
      line-height: 1.3;
    }
    
    .tutorial-hint-text {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.82);
      line-height: 1.6;
      margin-bottom: 14px;
    }
    
    [data-theme="light"] .tutorial-hint-text {
      color: rgba(0, 0, 0, 0.7);
    }
    
    .tutorial-hint-btn {
      background: linear-gradient(135deg, #FFD700, #FF8C00);
      color: #000;
      border: none;
      padding: 10px 26px;
      border-radius: 50px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(255, 140, 0, 0.35);
      font-family: 'Montserrat', sans-serif;
      transition: all 0.2s;
    }
    .tutorial-hint-btn:active { transform: scale(0.94); }
  `;
  document.head.appendChild(style);
}

// ========== СОЗДАНИЕ ЭЛЕМЕНТОВ ==========
function createTutorialElements() {
  const app = document.getElementById('app');
  if (!app) return false;
  
  // Убеждаемся что app имеет position: relative
  const appStyle = window.getComputedStyle(app);
  if (appStyle.position === 'static') {
    app.style.position = 'relative';
  }
  
  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'tutorial-overlay';
  overlay.id = 'tutorialOverlay';
  app.appendChild(overlay);
  tutorialElements.overlay = overlay;
  
  // Hint
  const hint = document.createElement('div');
  hint.className = 'tutorial-hint';
  hint.id = 'tutorialHint';
  hint.style.opacity = '0';
  app.appendChild(hint);
  tutorialElements.hint = hint;
  
  // Skip button
  const skipBtn = document.createElement('button');
  skipBtn.className = 'tutorial-skip-btn';
  skipBtn.textContent = 'Пропустить ›';
  skipBtn.addEventListener('click', skipTutorial);
  app.appendChild(skipBtn);
  tutorialElements.skipBtn = skipBtn;
  
  return true;
}

// ========== ПОДСВЕТКА ЭЛЕМЕНТА ==========
function spotlightElement(selector) {
  // Снимаем подсветку с предыдущего
  const prev = document.querySelector('.tutorial-spotlight-element');
  if (prev) {
    prev.classList.remove('tutorial-spotlight-element');
  }
  
  if (!selector) return;
  
  const target = document.querySelector(selector);
  if (target) {
    target.classList.add('tutorial-spotlight-element');
    tutorialElements._currentSpotlight = target;
  }
}

// ========== ПОЗИЦИОНИРОВАНИЕ ХИНТА ==========
function positionHint(step) {
  const hint = tutorialElements.hint;
  const app = document.getElementById('app');
  if (!hint || !app) return;
  
  const appRect = app.getBoundingClientRect();
  const hintWidth = 260;
  
  hint.innerHTML = `
    <div class="tutorial-hint-pulse"></div>
    <div class="tutorial-hint-arrow ${step.position === 'top' ? 'bottom' : 'top'}"></div>
    <div class="tutorial-hint-title">${step.title}</div>
    <div class="tutorial-hint-text">${step.text}</div>
    <button class="tutorial-hint-btn" id="tutorialNextBtn">${currentStep < TUTORIAL_STEPS.length - 1 ? 'Далее →' : 'В бой! 🚀'}</button>
  `;
  
  let top, left;
  
  if (step.position === 'center' || !step.targetSelector) {
    // Центр экрана
    top = (app.clientHeight / 2) - 100;
    left = (app.clientWidth / 2) - (hintWidth / 2);
    
    const arrow = hint.querySelector('.tutorial-hint-arrow');
    if (arrow) arrow.style.display = 'none';
  } else {
    const target = document.querySelector(step.targetSelector);
    if (!target) {
      top = (app.clientHeight / 2) - 100;
      left = (app.clientWidth / 2) - (hintWidth / 2);
    } else {
      const targetRect = target.getBoundingClientRect();
      const targetTop = targetRect.top - appRect.top;
      const targetLeft = targetRect.left - appRect.left;
      const targetWidth = targetRect.width;
      const targetHeight = targetRect.height;
      const targetCenterX = targetLeft + targetWidth / 2;
      
      const hintHeight = 180;
      
      if (step.position === 'top') {
        top = targetTop - hintHeight - 16;
      } else {
        top = targetTop + targetHeight + 16;
      }
      
      left = targetCenterX - hintWidth / 2;
      
      // Не вылезаем за границы
      left = Math.max(8, Math.min(left, app.clientWidth - hintWidth - 8));
      top = Math.max(50, Math.min(top, app.clientHeight - hintHeight - 70));
    }
  }
  
  hint.style.top = top + 'px';
  hint.style.left = left + 'px';
  hint.style.opacity = '1';
  
  // Вешаем обработчик
  setTimeout(() => {
    const btn = document.getElementById('tutorialNextBtn');
    if (btn) {
      btn.addEventListener('click', () => nextTutorialStep());
    }
  }, 50);
}

// ========== ПЕРЕКЛЮЧЕНИЕ ВКЛАДКИ ==========
function switchToTab(tabId) {
  import('./ui.js').then(ui => {
    ui.setActiveTab(tabId);
    
    // Даём время на рендер, потом показываем подсказку
    setTimeout(() => {
      const step = TUTORIAL_STEPS[currentStep];
      spotlightElement(step.targetSelector);
      positionHint(step);
    }, 300);
  });
}

// ========== НАВИГАЦИЯ ==========
function nextTutorialStep() {
  currentStep++;
  
  if (currentStep >= TUTORIAL_STEPS.length) {
    finishTutorial();
    return;
  }
  
  const step = TUTORIAL_STEPS[currentStep];
  
  if (step.tabId) {
    // Переключаем вкладку игры
    switchToTab(step.tabId);
  } else {
    // Финальный шаг — без переключения
    spotlightElement(null);
    positionHint(step);
  }
}

function skipTutorial() {
  currentStep = TUTORIAL_STEPS.length;
  finishTutorial();
}

// ========== ФИНАЛИЗАЦИЯ ==========
function finishTutorial() {
  tutorialActive = false;
  
  // Убираем spotlight с элемента
  const prev = document.querySelector('.tutorial-spotlight-element');
  if (prev) {
    prev.classList.remove('tutorial-spotlight-element');
  }
  
  // Удаляем элементы
  Object.values(tutorialElements).forEach(el => {
    if (el && el.parentNode) el.remove();
  });
  tutorialElements = {};
  
  currentStep = 0;
  markTutorialCompleted();
}

// ========== ЗАПУСК ==========
export function startTutorial() {
  if (isTutorialCompleted()) return;
  if (tutorialActive) return;
  
  currentStep = 0;
  tutorialActive = true;
  
  injectTutorialStyles();
  
  if (!createTutorialElements()) return;
  
  // Запускаем первый шаг
  const step = TUTORIAL_STEPS[0];
  switchToTab(step.tabId);
}
