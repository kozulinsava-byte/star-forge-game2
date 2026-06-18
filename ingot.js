// ========== INGOT МОДУЛЬ: СЛИТОК-КЛИКЕР ==========
import { CONFIG_ITEMS } from './config.js';
import { getPlayerState, saveGame } from './core.js';

// ========== ДАННЫЕ ПРОГРЕССИИ СЛИТКА (15 УРОВНЕЙ) ==========
const INGOT_LEVELS = {
  1: { level: 1, name: 'Ржавый Слиток', icon: '🪨', era: 'Эпоха Шахт', shavingsCost: 150, ingotCost: { copper: 3 }, tapPower: 1, image: 'assets/king_ingot/ingot_1.png' },
  2: { level: 2, name: 'Чугунный Слиток', icon: '⚫', era: 'Эпоха Шахт', shavingsCost: 500, ingotCost: { iron: 2, coal: 2 }, tapPower: 3, image: 'assets/king_ingot/ingot_2.png' },
  3: { level: 3, name: 'Медный Слиток', icon: '🟫', era: 'Эпоха Шахт', shavingsCost: 1500, ingotCost: { copper: 5, tin: 2 }, tapPower: 7, image: 'assets/king_ingot/ingot_3.png' },
  4: { level: 4, name: 'Железный Слиток', icon: '⬜', era: 'Эпоха Шахт', shavingsCost: 4000, ingotCost: { iron: 5, nickel: 2, coal: 3 }, tapPower: 15, image: 'assets/king_ingot/ingot_4.png' },
  5: { level: 5, name: 'Бронзовый Слиток', icon: '🟤', era: 'Эпоха Джунглей', shavingsCost: 10000, ingotCost: { iron: 3, nickel: 3, coal: 4 }, tapPower: 30, image: 'assets/king_ingot/ingot_5.png' },
  6: { level: 6, name: 'Стальной Слиток', icon: '🔩', era: 'Эпоха Джунглей', shavingsCost: 25000, ingotCost: { vinebronze: 2, woodalloy: 1 }, tapPower: 60, image: 'assets/king_ingot/ingot_6.png' },
  7: { level: 7, name: 'Изумрудный Слиток', icon: '💚', era: 'Эпоха Джунглей', shavingsCost: 60000, ingotCost: { emeraldsteel: 2, biocopper: 3 }, tapPower: 120, image: 'assets/king_ingot/ingot_7.png' },
  8: { level: 8, name: 'Окисленный Слиток', icon: '🥈', era: 'Эпоха Джунглей', shavingsCost: 150000, ingotCost: { oxidizedsilver: 2, vinebronze: 3, woodalloy: 2 }, tapPower: 250, image: 'assets/king_ingot/ingot_8.png' },
  9: { level: 9, name: 'Био-Стальной Слиток', icon: '🧬', era: 'Эпоха Джунглей', shavingsCost: 350000, ingotCost: { biocopper: 4, emeraldsteel: 2, woodalloy: 3 }, tapPower: 500, image: 'assets/king_ingot/ingot_9.png' },
  10: { level: 10, name: 'Вольфрамовый Слиток', icon: '⭐', era: 'Пояс Астероидов', shavingsCost: 800000, ingotCost: { oxidizedsilver: 3, emeraldsteel: 3, biocopper: 4 }, tapPower: 1000, image: 'assets/king_ingot/ingot_10.png' },
  11: { level: 11, name: 'Титановый Слиток', icon: '🔷', era: 'Пояс Астероидов', shavingsCost: 1800000, ingotCost: { starchrome: 2, titanium: 2, cobalt: 1 }, tapPower: 2200, image: 'assets/king_ingot/ingot_11.png' },
  12: { level: 12, name: 'Кобальтовый Слиток', icon: '🔵', era: 'Пояс Астероидов', shavingsCost: 4000000, ingotCost: { titanium: 4, starchrome: 3, lunarsilver: 2 }, tapPower: 5000, image: 'assets/king_ingot/ingot_12.png' },
  13: { level: 13, name: 'Иридиевый Слиток', icon: '💠', era: 'Далёкий Космос', shavingsCost: 10000000, ingotCost: { cobalt: 4, titanium: 3, platincon: 2 }, tapPower: 12000, image: 'assets/king_ingot/ingot_13.png' },
  14: { level: 14, name: 'Платиновый Слиток', icon: '💎', era: 'Далёкий Космос', shavingsCost: 25000000, ingotCost: { iridium: 2, platincon: 4, lunarsilver: 3 }, tapPower: 30000, image: 'assets/king_ingot/ingot_14.png' },
  15: { level: 15, name: 'Космониумный Слиток', icon: '🌈', era: 'Далёкий Космос', shavingsCost: 60000000, ingotCost: { platincon: 6, iridium: 3, starchrome: 4 }, tapPower: 70000, image: 'assets/king_ingot/ingot_15.png' }
};

// ========== СОСТОЯНИЕ СЛИТКА ==========
let ingotState = {
  shavings: 0,
  tapEnergy: 500,
  maxTapEnergy: 500,
  lastEnergyRegen: Date.now(),
  levelLocked: false,
  uiUpdateInterval: null,
  lastSaveShavings: 0,
  saveDebounceTimer: null
};

// ========== СОСТОЯНИЕ РЕЖИМА «КУЗНЕЧНЫЙ РАЖ» ==========
let forgeRushState = {
  active: false,
  timeLeft: 0,
  countdownInterval: null,
  countdownDisplay: null
};

// ========== ИНИЦИАЛИЗАЦИЯ ==========
export function initIngotState(savedData) {
  if (savedData) {
    ingotState.shavings = savedData.ingotShavings || 0;
    ingotState.tapEnergy = savedData.tapEnergy || 500;
    ingotState.maxTapEnergy = savedData.maxTapEnergy || 500;
    ingotState.lastEnergyRegen = savedData.lastEnergyRegen || Date.now();
    ingotState.levelLocked = savedData.levelLocked || false;
    ingotState.lastSaveShavings = ingotState.shavings;
  }
}

export function resetIngotState() {
  stopUIUpdates();
  stopForgeRush();
  ingotState.shavings = 0;
  ingotState.tapEnergy = 500;
  ingotState.maxTapEnergy = 500;
  ingotState.lastEnergyRegen = Date.now();
  ingotState.levelLocked = false;
  ingotState.lastSaveShavings = 0;
  if (ingotState.saveDebounceTimer) {
    clearTimeout(ingotState.saveDebounceTimer);
    ingotState.saveDebounceTimer = null;
  }
}

export function getIngotSaveData() {
  return {
    ingotShavings: ingotState.shavings,
    tapEnergy: ingotState.tapEnergy,
    maxTapEnergy: ingotState.maxTapEnergy,
    lastEnergyRegen: ingotState.lastEnergyRegen,
    levelLocked: ingotState.levelLocked
  };
}

export function getShavings() { return ingotState.shavings; }
export function getTapEnergy() { return ingotState.tapEnergy; }
export function getMaxTapEnergy() { return ingotState.maxTapEnergy; }
export function isLevelLocked() { return ingotState.levelLocked; }
export function isForgeRushActive() { return forgeRushState.active; }

export function getCurrentIngotData() {
  const state = getPlayerState();
  return INGOT_LEVELS[state.player.level] || INGOT_LEVELS[1];
}

export function getIngotDataForLevel(level) {
  return INGOT_LEVELS[level] || null;
}

// ========== РЕГЕНЕРАЦИЯ ЭНЕРГИИ ==========
export function regenEnergy() {
  const now = Date.now();
  const elapsed = now - ingotState.lastEnergyRegen;
  const regenAmount = Math.floor(elapsed / 1000) * 3;
  if (regenAmount > 0) {
    ingotState.tapEnergy = Math.min(ingotState.maxTapEnergy, ingotState.tapEnergy + regenAmount);
    ingotState.lastEnergyRegen = now - (elapsed % 1000);
  }
}

// ========== ДЕБАУНС СОХРАНЕНИЕ ==========
function debouncedSave() {
  if (ingotState.saveDebounceTimer) {
    clearTimeout(ingotState.saveDebounceTimer);
  }
  ingotState.saveDebounceTimer = setTimeout(() => {
    ingotState.lastSaveShavings = ingotState.shavings;
    saveGame();
    ingotState.saveDebounceTimer = null;
  }, 50);
}

// ========== ПРИНУДИТЕЛЬНОЕ СОХРАНЕНИЕ ==========
export function forceSaveNow() {
  if (ingotState.saveDebounceTimer) {
    clearTimeout(ingotState.saveDebounceTimer);
    ingotState.saveDebounceTimer = null;
  }
  ingotState.lastSaveShavings = ingotState.shavings;
  saveGame();
}

// ========== ГЕНЕРАТОР ИСКР ==========
function spawnSparks(container, x, y, count) {
  for (let i = 0; i < count; i++) {
    const spark = document.createElement('div');
    spark.className = 'forge-spark';
    spark.style.left = x + 'px';
    spark.style.top = y + 'px';
    
    const angle = Math.random() * Math.PI * 2;
    const distance = 20 + Math.random() * 40;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    
    spark.style.setProperty('--sx', tx + 'px');
    spark.style.setProperty('--sy', ty + 'px');
    
    container.appendChild(spark);
    
    setTimeout(() => {
      spark.remove();
    }, 300);
  }
}

// ========== РЕЖИМ «КУЗНЕЧНЫЙ РАЖ» ==========
function activateForgeRush() {
  if (forgeRushState.active) return;
  
  forgeRushState.active = true;
  forgeRushState.timeLeft = 10;
  
  const ingotScreen = document.querySelector('.ingot-screen');
  if (ingotScreen) {
    ingotScreen.classList.add('forge-rush-active');
  }
  
  // Создаём таймер поверх слитка
  const coreArea = document.getElementById('ingotCoreArea');
  if (coreArea) {
    forgeRushState.countdownDisplay = document.createElement('div');
    forgeRushState.countdownDisplay.className = 'forge-rush-timer';
    forgeRushState.countdownDisplay.textContent = '10';
    coreArea.appendChild(forgeRushState.countdownDisplay);
  }
  
  // Запускаем обратный отсчёт
  forgeRushState.countdownInterval = setInterval(() => {
    forgeRushState.timeLeft--;
    
    if (forgeRushState.countdownDisplay) {
      forgeRushState.countdownDisplay.textContent = forgeRushState.timeLeft;
      
      // Анимация затухания цифры
      forgeRushState.countdownDisplay.classList.remove('timer-pulse');
      void forgeRushState.countdownDisplay.offsetWidth;
      forgeRushState.countdownDisplay.classList.add('timer-pulse');
    }
    
    if (forgeRushState.timeLeft <= 0) {
      deactivateForgeRush();
    }
  }, 1000);
  
  // Форсируем сохранение при активации
  forceSaveNow();
}

function deactivateForgeRush() {
  forgeRushState.active = false;
  forgeRushState.timeLeft = 0;
  
  if (forgeRushState.countdownInterval) {
    clearInterval(forgeRushState.countdownInterval);
    forgeRushState.countdownInterval = null;
  }
  
  if (forgeRushState.countdownDisplay) {
    forgeRushState.countdownDisplay.remove();
    forgeRushState.countdownDisplay = null;
  }
  
  const ingotScreen = document.querySelector('.ingot-screen');
  if (ingotScreen) {
    ingotScreen.classList.remove('forge-rush-active');
  }
  
  // Форсируем сохранение при деактивации
  forceSaveNow();
}

function stopForgeRush() {
  deactivateForgeRush();
}

// ========== ЖИВОЕ ОБНОВЛЕНИЕ ПРОГРЕСС-БАРОВ ==========
function updateBottomProgressBars() {
  const state = getPlayerState();
  
  const LEVELS = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3300, 4000, 4800, 5700, 6700, 7800, 9000, 10300, 11700, 13200, 15000];
  const nextXP = LEVELS[state.player.level] || LEVELS[LEVELS.length - 1];
  
  const shavingsBar = document.getElementById('liveShavingsBar');
  const shavingsLabel = document.getElementById('liveShavingsLabel');
  if (shavingsBar && shavingsLabel) {
    const needed = parseInt(shavingsBar.dataset.needed) || 1;
    const pct = Math.min(100, (ingotState.shavings / needed) * 100);
    shavingsBar.style.width = pct + '%';
    shavingsLabel.textContent = `${ingotState.shavings} / ${needed}`;
  }
  
  const xpBar = document.getElementById('liveXPBar');
  const xpLabel = document.getElementById('liveXPLabel');
  if (xpBar && xpLabel) {
    const pct = Math.min(100, (state.player.xp / nextXP) * 100);
    xpBar.style.width = pct + '%';
    xpLabel.textContent = `${state.player.xp} / ${nextXP}`;
  }
  
  document.querySelectorAll('.ingot-progress-bar-inner.ingot[id^="liveIngotBar_"]').forEach(bar => {
    const ingotId = bar.dataset.ingotId;
    const needed = parseInt(bar.dataset.needed) || 1;
    if (ingotId) {
      const owned = state.ingots[ingotId] || 0;
      const pct = Math.min(100, (owned / needed) * 100);
      bar.style.width = pct + '%';
      
      const label = document.getElementById('liveIngotLabel_' + ingotId);
      if (label) {
        label.textContent = `${owned} / ${needed}`;
      }
    }
  });
}

// ========== ТАП ==========
export function tapIngot() {
  if (ingotState.tapEnergy <= 0) {
    return { success: false, message: 'Нет энергии!' };
  }
  
  const ingotData = getCurrentIngotData();
  let tapPower = ingotData.tapPower || 1;
  
  // Проверка на «Кузнечный раж» — множитель ×4
  if (forgeRushState.active) {
    tapPower = Math.floor(tapPower * 4);
  }
  
  // Обновляем состояние
  ingotState.tapEnergy--;
  ingotState.shavings += tapPower;
  
  // МГНОВЕННОЕ обновление большой цифры стружки
  const shavingsDisplay = document.getElementById('ingotShavingsDisplay');
  if (shavingsDisplay) {
    shavingsDisplay.textContent = ingotState.shavings;
  }
  
  // МГНОВЕННОЕ обновление полоски энергии
  const energyBar = document.getElementById('ingotEnergyBar');
  if (energyBar) {
    const pct = (ingotState.tapEnergy / ingotState.maxTapEnergy) * 100;
    energyBar.style.width = pct + '%';
  }
  
  // МГНОВЕННОЕ обновление прогресс-баров внизу
  updateBottomProgressBars();
  
  // Проверка на активацию «Кузнечного ража» (1% шанс)
  if (!forgeRushState.active && Math.random() < 0.01) {
    activateForgeRush();
    import('./ui.js').then(ui => ui.showToast('⚡ КУЗНЕЧНЫЙ РАЖ! ×4 стружки на 10 секунд!', '🔥'));
  }
  
  // Дебаунс-сохранение (50мс)
  debouncedSave();
  
  return { 
    success: true, 
    shavings: ingotState.shavings, 
    energy: ingotState.tapEnergy, 
    tapPower,
    forgeRush: forgeRushState.active
  };
}

// ========== ЗАСЛОНКА ==========
export function checkLevelLock() {
  const state = getPlayerState();
  const nextXP = getNextLevelXP(state.player.level);
  if (state.player.xp >= nextXP && !ingotState.levelLocked) {
    state.player.xp = nextXP;
    ingotState.levelLocked = true;
    saveGame();
    return true;
  }
  return ingotState.levelLocked;
}

function getNextLevelXP(level) {
  const LEVELS = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3300, 4000, 4800, 5700, 6700, 7800, 9000, 10300, 11700, 13200, 15000];
  return LEVELS[level] || LEVELS[LEVELS.length - 1];
}

// ========== ПЕРЕПЛАВКА ==========
export function performUpgrade() {
  const state = getPlayerState();
  if (!ingotState.levelLocked) return { success: false, message: 'Опыт ещё не заполнен!' };
  const ingotData = INGOT_LEVELS[state.player.level];
  if (!ingotData) return { success: false, message: 'Максимальный уровень!' };
  if (ingotState.shavings < ingotData.shavingsCost) return { success: false, message: `Нужно ${ingotData.shavingsCost} стружки!` };
  if (ingotData.ingotCost) {
    for (let id in ingotData.ingotCost) {
      if ((state.ingots[id] || 0) < ingotData.ingotCost[id]) return { success: false, message: `Недостаточно ${CONFIG_ITEMS[id]?.name || id}!` };
    }
  }
  const oldIngot = { name: ingotData.name, icon: ingotData.icon, era: ingotData.era, level: state.player.level, image: ingotData.image };
  ingotState.shavings -= ingotData.shavingsCost;
  if (ingotData.ingotCost) for (let id in ingotData.ingotCost) state.ingots[id] -= ingotData.ingotCost[id];
  state.player.level++;
  state.player.xp = 0;
  ingotState.levelLocked = false;
  
  forceSaveNow();
  
  const newData = INGOT_LEVELS[state.player.level];
  return { success: true, oldIngot, newIngot: { name: newData.name, icon: newData.icon, era: newData.era, level: state.player.level, image: newData.image } };
}

// ========== ЖИВОЕ ОБНОВЛЕНИЕ UI (ТОЛЬКО ЭНЕРГИЯ) ==========
function startUIUpdates() {
  if (ingotState.uiUpdateInterval) return;
  ingotState.uiUpdateInterval = setInterval(() => {
    regenEnergy();
    const bar = document.getElementById('ingotEnergyBar');
    if (bar) {
      const pct = (ingotState.tapEnergy / ingotState.maxTapEnergy) * 100;
      bar.style.width = pct + '%';
    }
  }, 300);
}

function stopUIUpdates() {
  if (ingotState.uiUpdateInterval) {
    clearInterval(ingotState.uiUpdateInterval);
    ingotState.uiUpdateInterval = null;
  }
  forceSaveNow();
}

// ========== БЫСТРАЯ ОТРИСОВКА ==========
export function renderIngotScreen(container) {
  stopUIUpdates();
  
  const state = getPlayerState();
  const ingotData = getCurrentIngotData();
  const nextIngot = getIngotDataForLevel(state.player.level + 1);
  const energy = ingotState.tapEnergy;
  const maxEnergy = ingotState.maxTapEnergy;
  const shavings = ingotState.shavings;
  const locked = ingotState.levelLocked;
  const nextXP = getNextLevelXP(state.player.level);
  const energyPct = (energy / maxEnergy) * 100;
  
  let html = '';
  
  // ===== CSS =====
  html += `
    <style>
      @keyframes ingotFloat {
        0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
        25% { transform: translate3d(3px, -8px, 0) rotate(0.8deg); }
        50% { transform: translate3d(-2px, -14px, 0) rotate(1.5deg); }
        75% { transform: translate3d(4px, -6px, 0) rotate(-0.6deg); }
      }
      @keyframes textFloatUp {
        0% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        100% { opacity: 0; transform: translate3d(0, -60px, 0) scale(1.4); }
      }
      @keyframes sparkFly {
        0% { opacity: 1; transform: translate(0, 0) scale(1); }
        100% { opacity: 0; transform: translate(var(--sx), var(--sy)) scale(0); }
      }
      @keyframes pulseUpgrade {
        0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
        50% { transform: translate3d(0, 0, 0) scale(1.03); }
      }
      @keyframes spinGlow {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
      }
      @keyframes rushGlowPulse {
        0%, 100% { box-shadow: inset 0 0 60px rgba(255, 100, 0, 0.3), 0 0 40px rgba(255, 50, 0, 0.4); }
        50% { box-shadow: inset 0 0 100px rgba(255, 140, 0, 0.6), 0 0 80px rgba(255, 80, 0, 0.8); }
      }
      @keyframes rushTimerPulse {
        0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
        50% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
      }
      
      .ingot-screen {
        min-height: 100%;
        display: flex;
        flex-direction: column;
        padding: 0;
        background: radial-gradient(circle at 50% 40%, rgba(230,92,0,0.08) 0%, rgba(15,15,15,1) 75%);
        position: relative;
        overflow-y: auto;
        overflow-x: hidden;
        transition: box-shadow 0.5s ease;
      }
      
      .ingot-screen.forge-rush-active {
        animation: rushGlowPulse 0.8s ease-in-out infinite;
        background: radial-gradient(circle at 50% 40%, rgba(255, 60, 0, 0.15) 0%, rgba(20, 5, 0, 1) 75%);
      }
      
      .ingot-header {
        text-align: center;
        padding: 24px 20px 8px;
        flex-shrink: 0;
      }
      .ingot-shavings-label {
        font-size: 11px;
        color: rgba(255,255,255,0.3);
        letter-spacing: 2px;
        text-transform: uppercase;
      }
      .ingot-shavings-value {
        font-family: 'Unbounded', sans-serif;
        font-size: 44px;
        font-weight: 800;
        background: linear-gradient(180deg, #FFE55C 0%, #FFD700 40%, #FF8C00 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        line-height: 1;
        margin-bottom: 6px;
        transition: transform 0.1s ease;
      }
      .forge-rush-active .ingot-shavings-value {
        background: linear-gradient(180deg, #FF4500 0%, #FFD700 30%, #FFA500 100%);
        -webkit-background-clip: text;
        background-clip: text;
      }
      .ingot-info-line {
        font-size: 12px;
        color: rgba(255,255,255,0.6);
      }
      .ingot-info-line strong { color: #fff; font-weight: 700; }
      
      .ingot-core {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        min-height: 260px;
        flex-shrink: 0;
      }
      
      .ingot-float-wrapper {
        animation: ingotFloat 5s ease-in-out infinite;
        position: relative;
        z-index: 2;
      }
      .forge-rush-active .ingot-float-wrapper {
        animation: ingotFloat 2s ease-in-out infinite;
      }
      
      .ingot-image-container {
        width: 180px;
        height: 180px;
        cursor: pointer;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
        position: relative;
        filter: drop-shadow(0 0 25px rgba(255,140,0,0.4));
        transition: filter 0.3s ease;
      }
      .forge-rush-active .ingot-image-container {
        filter: drop-shadow(0 0 40px rgba(255, 60, 0, 0.9));
      }
      
      .ingot-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
        transform: translate3d(0, 0, 0);
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        transition: transform 0.08s ease-out;
      }
      .ingot-image.squish-active {
        transform: translate3d(0, 0, 0) scale(0.92, 1.08);
      }
      
      .ingot-fallback {
        width: 160px;
        height: 160px;
        border-radius: 32px;
        background: linear-gradient(135deg, #B87333 0%, #FFD700 40%, #FF8C00 70%, #8B4513 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 70px;
        transform: translate3d(0, 0, 0);
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        transition: transform 0.08s ease-out;
      }
      .ingot-fallback.squish-active {
        transform: translate3d(0, 0, 0) scale(0.92, 1.08);
      }
      
      .tap-particle {
        position: absolute;
        font-family: 'Unbounded', sans-serif;
        font-weight: 800;
        font-size: 18px;
        color: #FFD700;
        pointer-events: none;
        z-index: 10;
        text-shadow: 0 0 10px rgba(255,180,0,0.9);
        animation: textFloatUp 0.7s ease-out forwards;
      }
      .forge-rush-active .tap-particle {
        color: #FF4500;
        font-size: 22px;
        text-shadow: 0 0 15px rgba(255, 60, 0, 1);
      }
      
      .forge-spark {
        position: absolute;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #FFD700;
        pointer-events: none;
        z-index: 9;
        animation: sparkFly 0.3s ease-out forwards;
        box-shadow: 0 0 6px #FFD700;
      }
      .forge-rush-active .forge-spark {
        background: #FF4500;
        box-shadow: 0 0 10px #FF4500, 0 0 20px #FF8C00;
        width: 7px;
        height: 7px;
      }
      
      .forge-rush-timer {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: 'Unbounded', sans-serif;
        font-size: 72px;
        font-weight: 800;
        color: rgba(255, 255, 255, 0.75);
        pointer-events: none;
        z-index: 20;
        text-shadow: 0 0 30px rgba(255, 100, 0, 0.9), 0 0 60px rgba(255, 50, 0, 0.5);
        animation: rushTimerPulse 1s ease-in-out infinite;
      }
      .forge-rush-timer.timer-pulse {
        animation: rushTimerPulse 0.3s ease-out;
      }
      
      .ingot-energy-divider {
        width: 100%;
        padding: 0 20px;
        flex-shrink: 0;
      }
      .ingot-energy-bar-outer {
        width: 100%;
        height: 5px;
        background: rgba(255,255,255,0.05);
        border-radius: 10px;
        overflow: hidden;
      }
      .ingot-energy-bar-inner {
        height: 100%;
        border-radius: 10px;
        background: linear-gradient(90deg, #3A8CFF, #00D4FF);
        transition: width 0.4s ease;
        transform: translate3d(0, 0, 0);
      }
      
      .ingot-bottom {
        padding: 16px 16px 24px;
        flex-shrink: 0;
      }
      .ingot-goal-title {
        font-family: 'Unbounded', sans-serif;
        font-size: 13px;
        font-weight: 700;
        color: rgba(255,255,255,0.7);
        text-align: center;
        margin-bottom: 14px;
        letter-spacing: 1px;
      }
      .ingot-goal-title strong { color: #FFD700; }
      
      .ingot-progress-list { display: flex; flex-direction: column; gap: 10px; }
      .ingot-progress-row { display: flex; align-items: center; gap: 10px; }
      .ingot-progress-icon { font-size: 17px; width: 22px; text-align: center; flex-shrink: 0; }
      .ingot-progress-info { flex: 1; min-width: 0; }
      .ingot-progress-header {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: rgba(255,255,255,0.6);
        margin-bottom: 4px;
        font-weight: 500;
      }
      .ingot-progress-header span:last-child { color: rgba(255,255,255,0.8); font-weight: 600; }
      .ingot-progress-bar-outer {
        width: 100%;
        height: 12px;
        background: rgba(255,255,255,0.05);
        border-radius: 10px;
        overflow: hidden;
      }
      .ingot-progress-bar-inner {
        height: 100%;
        border-radius: 10px;
        transition: width 0.5s ease;
        transform: translate3d(0, 0, 0);
      }
      .ingot-progress-bar-inner.shavings { background: linear-gradient(90deg, #FFD700, #FFA500); }
      .ingot-progress-bar-inner.ingot { background: linear-gradient(90deg, #C0C0C0, #E0E0E0); }
      .ingot-progress-bar-inner.xp { background: linear-gradient(90deg, #FF4500, #FF8C00); }
      
      .ingot-upgrade-btn {
        display: block;
        width: 100%;
        padding: 20px;
        border: none;
        border-radius: 60px;
        font-family: 'Unbounded', sans-serif;
        font-weight: 800;
        font-size: 17px;
        letter-spacing: 2px;
        cursor: pointer;
        text-transform: uppercase;
        background: linear-gradient(135deg, #FF3D00 0%, #FF6D00 40%, #FFD700 100%);
        color: #000;
        animation: pulseUpgrade 2s ease-in-out infinite;
        margin-top: 4px;
        transform: translate3d(0, 0, 0);
      }
      .ingot-upgrade-btn:active { transform: translate3d(0, 0, 0) scale(0.95) !important; }
      .ingot-upgrade-btn:disabled { opacity: 0.3; cursor: not-allowed; animation: none; }
      
      .ingot-max-msg {
        font-family: 'Unbounded', sans-serif;
        font-size: 16px;
        font-weight: 800;
        color: #FFD700;
        text-align: center;
        padding: 24px;
      }
      
      .evolution-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.85);
        backdrop-filter: blur(10px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .evolution-card {
        background: radial-gradient(circle at 50% 0%, rgba(255,140,0,0.2) 0%, rgba(20,20,20,0.95) 70%);
        border: 1px solid rgba(255,180,0,0.3);
        border-radius: 32px;
        padding: 30px 20px;
        text-align: center;
        width: 90%;
        max-width: 340px;
        position: relative;
        overflow: hidden;
      }
      .evolution-rays {
        position: absolute;
        top: 50%; left: 50%;
        width: 300px; height: 300px;
        background: conic-gradient(from 0deg, transparent, rgba(255,180,0,0.1), transparent, rgba(255,100,0,0.1), transparent);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: spinGlow 8s linear infinite;
        pointer-events: none;
      }
      .evolution-icon-container {
        width: 120px;
        height: 120px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 1;
        animation: ingotFloat 2s ease-in-out infinite;
      }
      .evolution-icon-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        transform: translate3d(0, 0, 0);
      }
      .evolution-icon-fallback {
        width: 100px;
        height: 100px;
        border-radius: 24px;
        background: linear-gradient(135deg, #B87333, #FFD700, #FF8C00);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 50px;
      }
      .evolution-title {
        font-family: 'Unbounded', sans-serif;
        font-size: 20px;
        font-weight: 800;
        color: #FFD700;
        margin: 12px 0 8px;
        position: relative;
        z-index: 1;
      }
      .evolution-subtitle {
        font-size: 13px;
        color: rgba(255,255,255,0.7);
        margin-bottom: 20px;
        position: relative;
        z-index: 1;
        line-height: 1.5;
      }
      .evolution-close-btn {
        background: linear-gradient(135deg, #FFD700, #FF8C00);
        color: #000;
        border: none;
        padding: 14px 32px;
        border-radius: 50px;
        font-weight: 800;
        font-size: 15px;
        cursor: pointer;
        position: relative;
        z-index: 1;
      }
    </style>
  `;
  
  // ===== HTML =====
  html += `<div class="ingot-screen${forgeRushState.active ? ' forge-rush-active' : ''}">`;
  html += `<button class="help-btn help-btn-absolute" data-help="ingot">?</button>`;
  
  html += `
    <div class="ingot-header">
      <div class="ingot-shavings-label">Кузнечная стружка</div>
      <div class="ingot-shavings-value" id="ingotShavingsDisplay">${shavings}</div>
      <div class="ingot-info-line">
        <strong>${ingotData.name}</strong> (Ур. ${state.player.level}) · ${ingotData.era}
      </div>
    </div>
  `;
  
  html += `
    <div class="ingot-core" id="ingotCoreArea">
      <div class="ingot-float-wrapper" id="ingotFloatWrapper">
        <div class="ingot-image-container" id="ingotImageContainer">
          <img class="ingot-image" id="ingotImage" src="${ingotData.image}" alt="${ingotData.name}" onerror="this.style.display='none';document.getElementById('ingotFallback').style.display='flex';" />
          <div class="ingot-fallback" id="ingotFallback" style="display:none;">${ingotData.icon}</div>
        </div>
      </div>
    </div>
  `;
  
  html += `
    <div class="ingot-energy-divider">
      <div class="ingot-energy-bar-outer">
        <div class="ingot-energy-bar-inner" id="ingotEnergyBar" style="width:${energyPct}%;"></div>
      </div>
    </div>
  `;
  
  html += `<div class="ingot-bottom">`;
  
  if (!nextIngot) {
    html += `<div class="ingot-max-msg">🏆 Максимальный уровень</div>`;
  } else if (locked) {
    const canUpgrade = shavings >= nextIngot.shavingsCost &&
      (!nextIngot.ingotCost || Object.entries(nextIngot.ingotCost).every(([id, r]) => (state.ingots[id] || 0) >= r));
    
    if (canUpgrade) {
      html += `<button class="ingot-upgrade-btn" id="performUpgradeBtn">⚡ ПЕРЕПЛАВИТЬ СЛИТОК</button>`;
    } else {
      html += `<div class="ingot-goal-title">ЦЕЛЬ: ЭВОЛЮЦИЯ ДО <strong>${nextIngot.name}</strong> (Ур. ${state.player.level + 1})</div>`;
      html += `<div class="ingot-progress-list">`;
      html += buildProgressRowLive('✨', 'Стружка', shavings, nextIngot.shavingsCost, 'shavings', 'liveShavingsBar', 'liveShavingsLabel', null);
      if (nextIngot.ingotCost) {
        for (let id in nextIngot.ingotCost) {
          const ing = CONFIG_ITEMS[id];
          html += buildProgressRowLive(ing?.icon || '📦', ing?.name || id, state.ingots[id] || 0, nextIngot.ingotCost[id], 'ingot', 'liveIngotBar_' + id, 'liveIngotLabel_' + id, id);
        }
      }
      html += buildProgressRowLive('🔥', 'Опыт профиля', state.player.xp, nextXP, 'xp', 'liveXPBar', 'liveXPLabel', null);
      html += `</div>`;
    }
  } else {
    html += `<div class="ingot-goal-title">ЦЕЛЬ: ЭВОЛЮЦИЯ ДО <strong>${nextIngot.name}</strong> (Ур. ${state.player.level + 1})</div>`;
    html += `<div class="ingot-progress-list">`;
    html += buildProgressRowLive('✨', 'Стружка', shavings, nextIngot.shavingsCost, 'shavings', 'liveShavingsBar', 'liveShavingsLabel', null);
    if (nextIngot.ingotCost) {
      for (let id in nextIngot.ingotCost) {
        const ing = CONFIG_ITEMS[id];
        html += buildProgressRowLive(ing?.icon || '📦', ing?.name || id, state.ingots[id] || 0, nextIngot.ingotCost[id], 'ingot', 'liveIngotBar_' + id, 'liveIngotLabel_' + id, id);
      }
    }
    html += buildProgressRowLive('🔥', 'Опыт профиля', state.player.xp, nextXP, 'xp', 'liveXPBar', 'liveXPLabel', null);
    html += `</div>`;
  }
  
  html += `</div></div>`;
  
  container.innerHTML = html;
  
  // Восстанавливаем таймер ража если он был активен
  if (forgeRushState.active && forgeRushState.countdownDisplay === null) {
    const coreArea = document.getElementById('ingotCoreArea');
    if (coreArea) {
      forgeRushState.countdownDisplay = document.createElement('div');
      forgeRushState.countdownDisplay.className = 'forge-rush-timer';
      forgeRushState.countdownDisplay.textContent = forgeRushState.timeLeft;
      coreArea.appendChild(forgeRushState.countdownDisplay);
    }
  }
  
  startUIUpdates();
  
  // ===== ОБРАБОТЧИКИ С SQUISH-ЭФФЕКТОМ И ИСКРАМИ =====
  const wrapper = document.getElementById('ingotFloatWrapper');
  const coreArea = document.getElementById('ingotCoreArea');
  const imageContainer = document.getElementById('ingotImageContainer');
  const ingotImage = document.getElementById('ingotImage');
  const ingotFallback = document.getElementById('ingotFallback');
  
  if (imageContainer && coreArea) {
    // Функция выполнения тапа
    const executeTap = (clientX, clientY) => {
      const result = tapIngot();
      if (!result.success) {
        import('./ui.js').then(ui => ui.showToast(result.message, '⚡'));
        return;
      }
      
      // Частица "+X"
      const particle = document.createElement('span');
      particle.className = 'tap-particle';
      particle.textContent = '+' + result.tapPower;
      const rect = imageContainer.getBoundingClientRect();
      const coreRect = coreArea.getBoundingClientRect();
      particle.style.left = (rect.left + rect.width / 2 - coreRect.left - 24 + (Math.random() - 0.5) * 40) + 'px';
      particle.style.top = (rect.top - coreRect.top) + 'px';
      coreArea.appendChild(particle);
      setTimeout(() => particle.remove(), 700);
      
      // Искры в точке касания
      const sparkX = clientX - coreRect.left;
      const sparkY = clientY - coreRect.top;
      spawnSparks(coreArea, sparkX, sparkY, forgeRushState.active ? 8 : 4);
    };
    
    // Squish: сжатие при нажатии
    const applySquish = () => {
      if (ingotImage) ingotImage.classList.add('squish-active');
      if (ingotFallback) ingotFallback.classList.add('squish-active');
    };
    
    const removeSquish = (e) => {
      if (ingotImage) ingotImage.classList.remove('squish-active');
      if (ingotFallback) ingotFallback.classList.remove('squish-active');
      
      if (e) {
        executeTap(e.clientX || (e.touches && e.touches[0]?.clientX) || 0,
                   e.clientY || (e.touches && e.touches[0]?.clientY) || 0);
      }
    };
    
    // Mouse events
    imageContainer.addEventListener('mousedown', (e) => {
      e.preventDefault();
      applySquish();
    });
    
    imageContainer.addEventListener('mouseup', (e) => {
      e.preventDefault();
      removeSquish(e);
    });
    
    imageContainer.addEventListener('mouseleave', () => {
      if (ingotImage) ingotImage.classList.remove('squish-active');
      if (ingotFallback) ingotFallback.classList.remove('squish-active');
    });
    
    // Touch events
    imageContainer.addEventListener('touchstart', (e) => {
      e.preventDefault();
      applySquish();
    }, { passive: false });
    
    imageContainer.addEventListener('touchend', (e) => {
      e.preventDefault();
      removeSquish(e);
    }, { passive: false });
    
    imageContainer.addEventListener('touchcancel', () => {
      if (ingotImage) ingotImage.classList.remove('squish-active');
      if (ingotFallback) ingotFallback.classList.remove('squish-active');
    });
  }
  
  const upgradeBtn = document.getElementById('performUpgradeBtn');
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', () => {
      const result = performUpgrade();
      if (!result.success) {
        import('./ui.js').then(ui => ui.showToast(result.message, '⚠️'));
        return;
      }
      
      const flash = document.createElement('div');
      flash.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:9999;pointer-events:none;animation:screenFlash 0.6s ease-out forwards;';
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 600);
      
      setTimeout(() => {
        showEvolutionModal(result.oldIngot, result.newIngot);
      }, 300);
    });
  }
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function buildProgressRowLive(icon, label, current, needed, cssClass, barId, labelId, ingotId) {
  const pct = Math.min(100, (current / needed) * 100);
  const dataAttr = ingotId ? ` data-ingot-id="${ingotId}"` : '';
  return `
    <div class="ingot-progress-row">
      <span class="ingot-progress-icon">${icon}</span>
      <div class="ingot-progress-info">
        <div class="ingot-progress-header"><span>${label}</span><span id="${labelId}">${current} / ${needed}</span></div>
        <div class="ingot-progress-bar-outer">
          <div class="ingot-progress-bar-inner ${cssClass}" id="${barId}" data-needed="${needed}"${dataAttr} style="width:${pct}%;"></div>
        </div>
      </div>
    </div>
  `;
}

// ========== ОКНО ЭВОЛЮЦИИ ==========
function showEvolutionModal(oldData, newData) {
  const overlay = document.createElement('div');
  overlay.className = 'evolution-overlay';
  overlay.innerHTML = `
    <div class="evolution-card">
      <div class="evolution-rays"></div>
      <div class="evolution-icon-container">
        <img class="evolution-icon-img" src="${newData.image}" alt="${newData.name}" onerror="this.style.display='none';document.getElementById('evoFallback').style.display='flex';" />
        <div class="evolution-icon-fallback" id="evoFallback" style="display:none;">${newData.icon}</div>
      </div>
      <div class="evolution-title">ЭВОЛЮЦИЯ СЛИТКА!</div>
      <div class="evolution-subtitle">
        <strong>${oldData.name}</strong> → <strong>${newData.name}</strong><br>
        Уровень ${newData.level} · ${newData.era}
      </div>
      <button class="evolution-close-btn" id="evolutionCloseBtn">ПРОДОЛЖИТЬ</button>
    </div>
  `;
  document.body.appendChild(overlay);
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.id === 'evolutionCloseBtn') {
      overlay.remove();
      stopUIUpdates();
      import('./ui.js').then(ui => ui.renderCurrentTab());
    }
  });
}

export { INGOT_LEVELS };
