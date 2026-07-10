// ========== UI МОДУЛЬ: ОТРИСОВКА ИНТЕРФЕЙСА ==========
import { CONFIG_ITEMS, CONFIG_GEODES, CONFIG_EXPEDITIONS, EXPEDITION_GROUPS, ALCHEMY_RECIPES, LEVELS, STATUSES, GUILD_QUESTS } from './config.js';
import { getPlayerState, getSerialForCollectible, isLocationCompleted, sellIngot, startExpedition, openBrawlOverlay, eventsManager, saveGame, devGiveXP, devGiveGeodes, devUnlockLocations, devResetGeodes, startSignalGame, exchangeSpecialGeodeForXP, openForge, sendBotNotification, registerUIFunctions, startMeteorStorm, canStartMeteorStorm, isMeteorStormOnCooldown, getMeteorCooldownRemaining, meteorStormState, buyMeteorGeode, METEOR_SHOP_ITEMS, completeQuest, refreshActiveQuests, toggleSpeedMode, getQuestCooldownRemaining, performAlchemy, isIngotSourceKnown, isIngotUsageKnown, isRecipeDiscovered, getDiscoveredKnowledge } from './core.js';
import { renderIngotScreen, getBonusRecycledChance, getBonusExpeditionSpeed, getActiveBonuses } from './ingot.js';

// Точка входа для мини-игр
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

loadMiniGames();

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

export const mainContent = document.getElementById('mainContent');
const showcaseOverlay = document.getElementById('showcaseOverlay');
const showcaseContent = document.getElementById('showcaseContent');
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');

export let currentTab = 'expeditions';
export let inventorySubTab = 'geodes';
export let collectionSubTab = 'encyclopedia';

let modalTimerInterval = null;
let expandedGroups = {};
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
    'junk': '#6b6b6b',
    'recycled': '#8b7355',
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
      <button class="btn" id="showcaseDetailsBtn" style="margin-top:12px;" data-ingot="${ingotId}">📋 Подробнее</button>
    </div>
  `;
  
  showcaseContent.innerHTML = html;
  
  const imgEl = document.getElementById('showcaseImage');
  renderImageToElement(imgEl, ingot.imagePath, ingot.icon, ingot.fallbackColor);
  showcaseContent.style.opacity = '1';
  showcaseOverlay.classList.add('active');
  
  setTimeout(() => {
    const detailsBtn = document.getElementById('showcaseDetailsBtn');
    if (detailsBtn) {
      detailsBtn.addEventListener('click', () => {
        showItemDetails(ingotId);
      });
    }
  }, 10);
}

// ---------- SHOWCASE (ОТКРЫТИЕ КАРТОЧКИ ИЗ КОЛЛЕКЦИИ) ----------
function openCollectionShowcase(ingotId) {
  const state = getPlayerState();
  const ingot = CONFIG_ITEMS[ingotId];
  if (!ingot) return;
  
  const discovered = state.minedStats[ingotId] > 0;
  const isCollectible = ingot.isCollectible;
  
  const rarityColors = {
    'junk': '#6b6b6b',
    'recycled': '#8b7355',
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
        <button class="btn" id="showcaseDetailsBtn" style="margin-top:12px;" data-ingot="${ingotId}">📋 Подробнее</button>
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
        <button class="btn" id="showcaseDetailsBtn" style="margin-top:12px;" data-ingot="${ingotId}">📋 Подробнее</button>
      </div>
    `;
    showcaseContent.innerHTML = html;
    renderImageToElement(document.getElementById('showcaseImage'), ingot.imagePath, ingot.icon, ingot.fallbackColor);
    showcaseContent.style.opacity = '1';
  }
  
  showcaseOverlay.classList.add('active');
  
  setTimeout(() => {
    const detailsBtn = document.getElementById('showcaseDetailsBtn');
    if (detailsBtn) {
      detailsBtn.addEventListener('click', () => {
        showItemDetails(ingotId);
      });
    }
  }, 10);
}

export function closeShowcase() {
  showcaseOverlay.classList.remove('active');
}

// ========== ★ ЭКРАН «ПОДРОБНЕЕ» (ЖУРНАЛ ИССЛЕДОВАТЕЛЯ) ★ ==========
function showItemDetails(ingotId) {
  const state = getPlayerState();
  const ingot = CONFIG_ITEMS[ingotId];
  if (!ingot) return;
  
  const discovered = state.minedStats[ingotId] > 0;
  
  // ===== ЗОНА 1: КАК ПОЛУЧИТЬ =====
  let sourceHtml = '';
  
  if (!discovered && !ingot.isCollectible) {
    // Предмет не найден — показываем только локацию (она известна из конфига)
    const locName = CONFIG_EXPEDITIONS[ingot.location]?.name || '???';
    sourceHtml = `
      <div style="display:flex; align-items:center; gap:8px; padding:8px;">
        <span style="font-size:24px;">❓</span>
        <span style="color:var(--text-muted);">Добывается в: ${locName}</span>
      </div>
    `;
  } else if (ingot.sourceType === 'expedition') {
    const locName = CONFIG_EXPEDITIONS[ingot.location]?.name || 'Неизвестная локация';
    const locIcon = CONFIG_EXPEDITIONS[ingot.location]?.fallbackIcon || '❓';
    sourceHtml = `
      <div style="display:flex; align-items:center; gap:8px; padding:8px;">
        <span style="font-size:24px;">${locIcon}</span>
        <span style="color:#FFD700; font-weight:600;">${locName}</span>
        <span style="color:var(--text-muted);">→</span>
        <span style="font-size:24px;">${ingot.icon}</span>
        <span style="color:var(--text-primary);">${ingot.name}</span>
      </div>
    `;
  } else if (ingot.sourceType === 'alchemy') {
    // Находим рецепт
    let recipeHtml = '';
    for (let recipeId in ALCHEMY_RECIPES) {
      const recipe = ALCHEMY_RECIPES[recipeId];
      if (recipe.resultIngotId === ingotId) {
        const ing1Known = state.minedStats[recipe.ingredients[0]] > 0;
        const ing2Known = state.minedStats[recipe.ingredients[1]] > 0;
        const ing1 = CONFIG_ITEMS[recipe.ingredients[0]];
        const ing2 = CONFIG_ITEMS[recipe.ingredients[1]];
        
        recipeHtml = `
          <div style="display:flex; align-items:center; gap:6px; padding:8px; flex-wrap:wrap; justify-content:center;">
            ${ing1Known ? `<span style="font-size:22px;">${ing1.icon}</span><span style="color:var(--text-primary); font-size:11px;">${ing1.name}</span>` : `<span style="font-size:22px; opacity:0.4;">❓</span><span style="color:var(--text-muted); font-size:11px;">???</span>`}
            <span style="color:var(--text-muted);">+</span>
            ${ing2Known ? `<span style="font-size:22px;">${ing2.icon}</span><span style="color:var(--text-primary); font-size:11px;">${ing2.name}</span>` : `<span style="font-size:22px; opacity:0.4;">❓</span><span style="color:var(--text-muted); font-size:11px;">???</span>`}
            <span style="color:var(--text-muted);">=</span>
            <span style="font-size:22px;">${ingot.icon}</span>
            <span style="color:#FFD700; font-size:11px;">${ingot.name}</span>
          </div>
        `;
        break;
      }
    }
    sourceHtml = recipeHtml || '<div style="color:var(--text-muted); padding:8px;">Рецепт неизвестен</div>';
  } else if (ingot.sourceType === 'crafted') {
    const recipe = CRAFT_RECIPES[ingotId];
    if (recipe) {
      let craftHtml = '<div style="display:flex; align-items:center; gap:6px; padding:8px; flex-wrap:wrap; justify-content:center;">';
      let first = true;
      for (let ingKey in recipe.ingredients) {
        if (!first) craftHtml += '<span style="color:var(--text-muted);">+</span>';
        const ingKeyIngot = CONFIG_ITEMS[ingKey];
        craftHtml += `<span style="font-size:22px;">${ingKeyIngot.icon}</span><span style="color:var(--text-primary); font-size:11px;">${ingKeyIngot.name}</span>`;
        first = false;
      }
      craftHtml += '<span style="color:var(--text-muted);">=</span>';
      craftHtml += `<span style="font-size:22px;">${ingot.icon}</span><span style="color:#FFD700; font-size:11px;">${ingot.name}</span>`;
      craftHtml += '<div style="font-size:9px; color:var(--accent-orange); margin-top:4px;">(Великая Переплавка)</div>';
      craftHtml += '</div>';
      sourceHtml = craftHtml;
    } else {
      sourceHtml = '<div style="color:var(--text-muted); padding:8px;">Рецепт неизвестен</div>';
    }
  } else if (ingot.sourceType === 'meteor' || ingot.sourceType === 'special_meteor') {
    sourceHtml = `
      <div style="display:flex; align-items:center; gap:8px; padding:8px;">
        <span style="font-size:24px;">☄️</span>
        <span style="color:#FFD700; font-weight:600;">Метеоритный Шторм</span>
        <span style="color:var(--text-muted);">→</span>
        <span style="font-size:24px;">${ingot.icon}</span>
        <span style="color:var(--text-primary);">${ingot.name}</span>
      </div>
    `;
  }
  
  // ===== ЗОНА 2: ГДЕ ПРИМЕНЯЕТСЯ =====
  let usageHtml = '';
  const usedInRecipes = [];
  
  for (let recipeId in ALCHEMY_RECIPES) {
    const recipe = ALCHEMY_RECIPES[recipeId];
    if (recipe.ingredients.includes(ingotId)) {
      const otherIngId = recipe.ingredients.find(id => id !== ingotId);
      const otherIng = CONFIG_ITEMS[otherIngId];
      const resultIng = CONFIG_ITEMS[recipe.resultIngotId];
      const otherKnown = state.minedStats[otherIngId] > 0;
      const resultKnown = state.minedStats[recipe.resultIngotId] > 0;
      
      usedInRecipes.push({
        otherIngId,
        otherIng,
        otherKnown,
        resultIng,
        resultKnown,
        recipeId
      });
    }
  }
  
  if (usedInRecipes.length > 0) {
    usedInRecipes.forEach(rec => {
      usageHtml += `
        <div style="display:flex; align-items:center; gap:6px; padding:6px; flex-wrap:wrap; justify-content:center;">
          <span style="font-size:22px;">${ingot.icon}</span>
          <span style="color:var(--text-muted);">+</span>
          ${rec.otherKnown ? `<span style="font-size:22px;">${rec.otherIng.icon}</span><span style="color:var(--text-primary); font-size:11px;">${rec.otherIng.name}</span>` : `<span style="font-size:22px; opacity:0.4;">❓</span><span style="color:var(--text-muted); font-size:11px;">???</span>`}
          <span style="color:var(--text-muted);">=</span>
          ${rec.resultKnown ? `<span style="font-size:22px;">${rec.resultIng.icon}</span><span style="color:#FFD700; font-size:11px;">${rec.resultIng.name}</span>` : `<span style="font-size:22px; opacity:0.4;">❓</span><span style="color:var(--text-muted); font-size:11px;">???</span>`}
        </div>
      `;
    });
  } else {
    usageHtml = '<div style="color:var(--text-muted); padding:8px; text-align:center;">Пока не используется в крафтах</div>';
  }
  
  // ===== ИНДИКАТОР ЗНАНИЙ =====
  const sourceKnown = discovered || isIngotSourceKnown(ingotId);
  const usageKnown = isIngotUsageKnown(ingotId) || usedInRecipes.length > 0;
  
  const knowledgeDots = `
    <div style="display:flex; gap:6px; justify-content:center; margin-bottom:12px;">
      <div style="width:8px; height:8px; border-radius:50%; background:${discovered ? '#FFD700' : '#444'};" title="${discovered ? 'Предмет найден' : 'Предмет не найден'}"></div>
      <div style="width:8px; height:8px; border-radius:50%; background:${sourceKnown ? '#FFD700' : '#444'};" title="${sourceKnown ? 'Источник известен' : 'Источник неизвестен'}"></div>
      <div style="width:8px; height:8px; border-radius:50%; background:${usageKnown ? '#FFD700' : '#444'};" title="${usageKnown ? 'Применение известно' : 'Применение неизвестно'}"></div>
    </div>
  `;
  
  // ===== СОБИРАЕМ МОДАЛКУ =====
  const html = `
    <style>
      .details-section {
        background: rgba(0,0,0,0.2);
        border-radius: 16px;
        padding: 12px;
        margin-bottom: 12px;
        border: 1px solid rgba(255,255,255,0.06);
      }
      .details-section-title {
        font-size: 12px;
        font-weight: 700;
        color: var(--accent-gold);
        margin-bottom: 8px;
        text-align: center;
        letter-spacing: 1px;
      }
      .mystery-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: rgba(255,255,255,0.03);
        border: 1px dashed rgba(255,255,255,0.1);
        border-radius: 8px;
        color: rgba(255,255,255,0.2);
        font-size: 16px;
      }
    </style>
    <div class="modal-header">
      <div class="modal-title">📋 ${ingot.name}</div>
      <button class="modal-close" onclick="document.dispatchEvent(new Event('closeModal'))">✕</button>
    </div>
    <div class="modal-content" style="text-align:left;">
      <div style="display:flex; align-items:center; gap:10px; justify-content:center; margin-bottom:16px;">
        <span style="font-size:40px;">${discovered ? ingot.icon : '❓'}</span>
        <div>
          <div style="font-weight:700; font-size:16px; color:var(--text-primary);">${discovered ? ingot.name : 'Неизвестный материал'}</div>
          <div style="font-size:11px; color:var(--text-secondary);">${discovered ? ingot.rarity : '???'}</div>
        </div>
      </div>
      
      ${knowledgeDots}
      
      <div class="details-section">
        <div class="details-section-title">🔍 Как получить</div>
        ${sourceHtml}
      </div>
      
      <div class="details-section">
        <div class="details-section-title">⚒️ Где применяется</div>
        ${usageHtml}
      </div>
      
      ${discovered ? `<div class="modal-description" style="text-align:center;">${ingot.description}</div>` : ''}
    </div>
  `;
  
  openModal(html);
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
      <button class="btn" id="adminUnlockAll" style="margin-bottom:6px;">🔓 Открыть все локации (ур.6)</button>
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
      showToast('Локации открыты (уровень 6)!', '🔓'); 
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
        if (CONFIG_ITEMS[id].isCollectible) {
          state.ingots[id] = (state.ingots[id] || 0) + 1;
          state.minedStats[id] = (state.minedStats[id] || 0) + 1;
        }
      });
      state.player.totalArtifacts += Object.keys(CONFIG_ITEMS).filter(id => CONFIG_ITEMS[id].isCollectible).length;
      saveGame(); 
      showToast('+1 артефакт каждого типа!', '💎'); 
      closeModal(); 
    });
    
    document.getElementById('adminResetProgress')?.addEventListener('click', () => {
      const state = getPlayerState();
      
      state.player.level = 1;
      state.player.xp = 0;
      state.player.totalOpened = 0;
      state.player.totalIngots = 0;
      state.player.totalArtifacts = 0;
      
      for (let k in state.expeditions) {
        state.expeditions[k].active = false;
        state.expeditions[k].endTime = null;
        state.expeditions[k].scanUsed = false;
        state.expeditions[k].specialChanceBoost = null;
      }
      
      Object.keys(state.geodes).forEach(k => { state.geodes[k] = 0; });
      state.geodes['swamp'] = 3;
      
      Object.keys(state.ingots).forEach(k => { state.ingots[k] = 0; });
      Object.keys(state.minedStats).forEach(k => { state.minedStats[k] = 0; });
      
      Object.keys(state.discoveredSpecialGeodes).forEach(k => { state.discoveredSpecialGeodes[k] = false; });
      state.collectedArtifacts.swamp = [];
      state.collectedArtifacts.rotforest = [];
      state.collectedArtifacts.rustbottom = [];
      state.collectedArtifacts.meteor = [];
      
      state.echoCooldowns = {};
      state.expeditionBonuses = {};
      state.meteorShards = 0;
      state.meteorCooldownEnd = null;
      state.activeQuests = [];
      state.questRefreshTime = null;
      state.completedQuests = [];
      state.questCooldownEnd = null;
      state.unlockedExpeditions = ['swamp'];
      state.equippedArtifacts = [null, null, null];
      state.discoveredAlchemyRecipes = [];
      state.discoveredKnowledge = {};
      
      import('./tutorial.js').then(t => {
        t.resetTutorialFlag();
      });
      
      import('./ingot.js').then(ingot => {
        ingot.resetIngotState();
        localStorage.removeItem('starforge_v1');
        saveGame();
        showToast('💀 Прогресс полностью сброшен!', '🗑️');
        closeModal();
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

// ========== ФУНКЦИЯ РАСЧЁТА ШАНСОВ С БОНУСАМИ ==========
function getAdjustedChances(geodeId) {
  const g = CONFIG_GEODES[geodeId];
  if (!g || g.isSpecial) return null;
  
  const bonusRecycled = getBonusRecycledChance();
  if (bonusRecycled <= 0) return null;
  
  const adjusted = g.lootTable.map(entry => {
    const ingot = CONFIG_ITEMS[entry.ingotId];
    return {
      ingotId: entry.ingotId,
      baseChance: entry.chance,
      adjustedChance: entry.chance,
      rarity: ingot.rarityLevel
    };
  });
  
  const recycledSlots = adjusted.filter(s => s.rarity === 'recycled');
  const junkSlots = adjusted.filter(s => s.rarity === 'junk');
  
  if (recycledSlots.length === 0 || junkSlots.length === 0) return null;
  
  const bonusPerRecycled = (bonusRecycled / 100) / recycledSlots.length;
  const penaltyTotal = bonusRecycled / 100;
  const penaltyPerJunk = penaltyTotal / junkSlots.length;
  
  recycledSlots.forEach(s => { s.adjustedChance += bonusPerRecycled; });
  junkSlots.forEach(s => { s.adjustedChance -= penaltyPerJunk; });
  
  return adjusted;
}

// ========== УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ОТОБРАЖЕНИЯ БОНУСОВ ==========
function getBonusDisplayHTML(baseValue, bonusPercent, suffix = '%', isInverted = false) {
  if (!bonusPercent || bonusPercent === 0) return '';
  const color = bonusPercent > 0 ? '#50C878' : '#FF4444';
  const sign = bonusPercent > 0 ? '+' : '';
  return ` <span style="color:${color}; font-size:11px;">(${sign}${bonusPercent}${suffix})</span>`;
}

// ---------- МОДАЛКА ЖЕОДЫ С ШАНСАМИ ----------
export function showGeodeModal(geodeId) {
  const state = getPlayerState();
  const g = CONFIG_GEODES[geodeId];
  if (!g) return;
  
  let lootHtml = '';
  if (g.isSpecial) {
    lootHtml = `<div style="text-align:center; padding:20px; color:var(--accent-gold);">✨ Гарантированно содержит один из коллекционных артефактов локации ✨</div>`;
  } else {
    const adjustedChances = getAdjustedChances(geodeId);
    
    g.lootTable.forEach((e) => {
      const ing = CONFIG_ITEMS[e.ingotId];
      const basePercent = Math.round(e.chance * 100);
      
      let chanceDisplay = `${basePercent}%`;
      let bonusHtml = '';
      
      if (adjustedChances) {
        const adj = adjustedChances.find(a => a.ingotId === e.ingotId);
        if (adj) {
          const adjPercent = Math.round(adj.adjustedChance * 100);
          const diff = adjPercent - basePercent;
          if (diff > 0) {
            bonusHtml = ` <span style="color:#50C878; font-size:10px;">(+${diff}%)</span>`;
          } else if (diff < 0) {
            bonusHtml = ` <span style="color:#FF4444; font-size:10px;">(${diff}%)</span>`;
          }
        }
      }
      
      lootHtml += `
        <div class="loot-row">
          <div class="loot-left">
            <div class="loot-icon" id="loot-${e.ingotId}"></div>
            <span>${ing.name}</span>
          </div>
          <div class="loot-chance">${chanceDisplay}${bonusHtml}</div>
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

// ========== МОДАЛКА ЭКСПЕДИЦИИ С LIVE-БОНУСАМИ ==========
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

  const bonusSpeed = getBonusExpeditionSpeed();
  const baseTimer = exp.timer;
  const adjustedTimer = bonusSpeed > 0 ? Math.floor(baseTimer * (1 - bonusSpeed / 100)) : baseTimer;
  
  const baseSpecialChance = Math.round(exp.specialGeodeChance * 100);
  
  let specialText = '';
  if (completed) {
    specialText = '✅ Все артефакты собраны';
  } else if (discovered) {
    specialText = `Особая находка: ${special.name} (${baseSpecialChance}%)`;
  } else {
    specialText = `Особая находка: ??? (${baseSpecialChance}%)`;
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
  if (expId !== 'swamp' && isActive) {
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

  const timerBonusHTML = bonusSpeed > 0 
    ? `${baseTimer} сек <span style="color:#50C878; font-size:11px;">(-${bonusSpeed}%)</span> → ${adjustedTimer} сек`
    : `${baseTimer} сек`;

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
          <span style="color:var(--accent-gold);">${timerBonusHTML}</span>
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
  
  if (!state.unlockedExpeditions) state.unlockedExpeditions = ['swamp'];
  
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
  if (!state.unlockedExpeditions) state.unlockedExpeditions = ['swamp'];
  
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
    
    // ★ КНОПКА АЛХИМИИ — всегда видна, но заблокирована до 3 уровня
    const alchemyAvailable = state.player.level >= 3;
    
    html += `
      <div style="margin-bottom:14px;">
        <button class="small-btn" id="toggleAlchemyBtn" style="width:100%; ${alchemyMode ? 'background: rgba(255,68,68,0.15); border-color: rgba(255,68,68,0.4); color: #FF4444;' : ''}${!alchemyAvailable ? 'opacity: 0.35; cursor: not-allowed; border-color: rgba(255,255,255,0.05); color: rgba(255,255,255,0.2);' : ''}" ${!alchemyAvailable ? 'disabled' : ''}>
          ${!alchemyAvailable ? '🔒 Сплавить (ур. 3)' : (alchemyMode ? '❌ Отмена' : '⚗️ Сплавить')}
        </button>
        ${alchemyMode ? '<div style="text-align:center; font-size:10px; color:var(--accent-gold); margin-top:6px;">Выберите первый слиток для сплава</div>' : ''}
        ${alchemyMode && alchemyFirstIngot ? `<div style="text-align:center; font-size:10px; color:var(--text-secondary); margin-top:2px;">Выбран: ${CONFIG_ITEMS[alchemyFirstIngot]?.icon} ${CONFIG_ITEMS[alchemyFirstIngot]?.name}. Выберите второй.</div>` : ''}
      </div>
    `;
    
    if (!items.length) {
      html += '<div class="empty-state">Нет слитков. Откройте жеоды.</div>';
    } else {
      html += '<div class="grid-container">';
      items.forEach(([k, c]) => {
        const ing = CONFIG_ITEMS[k];
        
        let isCompatible = true;
        let cardClass = 'collection-card';
        
        if (alchemyMode) {
          if (!alchemyFirstIngot) {
            cardClass += ' alchemy-selectable';
          } else if (k === alchemyFirstIngot) {
            cardClass += ' alchemy-selected';
          } else {
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
    
    // ★ CSS ДЛЯ ФИЛЬТРАЦИИ
    const filterStyle = document.createElement('style');
    filterStyle.id = 'alchemy-filter-styles';
    filterStyle.textContent = `
      .alchemy-selectable { border-color: rgba(255,215,0,0.3) !important; cursor: pointer !important; }
      .alchemy-selectable:active { border-color: rgba(255,215,0,0.7) !important; background: rgba(255,215,0,0.08) !important; }
      .alchemy-selected { border-color: rgba(255,215,0,0.8) !important; background: rgba(255,215,0,0.1) !important; box-shadow: 0 0 18px rgba(255,180,0,0.25) !important; }
      .alchemy-compatible { border-color: rgba(80,200,120,0.35) !important; cursor: pointer !important; }
      .alchemy-incompatible { opacity: 0.28 !important; filter: grayscale(0.9) !important; cursor: pointer !important; }
    `;
    if (!document.getElementById('alchemy-filter-styles')) {
      document.head.appendChild(filterStyle);
    }
    
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
          alchemyMode = false;
          alchemyFirstIngot = null;
        } else {
          alchemyMode = true;
          alchemyFirstIngot = null;
        }
        renderInventoryTab();
      });
    }
    
    // Обработчики кликов по слиткам
    if (alchemyMode) {
      document.querySelectorAll('[data-ingot]').forEach(card => {
        card.addEventListener('click', () => {
          const ingotId = card.dataset.ingot;
          const isCompatible = card.dataset.compatible === 'true';
          
          if (!alchemyFirstIngot) {
            alchemyFirstIngot = ingotId;
            renderInventoryTab();
          } else if (ingotId === alchemyFirstIngot) {
            alchemyFirstIngot = null;
            renderInventoryTab();
          } else if (isCompatible) {
            showAlchemyConfirmModal(alchemyFirstIngot, ingotId);
          } else {
            showToast('Сплав невозможен: слитки из разных локаций!', '⚠️');
          }
        });
      });
    } else {
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

// ========== ★ МОДАЛКА АЛХИМИИ С ТУМАНОМ ВОЙНЫ ★ ==========
function showAlchemyConfirmModal(ingotId1, ingotId2) {
  const state = getPlayerState();
  
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
  
  // ★ ОПРЕДЕЛЯЕМ ВИДИМОСТЬ ИНГРЕДИЕНТОВ В РЕЦЕПТЕ
  const ing1Known = state.minedStats[ingotId1] > 0;
  const ing2Known = state.minedStats[ingotId2] > 0;
  
  const ing1Display = ing1Known ? ing1.icon : '<span style="opacity:0.4; font-size:42px;">❓</span>';
  const ing2Display = ing2Known ? ing2.icon : '<span style="opacity:0.4; font-size:42px;">❓</span>';
  
  const html = `
    <style>
      @keyframes alchMergeLeft {
        0% { transform: translateX(0) scale(1); opacity: 1; }
        50% { transform: translateX(35px) scale(0.3); opacity: 0.5; }
        100% { transform: translateX(0) scale(0); opacity: 0; }
      }
      @keyframes alchMergeRight {
        0% { transform: translateX(0) scale(1); opacity: 1; }
        50% { transform: translateX(-35px) scale(0.3); opacity: 0.5; }
        100% { transform: translateX(0) scale(0); opacity: 0; }
      }
      @keyframes alchCorePulse {
        0% { transform: scale(1); box-shadow: 0 0 20px rgba(255,200,0,0.6); }
        50% { transform: scale(2.8); box-shadow: 0 0 60px rgba(255,200,0,0.9), 0 0 100px rgba(255,100,0,0.4); }
        100% { transform: scale(1); box-shadow: 0 0 20px rgba(255,200,0,0.3); }
      }
      @keyframes alchFlashOverlay {
        0% { opacity: 0; }
        35% { opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes alchResultAppear {
        0% { opacity: 0; transform: scale(0.2); }
        60% { opacity: 1; transform: scale(1.15); }
        100% { opacity: 1; transform: scale(1); }
      }
      
      .alch-bg {
        background: radial-gradient(circle at 50% 35%, rgba(28,28,33,0.98) 0%, rgba(8,8,10,0.99) 100%);
        border-radius: 32px;
        padding: 8px 0 16px;
        position: relative;
      }
      .alch-flash-layer {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: radial-gradient(circle at 50% 40%, rgba(255,255,255,0.7) 0%, rgba(255,200,0,0.3) 40%, transparent 70%);
        border-radius: 32px;
        pointer-events: none;
        opacity: 0;
        z-index: 5;
      }
      .alch-flash-layer.go {
        animation: alchFlashOverlay 0.5s ease-out forwards;
      }
      .alch-stage {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0;
        padding: 20px 0 8px;
        position: relative;
        min-height: 80px;
        z-index: 2;
      }
      .alch-ingot-slot {
        font-size: 42px;
        filter: drop-shadow(0 0 14px rgba(255,180,0,0.4));
        transition: none;
      }
      .alch-ingot-slot.merge-left {
        animation: alchMergeLeft 0.6s ease-in forwards;
      }
      .alch-ingot-slot.merge-right {
        animation: alchMergeRight 0.6s ease-in forwards;
      }
      .alch-core {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,200,0,0.85) 0%, rgba(255,100,0,0.3) 50%, transparent 70%);
        margin: 0 16px;
        transition: none;
      }
      .alch-core.pulsing {
        animation: alchCorePulse 0.6s ease-in-out;
      }
      .alch-result-zone {
        width: 90px;
        height: 90px;
        margin: 8px auto 0;
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,215,0,0.2);
        border-radius: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 40px;
        position: relative;
        z-index: 2;
        overflow: hidden;
      }
      .alch-result-zone .result-icon-animated {
        animation: alchResultAppear 0.5s ease-out forwards;
      }
      .alch-result-zone .result-mystery {
        font-size: 28px;
        color: rgba(255,255,255,0.1);
      }
      .alch-badge {
        display: inline-block;
        background: rgba(255,215,0,0.06);
        border: 1px solid rgba(255,215,0,0.18);
        border-radius: 20px;
        padding: 5px 14px;
        font-size: 11px;
        color: var(--accent-gold);
        font-weight: 600;
        margin-top: 6px;
      }
      .alch-btn {
        background: linear-gradient(135deg, #FFD700, #FF8C00);
        color: #000;
        border: none;
        padding: 14px;
        border-radius: 50px;
        font-weight: 700;
        font-size: 15px;
        cursor: pointer;
        width: 100%;
        box-shadow: 0 4px 20px rgba(255,140,0,0.25);
        margin-top: 10px;
      }
      .alch-btn:active { transform: scale(0.95); }
      .alch-cancel-btn {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.06);
        color: var(--text-secondary);
        padding: 10px;
        border-radius: 50px;
        cursor: pointer;
        width: 100%;
        margin-top: 4px;
        font-size: 13px;
      }
    </style>
    <div class="modal-header">
      <div class="modal-title" style="font-size:17px;">⚗️ Алхимия</div>
      <button class="modal-close" onclick="document.dispatchEvent(new Event('closeModal'))">✕</button>
    </div>
    <div class="modal-content">
      <div class="alch-bg">
        <div class="alch-flash-layer" id="alchFlashLayer"></div>
        <div class="alch-stage" id="alchStage">
          <div class="alch-ingot-slot" id="alchLeft">${ing1Display}</div>
          <div class="alch-core" id="alchCore"></div>
          <div class="alch-ingot-slot" id="alchRight">${ing2Display}</div>
        </div>
        <div class="alch-result-zone" id="alchResultZone">
          ${isFirstDiscovery ? '<div class="result-mystery">???</div>' : `<div class="result-icon-animated">${resultIngot.icon}</div>`}
        </div>
        <div style="text-align:center;">
          ${isFirstDiscovery 
            ? '<div style="font-size:11px;color:var(--text-muted);margin-bottom:2px;">Неизвестный сплав</div>' 
            : `<div style="font-size:12px;color:var(--text-primary);font-weight:600;">${resultIngot.name}</div>`}
          <div class="alch-badge">⚡ +${totalXP} XP</div>
          ${isFirstDiscovery ? '<div style="font-size:9px;color:#FFD700;margin-top:3px;">Первое открытие</div>' : ''}
        </div>
        <button class="alch-btn" id="confirmAlchemyBtn">Сплавить</button>
        <button class="alch-cancel-btn" id="cancelAlchemyBtn">Отмена</button>
      </div>
    </div>
  `;
  
  openModal(html);
  
  setTimeout(() => {
    document.getElementById('confirmAlchemyBtn')?.addEventListener('click', () => {
      const leftEl = document.getElementById('alchLeft');
      const rightEl = document.getElementById('alchRight');
      const coreEl = document.getElementById('alchCore');
      const flashLayer = document.getElementById('alchFlashLayer');
      
      if (leftEl) leftEl.classList.add('merge-left');
      if (rightEl) rightEl.classList.add('merge-right');
      if (coreEl) coreEl.classList.add('pulsing');
      
      setTimeout(() => {
        if (flashLayer) flashLayer.classList.add('go');
      }, 300);
      
      setTimeout(() => {
        closeModal();
        const result = performAlchemy(ingotId1, ingotId2);
        if (result.success) {
          alchemyMode = false;
          alchemyFirstIngot = null;
          if (result.isFirstDiscovery) {
            playDiscoveryAnimation(result.resultIngot, result.xpGained);
          } else {
            showToast(`Создано: ${result.resultIngot.name}! +${result.xpGained} XP`, '⚗️');
          }
          renderInventoryTab();
        } else {
          showToast(result.message, '⚠️');
        }
      }, 800);
    });
    
    document.getElementById('cancelAlchemyBtn')?.addEventListener('click', () => {
      closeModal();
    });
  }, 30);
}

// ========== ★ ТРИУМФАЛЬНОЕ ОТКРЫТИЕ ★ ==========
function playDiscoveryAnimation(ingot, xpGained) {
  if (!document.getElementById('discovery-anim-styles')) {
    const style = document.createElement('style');
    style.id = 'discovery-anim-styles';
    style.textContent = `
      @keyframes discOverlayFadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      @keyframes discCocoonPulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(255,180,0,0.6), 0 0 80px rgba(255,100,0,0.3); }
        50% { transform: scale(1.08); box-shadow: 0 0 70px rgba(255,200,0,0.9), 0 0 120px rgba(255,120,0,0.5); }
      }
      @keyframes discCocoonBreak {
        0% { transform: rotate(0deg) scale(1); opacity: 1; }
        30% { transform: rotate(180deg) scale(1.15); opacity: 1; }
        60% { transform: rotate(360deg) scale(0.6); opacity: 0.7; }
        100% { transform: rotate(540deg) scale(0.05); opacity: 0; }
      }
      @keyframes discResultReveal {
        0% { opacity: 0; transform: scale(0.1); }
        50% { opacity: 1; transform: scale(1.2); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes discParticleFly {
        0% { transform: translate(0, 0) scale(1); opacity: 1; }
        100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
      }
      @keyframes discGlowPulse {
        0%, 100% { filter: drop-shadow(0 0 20px rgba(255,215,0,0.6)); }
        50% { filter: drop-shadow(0 0 50px rgba(255,215,0,1)); }
      }
      @keyframes discIconFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      @keyframes discFlashBurst {
        0% { opacity: 0; }
        30% { opacity: 1; }
        100% { opacity: 0; }
      }
      
      .disc-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.94);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        animation: discOverlayFadeIn 0.4s ease-out;
      }
      .disc-cocoon {
        width: 130px;
        height: 130px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,200,0,0.2) 0%, rgba(255,100,0,0.1) 40%, transparent 70%);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: discCocoonPulse 1.5s ease-in-out infinite;
      }
      .disc-cocoon.breaking {
        animation: discCocoonBreak 0.8s ease-in forwards;
      }
      .disc-cocoon-core {
        font-size: 50px;
        opacity: 0.3;
      }
      .disc-result-wrapper {
        display: none;
        flex-direction: column;
        align-items: center;
        animation: discResultReveal 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }
      .disc-result-icon {
        font-size: 80px;
        animation: discGlowPulse 2s ease-in-out infinite, discIconFloat 3s ease-in-out infinite;
      }
      .disc-result-name {
        font-family: 'Unbounded', sans-serif;
        font-size: 22px;
        font-weight: 800;
        color: #FFD700;
        margin-top: 14px;
        text-shadow: 0 0 20px rgba(255,215,0,0.4);
      }
      .disc-result-xp {
        font-size: 15px;
        color: #50C878;
        margin-top: 6px;
        font-weight: 700;
      }
      .disc-result-label {
        font-size: 10px;
        color: rgba(255,255,255,0.45);
        margin-top: 10px;
        letter-spacing: 2px;
        text-transform: uppercase;
      }
      .disc-continue-btn {
        background: linear-gradient(135deg, #FFD700, #FF8C00);
        color: #000;
        border: none;
        padding: 14px 36px;
        border-radius: 50px;
        font-weight: 700;
        font-size: 15px;
        cursor: pointer;
        margin-top: 24px;
        box-shadow: 0 4px 20px rgba(255,140,0,0.3);
        transition: all 0.2s;
        opacity: 0;
        animation: discOverlayFadeIn 0.5s ease-out forwards;
        animation-delay: 1.2s;
      }
      .disc-continue-btn:active { transform: scale(0.94); }
    `;
    document.head.appendChild(style);
  }
  
  const overlay = document.createElement('div');
  overlay.className = 'disc-overlay';
  
  const cocoon = document.createElement('div');
  cocoon.className = 'disc-cocoon';
  cocoon.id = 'discCocoon';
  const core = document.createElement('div');
  core.className = 'disc-cocoon-core';
  core.textContent = '✦';
  cocoon.appendChild(core);
  overlay.appendChild(cocoon);
  
  const resultWrapper = document.createElement('div');
  resultWrapper.className = 'disc-result-wrapper';
  resultWrapper.id = 'discResultWrapper';
  
  const icon = document.createElement('div');
  icon.className = 'disc-result-icon';
  icon.textContent = ingot.icon;
  
  const name = document.createElement('div');
  name.className = 'disc-result-name';
  name.textContent = ingot.name;
  
  const xp = document.createElement('div');
  xp.className = 'disc-result-xp';
  xp.textContent = `+${xpGained} XP`;
  
  const label = document.createElement('div');
  label.className = 'disc-result-label';
  label.textContent = 'Новое алхимическое открытие';
  
  const continueBtn = document.createElement('button');
  continueBtn.className = 'disc-continue-btn';
  continueBtn.textContent = 'Продолжить';
  
  resultWrapper.appendChild(icon);
  resultWrapper.appendChild(name);
  resultWrapper.appendChild(xp);
  resultWrapper.appendChild(label);
  resultWrapper.appendChild(continueBtn);
  overlay.appendChild(resultWrapper);
  
  document.body.appendChild(overlay);
  
  setTimeout(() => {
    cocoon.classList.add('breaking');
    createExplosionParticles();
    
    setTimeout(() => {
      cocoon.style.display = 'none';
      resultWrapper.style.display = 'flex';
    }, 700);
  }, 1500);
  
  continueBtn.addEventListener('click', () => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.4s ease-out';
    setTimeout(() => overlay.remove(), 400);
  });
}

function createExplosionParticles() {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const count = 40;
  
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    const size = 3 + Math.random() * 6;
    const angle = (i / count) * Math.PI * 2;
    const distance = 80 + Math.random() * 180;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    
    particle.style.cssText = `
      position: fixed;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${Math.random() > 0.5 ? '#FFD700' : '#FF8C00'};
      pointer-events: none;
      z-index: 10002;
      left: ${cx}px;
      top: ${cy}px;
      box-shadow: 0 0 ${size * 3}px currentColor;
      animation: discParticleFly 1s cubic-bezier(0, 0.6, 0.4, 1) forwards;
      animation-delay: ${i * 0.012}s;
      --dx: ${dx}px;
      --dy: ${dy}px;
    `;
    
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1100);
  }
  
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 0%, rgba(255,200,0,0.3) 30%, transparent 60%);
    pointer-events: none;
    z-index: 10001;
    animation: discFlashBurst 0.5s ease-out forwards;
  `;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 600);
}

// ========== КОЛЛЕКЦИЯ: ПОЛОЧКИ С ИНДИКАТОРАМИ ЗНАНИЙ ==========
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
      
      // ★ ИНДИКАТОР ЗНАНИЙ (ТРИ ТОЧКИ)
      const sourceKnown = discovered || isIngotSourceKnown(ing.id);
      const usageKnown = isIngotUsageKnown(ing.id);
      
      const knowledgeDots = `
        <div style="display:flex; gap:4px; justify-content:center; margin-top:4px;">
          <div style="width:5px; height:5px; border-radius:50%; background:${discovered ? '#FFD700' : '#444'};"></div>
          <div style="width:5px; height:5px; border-radius:50%; background:${sourceKnown ? '#FFD700' : '#444'};"></div>
          <div style="width:5px; height:5px; border-radius:50%; background:${usageKnown ? '#FFD700' : '#444'};"></div>
        </div>
      `;
      
      return `
        <div class="${cardClass}" data-ingot="${ing.id}">
          <div class="card-icon" id="enc-${ing.id}"></div>
          <div class="card-name">${discovered ? ing.name : 'Неизвестный материал'}</div>
          ${tagsHtml}
          ${knowledgeDots}
          <div class="card-count-badge">${discovered ? `Добыто: ${state.minedStats[ing.id]}` : '???'}</div>
          ${discovered ? `<button class="small-btn collection-details-btn" data-ingot="${ing.id}" style="font-size:9px; padding:3px 8px; margin-top:4px;">📋 Подробнее</button>` : ''}
        </div>
      `;
    }
    
    html += '<div style="font-family:\'Unbounded\',sans-serif; font-size:16px; font-weight:700; margin:20px 0 12px; color:var(--accent-gold);">🫧 Трясина</div>';
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
    
    // ★ ОБРАБОТЧИКИ КНОПОК «ПОДРОБНЕЕ» В КОЛЛЕКЦИИ
    document.querySelectorAll('.collection-details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showItemDetails(btn.dataset.ingot);
      });
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
          ${owned ? `<button class="small-btn collection-details-btn" data-ingot="${ing.id}" style="font-size:9px; padding:3px 8px; margin-top:4px;">📋 Подробнее</button>` : ''}
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
    
    // ★ ОБРАБОТЧИКИ КНОПОК «ПОДРОБНЕЕ» В ЗАЛЕ СЛАВЫ
    document.querySelectorAll('.collection-details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showItemDetails(btn.dataset.ingot);
      });
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
        <div style="font-family:'Unbounded',sans-serif; font-size:24px; font-weight:800; color:var(--accent-gold); margin-top:4px;" id="questCooldownTimer">${cdMin}:${cdSec.toString().padStart(2, '0')}</div>
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
