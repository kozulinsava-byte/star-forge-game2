// ========== INGOT МОДУЛЬ: СЛИТОК-КЛИКЕР + СИСТЕМА ЭКИПИРОВКИ ==========
import { CONFIG_ITEMS, EQUIP_SLOTS_CONFIG } from './config.js';
import { getPlayerState, saveGame } from './core.js';

// ========== ДАННЫЕ ПРОГРЕССИИ СЛИТКА (8 УРОВНЕЙ) — ЭПОХА «ТРЯСИНА» ==========
const INGOT_LEVELS = {
  1: { level: 1, name: 'Грязевой сгусток', icon: '🟤', era: 'Трясина', shavingsCost: 150, ingotCost: { wet_sand: 2, mud_ingot: 1 }, tapPower: 1, image: 'assets/king_ingot/ingot_1.png' },
  2: { level: 2, name: 'Болотный самородок', icon: '🟢', era: 'Трясина', shavingsCost: 500, ingotCost: { mud_ingot: 2, silt_clump: 1 }, tapPower: 3, image: 'assets/king_ingot/ingot_2.png' },
  3: { level: 3, name: 'Иловый слиток', icon: '🪵', era: 'Трясина', shavingsCost: 1500, ingotCost: { silt_clump: 1, silt_mass: 1 }, tapPower: 7, image: 'assets/king_ingot/ingot_3.png' },
  4: { level: 4, name: 'Трухлявый слиток', icon: '🦴', era: 'Трясина', shavingsCost: 4000, ingotCost: { warped_bar: 2, rot_mix: 1 }, tapPower: 15, image: 'assets/king_ingot/ingot_4.png' },
  5: { level: 5, name: 'Окисленный слиток', icon: '🔩', era: 'Трясина', shavingsCost: 10000, ingotCost: { rotted_bough: 1, rot_alloy: 1 }, tapPower: 30, image: 'assets/king_ingot/ingot_5.png' },
  6: { level: 6, name: 'Мусорный слиток', icon: '🧶', era: 'Трясина', shavingsCost: 25000, ingotCost: { rusty_scrap: 2, rust_alloy: 1 }, tapPower: 60, image: 'assets/king_ingot/ingot_6.png' },
  7: { level: 7, name: 'Погребённый слиток', icon: '🧩', era: 'Трясина', shavingsCost: 60000, ingotCost: { broken_tile: 2, scrap_ingot: 1 }, tapPower: 120, image: 'assets/king_ingot/ingot_7.png' },
  8: { level: 8, name: 'Слиток Трясины', icon: '💚', era: 'Трясина', shavingsCost: 150000, ingotCost: { scrap_mix: 1, rust_alloy: 1, scrap_ingot: 1 }, tapPower: 250, image: 'assets/king_ingot/ingot_8.png' }
};

// ========== РЕЕСТР БОНУСОВ ==========
const EFFECT_HANDLERS = {
  energy_regen: {
    name: 'Ускоренная регенерация энергии',
    apply: (power) => { ingotState._bonusEnergyRegen = (ingotState._bonusEnergyRegen || 0) + power; },
    remove: (power) => { ingotState._bonusEnergyRegen = Math.max(0, (ingotState._bonusEnergyRegen || 0) - power); },
    getDescription: (power) => `+${power} ед/сек к регенерации энергии`
  },
  heavy_tap: {
    name: 'Тяжёлый удар',
    apply: (power) => { ingotState._bonusTapPower = (ingotState._bonusTapPower || 0) + power; },
    remove: (power) => { ingotState._bonusTapPower = Math.max(0, (ingotState._bonusTapPower || 0) - power); },
    getDescription: (power) => `+${power}% к силе тапа`
  },
  auto_tap: {
    name: 'Авто-тап',
    apply: (power) => {
      ingotState._autoTapInterval = power;
      if (ingotState._autoTapTimer) clearInterval(ingotState._autoTapTimer);
      ingotState._autoTapTimer = setInterval(() => {
        if (ingotState.tapEnergy > 0) {
          const ingotData = getCurrentIngotData();
          let basePower = ingotData.tapPower || 1;
          if (forgeRushState.active) basePower = Math.floor(basePower * 4);
          const bonusPct = ingotState._bonusTapPower || 0;
          basePower = Math.floor(basePower * (1 + bonusPct / 100));
          ingotState.tapEnergy--;
          ingotState.shavings += basePower;
          const shavingsDisplay = document.getElementById('ingotShavingsDisplay');
          if (shavingsDisplay) shavingsDisplay.textContent = ingotState.shavings;
          const energyBar = document.getElementById('ingotEnergyBar');
          if (energyBar) energyBar.style.width = (ingotState.tapEnergy / ingotState.maxTapEnergy * 100) + '%';
          updateBottomProgressBars();
          debouncedSave();
        }
      }, power * 1000);
    },
    remove: (power) => {
      if (ingotState._autoTapTimer) { clearInterval(ingotState._autoTapTimer); ingotState._autoTapTimer = null; }
      ingotState._autoTapInterval = 0;
    },
    getDescription: (power) => `Авто-тап каждые ${power} сек`
  },
  expedition_speed: {
    name: 'Ускорение экспедиций',
    apply: (power) => { ingotState._bonusExpeditionSpeed = (ingotState._bonusExpeditionSpeed || 0) + power; },
    remove: (power) => { ingotState._bonusExpeditionSpeed = Math.max(0, (ingotState._bonusExpeditionSpeed || 0) - power); },
    getDescription: (power) => `Ускорение экспедиций на ${power}%`
  },
  rush_chance: {
    name: 'Шанс Ража',
    apply: (power) => { ingotState._bonusRushChance = (ingotState._bonusRushChance || 0) + power; },
    remove: (power) => { ingotState._bonusRushChance = Math.max(0, (ingotState._bonusRushChance || 0) - power); },
    getDescription: (power) => `+${power}% к шансу Кузнечного Ража`
  },
  rush_duration: {
    name: 'Длительность Ража',
    apply: (power) => { ingotState._bonusRushDuration = (ingotState._bonusRushDuration || 0) + power; },
    remove: (power) => { ingotState._bonusRushDuration = Math.max(0, (ingotState._bonusRushDuration || 0) - power); },
    getDescription: (power) => `+${power} сек к длительности Ража`
  },
  xp_boost: {
    name: 'Бонус опыта',
    apply: (power) => { ingotState._bonusXP = (ingotState._bonusXP || 0) + power; },
    remove: (power) => { ingotState._bonusXP = Math.max(0, (ingotState._bonusXP || 0) - power); },
    getDescription: (power) => `+${power}% к получаемому опыту`
  },
  double_drop: {
    name: 'Двойной дроп',
    apply: (power) => { ingotState._bonusDoubleDrop = (ingotState._bonusDoubleDrop || 0) + power; },
    remove: (power) => { ingotState._bonusDoubleDrop = Math.max(0, (ingotState._bonusDoubleDrop || 0) - power); },
    getDescription: (power) => `${power}% шанс двойной жеоды`
  },
  recycled_chance: {
    name: 'Шанс Вторичного лута',
    apply: (power) => { ingotState._bonusRecycledChance = (ingotState._bonusRecycledChance || 0) + power; },
    remove: (power) => { ingotState._bonusRecycledChance = Math.max(0, (ingotState._bonusRecycledChance || 0) - power); },
    getDescription: (power) => `+${power}% к шансу Вторичного лута`
  }
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
  saveDebounceTimer: null,
  _bonusEnergyRegen: 0,
  _bonusTapPower: 0,
  _autoTapInterval: 0,
  _autoTapTimer: null,
  _bonusExpeditionSpeed: 0,
  _bonusRushChance: 0,
  _bonusRushDuration: 0,
  _bonusXP: 0,
  _bonusDoubleDrop: 0,
  _bonusRecycledChance: 0
};

// ========== СОСТОЯНИЕ РЕЖИМА «КУЗНЕЧНЫЙ РАЖ» ==========
let forgeRushState = {
  active: false,
  timeLeft: 0,
  countdownInterval: null,
  countdownDisplay: null
};

// ========== СОСТОЯНИЕ ОРБИТЫ ==========
let orbitAnimationId = null;
let orbitElements = [];

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
  recalcAllBonuses();
}

export function resetIngotState() {
  stopUIUpdates();
  stopForgeRush();
  stopOrbitAnimation();
  ingotState.shavings = 0;
  ingotState.tapEnergy = 500;
  ingotState.maxTapEnergy = 500;
  ingotState.lastEnergyRegen = Date.now();
  ingotState.levelLocked = false;
  ingotState.lastSaveShavings = 0;
  ingotState._bonusEnergyRegen = 0;
  ingotState._bonusTapPower = 0;
  ingotState._autoTapInterval = 0;
  if (ingotState._autoTapTimer) { clearInterval(ingotState._autoTapTimer); ingotState._autoTapTimer = null; }
  ingotState._bonusExpeditionSpeed = 0;
  ingotState._bonusRushChance = 0;
  ingotState._bonusRushDuration = 0;
  ingotState._bonusXP = 0;
  ingotState._bonusDoubleDrop = 0;
  ingotState._bonusRecycledChance = 0;
  if (ingotState.saveDebounceTimer) { clearTimeout(ingotState.saveDebounceTimer); ingotState.saveDebounceTimer = null; }
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

// ========== СИСТЕМА БОНУСОВ ==========
export function getEquippedArtifacts() {
  const state = getPlayerState();
  return state.equippedArtifacts || [null, null, null];
}

export function getEffectDescription(effectId, power) {
  const handler = EFFECT_HANDLERS[effectId];
  return handler ? handler.getDescription(power) : 'Неизвестный эффект';
}

export function getActiveBonuses() {
  const bonuses = [];
  const equipped = getEquippedArtifacts();
  equipped.forEach(ingotId => {
    if (!ingotId) return;
    const ingot = CONFIG_ITEMS[ingotId];
    if (ingot && ingot.effect_id) {
      bonuses.push({ ingotId, effectId: ingot.effect_id, power: ingot.effect_power, name: ingot.effect_name, icon: ingot.icon });
    }
  });
  return bonuses;
}

function recalcAllBonuses() {
  ingotState._bonusEnergyRegen = 0;
  ingotState._bonusTapPower = 0;
  ingotState._bonusExpeditionSpeed = 0;
  ingotState._bonusRushChance = 0;
  ingotState._bonusRushDuration = 0;
  ingotState._bonusXP = 0;
  ingotState._bonusDoubleDrop = 0;
  ingotState._bonusRecycledChance = 0;
  if (ingotState._autoTapTimer) { clearInterval(ingotState._autoTapTimer); ingotState._autoTapTimer = null; }
  ingotState._autoTapInterval = 0;

  const bonuses = getActiveBonuses();
  bonuses.forEach(b => {
    const handler = EFFECT_HANDLERS[b.effectId];
    if (handler) handler.apply(b.power);
  });

  updateOrbitDisplay();
}

export function getBonusExpeditionSpeed() { return ingotState._bonusExpeditionSpeed || 0; }
export function getBonusXP() { return ingotState._bonusXP || 0; }
export function getBonusDoubleDrop() { return ingotState._bonusDoubleDrop || 0; }
export function getBonusRecycledChance() { return ingotState._bonusRecycledChance || 0; }

// ========== РЕГЕНЕРАЦИЯ ЭНЕРГИИ ==========
export function regenEnergy() {
  const now = Date.now();
  const elapsed = now - ingotState.lastEnergyRegen;
  const baseRegen = 3;
  const bonusRegen = ingotState._bonusEnergyRegen || 0;
  const totalRegen = baseRegen + bonusRegen;
  const regenAmount = Math.floor(elapsed / 1000) * totalRegen;
  if (regenAmount > 0) {
    ingotState.tapEnergy = Math.min(ingotState.maxTapEnergy, ingotState.tapEnergy + regenAmount);
    ingotState.lastEnergyRegen = now - (elapsed % 1000);
  }
}

// ========== ДЕБАУНС СОХРАНЕНИЕ ==========
function debouncedSave() {
  if (ingotState.saveDebounceTimer) clearTimeout(ingotState.saveDebounceTimer);
  ingotState.saveDebounceTimer = setTimeout(() => {
    ingotState.lastSaveShavings = ingotState.shavings;
    saveGame();
    ingotState.saveDebounceTimer = null;
  }, 50);
}

export function forceSaveNow() {
  if (ingotState.saveDebounceTimer) { clearTimeout(ingotState.saveDebounceTimer); ingotState.saveDebounceTimer = null; }
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
    spark.style.setProperty('--sx', Math.cos(angle) * distance + 'px');
    spark.style.setProperty('--sy', Math.sin(angle) * distance + 'px');
    container.appendChild(spark);
    setTimeout(() => spark.remove(), 300);
  }
}

// ========== РЕЖИМ «КУЗНЕЧНЫЙ РАЖ» ==========
function activateForgeRush() {
  if (forgeRushState.active) return;
  forgeRushState.active = true;
  const baseDuration = 10;
  const bonusDuration = ingotState._bonusRushDuration || 0;
  forgeRushState.timeLeft = baseDuration + bonusDuration;
  const ingotScreen = document.querySelector('.ingot-screen');
  if (ingotScreen) ingotScreen.classList.add('forge-rush-active');
  const coreArea = document.getElementById('ingotCoreArea');
  if (coreArea) {
    forgeRushState.countdownDisplay = document.createElement('div');
    forgeRushState.countdownDisplay.className = 'forge-rush-timer';
    forgeRushState.countdownDisplay.textContent = forgeRushState.timeLeft;
    coreArea.appendChild(forgeRushState.countdownDisplay);
  }
  forgeRushState.countdownInterval = setInterval(() => {
    forgeRushState.timeLeft--;
    if (forgeRushState.countdownDisplay) {
      forgeRushState.countdownDisplay.textContent = forgeRushState.timeLeft;
      forgeRushState.countdownDisplay.classList.remove('timer-pulse');
      void forgeRushState.countdownDisplay.offsetWidth;
      forgeRushState.countdownDisplay.classList.add('timer-pulse');
    }
    if (forgeRushState.timeLeft <= 0) deactivateForgeRush();
  }, 1000);
  forceSaveNow();
}

function deactivateForgeRush() {
  forgeRushState.active = false;
  forgeRushState.timeLeft = 0;
  if (forgeRushState.countdownInterval) { clearInterval(forgeRushState.countdownInterval); forgeRushState.countdownInterval = null; }
  if (forgeRushState.countdownDisplay) { forgeRushState.countdownDisplay.remove(); forgeRushState.countdownDisplay = null; }
  const ingotScreen = document.querySelector('.ingot-screen');
  if (ingotScreen) ingotScreen.classList.remove('forge-rush-active');
  forceSaveNow();
}

function stopForgeRush() { deactivateForgeRush(); }

// ========== ОРБИТА АРТЕФАКТОВ ==========
function startOrbitAnimation() {
  stopOrbitAnimation();
  const coreArea = document.getElementById('ingotCoreArea');
  if (!coreArea) return;

  const equipped = getEquippedArtifacts();
  const activeArtifacts = equipped.filter(id => id !== null);

  orbitElements.forEach(el => el.remove());
  orbitElements = [];

  if (activeArtifacts.length === 0) return;

  const orbitRadius = 105;
  const angles = activeArtifacts.map((_, i) => (i / activeArtifacts.length) * Math.PI * 2);

  activeArtifacts.forEach((artifactId, index) => {
    const artifact = CONFIG_ITEMS[artifactId];
    if (!artifact) return;

    const orbiter = document.createElement('div');
    orbiter.className = 'orbit-artifact';
    orbiter.textContent = artifact.icon;
    orbiter.style.fontSize = '22px';
    orbiter.style.position = 'absolute';
    orbiter.style.pointerEvents = 'none';
    orbiter.style.zIndex = '3';
    orbiter.style.filter = 'drop-shadow(0 0 8px rgba(255,215,0,0.6))';
    orbiter.style.transition = 'none';
    orbiter.dataset.angle = angles[index];
    orbiter.dataset.orbitRadius = orbitRadius;
    orbiter.dataset.speed = 0.6 + index * 0.15;
    coreArea.appendChild(orbiter);
    orbitElements.push(orbiter);
  });

  let startTime = performance.now();

  function animateOrbit(now) {
    if (!document.getElementById('ingotCoreArea')) {
      stopOrbitAnimation();
      return;
    }
    const elapsed = (now - startTime) / 1000;
    orbitElements.forEach(el => {
      const baseAngle = parseFloat(el.dataset.angle);
      const speed = parseFloat(el.dataset.speed);
      const radius = parseFloat(el.dataset.orbitRadius);
      const angle = baseAngle + elapsed * speed;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    orbitAnimationId = requestAnimationFrame(animateOrbit);
  }

  orbitAnimationId = requestAnimationFrame(animateOrbit);
}

function stopOrbitAnimation() {
  if (orbitAnimationId) {
    cancelAnimationFrame(orbitAnimationId);
    orbitAnimationId = null;
  }
  orbitElements.forEach(el => el.remove());
  orbitElements = [];
}

function updateOrbitDisplay() {
  startOrbitAnimation();
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
      if (label) label.textContent = `${owned} / ${needed}`;
    }
  });
}

// ========== ТАП ==========
export function tapIngot() {
  if (ingotState.tapEnergy <= 0) return { success: false, message: 'Нет энергии!' };
  const ingotData = getCurrentIngotData();
  let tapPower = ingotData.tapPower || 1;
  if (forgeRushState.active) tapPower = Math.floor(tapPower * 4);
  const bonusPct = ingotState._bonusTapPower || 0;
  tapPower = Math.floor(tapPower * (1 + bonusPct / 100));
  ingotState.tapEnergy--;
  ingotState.shavings += tapPower;
  const shavingsDisplay = document.getElementById('ingotShavingsDisplay');
  if (shavingsDisplay) shavingsDisplay.textContent = ingotState.shavings;
  const energyBar = document.getElementById('ingotEnergyBar');
  if (energyBar) energyBar.style.width = (ingotState.tapEnergy / ingotState.maxTapEnergy * 100) + '%';
  updateBottomProgressBars();
  const baseRushChance = 1;
  const bonusRushChance = ingotState._bonusRushChance || 0;
  const totalRushChance = baseRushChance + bonusRushChance;
  if (!forgeRushState.active && Math.random() * 100 < totalRushChance) {
    activateForgeRush();
    import('./ui.js').then(ui => ui.showToast('⚡ КУЗНЕЧНЫЙ РАЖ! ×4 стружки!', '🔥'));
  }
  debouncedSave();
  return { success: true, shavings: ingotState.shavings, energy: ingotState.tapEnergy, tapPower, forgeRush: forgeRushState.active };
}

// ========== ЗАСЛОНКА ==========
export function checkLevelLock() {
  const state = getPlayerState();
  const nextXP = getNextLevelXP(state.player.level);
  if (state.player.xp >= nextXP && !ingotState.levelLocked) { state.player.xp = nextXP; ingotState.levelLocked = true; saveGame(); return true; }
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
  
  const nextLevel = state.player.level + 1;
  const nextIngotData = INGOT_LEVELS[nextLevel];
  if (!nextIngotData) return { success: false, message: 'Максимальный уровень!' };
  
  if (ingotState.shavings < nextIngotData.shavingsCost) {
    return { success: false, message: `Нужно ${nextIngotData.shavingsCost} стружки!` };
  }
  
  if (nextIngotData.ingotCost) {
    for (let id in nextIngotData.ingotCost) {
      if ((state.ingots[id] || 0) < nextIngotData.ingotCost[id]) {
        return { success: false, message: `Недостаточно ${CONFIG_ITEMS[id]?.name || id}!` };
      }
    }
  }
  
  const currentIngotData = getCurrentIngotData();
  const oldIngot = { name: currentIngotData.name, icon: currentIngotData.icon, era: currentIngotData.era, level: state.player.level, image: currentIngotData.image };
  
  ingotState.shavings -= nextIngotData.shavingsCost;
  if (nextIngotData.ingotCost) {
    for (let id in nextIngotData.ingotCost) {
      state.ingots[id] -= nextIngotData.ingotCost[id];
    }
  }
  
  state.player.level++;
  state.player.xp = 0;
  ingotState.levelLocked = false;
  forceSaveNow();
  recalcAllBonuses();
  
  const newData = INGOT_LEVELS[state.player.level];
  return { success: true, oldIngot, newIngot: { name: newData.name, icon: newData.icon, era: newData.era, level: state.player.level, image: newData.image } };
}

// ========== ЖИВОЕ ОБНОВЛЕНИЕ UI ==========
function startUIUpdates() {
  if (ingotState.uiUpdateInterval) return;
  ingotState.uiUpdateInterval = setInterval(() => {
    regenEnergy();
    const bar = document.getElementById('ingotEnergyBar');
    if (bar) bar.style.width = (ingotState.tapEnergy / ingotState.maxTapEnergy * 100) + '%';
  }, 300);
}

function stopUIUpdates() {
  if (ingotState.uiUpdateInterval) { clearInterval(ingotState.uiUpdateInterval); ingotState.uiUpdateInterval = null; }
  forceSaveNow();
}

// ========== ПОЛУЧЕНИЕ ДОСТУПНЫХ СЛОТОВ ==========
function getAvailableSlots() {
  const state = getPlayerState();
  const level = state.player.level;
  if (level >= 20) return 3;
  if (level >= 10) return 2;
  return 1;
}

// ========== МОДАЛКА ВЫБОРА АРТЕФАКТА ==========
function showArtifactPicker(slotIndex) {
  const state = getPlayerState();
  const equipped = getEquippedArtifacts();
  const availableSlots = getAvailableSlots();
  if (slotIndex >= availableSlots) return;

  const ownedArtifacts = Object.entries(state.ingots)
    .filter(([id, count]) => count > 0 && CONFIG_ITEMS[id] && CONFIG_ITEMS[id].isCollectible)
    .map(([id, count]) => ({ id, count, ingot: CONFIG_ITEMS[id] }));

  if (ownedArtifacts.length === 0) {
    import('./ui.js').then(ui => ui.showToast('У вас нет коллекционных артефактов! Добудьте их в особых жеодах.', '🔒'));
    return;
  }

  let itemsHtml = '';
  ownedArtifacts.forEach(({ id, count, ingot }) => {
    const isEquipped = equipped.includes(id);
    const isEquippedInOtherSlot = isEquipped && equipped[slotIndex] !== id;
    const effectDesc = ingot.effect_id ? getEffectDescription(ingot.effect_id, ingot.effect_power) : 'Нет эффекта';
    itemsHtml += `
      <div class="artifact-pick-item ${isEquipped && !isEquippedInOtherSlot ? 'equipped' : ''} ${isEquippedInOtherSlot ? 'disabled' : ''}" data-artifact="${id}">
        <div class="artifact-pick-icon">${ingot.icon}</div>
        <div class="artifact-pick-info">
          <div class="artifact-pick-name">${ingot.name} ${isEquipped && !isEquippedInOtherSlot ? '✅' : ''} ${isEquippedInOtherSlot ? '🔒' : ''}</div>
          <div class="artifact-pick-effect">${effectDesc}</div>
          <div class="artifact-pick-count">В наличии: ${count} шт.</div>
        </div>
      </div>
    `;
  });

  const html = `
    <div class="modal-header">
      <div class="modal-title">🔧 Выбор артефакта для слота ${slotIndex + 1}</div>
      <button class="modal-close" onclick="document.dispatchEvent(new Event('closeModal'))">✕</button>
    </div>
    <div class="modal-content" style="text-align:left;">
      <div class="modal-description">Выберите артефакт для экипировки. Один артефакт может быть надет только в один слот.</div>
      <div class="artifact-pick-list">${itemsHtml}</div>
      <button class="btn" id="unequipSlotBtn" style="margin-top:12px; background: rgba(255,68,68,0.2); border: 1px solid rgba(255,68,68,0.4); color: #FF4444;">🗑️ Снять артефакт</button>
    </div>
  `;

  import('./ui.js').then(ui => {
    ui.openModal(html);
    setTimeout(() => {
      document.querySelectorAll('.artifact-pick-item:not(.disabled)').forEach(el => {
        el.addEventListener('click', () => {
          const artifactId = el.dataset.artifact;
          equipArtifact(slotIndex, artifactId);
          ui.closeModal();
        });
      });
      const unequipBtn = document.getElementById('unequipSlotBtn');
      if (unequipBtn) {
        unequipBtn.addEventListener('click', () => {
          equipArtifact(slotIndex, null);
          ui.closeModal();
        });
      }
    }, 30);
  });
}

// ========== ЭКИПИРОВКА ==========
function equipArtifact(slotIndex, artifactId) {
  const state = getPlayerState();
  if (!state.equippedArtifacts) state.equippedArtifacts = [null, null, null];
  
  if (artifactId && state.equippedArtifacts.includes(artifactId)) {
    if (state.equippedArtifacts[slotIndex] !== artifactId) {
      import('./ui.js').then(ui => ui.showToast('Этот артефакт уже надет в другой слот! Сначала снимите его оттуда.', '⚠️'));
      return;
    }
  }
  
  state.equippedArtifacts[slotIndex] = artifactId;
  saveGame();
  recalcAllBonuses();
  updateOrbitDisplay();
  const ingot = artifactId ? CONFIG_ITEMS[artifactId] : null;
  import('./ui.js').then(ui => {
    ui.showToast(artifactId ? `${ingot.icon} ${ingot.name} экипирован в слот ${slotIndex + 1}!` : `Слот ${slotIndex + 1} освобождён.`, '🔧');
    ui.renderCurrentTab();
  });
}

// ========== ОТРИСОВКА СЛОТОВ ==========
function renderEquipSlots() {
  const state = getPlayerState();
  const equipped = getEquippedArtifacts();
  const availableSlots = getAvailableSlots();
  let html = '<div class="equip-slots-section"><div class="equip-slots-title">🔧 Экипировка</div><div class="equip-slots-grid">';
  for (let i = 0; i < 3; i++) {
    const isLocked = i >= availableSlots;
    const unlockLevel = i === 1 ? 10 : (i === 2 ? 20 : 0);
    const artifactId = equipped[i];
    const artifact = artifactId ? CONFIG_ITEMS[artifactId] : null;
    html += `
      <div class="equip-slot ${isLocked ? 'locked' : ''}" data-slot="${i}">
        ${isLocked ? `<div class="equip-slot-lock">🔒 Ур.${unlockLevel}</div>` : ''}
        ${!isLocked && artifact ? `<div class="equip-slot-icon">${artifact.icon}</div><div class="equip-slot-name">${artifact.name}</div><div class="equip-slot-effect">${getEffectDescription(artifact.effect_id, artifact.effect_power)}</div>` : (!isLocked ? `<div class="equip-slot-empty">+</div><div class="equip-slot-hint">Пусто</div>` : '')}
      </div>
    `;
  }
  html += '</div></div>';
  return html;
}

// ========== ГЛАВНАЯ ОТРИСОВКА ==========
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
        background: radial-gradient(circle at 50% 40%, rgba(139, 115, 85, 0.08) 0%, rgba(15,15,15,1) 75%);
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
        background: linear-gradient(180deg, #FFE55C 0%, #FFD700 40%, #8B7355 100%);
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
        min-height: 220px;
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
        width: 160px;
        height: 160px;
        cursor: pointer;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
        position: relative;
        filter: drop-shadow(0 0 25px rgba(139, 115, 85, 0.4));
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
        width: 140px;
        height: 140px;
        border-radius: 32px;
        background: linear-gradient(135deg, #8B7355 0%, #A08060 40%, #6B5A45 70%, #5C4A3A 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 65px;
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
        color: #8B7355;
        pointer-events: none;
        z-index: 10;
        text-shadow: 0 0 10px rgba(139, 115, 85, 0.9);
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
        background: #8B7355;
        pointer-events: none;
        z-index: 9;
        animation: sparkFly 0.3s ease-out forwards;
        box-shadow: 0 0 6px #8B7355;
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
        font-size: 64px;
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
      
      .orbit-artifact {
        position: absolute;
        top: 50%;
        left: 50%;
        pointer-events: none;
        z-index: 3;
        will-change: transform;
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
        background: linear-gradient(90deg, #5C4A3A, #8B7355);
        transition: width 0.4s ease;
        transform: translate3d(0, 0, 0);
      }
      
      .ingot-bottom {
        padding: 12px 16px 24px;
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
      .ingot-goal-title strong { color: #8B7355; }
      
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
      .ingot-progress-bar-inner.shavings { background: linear-gradient(90deg, #8B7355, #A08060); }
      .ingot-progress-bar-inner.ingot { background: linear-gradient(90deg, #6B5A45, #8B7355); }
      .ingot-progress-bar-inner.xp { background: linear-gradient(90deg, #5C4A3A, #8B7355); }
      
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
        background: linear-gradient(135deg, #5C4A3A 0%, #8B7355 40%, #A08060 100%);
        color: #fff;
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
        color: #8B7355;
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
        background: radial-gradient(circle at 50% 0%, rgba(139, 115, 85, 0.2) 0%, rgba(20,20,20,0.95) 70%);
        border: 1px solid rgba(139, 115, 85, 0.3);
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
        background: conic-gradient(from 0deg, transparent, rgba(139, 115, 85, 0.1), transparent, rgba(100, 80, 50, 0.1), transparent);
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
        background: linear-gradient(135deg, #8B7355, #A08060, #6B5A45);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 50px;
      }
      .evolution-title {
        font-family: 'Unbounded', sans-serif;
        font-size: 20px;
        font-weight: 800;
        color: #8B7355;
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
        background: linear-gradient(135deg, #8B7355, #6B5A45);
        color: #fff;
        border: none;
        padding: 14px 32px;
        border-radius: 50px;
        font-weight: 800;
        font-size: 15px;
        cursor: pointer;
        position: relative;
        z-index: 1;
      }
      
      .equip-slots-section { margin-bottom: 12px; }
      .equip-slots-title {
        font-family: 'Unbounded', sans-serif;
        font-size: 12px;
        font-weight: 700;
        color: rgba(255,255,255,0.6);
        text-align: center;
        margin-bottom: 10px;
        letter-spacing: 1px;
      }
      .equip-slots-grid { display: flex; gap: 8px; justify-content: center; }
      .equip-slot {
        width: 90px;
        height: 90px;
        background: rgba(255,255,255,0.04);
        border: 2px dashed rgba(139, 115, 85, 0.2);
        border-radius: 18px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.25s;
        text-align: center;
        padding: 4px;
      }
      .equip-slot:active { transform: scale(0.93); border-color: rgba(139, 115, 85, 0.6); background: rgba(139, 115, 85, 0.08); }
      .equip-slot.locked { opacity: 0.35; cursor: not-allowed; border-color: rgba(255,255,255,0.06); }
      .equip-slot.locked:active { transform: none; }
      .equip-slot-lock { font-size: 8px; color: rgba(255,255,255,0.3); }
      .equip-slot-empty { font-size: 26px; color: rgba(139, 115, 85, 0.35); font-weight: 300; }
      .equip-slot-hint { font-size: 8px; color: rgba(255,255,255,0.2); margin-top: 2px; }
      .equip-slot-icon { font-size: 28px; }
      .equip-slot-name { font-size: 8px; color: rgba(255,255,255,0.7); margin-top: 2px; line-height: 1.1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80px; }
      .equip-slot-effect { font-size: 7px; color: rgba(139, 115, 85, 0.6); margin-top: 2px; line-height: 1.1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80px; }
      
      .artifact-pick-list { max-height: 300px; overflow-y: auto; background: rgba(0,0,0,0.2); border-radius: 16px; padding: 8px; border: 1px solid rgba(255,255,255,0.06); }
      .artifact-pick-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 14px; cursor: pointer; margin-bottom: 4px; transition: all 0.2s; border: 1px solid transparent; }
      .artifact-pick-item:active { background: rgba(139, 115, 85, 0.08); border-color: rgba(139, 115, 85, 0.3); }
      .artifact-pick-item.equipped { border-color: rgba(139, 115, 85, 0.4); background: rgba(139, 115, 85, 0.05); }
      .artifact-pick-item.disabled { opacity: 0.35; cursor: not-allowed; }
      .artifact-pick-item.disabled:active { background: rgba(255,255,255,0.03); border-color: transparent; }
      .artifact-pick-icon { font-size: 24px; min-width: 30px; text-align: center; }
      .artifact-pick-info { flex: 1; text-align: left; }
      .artifact-pick-name { font-weight: 600; font-size: 13px; color: #fff; }
      .artifact-pick-effect { font-size: 10px; color: rgba(139, 115, 85, 0.7); margin-top: 2px; }
      .artifact-pick-count { font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 2px; }
    </style>
  `;
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
  html += renderEquipSlots();
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
    html += `<div class="ingot-max-msg">🏆 Максимальный уровень Трясины</div>`;
  } else if (locked) {
    const canUpgrade = shavings >= nextIngot.shavingsCost && (!nextIngot.ingotCost || Object.entries(nextIngot.ingotCost).every(([id, r]) => (state.ingots[id] || 0) >= r));
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
  startOrbitAnimation();
  
  const coreArea2 = document.getElementById('ingotCoreArea');
  const imageContainer = document.getElementById('ingotImageContainer');
  const ingotImage = document.getElementById('ingotImage');
  const ingotFallback = document.getElementById('ingotFallback');
  
  if (imageContainer && coreArea2) {
    const executeTap = (clientX, clientY) => {
      const result = tapIngot();
      if (!result.success) {
        import('./ui.js').then(ui => ui.showToast(result.message, '⚡'));
        return;
      }
      const particle = document.createElement('span');
      particle.className = 'tap-particle';
      particle.textContent = '+' + result.tapPower;
      const rect = imageContainer.getBoundingClientRect();
      const coreRect = coreArea2.getBoundingClientRect();
      particle.style.left = (rect.left + rect.width / 2 - coreRect.left - 24 + (Math.random() - 0.5) * 40) + 'px';
      particle.style.top = (rect.top - coreRect.top) + 'px';
      coreArea2.appendChild(particle);
      setTimeout(() => particle.remove(), 700);
      const sparkX = clientX - coreRect.left;
      const sparkY = clientY - coreRect.top;
      spawnSparks(coreArea2, sparkX, sparkY, forgeRushState.active ? 8 : 4);
    };
    
    const applySquish = () => {
      if (ingotImage) ingotImage.classList.add('squish-active');
      if (ingotFallback) ingotFallback.classList.add('squish-active');
    };
    
    const removeSquish = (e) => {
      if (ingotImage) ingotImage.classList.remove('squish-active');
      if (ingotFallback) ingotFallback.classList.remove('squish-active');
      if (e) {
        executeTap(e.clientX || (e.touches && e.touches[0]?.clientX) || 0, e.clientY || (e.touches && e.touches[0]?.clientY) || 0);
      }
    };
    
    imageContainer.addEventListener('mousedown', (e) => { e.preventDefault(); applySquish(); });
    imageContainer.addEventListener('mouseup', (e) => { e.preventDefault(); removeSquish(e); });
    imageContainer.addEventListener('mouseleave', () => { if (ingotImage) ingotImage.classList.remove('squish-active'); if (ingotFallback) ingotFallback.classList.remove('squish-active'); });
    imageContainer.addEventListener('touchstart', (e) => { e.preventDefault(); applySquish(); }, { passive: false });
    imageContainer.addEventListener('touchend', (e) => { e.preventDefault(); removeSquish(e); }, { passive: false });
    imageContainer.addEventListener('touchcancel', () => { if (ingotImage) ingotImage.classList.remove('squish-active'); if (ingotFallback) ingotFallback.classList.remove('squish-active'); });
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
      setTimeout(() => { showEvolutionModal(result.oldIngot, result.newIngot); }, 300);
    });
  }
  
  document.querySelectorAll('.equip-slot:not(.locked)').forEach(slot => {
    slot.addEventListener('click', () => {
      const idx = parseInt(slot.dataset.slot);
      showArtifactPicker(idx);
    });
  });
}

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
      stopOrbitAnimation();
      import('./ui.js').then(ui => ui.renderCurrentTab());
    }
  });
}

export { INGOT_LEVELS };
