// ========== CORE МОДУЛЬ: ЛОГИКА ИГРЫ ==========
import { CONFIG_ITEMS, CONFIG_GEODES, CONFIG_EXPEDITIONS, EXPEDITION_GROUPS, CRAFT_RECIPES, ALCHEMY_RECIPES, LEVELS, DEFAULT_STATE, GUILD_QUESTS } from './config.js';
import { regenEnergy, checkLevelLock, getIngotSaveData, initIngotState, getBonusExpeditionSpeed, getBonusXP, getBonusDoubleDrop, getBonusRecycledChance, getShavings, getCurrentIngotData } from './ingot.js';

// ========== ЗАГЛУШКИ UI ФУНКЦИЙ ==========
let _showToast = null;
let _getGeodeStageImage = null;
let _updateProfileUI = null;
let _updateCollectionProgress = null;
let _renderCurrentTab = null;
let _renderExpeditionsTab = null;
let _renderImageToElement = null;
let _showRewardPopup = null;
let _renderEventsTab = null;
let _updateMeteorShardsDisplay = null;

export function registerUIFunctions(functions) {
    _showToast = functions.showToast;
    _getGeodeStageImage = functions.getGeodeStageImage;
    _updateProfileUI = functions.updateProfileUI;
    _updateCollectionProgress = functions.updateCollectionProgress;
    _renderCurrentTab = functions.renderCurrentTab;
    _renderExpeditionsTab = functions.renderExpeditionsTab;
    _renderImageToElement = functions.renderImageToElement;
    _showRewardPopup = functions.showRewardPopup;
    _renderEventsTab = functions.renderEventsTab;
    _updateMeteorShardsDisplay = functions.updateMeteorShardsDisplay;
}

// ========== СОСТОЯНИЕ ИГРОКА ==========
export let playerState = {
  expeditions: {},
  geodes: {},
  ingots: {},
  discoveredSpecialGeodes: {},
  collectedArtifacts: {},
  minedStats: {},
  player: {},
  echoCooldowns: {},
  expeditionBonuses: {},
  meteorShards: 0,
  meteorCooldownEnd: null,
  activeQuests: [],
  questRefreshTime: null,
  completedQuests: [],
  questCooldownEnd: null,
  unlockedExpeditions: ['swamp'],
  discoveredAlchemyRecipes: [],
  discoveredKnowledge: {},
  synthesisFailCount: {}
};

export function getPlayerState() {
    return playerState;
}

const collectibleSerials = {};
let nextSerial = 1;

Object.keys(CONFIG_ITEMS).forEach((k) => {
  DEFAULT_STATE.ingots[k] = 0;
  DEFAULT_STATE.minedStats[k] = 0;
});

let isOpeningGeode = false;

// СОСТОЯНИЕ МЕТЕОРИТНОГО ШТОРМА
export const meteorStormState = {
  active: false,
  shardsCollected: 0,
  meteorsSpawned: 0,
  meteorsCaught: 0,
  secretMeteorCaught: false,
  spawnInterval: null,
  roundTimer: null,
  roundStartTime: null,
  roundDuration: 20000,
  cooldownDuration: 60000
};

// ========== PITY-СИСТЕМА (ЧЕСТНЫЙ РАНДОМ) ==========
const pityCounters = {};

function getPityAdjustedDrop(geodeId) {
  const g = CONFIG_GEODES[geodeId];
  if (!g || g.isSpecial) {
    const rand = Math.random();
    let cum = 0;
    for (let e of g.lootTable) {
      cum += e.chance;
      if (rand < cum) return e.ingotId;
    }
    return g.lootTable[0].ingotId;
  }

  if (!pityCounters[geodeId]) {
    pityCounters[geodeId] = {};
    g.lootTable.forEach(e => { pityCounters[geodeId][e.ingotId] = 0; });
  }

  const counters = pityCounters[geodeId];
  
  const adjustedTable = g.lootTable.map(e => {
    const missesSinceLastDrop = counters[e.ingotId] || 0;
    const pityBonus = Math.floor(missesSinceLastDrop / 5) * (e.chance * 0.5);
    const adjustedChance = e.chance + pityBonus;
    return { ...e, adjustedChance };
  });

  const totalChance = adjustedTable.reduce((sum, e) => sum + e.adjustedChance, 0);
  const normalized = adjustedTable.map(e => ({
    ...e,
    normalizedChance: e.adjustedChance / totalChance
  }));

  const rand = Math.random();
  let cum = 0;
  let droppedId = normalized[0].ingotId;
  for (let e of normalized) {
    cum += e.normalizedChance;
    if (rand < cum) {
      droppedId = e.ingotId;
      break;
    }
  }

  for (let ingotId in counters) {
    if (ingotId === droppedId) {
      counters[ingotId] = 0;
    } else {
      counters[ingotId] = (counters[ingotId] || 0) + 1;
    }
  }

  return droppedId;
}

// ========== СИСТЕМА ЗНАНИЙ (ЖУРНАЛ ИССЛЕДОВАТЕЛЯ) ==========
function initIngotKnowledge(ingotId) {
  if (!playerState.discoveredKnowledge[ingotId]) {
    playerState.discoveredKnowledge[ingotId] = {
      sourceKnown: false,
      usedInKnown: false
    };
  }
}

function revealIngotSource(ingotId) {
  initIngotKnowledge(ingotId);
  if (!playerState.discoveredKnowledge[ingotId].sourceKnown) {
    playerState.discoveredKnowledge[ingotId].sourceKnown = true;
    saveGame();
  }
}

function revealIngotUsage(ingotId) {
  initIngotKnowledge(ingotId);
  if (!playerState.discoveredKnowledge[ingotId].usedInKnown) {
    playerState.discoveredKnowledge[ingotId].usedInKnown = true;
    saveGame();
  }
}

export function isIngotSourceKnown(ingotId) {
  const ingot = CONFIG_ITEMS[ingotId];
  if (!ingot) return false;
  if (playerState.minedStats[ingotId] > 0) return true;
  return playerState.discoveredKnowledge[ingotId]?.sourceKnown || false;
}

export function isIngotUsageKnown(ingotId) {
  return playerState.discoveredKnowledge[ingotId]?.usedInKnown || false;
}

export function isRecipeDiscovered(recipeId) {
  const recipe = ALCHEMY_RECIPES[recipeId];
  if (!recipe) return false;
  return recipe.ingredients.every(ingId => playerState.minedStats[ingId] > 0);
}

export function getDiscoveredKnowledge() {
  return playerState.discoveredKnowledge || {};
}

// ========== СИСТЕМА «СИНТЕЗ» ==========
const RARITY_ORDER = ['junk', 'recycled', 'common', 'rare', 'epic', 'legendary'];

export function getSynthesisTargets(ingotId) {
  const ingot = CONFIG_ITEMS[ingotId];
  if (!ingot || ingot.isCollectible) return [];
  
  const currentRarityIndex = RARITY_ORDER.indexOf(ingot.rarityLevel);
  if (currentRarityIndex === -1 || currentRarityIndex >= RARITY_ORDER.length - 1) return [];
  
  const nextRarity = RARITY_ORDER[currentRarityIndex + 1];
  
  // Находим все слитки следующей редкости из той же локации
  const targets = [];
  for (let id in CONFIG_ITEMS) {
    const candidate = CONFIG_ITEMS[id];
    if (candidate.isCollectible) continue;
    if (candidate.rarityLevel === nextRarity && candidate.location === ingot.location) {
      targets.push(candidate);
    }
  }
  
  // Если в той же локации нет — ищем в других локациях
  if (targets.length === 0) {
    for (let id in CONFIG_ITEMS) {
      const candidate = CONFIG_ITEMS[id];
      if (candidate.isCollectible) continue;
      if (candidate.rarityLevel === nextRarity) {
        targets.push(candidate);
      }
    }
  }
  
  return targets;
}

export function getSynthesisChance(count) {
  return Math.min(100, count * 20);
}

export function getSynthesisCost(count) {
  // Стоимость в стружке: базовая + за количество
  return 50 + (count - 1) * 30;
}

export function performSynthesis(ingotId, count, targetIngotId) {
  if (!playerState) return { success: false, message: 'Ошибка состояния игры.' };
  
  const ingot = CONFIG_ITEMS[ingotId];
  const target = CONFIG_ITEMS[targetIngotId];
  if (!ingot || !target) return { success: false, message: 'Слиток не найден!' };
  
  if ((playerState.ingots[ingotId] || 0) < count) {
    return { success: false, message: `Недостаточно ${ingot.name}!` };
  }
  
  const shavingsCost = getSynthesisCost(count);
  const currentShavings = getShavings();
  if (currentShavings < shavingsCost) {
    return { success: false, message: `Недостаточно стружки! Нужно ${shavingsCost}` };
  }
  
  // Списываем слитки
  playerState.ingots[ingotId] -= count;
  
  // Списываем стружку
  import('./ingot.js').then(ingotModule => {
    ingotModule.deductShavings(shavingsCost);
  });
  
  const chance = getSynthesisChance(count);
  const roll = Math.random() * 100;
  const isSuccess = roll < chance;
  
  if (isSuccess) {
    playerState.ingots[targetIngotId] = (playerState.ingots[targetIngotId] || 0) + 1;
    playerState.minedStats[targetIngotId] = (playerState.minedStats[targetIngotId] || 0) + 1;
    playerState.player.totalIngots++;
    revealIngotSource(targetIngotId);
    saveGame();
    return { success: true, target: target, chance: chance, roll: roll, count: count, shavingsCost: shavingsCost };
  } else {
    saveGame();
    return { success: false, message: 'Синтез не удался. Материалы распались.', chance: chance, roll: roll, count: count, shavingsCost: shavingsCost };
  }
}

export function sendBotNotification(message) {
  console.log('[StarForge Notification]', message);
}

export function showSkeleton() {
  const mainContent = document.getElementById('mainContent');
  if (mainContent) {
    mainContent.innerHTML = `
      <div style="padding:20px;">
        <div style="height:40px; background:rgba(255,255,255,0.05); border-radius:20px; margin-bottom:16px; animation:pulse 1.5s infinite;"></div>
        <div style="height:120px; background:rgba(255,255,255,0.03); border-radius:28px; margin-bottom:16px;"></div>
        <div style="height:120px; background:rgba(255,255,255,0.03); border-radius:28px; margin-bottom:16px;"></div>
        <div style="height:120px; background:rgba(255,255,255,0.03); border-radius:28px;"></div>
      </div>
    `;
  }
}

// ========== ГЛОБАЛЬНАЯ СИСТЕМА УПРАВЛЕНИЯ ТАЙМЕРАМИ ==========
const activeTimers = {
  global: null,
  event: null,
  forge: null,
  signal: null,
  signalTimeout: null,
  meteorSpawn: null,
  meteorRound: null
};

function clearTimer(timerName) {
  if (activeTimers[timerName]) {
    clearInterval(activeTimers[timerName]);
    activeTimers[timerName] = null;
  }
}

function clearTimeoutTimer(timerName) {
  if (activeTimers[timerName]) {
    clearTimeout(activeTimers[timerName]);
    activeTimers[timerName] = null;
  }
}

function setTimerInterval(timerName, callback, interval) {
  clearTimer(timerName);
  activeTimers[timerName] = setInterval(callback, interval);
  return activeTimers[timerName];
}

function setTimerTimeout(timerName, callback, delay) {
  clearTimeoutTimer(timerName);
  activeTimers[timerName] = setTimeout(() => {
    activeTimers[timerName] = null;
    callback();
  }, delay);
  return activeTimers[timerName];
}

// ---------- УНИВЕРСАЛЬНЫЙ ИВЕНТ-МЕНЕДЖЕР ----------
const EVENT_LIST = ['great_smelt', 'meteor_storm'];
const EVENT_DURATION = 15 * 60 * 1000;
const ROTATION_INTERVAL = 30 * 60 * 1000;

const EVENT_DEFINITIONS = {
  great_smelt: {
    id: 'great_smelt',
    name: '🔥 Великая Переплавка',
    icon: '🔥',
    description: 'Древние кузни остывают!',
    longDescription: 'Собери ресурсы и создай крафтовые предметы в Плавильне!',
    startMessage: '🔥 Великая Переплавка началась!',
    startToast: '🔥',
    endMessage: 'Кузница остыла, Великая переплавка завершена.',
    endToast: '❄️'
  },
  meteor_storm: {
    id: 'meteor_storm',
    name: '☄️ Метеоритный Шторм',
    icon: '☄️',
    description: 'Небо пылает! Лови падающие метеориты!',
    longDescription: 'Метеориты падают с небес! Тапай по ним, чтобы собрать осколки. Обменяй осколки на жеоды в магазине!',
    startMessage: '☄️ Метеоритный Шторм начался!',
    startToast: '☄️',
    endMessage: 'Метеоритный шторм утих, небо снова чистое!',
    endToast: '☄️'
  }
};

let speedMode = false;
const SPEED_MULTIPLIER = 60;

function getEffectiveInterval() {
  return speedMode ? ROTATION_INTERVAL / SPEED_MULTIPLIER : ROTATION_INTERVAL;
}

function getEffectiveDuration() {
  return speedMode ? EVENT_DURATION / SPEED_MULTIPLIER : EVENT_DURATION;
}

export function toggleSpeedMode() {
  speedMode = !speedMode;
  if (_showToast) _showToast(speedMode ? '⚡ Турбо-ротация включена (30 сек)' : '🐢 Обычная ротация (30 мин)', '⏱️');
  eventsManager.startEventCycle();
}

export const eventsManager = {
  activeEventId: null,
  eventEndTime: null,
  eventInterval: null,
  lastEventId: null,
  
  getActiveEvent() {
    if (this.activeEventId && this.eventEndTime && Date.now() < this.eventEndTime) {
      return EVENT_DEFINITIONS[this.activeEventId] || null;
    }
    return null;
  },
  
  getActiveEventId() {
    if (this.activeEventId && this.eventEndTime && Date.now() < this.eventEndTime) {
      return this.activeEventId;
    }
    return null;
  },
  
  getTimeLeft() {
    if (!this.eventEndTime) return '';
    const diff = Math.max(0, this.eventEndTime - Date.now());
    const m = Math.floor(diff / 60000);
    const s = Math.ceil((diff % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
  },
  
  startEventCycle() {
    clearTimer('event');
    this.syncWithSystemTime();
    this.eventInterval = setInterval(() => {
      this.syncWithSystemTime();
    }, 1000);
  },
  
  syncWithSystemTime() {
    const now = Date.now();
    const interval = getEffectiveInterval();
    const duration = getEffectiveDuration();
    const currentSlot = Math.floor(now / interval);
    const slotStart = currentSlot * interval;
    const slotEnd = slotStart + duration;
    
    if (now >= slotStart && now < slotEnd) {
      if (!this.activeEventId || this.eventEndTime !== slotEnd) {
        const eventId = this.getEventForSlot(currentSlot);
        if (eventId && eventId !== this.activeEventId) {
          this.startEventByIdInternal(eventId, slotEnd);
        }
      }
    } else if (now >= slotEnd && this.activeEventId) {
      this.endEventInternal();
    } else if (!this.activeEventId && now >= slotEnd) {
      this.activeEventId = null;
      this.eventEndTime = null;
    }
  },
  
  getEventForSlot(slot) {
    if (this.lastEventId) {
      const available = EVENT_LIST.filter(id => id !== this.lastEventId);
      return available[slot % available.length];
    }
    return EVENT_LIST[slot % EVENT_LIST.length];
  },
  
  startEventByIdInternal(eventId, endTime) {
    if (!EVENT_DEFINITIONS[eventId]) return;
    
    const def = EVENT_DEFINITIONS[eventId];
    this.activeEventId = eventId;
    this.eventEndTime = endTime;
    this.lastEventId = eventId;
    
    if (_showToast) _showToast(def.startMessage, def.startToast);
    sendBotNotification(`🚀 Ивент запущен: ${def.name}`);
    saveGame();
    
    if (_renderEventsTab) {
      import('./ui.js').then(ui => {
        if (ui.currentTab === 'events') _renderEventsTab();
      });
    }
  },
  
  endEventInternal() {
    if (!this.activeEventId) return;
    const def = EVENT_DEFINITIONS[this.activeEventId];
    if (!def) return;
    
    if (_showToast) _showToast(def.endMessage, def.endToast);
    sendBotNotification(`❄️ Ивент завершён: ${def.name}`);
    
    this.activeEventId = null;
    this.eventEndTime = null;
    
    saveGame();
    
    if (_renderEventsTab) {
      import('./ui.js').then(ui => {
        if (ui.currentTab === 'events') _renderEventsTab();
      });
    }
  },
  
  startEventById(eventId) {
    if (!EVENT_DEFINITIONS[eventId]) return;
    if (this.activeEventId) this.forceEndEvent();
    
    const def = EVENT_DEFINITIONS[eventId];
    const duration = getEffectiveDuration();
    this.activeEventId = eventId;
    this.eventEndTime = Date.now() + duration;
    this.lastEventId = eventId;
    
    if (_showToast) _showToast(def.startMessage, def.startToast);
    sendBotNotification(`🚀 Ивент запущен вручную: ${def.name}`);
    saveGame();
    
    if (_renderEventsTab) {
      import('./ui.js').then(ui => {
        if (ui.currentTab === 'events') _renderEventsTab();
      });
    }
  },
  
  forceEndEvent() {
    if (!this.activeEventId) {
      if (_showToast) _showToast('В данный момент нет активных событий', '⚠️');
      return;
    }
    
    const def = EVENT_DEFINITIONS[this.activeEventId];
    if (!def) return;
    
    if (this.activeEventId === 'meteor_storm') {
      if (meteorStormState.active) {
        meteorStormState.active = false;
        clearTimer('meteorSpawn');
        clearTimer('meteorRound');
        const container = document.getElementById('meteorStormArea');
        if (container) {
          container.querySelectorAll('.storm-meteor, .storm-float-text').forEach(el => el.remove());
        }
        document.getElementById('meteorStormOverlay')?.classList.remove('active');
      }
    }
    
    if (_showToast) _showToast(def.endMessage, def.endToast);
    sendBotNotification(`❄️ Ивент завершён принудительно: ${def.name}`);
    
    this.activeEventId = null;
    this.eventEndTime = null;
    
    saveGame();
    
    if (_renderEventsTab) {
      import('./ui.js').then(ui => {
        if (ui.currentTab === 'events') _renderEventsTab();
      });
    }
  }
};

// ---------- ПЛАВИЛЬНЯ (FORGE) ----------
let forgeState = {
  active: false,
  selectedRecipe: null,
  smeltSeconds: 0,
  smeltMaxSeconds: 0,
  smeltInterval: null
};

export function openForge() {
  const eventId = eventsManager.getActiveEventId();
  if (eventId !== 'great_smelt') {
    if (_showToast) _showToast('Плавильня закрыта! Дождитесь Великой Переплавки.', '❄️');
    return;
  }
  
  if (forgeState.active) return;
  forgeState.active = true;
  forgeState.selectedRecipe = null;
  
  const overlay = document.getElementById('forgeOverlay');
  const content = document.getElementById('forgeContent');
  
  renderForgeInterface(content);
  overlay.classList.add('active');
}

function renderForgeInterface(container) {
  const recipes = getCraftableRecipes();
  
  let html = `
    <div class="forge-title-section">
      <span class="forge-title-icon">🔥</span>
      <span class="forge-title-text">ПЛАВИЛЬНЯ</span>
    </div>
    <div style="font-size:11px; color:var(--text-secondary); margin-bottom:6px;">
      Выбери рецепт и нажми «Сплавить»
    </div>
    <div class="recipe-grid">
  `;
  
  if (recipes.length === 0) {
    html += '<div class="empty-state" style="grid-column:1/-1;">Нет доступных рецептов</div>';
  } else {
    recipes.forEach((recipe) => {
      const isActive = forgeState.selectedRecipe && forgeState.selectedRecipe.id === recipe.id;
      const isLocked = recipe.reqLevel && playerState.player.level < recipe.reqLevel;
      const cardClass = isActive ? 'recipe-card active' : (isLocked ? 'recipe-card disabled' : (recipe.canCraft ? 'recipe-card' : 'recipe-card disabled'));
      
      html += `
        <div class="${cardClass}" data-recipe="${recipe.id}">
          <div class="recipe-card-icon">${recipe.icon}</div>
          <div class="recipe-card-name">${recipe.name} ${isLocked ? '🔒' : ''}</div>
          <div class="recipe-card-ingredients">
      `;
      
      for (let ingId in recipe.ingredients) {
        const required = recipe.ingredients[ingId];
        const owned = playerState.ingots[ingId] || 0;
        const hasEnough = owned >= required;
        const ing = CONFIG_ITEMS[ingId];
        
        html += `
          <div class="recipe-card-ingredient-row">
            ${ing.icon} ${ing.name}: 
            <span style="color: ${hasEnough ? '#50C878' : '#FF4444'}">
              ${owned} / ${required}
            </span>
          </div>
        `;
      }
      
      if (isLocked) {
        html += `<div class="recipe-card-xp" style="color: #FF4444;">🔒 Требуется ${recipe.reqLevel} уровень</div>`;
      } else {
        html += `<div class="recipe-card-xp">+${recipe.xpReward} XP · ${recipe.smeltTime}с</div>`;
      }
      
      html += `
          </div>
        </div>
      `;
    });
  }
  
  html += `
    </div>
    <div class="forge-action-area">
      <button class="forge-smelt-btn" id="forgeSmeltBtn" ${forgeState.selectedRecipe && forgeState.selectedRecipe.canCraft && (!forgeState.selectedRecipe.reqLevel || playerState.player.level >= forgeState.selectedRecipe.reqLevel) ? '' : 'disabled'}>
        ${forgeState.selectedRecipe ? (forgeState.selectedRecipe.reqLevel && playerState.player.level < forgeState.selectedRecipe.reqLevel ? `🔒 Требуется ${forgeState.selectedRecipe.reqLevel} уровень` : (forgeState.selectedRecipe.canCraft ? '⚡ СПЛАВИТЬ' : 'ВЫБЕРИТЕ РЕЦЕПТ')) : 'ВЫБЕРИТЕ РЕЦЕПТ'}
      </button>
      <button class="forge-exit-btn" id="forgeExitBtn">Выйти из Плавильни</button>
    </div>
  `;
  
  container.innerHTML = html;
  
  container.querySelectorAll('.recipe-card:not(.disabled)').forEach((el) => {
    el.addEventListener('click', () => {
      const recipeId = el.dataset.recipe;
      const recipe = getCraftableRecipes().find(r => r.id === recipeId);
      if (recipe && recipe.canCraft && (!recipe.reqLevel || playerState.player.level >= recipe.reqLevel)) {
        forgeState.selectedRecipe = recipe;
        renderForgeInterface(container);
      }
    });
  });
  
  const smeltBtn = container.querySelector('#forgeSmeltBtn');
  if (smeltBtn) {
    smeltBtn.addEventListener('click', () => {
      if (forgeState.selectedRecipe && forgeState.selectedRecipe.canCraft && (!forgeState.selectedRecipe.reqLevel || playerState.player.level >= forgeState.selectedRecipe.reqLevel)) {
        startSmeltProcess(forgeState.selectedRecipe);
      }
    });
  }
  
  const exitBtn = container.querySelector('#forgeExitBtn');
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      closeForge();
    });
  }
}

function closeForge() {
  const overlay = document.getElementById('forgeOverlay');
  const content = document.getElementById('forgeContent');
  
  overlay.classList.remove('active');
  content.innerHTML = '';
  
  clearTimer('forge');
  
  forgeState.active = false;
  forgeState.selectedRecipe = null;
}

function startSmeltProcess(recipe) {
  document.getElementById('forgeOverlay').classList.remove('active');
  document.getElementById('forgeContent').innerHTML = '';
  
  const progressOverlay = document.getElementById('forgeProgressOverlay');
  const progressLabel = document.getElementById('forgeProgressLabel');
  const progressFill = document.getElementById('forgeProgressFill');
  const progressTime = document.getElementById('forgeProgressTime');
  const moltenEl = document.getElementById('forgeMolten');
  
  forgeState.smeltMaxSeconds = recipe.smeltTime || 15;
  forgeState.smeltSeconds = forgeState.smeltMaxSeconds;
  
  progressLabel.textContent = `Плавим ${recipe.name}...`;
  progressFill.style.width = '0%';
  progressTime.textContent = `${forgeState.smeltSeconds}с`;
  moltenEl.style.height = '0%';
  progressOverlay.classList.add('active');
  
  setTimerInterval('forge', () => {
    forgeState.smeltSeconds--;
    
    const elapsed = forgeState.smeltMaxSeconds - forgeState.smeltSeconds;
    const progress = (elapsed / forgeState.smeltMaxSeconds) * 100;
    
    progressFill.style.width = progress + '%';
    progressTime.textContent = `${forgeState.smeltSeconds}с`;
    moltenEl.style.height = progress + '%';
    
    if (forgeState.smeltSeconds <= 0) {
      clearTimer('forge');
      finishSmeltProcess(recipe);
    }
  }, 1000);
}

function finishSmeltProcess(recipe) {
  clearTimer('forge');
  
  document.getElementById('forgeProgressOverlay').classList.remove('active');
  
  for (let ingId in recipe.ingredients) {
    playerState.ingots[ingId] -= recipe.ingredients[ingId];
  }
  
  playerState.ingots[recipe.resultIngotId] = (playerState.ingots[recipe.resultIngotId] || 0) + 1;
  playerState.minedStats[recipe.resultIngotId] = (playerState.minedStats[recipe.resultIngotId] || 0) + 1;
  playerState.player.totalIngots++;
  
  addXP(recipe.xpReward);
  saveGame();
  
  const resultItem = CONFIG_ITEMS[recipe.resultIngotId];
  if (_showToast) _showToast(`Создано: ${resultItem?.name || recipe.name}! +${recipe.xpReward} XP`, recipe.icon);
  sendBotNotification(`⚡ Игрок создал ${resultItem?.name || recipe.name} в Плавильне!`);
  
  forgeState.active = false;
  forgeState.selectedRecipe = null;
  if (_renderCurrentTab) _renderCurrentTab();
}

// ---------- СИСТЕМА КРАФТА ----------
export function getCraftableRecipes() {
  const recipes = [];
  
  for (let recipeId in CRAFT_RECIPES) {
    const recipe = CRAFT_RECIPES[recipeId];
    let canCraft = true;
    
    for (let ingId in recipe.ingredients) {
      const required = recipe.ingredients[ingId];
      const owned = playerState.ingots[ingId] || 0;
      if (owned < required) {
        canCraft = false;
        break;
      }
    }
    
    recipes.push({ ...recipe, canCraft });
  }
  
  return recipes;
}

export function craftItem(recipeId) {
  const recipe = CRAFT_RECIPES[recipeId];
  if (!recipe) {
    if (_showToast) _showToast('Рецепт не найден!', '⚠️');
    return false;
  }
  
  if (recipe.reqLevel && playerState.player.level < recipe.reqLevel) {
    if (_showToast) _showToast(`Требуется ${recipe.reqLevel} уровень!`, '🔒');
    return false;
  }
  
  const recipes = getCraftableRecipes();
  const found = recipes.find(r => r.id === recipeId);
  if (!found || !found.canCraft) {
    if (_showToast) _showToast('Недостаточно ресурсов!', '⚠️');
    return false;
  }
  
  return craftItemDirect(found);
}

function craftItemDirect(recipe) {
  if (!recipe) return false;
  
  for (let ingId in recipe.ingredients) {
    playerState.ingots[ingId] -= recipe.ingredients[ingId];
  }
  
  playerState.ingots[recipe.resultIngotId] = (playerState.ingots[recipe.resultIngotId] || 0) + 1;
  playerState.minedStats[recipe.resultIngotId] = (playerState.minedStats[recipe.resultIngotId] || 0) + 1;
  playerState.player.totalIngots++;
  
  addXP(recipe.xpReward);
  saveGame();
  return true;
}

// ---------- DEV ФУНКЦИИ ----------
export function devGiveXP() {
  playerState.player.xp += 1000000;
  while (playerState.player.level < LEVELS.length - 1 && playerState.player.xp >= LEVELS[playerState.player.level]) {
    playerState.player.level++;
  }
  if (_updateProfileUI) _updateProfileUI();
  if (_updateCollectionProgress) _updateCollectionProgress();
}

export function devGiveGeodes() {
  Object.keys(CONFIG_GEODES).forEach(geodeId => {
    playerState.geodes[geodeId] = (playerState.geodes[geodeId] || 0) + 10;
  });
}

export function devUnlockLocations() {
  playerState.player.level = Math.max(playerState.player.level, 6);
  if (!playerState.unlockedExpeditions) playerState.unlockedExpeditions = ['swamp'];
  EXPEDITION_GROUPS.forEach(group => {
    group.expeditions.forEach(exp => {
      if (!playerState.unlockedExpeditions.includes(exp.id)) {
        playerState.unlockedExpeditions.push(exp.id);
      }
    });
  });
  if (_updateProfileUI) _updateProfileUI();
}

export function devResetGeodes() {
  Object.keys(CONFIG_GEODES).forEach(geodeId => {
    playerState.geodes[geodeId] = 10;
  });
}

export function getSerialForCollectible(ingotId) {
  if (!collectibleSerials[ingotId]) {
    collectibleSerials[ingotId] = String(nextSerial++).padStart(3, '0');
  }
  return collectibleSerials[ingotId];
}

export function isLocationCompleted(locId) {
  const special = CONFIG_GEODES[`special_${locId}`];
  if (!special) return false;
  return special.possibleIngots.every((ingId) => playerState.ingots[ingId] > 0);
}

export function getExpeditionTimeLeft(expId) {
  const exp = playerState.expeditions[expId];
  if (!exp || !exp.active || !exp.endTime) return null;
  return Math.max(0, exp.endTime - Date.now());
}

export function addXP(amount) {
  const bonusPct = getBonusXP();
  const totalAmount = Math.floor(amount * (1 + bonusPct / 100));
  
  playerState.player.xp += totalAmount;
  
  const nextLevelXP = LEVELS[playerState.player.level] || LEVELS[LEVELS.length - 1];
  
  if (playerState.player.xp >= nextLevelXP) {
    playerState.player.xp = nextLevelXP;
    checkLevelLock();
    if (_showToast) _showToast('⚡ Опыт заполнен! Переплавьте Слиток для повышения уровня.', '🔒');
    saveGame();
    if (_updateProfileUI) _updateProfileUI();
    if (_renderCurrentTab) _renderCurrentTab();
    return;
  }
  
  if (_updateProfileUI) _updateProfileUI();
  if (_updateCollectionProgress) _updateCollectionProgress();
  saveGame();
}

export function sellIngot(ingotId) {
  const ingot = CONFIG_ITEMS[ingotId];
  
  if (ingot.isCollectible) {
    if (_showToast) _showToast('Коллекционные артефакты нельзя сдавать!', '⚠️');
    return;
  }
  
  if (playerState.ingots[ingotId] <= 0) {
    if (_showToast) _showToast('Нет слитков для сдачи!', '⚠️');
    return;
  }
  
  const count = playerState.ingots[ingotId];
  const xpEarned = ingot.sellValue * count;
  
  playerState.ingots[ingotId] = 0;
  addXP(xpEarned);
  saveGame();
  
  if (_showToast) _showToast(`Сдано ${count} ${ingot.name}! +${xpEarned} XP`, '💰');
  if (_renderCurrentTab) _renderCurrentTab();
}

export function exchangeSpecialGeodeForXP(geodeId) {
  if (playerState.geodes[geodeId] <= 0) {
    if (_showToast) _showToast('Нет такой жеоды!', '⚠️');
    return;
  }
  
  const g = CONFIG_GEODES[geodeId];
  if (!g.isSpecial) return;
  
  const loc = g.location;
  const completed = isLocationCompleted(loc);
  if (!completed) {
    if (_showToast) _showToast('Сначала соберите все артефакты локации!', '⚠️');
    return;
  }
  
  playerState.geodes[geodeId]--;
  const xpGained = 800;
  addXP(xpGained);
  saveGame();
  
  if (_showToast) _showToast(`Жеода изучена! +${xpGained} XP`, '📚');
  if (_renderCurrentTab) _renderCurrentTab();
}

// ---------- ПЕРЕРАБОТАННЫЕ ЗАКАЗЫ ГИЛЬДИИ ----------
export function getAvailableQuests() {
  const playerLevel = playerState.player.level;
  return GUILD_QUESTS.filter(q => q.reqLevel >= playerLevel - 1 && q.reqLevel <= playerLevel + 1);
}

export function refreshActiveQuests() {
  const now = Date.now();
  
  if (playerState.questCooldownEnd && now < playerState.questCooldownEnd) {
    return false;
  }
  
  const playerLevel = playerState.player.level;
  const available = getAvailableQuests();
  const completed = playerState.completedQuests || [];
  
  const uncompleted = available.filter(q => !completed.includes(q.id));
  
  if (uncompleted.length === 0) {
    playerState.activeQuests = [];
    saveGame();
    return true;
  }
  
  const atLevel = uncompleted.filter(q => q.reqLevel === playerLevel);
  const belowLevel = uncompleted.filter(q => q.reqLevel === playerLevel - 1);
  const aboveLevel = uncompleted.filter(q => q.reqLevel === playerLevel + 1);
  
  const selected = [];
  
  const pool1 = [...atLevel, ...belowLevel];
  if (pool1.length > 0) {
    const pick1 = pool1[Math.floor(Math.random() * pool1.length)];
    selected.push(pick1.id);
  }
  
  const pool2 = uncompleted.filter(q => !selected.includes(q.id) && q.reqLevel <= playerLevel);
  if (pool2.length > 0) {
    const pick2 = pool2[Math.floor(Math.random() * pool2.length)];
    selected.push(pick2.id);
  }
  
  const pool3 = aboveLevel.length > 0 ? aboveLevel : uncompleted.filter(q => !selected.includes(q.id) && q.reqLevel === playerLevel);
  if (pool3.length > 0) {
    const pick3 = pool3[Math.floor(Math.random() * pool3.length)];
    selected.push(pick3.id);
  }
  
  if (selected.length < 3) {
    const remaining = uncompleted.filter(q => !selected.includes(q.id));
    const shuffled = [...remaining].sort(() => Math.random() - 0.5);
    for (let q of shuffled) {
      if (selected.length >= 3) break;
      selected.push(q.id);
    }
  }
  
  playerState.activeQuests = selected.slice(0, 3);
  playerState.questRefreshTime = now + 10 * 60 * 1000;
  playerState.questCooldownEnd = null;
  
  saveGame();
  return true;
}

export function checkAndRefreshQuests() {
  const now = Date.now();
  
  if (playerState.questCooldownEnd && now < playerState.questCooldownEnd) {
    return false;
  }
  
  if (!playerState.activeQuests || playerState.activeQuests.length === 0) {
    return refreshActiveQuests();
  }
  
  const allCompleted = playerState.activeQuests.every(qId => 
    (playerState.completedQuests || []).includes(qId)
  );
  
  if (allCompleted) {
    return refreshActiveQuests();
  }
  
  if (playerState.questRefreshTime && now >= playerState.questRefreshTime) {
    return refreshActiveQuests();
  }
  
  return false;
}

export function getQuestCooldownRemaining() {
  if (!playerState.questCooldownEnd) return 0;
  return Math.max(0, playerState.questCooldownEnd - Date.now());
}

export function completeQuest(questId) {
  const quest = GUILD_QUESTS.find(q => q.id === questId);
  if (!quest) return false;
  
  if (!playerState.activeQuests || !playerState.activeQuests.includes(questId)) {
    if (_showToast) _showToast('Этот заказ уже не активен!', '⚠️');
    return false;
  }
  
  if (playerState.player.level < quest.reqLevel) {
    if (_showToast) _showToast(`Требуется ${quest.reqLevel} уровень!`, '🔒');
    return false;
  }
  
  for (let ingId in quest.ingredients) {
    const required = quest.ingredients[ingId];
    const owned = playerState.ingots[ingId] || 0;
    if (owned < required) {
      if (_showToast) _showToast(`Недостаточно ${CONFIG_ITEMS[ingId]?.name || ingId}!`, '⚠️');
      return false;
    }
  }
  
  for (let ingId in quest.ingredients) {
    playerState.ingots[ingId] -= quest.ingredients[ingId];
  }
  
  addXP(quest.rewardXP);
  
  if (quest.rewardGeode) {
    playerState.geodes[quest.rewardGeode] = (playerState.geodes[quest.rewardGeode] || 0) + 1;
    const geodeName = CONFIG_GEODES[quest.rewardGeode]?.name || 'жеода';
    if (_showToast) _showToast(`Заказ выполнен! +${quest.rewardXP} XP, +1 ${geodeName}`, '📜');
  } else {
    if (_showToast) _showToast(`Заказ выполнен! +${quest.rewardXP} XP`, '📜');
  }
  
  if (!playerState.completedQuests) playerState.completedQuests = [];
  playerState.completedQuests.push(questId);
  
  saveGame();
  
  const allCompleted = playerState.activeQuests.every(qId => 
    playerState.completedQuests.includes(qId)
  );
  
  if (allCompleted) {
    playerState.questCooldownEnd = Date.now() + 10 * 60 * 1000;
    saveGame();
  }
  
  if (_renderEventsTab) _renderEventsTab();
  return true;
}

// ---------- МИНИ-ИГРА "АКТИВНАЯ РАЗВЕДКА" ----------
let activeSignalGame = {
  active: false,
  expId: null,
  bonusType: null,
  points: [],
  collected: 0,
  totalPoints: 8,
  timer: 10};

export function startSignalGame(expId, bonusType) {
  if (activeSignalGame.active) {
    cleanupSignalGame();
  }
  
  activeSignalGame.active = true;
  activeSignalGame.expId = expId;
  activeSignalGame.bonusType = bonusType;
  activeSignalGame.collected = 0;
  activeSignalGame.timer = 10;
  activeSignalGame.points = [];
  
  const overlay = document.getElementById('signalGameOverlay');
  const timerEl = document.getElementById('signalTimer');
  const counterEl = document.getElementById('signalCounter');
  const area = document.getElementById('signalGameArea');
  
  overlay.classList.add('active');
  timerEl.textContent = '10';
  counterEl.textContent = `Сигналов: 0 / 8`;
  area.innerHTML = '';
  
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      if (!activeSignalGame.active) return;
      createSignalPoint(area);
    }, i * 480);
  }
  
  setTimerInterval('signal', () => {
    if (!activeSignalGame.active) return;
    activeSignalGame.timer--;
    timerEl.textContent = activeSignalGame.timer;
    
    if (activeSignalGame.timer <= 0) {
      signalGameFail();
    }
  }, 1000);
  
  setTimerTimeout('signalTimeout', () => {
    if (activeSignalGame.active) {
      signalGameFail();
    }
  }, 10000);
}

function createSignalPoint(area) {
  if (!activeSignalGame.active) return;
  
  const point = document.createElement('div');
  point.className = 'signal-point';
  
  const x = Math.random() * (area.clientWidth - 60) + 30;
  const y = Math.random() * (area.clientHeight - 60) + 30;
  
  point.style.left = x + 'px';
  point.style.top = y + 'px';
  
  point.addEventListener('click', () => {
    if (!activeSignalGame.active) return;
    point.remove();
    activeSignalGame.collected++;
    document.getElementById('signalCounter').textContent = `Сигналов: ${activeSignalGame.collected} / 8`;
    
    if (activeSignalGame.collected >= 8) {
      signalGameSuccess();
    }
  });
  
  area.appendChild(point);
  activeSignalGame.points.push(point);
  
  setTimeout(() => {
    if (point.parentNode) {
      point.remove();
      activeSignalGame.points = activeSignalGame.points.filter(p => p !== point);
    }
  }, 2500);
}

function signalGameSuccess() {
  if (!activeSignalGame.active) return;
  
  const { expId, bonusType } = activeSignalGame;
  
  if (bonusType === 'echo') {
    applyEchoBonus(expId);
  } else if (bonusType === 'scan') {
    applyScanBonus(expId);
  }
  
  cleanupSignalGame();
  document.getElementById('signalGameOverlay').classList.remove('active');
  if (_showToast) _showToast('✅ Все сигналы пойманы! Бонус применён!', '📡');
}

function signalGameFail() {
  if (!activeSignalGame.active) return;
  
  const { expId } = activeSignalGame;
  
  playerState.echoCooldowns[expId] = Date.now() + 30000;
  saveGame();
  
  cleanupSignalGame();
  document.getElementById('signalGameOverlay').classList.remove('active');
  if (_showToast) _showToast('❌ Сбой системы... Разведка ушла на перезарядку', '📡');
}

function cleanupSignalGame() {
  clearTimer('signal');
  clearTimeoutTimer('signalTimeout');
  activeSignalGame.points.forEach(p => p.remove());
  activeSignalGame.active = false;
  activeSignalGame.expId = null;
  activeSignalGame.bonusType = null;
  activeSignalGame.points = [];
}

function applyEchoBonus(expId) {
  const exp = playerState.expeditions[expId];
  if (!exp || !exp.active) return;
  
  const reduction = Math.floor((exp.endTime - Date.now()) * 0.15);
  exp.endTime -= reduction;
  playerState.expeditionBonuses[expId] = 'echo';
  
  saveGame();
  if (_showToast) _showToast(`Время экспедиции сокращено на ${Math.floor(reduction / 1000)}с!`, '📡');
}

function applyScanBonus(expId) {
  const exp = playerState.expeditions[expId];
  if (!exp || !exp.active) return;
  
  exp.scanUsed = true;
  exp.specialChanceBoost = 1.2;
  playerState.expeditionBonuses[expId] = 'scan';
  
  saveGame();
  if (_showToast) _showToast('Глубинное сканирование активировано! +20% к шансу особой жеоды', '🔬');
}

// ---------- ☄️ МЕТЕОРИТНЫЙ ШТОРМ ----------
export function getMeteorCooldownRemaining() {
  if (!playerState.meteorCooldownEnd) return 0;
  const diff = playerState.meteorCooldownEnd - Date.now();
  return Math.max(0, diff);
}

export function isMeteorStormOnCooldown() {
  return getMeteorCooldownRemaining() > 0;
}

export function canStartMeteorStorm() {
  if (meteorStormState.active) return false;
  if (isMeteorStormOnCooldown()) return false;
  return true;
}

function getMeteorType() {
  const rand = Math.random();
  
  const hasOrion = playerState.ingots['orion'] > 0;
  const hasAndromeda = playerState.ingots['andromeda'] > 0;
  const canSpawnSecret = !hasOrion || !hasAndromeda;
  
  if (canSpawnSecret && rand < 0.01) {
    return { type: 'secret', shards: 100, speed: 1.0, color: '#FF00FF', emoji: '💜', size: 70 };
  }
  if (rand < 0.05) {
    return { type: 'legendary', shards: 50, speed: 1.2, color: '#FFD700', emoji: '✨', size: 60 };
  }
  if (rand < 0.29) {
    return { type: 'rare', shards: 15, speed: 1.6, color: '#FF8C00', emoji: '🔥', size: 52 };
  }
  return { type: 'common', shards: 5, speed: 2.5, color: '#A0A0A0', emoji: '☄️', size: 46 };
}

function spawnMeteor(container) {
  if (!meteorStormState.active) return;
  
  const meteorData = getMeteorType();
  meteorStormState.meteorsSpawned++;
  
  const meteor = document.createElement('div');
  meteor.className = 'storm-meteor';
  meteor.dataset.type = meteorData.type;
  meteor.dataset.shards = meteorData.shards;
  
  const x = Math.random() * (container.clientWidth - 80) + 20;
  const size = meteorData.size;
  
  meteor.style.left = x + 'px';
  meteor.style.top = '-70px';
  meteor.style.width = size + 'px';
  meteor.style.height = size + 'px';
  meteor.style.fontSize = (size * 0.55) + 'px';
  meteor.textContent = meteorData.emoji;
  meteor.style.animationDuration = meteorData.speed + 's';
  meteor.style.padding = '10px';
  
  if (meteorData.type === 'secret') {
    meteor.style.animationName = 'meteorFallSecret';
    meteor.style.setProperty('--drift', (Math.random() * 100 - 50) + 'px');
  }
  
  meteor.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!meteorStormState.active) return;
    
    meteorStormState.meteorsCaught++;
    meteorStormState.shardsCollected += meteorData.shards;
    
    const shardsDisplay = document.getElementById('stormShardsDisplay');
    if (shardsDisplay) {
      shardsDisplay.textContent = `Осколков: ${meteorStormState.shardsCollected}`;
    }
    
    const floatText = document.createElement('div');
    floatText.className = 'storm-float-text';
    floatText.textContent = '+' + meteorData.shards;
    floatText.style.left = x + 'px';
    floatText.style.top = (parseFloat(meteor.style.top) || 50) + 'px';
    floatText.style.color = meteorData.color;
    container.appendChild(floatText);
    setTimeout(() => floatText.remove(), 500);
    
    if (meteorData.type === 'secret') {
      meteorStormState.secretMeteorCaught = true;
      sendBotNotification('🌟 Игрок поймал секретный метеорит!');
    }
    
    meteor.remove();
  });
  
  meteor.addEventListener('animationend', () => {
    meteor.remove();
  });
  
  container.appendChild(meteor);
  
  setTimeout(() => {
    if (meteor.parentNode) meteor.remove();
  }, meteorData.speed * 1000 + 500);
}

function scheduleNextMeteor(container) {
  if (!meteorStormState.active) return;
  const delay = 250 + Math.random() * 550;
  activeTimers['meteorSpawn'] = setTimeout(() => {
    spawnMeteor(container);
    scheduleNextMeteor(container);
  }, delay);
}

export function startMeteorStorm() {
  if (!canStartMeteorStorm()) return;
  
  const container = document.getElementById('meteorStormArea');
  if (!container) return;
  
  container.innerHTML = '';
  
  meteorStormState.active = true;
  meteorStormState.shardsCollected = 0;
  meteorStormState.meteorsSpawned = 0;
  meteorStormState.meteorsCaught = 0;
  meteorStormState.secretMeteorCaught = false;
  meteorStormState.roundStartTime = Date.now();
  
  document.getElementById('meteorStormOverlay').classList.add('active');
  document.getElementById('stormTimerDisplay').textContent = '20';
  document.getElementById('stormShardsDisplay').textContent = 'Осколков: 0';
  
  let secondsLeft = 20;
  const countdownInterval = setInterval(() => {
    secondsLeft--;
    const display = document.getElementById('stormTimerDisplay');
    if (display) display.textContent = secondsLeft;
    
    if (secondsLeft <= 0) {
      clearInterval(countdownInterval);
      endMeteorStorm();
    }
  }, 1000);
  
  activeTimers['meteorRound'] = countdownInterval;
  
  scheduleNextMeteor(container);
  
  playerState.meteorCooldownEnd = Date.now() + meteorStormState.cooldownDuration;
  saveGame();
  
  if (_renderEventsTab) _renderEventsTab();
}

function endMeteorStorm() {
  meteorStormState.active = false;
  
  clearTimer('meteorSpawn');
  clearTimer('meteorRound');
  
  const container = document.getElementById('meteorStormArea');
  if (container) {
    container.querySelectorAll('.storm-meteor, .storm-float-text').forEach(el => el.remove());
  }
  
  playerState.meteorShards += meteorStormState.shardsCollected;
  saveGame();
  
  document.getElementById('meteorStormOverlay').classList.remove('active');
  
  import('./ui.js').then(ui => {
    ui.showMeteorStormResults(meteorStormState.shardsCollected, meteorStormState.meteorsCaught, meteorStormState.secretMeteorCaught);
  });
  
  if (_renderEventsTab) _renderEventsTab();
}

export const METEOR_SHOP_ITEMS = {
  meteor_common: { geodeId: 'meteor_common', name: 'Космический обломок', icon: '☄️', price: 300, description: 'Обычный осколок метеоритного дождя.' },
  meteor_rare: { geodeId: 'meteor_rare', name: 'Звёздное ядро', icon: '🌟', price: 700, description: 'Редкое ядро разрушенной звезды.' },
  meteor_legendary: { geodeId: 'meteor_legendary', name: 'Осколок Пустоты', icon: '🕳️', price: 2000, description: 'Легендарный осколок из глубин Пустоты.' }
};

export function buyMeteorGeode(shopItemId) {
  const item = METEOR_SHOP_ITEMS[shopItemId];
  if (!item) {
    if (_showToast) _showToast('Товар не найден!', '⚠️');
    return false;
  }
  
  if (playerState.meteorShards < item.price) {
    if (_showToast) _showToast(`Недостаточно осколков! Нужно ${item.price} 💎`, '⚠️');
    return false;
  }
  
  playerState.meteorShards -= item.price;
  playerState.geodes[item.geodeId] = (playerState.geodes[item.geodeId] || 0) + 1;
  
  saveGame();
  
  if (_showToast) _showToast(`Куплено: ${item.name}!`, item.icon);
  sendBotNotification(`🛒 Игрок купил ${item.name} за ${item.price} осколков`);
  
  if (_renderEventsTab) _renderEventsTab();
  return true;
}

// ---------- СИСТЕМА СОХРАНЕНИЙ ----------
export function saveGame() {
  if (!playerState) return;
  
  const ingotSave = getIngotSaveData();
  
  const saveData = JSON.stringify({
    playerState: {
      expeditions: playerState.expeditions,
      geodes: playerState.geodes,
      ingots: playerState.ingots,
      discoveredSpecialGeodes: playerState.discoveredSpecialGeodes,
      collectedArtifacts: playerState.collectedArtifacts,
      minedStats: playerState.minedStats,
      player: playerState.player,
      echoCooldowns: playerState.echoCooldowns,
      expeditionBonuses: playerState.expeditionBonuses,
      meteorShards: playerState.meteorShards,
      meteorCooldownEnd: playerState.meteorCooldownEnd,
      activeQuests: playerState.activeQuests,
      questRefreshTime: playerState.questRefreshTime,
      completedQuests: playerState.completedQuests,
      questCooldownEnd: playerState.questCooldownEnd,
      ingotShavings: ingotSave.ingotShavings,
      tapEnergy: ingotSave.tapEnergy,
      maxTapEnergy: ingotSave.maxTapEnergy,
      lastEnergyRegen: ingotSave.lastEnergyRegen,
      levelLocked: ingotSave.levelLocked,
      equippedArtifacts: playerState.equippedArtifacts || [null, null, null],
      unlockedExpeditions: playerState.unlockedExpeditions || ['swamp'],
      discoveredAlchemyRecipes: playerState.discoveredAlchemyRecipes || [],
      discoveredKnowledge: playerState.discoveredKnowledge || {},
      synthesisFailCount: playerState.synthesisFailCount || {}
    },
    collectibleSerials,
    nextSerial,
    activeEventId: eventsManager.activeEventId,
    eventEndTime: eventsManager.eventEndTime,
    lastEventId: eventsManager.lastEventId
  });
  
  try {
    localStorage.setItem('starforge_v1', saveData);
  } catch (e) {}
}

function applySaveData(data) {
  if (!playerState) return;
  if (!data || !data.playerState) return;
  
  const saved = data.playerState;
  
  if (saved.geodes && typeof saved.geodes === 'object') {
    for (let k in saved.geodes) {
      playerState.geodes[k] = saved.geodes[k];
    }
  }
  if (saved.ingots && typeof saved.ingots === 'object') {
    for (let k in saved.ingots) {
      playerState.ingots[k] = saved.ingots[k];
    }
  }
  if (saved.minedStats && typeof saved.minedStats === 'object') {
    for (let k in saved.minedStats) {
      playerState.minedStats[k] = saved.minedStats[k];
    }
  }
  if (saved.echoCooldowns && typeof saved.echoCooldowns === 'object') {
    for (let k in saved.echoCooldowns) {
      playerState.echoCooldowns[k] = saved.echoCooldowns[k];
    }
  }
  if (saved.expeditionBonuses && typeof saved.expeditionBonuses === 'object') {
    for (let k in saved.expeditionBonuses) {
      playerState.expeditionBonuses[k] = saved.expeditionBonuses[k];
    }
  }
  
  if (saved.expeditions && typeof saved.expeditions === 'object') {
    for (let k in saved.expeditions) {
      if (playerState.expeditions[k] && saved.expeditions[k]) {
        playerState.expeditions[k].active = saved.expeditions[k].active;
        playerState.expeditions[k].endTime = saved.expeditions[k].endTime;
        playerState.expeditions[k].scanUsed = saved.expeditions[k].scanUsed || false;
        playerState.expeditions[k].specialChanceBoost = saved.expeditions[k].specialChanceBoost || null;
      }
    }
  }
  
  if (saved.player && typeof saved.player === 'object' && typeof saved.player.level === 'number' && typeof saved.player.xp === 'number') {
    playerState.player.level = saved.player.level;
    playerState.player.xp = saved.player.xp;
    playerState.player.totalOpened = saved.player.totalOpened || 0;
    playerState.player.totalIngots = saved.player.totalIngots || 0;
    playerState.player.totalArtifacts = saved.player.totalArtifacts || 0;
  }
  
  if (saved.collectedArtifacts && typeof saved.collectedArtifacts === 'object') {
    if (Array.isArray(saved.collectedArtifacts.swamp)) {
      playerState.collectedArtifacts.swamp = [...saved.collectedArtifacts.swamp];
    }
    if (Array.isArray(saved.collectedArtifacts.rotforest)) {
      playerState.collectedArtifacts.rotforest = [...saved.collectedArtifacts.rotforest];
    }
    if (Array.isArray(saved.collectedArtifacts.rustbottom)) {
      playerState.collectedArtifacts.rustbottom = [...saved.collectedArtifacts.rustbottom];
    }
    if (Array.isArray(saved.collectedArtifacts.meteor)) {
      playerState.collectedArtifacts.meteor = [...saved.collectedArtifacts.meteor];
    }
  }
  
  if (saved.discoveredSpecialGeodes && typeof saved.discoveredSpecialGeodes === 'object') {
    for (let k in saved.discoveredSpecialGeodes) {
      playerState.discoveredSpecialGeodes[k] = saved.discoveredSpecialGeodes[k];
    }
  }
  
  if (typeof saved.meteorShards === 'number') {
    playerState.meteorShards = saved.meteorShards;
  }
  if (typeof saved.meteorCooldownEnd === 'number' || saved.meteorCooldownEnd === null) {
    playerState.meteorCooldownEnd = saved.meteorCooldownEnd;
  }
  
  if (Array.isArray(saved.activeQuests)) {
    playerState.activeQuests = [...saved.activeQuests];
  }
  if (typeof saved.questRefreshTime === 'number' || saved.questRefreshTime === null) {
    playerState.questRefreshTime = saved.questRefreshTime;
  }
  if (Array.isArray(saved.completedQuests)) {
    playerState.completedQuests = [...saved.completedQuests];
  }
  if (typeof saved.questCooldownEnd === 'number' || saved.questCooldownEnd === null) {
    playerState.questCooldownEnd = saved.questCooldownEnd;
  }
  
  if (Array.isArray(saved.equippedArtifacts)) {
    playerState.equippedArtifacts = [...saved.equippedArtifacts];
  } else {
    playerState.equippedArtifacts = [null, null, null];
  }
  
  if (Array.isArray(saved.unlockedExpeditions)) {
    playerState.unlockedExpeditions = [...saved.unlockedExpeditions];
  } else {
    playerState.unlockedExpeditions = ['swamp'];
  }
  
  if (Array.isArray(saved.discoveredAlchemyRecipes)) {
    playerState.discoveredAlchemyRecipes = [...saved.discoveredAlchemyRecipes];
  } else {
    playerState.discoveredAlchemyRecipes = [];
  }
  
  if (saved.discoveredKnowledge && typeof saved.discoveredKnowledge === 'object') {
    playerState.discoveredKnowledge = { ...saved.discoveredKnowledge };
  } else {
    playerState.discoveredKnowledge = {};
  }
  
  if (saved.synthesisFailCount && typeof saved.synthesisFailCount === 'object') {
    playerState.synthesisFailCount = { ...saved.synthesisFailCount };
  } else {
    playerState.synthesisFailCount = {};
  }
  
  initIngotState({
    ingotShavings: saved.ingotShavings || 0,
    tapEnergy: saved.tapEnergy || 500,
    maxTapEnergy: saved.maxTapEnergy || 500,
    lastEnergyRegen: saved.lastEnergyRegen || Date.now(),
    levelLocked: saved.levelLocked || false
  });
  
  if (data.collectibleSerials) {
    for (let k in data.collectibleSerials) {
      collectibleSerials[k] = data.collectibleSerials[k];
    }
  }
  if (data.nextSerial) nextSerial = data.nextSerial;
  if (data.activeEventId) eventsManager.activeEventId = data.activeEventId;
  if (data.eventEndTime) eventsManager.eventEndTime = data.eventEndTime;
  if (data.lastEventId) eventsManager.lastEventId = data.lastEventId;
}

export const saveToLocalStorage = saveGame;

// ========== АСИНХРОННАЯ ИНИЦИАЛИЗАЦИЯ ==========
(function applyDefaultStateImmediately() {
  const d = DEFAULT_STATE;
  
  playerState.expeditions = {
    swamp: { ...d.expeditions.swamp },
    rotforest: { ...d.expeditions.rotforest },
    rustbottom: { ...d.expeditions.rustbottom }
  };
  playerState.geodes = { ...d.geodes };
  for (let k in d.ingots) playerState.ingots[k] = d.ingots[k];
  for (let k in d.minedStats) playerState.minedStats[k] = d.minedStats[k];
  playerState.discoveredSpecialGeodes = { ...d.discoveredSpecialGeodes };
  playerState.collectedArtifacts = {
    swamp: [...(d.collectedArtifacts.swamp || [])],
    rotforest: [...(d.collectedArtifacts.rotforest || [])],
    rustbottom: [...(d.collectedArtifacts.rustbottom || [])],
    meteor: [...(d.collectedArtifacts.meteor || [])]
  };
  playerState.player.level = d.player.level;
  playerState.player.xp = d.player.xp;
  playerState.player.totalOpened = d.player.totalOpened;
  playerState.player.totalIngots = d.player.totalIngots;
  playerState.player.totalArtifacts = d.player.totalArtifacts;
  playerState.echoCooldowns = {};
  playerState.expeditionBonuses = {};
  playerState.meteorShards = 0;
  playerState.meteorCooldownEnd = null;
  playerState.activeQuests = [];
  playerState.questRefreshTime = null;
  playerState.completedQuests = [];
  playerState.questCooldownEnd = null;
  playerState.equippedArtifacts = [null, null, null];
  playerState.unlockedExpeditions = ['swamp'];
  playerState.discoveredAlchemyRecipes = [];
  playerState.discoveredKnowledge = {};
  playerState.synthesisFailCount = {};
  
  console.log('[Core] DEFAULT_STATE применён синхронно при загрузке модуля');
})();

let initPromise = null;

export async function initializeState() {
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    console.log('[Boot] Инициализация состояния (загрузка сохранений)...');
    
    try {
      const localData = localStorage.getItem('starforge_v1');
      if (localData) {
        applySaveData(JSON.parse(localData));
        console.log('[Boot] Local save loaded');
      }
    } catch (e) {}
    
    console.log('[Boot] Инициализация завершена');
    eventsManager.startEventCycle();
    
    if (!playerState.activeQuests || playerState.activeQuests.length === 0) {
      const now = Date.now();
      if (!playerState.questCooldownEnd || now >= playerState.questCooldownEnd) {
        refreshActiveQuests();
      }
    }
    
    return true;
  })();
  
  return initPromise;
}

// ---------- ЭКСПЕДИЦИИ ----------
function getRandomDropFromExpedition(expId) {
  const exp = CONFIG_EXPEDITIONS[expId];
  if (!exp) return { geodeId: 'swamp', isSpecial: false };
  
  const playerExp = playerState.expeditions[expId];
  let specialChance = exp.specialGeodeChance;
  
  if (playerExp?.scanUsed && playerExp?.specialChanceBoost) {
    specialChance *= playerExp.specialChanceBoost;
  }
  
  if (!isLocationCompleted(expId)) {
    const rand = Math.random();
    if (rand < specialChance) {
      return { geodeId: exp.specialGeodeId, isSpecial: true };
    }
  }
  
  return { geodeId: expId, isSpecial: false };
}

function checkCompletedExpeditions() {
  if (!playerState) return;
  
  let changed = false;
  const now = Date.now();
  
  for (let k in playerState.expeditions) {
    const exp = playerState.expeditions[k];
    if (exp && exp.active && exp.endTime && now >= exp.endTime) {
      exp.active = false;
      exp.endTime = null;
      exp.scanUsed = false;
      exp.specialChanceBoost = null;
      delete playerState.expeditionBonuses[k];
      
      const drop = getRandomDropFromExpedition(k);
      
      const doubleDropChance = getBonusDoubleDrop();
      let extraDrop = false;
      if (doubleDropChance > 0 && Math.random() * 100 < doubleDropChance) {
        extraDrop = true;
      }
      
      if (drop.isSpecial) {
        if (!playerState.discoveredSpecialGeodes[k]) {
          playerState.discoveredSpecialGeodes[k] = true;
        }
        playerState.geodes[drop.geodeId] = (playerState.geodes[drop.geodeId] || 0) + 1;
        if (extraDrop) {
          playerState.geodes[drop.geodeId] = (playerState.geodes[drop.geodeId] || 0) + 1;
        }
        if (_showToast) _showToast(`Найдена особая жеода: ${CONFIG_GEODES[drop.geodeId].name}!${extraDrop ? ' (x2!)' : ''}`, CONFIG_GEODES[drop.geodeId].icon);
        sendBotNotification(`💎 Игрок нашёл особую жеоду: ${CONFIG_GEODES[drop.geodeId].name}!`);
      } else {
        playerState.geodes[drop.geodeId] = (playerState.geodes[drop.geodeId] || 0) + 1;
        if (extraDrop) {
          playerState.geodes[drop.geodeId] = (playerState.geodes[drop.geodeId] || 0) + 1;
        }
        if (_showToast) _showToast(`Экспедиция завершена! +${extraDrop ? 2 : 1} ${CONFIG_GEODES[drop.geodeId].name}`, CONFIG_GEODES[drop.geodeId].icon);
      }
      changed = true;
    }
  }
  
  if (changed) {
    saveGame();
    if (_renderCurrentTab) _renderCurrentTab();
  }
}

export function startGlobalTimer() {
  clearTimer('global');
  setTimerInterval('global', () => {
    checkCompletedExpeditions();
    updateExpeditionTimers();
    updateEventTimer();
    updateQuestTimer();
    regenEnergy();
  }, 500);
}

function updateExpeditionTimers() {
  if (!playerState) return;
  
  const now = Date.now();
  for (let k in CONFIG_EXPEDITIONS) {
    const exp = playerState.expeditions[k];
    const el = document.getElementById(`timer-${k}`);
    if (el && exp && exp.active && exp.endTime) {
      const diff = Math.max(0, exp.endTime - now);
      const m = Math.floor(diff / 60000);
      const s = Math.ceil((diff % 60000) / 1000);
      el.textContent = `⏳ ${m}:${s.toString().padStart(2, '0')}`;
    }
  }
}

function updateEventTimer() {
  const event = eventsManager.getActiveEvent();
  const timerEl = document.getElementById('eventTimer');
  if (timerEl && event) {
    timerEl.textContent = eventsManager.getTimeLeft();
  }
}

function updateQuestTimer() {
  const questTimerEl = document.getElementById('questCooldownTimer');
  if (!questTimerEl) return;
  
  const remaining = getQuestCooldownRemaining();
  if (remaining > 0) {
    const m = Math.floor(remaining / 60000);
    const s = Math.ceil((remaining % 60000) / 1000);
    questTimerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
  } else {
    checkAndRefreshQuests();
    if (_renderEventsTab) {
      import('./ui.js').then(ui => {
        if (ui.currentTab === 'events') _renderEventsTab();
      });
    }
  }
}

export function startExpedition(expId) {
  if (!playerState) return;
  
  const exp = playerState.expeditions[expId];
  if (!exp || exp.active) return;
  
  if (playerState.unlockedExpeditions && !playerState.unlockedExpeditions.includes(expId)) {
    if (_showToast) _showToast('Эта экспедиция ещё не открыта!', '🔒');
    return;
  }
  
  const bonusSpeed = getBonusExpeditionSpeed();
  const baseTimer = CONFIG_EXPEDITIONS[expId].timer * 1000;
  const adjustedTimer = Math.floor(baseTimer * (1 - bonusSpeed / 100));
  
  exp.active = true;
  exp.endTime = Date.now() + adjustedTimer;
  exp.scanUsed = false;
  exp.specialChanceBoost = null;
  delete playerState.expeditionBonuses[expId];
  
  saveGame();
  if (_renderExpeditionsTab) _renderExpeditionsTab();
  if (_showToast) _showToast(`Экспедиция началась!`, CONFIG_EXPEDITIONS[expId].fallbackIcon);
  sendBotNotification(`⛏️ Игрок отправился в экспедицию: ${CONFIG_EXPEDITIONS[expId].name}`);
}

// ========== 🧪 АЛХИМИЯ: СПЛАВЛЕНИЕ СЛИТКОВ ==========
export function performAlchemy(ingotId1, ingotId2) {
  if (!playerState) return { success: false, message: 'Ошибка состояния игры.' };
  
  let matchedRecipe = null;
  for (let recipeId in ALCHEMY_RECIPES) {
    const recipe = ALCHEMY_RECIPES[recipeId];
    const hasBoth = recipe.ingredients.includes(ingotId1) && recipe.ingredients.includes(ingotId2);
    if (hasBoth) {
      matchedRecipe = recipe;
      break;
    }
  }
  
  if (!matchedRecipe) {
    return { success: false, message: 'Рецепт не найден!' };
  }
  
  if (playerState.player.level < matchedRecipe.reqLevel) {
    return { success: false, message: `Требуется ${matchedRecipe.reqLevel} уровень!` };
  }
  
  if ((playerState.ingots[ingotId1] || 0) < 1) {
    return { success: false, message: `Недостаточно ${CONFIG_ITEMS[ingotId1]?.name || ingotId1}!` };
  }
  if ((playerState.ingots[ingotId2] || 0) < 1) {
    return { success: false, message: `Недостаточно ${CONFIG_ITEMS[ingotId2]?.name || ingotId2}!` };
  }
  
  // ★ ПРОВЕРКА СТРУЖКИ ДЛЯ АЛХИМИИ
  const shavingsCost = matchedRecipe.shavingsCost || 30;
  const currentShavings = getShavings();
  if (currentShavings < shavingsCost) {
    return { success: false, message: `Недостаточно стружки! Нужно ${shavingsCost}` };
  }
  
  if (!playerState.discoveredAlchemyRecipes) {
    playerState.discoveredAlchemyRecipes = [];
  }
  const isFirstDiscovery = !playerState.discoveredAlchemyRecipes.includes(matchedRecipe.id);
  
  playerState.ingots[ingotId1]--;
  playerState.ingots[ingotId2]--;
  
  // ★ СПИСЫВАЕМ СТРУЖКУ
  import('./ingot.js').then(ingotModule => {
    ingotModule.deductShavings(shavingsCost);
  });
  
  playerState.ingots[matchedRecipe.resultIngotId] = (playerState.ingots[matchedRecipe.resultIngotId] || 0) + 1;
  playerState.minedStats[matchedRecipe.resultIngotId] = (playerState.minedStats[matchedRecipe.resultIngotId] || 0) + 1;
  playerState.player.totalIngots++;
  
  revealIngotUsage(ingotId1);
  revealIngotUsage(ingotId2);
  revealIngotSource(matchedRecipe.resultIngotId);
  
  let totalXP = matchedRecipe.xpReward;
  if (isFirstDiscovery) {
    playerState.discoveredAlchemyRecipes.push(matchedRecipe.id);
    totalXP += matchedRecipe.discoveryBonusXP;
  }
  addXP(totalXP);
  
  saveGame();
  
  const resultIngot = CONFIG_ITEMS[matchedRecipe.resultIngotId];
  
  return {
    success: true,
    recipe: matchedRecipe,
    resultIngot: resultIngot,
    isFirstDiscovery: isFirstDiscovery,
    xpGained: totalXP,
    shavingsCost: shavingsCost
  };
}

// ---------- ЧАСТИЦЫ И ТРЯСКА ----------
function createParticles(x, y) {
  const container = document.getElementById('app');
  const particleCount = 12;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const angle = (i / particleCount) * Math.PI * 2;
    const distance = 40 + Math.random() * 60;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.setProperty('--tx', tx + 'px');
    particle.style.setProperty('--ty', ty + 'px');
    
    container.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 800);
  }
}

function createEliteParticles() {
  const container = document.getElementById('app');
  const particleCount = 16;
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'elite-particle';
    
    particle.style.left = centerX + 'px';
    particle.style.top = centerY + 'px';
    particle.style.animationDelay = (i * 0.1) + 's';
    
    container.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 2500);
  }
}

function triggerScreenShake() {
  const app = document.getElementById('app');
  app.classList.add('screen-shake');
  setTimeout(() => {
    app.classList.remove('screen-shake');
  }, 120);
}

function showCollectibleAnimation(ingot) {
  const flash = document.createElement('div');
  flash.className = 'collectible-flash';
  document.body.appendChild(flash);
  
  createEliteParticles();
  
  const appear = document.createElement('div');
  appear.className = 'collectible-appear';
  
  const icon = document.createElement('div');
  icon.className = 'collectible-appear-icon';
  icon.textContent = ingot.icon;
  icon.style.color = ingot.fallbackColor;
  
  const text = document.createElement('div');
  text.className = 'collectible-appear-text';
  text.textContent = ingot.name;
  
  appear.appendChild(icon);
  appear.appendChild(text);
  document.body.appendChild(appear);
  
  setTimeout(() => {
    flash.remove();
    appear.remove();
  }, 2500);
  
  sendBotNotification(`🏆 Игрок получил коллекционный артефакт: ${ingot.name} ${ingot.icon}!`);
}

// ---------- ЛИДЕРБОРД ----------
export async function updateLeaderboard() {
  renderTestLeaderboard();
}

function renderTestLeaderboard() {
  const testData = [
    { rank: 1, name: '🫧 Болотный_Князь', xp: 15000 }, { rank: 2, name: '🦴 Гнилой_Лорд', xp: 12000 },
    { rank: 3, name: '🔩 Ржавый_Старатель', xp: 8500 }, { rank: 4, name: 'Старатель', xp: playerState.player.xp, isPlayer: true },
    { rank: 5, name: '🟤 Тинистый_777', xp: 3200 }, { rank: 6, name: '🪵 Древесный_Копатель', xp: 2100 },
    { rank: 7, name: '🧶 Проволочный_Бур', xp: 900 }, { rank: 8, name: '🧩 Кафельный_Путник', xp: 450 },
    { rank: 9, name: '🟢 Иловый_Волк', xp: 200 }, { rank: 10, name: '🫧 Новичок_2026', xp: 50 }
  ];
  
  testData.sort((a, b) => b.xp - a.xp);
  testData.forEach((entry, i) => entry.rank = i + 1);
  
  let html = `<div class="modal-header"><div class="modal-title">🏆 ТОП ИГРОКОВ</div><button class="modal-close" onclick="document.dispatchEvent(new Event('closeModal'))">✕</button></div><div class="modal-content" style="text-align:left; padding:10px;">`;
  testData.forEach((entry) => {
    const isPlayer = entry.isPlayer;
    html += `<div style="display:flex; align-items:center; gap:12px; padding:12px; background:${isPlayer ? 'rgba(139, 115, 85, 0.15)' : 'rgba(255,255,255,0.03)'}; border-radius:16px; margin-bottom:8px;"><span style="font-size:20px; font-weight:700; width:30px;">${entry.rank}</span><span style="flex:1; font-weight:600;">${entry.name} ${isPlayer ? '👈' : ''}</span><span style="color:#8B7355; font-weight:700;">${entry.xp} XP</span></div>`;
  });
  html += '</div>';
  
  import('./ui.js').then(ui => ui.openModal(html));
}

// ---------- КОНВЕЙЕР (СЛУЧАЙНЫЙ ПАТТЕРН + БЫСТРОЕ ОТКРЫТИЕ) ----------
const conveyorOverlay = document.getElementById('conveyorOverlay');
const conveyorTrack = document.getElementById('conveyorTrack');
const conveyorTitle = document.getElementById('conveyorTitle');

let conveyorState = { geodeId: null, isOpen: false, resultIngot: null, items: [], trackItems: [], timeoutId: null };
const ITEM_WIDTH = 96;
const VISIBLE_ITEMS = 3;

function cleanupConveyor() { if (conveyorState.timeoutId) { clearTimeout(conveyorState.timeoutId); conveyorState.timeoutId = null; } conveyorOverlay.classList.remove('active'); conveyorState.isOpen = false; }

function generateRandomPattern(items, resultIngot) {
  const totalLength = 20 + Math.floor(Math.random() * 21);
  const trackItems = [];
  
  for (let i = 0; i < totalLength; i++) {
    trackItems.push(items[Math.floor(Math.random() * items.length)]);
  }
  
  const targetSlot = Math.floor(totalLength * (0.65 + Math.random() * 0.2));
  trackItems[targetSlot] = resultIngot;
  
  return { trackItems, targetSlot, totalLength };
}

function skipConveyor() {
  if (!conveyorState.isOpen || !playerState) return;
  
  if (conveyorState.timeoutId) {
    clearTimeout(conveyorState.timeoutId);
    conveyorState.timeoutId = null;
  }
  
  const resultIngot = conveyorState.resultIngot;
  const g = CONFIG_GEODES[conveyorState.geodeId];
  let xpGained = g.xpValue + (resultIngot?.xpValue || 0);
  let isFirstDiscovery = false;
  
  if (playerState.minedStats[resultIngot.id] === 0) {
    isFirstDiscovery = true;
    xpGained = Math.floor(xpGained * 3);
    if (_showToast) _showToast(`🎉 ПЕРВОЕ ОТКРЫТИЕ! +${xpGained} XP`, '🌟');
  }
  
  playerState.ingots[resultIngot.id] = (playerState.ingots[resultIngot.id] || 0) + 1;
  playerState.minedStats[resultIngot.id] = (playerState.minedStats[resultIngot.id] || 0) + 1;
  playerState.player.totalIngots++;
  addXP(xpGained);
  saveGame();
  cleanupConveyor();
  isOpeningGeode = false;
  
  revealIngotSource(resultIngot.id);
  
  setTimeout(() => {
    if (_showRewardPopup) _showRewardPopup(resultIngot);
    if (_renderCurrentTab) _renderCurrentTab();
  }, 100);
}

export function initRoulette(geodeId) {
  if (!playerState) return;
  const g = CONFIG_GEODES[geodeId]; if (!g || g.isSpecial) return;
  
  const droppedId = getPityAdjustedDrop(geodeId);
  
  const resultIngot = CONFIG_ITEMS[droppedId];
  const items = g.lootTable.map(e => CONFIG_ITEMS[e.ingotId]);
  
  const { trackItems, targetSlot, totalLength } = generateRandomPattern(items, resultIngot);
  
  conveyorState.geodeId = geodeId;
  conveyorState.isOpen = true;
  conveyorState.resultIngot = resultIngot;
  conveyorState.items = items;
  conveyorState.trackItems = trackItems;
  
  conveyorTrack.innerHTML = '';
  trackItems.forEach((item, index) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'conveyor-item';
    itemEl.innerHTML = `<div class="conveyor-item-icon" id="conv-${index}"></div><div class="conveyor-item-name">${item.name}</div>`;
    conveyorTrack.appendChild(itemEl);
  });
  
  trackItems.forEach((item, index) => {
    const el = document.getElementById(`conv-${index}`);
    if (el && _renderImageToElement) {
      _renderImageToElement(el, item.imagePath, item.icon, item.fallbackColor);
    }
  });
  
  conveyorTitle.innerHTML = `
    ${g.name}
    <button id="skipConveyorBtn" style="display:block; margin: 8px auto 0; background: rgba(255,215,0,0.12); border: 1px solid rgba(255,215,0,0.25); color: var(--accent-gold); padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
      ⏩ Быстрое открытие
    </button>
  `;
  
  conveyorOverlay.classList.add('active');
  
  setTimeout(() => {
    const skipBtn = document.getElementById('skipConveyorBtn');
    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        skipConveyor();
      });
    }
  }, 50);
  
  const stopPosition = -(targetSlot * ITEM_WIDTH) + (VISIBLE_ITEMS * ITEM_WIDTH / 2) - ITEM_WIDTH / 2;
  conveyorTrack.style.transition = 'none';
  conveyorTrack.style.transform = 'translateX(0)';
  conveyorTrack.offsetHeight;
  
  setTimeout(() => {
    conveyorTrack.style.transition = 'transform 4.5s cubic-bezier(0.2, 0, 0.1, 1)';
    conveyorTrack.style.transform = `translateX(${stopPosition}px)`;
  }, 50);
  
  conveyorState.timeoutId = setTimeout(() => {
    stopRoulette();
  }, 4550);
}

function stopRoulette() {
  if (!conveyorState.isOpen || !playerState) return;
  const resultIngot = conveyorState.resultIngot; const g = CONFIG_GEODES[conveyorState.geodeId];
  let xpGained = g.xpValue + (resultIngot?.xpValue || 0); let isFirstDiscovery = false;
  if (playerState.minedStats[resultIngot.id] === 0) { isFirstDiscovery = true; xpGained = Math.floor(xpGained * 3); if (_showToast) _showToast(`🎉 ПЕРВОЕ ОТКРЫТИЕ! +${xpGained} XP`, '🌟'); }
  playerState.ingots[resultIngot.id] = (playerState.ingots[resultIngot.id] || 0) + 1; playerState.minedStats[resultIngot.id] = (playerState.minedStats[resultIngot.id] || 0) + 1; playerState.player.totalIngots++;
  addXP(xpGained); saveGame(); cleanupConveyor(); isOpeningGeode = false;
  
  revealIngotSource(resultIngot.id);
  
  setTimeout(() => { if (_showRewardPopup) _showRewardPopup(resultIngot); if (_renderCurrentTab) _renderCurrentTab(); }, 100);
}

// ---------- КУЗНИЦА (BRAWL) С КНОПКОЙ БЫСТРОГО ОТКРЫТИЯ ----------
let brawlState = { geodeId: null, isSpecial: false, tapsRemaining: 10, isOpen: false };
const brawlOverlay = document.getElementById('brawlOverlay');
const brawlGeode = document.getElementById('brawlGeode');
const brawlCounter = document.getElementById('brawlCounter');
const brawlResult = document.getElementById('brawlResult');
const brawlResultIcon = document.getElementById('brawlResultIcon');
const brawlResultName = document.getElementById('brawlResultName');
const brawlResultRarity = document.getElementById('brawlResultRarity');
const brawlCloseBtn = document.getElementById('brawlCloseBtn');

export function openBrawlOverlay(geodeId, isSpecial) {
  if (!playerState) return; if (isOpeningGeode) return;
  if (playerState.geodes[geodeId] <= 0) { if (_showToast) _showToast('Нет такой жеоды!', '⚠️'); return; }
  if (isSpecial) { const g = CONFIG_GEODES[geodeId]; const completed = isLocationCompleted(g.location); if (completed) { if (_showToast) _showToast('Все артефакты собраны! Используйте "Изучить" для обмена на XP.', '📚'); return; } }
  isOpeningGeode = true; brawlState.geodeId = geodeId; brawlState.isSpecial = isSpecial; brawlState.tapsRemaining = 10; brawlState.isOpen = true;
  brawlCounter.textContent = '10'; brawlResult.classList.remove('show'); brawlCloseBtn.style.display = 'none'; brawlGeode.style.display = 'flex'; brawlGeode.classList.remove('explode-animation');
  if (isSpecial) { brawlGeode.classList.add('special-geode'); } else { brawlGeode.classList.remove('special-geode'); }
  document.querySelector('.brawl-hint').style.display = 'block'; brawlCounter.style.display = 'block';
  if (_getGeodeStageImage && _renderImageToElement) { const stage = _getGeodeStageImage(geodeId, 10); _renderImageToElement(brawlGeode, stage.imagePath, stage.fallbackIcon, '#8B7355'); }
  
  const existingSkipBtn = document.getElementById('brawlSkipBtn');
  if (existingSkipBtn) existingSkipBtn.remove();
  
  const skipBtn = document.createElement('button');
  skipBtn.id = 'brawlSkipBtn';
  skipBtn.textContent = '⏩ Быстрое открытие';
  skipBtn.style.cssText = `
    display: block;
    margin: 16px auto 0;
    background: rgba(255,215,0,0.12);
    border: 1px solid rgba(255,215,0,0.25);
    color: var(--accent-gold);
    padding: 10px 20px;
    border-radius: 24px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  `;
  skipBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    skipBrawlOpening();
  });
  
  const brawlContent = document.getElementById('brawlContent');
  if (brawlContent) {
    brawlContent.appendChild(skipBtn);
  }
  
  brawlOverlay.classList.add('active');
}

function skipBrawlOpening() {
  if (!playerState || !brawlState.isOpen) return;
  
  const geodeId = brawlState.geodeId;
  const isSpecial = brawlState.isSpecial;
  
  if (playerState.geodes[geodeId] > 0) {
    playerState.geodes[geodeId]--;
  }
  playerState.player.totalOpened++;
  
  let droppedIngot = null;
  let xpGained = 0;
  
  if (isSpecial) {
    const g = CONFIG_GEODES[geodeId];
    const loc = g.location;
    if (!playerState.collectedArtifacts[loc]) {
      playerState.collectedArtifacts[loc] = [];
    }
    const available = g.possibleIngots.filter((ingId) => !playerState.collectedArtifacts[loc].includes(ingId));
    const picked = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : g.possibleIngots[0];
    droppedIngot = CONFIG_ITEMS[picked];
    playerState.ingots[picked] = (playerState.ingots[picked] || 0) + 1;
    playerState.minedStats[picked] = (playerState.minedStats[picked] || 0) + 1;
    if (!playerState.collectedArtifacts[loc].includes(picked)) {
      playerState.collectedArtifacts[loc].push(picked);
      playerState.player.totalArtifacts++;
    }
    if (!playerState.discoveredSpecialGeodes[loc]) playerState.discoveredSpecialGeodes[loc] = true;
    xpGained = droppedIngot.xpValue;
    addXP(xpGained);
    saveGame();
    
    revealIngotSource(picked);
    
    const isFirstCollectible = droppedIngot.isCollectible && playerState.ingots[droppedIngot.id] === 1;
    if (droppedIngot.isCollectible && isFirstCollectible) {
      showCollectibleAnimation(droppedIngot);
    }
    
    brawlGeode.style.display = 'none';
    document.querySelector('.brawl-hint').style.display = 'none';
    brawlCounter.style.display = 'none';
    const skipBtn = document.getElementById('brawlSkipBtn');
    if (skipBtn) skipBtn.remove();
    
    if (_renderImageToElement) _renderImageToElement(brawlResultIcon, droppedIngot.imagePath, droppedIngot.icon, droppedIngot.fallbackColor);
    brawlResultName.textContent = droppedIngot.name;
    brawlResultRarity.textContent = droppedIngot.rarity;
    brawlResultRarity.style.color = droppedIngot.rarityClass === 'collectible' ? '#FF64FF' : (droppedIngot.rarityClass === 'legendary' ? '#FFD700' : '#fff');
    brawlResult.classList.add('show');
    brawlCloseBtn.style.display = 'block';
    isOpeningGeode = false;
    if (_renderCurrentTab) _renderCurrentTab();
  } else {
    brawlOverlay.classList.remove('active');
    brawlState.isOpen = false;
    const skipBtn = document.getElementById('brawlSkipBtn');
    if (skipBtn) skipBtn.remove();
    initRoulette(geodeId);
  }
}

function closeBrawlOverlay() {
  brawlOverlay.classList.remove('active');
  brawlState.isOpen = false;
  isOpeningGeode = false;
  const skipBtn = document.getElementById('brawlSkipBtn');
  if (skipBtn) skipBtn.remove();
  if (_renderCurrentTab) _renderCurrentTab();
}

function handleBrawlTap(e) {
  if (!brawlState.isOpen || brawlState.tapsRemaining <= 0) return;
  const rect = brawlGeode.getBoundingClientRect(); const centerX = rect.left + rect.width / 2; const centerY = rect.top + rect.height / 2;
  createParticles(centerX, centerY); triggerScreenShake(); brawlGeode.classList.add('shake-animation');
  setTimeout(() => brawlGeode.classList.remove('shake-animation'), 300); brawlState.tapsRemaining--; brawlCounter.textContent = brawlState.tapsRemaining;
  if (_getGeodeStageImage && _renderImageToElement) { const stage = _getGeodeStageImage(brawlState.geodeId, brawlState.tapsRemaining); _renderImageToElement(brawlGeode, stage.imagePath, stage.fallbackIcon, '#8B7355'); }
  if (brawlState.tapsRemaining <= 0) finishBrawlOpening();
}

function finishBrawlOpening() {
  if (!playerState) return; const geodeId = brawlState.geodeId; const isSpecial = brawlState.isSpecial;
  if (playerState.geodes[geodeId] > 0) { playerState.geodes[geodeId]--; } playerState.player.totalOpened++;
  let droppedIngot = null; let xpGained = 0;
  const skipBtn = document.getElementById('brawlSkipBtn');
  if (skipBtn) skipBtn.remove();
  
  if (isSpecial) { const g = CONFIG_GEODES[geodeId]; const loc = g.location; if (!playerState.collectedArtifacts[loc]) { playerState.collectedArtifacts[loc] = []; } const available = g.possibleIngots.filter((ingId) => !playerState.collectedArtifacts[loc].includes(ingId)); const picked = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : g.possibleIngots[0]; droppedIngot = CONFIG_ITEMS[picked]; playerState.ingots[picked] = (playerState.ingots[picked] || 0) + 1; playerState.minedStats[picked] = (playerState.minedStats[picked] || 0) + 1; if (!playerState.collectedArtifacts[loc].includes(picked)) { playerState.collectedArtifacts[loc].push(picked); playerState.player.totalArtifacts++; } if (!playerState.discoveredSpecialGeodes[loc]) playerState.discoveredSpecialGeodes[loc] = true; xpGained = droppedIngot.xpValue; addXP(xpGained); saveGame(); revealIngotSource(picked); const isFirstCollectible = droppedIngot.isCollectible && playerState.ingots[droppedIngot.id] === 1; if (droppedIngot.isCollectible && isFirstCollectible) { showCollectibleAnimation(droppedIngot); } brawlGeode.classList.add('explode-animation'); brawlGeode.classList.remove('special-geode'); document.querySelector('.brawl-hint').style.display = 'none'; brawlCounter.style.display = 'none'; setTimeout(() => { brawlGeode.style.display = 'none'; if (_renderImageToElement) _renderImageToElement(brawlResultIcon, droppedIngot.imagePath, droppedIngot.icon, droppedIngot.fallbackColor); brawlResultName.textContent = droppedIngot.name; brawlResultRarity.textContent = droppedIngot.rarity; brawlResultRarity.style.color = droppedIngot.rarityClass === 'collectible' ? '#FF64FF' : (droppedIngot.rarityClass === 'legendary' ? '#FFD700' : '#fff'); brawlResult.classList.add('show'); brawlCloseBtn.style.display = 'block'; isOpeningGeode = false; if (_renderCurrentTab) _renderCurrentTab(); }, 500); }
  else { brawlGeode.classList.add('explode-animation'); document.querySelector('.brawl-hint').style.display = 'none'; brawlCounter.style.display = 'none'; setTimeout(() => { brawlOverlay.classList.remove('active'); brawlState.isOpen = false; initRoulette(geodeId); }, 500); }
}

if (brawlGeode) { brawlGeode.addEventListener('click', handleBrawlTap); }
if (brawlCloseBtn) { brawlCloseBtn.addEventListener('click', closeBrawlOverlay); }
