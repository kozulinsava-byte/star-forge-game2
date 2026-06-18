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
    targetSelector: '.tab-item[data-tab="ingot"]',
    title: '⚒️ Ваш Слиток',
    text: 'Это — сердце игры! Тапайте по Слитку, чтобы добывать кузнечную стружку. Каждый тап приносит очки и приближает вас к эволюции.',
    position: 'bottom'
  },
  {
    targetSelector: '.tab-item[data-tab="expeditions"]',
    title: '⛏️ Экспедиции',
    text: 'Отправляйте шахтёров в экспедиции, чтобы добывать жеоды. Разбивайте жеоды — и получайте ценные слитки! Начните с Шахт.',
    position: 'bottom'
  },
  {
    targetSelector: '.tab-item[data-tab="inventory"]',
    title: '🎒 Инвентарь',
    text: 'Здесь хранятся все ваши жеоды и добытые слитки. Нажмите на жеоду, чтобы расколоть её и получить случайный слиток.',
    position: 'bottom'
  },
  {
    targetSelector: '.tab-item[data-tab="events"]',
    title: '🎮 Игры и Ивенты',
    text: 'Глобальные события запускаются каждые 30 минут, а Заказы Гильдии дают дополнительные награды. Заглядывайте сюда почаще!',
    position: 'bottom'
  },
  {
    targetSelector: '.tab-item[data-tab="profile"]',
    title: '👤 Профиль',
    text: 'Ваш прогресс, уровень, статистика и сбыт сырья. Когда шкала опыта заполнится — возвращайтесь к Слитку для эволюции!',
    position: 'bottom'
  },
  {
    targetSelector: null,
    title: '🎉 Вы готовы!',
    text: 'Теперь вы знаете основы. Тапайте Слиток, отправляйте экспедиции, собирайте коллекцию и становитесь Легендой! Кнопка <b>?</b> в правом верхнем углу всегда подскажет, если что-то забудете. Удачи, Старатель!',
    position: 'center'
  }
];

let currentStep = 0;
let overlayEl = null;
let spotlightEl = null;
let hintEl = null;

function createTutorialOverlay() {
  overlayEl = document.createElement('div');
  overlayEl.className = 'tutorial-overlay';
  overlayEl.id = 'tutorialOverlay';
  document.body.appendChild(overlayEl);
  
  spotlightEl = document.createElement('div');
  spotlightEl.className = 'tutorial-spotlight';
  spotlightEl.id = 'tutorialSpotlight';
  document.body.appendChild(spotlightEl);
  
  hintEl = document.createElement('div');
  hintEl.className = 'tutorial-hint';
  hintEl.id = 'tutorialHint';
  document.body.appendChild(hintEl);
  
  // CSS для туториала
  const style = document.createElement('style');
  style.id = 'tutorialStyles';
  style.textContent = `
    .tutorial-overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.85);
      z-index: 10050;
      pointer-events: all;
      transition: opacity 0.4s ease;
    }
    
    .tutorial-spotlight {
      position: fixed;
      z-index: 10051;
      pointer-events: none;
      border-radius: 20px;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.85), 0 0 30px rgba(255, 215, 0, 0.6);
      transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    
    .tutorial-hint {
      position: fixed;
      z-index: 10052;
      background: rgba(20, 20, 22, 0.97);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 215, 0, 0.3);
      border-radius: 24px;
      padding: 20px 22px;
      max-width: 300px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    
    [data-theme="light"] .tutorial-hint {
      background: rgba(255, 255, 255, 0.97);
      border-color: rgba(184, 134, 11, 0.3);
    }
    
    .tutorial-hint-title {
      font-family: 'Unbounded', sans-serif;
      font-size: 18px;
      font-weight: 700;
      color: #FFD700;
      margin-bottom: 10px;
    }
    
    .tutorial-hint-text {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.85);
      line-height: 1.6;
      margin-bottom: 18px;
    }
    
    [data-theme="light"] .tutorial-hint-text {
      color: rgba(0, 0, 0, 0.75);
    }
    
    .tutorial-hint-btn {
      background: linear-gradient(135deg, #FFD700, #FF8C00);
      color: #000;
      border: none;
      padding: 12px 28px;
      border-radius: 50px;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
    }
    .tutorial-hint-btn:active { transform: scale(0.95); }
    
    .tutorial-skip {
      position: fixed;
      bottom: 30px;
      right: 20px;
      z-index: 10052;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.5);
      padding: 10px 20px;
      border-radius: 50px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tutorial-skip:active { background: rgba(255, 255, 255, 0.1); }
    .tutorial-skip:hover { color: rgba(255, 255, 255, 0.8); }
  `;
  document.head.appendChild(style);
}

function positionSpotlight(targetEl) {
  if (!targetEl || !spotlightEl) return;
  
  const rect = targetEl.getBoundingClientRect();
  const padding = 6;
  
  spotlightEl.style.top = (rect.top - padding) + 'px';
  spotlightEl.style.left = (rect.left - padding) + 'px';
  spotlightEl.style.width = (rect.width + padding * 2) + 'px';
  spotlightEl.style.height = (rect.height + padding * 2) + 'px';
}

function positionHint(targetEl, step, position) {
  if (!hintEl) return;
  
  hintEl.innerHTML = `
    <div class="tutorial-hint-title">${step.title}</div>
    <div class="tutorial-hint-text">${step.text}</div>
    <button class="tutorial-hint-btn" id="tutorialNextBtn">${currentStep < TUTORIAL_STEPS.length - 1 ? 'Далее →' : 'Начать игру! 🚀'}</button>
  `;
  
  if (position === 'center') {
    hintEl.style.top = '50%';
    hintEl.style.left = '50%';
    hintEl.style.transform = 'translate(-50%, -50%)';
  } else if (targetEl) {
    const rect = targetEl.getBoundingClientRect();
    const hintWidth = 300;
    
    let top, left;
    
    if (position === 'bottom') {
      top = rect.bottom + 16;
      left = rect.left + rect.width / 2 - hintWidth / 2;
    } else if (position === 'top') {
      top = rect.top - 16;
      left = rect.left + rect.width / 2 - hintWidth / 2;
      hintEl.style.transform = 'translateY(-100%)';
    } else {
      top = rect.top + rect.height / 2;
      left = rect.right + 16;
      hintEl.style.transform = 'translateY(-50%)';
    }
    
    // Не вылезаем за экран
    left = Math.max(10, Math.min(left, window.innerWidth - hintWidth - 10));
    top = Math.max(10, Math.min(top, window.innerHeight - 250));
    
    hintEl.style.top = top + 'px';
    hintEl.style.left = left + 'px';
    hintEl.style.transform = position === 'top' ? 'translateY(-100%)' : 'none';
  }
  
  setTimeout(() => {
    const btn = document.getElementById('tutorialNextBtn');
    if (btn) {
      btn.addEventListener('click', nextTutorialStep);
    }
  }, 50);
}

function nextTutorialStep() {
  currentStep++;
  
  if (currentStep >= TUTORIAL_STEPS.length) {
    finishTutorial();
    return;
  }
  
  const step = TUTORIAL_STEPS[currentStep];
  
  if (step.targetSelector) {
    const targetEl = document.querySelector(step.targetSelector);
    positionSpotlight(targetEl);
    positionHint(targetEl, step, step.position);
  } else {
    // Финальный шаг — по центру
    spotlightEl.style.width = '0px';
    spotlightEl.style.height = '0px';
    positionHint(null, step, 'center');
  }
}

function finishTutorial() {
  if (overlayEl) overlayEl.remove();
  if (spotlightEl) spotlightEl.remove();
  if (hintEl) hintEl.remove();
  
  const skipBtn = document.getElementById('tutorialSkipBtn');
  if (skipBtn) skipBtn.remove();
  
  const style = document.getElementById('tutorialStyles');
  if (style) style.remove();
  
  overlayEl = null;
  spotlightEl = null;
  hintEl = null;
  currentStep = 0;
  
  markTutorialCompleted();
}

function skipTutorial() {
  currentStep = TUTORIAL_STEPS.length;
  finishTutorial();
}

// ========== ЗАПУСК ТУТОРИАЛА ==========
export function startTutorial() {
  if (isTutorialCompleted()) return;
  
  currentStep = 0;
  
  // Небольшая задержка, чтобы UI успел отрендериться
  setTimeout(() => {
    createTutorialOverlay();
    
    // Кнопка «Пропустить»
    const skipBtn = document.createElement('button');
    skipBtn.className = 'tutorial-skip';
    skipBtn.id = 'tutorialSkipBtn';
    skipBtn.textContent = 'Пропустить обучение';
    skipBtn.addEventListener('click', skipTutorial);
    document.body.appendChild(skipBtn);
    
    // Первый шаг
    const step = TUTORIAL_STEPS[0];
    const targetEl = document.querySelector(step.targetSelector);
    positionSpotlight(targetEl);
    positionHint(targetEl, step, step.position);
  }, 600);
}
