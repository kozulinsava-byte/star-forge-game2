// ========== UI МОДУЛЬ: ОТРИСОВКА ИНТЕРФЕЙСА ==========
import { CONFIG_ITEMS, CONFIG_GEODES, CONFIG_EXPEDITIONS, EXPEDITION_GROUPS, ALCHEMY_RECIPES, LEVELS, STATUSES, GUILD_QUESTS } from './config.js';
import { getPlayerState, getSerialForCollectible, isLocationCompleted, sellIngot, startExpedition, openBrawlOverlay, eventsManager, saveGame, devGiveXP, devGiveGeodes, devUnlockLocations, devResetGeodes, startSignalGame, exchangeSpecialGeodeForXP, openForge, sendBotNotification, registerUIFunctions, startMeteorStorm, canStartMeteorStorm, isMeteorStormOnCooldown, getMeteorCooldownRemaining, meteorStormState, buyMeteorGeode, METEOR_SHOP_ITEMS, completeQuest, refreshActiveQuests, toggleSpeedMode, getQuestCooldownRemaining, performAlchemy } from './core.js';
import { renderIngotScreen } from './ingot.js';

// 🆕 Точка входа для мини-игр
let _startQuenchGame = null;
let _startStackGame = null;
let _startUpgradeGame = null;

async function loadMiniGames() {
  try {
    const module = await import('./minigames.js');
    _startQuenchGame = module.startQuenchGame;
    _startStackGame = module.startStackGame;
    _startUpgradeGame = module.startUpgradeGame;
  } catch(e) {
    console.warn('[UI] Failed to load minigames module:', e);
  }
}

// Загружаем мини-игры при старте
loadMiniGames();

// Регистрируем UI функции в core.js
registerUIFunctions({
    showToast: showToast,
    getGeodeStageImage: getGeodeStageImage,
    updateProfileUI: updateProfileUI,
    updateCollectionProgress: updateCollectionProgress,
    renderCurrentTab: renderCurrentTab,
    renderExpeditionsTab: renderExpeditionsTab,
    renderImageToElement: renderImageToElement,
    showRewardPopup: showRewardPopup,
    renderEventsTab: renderGamesTab,
    updateMeteorShardsDisplay: updateMeteorShardsDisplay
});

// DOM-элементы
export const mainContent = document.getElementById('mainContent');
const showcaseOverlay = document.getElementById('showcaseOverlay');
const showcaseContent = document.getElementById('showcaseContent');
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');

// Текущие вкладки
export let currentTab = 'expeditions';
export let inventorySubTab = 'geodes';
export let collectionSubTab = 'encyclopedia';

// ID интервала для живого таймера в модалке
let modalTimerInterval = null;

// Состояние аккордеона
let expandedGroups = {};

// Состояние алхимии
let alchemyMode = false;
let alchemyFirstIngot = null;

// ---------- ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ТЕМЫ ----------
function initTheme() {
  const savedTheme = localStorage.getItem('starforge_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('starforge_theme', newTheme);
  
  const btn = document.getElementById('themeProfileBtn');
  if (btn) {
    btn.innerHTML = newTheme === 'dark' ? '🌙 Сменить тему (Светлая)' : '☀️ Сменить тему (Тёмная)';
  }
}

initTheme();

// ---------- УТИЛИТЫ РЕНДЕРИНГА (ЭМОДЗИ-ЗАГЛУШКИ) ----------
export function renderImageToElement(el, src, fallbackIcon, fallbackColor) {
  if (!el) return;
  
  el.innerHTML = '';
  const fb = document.createElement('span');
  fb.className = 'fallback-icon';
  fb.textContent = fallbackIcon;
  fb.style.color = fallbackColor || '#FFD700';
  fb.style.fontSize = el.classList.contains('card-icon') ? '40px' : 'inherit';
  el.appendChild(fb);
  
  const img = new Image();
  img.onload = () => {
    el.innerHTML = '';
    const i = document.createElement('img');
    i.src = src;
    i.alt = '';
    el.appendChild(i);
  };
  img.onerror = () => {};
  img.src = src;
}

export function renderMysteryPlaceholder(el) {
  if (!el) return;
  el.innerHTML = '<span style="font-size:40px; color:var(--text-muted);">?</span>';
}

export function getGeodeStageImage(geodeId, taps) {
  const g = CONFIG_GEODES[geodeId];
  if (!g) return { imagePath: '', fallbackIcon: '🪨' };
  
  for (let s of g.stages) {
    if (taps >= s.minTaps && taps <= s.maxTaps) {
      return { imagePath: s.imagePath, fallbackIcon: s.fallbackIcon };
    }
  }
  
  return { imagePath: g.stages[0].imagePath, fallbackIcon: g.stages[0].fallbackIcon };
}

export function showToast(msg, emoji = '✨') {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span>${emoji}</span> ${msg}`;
  c.appendChild(t);
  
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 300);
  }, 2500);
}

// ---------- REWARD POPUP ----------
export function showRewardPopup(ingot) {
  const overlay = document.getElementById('rewardPopupOverlay');
  const iconEl = document.getElementById('rewardPopupIcon');
  const nameEl = document.getElementById('rewardPopupName');
  const closeBtn = document.getElementById('rewardPopupClose');
  
  renderImageToElement(iconEl, ingot.imagePath, ingot.icon, ingot.fallbackColor);
  nameEl.textContent = ingot.name;
  
  overlay.classList.add('active');
  
  const closeHandler = () => {
    overlay.classList.remove('active');
    closeBtn.removeEventListener('click', closeHandler);
  };
  closeBtn.addEventListener('click', closeHandler);
}

// ---------- SHOWCASE (ОТКРЫТИЕ КАРТОЧКИ ИЗ ИНВЕНТАРЯ) ----------
function openInventoryShowcase(ingotId) {
  const state = getPlayerState();
  const ingot = CONFIG_ITEMS[ingotId];
  if (!ingot) return;
  
  const owned = state.ingots[ingotId] > 0;
  if (!owned) return;
  
  const rarityColors = {
    'common': '#A0A0A0',
    'rare': '#4A9CFF',
    'epic': '#B44AFF',
    'legendary': '#FFD700',
    'collectible': '#FF64FF'
  };
  
  const sourceNames = {
    'expedition': 'Экспедиционный',
    'crafted': 'Крафтовый',
    'meteor': 'Метеоритный',
    'special_meteor': 'Метеоритный',
    'alchemy': 'Алхимический'
  };
  
  const sourceColors = {
    'expedition': '#50C878',
    'crafted': '#FF8C00',
    'meteor': '#FF4444',
    'special_meteor': '#FF4444',
    'alchemy': '#FFD700'
  };

  const rarityColor = rarityColors[ingot.rarityLevel] || '#A0A0A0';
  const sourceColor = sourceColors[ingot.sourceType] || '#A0A0A0';
  const sourceName = sourceNames[ingot.sourceType] || ingot.sourceType;
  
  let html = `
    <div class="showcase-image" id="showcaseImage"></div>
    <div class="showcase-info">
      <div class="showcase-name">${ingot.name}</div>
      <div style="display:flex; gap:8px; justify-content:center; margin:12px 0;">
        <span style="background:${rarityColor}; color:#fff; padding:5px 14px; border-radius:40px; font-weight:700; font-size:12px;">${ingot.rarity}</span>
        <span style="background:${sourceColor}; color:#fff; padding:5px 14px; border-radius:40px; font-weight:700; font-size:12px;">${sourceName}</span>
      </div>
      <div class="showcase-description">${ingot.description}</div>
      <div class="showcase-count">В наличии: ${state.ingots[ingotId]} шт.</div>
    </div>
  `;
  
  showcaseContent.innerHTML = html;
  
  const imgEl = document.getElementById('showcaseImage');
  renderImageToElement(imgEl, ingot.imagePath, ingot.icon, ingot.fallbackColor);
  showcaseContent.style.opacity = '1';
  showcaseOverlay.classList.add('active');
}

// ---------- SHOWCASE (ОТКРЫТИЕ КАРТОЧКИ ИЗ КОЛЛЕКЦИИ) ----------
function openCollectionShowcase(ingotId) {
  const state = getPlayerState();
  const ingot = CONFIG_ITEMS[ingotId];
  if (!ingot) return;
  
  const discovered = state.minedStats[ingotId] > 0;
  const isCollectible = ingot.isCollectible;
  
  const rarityColors = {
    'common': '#A0A0A0',
    'rare': '#4A9CFF',
    'epic': '#B44AFF',
    'legendary': '#FFD700',
    'collectible': '#FF64FF'
  };
  
  const sourceNames = {
    'expedition': 'Экспедиционный',
    'crafted': 'Крафтовый',
    'meteor': 'Метеоритный',
    'special_meteor': 'Метеоритный',
    'alchemy': 'Алхимический'
  };
  
  const sourceColors = {
    'expedition': '#50C878',
    'crafted': '#FF8C00',
    'meteor': '#FF4444',
    'special_meteor': '#FF4444',
    'alchemy': '#FFD700'
  };

  const rarityColor = rarityColors[ingot.rarityLevel] || '#A0A0A0';
  const sourceColor = sourceColors[ingot.sourceType] || '#A0A0A0';
  const sourceName = sourceNames[ingot.sourceType] || ingot.sourceType;
  
  let html = '';

  if (!discovered && !ingot.isCollectible) {
    const locationName = CONFIG_EXPEDITIONS[ingot.location]?.name || 'неизвестной локации';
    html = `
      <div class="showcase-image" id="showcaseImage"></div>
      <div class="showcase-info">
        <div class="showcase-name">Неизвестный материал</div>
        <div class="showcase-rarity common">???</div>
        <div class="showcase-id"><span class="showcase-id-label">Статус</span><span class="showcase-id-value" style="color:var(--text-muted);">НЕ ИЗУЧЕН</span></div>
        <div class="showcase-description">Месторождение: ${locationName}</div>
        <div class="showcase-count">Ещё не найден</div>
      </div>
    `;
    showcaseContent.innerHTML = html;
    renderMysteryPlaceholder(document.getElementById('showcaseImage'));
    showcaseContent.style.opacity = '0.8';
    
  } else if (!discovered && isCollectible) {
    html = `
      <div class="showcase-image" id="showcaseImage"></div>
      <div class="showcase-info">
        <div class="showcase-name">Неизвестный Артефакт</div>
        <div class="showcase-rarity common">???</div>
        <div class="showcase-id"><span class="showcase-id-label">Статус</span><span class="showcase-id-value" style="color:var(--text-muted);">НЕ ОТКРЫТ</span></div>
        <div class="showcase-description">Глубины космоса хранят это сокровище.</div>
        <div class="showcase-count">Ещё не найден</div>
      </div>
    `;
    showcaseContent.innerHTML = html;
    renderMysteryPlaceholder(document.getElementById('showcaseImage'));
    showcaseContent.style.opacity = '0.8';
    
  } else if (isCollectible) {
    const effectText = ingot.effect_name ? `<div style="font-size:12px; color:#FFD700; margin-top:8px;">✨ Бонус: ${ingot.effect_name}</div>` : '';
    html = `
      <div class="showcase-image" id="showcaseImage"></div>
      <div class="showcase-info" style="border: 2px solid #FFD700; box-shadow: 0 0 40px rgba(255,215,0,0.6), 0 0 80px rgba(180,0,255,0.4); background: linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(180,0,255,0.1) 100%); animation: legendaryGlow 3s ease-in-out infinite;">
        <div class="showcase-name" style="font-size: 26px;">${ingot.name}</div>
        <div style="display:flex; gap:8px; justify-content:center; margin:12px 0;">
          <span style="background:${rarityColor}; color:#fff; padding:5px 14px; border-radius:40px; font-weight:700; font-size:12px;">${ingot.rarity}</span>
          <span style="background:${sourceColor}; color:#fff; padding:5px 14px; border-radius:40px; font-weight:700; font-size:12px;">${sourceName}</span>
        </div>
        <div style="font-size: 18px; font-weight: 800; color: #FFD700; margin: 16px 0; text-transform: uppercase; letter-spacing: 2px;">СТАТУС: ДОБЫТО В КОЛЛЕКЦИЮ СЛАВЫ</div>
        <div class="showcase-serial"><span class="showcase-serial-label">Серийный номер</span><span class="showcase-serial-value">#${getSerialForCollectible(ingotId)}</span></div>
        <div class="showcase-description">${ingot.description}</div>
        ${effectText}
        <div style="font-size: 12px; color: var(--accent-gold); margin-top: 12px;">Применение: [👑 Легендарный трофей]</div>
        <div class="showcase-count">В наличии: ${state.ingots[ingotId]} шт.</div>
      </div>
    `;
    showcaseContent.innerHTML = html;
    renderImageToElement(document.getElementById('showcaseImage'), ingot.imagePath, ingot.icon, ingot.fallbackColor);
    showcaseContent.style.opacity = '1';
    
    const styleEl = document.createElement('style');
    styleEl.textContent = '@keyframes legendaryGlow { 0%,100%{box-shadow:0 0 40px rgba(255,215,0,0.6),0 0 80px rgba(180,0,255,0.4);} 50%{box-shadow:0 0 60px rgba(255,215,0,0.9),0 0 120px rgba(180,0,255,0.7);} }';
    showcaseContent.appendChild(styleEl);
    
  } else {
    html = `
      <div class="showcase-image" id="showcaseImage"></div>
      <div class="showcase-info">
        <div class="showcase-name">${ingot.name}</div>
        <div style="display:flex; gap:8px; justify-content:center; margin:12px 0;">
          <span style="background:${rarityColor}; color:#fff; padding:5px 14px; border-radius:40px; font-weight:700; font-size:12px;">${ingot.rarity}</span>
          <span style="background:${sourceColor}; color:#fff; padding:5px 14px; border-radius:40px; font-weight:700; font-size:12px;">${sourceName}</span>
        </div>
        <div class="showcase-id"><span class="showcase-id-label">Добыто за всё время</span><span class="showcase-id-value">${state.minedStats[ingotId] || 0} ед.</span></div>
        <div class="showcase-description">${ingot.description}</div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">Применение: [⏳ В разработке для будущих ивентов]</div>
        <div style="font-size: 12px; color: var(--accent-gold); margin-top: 4px;">Опыт при продаже: +${ingot.sellValue} EXP</div>
        <div class="showcase-count">В наличии: ${state.ingots[ingotId]} шт.</div>
      </div>
    `;
    showcaseContent.innerHTML = html;
    renderImageToElement(document.getElementById('showcaseImage'), ingot.imagePath, ingot.icon, ingot.fallbackColor);
    showcaseContent.style.opacity = '1';
  }
  
  showcaseOverlay.classList.add('active');
}

export function closeShowcase() {
  showcaseOverlay.classList.remove('active');
}

// ---------- АДМИН-ПАНЕЛЬ ----------
function showAdminPanel() {
  const state = getPlayerState();
  const activeEventId = eventsManager.getActiveEventId();
  
  let html = `
    <div class="modal-header">
      <div class="modal-title">🛠️ Админ-панель</div>
      <button class="modal-close" onclick="document.dispatchEvent(new Event('closeModal'))">✕</button>
    </div>
    <div class="modal-content" style="text-align:left;">
      <div style="margin-bottom:12px; font-weight:600; color:var(--accent-gold);">⚡ Быстрые действия</div>
      <button class="btn" id="adminMaxXP" style="margin-bottom:6px;">🌟 Дать 1M XP</button>
      <button class="btn" id="adminUnlockAll" style="margin-bottom:6px;">🔓 Открыть все локации (ур.10)</button>
      <button class="btn" id="adminFillGeodes" style="margin-bottom:6px;">🪨 +10 всех жеод</button>
      <button class="btn" id="adminFillIngots" style="margin-bottom:6px;">✨ +10 всех обычных слитков</button>
      <button class="btn" id="adminFillArtifacts" style="margin-bottom:6px;">💎 +1 всех коллекционных артефактов</button>
      
      <div style="margin:20px 0; font-weight:600; color:var(--accent-gold);">🧹 Опасные действия</div>
      <button class="btn" id="adminResetProgress" style="margin-bottom:8px; background: linear-gradient(135deg, #FF4444, #CC0000); box-shadow: 0 4px 20px rgba(255,0,0,0.4);">💀 ПОЛНЫЙ СБРОС ПРОГРЕССА</button>
      
      <div style="margin:20px 0; font-weight:600; color:var(--accent-gold);">🌐 Глобальные ивенты</div>
      <div style="background: rgba(0,0,0,0.2); border-radius: 16px; padding: 12px; margin-bottom: 12px;">
        <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 4px;">Текущий ивент:</div>
        <div style="font-weight: 700; font-size: 16px; color: var(--accent-gold);">
          ${activeEventId ? (activeEventId === 'great_smelt' ? '🔥 Великая Переплавка' : '☄️ Метеоритный Шторм') : '❌ В данный момент нет активных событий'}
        </div>
        ${activeEventId ? `<div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Осталось: ${eventsManager.getTimeLeft()}</div>` : ''}
      </div>
      <button class="btn" id="adminStartSmelt" style="margin-bottom:8px;">🔥 Запустить Великую переплавку</button>
      <button class="btn" id="adminStartMeteor" style="margin-bottom:8px;">☄️ Запустить Метеоритный шторм</button>
      <button class="btn" id="adminEndEvent" style="margin-bottom:8px; background: linear-gradient(135deg, #FF4444, #CC0000); box-shadow: 0 4px 20px rgba(255,0,0,0.3);">⏹️ Завершить текущий ивент</button>
      <button class="btn" id="adminSpeedMode" style="margin-bottom:8px; background: linear-gradient(135deg, #FFD700, #FFA500); color: #000;">⚡ Ускорить ротацию (Тест)</button>
      
      <div style="margin:20px 0; font-weight:600; color:var(--accent-gold);">🔧 Отдельные жеоды (+5 шт.)</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
  `;
  
  Object.entries(CONFIG_GEODES).forEach(([id, g]) => {
    html += `<button class="small-btn admin-add-geode" data-geode="${id}" style="font-size:10px;">${g.stages[0].fallbackIcon} ${g.name}</button>`;
  });
  
  html += `
      </div>
      
      <div style="margin:20px 0; font-weight:600; color:var(--accent-gold);">✨ Отдельные слитки (+10 шт.)</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
  `;
  
  Object.entries(CONFIG_ITEMS).filter(([_, i]) => !i.isCollectible).forEach(([id, ing]) => {
    html += `<button class="small-btn admin-add-ingot" data-ingot="${id}" style="font-size:10px;">${ing.icon} ${ing.name}</button>`;
  });
  
  html += `
      </div>
    </div>
  `;
  
  openModal(html);
  
  setTimeout(() => {
    document.getElementById('adminMaxXP')?.addEventListener('click', () => { 
      devGiveXP(); 
      saveGame(); 
      showToast('+1M XP!', '🌟'); 
      closeModal(); 
    });
    
    document.getElementById('adminUnlockAll')?.addEventListener('click', () => { 
      devUnlockLocations(); 
      saveGame(); 
      showToast('Локации открыты (уровень 10)!', '🔓'); 
      closeModal(); 
    });
    
    document.getElementById('adminFillGeodes')?.addEventListener('click', () => { 
      devGiveGeodes(); 
      saveGame(); 
      showToast('+10 жеод всех типов!', '🪨'); 
      closeModal(); 
    });
    
    document.getElementById('adminFillIngots')?.addEventListener('click', () => {
      const state = getPlayerState();
      Object.keys(CONFIG_ITEMS).forEach(id => {
        if (!CONFIG_ITEMS[id].isCollectible) {
          state.ingots[id] = (state.ingots[id] || 0) + 10;
          state.minedStats[id] = (state.minedStats[id] || 0) + 10;
        }
      });
      state.player.totalIngots += Object.keys(CONFIG_ITEMS).filter(id => !CONFIG_ITEMS[id].isCollectible).length * 10;
      saveGame(); 
      showToast('+10 слитков каждого типа!', '✨'); 
      closeModal(); 
    });
    
    document.getElementById('adminFillArtifacts')?.addEventListener('click', () => {
      const state = getPlayerState();
      Object.keys(CONFIG_ITEMS).forEach(id => {
        if (CONFIG_ITEMS[id].isCollectible && CONFIG_ITEMS[id].location !== 'craft') {
          state.ingots[id] = (state.ingots[id] || 0) + 1;
          state.minedStats[id] = (state.minedStats[id] || 0) + 1;
        }
      });
      state.player.totalArtifacts += 8;
      saveGame(); 
      showToast('+1 артефакт каждого типа!', '💎'); 
      closeModal(); 
    });
    
    // 🆕 ПОЛНЫЙ СБРОС ПРОГРЕССА
    document.getElementById('adminResetProgress')?.addEventListener('click', () => {
      const state = getPlayerState();
      
      // Сброс уровня и опыта игрока
      state.player.level = 1;
      state.player.xp = 0;
      state.player.totalOpened = 0;
      state.player.totalIngots = 0;
      state.player.totalArtifacts = 0;
      
      // Сброс экспедиций
      for (let k in state.expeditions) {
        state.expeditions[k].active = false;
        state.expeditions[k].endTime = null;
        state.expeditions[k].scanUsed = false;
        state.expeditions[k].specialChanceBoost = null;
      }
      
      // Сброс жеод до стартовых
      Object.keys(state.geodes).forEach(k => { state.geodes[k] = 0; });
      state.geodes['mine'] = 2;
      state.geodes['jungle'] = 1;
      
      // Полный сброс слитков и статистики
      Object.keys(state.ingots).forEach(k => { state.ingots[k] = 0; });
      Object.keys(state.minedStats).forEach(k => { state.minedStats[k] = 0; });
      
      // Сброс особых жеод и артефактов
      Object.keys(state.discoveredSpecialGeodes).forEach(k => { state.discoveredSpecialGeodes[k] = false; });
      state.collectedArtifacts.mine = [];
      state.collectedArtifacts.jungle = [];
      state.collectedArtifacts.asteroid = [];
      state.collectedArtifacts.meteor = [];
      
      // Сброс эхо-кулдаунов и бонусов экспедиций
      state.echoCooldowns = {};
      state.expeditionBonuses = {};
      
      // Сброс метеоритных осколков
      state.meteorShards = 0;
      state.meteorCooldownEnd = null;
      
      // Сброс квестов
      state.activeQuests = [];
      state.questRefreshTime = null;
      state.completedQuests = [];
      state.questCooldownEnd = null;
      
      // Сброс разблокированных экспедиций до стартовых
      state.unlockedExpeditions = ['mine'];
      
      // Сброс слотов экипировки
      state.equippedArtifacts = [null, null, null];
      
      // Сброс открытий алхимии
      state.discoveredAlchemyRecipes = [];
      
      // Сброс флага туториала
      import('./tutorial.js').then(t => {
        t.resetTutorialFlag();
      });
      
      // ★ ИСПРАВЛЕНИЕ: сначала сбрасываем ingotState, потом сохраняем
      import('./ingot.js').then(ingot => {
        ingot.resetIngotState();
        
        // Полная очистка localStorage и сохранение ПОСЛЕ сброса ingotState
        localStorage.removeItem('starforge_v1');
        saveGame();
        
        showToast('💀 Прогресс полностью сброшен!', '🗑️');
        closeModal();
        
        // Перезагрузка страницы для чистой инициализации
        setTimeout(() => {
          location.reload();
        }, 500);
      });
    });
    
    document.getElementById('adminStartSmelt')?.addEventListener('click', () => {
      eventsManager.startEventById('great_smelt');
      saveGame();
      showToast('Переплавка запущена!', '🔥');
      closeModal();
    });
    
    document.getElementById('adminStartMeteor')?.addEventListener('click', () => {
      eventsManager.startEventById('meteor_storm');
      saveGame();
      showToast('Метеоритный шторм запущен!', '☄️');
      closeModal();
    });
    
    document.getElementById('adminEndEvent')?.addEventListener('click', () => {
      eventsManager.forceEndEvent();
      saveGame();
      closeModal();
    });
    
    document.getElementById('adminSpeedMode')?.addEventListener('click', () => {
      toggleSpeedMode();
      closeModal();
    });
    
    document.querySelectorAll('.admin-add-geode').forEach(btn => {
      btn.addEventListener('click', () => {
        const state = getPlayerState();
        const id = btn.dataset.geode;
        state.geodes[id] = (state.geodes[id] || 0) + 5;
        saveGame();
        showToast(`+5 ${CONFIG_GEODES[id].name}`, '🪨');
        closeModal();
      });
    });
    
    document.querySelectorAll('.admin-add-ingot').forEach(btn => {
      btn.addEventListener('click', () => {
        const state = getPlayerState();
        const id = btn.dataset.ingot;
        state.ingots[id] = (state.ingots[id] || 0) + 10;
        state.minedStats[id] = (state.minedStats[id] || 0) + 10;
        state.player.totalIngots += 10;
        saveGame();
        showToast(`+10 ${CONFIG_ITEMS[id].name}`, '✨');
        closeModal();
      });
    });
  }, 50);
}

// ---------- МОДАЛЬНЫЕ ОКНА ----------
export function openModal(html) {
  if (modalTimerInterval) {
    clearInterval(modalTimerInterval);
    modalTimerInterval = null;
  }
  
  modalContent.innerHTML = html;
  modalOverlay.classList.add('active');
  
  modalOverlay.onclick = (e) => {
    if (e.target === modalOverlay) closeModal();
  };
}

export function closeModal() {
  if (modalTimerInterval) {
    clearInterval(modalTimerInterval);
    modalTimerInterval = null;
  }
  
  modalOverlay.classList.remove('active');
  modalContent.innerHTML = '';
}

export function showGeodeModal(geodeId) {
  const state = getPlayerState();
  const g = CONFIG_GEODES[geodeId];
  if (!g) return;
  
  let lootHtml = '';
  if (g.isSpecial) {
    lootHtml = `<div style="text-align:center; padding:20px; color:var(--accent-gold);">✨ Гарантированно содержит один из коллекционных артефактов локации ✨</div>`;
  } else {
    g.lootTable.forEach((e) => {
      const ing = CONFIG_ITEMS[e.ingotId];
      lootHtml += `
        <div class="loot-row">
          <div class="loot-left">
            <div class="loot-icon" id="loot-${e.ingotId}"></div>
            <span>${ing.name}</span>
          </div>
          <div class="loot-chance">${Math.round(e.chance * 100)}%</div>
        </div>
      `;
    });
  }

  let openButtonText = '🔓 РАСКОЛОТЬ ЖЕОДУ';
  
  if (g.isSpecial) {
    const loc = g.location;
    const completed = isLocationCompleted(loc);
    if (completed) {
      openButtonText = '📚 ИЗУЧИТЬ (Обменять на XP)';
    }
  }

  let html = `
    <div class="modal-header">
      <div class="modal-title">${g.name}</div>
      <button class="modal-close" onclick="document.dispatchEvent(new Event('closeModal'))">✕</button>
    </div>
    <div class="modal-content">
      <div class="modal-icon-large" id="modalGeodeImage"></div>
      <div class="modal-description">${g.description}</div>
      <div class="loot-table">
        <div style="margin-bottom:16px; font-weight:700;">${g.isSpecial ? 'Особая находка' : 'Возможная добыча'}</div>
        ${lootHtml}
      </div>
      <div style="margin:20px 0; color:var(--text-secondary);">В инвентаре: ${state.geodes[geodeId] || 0} шт.</div>
      <button class="btn" id="modalOpenGeodeBtn" data-geode="${geodeId}" data-special="${g.isSpecial}">${openButtonText}</button>
    </div>
  `;
  
  openModal(html);
  
  setTimeout(() => {
    renderImageToElement(document.getElementById('modalGeodeImage'), g.stages[0].imagePath, g.stages[0].fallbackIcon, '#8B7355');
    
    if (!g.isSpecial) {
      g.lootTable.forEach((e) => {
        const el = document.getElementById(`loot-${e.ingotId}`);
        if (el) {
          const ing = CONFIG_ITEMS[e.ingotId];
          renderImageToElement(el, ing.imagePath, ing.icon, ing.fallbackColor);
        }
      });
    }
    
    document.getElementById('modalOpenGeodeBtn').addEventListener('click', function () {
      closeModal();
      const isSpecial = this.dataset.special === 'true';
      const geodeId = this.dataset.geode;
      
      if (isSpecial) {
        const g = CONFIG_GEODES[geodeId];
        const completed = isLocationCompleted(g.location);
        if (completed) {
          exchangeSpecialGeodeForXP(geodeId);
        } else {
          openBrawlOverlay(geodeId, true);
        }
      } else {
        openBrawlOverlay(geodeId, false);
      }
    });
  }, 10);
}

function updateModalExpeditionTimer(expId) {
  const state = getPlayerState();
  const timerEl = document.getElementById('modalExpeditionTimer');
  const actionBtnEl = document.getElementById('modalExpeditionAction');
  if (!timerEl || !actionBtnEl) return;

  const exp = state.expeditions[expId];
  if (!exp || !exp.active || !exp.endTime) {
    actionBtnEl.innerHTML = `<button class="btn" id="modalStartExpedition" data-expedition="${expId}">⛏️ ОТПРАВИТЬСЯ</button>`;
    document.getElementById('modalStartExpedition')?.addEventListener('click', function () {
      startExpedition(this.dataset.expedition);
      closeModal();
    });
    return;
  }

  const now = Date.now();
  const diff = Math.max(0, exp.endTime - now);
  
  if (diff <= 0) {
    actionBtnEl.innerHTML = `<button class="btn" id="modalStartExpedition" data-expedition="${expId}">⛏️ ОТПРАВИТЬСЯ</button>`;
    document.getElementById('modalStartExpedition')?.addEventListener('click', function () {
      startExpedition(this.dataset.expedition);
      closeModal();
    });
    return;
  }

  const m = Math.floor(diff / 60000);
  const s = Math.ceil((diff % 60000) / 1000);
  timerEl.textContent = `⏳ Идёт: ${m}:${s.toString().padStart(2, '0')}`;
}

function showScoutChoiceModal(expId) {
  const html = `
    <div class="modal-header">
      <div class="modal-title">📡 Выберите разведку</div>
      <button class="modal-close" onclick="document.dispatchEvent(new Event('closeModal'))">✕</button>
    </div>
    <div class="modal-content">
      <div class="modal-description">Выберите один бонус для текущей экспедиции:</div>
      <button class="btn" id="chooseEcho-${expId}" style="margin-bottom:12px;">📡 Эхо-локатор (-15% времени)</button>
      <button class="btn" id="chooseScan-${expId}">🔬 Глубинное сканирование (+20% шанс Особой)</button>
    </div>
  `;
  
  openModal(html);
  
  document.getElementById(`chooseEcho-${expId}`)?.addEventListener('click', () => {
    closeModal();
    startSignalGame(expId, 'echo');
  });
  
  document.getElementById(`chooseScan-${expId}`)?.addEventListener('click', () => {
    closeModal();
    startSignalGame(expId, 'scan');
  });
}

export function showExpeditionInfoModal(expId) {
  const state = getPlayerState();
  const exp = CONFIG_EXPEDITIONS[expId];
  if (!exp) return;
  
  if (state.player.level < exp.requiredLevel) {
    showToast(`Требуется ${exp.requiredLevel} уровень!`, '🔒');
    return;
  }
  
  const act = state.expeditions[expId];
  const isActive = act && act.active;
  const completed = isLocationCompleted(expId);
  const special = CONFIG_GEODES[exp.specialGeodeId];
  const discovered = state.discoveredSpecialGeodes[expId];

  let specialText = '';
  if (completed) {
    specialText = '✅ Все артефакты собраны';
  } else if (discovered) {
    specialText = `Особая находка: ${special.name} (${Math.round(exp.specialGeodeChance * 100)}%)`;
  } else {
    specialText = `Особая находка: ??? (${Math.round(exp.specialGeodeChance * 100)}%)`;
  }

  let timerHtml = '';
  if (isActive && act.endTime) {
    const diff = Math.max(0, act.endTime - Date.now());
    const m = Math.floor(diff / 60000);
    const s = Math.ceil((diff % 60000) / 1000);
    timerHtml = `<div class="timer-badge" id="modalExpeditionTimer">⏳ Идёт: ${m}:${s.toString().padStart(2, '0')}</div>`;
  } else {
    timerHtml = `<div id="modalExpeditionTimer"></div>`;
  }

  let scoutButton = '';
  if (expId !== 'mine' && isActive) {
    const bonusUsed = state.expeditionBonuses && state.expeditionBonuses[expId] !== undefined;
    const echoCooldown = state.echoCooldowns?.[expId] || 0;
    const now = Date.now();
    const onCooldown = echoCooldown > now && !bonusUsed;
    const cooldownRemaining = onCooldown ? Math.ceil((echoCooldown - now) / 1000) : 0;
    
    scoutButton = `
      <div style="margin-top:16px;">
        <button class="btn" id="scoutBtn-${expId}" ${bonusUsed || onCooldown ? 'disabled' : ''}>
          ${bonusUsed ? '✅ Разведка проведена' : (onCooldown ? `⏳ Перезарядка ${cooldownRemaining}с` : '📡 РАЗВЕДКА')}
        </button>
      </div>
    `;
  }

  let actionBtn = '';
  if (isActive) {
    actionBtn = `<div id="modalExpeditionAction">${timerHtml}${scoutButton}</div>`;
  } else {
    actionBtn = `<div id="modalExpeditionAction"><button class="btn" id="modalStartExpedition" data-expedition="${expId}">⛏️ ОТПРАВИТЬСЯ</button></div>`;
  }

  let html = `
    <div class="modal-header">
      <div class="modal-title">${exp.name}</div>
      <button class="modal-close" onclick="document.dispatchEvent(new Event('closeModal'))">✕</button>
    </div>
    <div class="modal-content">
      <div class="modal-icon-large" id="modalExpeditionImage"></div>
      <div class="modal-description">${exp.description || 'Опасная, но прибыльная локация.'}</div>
      <div style="background:rgba(0,0,0,0.2); border-radius:24px; padding:18px; margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between;">
          <span>⏱️ Время</span>
          <span style="color:var(--accent-gold);">${exp.timer} сек</span>
        </div>
        <div style="margin-top:12px; color:${completed ? '#50C878' : 'var(--accent-gold)'};">${specialText}</div>
      </div>
      ${actionBtn}
    </div>
  `;
  
  openModal(html);
  
  if (isActive) {
    modalTimerInterval = setInterval(() => {
      updateModalExpeditionTimer(expId);
    }, 500);
  }
  
  setTimeout(() => {
    renderImageToElement(document.getElementById('modalExpeditionImage'), exp.imagePath, exp.fallbackIcon, '#FFD700');
    
    const startBtn = document.getElementById('modalStartExpedition');
    if (startBtn) {
      startBtn.addEventListener('click', function () {
        startExpedition(this.dataset.expedition);
        closeModal();
      });
    }
    
    const scoutBtn = document.getElementById(`scoutBtn-${expId}`);
    if (scoutBtn) {
      scoutBtn.addEventListener('click', () => {
        showScoutChoiceModal(expId);
      });
    }
  }, 10);
}

// ---------- ОБНОВЛЕНИЕ UI ----------
export function updateProfileUI() {
  if (currentTab !== 'profile') return;
  const state = getPlayerState();
  
  const levelEl = document.getElementById('profileLevel');
  if (levelEl) levelEl.textContent = state.player.level;
  
  const xpFillEl = document.getElementById('xpFill');
  const xpTextEl = document.getElementById('xpText');
  if (xpFillEl && xpTextEl) {
    const currentXP = state.player.xp;
    const nextLevelXP = LEVELS[state.player.level] || LEVELS[LEVELS.length - 1];
    const prevLevelXP = LEVELS[state.player.level - 1] || 0;
    const progress = ((currentXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;
    xpFillEl.style.width = `${Math.min(progress, 100)}%`;
    xpTextEl.textContent = `${currentXP} / ${nextLevelXP} XP`;
  }
  
  const statusEl = document.getElementById('profileStatus');
  if (statusEl) statusEl.textContent = STATUSES[Math.min(state.player.level - 1, STATUSES.length - 1)];
  
  const totalOpenedEl = document.getElementById('statOpened');
  if (totalOpenedEl) totalOpenedEl.textContent = state.player.totalOpened;
  
  const totalIngotsEl = document.getElementById('statIngots');
  if (totalIngotsEl) totalIngotsEl.textContent = state.player.totalIngots;
  
  const totalArtifactsEl = document.getElementById('statArtifacts');
  if (totalArtifactsEl) totalArtifactsEl.textContent = state.player.totalArtifacts;
}

export function updateCollectionProgress() {
  if (currentTab !== 'collection') return;
  const state = getPlayerState();
  
  const totalRegular = Object.values(CONFIG_ITEMS).filter((i) => !i.isCollectible).length;
  const discovered = Object.values(CONFIG_ITEMS).filter((i) => !i.isCollectible && state.minedStats[i.id] > 0).length;
  const percent = (discovered / totalRegular) * 100;
  
  const fillEl = document.getElementById('collectionProgressFill');
  const textEl = document.getElementById('collectionProgressText');
  if (fillEl) fillEl.style.width = `${percent}%`;
  if (textEl) textEl.textContent = `${discovered}/${totalRegular} открыто`;
}

export function updateMeteorShardsDisplay() {
  const state = getPlayerState();
  const display = document.getElementById('meteorShardsDisplay');
  if (display) {
    display.textContent = `Осколки метеоритов: ${state.meteorShards || 0}`;
  }
}

// ========== РЕНДЕРИНГ ВКЛАДКИ ЭКСПЕДИЦИЙ (С АККОРДЕОНОМ) ==========
export function renderExpeditionsTab() {
  const state = getPlayerState();
  let html = '<div class="section-title">⛏️ Экспедиции <button class="help-btn" data-help="expeditions">?</button></div>';
  
  html += `
    <style>
      .expedition-group {
        background: var(--card-bg);
        backdrop-filter: blur(20px);
        border-radius: 28px;
        margin-bottom: 16px;
        border: 1px solid var(--card-border);
        box-shadow: 0 8px 32px var(--shadow-color);
        overflow: hidden;
        transition: background 0.3s ease, border 0.3s ease;
      }
      .expedition-group-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 18px 18px;
        cursor: pointer;
        user-select: none;
        transition: background 0.2s;
      }
      .expedition-group-header:active {
        background: rgba(255,255,255,0.03);
      }
      .expedition-group-icon {
        font-size: 24px;
        min-width: 30px;
        text-align: center;
      }
      .expedition-group-name {
        font-family: 'Unbounded', sans-serif;
        font-size: 16px;
        font-weight: 700;
        color: var(--text-primary);
        flex: 1;
      }
      .expedition-group-arrow {
        font-size: 14px;
        color: var(--text-secondary);
        transition: transform 0.3s ease;
        min-width: 20px;
        text-align: center;
      }
      .expedition-group-arrow.open {
        transform: rotate(180deg);
      }
      .expedition-group-body {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.4s cubic-bezier(0.25, 0.8, 0.25, 1.2);
      }
      .expedition-group-body.open {
        max-height: 2000px;
      }
      .expedition-group-body-inner {
        padding: 0 18px 18px;
      }
      
      .expedition-card-locked {
        background: rgba(255,255,255,0.02);
        border: 2px dashed rgba(255,255,255,0.08);
        border-radius: 20px;
        padding: 18px;
        margin-bottom: 10px;
        text-align: center;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      .expedition-card-locked.unlocking {
        animation: unlockGlow 0.8s ease-out;
        border-color: rgba(255,215,0,0.6);
        background: rgba(255,215,0,0.05);
      }
      @keyframes unlockGlow {
        0% { box-shadow: 0 0 0 rgba(255,215,0,0); border-color: rgba(255,255,255,0.08); }
        30% { box-shadow: 0 0 60px rgba(255,215,0,0.8); border-color: rgba(255,215,0,1); }
        100% { box-shadow: 0 0 0 rgba(255,215,0,0); border-color: rgba(255,215,0,0.3); }
      }
      .expedition-card-locked-icon {
        font-size: 40px;
        margin-bottom: 8px;
        opacity: 0.5;
      }
      .expedition-card-locked-name {
        font-family: 'Unbounded', sans-serif;
        font-size: 14px;
        font-weight: 700;
        color: var(--text-secondary);
        margin-bottom: 4px;
      }
      .expedition-card-locked-desc {
        font-size: 11px;
        color: var(--text-muted);
        margin-bottom: 12px;
      }
      .expedition-unlock-btn {
        background: linear-gradient(135deg, #FFD700, #FF8C00);
        color: #000;
        border: none;
        padding: 10px 24px;
        border-radius: 50px;
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(255,140,0,0.3);
        transition: all 0.2s;
        font-family: 'Montserrat', sans-serif;
      }
      .expedition-unlock-btn:active { transform: scale(0.94); }
      .expedition-unlock-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        box-shadow: none;
      }
    </style>
  `;
  
  if (!state.unlockedExpeditions) state.unlockedExpeditions = ['mine'];
  
  EXPEDITION_GROUPS.forEach((group, groupIndex) => {
    const isOpen = expandedGroups[group.id] !== undefined ? expandedGroups[group.id] : true;
    
    html += `<div class="expedition-group">`;
    html += `
      <div class="expedition-group-header" data-group-id="${group.id}">
        <span class="expedition-group-icon">${group.icon}</span>
        <span class="expedition-group-name">${group.name}</span>
        <span class="expedition-group-arrow ${isOpen ? 'open' : ''}">▼</span>
      </div>
    `;
    html += `<div class="expedition-group-body ${isOpen ? 'open' : ''}" data-group-body="${group.id}">`;
    html += `<div class="expedition-group-body-inner">`;
    
    group.expeditions.forEach((exp) => {
      const isUnlocked = state.unlockedExpeditions.includes(exp.id);
      const act = state.expeditions[exp.id] || { active: false };
      
      if (!isUnlocked) {
        const canUnlock = state.player.level >= exp.unlockLevel;
        html += `
          <div class="expedition-card-locked" id="locked-${exp.id}">
            <div class="expedition-card-locked-icon">🔒</div>
            <div class="expedition-card-locked-name">${exp.name}</div>
            <div class="expedition-card-locked-desc">${exp.description}</div>
            <button class="expedition-unlock-btn" id="unlockBtn-${exp.id}" ${canUnlock ? '' : 'disabled'}>
              ${canUnlock ? '🔓 Открыть' : `🔒 Нужен ур. ${exp.unlockLevel}`}
            </button>
          </div>
        `;
      } else {
        const isLockedByLevel = state.player.level < exp.requiredLevel;
        let timerHtml = '';
        
        if (isLockedByLevel) {
          timerHtml = `<span class="lock-icon">🔒</span> <span style="color:var(--text-muted);">Ур. ${exp.requiredLevel}</span>`;
        } else if (act.active && act.endTime) {
          const diff = Math.max(0, act.endTime - Date.now());
          const m = Math.floor(diff / 60000);
          const s = Math.ceil((diff % 60000) / 1000);
          timerHtml = `<div class="timer-badge" id="timer-${exp.id}">⏳ ${m}:${s.toString().padStart(2, '0')}</div>`;
        } else {
          timerHtml = `<button class="small-btn" data-info-exp="${exp.id}">Подробнее</button>`;
        }
        
        html += `
          <div class="card" style="margin-bottom:10px;">
            <div class="expedition-item ${isLockedByLevel ? 'locked' : ''}" data-expedition-click="${exp.id}">
              <div class="expedition-info">
                <div class="expedition-icon" id="expedition-icon-${exp.id}"></div>
                <div class="expedition-text">
                  <h3>${exp.name} ${isLockedByLevel ? '🔒' : ''}</h3>
                  <p>⏱️ ${exp.timer} сек</p>
                </div>
              </div>
              <div class="expedition-action">${timerHtml}</div>
            </div>
          </div>
        `;
      }
    });
    
    html += `</div></div></div>`;
  });
  
  mainContent.innerHTML = html;
  
  EXPEDITION_GROUPS.forEach(group => {
    group.expeditions.forEach(exp => {
      const el = document.getElementById(`expedition-icon-${exp.id}`);
      if (el) {
        renderImageToElement(el, exp.imagePath, exp.fallbackIcon, '#FFD700');
      }
    });
  });
  
  document.querySelectorAll('.expedition-group-header').forEach(header => {
    header.addEventListener('click', () => {
      const groupId = header.dataset.groupId;
      const body = document.querySelector(`[data-group-body="${groupId}"]`);
      const arrow = header.querySelector('.expedition-group-arrow');
      
      if (body) {
        const isOpen = body.classList.contains('open');
        if (isOpen) {
          body.classList.remove('open');
          if (arrow) arrow.classList.remove('open');
          expandedGroups[groupId] = false;
        } else {
          body.classList.add('open');
          if (arrow) arrow.classList.add('open');
          expandedGroups[groupId] = true;
        }
      }
    });
  });
  
  document.querySelectorAll('[data-expedition-click]').forEach(el => {
    el.addEventListener('click', function (e) {
      const key = this.dataset.expeditionClick;
      const exp = CONFIG_EXPEDITIONS[key];
      if (!exp) return;
      if (state.player.level < exp.requiredLevel) {
        showToast(`Требуется ${exp.requiredLevel} уровень!`, '🔒');
        return;
      }
      if (!e.target.classList.contains('small-btn')) showExpeditionInfoModal(key);
    });
  });
  
  document.querySelectorAll('[data-info-exp]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showExpeditionInfoModal(btn.dataset.infoExp);
    });
  });
  
  EXPEDITION_GROUPS.forEach(group => {
    group.expeditions.forEach(exp => {
      if (!state.unlockedExpeditions.includes(exp.id)) {
        const unlockBtn = document.getElementById(`unlockBtn-${exp.id}`);
        if (unlockBtn) {
          unlockBtn.addEventListener('click', () => {
            const currentLevel = state.player.level;
            if (currentLevel >= exp.unlockLevel) {
              unlockExpedition(exp.id);
            }
          });
        }
      }
    });
  });
}

// ========== РАЗБЛОКИРОВКА ЭКСПЕДИЦИИ С АНИМАЦИЕЙ ==========
function unlockExpedition(expId) {
  const state = getPlayerState();
  if (!state.unlockedExpeditions) state.unlockedExpeditions = ['mine'];
  
  if (state.unlockedExpeditions.includes(expId)) return;
  
  const exp = CONFIG_EXPEDITIONS[expId];
  if (!exp) return;
  
  if (state.player.level < exp.unlockLevel) {
    showToast(`Нужен ${exp.unlockLevel} уровень!`, '🔒');
    return;
  }
  
  const lockedCard = document.getElementById(`locked-${expId}`);
  if (lockedCard) {
    lockedCard.classList.add('unlocking');
    
    const app = document.getElementById('app');
    const cardRect = lockedCard.getBoundingClientRect();
    const appRect = app.getBoundingClientRect();
    const centerX = cardRect.left + cardRect.width / 2;
    const centerY = cardRect.top + cardRect.height / 2;
    
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: fixed;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #FFD700;
        pointer-events: none;
        z-index: 9999;
        left: ${centerX}px;
        top: ${centerY}px;
        box-shadow: 0 0 10px #FFD700;
        animation: unlockParticle 0.8s ease-out forwards;
        animation-delay: ${i * 0.02}s;
      `;
      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 100;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      particle.style.setProperty('--tx', tx + 'px');
      particle.style.setProperty('--ty', ty + 'px');
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 900);
    }
    
    if (!document.getElementById('unlockParticleStyle')) {
      const particleStyle = document.createElement('style');
      particleStyle.id = 'unlockParticleStyle';
      particleStyle.textContent = `
        @keyframes unlockParticle {
          0% { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0); }
        }
      `;
      document.head.appendChild(particleStyle);
    }
    
    setTimeout(() => {
      state.unlockedExpeditions.push(expId);
      saveGame();
      showToast(`🔓 ${exp.name} открыты!`, '🎉');
      renderExpeditionsTab();
    }, 600);
  }
}

// ========== РЕНДЕРИНГ ВКЛАДКИ ИНВЕНТАРЯ (С АЛХИМИЕЙ) ==========
export function renderInventoryTab() {
  const state = getPlayerState();
  let html = `
    <div class="section-title">🎒 Инвентарь <button class="help-btn" data-help="inventory">?</button></div>
    <div class="inventory-subtabs">
      <button class="subtab-btn ${inventorySubTab === 'geodes' ? 'active' : ''}" data-subtab="geodes">🪨 Жеоды</button>
      <button class="subtab-btn ${inventorySubTab === 'ingots' ? 'active' : ''}" data-subtab="ingots">✨ Слитки</button>
    </div>
  `;
  
  if (inventorySubTab === 'geodes') {
    const items = Object.entries(state.geodes).filter(([_, c]) => c > 0);
    if (!items.length) {
      html += '<div class="empty-state">Нет жеод. Отправьте экспедицию.</div>';
    } else {
      html += '<div class="grid-container">';
      items.forEach(([k, c]) => {
        const g = CONFIG_GEODES[k];
        html += `
          <div class="collection-card" data-geode="${k}">
            <div class="card-icon" id="inv-geode-${k}"></div>
            <div class="card-name">${g.name}</div>
            <div class="card-count-badge">${c} шт.</div>
          </div>
        `;
      });
      html += '</div>';
    }
    
    mainContent.innerHTML = html;
    
    for (let k in CONFIG_GEODES) {
      const el = document.getElementById(`inv-geode-${k}`);
      if (el && state.geodes[k] > 0) {
        renderImageToElement(el, CONFIG_GEODES[k].stages[0].imagePath, CONFIG_GEODES[k].stages[0].fallbackIcon, '#8B7355');
      }
    }
  } else {
    // Вкладка слитков
    const items = Object.entries(state.ingots).filter(([k, c]) => c > 0 && !CONFIG_ITEMS[k].isCollectible);
    
    // Кнопка Алхимии — всегда видна, disabled до 3 уровня
    const alchemyAvailable = state.player.level >= 3;
    const alchemyBtnText = !alchemyAvailable ? '🔒 Сплавить (ур. 3)' : (alchemyMode ? '❌ Отмена' : '⚗️ Сплавить');
    const alchemyBtnStyle = alchemyMode ? 'background: rgba(255,68,68,0.15); border-color: rgba(255,68,68,0.4); color: #FF4444;' : '';
    
    html += `
      <div style="margin-bottom:14px;">
        <button class="small-btn" id="toggleAlchemyBtn" style="width:100%; ${alchemyBtnStyle}" ${!alchemyAvailable ? 'disabled' : ''}>
          ${alchemyBtnText}
        </button>
        ${alchemyMode ? '<div style="text-align:center; font-size:10px; color:var(--accent-gold); margin-top:6px;">Выберите первый слиток для сплава</div>' : ''}
        ${alchemyMode && alchemyFirstIngot ? `<div style="text-align:center; font-size:10px; color:var(--text-secondary); margin-top:2px;">Выбран: ${CONFIG_ITEMS[alchemyFirstIngot]?.icon} ${CONFIG_ITEMS[alchemyFirstIngot]?.name}. Выберите второй слиток.</div>` : ''}
      </div>
    `;
    
    if (!items.length) {
      html += '<div class="empty-state">Нет слитков. Откройте жеоды.</div>';
    } else {
      html += '<div class="grid-container">';
      items.forEach(([k, c]) => {
        const ing = CONFIG_ITEMS[k];
        
        // Определяем, совместим ли слиток с выбранным
        let isCompatible = true;
        let cardClass = 'collection-card';
        
        if (alchemyMode) {
          if (!alchemyFirstIngot) {
            // Режим выбора первого слитка — все доступны
            cardClass += ' alchemy-selectable';
          } else if (k === alchemyFirstIngot) {
            // Это выбранный слиток — подсвечен
            cardClass += ' alchemy-selected';
          } else {
            // Проверяем совместимость
            const ing1 = CONFIG_ITEMS[alchemyFirstIngot];
            const ing2 = ing;
            
            // Ищем рецепт
            let foundRecipe = false;
            for (let recipeId in ALCHEMY_RECIPES) {
              const recipe = ALCHEMY_RECIPES[recipeId];
              if (recipe.ingredients.includes(alchemyFirstIngot) && recipe.ingredients.includes(k)) {
                foundRecipe = true;
                break;
              }
            }
            
            if (!foundRecipe) {
              isCompatible = false;
              cardClass += ' alchemy-incompatible';
            } else {
              cardClass += ' alchemy-compatible';
            }
          }
        }
        
        html += `
          <div class="${cardClass}" data-ingot="${k}" data-compatible="${isCompatible}">
            <div class="card-icon" id="inv-ingot-${k}"></div>
            <div class="card-name">${ing.name}</div>
            <div class="card-count-badge">${c} шт.</div>
          </div>
        `;
      });
      html += '</div>';
    }
    
    mainContent.innerHTML = html;
    
    for (let k in CONFIG_ITEMS) {
      if (CONFIG_ITEMS[k].isCollectible) continue;
      const el = document.getElementById(`inv-ingot-${k}`);
      if (el && state.ingots[k] > 0) {
        renderImageToElement(el, CONFIG_ITEMS[k].imagePath, CONFIG_ITEMS[k].icon, CONFIG_ITEMS[k].fallbackColor);
      }
    }
    
    // Обработчик кнопки Алхимии
    const alchemyBtn = document.getElementById('toggleAlchemyBtn');
    if (alchemyBtn && alchemyAvailable) {
      alchemyBtn.addEventListener('click', () => {
        if (alchemyMode) {
          // Выход из режима
          alchemyMode = false;
          alchemyFirstIngot = null;
        } else {
          // Вход в режим
          alchemyMode = true;
          alchemyFirstIngot = null;
        }
        renderInventoryTab();
      });
    }
    
    // Обработчики кликов по слиткам в режиме алхимии
    if (alchemyMode) {
      document.querySelectorAll('[data-ingot]').forEach(card => {
        card.addEventListener('click', () => {
          const ingotId = card.dataset.ingot;
          const isCompatible = card.dataset.compatible === 'true';
          
          if (!alchemyFirstIngot) {
            // Выбор первого слитка
            alchemyFirstIngot = ingotId;
            renderInventoryTab();
          } else if (ingotId === alchemyFirstIngot) {
            // Отмена выбора
            alchemyFirstIngot = null;
            renderInventoryTab();
          } else if (isCompatible) {
            // Открываем модалку подтверждения
            showAlchemyConfirmModal(alchemyFirstIngot, ingotId);
          } else {
            // Несовместимый слиток
            showToast('Сплав невозможен: слитки из разных локаций!', '⚠️');
          }
        });
      });
    } else {
      // Обычный режим — показ showcase
      document.querySelectorAll('[data-ingot]').forEach(card => {
        card.addEventListener('click', () => {
          openInventoryShowcase(card.dataset.ingot);
        });
      });
    }
  }

  document.querySelectorAll('[data-subtab]').forEach((b) =>
    b.addEventListener('click', () => {
      inventorySubTab = b.dataset.subtab;
      alchemyMode = false;
      alchemyFirstIngot = null;
      renderInventoryTab();
    })
  );
  
  document.querySelectorAll('[data-geode]').forEach((c) => c.addEventListener('click', () => showGeodeModal(c.dataset.geode)));
}

// ========== ★ ПРЕМИАЛЬНАЯ МОДАЛКА АЛХИМИИ (БЕЗ ТЕКСТА, ТОЛЬКО ВИЗУАЛ) ★ ==========
function showAlchemyConfirmModal(ingotId1, ingotId2) {
  const state = getPlayerState();
  
  // Ищем рецепт
  let matchedRecipe = null;
  for (let recipeId in ALCHEMY_RECIPES) {
    const recipe = ALCHEMY_RECIPES[recipeId];
    if (recipe.ingredients.includes(ingotId1) && recipe.ingredients.includes(ingotId2)) {
      matchedRecipe = recipe;
      break;
    }
  }
  
  if (!matchedRecipe) return;
  
  const ing1 = CONFIG_ITEMS[ingotId1];
  const ing2 = CONFIG_ITEMS[ingotId2];
  const resultIngot = CONFIG_ITEMS[matchedRecipe.resultIngotId];
  const isFirstDiscovery = !state.discoveredAlchemyRecipes || !state.discoveredAlchemyRecipes.includes(matchedRecipe.id);
  const totalXP = matchedRecipe.xpReward + (isFirstDiscovery ? matchedRecipe.discoveryBonusXP : 0);
  
  const html = `
    <style>
      @keyframes alchemyGlow {
        0%,100% { box-shadow: 0 0 30px rgba(255,215,0,0.3), inset 0 0 30px rgba(255,180,0,0.05); }
        50% { box-shadow: 0 0 60px rgba(255,215,0,0.6), inset 0 0 50px rgba(255,180,0,0.1); }
      }
      @keyframes alchemyResultAppear {
        0% { opacity: 0; transform: scale(0.3) rotate(-10deg); }
        60% { opacity: 1; transform: scale(1.15) rotate(3deg); }
        100% { opacity: 1; transform: scale(1) rotate(0deg); }
      }
      @keyframes alchemyPulse {
        0%,100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      @keyframes alchemySpark {
        0% { opacity: 1; transform: translate(0, 0) scale(1); }
        100% { opacity: 0; transform: translate(var(--sx), var(--sy)) scale(0); }
      }
      .alchemy-modal-bg {
        background: radial-gradient(circle at 50% 30%, rgba(255,140,0,0.08) 0%, rgba(20,20,22,0.98) 70%);
      }
      .alchemy-slots-area {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        margin: 20px 0;
      }
      .alchemy-slot {
        width: 70px;
        height: 70px;
        background: rgba(255,255,255,0.03);
        border: 2px solid rgba(255,215,0,0.2);
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30px;
        transition: all 0.3s ease;
      }
      .alchemy-slot.selected {
        border-color: rgba(255,215,0,0.6);
        background: rgba(255,215,0,0.06);
        box-shadow: 0 0 20px rgba(255,180,0,0.2);
      }
      .alchemy-operator {
        font-size: 22px;
        font-weight: 700;
        color: var(--accent-gold);
        min-width: 24px;
        text-align: center;
      }
      .alchemy-result-area {
        width: 90px;
        height: 90px;
        margin: 0 auto;
        background: rgba(0,0,0,0.3);
        border: 2px solid rgba(255,215,0,0.4);
        border-radius: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 38px;
        animation: alchemyGlow 3s ease-in-out infinite;
        position: relative;
        overflow: hidden;
      }
      .alchemy-result-area .result-icon {
        animation: alchemyResultAppear 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .alchemy-result-area .result-mystery {
        font-size: 32px;
        color: rgba(255,255,255,0.2);
        animation: alchemyPulse 2s ease-in-out infinite;
      }
      .alchemy-reward-badge {
        display: inline-block;
        background: rgba(255,215,0,0.1);
        border: 1px solid rgba(255,215,0,0.3);
        border-radius: 20px;
        padding: 6px 14px;
        font-size: 11px;
        color: var(--accent-gold);
        font-weight: 600;
        margin-top: 8px;
      }
      .alchemy-confirm-btn {
        background: linear-gradient(135deg, #FFD700, #FF8C00);
        color: #000;
        border: none;
        padding: 14px;
        border-radius: 50px;
        font-weight: 700;
        font-size: 15px;
        cursor: pointer;
        width: 100%;
        box-shadow: 0 4px 20px rgba(255,140,0,0.3);
        transition: all 0.2s;
        margin-top: 8px;
      }
      .alchemy-confirm-btn:active { transform: scale(0.94); }
    </style>
    <div class="modal-header">
      <div class="modal-title" style="font-size:18px;">⚗️ Алхимический сплав</div>
      <button class="modal-close" onclick="document.dispatchEvent(new Event('closeModal'))">✕</button>
    </div>
    <div class="modal-content alchemy-modal-bg">
      <div class="alchemy-slots-area">
        <div class="alchemy-slot selected">${ing1.icon}</div>
        <div class="alchemy-operator">+</div>
        <div class="alchemy-slot selected">${ing2.icon}</div>
        <div class="alchemy-operator">→</div>
        <div class="alchemy-result-area">
          ${isFirstDiscovery ? '<div class="result-mystery">❓</div>' : `<div class="result-icon">${resultIngot.icon}</div>`}
        </div>
      </div>
      <div style="text-align:center;">
        ${isFirstDiscovery 
          ? '<div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">Неизвестный сплав</div>' 
          : `<div style="font-size:13px;color:var(--text-primary);font-weight:600;">${resultIngot.name}</div>`}
        <div class="alchemy-reward-badge">⚡ +${totalXP} XP</div>
        ${isFirstDiscovery ? '<div style="font-size:10px;color:#FFD700;margin-top:4px;">🌟 Первое открытие — бонус!</div>' : ''}
      </div>
      <button class="alchemy-confirm-btn" id="confirmAlchemyBtn">⚗️ СПЛАВИТЬ</button>
      <button class="btn" id="cancelAlchemyBtn" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:var(--text-secondary);margin-top:6px;">Отмена</button>
    </div>
  `;
  
  openModal(html);
  
  setTimeout(() => {
    document.getElementById('confirmAlchemyBtn')?.addEventListener('click', () => {
      closeModal();
      
      const result = performAlchemy(ingotId1, ingotId2);
      
      if (result.success) {
        // Выходим из режима алхимии
        alchemyMode = false;
        alchemyFirstIngot = null;
        
        if (result.isFirstDiscovery) {
          showAlchemyDiscoveryAnimation(result.resultIngot, result.xpGained);
        } else {
          showToast(`Создано: ${result.resultIngot.name}! +${result.xpGained} XP`, '⚗️');
        }
        
        renderInventoryTab();
      } else {
        showToast(result.message, '⚠️');
      }
    });
    
    document.getElementById('cancelAlchemyBtn')?.addEventListener('click', () => {
      closeModal();
    });
  }, 30);
}

// ★ АНИМАЦИЯ ПЕРВОГО ОТКРЫТИЯ ★
function showAlchemyDiscoveryAnimation(ingot, xpGained) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:10001;display:flex;align-items:center;justify-content:center;flex-direction:column;';
  
  const icon = document.createElement('div');
  icon.textContent = ingot.icon;
  icon.style.cssText = 'font-size:80px;animation:alchemyResultAppear 0.8s cubic-bezier(0.175,0.885,0.32,1.275);filter:drop-shadow(0 0 40px rgba(255,215,0,0.8));';
  
  const name = document.createElement('div');
  name.textContent = ingot.name;
  name.style.cssText = 'font-family:Unbounded,sans-serif;font-size:22px;font-weight:800;color:#FFD700;margin-top:16px;text-shadow:0 0 20px rgba(255,215,0,0.5);';
  
  const xp = document.createElement('div');
  xp.textContent = `+${xpGained} XP`;
  xp.style.cssText = 'font-size:16px;color:#50C878;margin-top:8px;font-weight:700;';
  
  const label = document.createElement('div');
  label.textContent = '🌟 ПЕРВОЕ АЛХИМИЧЕСКОЕ ОТКРЫТИЕ!';
  label.style.cssText = 'font-size:11px;color:rgba(255,255,255,0.5);margin-top:12px;letter-spacing:2px;text-transform:uppercase;';
  
  overlay.appendChild(icon);
  overlay.appendChild(name);
  overlay.appendChild(xp);
  overlay.appendChild(label);
  document.body.appendChild(overlay);
  
  // Частицы
  for (let i = 0; i < 24; i++) {
    const spark = document.createElement('div');
    spark.style.cssText = `position:fixed;width:4px;height:4px;border-radius:50%;background:#FFD700;z-index:10002;left:50%;top:50%;box-shadow:0 0 10px #FFD700;animation:alchemySpark 1s ease-out forwards;animation-delay:${i * 0.03}s;`;
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 120;
    spark.style.setProperty('--sx', Math.cos(angle) * dist + 'px');
    spark.style.setProperty('--sy', Math.sin(angle) * dist + 'px');
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 1100);
  }
  
  setTimeout(() => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.5s';
    setTimeout(() => overlay.remove(), 500);
  }, 2000);
}

// ========== КОЛЛЕКЦИЯ: ПОЛОЧКИ ==========
export function renderCollectionTab() {
  const state = getPlayerState();
  const totalRegular = Object.values(CONFIG_ITEMS).filter((i) => !i.isCollectible).length;
  const discovered = Object.values(CONFIG_ITEMS).filter((i) => !i.isCollectible && state.minedStats[i.id] > 0).length;
  const percent = (discovered / totalRegular) * 100;

  let html = `
    <div class="section-title">📦 Коллекция <button class="help-btn" data-help="collection">?</button></div>
    <div class="collection-progress">
      <div class="progress-bar-container">
        <div class="progress-bar-fill" id="collectionProgressFill" style="width:${percent}%"></div>
      </div>
      <div class="progress-text" id="collectionProgressText">${discovered}/${totalRegular} открыто</div>
    </div>
    <div class="inventory-subtabs">
      <button class="subtab-btn ${collectionSubTab === 'encyclopedia' ? 'active' : ''}" data-subtab="encyclopedia">📚 Энциклопедия</button>
      <button class="subtab-btn ${collectionSubTab === 'halloffame' ? 'active' : ''}" data-subtab="halloffame">🏆 Зал Славы</button>
    </div>
  `;

  if (collectionSubTab === 'encyclopedia') {
    const regularIngots = Object.values(CONFIG_ITEMS).filter((i) => !i.isCollectible);
    
    const sourceNames = {
      'expedition': 'Экспедиция',
      'crafted': 'Крафт',
      'meteor': 'Метеорит',
      'alchemy': 'Алхимия'
    };
    
    function renderIngotCard(ing) {
      const discovered = state.minedStats[ing.id] > 0;
      const cardClass = discovered ? 'collection-card' : 'collection-card silhouette';
      
      let sourceLabel = sourceNames[ing.sourceType] || ing.sourceType;
      
      let tagsHtml = '';
      if (discovered) {
        tagsHtml = `
          <div style="font-size:9px; color:var(--text-secondary); margin:2px 0;">${ing.rarity} | ${sourceLabel}</div>
        `;
      }
      
      return `
        <div class="${cardClass}" data-ingot="${ing.id}">
          <div class="card-icon" id="enc-${ing.id}"></div>
          <div class="card-name">${discovered ? ing.name : 'Неизвестный материал'}</div>
          ${tagsHtml}
          <div class="card-count-badge">${discovered ? `Добыто: ${state.minedStats[ing.id]}` : '???'}</div>
        </div>
      `;
    }
    
    html += '<div style="font-family:\'Unbounded\',sans-serif; font-size:16px; font-weight:700; margin:20px 0 12px; color:var(--accent-gold);">⛏️ Шахты и Экспедиции</div>';
    html += '<div class="grid-container">';
    regularIngots.filter(i => i.sourceType === 'expedition').forEach(ing => { html += renderIngotCard(ing); });
    html += '</div>';
    
    html += '<div style="font-family:\'Unbounded\',sans-serif; font-size:16px; font-weight:700; margin:20px 0 12px; color:var(--accent-orange);">🔥 Мастерская Крафта</div>';
    html += '<div class="grid-container">';
    regularIngots.filter(i => i.sourceType === 'crafted').forEach(ing => { html += renderIngotCard(ing); });
    html += '</div>';
    
    const alchemyIngots = regularIngots.filter(i => i.sourceType === 'alchemy');
    if (alchemyIngots.length > 0) {
      html += '<div style="font-family:\'Unbounded\',sans-serif; font-size:16px; font-weight:700; margin:20px 0 12px; color:#FFD700;">⚗️ Алхимические Сплавы</div>';
      html += '<div class="grid-container">';
      alchemyIngots.forEach(ing => { html += renderIngotCard(ing); });
      html += '</div>';
    }
    
    const meteorIngots = regularIngots.filter(i => i.sourceType === 'meteor');
    if (meteorIngots.length > 0) {
      html += '<div style="font-family:\'Unbounded\',sans-serif; font-size:16px; font-weight:700; margin:20px 0 12px; color:var(--accent-purple);">☄️ Метеоритный Шторм</div>';
      html += '<div class="grid-container">';
      meteorIngots.forEach(ing => { html += renderIngotCard(ing); });
      html += '</div>';
    }
    
    mainContent.innerHTML = html;
    
    regularIngots.forEach((ing) => {
      const el = document.getElementById(`enc-${ing.id}`);
      if (el) {
        if (state.minedStats[ing.id] > 0) {
          renderImageToElement(el, ing.imagePath, ing.icon, ing.fallbackColor);
        } else {
          renderMysteryPlaceholder(el);
        }
      }
    });
    
  } else {
    const coll = Object.values(CONFIG_ITEMS).filter((i) => i.isCollectible);
    html += '<div class="grid-container">';
    coll.forEach((ing) => {
      const owned = state.ingots[ing.id] > 0;
      const effectLine = ing.effect_name ? `<div style="font-size:8px; color:#FFD700; margin-top:2px;">${ing.effect_name}</div>` : '';
      html += `
        <div class="collection-card ${owned ? '' : 'silhouette'}" data-ingot="${ing.id}">
          <div class="card-icon" id="hall-${ing.id}"></div>
          <div class="card-name">${owned ? ing.name : '???'}</div>
          ${owned ? effectLine : ''}
          <div class="card-count-badge">${owned ? '★ Найдено' : 'Неизвестно'}</div>
        </div>
      `;
    });
    html += '</div>';
    
    mainContent.innerHTML = html;
    
    coll.forEach((ing) => {
      const el = document.getElementById(`hall-${ing.id}`);
      if (el) {
        if (state.ingots[ing.id] > 0) {
          renderImageToElement(el, ing.imagePath, ing.icon, ing.fallbackColor);
        } else {
          renderMysteryPlaceholder(el);
        }
      }
    });
  }

  document.querySelectorAll('[data-subtab]').forEach((b) =>
    b.addEventListener('click', () => {
      collectionSubTab = b.dataset.subtab;
      renderCollectionTab();
    })
  );
  
  document.querySelectorAll('[data-ingot]').forEach((c) =>
    c.addEventListener('click', () => {
      const ing = CONFIG_ITEMS[c.dataset.ingot];
      openCollectionShowcase(c.dataset.ingot);
    })
  );
}

// ========== ВКЛАДКА "ИГРЫ" ==========
export function renderGamesTab() {
  const state = getPlayerState();
  const activeEvent = eventsManager.getActiveEvent();
  const activeEventId = eventsManager.getActiveEventId();
  const timeLeft = activeEvent ? eventsManager.getTimeLeft() : '';
  
  let html = '<div class="section-title">🎮 Игры <button class="help-btn" data-help="events">?</button></div>';
  
  // ===== ЗОНА 1: ГЛОБАЛЬНОЕ СОБЫТИЕ =====
  html += '<div style="font-family:\'Unbounded\',sans-serif; font-size:14px; font-weight:700; margin:10px 0 8px; color:var(--accent-gold);">🌐 Глобальное событие</div>';
  
  if (!activeEvent || !activeEventId) {
    html += `
      <div class="event-placeholder">
        <div class="event-icon">🛰️</div>
        <div class="event-title">В данный момент нет активных событий</div>
        <div class="event-desc">Следующий ивент запустится автоматически.</div>
      </div>
    `;
  } else if (activeEventId === 'great_smelt') {
    html += `
      <div class="card" style="border: 2px solid rgba(255,100,0,0.4); background: rgba(255,50,0,0.05); position: relative; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 50% 0%, rgba(255,100,0,0.1) 0%, transparent 70%); pointer-events: none;"></div>
        <div class="event-icon" style="font-size:48px; margin-bottom:12px;">${activeEvent.icon}</div>
        <div class="event-title" style="color: var(--accent-orange); font-size: 18px; margin-bottom: 6px;">${activeEvent.name}</div>
        <div class="event-desc" style="color: var(--text-primary); font-size: 12px; line-height: 1.4; margin-bottom: 12px;">${activeEvent.longDescription || activeEvent.description}</div>
        <div style="background: rgba(0,0,0,0.3); border-radius: 16px; padding: 10px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <span style="font-size: 18px;">⏳</span>
          <span style="font-family: 'Unbounded', sans-serif; font-size: 16px; font-weight: 700; color: var(--accent-gold);" id="eventTimer">${timeLeft}</span>
          <span style="font-size: 11px; color: var(--text-secondary);">до завершения</span>
        </div>
        <button class="forge-smelt-btn" id="enterForgeBtn" style="width: 100%; font-size: 13px; padding: 10px;">⚡ ВОЙТИ В ПЛАВИЛЬНЮ</button>
      </div>
    `;
  } else if (activeEventId === 'meteor_storm') {
    const onCooldown = isMeteorStormOnCooldown();
    const cooldownRemaining = getMeteorCooldownRemaining();
    const cooldownSec = Math.ceil(cooldownRemaining / 1000);
    
    html += `
      <div class="card" style="border: 2px solid rgba(180,0,255,0.4); background: rgba(100,0,150,0.05); position: relative; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 50% 0%, rgba(180,0,255,0.1) 0%, transparent 70%); pointer-events: none;"></div>
        <div class="event-icon" style="font-size:48px; margin-bottom:12px;">${activeEvent.icon}</div>
        <div class="event-title" style="color: var(--accent-purple); font-size: 18px; margin-bottom: 6px;">${activeEvent.name}</div>
        <div class="event-desc" style="color: var(--text-primary); font-size: 12px; line-height: 1.4; margin-bottom: 12px;">${activeEvent.longDescription || activeEvent.description}</div>
        <div style="background: rgba(0,0,0,0.3); border-radius: 16px; padding: 10px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <span style="font-size: 18px;">⏳</span>
          <span style="font-family: 'Unbounded', sans-serif; font-size: 16px; font-weight: 700; color: var(--accent-gold);" id="eventTimer">${timeLeft}</span>
          <span style="font-size: 11px; color: var(--text-secondary);">до завершения</span>
        </div>
        <div style="background: rgba(0,0,0,0.3); border-radius: 16px; padding: 10px; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span style="font-size: 16px;">💎</span>
            <span style="font-family: 'Unbounded', sans-serif; font-size: 14px; font-weight: 700; color: var(--accent-gold);" id="meteorShardsDisplay">Осколки метеоритов: ${state.meteorShards || 0}</span>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="forge-smelt-btn" id="playMeteorStormBtn" style="flex: 1; font-size: 12px; padding: 10px; ${onCooldown || meteorStormState.active ? 'opacity: 0.5; pointer-events: none;' : ''}">
            ${onCooldown ? `⏳ Игра (0:${cooldownSec.toString().padStart(2, '0')})` : (meteorStormState.active ? '☄️ Идёт шторм...' : '🎮 Игра')}
          </button>
          <button class="forge-smelt-btn" id="meteorShopBtn" style="flex: 1; font-size: 12px; padding: 10px;">🛒 Обмен</button>
        </div>
      </div>
    `;
  }
  
  // ===== ЗОНА 2: ЗАКАЗЫ ГИЛЬДИИ =====
  html += '<div style="font-family:\'Unbounded\',sans-serif; font-size:14px; font-weight:700; margin:20px 0 8px; color:var(--accent-gold);">📜 Заказы Гильдии</div>';
  
  const activeQuests = state.activeQuests || [];
  const completedQuests = state.completedQuests || [];
  const questCooldownRemaining = getQuestCooldownRemaining();
  const isQuestOnCooldown = questCooldownRemaining > 0;
  
  if (isQuestOnCooldown) {
    const cdMin = Math.floor(questCooldownRemaining / 60000);
    const cdSec = Math.ceil((questCooldownRemaining % 60000) / 1000);
    html += `
      <div class="card" style="text-align:center; padding:20px;">
        <div style="font-size:40px; margin-bottom:8px;">⏳</div>
        <div style="color:var(--text-secondary); font-size:14px;">Новая партия заказов прибудет через</div>
        <div style="font-family:'Unbounded',sans-serif; font-size:24px; font-weight:800; color:var(--accent-gold); margin-top:4px;">${cdMin}:${cdSec.toString().padStart(2, '0')}</div>
      </div>
    `;
  } else if (activeQuests.length === 0) {
    html += '<div class="card" style="text-align:center; padding:20px;"><div style="color:var(--text-muted); font-size:14px;">Нет активных заказов. Загляните позже!</div></div>';
  } else {
    for (let questId of activeQuests) {
      const quest = GUILD_QUESTS.find(q => q.id === questId);
      if (!quest) continue;
      
      const isLocked = state.player.level < quest.reqLevel;
      const isCompleted = completedQuests.includes(questId);
      
      let ingredientsHtml = '';
      for (let ingId in quest.ingredients) {
        const required = quest.ingredients[ingId];
        const owned = state.ingots[ingId] || 0;
        const hasEnough = owned >= required;
        const ing = CONFIG_ITEMS[ingId];
        ingredientsHtml += `<span style="color: ${hasEnough ? '#50C878' : '#FF4444'};">${ing?.icon || ''} ${ing?.name || ingId}: ${owned}/${required}</span> `;
      }
      
      const isChallenge = quest.reqLevel > state.player.level;
      
      html += `
        <div class="card" style="margin-bottom:10px; ${isLocked ? 'opacity: 0.5;' : ''} ${isCompleted ? 'opacity: 0.4;' : ''}">
          <div style="font-weight:700; font-size:14px; color:var(--text-primary); margin-bottom:4px;">
            ${quest.name} ${isLocked ? '🔒' : ''} ${isCompleted ? '✅' : ''} ${isChallenge ? '<span style="color:#FFD700;">⚡Челлендж</span>' : ''}
          </div>
          <div style="font-size:11px; color:var(--text-secondary); margin-bottom:8px;">${quest.description}</div>
          <div style="font-size:11px; margin-bottom:8px;">${ingredientsHtml}</div>
          <div style="font-size:11px; color:var(--accent-gold); margin-bottom:8px;">
            Награда: +${quest.rewardXP} XP${quest.rewardGeode ? ' + ' + (CONFIG_GEODES[quest.rewardGeode]?.name || 'жеода') : ''}
          </div>
          ${isLocked
            ? `<div style="font-size:11px; color:#FF4444;">🔒 Доступно с ${quest.reqLevel} уровня</div>`
            : (isCompleted
                ? '<div style="font-size:11px; color:#50C878;">✅ Выполнено</div>'
                : `<button class="small-btn complete-quest-btn" data-quest-id="${questId}" style="font-size:11px; padding:6px 12px;">📜 Выполнить</button>`
              )
          }
        </div>
      `;
    }
  }
  
  // ===== ЗОНА 3: МИНИ-ИГРЫ =====
  html += '<div style="font-family:\'Unbounded\',sans-serif; font-size:14px; font-weight:700; margin:20px 0 8px; color:var(--accent-gold);">🎰 Мини-игры</div>';
  
  const miniGames = [
    { id: 'quench', name: 'Закалка: Точный Удар', icon: '🔨', description: 'Сжимай раскалённый слиток между прессом и наковальней. Тапай, чтобы отбивать плиты!', reqLevel: 1 },
    { id: 'stack', name: 'Идеальная Стопка', icon: '🧱', description: 'Строй башню из слитков! Тапай, чтобы сбросить слиток. Чем точнее — тем выше!', reqLevel: 5 },
    { id: 'upgrade', name: 'Кузнечный Апгрейд', icon: '🎰', description: 'Рискни слитком ради шанса получить более редкий! Выбери жертву и цель.', reqLevel: 10 }
  ];
  
  miniGames.forEach(game => {
    const isLocked = state.player.level < game.reqLevel;
    
    html += `
      <div class="card mini-game-card" style="position: relative; overflow: hidden; ${isLocked ? 'opacity: 0.5;' : ''}">
        ${isLocked ? `
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(2px); z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 28px;">
            <div style="font-size: 36px; margin-bottom: 4px;">🔒</div>
            <div style="font-size: 11px; color: var(--text-secondary); text-align: center; padding: 0 20px;">Открывается на ${game.reqLevel} уровне металлурга</div>
          </div>
        ` : ''}
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 40px; min-width: 50px; text-align: center;">${game.icon}</div>
          <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 15px; color: var(--text-primary); margin-bottom: 4px;">${game.name}</div>
            <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.4;">${game.description}</div>
          </div>
        </div>
        ${!isLocked ? `
          <button class="btn mini-game-play-btn" data-game="${game.id}" style="margin-top: 12px; width: 100%;">▶️ ИГРАТЬ</button>
        ` : ''}
      </div>
    `;
  });
  
  mainContent.innerHTML = html;
  
  // Обработчики
  const enterForgeBtn = document.getElementById('enterForgeBtn');
  if (enterForgeBtn) enterForgeBtn.addEventListener('click', () => openForge());
  
  const playBtn = document.getElementById('playMeteorStormBtn');
  if (playBtn) {
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (!isMeteorStormOnCooldown() && !meteorStormState.active) startMeteorStorm();
    });
  }
  
  const shopBtn = document.getElementById('meteorShopBtn');
  if (shopBtn) {
    shopBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      showMeteorShop();
    });
  }
  
  document.querySelectorAll('.complete-quest-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const questId = btn.dataset.questId;
      completeQuest(questId);
    });
  });
  
  document.querySelectorAll('.mini-game-play-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const gameId = btn.dataset.game;
      if (gameId === 'quench' && _startQuenchGame) _startQuenchGame();
      else if (gameId === 'stack' && _startStackGame) _startStackGame();
      else if (gameId === 'upgrade' && _startUpgradeGame) _startUpgradeGame();
      else showToast('Мини-игра загружается...', '⏳');
    });
  });
  
  updateEventTimerInterval();
  if (activeEventId === 'meteor_storm') updateMeteorCooldownUI();
}

function showMeteorShop() {
  const state = getPlayerState();
  
  let itemsHtml = '';
  for (let key in METEOR_SHOP_ITEMS) {
    const item = METEOR_SHOP_ITEMS[key];
    const canAfford = state.meteorShards >= item.price;
    itemsHtml += `
      <div style="background: rgba(0,0,0,0.2); border-radius: 20px; padding: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 40px;">${item.icon}</div>
        <div style="flex: 1; text-align: left;">
          <div style="font-weight: 700; font-size: 16px; color: var(--text-primary);">${item.name}</div>
          <div style="font-size: 12px; color: var(--text-secondary);">${item.description}</div>
          <div style="font-size: 14px; font-weight: 700; color: ${canAfford ? '#50C878' : '#FF4444'}; margin-top: 4px;">💎 ${item.price} осколков</div>
        </div>
        <button class="small-btn" data-shop-item="${key}" style="background: ${canAfford ? 'rgba(80,200,120,0.2)' : 'rgba(255,68,68,0.2)'}; border-color: ${canAfford ? 'rgba(80,200,120,0.4)' : 'rgba(255,68,68,0.4)'}; color: ${canAfford ? '#50C878' : '#FF4444'}; ${canAfford ? '' : 'opacity: 0.5; pointer-events: none;'}">
          Купить
        </button>
      </div>
    `;
  }
  
  let html = `
    <div class="modal-header">
      <div class="modal-title">🛒 Магазин осколков</div>
      <button class="modal-close" onclick="document.dispatchEvent(new Event('closeModal'))">✕</button>
    </div>
    <div class="modal-content">
      <div style="background: rgba(0,0,0,0.2); border-radius: 20px; padding: 14px; margin-bottom: 16px; text-align: center;">
        <span style="font-size: 20px;">💎</span>
        <span style="font-family: 'Unbounded', sans-serif; font-size: 18px; font-weight: 700; color: var(--accent-gold);">Осколков: ${state.meteorShards || 0}</span>
      </div>
      ${itemsHtml}
    </div>
  `;
  
  openModal(html);
  
  setTimeout(() => {
    document.querySelectorAll('[data-shop-item]').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.dataset.shopItem;
        const item = METEOR_SHOP_ITEMS[itemId];
        if (state.meteorShards >= item.price) {
          buyMeteorGeode(itemId);
          closeModal();
          showMeteorShop();
        }
      });
    });
  }, 10);
}

let meteorCooldownInterval = null;

function updateMeteorCooldownUI() {
  if (meteorCooldownInterval) clearInterval(meteorCooldownInterval);
  
  meteorCooldownInterval = setInterval(() => {
    if (currentTab !== 'events') {
      clearInterval(meteorCooldownInterval);
      meteorCooldownInterval = null;
      return;
    }
    
    const btn = document.getElementById('playMeteorStormBtn');
    if (!btn) return;
    
    const onCooldown = isMeteorStormOnCooldown();
    const remaining = getMeteorCooldownRemaining();
    const sec = Math.ceil(remaining / 1000);
    
    if (onCooldown) {
      btn.textContent = `⏳ Игра (0:${sec.toString().padStart(2, '0')})`;
      btn.style.opacity = '0.5';
      btn.style.pointerEvents = 'none';
    } else if (meteorStormState.active) {
      btn.textContent = '☄️ Идёт шторм...';
      btn.style.opacity = '0.5';
      btn.style.pointerEvents = 'none';
    } else {
      btn.textContent = '🎮 Игра';
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
      btn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!isMeteorStormOnCooldown() && !meteorStormState.active) {
          startMeteorStorm();
        }
      };
    }
    
    updateMeteorShardsDisplay();
  }, 1000);
}

export function showMeteorStormResults(shardsCollected, meteorsCaught, secretCaught) {
  let html = `
    <div class="modal-header">
      <div class="modal-title">☄️ Шторм завершён!</div>
      <button class="modal-close" onclick="document.dispatchEvent(new Event('closeModal'))">✕</button>
    </div>
    <div class="modal-content">
      <div class="modal-icon-large" style="font-size:80px;">☄️</div>
      <div style="font-size: 16px; color: var(--text-primary); margin-bottom: 20px;">
        Метеоритов поймано: <strong>${meteorsCaught}</strong>
      </div>
      <div style="background: rgba(0,0,0,0.2); border-radius: 20px; padding: 18px; margin-bottom: 16px;">
        <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Собрано осколков за раунд:</div>
        <div style="font-family: 'Unbounded', sans-serif; font-size: 28px; font-weight: 800; color: var(--accent-gold);">+${shardsCollected}</div>
      </div>
      ${secretCaught ? '<div style="color: #FF00FF; font-weight: 700; margin-top: 12px;">🌟 Пойман секретный метеорит!</div>' : ''}
    </div>
  `;
  
  openModal(html);
}

let eventTimerInterval = null;

function updateEventTimerInterval() {
  if (eventTimerInterval) clearInterval(eventTimerInterval);
  
  eventTimerInterval = setInterval(() => {
    const timerEl = document.getElementById('eventTimer');
    if (timerEl && currentTab === 'events') {
      const event = eventsManager.getActiveEvent();
      if (event) {
        timerEl.textContent = eventsManager.getTimeLeft();
      } else {
        clearInterval(eventTimerInterval);
        eventTimerInterval = null;
        renderGamesTab();
      }
    } else if (currentTab !== 'events') {
      clearInterval(eventTimerInterval);
      eventTimerInterval = null;
    }
  }, 1000);
}

// ========== РЕНДЕРИНГ ПРОФИЛЯ ==========
export function renderProfileTab() {
  const state = getPlayerState();
  const userName = 'Старатель';
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const themeBtnText = currentTheme === 'dark' ? '🌙 Сменить тему (Светлая)' : '☀️ Сменить тему (Тёмная)';
  
  let html = `<div class="section-title">👤 Профиль <button class="help-btn" data-help="profile">?</button></div>`;
  
  html += `
    <div class="card">
      <div class="profile-header">
        <div class="profile-avatar">👤</div>
        <div class="profile-info">
          <div class="profile-name">${userName}</div>
          <div class="profile-status" id="profileStatus">${STATUSES[Math.min(state.player.level - 1, STATUSES.length - 1)]}</div>
          <span class="level-badge" id="profileLevel">${state.player.level}</span> уровень
          <button class="dev-menu-btn" id="adminPanelBtn">🛠️ АДМИН</button>
        </div>
      </div>
      <div class="xp-bar-container"><div class="xp-bar-fill" id="xpFill" style="width:0%"></div></div>
      <div class="xp-text" id="xpText">${state.player.xp} / ${LEVELS[state.player.level] || 15000} XP</div>
      
      <button class="theme-profile-btn" id="themeProfileBtn">${themeBtnText}</button>
      <button class="vip-button" id="vipButton">💎 АКТИВИРОВАТЬ VIP</button>
      <button class="btn" id="leaderboardBtn" style="margin-top:12px;">🏆 ТОП ИГРОКОВ</button>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value" id="statOpened">${state.player.totalOpened}</div><div class="stat-label">Открыто жеод</div></div>
        <div class="stat-card"><div class="stat-value" id="statIngots">${state.player.totalIngots}</div><div class="stat-label">Добыто слитков</div></div>
        <div class="stat-card"><div class="stat-value" id="statArtifacts">${state.player.totalArtifacts}</div><div class="stat-label">Артефактов</div></div>
      </div>
    </div>
    <div class="card sell-section"><div class="section-title">💰 Сбыт сырья</div>
  `;
  
  const availableIngots = Object.entries(state.ingots).filter(([k, v]) => v > 0 && !CONFIG_ITEMS[k].isCollectible);
  if (availableIngots.length === 0) {
    html += '<div class="empty-state">Нет ресурсов для сдачи</div>';
  } else {
    availableIngots.forEach(([k, v]) => {
      const ing = CONFIG_ITEMS[k];
      html += `
        <div class="resource-item">
          <div class="resource-info">
            <div class="resource-icon" id="sell-icon-${k}"></div>
            <div>
              <div class="resource-name">${ing.name}</div>
              <div class="resource-count">${v} шт. (+${ing.sellValue} XP/шт)</div>
            </div>
          </div>
          <button class="sell-btn" data-sell="${k}">Сдать всё</button>
        </div>
      `;
    });
  }
  html += '</div>';
  
  mainContent.innerHTML = html;

  availableIngots.forEach(([k]) => {
    const el = document.getElementById(`sell-icon-${k}`);
    if (el) {
      const ing = CONFIG_ITEMS[k];
      renderImageToElement(el, ing.imagePath, ing.icon, ing.fallbackColor);
    }
  });
  
  document.getElementById('themeProfileBtn').addEventListener('click', toggleTheme);
  document.querySelectorAll('[data-sell]').forEach((b) => b.addEventListener('click', () => sellIngot(b.dataset.sell)));
  document.getElementById('vipButton').addEventListener('click', () => showToast('Оплата через Crypto Bot скоро будет доступна', '💎'));
  
  document.getElementById('leaderboardBtn')?.addEventListener('click', async () => {
    try {
      const { updateLeaderboard } = await import('./core.js');
      updateLeaderboard();
    } catch (e) {
      showToast('Не удалось загрузить таблицу лидеров', '⚠️');
    }
  });
  
  document.getElementById('adminPanelBtn').addEventListener('click', () => {
    showAdminPanel();
  });
  
  updateProfileUI();
}

export function renderCurrentTab() {
  if (currentTab === 'expeditions') renderExpeditionsTab();
  else if (currentTab === 'ingot') renderIngotScreen(mainContent);
  else if (currentTab === 'inventory') renderInventoryTab();
  else if (currentTab === 'collection') renderCollectionTab();
  else if (currentTab === 'events') renderGamesTab();
  else if (currentTab === 'profile') renderProfileTab();
}

export function setActiveTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll('.tab-item').forEach((b) => b.classList.toggle('active', b.dataset.tab === tabId));
  renderCurrentTab();
}
