// ========== TUTORIAL МОДУЛЬ: ПОЛНЫЙ ИНТЕРАКТИВНЫЙ ПУТЕВОДИТЕЛЬ ==========
// Охват: все 6 вкладок, микро-шаги на каждой, динамические плашки, лёгкое затемнение

export function isTutorialCompleted() {
  return localStorage.getItem('tutorial_completed') === 'true';
}

function markTutorialCompleted() {
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

// ========================================================================
// ПОЛНАЯ СИСТЕМА СЦЕН И ПОДШАГОВ (ОХВАТ ВСЕХ ВКЛАДОК)
// ========================================================================

const TUTORIAL_SCENES = [
  // ===== СЦЕНА 0: ПРИВЕТСТВИЕ =====
  {
    sceneId: 'welcome',
    tabId: null,
    overlayOpacity: 0.3,
    subSteps: [
      {
        targetSelector: null,
        title: '🌟 Добро пожаловать в Star Forge!',
        text: 'Стань легендарным кузнецом космоса. Добывай ресурсы, куй слитки и собирай редчайшие артефакты. Давай освоим основы за пару минут!',
        position: 'center',
        arrowSide: null
      }
    ]
  },

  // ===== СЦЕНА 1: СЛИТОК (2 подшага) =====
  {
    sceneId: 'ingot',
    tabId: 'ingot',
    overlayOpacity: 0.65,
    subSteps: [
      {
        targetSelector: '#ingotImageContainer',
        title: '⚒️ Сердце игры — Слиток',
        text: 'Тапай по нему, чтобы выбивать кузнечную стружку. Каждый тап тратит энергию (синяя полоска). С шансом 1% включается КУЗНЕЧНЫЙ РАЖ — ×4 стружки на 10 секунд!',
        position: 'top',
        arrowSide: 'bottom'
      },
      {
        targetSelector: '.ingot-bottom',
        title: '📋 Цель — эволюция',
        text: 'Здесь — твоя цель. Собери нужное количество стружки и слитков. Когда шкала опыта заполнится — жми «ПЕРЕПЛАВИТЬ СЛИТОК» для повышения уровня!',
        position: 'top',
        arrowSide: 'bottom'
      }
    ]
  },

  // ===== СЦЕНА 2: ЭКСПЕДИЦИИ (2 подшага) =====
  {
    sceneId: 'expeditions',
    tabId: 'expeditions',
    overlayOpacity: 0.65,
    subSteps: [
      {
        targetSelector: '#mainContent .card:first-child .expedition-item',
        title: '⛏️ Шахты — твой первый рубеж',
        text: 'Отправляй шахтёров в Шахты. Они добудут жеоды с медью, железом и углём — основой для первых слитков и эволюции.',
        position: 'bottom',
        arrowSide: 'top'
      },
      {
        targetSelector: '#mainContent .card:nth-child(2), #mainContent .card:nth-child(3)',
        title: '🔒 Новые горизонты',
        text: 'Джунгли (ур. 5) и Пояс Астероидов (ур. 10) откроются позже. Там ждут редкие, эпические и легендарные слитки!',
        position: 'bottom',
        arrowSide: 'top'
      }
    ]
  },

  // ===== СЦЕНА 3: ИНВЕНТАРЬ (2 подшага) =====
  {
    sceneId: 'inventory',
    tabId: 'inventory',
    overlayOpacity: 0.65,
    subSteps: [
      {
        targetSelector: '#mainContent .inventory-subtabs',
        title: '🎒 Твой инвентарь',
        text: 'Здесь хранятся все жеоды и слитки. Переключайся между вкладками «Жеоды» и «Слитки», чтобы видеть свои богатства.',
        position: 'bottom',
        arrowSide: 'top'
      },
      {
        targetSelector: '#mainContent .inventory-subtabs .subtab-btn:last-child',
        title: '✨ Слитки — твоя валюта',
        text: 'Во вкладке «Слитки» ты увидишь все добытые ресурсы. Обычные можно продать в Профиле за опыт. Редкие — береги для эволюции и крафта!',
        position: 'bottom',
        arrowSide: 'top'
      }
    ]
  },

  // ===== СЦЕНА 4: КОЛЛЕКЦИЯ (2 подшага) =====
  {
    sceneId: 'collection',
    tabId: 'collection',
    overlayOpacity: 0.65,
    subSteps: [
      {
        targetSelector: '#mainContent .collection-progress',
        title: '📦 Твоя коллекция',
        text: 'Прогресс-бар показывает, сколько слитков из всей энциклопедии ты уже открыл. Цель — собрать их все!',
        position: 'bottom',
        arrowSide: 'top'
      },
      {
        targetSelector: '#mainContent .inventory-subtabs .subtab-btn:last-child',
        title: '🏆 Зал Славы',
        text: 'Здесь — легендарные Коллекционные Артефакты. Они выпадают из особых жеод и их нельзя продать. Это чистый престиж!',
        position: 'bottom',
        arrowSide: 'top'
      }
    ]
  },

  // ===== СЦЕНА 5: ИГРЫ И ИВЕНТЫ (3 подшага) =====
  {
    sceneId: 'events',
    tabId: 'events',
    overlayOpacity: 0.65,
    subSteps: [
      {
        targetSelector: '#mainContent .card:first-of-type',
        title: '🌐 Глобальные события',
        text: 'Каждые 30 минут запускается случайное событие: Великая Переплавка (крафт слитков) или Метеоритный Шторм (ловля метеоров). Не пропускай!',
        position: 'bottom',
        arrowSide: 'top'
      },
      {
        targetSelector: '#mainContent .mini-game-card:first-of-type',
        title: '🎰 Мини-игры',
        text: 'Закалка (ур. 1), Идеальная Стопка (ур. 5) и Кузнечный Апгрейд (ур. 10). Каждая даёт опыт и награды. Закалка — отличный старт для новичка!',
        position: 'top',
        arrowSide: 'bottom'
      },
      {
        targetSelector: '#mainContent .complete-quest-btn, #mainContent .card:nth-child(4)',
        title: '📜 Заказы Гильдии',
        text: '3 случайных задания на доставку слитков. Выполняй их — получай опыт и бонусные жеоды. Обновляются каждые 10 минут!',
        position: 'top',
        arrowSide: 'bottom'
      }
    ]
  },

  // ===== СЦЕНА 6: ПРОФИЛЬ (2 подшага) =====
  {
    sceneId: 'profile',
    tabId: 'profile',
    overlayOpacity: 0.65,
    subSteps: [
      {
        targetSelector: '#mainContent .profile-header',
        title: '👤 Твой профиль',
        text: 'Здесь — твой уровень, статус и прогресс. От «Новичка» до «Легенды» — 20 уровней. Повышай Слиток — открывай новые эпохи!',
        position: 'bottom',
        arrowSide: 'top'
      },
      {
        targetSelector: '#mainContent .sell-section',
        title: '💰 Сбыт сырья',
        text: 'Продавай обычные слитки за опыт. Но не спеши — они нужны для эволюции Слитка и крафта в Плавильне!',
        position: 'top',
        arrowSide: 'bottom'
      }
    ]
  },

  // ===== СЦЕНА 7: ФИНАЛ =====
  {
    sceneId: 'final',
    tabId: null,
    overlayOpacity: 0.3,
    subSteps: [
      {
        targetSelector: null,
        title: '🎉 Ты готов к приключениям!',
        text: 'Тапай Слиток, отправляй экспедиции, собирай коллекцию и участвуй в ивентах. Кнопка <b>?</b> всегда рядом, если что-то забудешь. Удачи, Старатель!',
        position: 'center',
        arrowSide: null
      }
    ]
  }
];

// ========================================================================
// ДВИЖОК ТУТОРИАЛА
// ========================================================================

let currentSceneIndex = 0;
let currentSubStepIndex = 0;
let tutorialActive = false;
let elements = {};
let spotlightCleanup = null;

// ---------- ИНЖЕКТ СТИЛЕЙ ----------
function injectStyles() {
  if (document.getElementById('tutorialCoreStyles')) return;
  const style = document.createElement('style');
  style.id = 'tutorialCoreStyles';
  style.textContent = `
    #tutorialOverlay {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.65);
      z-index: 80;
      pointer-events: none;
      transition: background 0.5s ease;
      border-radius: 0;
    }
    .tutorial-spotlighted {
      position: relative !important;
      z-index: 85 !important;
      pointer-events: auto !important;
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 140, 0, 0.4) !important;
      border-radius: 16px !important;
      animation: tutGlow 2s ease-in-out infinite !important;
    }
    @keyframes tutGlow {
      0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 140, 0, 0.25); }
      50% { box-shadow: 0 0 40px rgba(255, 215, 0, 1), 0 0 80px rgba(255, 100, 0, 0.6); }
    }
    #tutorialHintBox {
      position: absolute;
      z-index: 90;
      background: rgba(18, 18, 22, 0.97);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 215, 0, 0.35);
      border-radius: 24px;
      padding: 20px 18px 16px;
      max-width: 280px;
      text-align: center;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8);
      pointer-events: auto;
      animation: hintPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      transition: top 0.4s cubic-bezier(0.25, 0.8, 0.25, 1.2), left 0.4s cubic-bezier(0.25, 0.8, 0.25, 1.2);
    }
    @keyframes hintPopIn {
      0% { opacity: 0; transform: scale(0.9); }
      100% { opacity: 1; transform: scale(1); }
    }
    [data-theme="light"] #tutorialHintBox {
      background: rgba(255, 255, 255, 0.97);
      border-color: rgba(184, 134, 11, 0.35);
    }
    #tutorialHintArrow {
      position: absolute;
      width: 14px; height: 14px;
      background: rgba(18, 18, 22, 0.97);
      border-left: 1px solid rgba(255, 215, 0, 0.35);
      border-bottom: 1px solid rgba(255, 215, 0, 0.35);
      left: 50%; margin-left: -7px;
    }
    #tutorialHintArrow.top { top: -7px; transform: rotate(135deg); }
    #tutorialHintArrow.bottom { bottom: -7px; transform: rotate(-45deg); }
    #tutorialHintArrow.left { left: -7px; top: 50%; margin-top: -7px; margin-left: 0; transform: rotate(135deg); }
    #tutorialHintArrow.right { right: -7px; top: 50%; margin-top: -7px; margin-left: 0; transform: rotate(-45deg); }
    [data-theme="light"] #tutorialHintArrow {
      background: rgba(255, 255, 255, 0.97);
      border-color: rgba(184, 134, 11, 0.35);
    }
    #tutorialHintTitle {
      font-family: 'Unbounded', sans-serif;
      font-size: 17px; font-weight: 700;
      color: #FFD700;
      margin-bottom: 10px;
      line-height: 1.3;
    }
    #tutorialHintText {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.65;
      margin-bottom: 16px;
    }
    [data-theme="light"] #tutorialHintText { color: rgba(0, 0, 0, 0.7); }
    #tutorialHintBtn {
      background: linear-gradient(135deg, #FFD700, #FF8C00);
      color: #000;
      border: none;
      padding: 12px 28px;
      border-radius: 50px;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      box-shadow: 0 4px 18px rgba(255, 140, 0, 0.35);
      font-family: 'Montserrat', sans-serif;
      transition: all 0.2s;
    }
    #tutorialHintBtn:active { transform: scale(0.94); }
    #tutorialSkipBtn {
      position: absolute;
      top: 14px; right: 14px;
      z-index: 91;
      background: rgba(0, 0, 0, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: rgba(255, 255, 255, 0.55);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-family: 'Montserrat', sans-serif;
      pointer-events: auto;
    }
    #tutorialSkipBtn:active { background: rgba(255, 255, 255, 0.12); color: #fff; }
    #tutorialStepCounter {
      position: absolute;
      bottom: 16px; left: 50%;
      transform: translateX(-50%);
      z-index: 91;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.3);
      font-family: 'Montserrat', sans-serif;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}

// ---------- ПОДСЧЁТ ШАГОВ ----------
function getTotalSteps() {
  let count = 0;
  for (const scene of TUTORIAL_SCENES) {
    count += scene.subSteps.length;
  }
  return count;
}

function getCurrentGlobalStep() {
  let count = 0;
  for (let s = 0; s < currentSceneIndex; s++) {
    count += TUTORIAL_SCENES[s].subSteps.length;
  }
  count += currentSubStepIndex + 1;
  return count;
}

// ---------- СОЗДАНИЕ UI ----------
function buildUI() {
  const app = document.getElementById('app');
  if (!app) return false;

  const appStyle = window.getComputedStyle(app);
  if (appStyle.position === 'static') {
    app.style.position = 'relative';
  }

  const overlay = document.createElement('div');
  overlay.id = 'tutorialOverlay';
  app.appendChild(overlay);
  elements.overlay = overlay;

  const hint = document.createElement('div');
  hint.id = 'tutorialHintBox';
  hint.style.opacity = '0';
  app.appendChild(hint);
  elements.hint = hint;

  const skip = document.createElement('button');
  skip.id = 'tutorialSkipBtn';
  skip.textContent = 'Пропустить ›';
  skip.addEventListener('click', abortTutorial);
  app.appendChild(skip);
  elements.skip = skip;

  const counter = document.createElement('div');
  counter.id = 'tutorialStepCounter';
  app.appendChild(counter);
  elements.counter = counter;

  return true;
}

// ---------- SPOTLIGHT ----------
function clearSpotlight() {
  if (spotlightCleanup) {
    spotlightCleanup();
    spotlightCleanup = null;
  }
  const prev = document.querySelector('.tutorial-spotlighted');
  if (prev) prev.classList.remove('tutorial-spotlighted');
}

function spotlightTarget(selector) {
  clearSpotlight();
  if (!selector) return;

  // Поддержка множественных селекторов через запятую
  const selectors = selector.split(',').map(s => s.trim());
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) {
      el.classList.add('tutorial-spotlighted');
      if (!spotlightCleanup) {
        const targetEl = el;
        spotlightCleanup = () => {
          const all = document.querySelectorAll('.tutorial-spotlighted');
          all.forEach(e => e.classList.remove('tutorial-spotlighted'));
        };
      }
      return;
    }
  }
}

// ---------- ПОЗИЦИОНИРОВАНИЕ ПЛАШКИ ----------
function positionHintBox(subStep) {
  const hint = elements.hint;
  const app = document.getElementById('app');
  if (!hint || !app) return;

  const appRect = app.getBoundingClientRect();
  const totalSteps = getTotalSteps();
  const currentGlobal = getCurrentGlobalStep();

  hint.innerHTML = `
    <div id="tutorialHintArrow" class="${subStep.arrowSide || ''}"></div>
    <div id="tutorialHintTitle">${subStep.title}</div>
    <div id="tutorialHintText">${subStep.text}</div>
    <button id="tutorialHintBtn">${currentGlobal >= totalSteps ? 'В бой! 🚀' : 'Далее →'}</button>
  `;

  const hintWidth = 280;
  const hintHeight = 200;
  let top, left;

  // Ищем цель (поддержка множественных селекторов)
  let target = null;
  if (subStep.targetSelector) {
    const selectors = subStep.targetSelector.split(',').map(s => s.trim());
    for (const sel of selectors) {
      target = document.querySelector(sel);
      if (target) break;
    }
  }

  if (!target || subStep.position === 'center') {
    top = (app.clientHeight / 2) - (hintHeight / 2);
    left = (app.clientWidth / 2) - (hintWidth / 2);
    const arrow = hint.querySelector('#tutorialHintArrow');
    if (arrow) arrow.style.display = 'none';
  } else {
    const targetRect = target.getBoundingClientRect();
    const targetTop = targetRect.top - appRect.top;
    const targetLeft = targetRect.left - appRect.left;
    const targetWidth = targetRect.width;
    const targetHeight = targetRect.height;
    const targetCenterX = targetLeft + targetWidth / 2;
    const gap = 16;

    if (subStep.position === 'top') {
      top = targetTop - hintHeight - gap;
      left = targetCenterX - hintWidth / 2;
    } else if (subStep.position === 'bottom') {
      top = targetTop + targetHeight + gap;
      left = targetCenterX - hintWidth / 2;
    } else if (subStep.position === 'left') {
      left = targetLeft - hintWidth - gap;
      top = targetTop + targetHeight / 2 - hintHeight / 2;
    } else if (subStep.position === 'right') {
      left = targetLeft + targetWidth + gap;
      top = targetTop + targetHeight / 2 - hintHeight / 2;
    } else {
      top = targetTop + targetHeight + gap;
      left = targetCenterX - hintWidth / 2;
    }

    left = Math.max(8, Math.min(left, app.clientWidth - hintWidth - 8));
    top = Math.max(40, Math.min(top, app.clientHeight - hintHeight - 80));

    const arrow = hint.querySelector('#tutorialHintArrow');
    if (arrow) {
      arrow.style.display = 'block';
      if (subStep.position === 'top' || subStep.position === 'bottom') {
        const offsetX = targetCenterX - (left + hintWidth / 2);
        arrow.style.left = (hintWidth / 2 + offsetX - 7) + 'px';
      }
    }
  }

  hint.style.top = top + 'px';
  hint.style.left = left + 'px';
  hint.style.opacity = '1';

  if (elements.counter) {
    elements.counter.textContent = `Шаг ${currentGlobal} из ${totalSteps}`;
  }

  setTimeout(() => {
    const btn = document.getElementById('tutorialHintBtn');
    if (btn) {
      const handler = () => advanceTutorial();
      btn.addEventListener('click', handler);
      elements._btnHandler = { btn, handler };
    }
  }, 30);
}

// ---------- ОЧИСТКА ОБРАБОТЧИКА ----------
function clearBtnHandler() {
  if (elements._btnHandler) {
    elements._btnHandler.btn.removeEventListener('click', elements._btnHandler.handler);
    elements._btnHandler = null;
  }
}

// ---------- ПЕРЕКЛЮЧЕНИЕ ВКЛАДКИ ----------
function switchGameTab(tabId) {
  return new Promise((resolve) => {
    import('./ui.js').then(ui => {
      ui.setActiveTab(tabId);
      setTimeout(resolve, 400);
    });
  });
}

// ---------- РЕНДЕР ПОДШАГА ----------
async function renderCurrentSubStep() {
  const scene = TUTORIAL_SCENES[currentSceneIndex];
  if (!scene) return;
  const subStep = scene.subSteps[currentSubStepIndex];
  if (!subStep) return;

  if (elements.overlay) {
    elements.overlay.style.background = `rgba(0, 0, 0, ${scene.overlayOpacity})`;
  }

  spotlightTarget(subStep.targetSelector);
  positionHintBox(subStep);
}

// ---------- ПРОДВИЖЕНИЕ ----------
async function advanceTutorial() {
  clearBtnHandler();

  const scene = TUTORIAL_SCENES[currentSceneIndex];
  if (!scene) { finishTutorial(); return; }

  currentSubStepIndex++;

  if (currentSubStepIndex >= scene.subSteps.length) {
    currentSubStepIndex = 0;
    currentSceneIndex++;

    if (currentSceneIndex >= TUTORIAL_SCENES.length) {
      finishTutorial();
      return;
    }

    const nextScene = TUTORIAL_SCENES[currentSceneIndex];
    if (nextScene.tabId) {
      clearSpotlight();
      if (elements.hint) elements.hint.style.opacity = '0';
      await switchGameTab(nextScene.tabId);
    }
  }

  renderCurrentSubStep();
}

// ---------- АВАРИЙНЫЙ ВЫХОД ----------
function abortTutorial() {
  clearBtnHandler();
  finishTutorial();
}

// ---------- ЗАВЕРШЕНИЕ ----------
function finishTutorial() {
  tutorialActive = false;
  clearSpotlight();
  clearBtnHandler();

  Object.values(elements).forEach(el => {
    if (el && el.parentNode) el.remove();
  });
  elements = {};
  spotlightCleanup = null;

  const style = document.getElementById('tutorialCoreStyles');
  if (style) style.remove();

  currentSceneIndex = 0;
  currentSubStepIndex = 0;
  markTutorialCompleted();
}

// ========================================================================
// ПУБЛИЧНЫЙ API
// ========================================================================

export async function startTutorial() {
  if (isTutorialCompleted()) return;
  if (tutorialActive) return;

  tutorialActive = true;
  currentSceneIndex = 0;
  currentSubStepIndex = 0;

  injectStyles();
  if (!buildUI()) return;

  const firstScene = TUTORIAL_SCENES[0];
  if (elements.overlay) {
    elements.overlay.style.background = `rgba(0, 0, 0, ${firstScene.overlayOpacity})`;
  }
  renderCurrentSubStep();
}
