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
    id: 'ingot',
    targetSelector: '.tab-item[data-tab="ingot"]',
    title: '⚒️ Ваш Слиток',
    text: 'Это — сердце игры! Нажмите на Слиток, чтобы добывать кузнечную стружку. С шансом 1% активируется КУЗНЕЧНЫЙ РАЖ — ×4 стружки на 10 секунд!',
    position: 'top',
    action: 'click_target'
  },
  {
    id: 'expeditions',
    targetSelector: '.tab-item[data-tab="expeditions"]',
    title: '⛏️ Экспедиции',
    text: 'Отправляйте шахтёров в экспедиции за жеодами. Разбивайте жеоды тапами — и получайте ценные слитки! Начните с Шахт.',
    position: 'top',
    action: 'click_target'
  },
  {
    id: 'inventory',
    targetSelector: '.tab-item[data-tab="inventory"]',
    title: '🎒 Инвентарь',
    text: 'Все ваши жеоды и слитки хранятся здесь. Нажмите на жеоду, чтобы расколоть её!',
    position: 'top',
    action: 'click_target'
  },
  {
    id: 'events',
    targetSelector: '.tab-item[data-tab="events"]',
    title: '🎮 Игры и Ивенты',
    text: 'Глобальные события каждые 30 минут, Заказы Гильдии и мини-игры. Заглядывайте почаще!',
    position: 'top',
    action: 'click_target'
  },
  {
    id: 'profile',
    targetSelector: '.tab-item[data-tab="profile"]',
    title: '👤 Профиль',
    text: 'Ваш прогресс, статистика и сбыт сырья. Кнопка <b>?</b> всегда подскажет, если забыли что-то важное!',
    position: 'top',
    action: 'click_target'
  },
  {
    id: 'final',
    targetSelector: null,
    title: '🎉 Вы готовы!',
    text: 'Теперь вы — настоящий Старатель! Тапайте Слиток, собирайте коллекцию и становитесь Легендой космоса. Удачи!',
    position: 'center',
    action: 'click_button'
  }
];

let currentStep = 0;
let tutorialElements = {};
let isTutorialActive = false;

// ========== СОЗДАНИЕ ЭЛЕМЕНТОВ ТУТОРИАЛА ==========
function createTutorialOverlay() {
  const app = document.getElementById('app');
  if (!app) return;
  
  // Добавляем CSS один раз
  if (!document.getElementById('tutorialStyles')) {
    const style = document.createElement('style');
    style.id = 'tutorialStyles';
    style.textContent = `
      .tutorial-overlay {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 100;
        pointer-events: all;
        transition: opacity 0.4s ease;
        border-radius: 0;
      }
      
      .tutorial-skip-btn {
        position: absolute;
        top: 12px;
        right: 16px;
        z-index: 102;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.25);
        color: rgba(255, 255, 255, 0.6);
        padding: 8px 16px;
        border-radius: 50px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        font-family: 'Montserrat', sans-serif;
      }
      .tutorial-skip-btn:active {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }
      
      .tutorial-spotlight {
        position: absolute;
        z-index: 101;
        pointer-events: none;
        border-radius: 16px;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.7), 0 0 80px rgba(255, 140, 0, 0.3);
        animation: tutorialGlow 2s ease-in-out infinite;
        transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      
      @keyframes tutorialGlow {
        0%, 100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.5), 0 0 60px rgba(255, 140, 0, 0.2); }
        50% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.8), 0 0 50px rgba(255, 215, 0, 0.9), 0 0 100px rgba(255, 100, 0, 0.5); }
      }
      
      .tutorial-spotlight.clickable {
        pointer-events: all;
        cursor: pointer;
      }
      
      .tutorial-hint {
        position: absolute;
        z-index: 103;
        background: rgba(20, 20, 24, 0.97);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 215, 0, 0.35);
        border-radius: 20px;
        padding: 18px 16px;
        max-width: 260px;
        text-align: center;
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
        transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        animation: hintAppear 0.4s ease-out;
      }
      
      @keyframes hintAppear {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      
      [data-theme="light"] .tutorial-hint {
        background: rgba(255, 255, 255, 0.97);
        border-color: rgba(184, 134, 11, 0.35);
      }
      
      .tutorial-hint-arrow {
        position: absolute;
        width: 14px;
        height: 14px;
        background: rgba(20, 20, 24, 0.97);
        border-left: 1px solid rgba(255, 215, 0, 0.35);
        border-bottom: 1px solid rgba(255, 215, 0, 0.35);
        transform: rotate(45deg);
      }
      [data-theme="light"] .tutorial-hint-arrow {
        background: rgba(255, 255, 255, 0.97);
        border-color: rgba(184, 134, 11, 0.35);
      }
      
      .tutorial-hint-arrow.bottom { top: -7px; left: 50%; margin-left: -7px; }
      .tutorial-hint-arrow.top { bottom: -7px; left: 50%; margin-left: -7px; transform: rotate(225deg); }
      .tutorial-hint-arrow.right { left: -7px; top: 50%; margin-top: -7px; transform: rotate(135deg); }
      .tutorial-hint-arrow.left { right: -7px; top: 50%; margin-top: -7px; transform: rotate(315deg); }
      
      .tutorial-hint-title {
        font-family: 'Unbounded', sans-serif;
        font-size: 16px;
        font-weight: 700;
        color: #FFD700;
        margin-bottom: 10px;
        line-height: 1.3;
      }
      
      .tutorial-hint-text {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.8);
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
        padding: 10px 24px;
        border-radius: 50px;
        font-weight: 700;
        font-size: 14px;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(255, 140, 0, 0.3);
        font-family: 'Montserrat', sans-serif;
        transition: all 0.2s;
      }
      .tutorial-hint-btn:active { transform: scale(0.95); box-shadow: 0 2px 8px rgba(255, 140, 0, 0.2); }
      
      .tutorial-hint-pulse {
        position: absolute;
        top: 8px; right: 8px;
        width: 10px; height: 10px;
        border-radius: 50%;
        background: #FFD700;
        animation: hintDotPulse 1.5s ease-in-out infinite;
      }
      @keyframes hintDotPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.4; transform: scale(1.8); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'tutorial-overlay';
  overlay.id = 'tutorialOverlay';
  app.appendChild(overlay);
  tutorialElements.overlay = overlay;
  
  // Spotlight
  const spotlight = document.createElement('div');
  spotlight.className = 'tutorial-spotlight';
  spotlight.id = 'tutorialSpotlight';
  app.appendChild(spotlight);
  tutorialElements.spotlight = spotlight;
  
  // Hint
  const hint = document.createElement('div');
  hint.className = 'tutorial-hint';
  hint.id = 'tutorialHint';
  app.appendChild(hint);
  tutorialElements.hint = hint;
  
  // Кнопка «Пропустить»
  const skipBtn = document.createElement('button');
  skipBtn.className = 'tutorial-skip-btn';
  skipBtn.textContent = 'Пропустить ›';
  skipBtn.addEventListener('click', skipTutorial);
  app.appendChild(skipBtn);
  tutorialElements.skipBtn = skipBtn;
  
  isTutorialActive = true;
}

// ========== ПОЗИЦИОНИРОВАНИЕ ==========
function positionSpotlight(targetEl) {
  const app = document.getElementById('app');
  if (!targetEl || !tutorialElements.spotlight || !app) return;
  
  const appRect = app.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();
  const padding = 8;
  
  const top = targetRect.top - appRect.top - padding;
  const left = targetRect.left - appRect.left - padding;
  const width = targetRect.width + padding * 2;
  const height = targetRect.height + padding * 2;
  
  tutorialElements.spotlight.style.top = top + 'px';
  tutorialElements.spotlight.style.left = left + 'px';
  tutorialElements.spotlight.style.width = width + 'px';
  tutorialElements.spotlight.style.height = height + 'px';
  
  // Сохраняем позицию цели для позиционирования хинта
  tutorialElements._targetInfo = {
    top, left, width, height,
    targetTop: targetRect.top - appRect.top,
    targetLeft: targetRect.left - appRect.left,
    targetWidth: targetRect.width,
    targetHeight: targetRect.height,
    position: null
  };
}

function positionHint(step, position) {
  const hint = tutorialElements.hint;
  if (!hint) return;
  
  const info = tutorialElements._targetInfo;
  if (!info) return;
  
  // Собираем контент
  hint.innerHTML = `
    <div class="tutorial-hint-pulse"></div>
    <div class="tutorial-hint-arrow ${position === 'top' ? 'bottom' : position === 'bottom' ? 'top' : 'right'}"></div>
    <div class="tutorial-hint-title">${step.title}</div>
    <div class="tutorial-hint-text">${step.text}</div>
    <button class="tutorial-hint-btn" id="tutorialNextBtn">${currentStep < TUTORIAL_STEPS.length - 1 ? 'Далее →' : 'В бой! 🚀'}</button>
  `;
  
  const hintWidth = 260;
  const hintHeight = 180;
  
  let top, left;
  
  if (position === 'center') {
    top = '50%';
    left = '50%';
    hint.style.top = top;
    hint.style.left = left;
    hint.style.transform = 'translate(-50%, -50%)';
    
    const arrow = hint.querySelector('.tutorial-hint-arrow');
    if (arrow) arrow.style.display = 'none';
  } else if (position === 'top') {
    // Хинт над целью
    top = info.top - hintHeight - 16;
    left = info.left + info.width / 2 - hintWidth / 2;
  } else if (position === 'bottom') {
    // Хинт под целью
    top = info.top + info.height + 16;
    left = info.left + info.width / 2 - hintWidth / 2;
  }
  
  // Не вылезаем за границы контейнера
  const app = document.getElementById('app');
  const appW = app ? app.clientWidth : 400;
  const appH = app ? app.clientHeight : 700;
  
  left = Math.max(8, Math.min(left, appW - hintWidth - 8));
  top = Math.max(8, Math.min(top, appH - hintHeight - 60));
  
  hint.style.top = top + 'px';
  hint.style.left = left + 'px';
  hint.style.transform = 'none';
  
  // Позиционируем стрелку
  const arrow = hint.querySelector('.tutorial-hint-arrow');
  if (arrow && position !== 'center') {
    const targetCenterX = info.left + info.width / 2;
    const targetCenterY = position === 'top' ? info.top : info.top + info.height;
    const hintCenterX = left + hintWidth / 2;
    const offsetX = targetCenterX - hintCenterX;
    arrow.style.left = (hintWidth / 2 + offsetX - 7) + 'px';
    arrow.style.display = 'block';
  }
  
  // Вешаем обработчик на кнопку
  setTimeout(() => {
    const btn = document.getElementById('tutorialNextBtn');
    if (btn) {
      btn.addEventListener('click', () => nextTutorialStep());
    }
  }, 50);
}

// ========== ОБРАБОТЧИК КЛИКА ПО ЦЕЛИ ==========
function setupTargetClickListener(step) {
  const targetEl = document.querySelector(step.targetSelector);
  if (!targetEl) return;
  
  // Делаем spotlight кликабельным (он лежит поверх цели)
  const spotlight = tutorialElements.spotlight;
  if (step.action === 'click_target') {
    spotlight.classList.add('clickable');
    
    const handleClick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      spotlight.classList.remove('clickable');
      spotlight.removeEventListener('click', handleClick);
      nextTutorialStep();
    };
    
    spotlight.addEventListener('click', handleClick);
    tutorialElements._clickHandler = handleClick;
  }
}

// ========== НАВИГАЦИЯ ==========
function nextTutorialStep() {
  currentStep++;
  
  if (currentStep >= TUTORIAL_STEPS.length) {
    finishTutorial();
    return;
  }
  
  renderTutorialStep(currentStep);
}

function skipTutorial() {
  currentStep = TUTORIAL_STEPS.length;
  finishTutorial();
}

// ========== РЕНДЕР ШАГА ==========
function renderTutorialStep(stepIndex) {
  const step = TUTORIAL_STEPS[stepIndex];
  if (!step) return;
  
  const spotlight = tutorialElements.spotlight;
  const hint = tutorialElements.hint;
  
  // Сбрасываем обработчик предыдущего шага
  if (tutorialElements._clickHandler && spotlight) {
    spotlight.classList.remove('clickable');
    spotlight.removeEventListener('click', tutorialElements._clickHandler);
    tutorialElements._clickHandler = null;
  }
  
  if (step.targetSelector) {
    const targetEl = document.querySelector(step.targetSelector);
    if (targetEl) {
      positionSpotlight(targetEl);
      positionHint(step, step.position);
      
      if (step.action === 'click_target') {
        setupTargetClickListener(step);
      }
    } else {
      // Цель не найдена — показываем хинт по центру
      if (spotlight) {
        spotlight.style.width = '0px';
        spotlight.style.height = '0px';
      }
      positionHint(step, 'center');
    }
  } else {
    // Финальный шаг — всё по центру
    if (spotlight) {
      spotlight.style.width = '0px';
      spotlight.style.height = '0px';
    }
    positionHint(step, 'center');
  }
}

// ========== ФИНАЛИЗАЦИЯ ==========
function finishTutorial() {
  isTutorialActive = false;
  
  const app = document.getElementById('app');
  
  // Удаляем все элементы туториала
  Object.values(tutorialElements).forEach(el => {
    if (el && el.parentNode) el.remove();
  });
  tutorialElements = {};
  
  // Удаляем стили
  const style = document.getElementById('tutorialStyles');
  if (style) style.remove();
  
  currentStep = 0;
  markTutorialCompleted();
}

// ========== ЗАПУСК ТУТОРИАЛА ==========
export function startTutorial() {
  if (isTutorialCompleted()) return;
  if (isTutorialActive) return;
  
  currentStep = 0;
  
  // Небольшая задержка, чтобы вкладка успела отрендериться
  setTimeout(() => {
    createTutorialOverlay();
    renderTutorialStep(0);
  }, 500);
}
