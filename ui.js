// ========== UI МОДУЛЬ: ОТРИСОВКА ИНТЕРФЕЙСА ==========
import { CONFIG_ITEMS, CONFIG_GEODES, CONFIG_EXPEDITIONS, EXPEDITION_GROUPS, ALCHEMY_RECIPES, LEVELS, STATUSES, GUILD_QUESTS } from './config.js';
import { getPlayerState, getSerialForCollectible, isLocationCompleted, sellIngot, startExpedition, openBrawlOverlay, eventsManager, saveGame, devGiveXP, devGiveGeodes, devUnlockLocations, devResetGeodes, startSignalGame, exchangeSpecialGeodeForXP, openForge, sendBotNotification, registerUIFunctions, startMeteorStorm, canStartMeteorStorm, isMeteorStormOnCooldown, getMeteorCooldownRemaining, meteorStormState, buyMeteorGeode, METEOR_SHOP_ITEMS, completeQuest, refreshActiveQuests, toggleSpeedMode, getQuestCooldownRemaining, performAlchemy, isIngotSourceKnown, isIngotUsageKnown, isRecipeDiscovered, getDiscoveredKnowledge, performSynthesis, getSynthesisTargets, getSynthesisChance, getSynthesisCost, getNextEventTime } from './core.js';
import { renderIngotScreen, getBonusRecycledChance, getBonusExpeditionSpeed, getActiveBonuses, getShavings } from './ingot.js';

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

// ---------- ТЕМА ----------
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
  if (btn) btn.innerHTML = newTheme === 'dark' ? '🌙 Сменить тему (Светлая)' : '☀️ Сменить тему (Тёмная)';
}

initTheme();

// ---------- УТИЛИТЫ ----------
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
  img.onload = () => { el.innerHTML = ''; const i = document.createElement('img'); i.src = src; i.alt = ''; el.appendChild(i); };
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
  for (let s of g.stages) { if (taps >= s.minTaps && taps <= s.maxTaps) return { imagePath: s.imagePath, fallbackIcon: s.fallbackIcon }; }
  return { imagePath: g.stages[0].imagePath, fallbackIcon: g.stages[0].fallbackIcon };
}

export function showToast(msg, emoji = '✨') {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span>${emoji}</span> ${msg}`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2500);
}

export function showRewardPopup(ingot) {
  const overlay = document.getElementById('rewardPopupOverlay');
  const iconEl = document.getElementById('rewardPopupIcon');
  const nameEl = document.getElementById('rewardPopupName');
  const closeBtn = document.getElementById('rewardPopupClose');
  renderImageToElement(iconEl, ingot.imagePath, ingot.icon, ingot.fallbackColor);
  nameEl.textContent = ingot.name;
  overlay.classList.add('active');
  const closeHandler = () => { overlay.classList.remove('active'); closeBtn.removeEventListener('click', closeHandler); };
  closeBtn.addEventListener('click', closeHandler);
}

// ---------- SHOWCASE ИНВЕНТАРЯ ----------
function openInventoryShowcase(ingotId) {
  const state = getPlayerState();
  const ingot = CONFIG_ITEMS[ingotId];
  if (!ingot || state.ingots[ingotId] <= 0) return;
  const rarityColors = { 'junk': '#6b6b6b', 'recycled': '#8b7355', 'common': '#A0A0A0', 'rare': '#4A9CFF', 'epic': '#B44AFF', 'legendary': '#FFD700', 'collectible': '#FF64FF' };
  const sourceNames = { 'expedition': 'Экспедиционный', 'crafted': 'Крафтовый', 'meteor': 'Метеоритный', 'special_meteor': 'Метеоритный', 'alchemy': 'Алхимический' };
  const sourceColors = { 'expedition': '#50C878', 'crafted': '#FF8C00', 'meteor': '#FF4444', 'special_meteor': '#FF4444', 'alchemy': '#FFD700' };
  const rarityColor = rarityColors[ingot.rarityLevel] || '#A0A0A0';
  const sourceColor = sourceColors[ingot.sourceType] || '#A0A0A0';
  const sourceName = sourceNames[ingot.sourceType] || ingot.sourceType;
  let html = `<div class="showcase-image" id="showcaseImage"></div><div class="showcase-info"><div class="showcase-name">${ingot.name}</div><div style="display:flex;gap:8px;justify-content:center;margin:12px 0;"><span style="background:${rarityColor};color:#fff;padding:5px 14px;border-radius:40px;font-weight:700;font-size:12px;">${ingot.rarity}</span><span style="background:${sourceColor};color:#fff;padding:5px 14px;border-radius:40px;font-weight:700;font-size:12px;">${sourceName}</span></div><div class="showcase-description">${ingot.description}</div><div class="showcase-count">В наличии: ${state.ingots[ingotId]} шт.</div><button class="btn" id="showcaseDetailsBtn" style="margin-top:12px;" data-ingot="${ingotId}">📋 Подробнее</button></div>`;
  showcaseContent.innerHTML = html;
  renderImageToElement(document.getElementById('showcaseImage'), ingot.imagePath, ingot.icon, ingot.fallbackColor);
  showcaseContent.style.opacity = '1';
  showcaseOverlay.classList.add('active');
  setTimeout(() => { const btn = document.getElementById('showcaseDetailsBtn'); if (btn) btn.addEventListener('click', () => { closeShowcase(); showItemDetails(ingotId); }); }, 10);
}

// ---------- SHOWCASE КОЛЛЕКЦИИ ----------
function openCollectionShowcase(ingotId) {
  const state = getPlayerState();
  const ingot = CONFIG_ITEMS[ingotId];
  if (!ingot) return;
  const discovered = state.minedStats[ingotId] > 0;
  const isCollectible = ingot.isCollectible;
  const rarityColors = { 'junk': '#6b6b6b', 'recycled': '#8b7355', 'common': '#A0A0A0', 'rare': '#4A9CFF', 'epic': '#B44AFF', 'legendary': '#FFD700', 'collectible': '#FF64FF' };
  const sourceNames = { 'expedition': 'Экспедиционный', 'crafted': 'Крафтовый', 'meteor': 'Метеоритный', 'special_meteor': 'Метеоритный', 'alchemy': 'Алхимический' };
  const sourceColors = { 'expedition': '#50C878', 'crafted': '#FF8C00', 'meteor': '#FF4444', 'special_meteor': '#FF4444', 'alchemy': '#FFD700' };
  const rarityColor = rarityColors[ingot.rarityLevel] || '#A0A0A0';
  const sourceColor = sourceColors[ingot.sourceType] || '#A0A0A0';
  const sourceName = sourceNames[ingot.sourceType] || ingot.sourceType;
  let html = '';
  if (!discovered && !isCollectible) {
    const locationName = CONFIG_EXPEDITIONS[ingot.location]?.name || 'неизвестной локации';
    html = `<div class="showcase-image" id="showcaseImage"></div><div class="showcase-info"><div class="showcase-name">Неизвестный материал</div><div class="showcase-rarity common">???</div><div class="showcase-id"><span class="showcase-id-label">Статус</span><span class="showcase-id-value" style="color:var(--text-muted);">НЕ ИЗУЧЕН</span></div><div class="showcase-description">Месторождение: ${locationName}</div><div class="showcase-count">Ещё не найден</div><button class="btn" id="showcaseDetailsBtn" style="margin-top:12px;" data-ingot="${ingotId}">📋 Подробнее</button></div>`;
    showcaseContent.innerHTML = html; renderMysteryPlaceholder(document.getElementById('showcaseImage')); showcaseContent.style.opacity = '0.8';
  } else if (!discovered && isCollectible) {
    html = `<div class="showcase-image" id="showcaseImage"></div><div class="showcase-info"><div class="showcase-name">Неизвестный Артефакт</div><div class="showcase-rarity common">???</div><div class="showcase-id"><span class="showcase-id-label">Статус</span><span class="showcase-id-value" style="color:var(--text-muted);">НЕ ОТКРЫТ</span></div><div class="showcase-description">Глубины космоса хранят это сокровище.</div><div class="showcase-count">Ещё не найден</div><button class="btn" id="showcaseDetailsBtn" style="margin-top:12px;" data-ingot="${ingotId}">📋 Подробнее</button></div>`;
    showcaseContent.innerHTML = html; renderMysteryPlaceholder(document.getElementById('showcaseImage')); showcaseContent.style.opacity = '0.8';
  } else if (isCollectible) {
    const effectText = ingot.effect_name ? `<div style="font-size:12px;color:#FFD700;margin-top:8px;">✨ Бонус: ${ingot.effect_name}</div>` : '';
    html = `<div class="showcase-image" id="showcaseImage"></div><div class="showcase-info" style="border:2px solid #FFD700;box-shadow:0 0 40px rgba(255,215,0,0.6),0 0 80px rgba(180,0,255,0.4);background:linear-gradient(135deg,rgba(255,215,0,0.1) 0%,rgba(180,0,255,0.1) 100%);animation:legendaryGlow 3s ease-in-out infinite;"><div class="showcase-name" style="font-size:26px;">${ingot.name}</div><div style="display:flex;gap:8px;justify-content:center;margin:12px 0;"><span style="background:${rarityColor};color:#fff;padding:5px 14px;border-radius:40px;font-weight:700;font-size:12px;">${ingot.rarity}</span><span style="background:${sourceColor};color:#fff;padding:5px 14px;border-radius:40px;font-weight:700;font-size:12px;">${sourceName}</span></div><div style="font-size:18px;font-weight:800;color:#FFD700;margin:16px 0;text-transform:uppercase;letter-spacing:2px;">СТАТУС: ДОБЫТО В КОЛЛЕКЦИЮ СЛАВЫ</div><div class="showcase-serial"><span class="showcase-serial-label">Серийный номер</span><span class="showcase-serial-value">#${getSerialForCollectible(ingotId)}</span></div><div class="showcase-description">${ingot.description}</div>${effectText}<div style="font-size:12px;color:var(--accent-gold);margin-top:12px;">Применение: [👑 Легендарный трофей]</div><div class="showcase-count">В наличии: ${state.ingots[ingotId]} шт.</div><button class="btn" id="showcaseDetailsBtn" style="margin-top:12px;" data-ingot="${ingotId}">📋 Подробнее</button></div>`;
    showcaseContent.innerHTML = html; renderImageToElement(document.getElementById('showcaseImage'), ingot.imagePath, ingot.icon, ingot.fallbackColor); showcaseContent.style.opacity = '1';
    const styleEl = document.createElement('style'); styleEl.textContent = '@keyframes legendaryGlow{0%,100%{box-shadow:0 0 40px rgba(255,215,0,0.6),0 0 80px rgba(180,0,255,0.4)}50%{box-shadow:0 0 60px rgba(255,215,0,0.9),0 0 120px rgba(180,0,255,0.7)}}'; showcaseContent.appendChild(styleEl);
  } else {
    html = `<div class="showcase-image" id="showcaseImage"></div><div class="showcase-info"><div class="showcase-name">${ingot.name}</div><div style="display:flex;gap:8px;justify-content:center;margin:12px 0;"><span style="background:${rarityColor};color:#fff;padding:5px 14px;border-radius:40px;font-weight:700;font-size:12px;">${ingot.rarity}</span><span style="background:${sourceColor};color:#fff;padding:5px 14px;border-radius:40px;font-weight:700;font-size:12px;">${sourceName}</span></div><div class="showcase-id"><span class="showcase-id-label">Добыто за всё время</span><span class="showcase-id-value">${state.minedStats[ingotId] || 0} ед.</span></div><div class="showcase-description">${ingot.description}</div><div style="font-size:12px;color:var(--text-secondary);margin-top:8px;">Применение: [⏳ В разработке для будущих ивентов]</div><div style="font-size:12px;color:var(--accent-gold);margin-top:4px;">Опыт при продаже: +${ingot.sellValue} EXP</div><div class="showcase-count">В наличии: ${state.ingots[ingotId]} шт.</div><button class="btn" id="showcaseDetailsBtn" style="margin-top:12px;" data-ingot="${ingotId}">📋 Подробнее</button></div>`;
    showcaseContent.innerHTML = html; renderImageToElement(document.getElementById('showcaseImage'), ingot.imagePath, ingot.icon, ingot.fallbackColor); showcaseContent.style.opacity = '1';
  }
  showcaseOverlay.classList.add('active');
  setTimeout(() => { const btn = document.getElementById('showcaseDetailsBtn'); if (btn) btn.addEventListener('click', () => { closeShowcase(); showItemDetails(ingotId); }); }, 10);
}

export function closeShowcase() { showcaseOverlay.classList.remove('active'); }

// ========== ★ ЖУРНАЛ ИССЛЕДОВАТЕЛЯ ★ ==========
function showItemDetails(ingotId) {
  const state = getPlayerState();
  const ingot = CONFIG_ITEMS[ingotId];
  if (!ingot) return;
  const discovered = state.minedStats[ingotId] > 0;
  const sourceKnown = discovered || isIngotSourceKnown(ingotId);
  const usageKnown = isIngotUsageKnown(ingotId);
  const knowledgeDots = `<div style="display:flex;gap:10px;justify-content:center;margin-bottom:20px;"><div class="knowledge-dot ${discovered ? 'active' : ''}" title="${discovered ? 'Предмет найден' : 'Предмет не найден'}"></div><div class="knowledge-dot ${sourceKnown ? 'active' : ''}" title="${sourceKnown ? 'Источник известен' : 'Источник неизвестен'}"></div><div class="knowledge-dot ${usageKnown ? 'active' : ''}" title="${usageKnown ? 'Применение известно' : 'Применение неизвестно'}"></div></div>`;

  let sourceHtml = '';
  if (ingot.sourceType === 'expedition') {
    const locName = CONFIG_EXPEDITIONS[ingot.location]?.name || 'Неизвестная локация';
    const locIcon = CONFIG_EXPEDITIONS[ingot.location]?.fallbackIcon || '❓';
    const locUnlocked = state.unlockedExpeditions.includes(ingot.location);
    sourceHtml = `<div style="display:flex;flex-direction:column;align-items:center;gap:0;padding:20px 0;"><div class="journal-node journal-node-location" data-tooltip="${locName}"><span style="font-size:34px;">${locIcon}</span></div><div class="journal-connector"></div><div class="journal-node ${discovered ? 'journal-node-known' : 'journal-node-unknown'}">${discovered ? `<span style="font-size:38px;">${ingot.icon}</span>` : `<span style="font-size:38px;opacity:0.4;">❓</span>`}</div><div style="font-size:12px;color:${discovered ? 'var(--text-primary)' : 'var(--text-muted)'};margin-top:6px;font-weight:${discovered ? '600' : '400'};">${discovered ? ingot.name : '???'}</div>${!discovered && locUnlocked ? `<div style="font-size:10px;color:var(--accent-gold);margin-top:4px;letter-spacing:1px;">ОТПРАВЬТЕ ЭКСПЕДИЦИЮ</div>` : ''}</div>`;
  } else if (ingot.sourceType === 'alchemy') {
    let recipeHtml = '';
    for (let recipeId in ALCHEMY_RECIPES) {
      const recipe = ALCHEMY_RECIPES[recipeId];
      if (recipe.resultIngotId === ingotId) {
        const ing1Known = state.minedStats[recipe.ingredients[0]] > 0;
        const ing2Known = state.minedStats[recipe.ingredients[1]] > 0;
        const ing1 = CONFIG_ITEMS[recipe.ingredients[0]];
        const ing2 = CONFIG_ITEMS[recipe.ingredients[1]];
        recipeHtml = `<div style="display:flex;align-items:center;justify-content:center;gap:0;padding:20px 0;flex-wrap:wrap;"><div class="journal-node ${ing1Known ? 'journal-node-known' : 'journal-node-unknown'}" data-tooltip="${ing1Known ? ing1.name : '???'}">${ing1Known ? `<span style="font-size:30px;">${ing1.icon}</span>` : `<span style="font-size:30px;opacity:0.3;">❓</span>`}</div><div style="font-size:20px;color:var(--text-muted);margin:0 10px;font-weight:300;">+</div><div class="journal-node ${ing2Known ? 'journal-node-known' : 'journal-node-unknown'}" data-tooltip="${ing2Known ? ing2.name : '???'}">${ing2Known ? `<span style="font-size:30px;">${ing2.icon}</span>` : `<span style="font-size:30px;opacity:0.3;">❓</span>`}</div><div style="font-size:20px;color:var(--accent-gold);margin:0 10px;">→</div><div class="journal-node journal-node-result"><span style="font-size:38px;">${ingot.icon}</span></div></div><div style="text-align:center;font-size:12px;color:var(--text-primary);margin-top:4px;font-weight:600;">${ingot.name}</div><div style="text-align:center;font-size:10px;color:var(--accent-gold);margin-top:4px;letter-spacing:1px;">АЛХИМИЧЕСКИЙ СПЛАВ</div>`;
        break;
      }
    }
    sourceHtml = recipeHtml || '<div style="color:var(--text-muted);padding:20px;text-align:center;">Рецепт неизвестен</div>';
  } else if (ingot.sourceType === 'crafted') {
    const recipe = CRAFT_RECIPES[ingotId];
    if (recipe) {
      let craftHtml = '<div style="display:flex;align-items:center;justify-content:center;gap:0;padding:20px 0;flex-wrap:wrap;">';
      let first = true;
      for (let ingKey in recipe.ingredients) {
        if (!first) craftHtml += '<div style="font-size:20px;color:var(--text-muted);margin:0 10px;font-weight:300;">+</div>';
        const ingKeyIngot = CONFIG_ITEMS[ingKey];
        const ingKeyKnown = state.minedStats[ingKey] > 0;
        craftHtml += `<div class="journal-node ${ingKeyKnown ? 'journal-node-known' : 'journal-node-unknown'}" data-tooltip="${ingKeyKnown ? ingKeyIngot.name : '???'}">${ingKeyKnown ? `<span style="font-size:30px;">${ingKeyIngot.icon}</span>` : `<span style="font-size:30px;opacity:0.3;">❓</span>`}</div>`;
        first = false;
      }
      craftHtml += '<div style="font-size:20px;color:var(--accent-gold);margin:0 10px;">→</div><div class="journal-node journal-node-result"><span style="font-size:38px;">${ingot.icon}</span></div></div>';
      craftHtml += `<div style="text-align:center;font-size:12px;color:var(--text-primary);margin-top:4px;font-weight:600;">${ingot.name}</div><div style="text-align:center;font-size:10px;color:var(--accent-orange);margin-top:4px;letter-spacing:1px;">ВЕЛИКАЯ ПЕРЕПЛАВКА</div>`;
      sourceHtml = craftHtml;
    } else { sourceHtml = '<div style="color:var(--text-muted);padding:20px;text-align:center;">Рецепт неизвестен</div>'; }
  } else if (ingot.sourceType === 'meteor' || ingot.sourceType === 'special_meteor') {
    sourceHtml = `<div style="display:flex;flex-direction:column;align-items:center;gap:0;padding:20px 0;"><div class="journal-node journal-node-location" data-tooltip="Метеоритный Шторм"><span style="font-size:34px;">☄️</span></div><div class="journal-connector"></div><div class="journal-node ${discovered ? 'journal-node-known' : 'journal-node-unknown'}">${discovered ? `<span style="font-size:38px;">${ingot.icon}</span>` : `<span style="font-size:38px;opacity:0.4;">❓</span>`}</div><div style="font-size:12px;color:${discovered ? 'var(--text-primary)' : 'var(--text-muted)'};margin-top:6px;font-weight:${discovered ? '600' : '400'};">${discovered ? ingot.name : '???'}</div><div style="font-size:10px;color:var(--accent-purple);margin-top:4px;letter-spacing:1px;">МЕТЕОРИТНЫЙ ШТОРМ</div></div>`;
  }

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
      usedInRecipes.push({ otherIngId, otherIng, otherKnown, resultIng, resultKnown, recipeId });
    }
  }
  if (usedInRecipes.length > 0) {
    usedInRecipes.forEach(rec => {
      usageHtml += `<div style="display:flex;align-items:center;justify-content:center;gap:0;padding:10px 0;flex-wrap:wrap;"><div class="journal-node journal-node-known" data-tooltip="${ingot.name}"><span style="font-size:30px;">${ingot.icon}</span></div><div style="font-size:20px;color:var(--text-muted);margin:0 10px;font-weight:300;">+</div><div class="journal-node ${rec.otherKnown ? 'journal-node-known' : 'journal-node-unknown'}" data-tooltip="${rec.otherKnown ? rec.otherIng.name : '???'}">${rec.otherKnown ? `<span style="font-size:30px;">${rec.otherIng.icon}</span>` : `<span style="font-size:30px;opacity:0.3;">❓</span>`}</div><div style="font-size:20px;color:var(--accent-gold);margin:0 10px;">→</div><div class="journal-node ${rec.resultKnown ? 'journal-node-known' : 'journal-node-unknown'}" data-tooltip="${rec.resultKnown ? rec.resultIng.name : 'Неизвестный сплав'}">${rec.resultKnown ? `<span style="font-size:30px;">${rec.resultIng.icon}</span>` : `<span style="font-size:30px;opacity:0.3;">❓</span>`}</div></div>${rec.resultKnown ? `<div style="text-align:center;font-size:10px;color:var(--text-secondary);margin-top:2px;">${rec.resultIng.name}</div>` : `<div style="text-align:center;font-size:10px;color:var(--text-muted);margin-top:2px;">Неизвестный сплав</div>`}`;
    });
  } else { usageHtml = '<div style="color:var(--text-muted);padding:20px;text-align:center;font-size:13px;">Пока не используется в известных рецептах</div>'; }

  const html = `
    <style>
      @keyframes knowledgeGlow{0%,100%{box-shadow:0 0 6px rgba(255,215,0,0.3)}50%{box-shadow:0 0 14px rgba(255,215,0,0.7)}}
      @keyframes nodeGlowKnown{0%,100%{box-shadow:0 0 12px rgba(139,115,85,0.2)}50%{box-shadow:0 0 24px rgba(139,115,85,0.5)}}
      @keyframes nodeGlowResult{0%,100%{box-shadow:0 0 16px rgba(255,215,0,0.2)}50%{box-shadow:0 0 32px rgba(255,215,0,0.6)}}
      @keyframes nodeGlowLocation{0%,100%{box-shadow:0 0 12px rgba(80,200,120,0.15)}50%{box-shadow:0 0 24px rgba(80,200,120,0.4)}}
      @keyframes connectorPulse{0%,100%{opacity:0.5}50%{opacity:1}}
      .knowledge-dot{width:12px;height:12px;border-radius:50%;background:#2a2a2a;transition:all 0.4s ease;box-shadow:inset 0 1px 2px rgba(0,0,0,0.4)}.knowledge-dot.active{background:#FFD700;box-shadow:0 0 10px rgba(255,215,0,0.6),0 0 20px rgba(255,215,0,0.3);animation:knowledgeGlow 2.5s ease-in-out infinite}
      .journal-scroll{max-height:60vh;overflow-y:auto;padding:6px;scrollbar-width:thin;scrollbar-color:rgba(255,215,0,0.2) transparent}.journal-scroll::-webkit-scrollbar{width:3px}.journal-scroll::-webkit-scrollbar-track{background:transparent}.journal-scroll::-webkit-scrollbar-thumb{background:rgba(255,215,0,0.2);border-radius:10px}
      .journal-section{background:linear-gradient(135deg,rgba(0,0,0,0.35) 0%,rgba(0,0,0,0.2) 100%);border-radius:24px;padding:20px 14px;margin-bottom:16px;border:1px solid rgba(255,255,255,0.05);position:relative;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.3)}.journal-section::before{content:'';position:absolute;top:0;left:0;width:100%;height:100%;background:radial-gradient(ellipse at 50% 0%,rgba(139,115,85,0.08) 0%,transparent 70%);pointer-events:none}
      .journal-section-title{font-size:12px;font-weight:700;color:var(--accent-gold);margin-bottom:10px;text-align:center;letter-spacing:3px;text-transform:uppercase;position:relative;text-shadow:0 0 20px rgba(255,215,0,0.3)}
      .journal-node{display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:18px;cursor:pointer;transition:all 0.3s cubic-bezier(0.25,0.8,0.25,1.2);position:relative;z-index:1}.journal-node:active{transform:scale(1.12)}
      .journal-node-known{background:linear-gradient(135deg,rgba(139,115,85,0.2) 0%,rgba(139,115,85,0.1) 100%);border:2px solid rgba(139,115,85,0.5);box-shadow:0 0 18px rgba(139,115,85,0.25);animation:nodeGlowKnown 3s ease-in-out infinite}
      .journal-node-unknown{background:rgba(255,255,255,0.02);border:2px dashed rgba(255,255,255,0.08);cursor:default;box-shadow:none}.journal-node-unknown:active{transform:none}
      .journal-node-location{background:linear-gradient(135deg,rgba(80,200,120,0.15) 0%,rgba(80,200,120,0.05) 100%);border:2px solid rgba(80,200,120,0.4);box-shadow:0 0 20px rgba(80,200,120,0.2);width:64px;height:64px;border-radius:22px;animation:nodeGlowLocation 3.5s ease-in-out infinite}
      .journal-node-result{background:linear-gradient(135deg,rgba(255,215,0,0.15) 0%,rgba(255,215,0,0.05) 100%);border:2px solid rgba(255,215,0,0.6);box-shadow:0 0 28px rgba(255,215,0,0.3);width:64px;height:64px;border-radius:22px;animation:nodeGlowResult 2.8s ease-in-out infinite}
      .journal-connector{width:3px;height:28px;background:linear-gradient(to bottom,rgba(255,215,0,0.6),rgba(255,215,0,0.05));border-radius:2px;margin:6px 0;animation:connectorPulse 2s ease-in-out infinite}
      .journal-tooltip{position:fixed;background:rgba(18,18,22,0.98);backdrop-filter:blur(20px);border:1px solid rgba(255,215,0,0.5);border-radius:14px;padding:10px 16px;font-size:12px;color:#FFD700;font-weight:600;pointer-events:none;z-index:10001;box-shadow:0 12px 32px rgba(0,0,0,0.7),0 0 20px rgba(255,215,0,0.15);opacity:0;transition:opacity 0.2s ease;white-space:nowrap;letter-spacing:0.5px}.journal-tooltip.show{opacity:1}
    </style>
    <div class="modal-header"><div class="modal-title" style="display:flex;align-items:center;gap:12px;justify-content:center;"><span style="font-size:32px;">${discovered ? ingot.icon : '❓'}</span><span style="font-size:18px;">${discovered ? ingot.name : 'Неизвестный материал'}</span></div><button class="modal-close" onclick="document.dispatchEvent(new Event('closeModal'))">✕</button></div>
    <div class="modal-content">${knowledgeDots}<div class="journal-scroll"><div class="journal-section"><div class="journal-section-title">🔍 Источник</div>${sourceHtml}</div><div class="journal-section"><div class="journal-section-title">⚒️ Применение в сплавах</div>${usageHtml}</div>${discovered ? `<div style="text-align:center;padding:12px;color:var(--text-secondary);font-size:12px;line-height:1.6;background:rgba(0,0,0,0.15);border-radius:16px;margin-top:4px;">${ingot.description}</div>` : `<div style="text-align:center;padding:12px;color:var(--text-muted);font-size:11px;background:rgba(0,0,0,0.15);border-radius:16px;margin-top:4px;letter-spacing:1px;">ОТПРАВЬТЕ ЭКСПЕДИЦИЮ В УКАЗАННУЮ ЛОКАЦИЮ</div>`}</div></div>
  `;
  openModal(html);
  setTimeout(() => { initJournalTooltips(); }, 50);
}

// ========== ТУЛТИПЫ ЖУРНАЛА ==========
let activeTooltip = null;
function initJournalTooltips() {
  if (activeTooltip) { activeTooltip.remove(); activeTooltip = null; }
  const tooltip = document.createElement('div'); tooltip.className = 'journal-tooltip'; tooltip.id = 'journalTooltip'; document.body.appendChild(tooltip);
  document.querySelectorAll('.journal-node[data-tooltip]').forEach(node => {
    if (node.classList.contains('journal-node-unknown')) return;
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = node.dataset.tooltip; if (!text || text === '???') return;
      const rect = node.getBoundingClientRect();
      tooltip.textContent = text; tooltip.style.left = (rect.left + rect.width/2 - tooltip.offsetWidth/2) + 'px'; tooltip.style.top = (rect.top - 44) + 'px'; tooltip.classList.add('show');
      clearTimeout(tooltip._timeout); tooltip._timeout = setTimeout(() => { tooltip.classList.remove('show'); }, 1600);
    });
  });
}

// ========== ★ СИСТЕМА «КОНТРАКТ» (СИНТЕЗ) ★ ==========
function showContractModal() {
  const state = getPlayerState();
  const currentShavings = getShavings();
  
  // Собираем все доступные для синтеза слитки
  const allIngots = Object.entries(state.ingots)
    .filter(([id, count]) => count > 0 && !CONFIG_ITEMS[id].isCollectible)
    .map(([id, count]) => ({ id, count, ingot: CONFIG_ITEMS[id] }));
  
  if (allIngots.length === 0) {
    showToast('Нет слитков для синтеза!', '⚠️');
    return;
  }
  
  const html = `
    <style>
      @keyframes slotGlow{0%,100%{box-shadow:0 0 8px rgba(255,215,0,0.2)}50%{box-shadow:0 0 20px rgba(255,215,0,0.6)}}
      @keyframes slotPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
      @keyframes gaugeRace{0%{width:0%}}
      @keyframes successBurst{0%{opacity:0;transform:scale(0.3)}50%{opacity:1;transform:scale(1.2)}100%{opacity:1;transform:scale(1)}}
      @keyframes failDisappear{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(0.2) rotate(180deg)}}
      @keyframes particleFly{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--sx),var(--sy)) scale(0);opacity:0}}
      
      .contract-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:500;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;box-sizing:border-box}
      .contract-card{width:100%;max-width:380px;background:linear-gradient(135deg,rgba(20,20,25,0.98) 0%,rgba(10,10,15,0.99) 100%);border-radius:28px;padding:24px 18px;border:1px solid rgba(255,215,0,0.15);box-shadow:0 20px 60px rgba(0,0,0,0.5);position:relative;overflow:hidden}
      .contract-card::before{content:'';position:absolute;top:0;left:0;width:100%;height:100%;background:radial-gradient(ellipse at 50% 0%,rgba(255,215,0,0.04) 0%,transparent 70%);pointer-events:none}
      .contract-title{text-align:center;font-family:'Unbounded',sans-serif;font-size:18px;font-weight:800;color:var(--accent-gold);margin-bottom:6px;letter-spacing:2px;text-transform:uppercase}
      .contract-subtitle{text-align:center;font-size:11px;color:var(--text-secondary);margin-bottom:20px}
      
      .contract-slots{display:flex;gap:8px;justify-content:center;margin-bottom:16px;flex-wrap:wrap}
      .contract-slot{width:56px;height:56px;border-radius:16px;background:rgba(255,255,255,0.03);border:2px dashed rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.25s ease;font-size:22px;color:rgba(255,215,0,0.3);position:relative}
      .contract-slot:active{transform:scale(0.92)}
      .contract-slot.filled{border:2px solid rgba(139,115,85,0.5);background:rgba(139,115,85,0.1);animation:slotGlow 2s ease-in-out infinite;font-size:28px}
      .contract-slot.locked{opacity:0.25;cursor:not-allowed;border-color:rgba(255,255,255,0.03)}.contract-slot.locked:active{transform:none}
      
      .contract-chance{text-align:center;margin:10px 0}
      .contract-chance-label{font-size:11px;color:var(--text-secondary)}
      .contract-chance-value{font-family:'Unbounded',sans-serif;font-size:36px;font-weight:800}
      .contract-chance-bar-outer{width:100%;height:8px;background:rgba(255,255,255,0.05);border-radius:10px;overflow:hidden;margin-top:6px}
      .contract-chance-bar-inner{height:100%;border-radius:10px;transition:width 0.4s ease}
      
      .contract-cost{text-align:center;font-size:11px;color:var(--text-muted);margin:8px 0}
      .contract-cost span{color:var(--accent-gold);font-weight:700}
      
      .contract-btn{display:block;width:100%;padding:18px;border:none;border-radius:60px;font-family:'Unbounded',sans-serif;font-weight:800;font-size:16px;letter-spacing:2px;cursor:pointer;text-transform:uppercase;color:#000;transition:all 0.25s ease;margin-top:12px}
      .contract-btn:active{transform:scale(0.94)}
      .contract-btn.ready{background:linear-gradient(135deg,#FFD700,#FF8C00);box-shadow:0 0 30px rgba(255,215,0,0.4);animation:slotPulse 2s ease-in-out infinite}
      .contract-btn:disabled{opacity:0.25;cursor:not-allowed;background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.2);animation:none;box-shadow:none}
      
      .contract-exit-btn{display:block;width:100%;padding:12px;border:1px solid rgba(255,255,255,0.08);border-radius:50px;background:rgba(255,255,255,0.03);color:var(--text-secondary);font-weight:600;font-size:13px;cursor:pointer;margin-top:8px;transition:all 0.2s}
      .contract-exit-btn:active{background:rgba(255,255,255,0.06)}
      
      .contract-picker-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:510;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box}
      .contract-picker-card{width:100%;max-width:340px;background:rgba(18,18,22,0.98);border-radius:24px;padding:20px 16px;border:1px solid rgba(255,215,0,0.15);max-height:70vh;overflow-y:auto}
      .contract-picker-title{font-family:'Unbounded',sans-serif;font-size:14px;font-weight:700;color:var(--accent-gold);text-align:center;margin-bottom:14px}
      .contract-picker-item{display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(0,0,0,0.2);border-radius:14px;cursor:pointer;margin-bottom:6px;transition:all 0.2s;border:1px solid transparent}
      .contract-picker-item:active{background:rgba(255,215,0,0.05);border-color:rgba(255,215,0,0.3)}
      .contract-picker-item.locked{opacity:0.25;cursor:not-allowed}.contract-picker-item.locked:active{background:rgba(0,0,0,0.2);border-color:transparent}
      .contract-picker-close{display:block;width:100%;padding:10px;border:1px solid rgba(255,255,255,0.08);border-radius:50px;background:transparent;color:var(--text-secondary);font-weight:600;font-size:13px;cursor:pointer;margin-top:12px;text-align:center}
      
      .contract-result-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:520;display:flex;align-items:center;justify-content:center;flex-direction:column}
      .contract-result-icon{font-size:80px;animation:successBurst 0.6s cubic-bezier(0.175,0.885,0.32,1.275) forwards}
      .contract-result-text{font-family:'Unbounded',sans-serif;font-size:20px;font-weight:800;color:#FFD700;margin-top:16px}
      .contract-particle{position:fixed;width:8px;height:8px;border-radius:50%;pointer-events:none;z-index:521;animation:particleFly 0.8s ease-out forwards}
    </style>
    <div class="contract-overlay" id="contractOverlay">
      <div class="contract-card">
        <div class="contract-title">⚗️ КОНТРАКТ СИНТЕЗА</div>
        <div class="contract-subtitle">Выберите слитки для превращения</div>
        <div class="contract-slots" id="contractSlots">
          <div class="contract-slot" data-slot="0">+</div>
          <div class="contract-slot" data-slot="1">+</div>
          <div class="contract-slot" data-slot="2">+</div>
          <div class="contract-slot" data-slot="3">+</div>
          <div class="contract-slot" data-slot="4">+</div>
        </div>
        <div class="contract-chance">
          <div class="contract-chance-label">Шанс успеха</div>
          <div class="contract-chance-value" id="contractChanceValue" style="color:#FF4444;">0%</div>
          <div class="contract-chance-bar-outer"><div class="contract-chance-bar-inner" id="contractChanceBar" style="width:0%;background:#FF4444;"></div></div>
        </div>
        <div class="contract-cost">Стоимость: <span id="contractCostValue">0</span> стружки</div>
        <div style="text-align:center;font-size:10px;color:var(--text-secondary);margin-bottom:4px;">
          Цель: <span id="contractTargetDisplay" style="color:var(--accent-gold);">—</span>
        </div>
        <button class="contract-btn" id="contractStartBtn" disabled>СИНТЕЗ (0 💫)</button>
        <button class="contract-exit-btn" id="contractExitBtn">Закрыть</button>
      </div>
    </div>
  `;
  
  // Удаляем старый оверлей если есть
  const existing = document.getElementById('contractOverlay');
  if (existing) existing.remove();
  
  document.body.insertAdjacentHTML('beforeend', html);
  
  // Состояние контракта
  let selectedIngotId = null;
  let selectedCount = 0;
  let selectedTarget = null;
  const maxSlots = 5;
  
  const overlay = document.getElementById('contractOverlay');
  const chanceValue = document.getElementById('contractChanceValue');
  const chanceBar = document.getElementById('contractChanceBar');
  const costValue = document.getElementById('contractCostValue');
  const targetDisplay = document.getElementById('contractTargetDisplay');
  const startBtn = document.getElementById('contractStartBtn');
  
  function updateUI() {
    const chance = getSynthesisChance(selectedCount);
    const cost = getSynthesisCost(selectedCount);
    
    chanceValue.textContent = chance + '%';
    chanceValue.style.color = chance >= 60 ? '#50C878' : chance >= 30 ? '#FFA500' : '#FF4444';
    chanceBar.style.width = chance + '%';
    chanceBar.style.background = chance >= 60 ? 'linear-gradient(90deg,#50C878,#00FF88)' : chance >= 30 ? 'linear-gradient(90deg,#FFA500,#FFD700)' : 'linear-gradient(90deg,#FF4444,#FF0000)';
    costValue.textContent = cost;
    
    if (selectedTarget) {
      targetDisplay.textContent = selectedTarget.name + ' ' + selectedTarget.icon;
    } else {
      targetDisplay.textContent = '—';
    }
    
    const canAfford = selectedCount > 0 && selectedIngotId && (state.ingots[selectedIngotId] || 0) >= selectedCount && getShavings() >= cost;
    startBtn.disabled = !canAfford;
    startBtn.textContent = selectedCount > 0 ? `СИНТЕЗ (${cost} 💫)` : 'СИНТЕЗ (0 💫)';
    if (canAfford) { startBtn.classList.add('ready'); } else { startBtn.classList.remove('ready'); }
  }
  
  function fillSlots() {
    const slots = document.querySelectorAll('.contract-slot');
    slots.forEach((slot, i) => {
      if (i < selectedCount) {
        slot.classList.add('filled');
        slot.textContent = selectedIngotId ? CONFIG_ITEMS[selectedIngotId].icon : '+';
      } else if (selectedCount > 0 && i >= selectedCount) {
        slot.classList.add('locked');
        slot.textContent = '🔒';
      } else {
        slot.classList.remove('filled', 'locked');
        slot.textContent = '+';
      }
    });
  }
  
  // Обработчики слотов
  document.querySelectorAll('.contract-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      if (slot.classList.contains('locked')) return;
      if (selectedIngotId && !slot.classList.contains('filled')) {
        // Добавляем ещё один слот того же типа
        const available = state.ingots[selectedIngotId] || 0;
        if (selectedCount < available && selectedCount < maxSlots) {
          selectedCount++;
          fillSlots();
          updateUI();
        } else if (selectedCount >= available) {
          showToast(`Больше нет ${CONFIG_ITEMS[selectedIngotId].name}!`, '⚠️');
        }
        return;
      }
      if (slot.classList.contains('filled')) {
        // Убираем этот слот и все после него
        const slotIndex = parseInt(slot.dataset.slot);
        selectedCount = slotIndex;
        if (selectedCount === 0) { selectedIngotId = null; selectedTarget = null; }
        fillSlots();
        updateUI();
        return;
      }
      // Первый выбор — открываем пикер
      showContractPicker();
    });
  });
  
  function showContractPicker() {
    // Убираем старый пикер
    const existingPicker = document.getElementById('contractPickerOverlay');
    if (existingPicker) existingPicker.remove();
    
    let itemsHtml = '';
    allIngots.forEach(({ id, count, ingot }) => {
      const targets = getSynthesisTargets(id);
      const hasTarget = targets.length > 0;
      const isLocked = selectedIngotId && id !== selectedIngotId;
      
      itemsHtml += `
        <div class="contract-picker-item ${isLocked ? 'locked' : ''}" data-ingot="${id}">
          <span style="font-size:28px;">${ingot.icon}</span>
          <div style="flex:1;text-align:left;">
            <div style="font-weight:600;font-size:13px;color:#fff;">${ingot.name}</div>
            <div style="font-size:10px;color:var(--text-secondary);">${count} шт. · ${ingot.rarity}</div>
            ${hasTarget ? `<div style="font-size:9px;color:var(--accent-gold);margin-top:2px;">→ ${getSynthesisTargets(id).map(t => t.icon).join('')} ${getSynthesisTargets(id).map(t => t.name).join(', ')}</div>` : '<div style="font-size:9px;color:#FF4444;">Нет цели</div>'}
          </div>
        </div>
      `;
    });
    
    const pickerHTML = `
      <div class="contract-picker-overlay" id="contractPickerOverlay">
        <div class="contract-picker-card">
          <div class="contract-picker-title">Выберите слиток</div>
          ${itemsHtml}
          <div class="contract-picker-close" id="contractPickerClose">Отмена</div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', pickerHTML);
    
    document.querySelectorAll('.contract-picker-item:not(.locked)').forEach(item => {
      item.addEventListener('click', () => {
        const ingotId = item.dataset.ingot;
        const hasTarget = getSynthesisTargets(ingotId).length > 0;
        if (!hasTarget) return;
        
        selectedIngotId = ingotId;
        selectedCount = 1;
        const targets = getSynthesisTargets(ingotId);
        selectedTarget = targets[0];
        
        fillSlots();
        updateUI();
        
        document.getElementById('contractPickerOverlay')?.remove();
      });
    });
    
    document.getElementById('contractPickerClose')?.addEventListener('click', () => {
      document.getElementById('contractPickerOverlay')?.remove();
    });
    
    document.getElementById('contractPickerOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'contractPickerOverlay') {
        document.getElementById('contractPickerOverlay')?.remove();
      }
    });
  }
  
  // Кнопка СИНТЕЗ
  startBtn.addEventListener('click', () => {
    if (!selectedIngotId || !selectedTarget || selectedCount <= 0) return;
    const cost = getSynthesisCost(selectedCount);
    if (getShavings() < cost) { showToast('Недостаточно стружки!', '⚠️'); return; }
    
    overlay.style.display = 'none';
    playContractAnimation(selectedIngotId, selectedCount, selectedTarget.id);
  });
  
  // Кнопка Закрыть
  document.getElementById('contractExitBtn')?.addEventListener('click', () => {
    overlay.remove();
    document.getElementById('contractPickerOverlay')?.remove();
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
      document.getElementById('contractPickerOverlay')?.remove();
    }
  });
  
  updateUI();
}

// ========== ★ АНИМАЦИЯ СИНТЕЗА ★ ==========
function playContractAnimation(ingotId, count, targetId) {
  const ingot = CONFIG_ITEMS[ingotId];
  const target = CONFIG_ITEMS[targetId];
  const chance = getSynthesisChance(count);
  const cost = getSynthesisCost(count);
  
  const overlay = document.createElement('div');
  overlay.className = 'contract-result-overlay';
  overlay.style.background = 'radial-gradient(circle at 50% 40%, rgba(20,10,0,0.98) 0%, rgba(0,0,0,0.98) 100%)';
  
  const iconsContainer = document.createElement('div');
  iconsContainer.style.cssText = 'display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;justify-content:center;';
  for (let i = 0; i < count; i++) {
    const icon = document.createElement('span');
    icon.textContent = ingot.icon;
    icon.style.cssText = 'font-size:36px;transition:all 0.5s ease;';
    icon.style.animation = 'successBurst 0.5s ease forwards';
    icon.style.animationDelay = (i * 0.1) + 's';
    iconsContainer.appendChild(icon);
  }
  overlay.appendChild(iconsContainer);
  
  const gaugeOuter = document.createElement('div');
  gaugeOuter.style.cssText = 'width:70%;max-width:260px;height:14px;background:rgba(255,255,255,0.05);border-radius:10px;overflow:hidden;margin:16px 0;';
  const gaugeInner = document.createElement('div');
  gaugeInner.style.cssText = 'height:100%;border-radius:10px;transition:width 0.8s cubic-bezier(0.25,0.8,0.25,1.2);width:0%;';
  gaugeInner.style.background = chance >= 60 ? 'linear-gradient(90deg,#50C878,#00FF88)' : chance >= 30 ? 'linear-gradient(90deg,#FFA500,#FFD700)' : 'linear-gradient(90deg,#FF4444,#FF0000)';
  gaugeOuter.appendChild(gaugeInner);
  overlay.appendChild(gaugeOuter);
  
  const chanceText = document.createElement('div');
  chanceText.style.cssText = 'font-family:Unbounded,sans-serif;font-size:28px;font-weight:800;color:#FFD700;margin-bottom:8px;';
  chanceText.textContent = chance + '%';
  overlay.appendChild(chanceText);
  
  const labelText = document.createElement('div');
  labelText.style.cssText = 'font-size:13px;color:var(--text-secondary);';
  labelText.textContent = 'Шанс успеха';
  overlay.appendChild(labelText);
  
  document.body.appendChild(overlay);
  
  setTimeout(() => { gaugeInner.style.width = chance + '%'; }, 300);
  
  setTimeout(() => {
    const result = performSynthesis(ingotId, count, targetId);
    
    if (result.success) {
      gaugeInner.style.background = 'linear-gradient(90deg,#50C878,#00FF88)';
      chanceText.textContent = 'УСПЕХ!';
      chanceText.style.color = '#50C878';
      labelText.textContent = `Получен: ${result.target.name}`;
      spawnContractParticles('success');
      setTimeout(() => {
        iconsContainer.innerHTML = '';
        const resultIcon = document.createElement('span');
        resultIcon.textContent = result.target.icon;
        resultIcon.style.cssText = 'font-size:72px;animation:successBurst 0.6s cubic-bezier(0.175,0.885,0.32,1.275) forwards;';
        iconsContainer.appendChild(resultIcon);
      }, 400);
    } else {
      gaugeInner.style.background = 'linear-gradient(90deg,#FF4444,#FF0000)';
      chanceText.textContent = 'НЕУДАЧА';
      chanceText.style.color = '#FF4444';
      labelText.textContent = 'Материалы распались';
      spawnContractParticles('fail');
      setTimeout(() => {
        iconsContainer.querySelectorAll('span').forEach((icon, i) => {
          icon.style.transform = 'scale(0) rotate(180deg)';
          icon.style.opacity = '0';
          icon.style.transition = 'all 0.4s ease-in';
          icon.style.transitionDelay = (i * 0.05) + 's';
        });
      }, 300);
    }
    
    const closeOverlay = () => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.4s ease-out';
      setTimeout(() => overlay.remove(), 400);
    };
    overlay.addEventListener('click', closeOverlay);
    setTimeout(closeOverlay, 3000);
    
    import('./ui.js').then(ui => {
      if (ui.currentTab === 'inventory') ui.renderInventoryTab();
      if (ui.currentTab === 'ingot') ui.renderIngotScreen(mainContent);
    });
  }, 1500);
}

function spawnContractParticles(type) {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const count = type === 'success' ? 30 : 20;
  const color = type === 'success' ? '#FFD700' : '#FF4444';
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'contract-particle';
    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 140;
    const sx = Math.cos(angle) * distance;
    const sy = Math.sin(angle) * distance;
    particle.style.cssText = `left:${cx}px;top:${cy}px;background:${color};box-shadow:0 0 ${type==='success'?'12':'6'}px ${color};--sx:${sx}px;--sy:${sy}px;width:${type==='success'?'8':'5'}px;height:${type==='success'?'8':'5'}px;`;
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 900);
  }
  if (type === 'success') {
    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle at 50% 50%,rgba(255,255,255,0.6) 0%,transparent 70%);pointer-events:none;z-index:521;animation:successBurst 0.4s ease-out forwards;';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
  }
}
