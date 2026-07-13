// ========== INGOT МОДУЛЬ: СЛИТОК-КЛИКЕР + СИСТЕМА ЭКИПИРОВКИ ==========
// Версия: Глобальный билд (100 уровней, 6 эпох)
import { CONFIG_ITEMS, EQUIP_SLOTS_CONFIG, ERAS } from './config.js';
import { getPlayerState, saveGame } from './core.js';

// ========== ДАННЫЕ ПРОГРЕССИИ СЛИТКА (100 УРОВНЕЙ) ==========
// Генерируем 100 уровней прогрессии слитка
const INGOT_LEVELS = {};
const INGOT_DISPLAY = {};

// Шаблоны названий по эпохам
const ERA_INGOT_NAMES = {
  mire: [
    'Грязевой сгусток', 'Болотный самородок', 'Иловый слиток', 'Трухлявый слиток',
    'Окисленный слиток', 'Мусорный слиток', 'Погребённый слиток', 'Слиток Трясины'
  ],
  wildlands: [
    'Пепельный слиток', 'Пустынный самородок', 'Соляной кристалл', 'Обсидиановый слиток',
    'Смоляной ком', 'Кактусовый сплав', 'Вулканический слиток', 'Слиток Диких Земель'
  ],
  deepcaverns: [
    'Хрустальный слиток', 'Жемчужный самородок', 'Базальтовый блок', 'Костяной сплав',
    'Светящийся слиток', 'Грибной композит', 'Алмазный слиток', 'Слиток Глубин'
  ],
  industrial: [
    'Шестерёночный слиток', 'Микросхемный сплав', 'Химический композит', 'Урановый стержень',
    'Автомобильный сплав', 'Нефтяной полимер', 'Турбинный слиток', 'Слиток Индустрии'
  ],
  astral: [
    'Звёздный слиток', 'Гравитонный сплав', 'Плазменный кристалл', 'Тёмный композит',
    'Портальный камень', 'Сверхновый сплав', 'Квазарный слиток', 'Слиток Астрала'
  ],
  transcendence: [
    'Слиток творения', 'Временной сплав', 'Мультивселенский композит', 'Энтропийный кристалл',
    'Бесконечный слиток', 'Источниковый сплав', 'Слиток вечности', 'Абсолютный Слиток'
  ]
};

// Иконки по эпохам
const ERA_ICONS = {
  mire: ['🟤', '🟢', '🪵', '🦴', '🔩', '🧶', '🧩', '💚'],
  wildlands: ['🪶', '🪨', '💎', '🖤', '🖤', '🌵', '🌋', '🔥'],
  deepcaverns: ['💠', '🫧', '🪨', '🦴', '🟢', '🍄', '💎', '⛏️'],
  industrial: ['⚙️', '📟', '🧪', '☢️', '🚗', '🛢️', '🌀', '⚡'],
  astral: ['✨', '🪨', '🔵', '🖤', '🌀', '🌫️', '💥', '🌟'],
  transcendence: ['💧', '⏳', '🪞', '🌫️', '✨', '💫', '♾️', '☀️']
};

// Генерируем 100 уровней
function generateIngotLevels() {
  const eraList = ['mire', 'wildlands', 'deepcaverns', 'industrial', 'astral', 'transcendence'];
  let globalLevel = 1;
  let tapPower = 1;
  
  eraList.forEach((eraId, eraIndex) => {
    const era = ERAS[eraId];
    const names = ERA_INGOT_NAMES[eraId];
    const icons = ERA_ICONS[eraId];
    const levelsInEra = eraId === 'mire' ? 8 : (eraId === 'transcendence' ? 12 : 10);
    
    for (let i = 0; i < levelsInEra; i++) {
      const nameIndex = Math.min(i, names.length - 1);
      const iconIndex = Math.min(i, icons.length - 1);
      const shavingsCost = Math.floor(150 * Math.pow(2.5, eraIndex) * (1 + i * 0.3));
      const imageIndex = Math.min(globalLevel, 8);
      
      // Данные для перехода на следующий уровень
      if (globalLevel < 100) {
        INGOT_LEVELS[globalLevel] = {
          level: globalLevel,
          name: names[nameIndex],
          icon: icons[iconIndex],
          era: era.name,
          shavingsCost: shavingsCost,
          ingotCost: generateIngotCost(eraId, i),
          tapPower: tapPower,
          image: `assets/king_ingot/ingot_${imageIndex}.png`
        };
      }
      
      // Данные для отображения текущего уровня
      INGOT_DISPLAY[globalLevel] = {
        name: names[nameIndex],
        icon: icons[iconIndex],
        era: era.name,
        tapPower: tapPower,
        image: `assets/king_ingot/ingot_${imageIndex}.png`
      };
      
      tapPower = Math.floor(tapPower * (1.3 + i * 0.05));
      globalLevel++;
    }
  });
}

// Генератор требований по ингредиентам для каждой эпохи
function generateIngotCost(eraId, levelIndex) {
  const costs = {};
  
  switch(eraId) {
    case 'mire':
      if (levelIndex === 0) costs.wet_sand = 2;
      if (levelIndex === 0) costs.mud_ingot = 1;
      if (levelIndex === 1) costs.mud_ingot = 2;
      if (levelIndex === 1) costs.silt_clump = 1;
      if (levelIndex === 2) costs.silt_clump = 1;
      if (levelIndex === 2) costs.silt_mass = 1;
      if (levelIndex === 3) costs.warped_bar = 2;
      if (levelIndex === 3) costs.rot_mix = 1;
      if (levelIndex === 4) costs.rotted_bough = 1;
      if (levelIndex === 4) costs.rot_alloy = 1;
      if (levelIndex === 5) costs.rusty_scrap = 2;
      if (levelIndex === 5) costs.rust_alloy = 1;
      if (levelIndex === 6) costs.broken_tile = 2;
      if (levelIndex === 6) costs.scrap_ingot = 1;
      if (levelIndex === 7) costs.bog_iron = 1;
      if (levelIndex === 7) costs.root_fiber = 1;
      break;
      
    case 'wildlands':
      if (levelIndex === 0) costs.cinder_chunk = 3;
      if (levelIndex === 0) costs.smolder_core = 1;
      if (levelIndex === 1) costs.grit_chunk = 2;
      if (levelIndex === 1) costs.sand_brick = 1;
      if (levelIndex === 2) costs.salt_crystal = 2;
      if (levelIndex === 2) costs.brine_pearl = 1;
      if (levelIndex === 3) costs.obsidian_shard = 2;
      if (levelIndex === 3) costs.magma_scale = 1;
      if (levelIndex === 4) costs.tar_clump = 2;
      if (levelIndex === 4) costs.bone_tar = 1;
      if (levelIndex === 5) costs.cactus_spine = 2;
      if (levelIndex === 5) costs.cactus_fiber = 1;
      if (levelIndex === 6) costs.ember_dust = 1;
      if (levelIndex === 6) costs.fire_opal = 1;
      if (levelIndex >= 7) costs.desert_pearl = 1;
      break;
      
    case 'deepcaverns':
      if (levelIndex === 0) costs.quartz_shard = 3;
      if (levelIndex === 0) costs.amethyst_cluster = 1;
      if (levelIndex === 1) costs.lake_pearl = 2;
      if (levelIndex === 1) costs.abyssal_scale = 1;
      if (levelIndex === 2) costs.basalt_chunk = 2;
      if (levelIndex === 2) costs.lava_gem = 1;
      if (levelIndex === 3) costs.bone_shard = 2;
      if (levelIndex === 3) costs.skull_fragment = 1;
      if (levelIndex === 4) costs.silk_thread = 2;
      if (levelIndex === 4) costs.glow_goo = 1;
      if (levelIndex === 5) costs.spore_cap = 2;
      if (levelIndex === 5) costs.mycelium_brick = 1;
      if (levelIndex >= 6) costs.diamond_raw = 1;
      if (levelIndex >= 7) costs.ruby_core = 1;
      break;
      
    case 'industrial':
      if (levelIndex === 0) costs.gear_scrap = 3;
      if (levelIndex === 0) costs.piston_rod = 1;
      if (levelIndex === 1) costs.circuit_board = 2;
      if (levelIndex === 1) costs.copper_coil = 1;
      if (levelIndex === 2) costs.chem_vial = 2;
      if (levelIndex === 2) costs.nano_powder = 1;
      if (levelIndex === 3) costs.uranium_ore = 2;
      if (levelIndex === 3) costs.coolant_rod = 1;
      if (levelIndex === 4) costs.car_chassis = 2;
      if (levelIndex === 4) costs.muffler_pipe = 1;
      if (levelIndex === 5) costs.crude_oil = 2;
      if (levelIndex === 5) costs.polymer_chunk = 1;
      if (levelIndex >= 6) costs.turbine_blade = 1;
      if (levelIndex >= 7) costs.catalytic_core = 1;
      break;
      
    case 'astral':
      if (levelIndex === 0) costs.star_dust = 3;
      if (levelIndex === 0) costs.void_essence = 1;
      if (levelIndex === 1) costs.graviton_ore = 2;
      if (levelIndex === 1) costs.mass_shard = 1;
      if (levelIndex === 2) costs.plasma_orb = 2;
      if (levelIndex === 2) costs.beam_crystal = 1;
      if (levelIndex === 3) costs.dark_shard = 2;
      if (levelIndex === 3) costs.antimatter_flake = 1;
      if (levelIndex === 4) costs.portal_stone = 2;
      if (levelIndex === 4) costs.bridge_crystal = 1;
      if (levelIndex === 5) costs.nova_ash = 2;
      if (levelIndex === 5) costs.pulsar_fragment = 1;
      if (levelIndex >= 6) costs.quasar_core = 1;
      if (levelIndex >= 7) costs.supernova_core = 1;
      break;
      
    case 'transcendence':
      if (levelIndex === 0) costs.primordial_essence = 3;
      if (levelIndex === 0) costs.creator_spark = 1;
      if (levelIndex === 1) costs.time_sand = 2;
      if (levelIndex === 1) costs.chrono_crystal = 1;
      if (levelIndex === 2) costs.reality_shard = 2;
      if (levelIndex === 2) costs.dimension_fabric = 1;
      if (levelIndex === 3) costs.entropy_dust = 2;
      if (levelIndex === 3) costs.decay_crystal = 1;
      if (levelIndex === 4) costs.infinite_dust = 2;
      if (levelIndex === 4) costs.loop_stone = 1;
      if (levelIndex === 5) costs.source_dust = 2;
      if (levelIndex === 5) costs.source_crystal = 1;
      if (levelIndex >= 6) costs.creation_core = 1;
      if (levelIndex >= 7) costs.source_of_all = 1;
      break;
  }
  
  return Object.keys(costs).length > 0 ? costs : null;
}

generateIngotLevels();

// ========== РЕЕСТР БОНУСОВ (расширенный) ==========
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
          checkUpgradeAvailability();
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

export function deductShavings(amount) {
  if (ingotState.shavings >= amount) {
    ingotState.shavings -= amount;
    const shavingsDisplay = document.getElementById('ingotShavingsDisplay');
    if (shavingsDisplay) shavingsDisplay.textContent = ingotState.shavings;
    updateBottomProgressBars();
    debouncedSave();
    return true;
  }
  return false;
}

export function getCurrentIngotData() {
  const state = getPlayerState();
  const level = Math.min(state.player.level, 100);
  return INGOT_DISPLAY[level] || INGOT_DISPLAY[1];
}

export function getIngotDataForLevel(level) {
  return INGOT_LEVELS[level] || null;
}

// ========== СИСТЕМА БОНУСОВ ==========
export function getEquippedArtifacts() {
  const state = getPlayerState();
  return state.equippedArtifacts || [null, null, null, null, null];
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
  const LEVELS = [
    0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700,
    3300, 4000, 4800, 5700, 6700, 7800, 9000, 10300, 11700, 13200,
    15000, 17000, 19200, 21600, 24200, 27000, 30000, 33200, 36600, 40200,
    44000, 48000, 52200, 56600, 61200, 66000, 71000, 76200, 81600, 87200,
    93000, 99000, 105200, 111600, 118200, 125000, 132000, 139200, 146600, 154200,
    162000, 170000, 178200, 186600, 195200, 204000, 213000, 222200, 231600, 241200,
    251000, 261000, 271200, 281600, 292200, 303000, 314000, 325200, 336600, 348200,
    360000, 372000, 384200, 396600, 409200, 422000, 435000, 448200, 461600, 475200,
    489000, 503000, 517200, 531600, 546200, 561000, 576000, 591200, 606600, 622200,
    638000, 654000, 670200, 686600, 703200, 720000, 737000, 754200, 771600, 789200, 807000
  ];
  const nextXP = LEVELS[Math.min(state.player.level, 100)] || LEVELS[LEVELS.length - 1];
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

// ========== НАБЛЮДАТЕЛЬ ЗА ДОСТУПНОСТЬЮ АПГРЕЙДА ==========
function checkUpgradeAvailability() {
  const state = getPlayerState();
  if (!ingotState.levelLocked) return;
  
  const upgradeData = INGOT_LEVELS[state.player.level];
  if (!upgradeData) return;
  
  const hasShavings = ingotState.shavings >= upgradeData.shavingsCost;
  let hasIngots = true;
  if (upgradeData.ingotCost) {
    for (let id in upgradeData.ingotCost) {
      if ((state.ingots[id] || 0) < upgradeData.ingotCost[id]) {
        hasIngots = false;
        break;
      }
    }
  }
  
  const canUpgrade = hasShavings && hasIngots;
  
  const upgradeBtn = document.getElementById('performUpgradeBtn');
  const ingotBottom = document.querySelector('.ingot-bottom');
  
  if (canUpgrade && upgradeBtn) return;
  
  if (canUpgrade && !upgradeBtn && ingotBottom) {
    let html = `<button class="ingot-upgrade-btn" id="performUpgradeBtn">⚡ ПЕРЕПЛАВИТЬ СЛИТОК</button>`;
    ingotBottom.innerHTML = html;
    
    const newBtn = document.getElementById('performUpgradeBtn');
    if (newBtn) {
      newBtn.addEventListener('click', () => {
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
  }
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
  checkUpgradeAvailability();
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
  const LEVELS = [
    0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700,
    3300, 4000, 4800, 5700, 6700, 7800, 9000, 10300, 11700, 13200,
    15000, 17000, 19200, 21600, 24200, 27000, 30000, 33200, 36600, 40200,
    44000, 48000, 52200, 56600, 61200, 66000, 71000, 76200, 81600, 87200,
    93000, 99000, 105200, 111600, 118200, 125000, 132000, 139200, 146600, 154200,
    162000, 170000, 178200, 186600, 195200, 204000, 213000, 222200, 231600, 241200,
    251000, 261000, 271200, 281600, 292200, 303000, 314000, 325200, 336600, 348200,
    360000, 372000, 384200, 396600, 409200, 422000, 435000, 448200, 461600, 475200,
    489000, 503000, 517200, 531600, 546200, 561000, 576000, 591200, 606600, 622200,
    638000, 654000, 670200, 686600, 703200, 720000, 737000, 754200, 771600, 789200, 807000
  ];
  const idx = Math.min(level, LEVELS.length - 1);
  return LEVELS[idx] || LEVELS[LEVELS.length - 1];
}

// ========== ПЕРЕПЛАВКА ==========
export function performUpgrade() {
  const state = getPlayerState();
  if (!ingotState.levelLocked) return { success: false, message: 'Опыт ещё не заполнен!' };
  
  const currentLevel = state.player.level;
  const upgradeData = INGOT_LEVELS[currentLevel];
  if (!upgradeData) return { success: false, message: 'Максимальный уровень!' };
  
  if (ingotState.shavings < upgradeData.shavingsCost) {
    return { success: false, message: `Нужно ${upgradeData.shavingsCost} стружки!` };
  }
  
  if (upgradeData.ingotCost) {
    for (let id in upgradeData.ingotCost) {
      if ((state.ingots[id] || 0) < upgradeData.ingotCost[id]) {
        return { success: false, message: `Недостаточно ${CONFIG_ITEMS[id]?.name || id}!` };
      }
    }
  }
  
  const currentIngotData = getCurrentIngotData();
  const oldIngot = { name: currentIngotData.name, icon: currentIngotData.icon, era: currentIngotData.era, level: state.player.level, image: currentIngotData.image };
  
  ingotState.shavings -= upgradeData.shavingsCost;
  if (upgradeData.ingotCost) {
    for (let id in upgradeData.ingotCost) {
      state.ingots[id] -= upgradeData.ingotCost[id];
    }
  }
  
  state.player.level++;
  state.player.xp = 0;
  ingotState.levelLocked = false;
  forceSaveNow();
  recalcAllBonuses();
  
  const newData = getCurrentIngotData();
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

// ========== ПОЛУЧЕНИЕ ДОСТУПНЫХ СЛОТОВ (расширено до 5) ==========
function getAvailableSlots() {
  const state = getPlayerState();
  const level = state.player.level;
  if (level >= 80) return 5;
  if (level >= 50) return 4;
  if (level >= 25) return 3;
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
  if (!state.equippedArtifacts) state.equippedArtifacts = [null, null, null, null, null];
  
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

// ========== ОТРИСОВКА СЛОТОВ (расширено до 5) ==========
function renderEquipSlots() {
  const state = getPlayerState();
  const equipped = getEquippedArtifacts();
  const availableSlots = getAvailableSlots();
  let html = '<div class="equip-slots-section"><div class="equip-slots-title">🔧 Экипировка</div><div class="equip-slots-grid">';
  for (let i = 0; i < 5; i++) {
    const isLocked = i >= availableSlots;
    const unlockLevel = i === 1 ? 10 : (i === 2 ? 25 : (i === 3 ? 50 : (i === 4 ? 80 : 0)));
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

// ========== ГЛАВНАЯ ОТРИСОВКА (С ИНТЕРАКТИВНЫМИ ИКОНКАМИ) ==========
export function renderIngotScreen(container) {
  stopUIUpdates();
  const state = getPlayerState();
  const ingotData = getCurrentIngotData();
  const nextIngot = getIngotDataForLevel(state.player.level);
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
      .ingot-header { text-align: center; padding: 24px 20px 8px; flex-shrink: 0; }
      .ingot-shavings-label { font-size: 11px; color: rgba(255,255,255,0.3); letter-spacing: 2px; text-transform: uppercase; }
      .ingot-shavings-value {
        font-family: 'Unbounded', sans-serif; font-size: 44px; font-weight: 800;
        background: linear-gradient(180deg, #FFE55C 0%, #FFD700 40%, #8B7355 100%);
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent; line-height: 1; margin-bottom: 6px;
      }
      .ingot-info-line { font-size: 12px; color: rgba(255,255,255,0.6); }
      .ingot-info-line strong { color: #fff; font-weight: 700; }
      .ingot-core { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; min-height: 220px; flex-shrink: 0; }
      .ingot-float-wrapper { animation: ingotFloat 5s ease-in-out infinite; position: relative; z-index: 2; }
      .ingot-image-container { width: 160px; height: 160px; cursor: pointer; user-select: none; -webkit-tap-highlight-color: transparent; position: relative; }
      .ingot-image { width: 100%; height: 100%; object-fit: contain; transform: translate3d(0, 0, 0); }
      .ingot-image.squish-active { transform: translate3d(0, 0, 0) scale(0.92, 1.08); }
      .tap-particle {
        position: absolute; font-family: 'Unbounded', sans-serif; font-weight: 800; font-size: 18px;
        color: #8B7355; pointer-events: none; z-index: 10; text-shadow: 0 0 10px rgba(139, 115, 85, 0.9);
        animation: textFloatUp 0.7s ease-out forwards;
      }
      .ingot-energy-divider { width: 100%; padding: 0 20px; flex-shrink: 0; }
      .ingot-energy-bar-outer { width: 100%; height: 5px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; }
      .ingot-energy-bar-inner { height: 100%; border-radius: 10px; background: linear-gradient(90deg, #5C4A3A, #8B7355); transition: width 0.4s ease; }
      .ingot-bottom { padding: 12px 16px 24px; flex-shrink: 0; }
      .ingot-goal-title { font-family: 'Unbounded', sans-serif; font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.7); text-align: center; margin-bottom: 14px; }
      .ingot-progress-list { display: flex; flex-direction: column; gap: 10px; }
      .ingot-progress-row { display: flex; align-items: center; gap: 10px; }
      .ingot-progress-icon { font-size: 17px; width: 22px; text-align: center; flex-shrink: 0; cursor: pointer; }
      .ingot-progress-info { flex: 1; min-width: 0; }
      .ingot-progress-header { display: flex; justify-content: space-between; font-size: 11px; color: rgba(255,255,255,0.6); margin-bottom: 4px; }
      .ingot-progress-bar-outer { width: 100%; height: 12px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; }
      .ingot-progress-bar-inner { height: 100%; border-radius: 10px; transition: width 0.5s ease; }
      .ingot-progress-bar-inner.shavings { background: linear-gradient(90deg, #8B7355, #A08060); }
      .ingot-progress-bar-inner.ingot { background: linear-gradient(90deg, #6B5A45, #8B7355); }
      .ingot-progress-bar-inner.xp { background: linear-gradient(90deg, #5C4A3A, #8B7355); }
      .ingot-upgrade-btn {
        display: block; width: 100%; padding: 20px; border: none; border-radius: 60px;
        font-family: 'Unbounded', sans-serif; font-weight: 800; font-size: 17px;
        cursor: pointer; text-transform: uppercase;
        background: linear-gradient(135deg, #5C4A3A 0%, #8B7355 40%, #A08060 100%);
        color: #fff; animation: pulseUpgrade 2s ease-in-out infinite; margin-top: 4px;
      }
      .ingot-upgrade-btn:active { transform: scale(0.95); }
      .ingot-max-msg { font-family: 'Unbounded', sans-serif; font-size: 16px; font-weight: 800; color: #8B7355; text-align: center; padding: 24px; }
      
      .equip-slots-section { margin-bottom: 12px; }
      .equip-slots-title { font-family: 'Unbounded', sans-serif; font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.6); text-align: center; margin-bottom: 10px; }
      .equip-slots-grid { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }
      .equip-slot {
        width: 56px; height: 56px; background: rgba(255,255,255,0.04);
        border: 2px dashed rgba(139, 115, 85, 0.2); border-radius: 14px;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        cursor: pointer; transition: all 0.25s; text-align: center; padding: 2px;
      }
      .equip-slot.locked { opacity: 0.35; cursor: not-allowed; }
      .equip-slot-lock { font-size: 7px; color: rgba(255,255,255,0.3); }
      .equip-slot-icon { font-size: 22px; }
      .equip-slot-name { font-size: 7px; color: rgba(255,255,255,0.7); margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 48px; }
      .equip-slot-effect { font-size: 6px; color: rgba(139, 115, 85, 0.6); margin-top: 1px; }
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
          <div class="ingot-fallback" id="ingotFallback" style="display:none;width:140px;height:140px;border-radius:32px;background:linear-gradient(135deg,#8B7355 0%,#A08060 40%,#6B5A45 70%,#5C4A3A 100%);align-items:center;justify-content:center;font-size:65px;">${ingotData.icon}</div>
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
    const canUpgrade = shavings >= nextIngot.shavingsCost && (!nextIngot.ingotCost || Object.entries(nextIngot.ingotCost).every(([id, r]) => (state.ingots[id] || 0) >= r));
    if (canUpgrade) {
      html += `<button class="ingot-upgrade-btn" id="performUpgradeBtn">⚡ ПЕРЕПЛАВИТЬ СЛИТОК</button>`;
    } else {
      html += `<div class="ingot-goal-title">ЦЕЛЬ: ЭВОЛЮЦИЯ ДО <strong>${INGOT_DISPLAY[state.player.level + 1]?.name || '???'}</strong> (Ур. ${state.player.level + 1})</div>`;
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
    html += `<div class="ingot-goal-title">ЦЕЛЬ: ЭВОЛЮЦИЯ ДО <strong>${INGOT_DISPLAY[state.player.level + 1]?.name || '???'}</strong> (Ур. ${state.player.level + 1})</div>`;
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
      forgeRushState.countdownDisplay.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:Unbounded,sans-serif;font-size:64px;font-weight:800;color:rgba(255,255,255,0.75);pointer-events:none;z-index:20;text-shadow:0 0 30px rgba(255,100,0,0.9);';
      coreArea.appendChild(forgeRushState.countdownDisplay);
    }
  }
  
  startUIUpdates();
  startOrbitAnimation();
  
  const imageContainer = document.getElementById('ingotImageContainer');
  const ingotImage = document.getElementById('ingotImage');
  const ingotFallback = document.getElementById('ingotFallback');
  const coreArea2 = document.getElementById('ingotCoreArea');
  
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

  document.querySelectorAll('.ingot-progress-icon[data-ingot-id]').forEach(icon => {
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      const ingotId = icon.dataset.ingotId;
      if (ingotId) {
        import('./ui.js').then(ui => {
          if (ui.showItemDetails) ui.showItemDetails(ingotId);
        });
      }
    });
  });
}

function buildProgressRowLive(icon, label, current, needed, cssClass, barId, labelId, ingotId) {
  const pct = Math.min(100, (current / needed) * 100);
  const dataAttr = ingotId ? ` data-ingot-id="${ingotId}"` : '';
  return `
    <div class="ingot-progress-row">
      <span class="ingot-progress-icon"${dataAttr}>${icon}</span>
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
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);z-index:10000;display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML = `
    <div style="background:radial-gradient(circle at 50% 0%,rgba(139,115,85,0.2) 0%,rgba(20,20,20,0.95) 70%);border:1px solid rgba(139,115,85,0.3);border-radius:32px;padding:30px 20px;text-align:center;width:90%;max-width:340px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:50%;left:50%;width:300px;height:300px;background:conic-gradient(from 0deg,transparent,rgba(139,115,85,0.1),transparent,rgba(100,80,50,0.1),transparent);border-radius:50%;transform:translate(-50%,-50%);animation:spinGlow 8s linear infinite;pointer-events:none;"></div>
      <div style="width:120px;height:120px;margin:0 auto;display:flex;align-items:center;justify-content:center;position:relative;z-index:1;">
        <img src="${newData.image}" alt="${newData.name}" style="width:100%;height:100%;object-fit:contain;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
        <div style="display:none;width:100px;height:100px;border-radius:24px;background:linear-gradient(135deg,#8B7355,#A08060,#6B5A45);align-items:center;justify-content:center;font-size:50px;">${newData.icon}</div>
      </div>
      <div style="font-family:'Unbounded',sans-serif;font-size:20px;font-weight:800;color:#8B7355;margin:12px 0 8px;position:relative;z-index:1;">ЭВОЛЮЦИЯ СЛИТКА!</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-bottom:20px;position:relative;z-index:1;line-height:1.5;">
        <strong>${oldData.name}</strong> → <strong>${newData.name}</strong><br>
        Уровень ${newData.level} · ${newData.era}
      </div>
      <button id="evolutionCloseBtn" style="background:linear-gradient(135deg,#8B7355,#6B5A45);color:#fff;border:none;padding:14px 32px;border-radius:50px;font-weight:800;font-size:15px;cursor:pointer;position:relative;z-index:1;">ПРОДОЛЖИТЬ</button>
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

export { INGOT_LEVELS, INGOT_DISPLAY };
