// ============================================================
// CONFIG.JS — ГЛОБАЛЬНАЯ КОНФИГУРАЦИЯ ИГРЫ «ЗВЕЗДНАЯ КУЗНИЦА»
// Версия: Альфа 0.10 (Глобальный билд)
// ============================================================
// ДИЗАЙНЕРСКИЕ РЕШЕНИЯ:
// 1. 6 эпох × 6 локаций = 36 уникальных биомов
// 2. Каждая эпоха в 2.5x дороже предыдущей — плавная кривая
// 3. 200+ слитков: от хлама до мифических артефактов
// 4. Перекрёстные рецепты между эпохами — стимул возвращаться
// 5. Коллекционные артефакты с уникальными бонусами
// 6. 150+ заказов Гильдии с прогрессией по эпохам
// ============================================================

// ============================================================
// ЭПОХИ ИГРЫ
// ============================================================
export const ERAS = {
  mire: {
    id: 'mire', name: 'Трясина', icon: '🫧', color: '#8B7355',
    description: 'Стартовый биом. Грязевые отложения и гнилые леса.',
    levelRange: [1, 10], costMultiplier: 1, xpMultiplier: 1
  },
  wildlands: {
    id: 'wildlands', name: 'Дикие Земли', icon: '🌋', color: '#FF6B35',
    description: 'Вулканические пустоши и каменные пустыни.',
    levelRange: [11, 25], costMultiplier: 2.5, xpMultiplier: 2.5
  },
  deepcaverns: {
    id: 'deepcaverns', name: 'Глубинные Пещеры', icon: '🕳️', color: '#455A64',
    description: 'Подземные озёра и кристаллические гроты.',
    levelRange: [26, 42], costMultiplier: 6, xpMultiplier: 6
  },
  industrial: {
    id: 'industrial', name: 'Индустриальная Эра', icon: '⚙️', color: '#607D8B',
    description: 'Ржавые заводы и техногенные свалки.',
    levelRange: [43, 60], costMultiplier: 15, xpMultiplier: 15
  },
  astral: {
    id: 'astral', name: 'Астральные Миры', icon: '🌌', color: '#7C4DFF',
    description: 'Космические аномалии и звёздные туманности.',
    levelRange: [61, 80], costMultiplier: 35, xpMultiplier: 35
  },
  transcendence: {
    id: 'transcendence', name: 'Трансценденция', icon: '♾️', color: '#FFD700',
    description: 'За гранью реальности. Чистая энергия творения.',
    levelRange: [81, 100], costMultiplier: 80, xpMultiplier: 80
  }
};

// ============================================================
// ГЕНЕРАТОР ПРЕДМЕТОВ (шаблоны для каждой эпохи)
// ============================================================
function createEraItems(eraId, eraConfig, locationDefs) {
  const items = {};
  const era = ERAS[eraId];
  
  locationDefs.forEach(loc => {
    loc.items.forEach(item => {
      const fullId = item.id;
      items[fullId] = {
        id: fullId,
        name: item.name,
        icon: item.icon,
        rarity: item.rarity,
        rarityClass: item.rarityClass,
        rarityLevel: item.rarityLevel,
        sourceType: 'expedition',
        location: loc.id,
        era: eraId,
        glowClass: item.glowClass || 'glow-common',
        description: item.description,
        imagePath: `assets/ingots/${fullId}.png`,
        fallbackColor: item.fallbackColor || '#888888',
        isCollectible: false,
        xpValue: Math.floor(item.baseXP * eraConfig.xpMultiplier),
        sellValue: Math.floor(item.baseSell * eraConfig.xpMultiplier)
      };
    });
  });
  
  return items;
}

// ============================================================
// ВСЕ ПРЕДМЕТЫ ИГРЫ (СЛИТКИ)
// ============================================================
export const CONFIG_ITEMS = {};

// ============================================================
// ЭПОХА 1: ТРЯСИНА (уровни 1-10) — 6 локаций
// ============================================================
const MIRE_ITEMS = createEraItems('mire', ERAS['mire'], [
  {
    id: 'swamp',
    items: [
      { id: 'wet_sand', name: 'Влажный песок', icon: '🏖️', rarity: 'Хлам', rarityClass: 'junk', rarityLevel: 'junk', glowClass: 'glow-junk', description: 'Мокрый песок со дна болота. Слишком грязный даже для стекла, но опытный кузнец найдёт ему применение.', fallbackColor: '#8B7D6B', baseXP: 2, baseSell: 2 },
      { id: 'mud_ingot', name: 'Слиток грязи', icon: '🟤', rarity: 'Хлам', rarityClass: 'junk', rarityLevel: 'junk', glowClass: 'glow-junk', description: 'Спрессованная болотная жижа. Выглядит отвратительно, но после просушки держит форму.', fallbackColor: '#5C4A3A', baseXP: 2, baseSell: 2 },
      { id: 'silt_clump', name: 'Тинистый ком', icon: '🟢', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Комок спрессованного ила с вкраплениями органики. Можно переплавить во что-то приличное.', fallbackColor: '#4A5D3A', baseXP: 8, baseSell: 8 }
    ]
  },
  {
    id: 'rotforest',
    items: [
      { id: 'warped_bar', name: 'Корявый брусок', icon: '🪵', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Покорёженный кусок древесного металла. Природа попыталась создать сплав — получилось криво, но прочно.', fallbackColor: '#6B4E3D', baseXP: 10, baseSell: 10 },
      { id: 'bark_ingot', name: 'Слиток коры', icon: '🧱', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Окаменевшая кора, пропитанная минералами. Твёрже дерева, легче камня.', fallbackColor: '#5D4E37', baseXP: 10, baseSell: 10 },
      { id: 'rotted_bough', name: 'Сгнивший сук', icon: '🦴', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Сук древнего дерева, частично обратившийся в труху, но сохранивший металлический блеск сердцевины.', fallbackColor: '#4A3C2A', baseXP: 10, baseSell: 10 }
    ]
  },
  {
    id: 'rustbottom',
    items: [
      { id: 'rusty_scrap', name: 'Ржавый металлолом', icon: '🔩', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', glowClass: 'glow-common', description: 'Кусок проржавевшего металла со дна высохшего озера. Под слоем ржавчины скрывается пригодная сталь.', fallbackColor: '#8B4513', baseXP: 20, baseSell: 20 },
      { id: 'wire_clump', name: 'Комок проволоки', icon: '🧶', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Спутанный моток медной проволоки. Местами окислена, но после очистки — ценный материал.', fallbackColor: '#CD7F32', baseXP: 12, baseSell: 12 },
      { id: 'broken_tile', name: 'Битый кафель', icon: '🧩', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Осколок керамической плитки неизвестного происхождения. Кто-то строил здесь задолго до нас.', fallbackColor: '#C0C0C0', baseXP: 12, baseSell: 12 }
    ]
  },
  {
    id: 'mossycave',
    items: [
      { id: 'moss_clump', name: 'Мшистый ком', icon: '🌿', rarity: 'Хлам', rarityClass: 'junk', rarityLevel: 'junk', glowClass: 'glow-junk', description: 'Комок болотного мха, пропитанный минералами. Мягкий, но упругий.', fallbackColor: '#228B22', baseXP: 3, baseSell: 3 },
      { id: 'glow_spore', name: 'Светящаяся спора', icon: '🔮', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Спора гигантского гриба. Слабо светится в темноте зелёным светом.', fallbackColor: '#00FF00', baseXP: 14, baseSell: 14 },
      { id: 'cave_resin', name: 'Пещерная смола', icon: '🍯', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Древняя окаменевшая смола с вкраплениями насекомых.', fallbackColor: '#DAA520', baseXP: 14, baseSell: 14 }
    ]
  },
  {
    id: 'peatbog',
    items: [
      { id: 'peat_block', name: 'Торфяной блок', icon: '🟫', rarity: 'Хлам', rarityClass: 'junk', rarityLevel: 'junk', glowClass: 'glow-junk', description: 'Спрессованный торф. Горит медленно, но жарко.', fallbackColor: '#3E2723', baseXP: 3, baseSell: 3 },
      { id: 'bog_iron', name: 'Болотное железо', icon: '⛏️', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Самородное железо, образовавшееся в кислой среде болота.', fallbackColor: '#8B6914', baseXP: 16, baseSell: 16 },
      { id: 'amber_chunk', name: 'Янтарный кусок', icon: '🟠', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', glowClass: 'glow-common', description: 'Крупный кусок янтаря с застывшим внутри существом.', fallbackColor: '#FF8C00', baseXP: 25, baseSell: 25 }
    ]
  },
  {
    id: 'willowgrove',
    items: [
      { id: 'willow_bark', name: 'Ивовая кора', icon: '🌳', rarity: 'Хлам', rarityClass: 'junk', rarityLevel: 'junk', glowClass: 'glow-junk', description: 'Кора плакучей ивы. Гибкая и прочная, используется для плетения.', fallbackColor: '#556B2F', baseXP: 3, baseSell: 3 },
      { id: 'sap_glob', name: 'Древесный сгусток', icon: '💧', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Застывший древесный сок. Липкий, но после обработки — отличный клей.', fallbackColor: '#FFD700', baseXP: 15, baseSell: 15 },
      { id: 'root_fiber', name: 'Корневое волокно', icon: '🧵', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', glowClass: 'glow-common', description: 'Прочнейшее волокно из корней древней ивы. Крепче стали.', fallbackColor: '#8B4513', baseXP: 22, baseSell: 22 }
    ]
  }
]);
Object.assign(CONFIG_ITEMS, MIRE_ITEMS);

// ============================================================
// ЭПОХА 2: ДИКИЕ ЗЕМЛИ (уровни 11-25) — 6 локаций
// ============================================================
const WILDLANDS_ITEMS = createEraItems('wildlands', ERAS['wildlands'], [
  {
    id: 'ashwaste',
    items: [
      { id: 'cinder_chunk', name: 'Пепельный осколок', icon: '🪶', rarity: 'Хлам', rarityClass: 'junk', rarityLevel: 'junk', glowClass: 'glow-junk', description: 'Лёгкий как перо, но острый как стекло. Вулканический пепел, спрессованный тысячелетиями.', fallbackColor: '#4A4A4A', baseXP: 4, baseSell: 4 },
      { id: 'smolder_core', name: 'Тлеющее ядро', icon: '🔥', rarity: 'Хлам', rarityClass: 'junk', rarityLevel: 'junk', glowClass: 'glow-junk', description: 'Камень, который до сих пор тёплый. Внутри пульсирует застывшая магма.', fallbackColor: '#8B4513', baseXP: 4, baseSell: 4 },
      { id: 'ember_dust', name: 'Угольная пыль', icon: '✨', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Мелкодисперсная пыль, которая вспыхивает от малейшего трения.', fallbackColor: '#FF4500', baseXP: 16, baseSell: 16 }
    ]
  },
  {
    id: 'stonedesert',
    items: [
      { id: 'grit_chunk', name: 'Щебень пустоши', icon: '🪨', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Осколки породы, отшлифованные песчаными бурями до зеркального блеска.', fallbackColor: '#A0A0A0', baseXP: 20, baseSell: 20 },
      { id: 'sand_brick', name: 'Песчаный кирпич', icon: '🧱', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Спрессованный пустынный песок. Твёрже бетона, но рассыпается в воде.', fallbackColor: '#D2B48C', baseXP: 20, baseSell: 20 },
      { id: 'fossil_fragment', name: 'Окаменелость', icon: '🦴', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Фрагмент древнего существа, обратившегося в камень миллионы лет назад.', fallbackColor: '#8B7355', baseXP: 20, baseSell: 20 }
    ]
  },
  {
    id: 'saltcaves',
    items: [
      { id: 'salt_crystal', name: 'Соляной кристалл', icon: '💎', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', glowClass: 'glow-common', description: 'Чистейший кристалл каменной соли, выросший в абсолютной темноте.', fallbackColor: '#FFFFFF', baseXP: 35, baseSell: 35 },
      { id: 'brine_pearl', name: 'Рассольная жемчужина', icon: '🫧', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Сфера из концентрированного рассола. Мерцает влажным блеском.', fallbackColor: '#E0FFFF', baseXP: 24, baseSell: 24 },
      { id: 'cave_shell', name: 'Пещерный панцирь', icon: '🐚', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Хитиновый панцирь пещерного организма. Твёрже керамики.', fallbackColor: '#F5DEB3', baseXP: 24, baseSell: 24 }
    ]
  },
  {
    id: 'magmafissure',
    items: [
      { id: 'obsidian_shard', name: 'Обсидиановый осколок', icon: '🖤', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Острый как бритва кусок вулканического стекла.', fallbackColor: '#1C1C1C', baseXP: 22, baseSell: 22 },
      { id: 'magma_scale', name: 'Магматическая чешуя', icon: '🔴', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', glowClass: 'glow-common', description: 'Застывшая корка лавы. Внутри всё ещё пульсирует жар.', fallbackColor: '#FF4500', baseXP: 40, baseSell: 40 },
      { id: 'fire_opal', name: 'Огненный опал', icon: '💠', rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare', glowClass: 'glow-gold', description: 'Драгоценный камень, рождённый в жерле вулкана. Переливается оранжевым.', fallbackColor: '#FF6347', baseXP: 80, baseSell: 80 }
    ]
  },
  {
    id: 'tar pits',
    items: [
      { id: 'tar_clump', name: 'Смоляной ком', icon: '🖤', rarity: 'Хлам', rarityClass: 'junk', rarityLevel: 'junk', glowClass: 'glow-junk', description: 'Вязкая природная смола. Горит коптящим пламенем.', fallbackColor: '#2F1B14', baseXP: 5, baseSell: 5 },
      { id: 'bone_tar', name: 'Костяная смола', icon: '💀', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Смола, смешанная с костной крошкой доисторических животных.', fallbackColor: '#C8AD7F', baseXP: 26, baseSell: 26 },
      { id: 'amber_fossil', name: 'Янтарная окаменелость', icon: '🟠', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', glowClass: 'glow-common', description: 'Крупный янтарь с застывшим внутри древним насекомым.', fallbackColor: '#FF8C00', baseXP: 45, baseSell: 45 }
    ]
  },
  {
    id: 'cactusforest',
    items: [
      { id: 'cactus_spine', name: 'Кактусовый шип', icon: '🌵', rarity: 'Хлам', rarityClass: 'junk', rarityLevel: 'junk', glowClass: 'glow-junk', description: 'Острейший шип гигантского кактуса. Может пробить кожу.', fallbackColor: '#2E8B57', baseXP: 5, baseSell: 5 },
      { id: 'cactus_fiber', name: 'Кактусовое волокно', icon: '🧵', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Прочное волокно из сердцевины пустынного кактуса.', fallbackColor: '#90EE90', baseXP: 25, baseSell: 25 },
      { id: 'desert_pearl', name: 'Пустынный жемчуг', icon: '🫧', rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare', glowClass: 'glow-gold', description: 'Редчайшая жемчужина, найденная внутри кактуса-долгожителя.', fallbackColor: '#FFF8DC', baseXP: 85, baseSell: 85 }
    ]
  }
]);
Object.assign(CONFIG_ITEMS, WILDLANDS_ITEMS);

// ============================================================
// ЭПОХА 3: ГЛУБИННЫЕ ПЕЩЕРЫ (уровни 26-42) — 6 локаций
// ============================================================
const DEEPCAVERNS_ITEMS = createEraItems('deepcaverns', ERAS['deepcaverns'], [
  {
    id: 'crystalgrotto',
    items: [
      { id: 'quartz_shard', name: 'Кварцевый осколок', icon: '💠', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Острый осколок горного хрусталя. Звенит при ударе.', fallbackColor: '#E6E6FA', baseXP: 30, baseSell: 30 },
      { id: 'amethyst_cluster', name: 'Аметистовая друза', icon: '🟣', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', glowClass: 'glow-common', description: 'Сросток фиолетовых кристаллов. Видимо, рос здесь веками.', fallbackColor: '#9966CC', baseXP: 55, baseSell: 55 },
      { id: 'diamond_raw', name: 'Неогранённый алмаз', icon: '💎', rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare', glowClass: 'glow-gold', description: 'Крупный алмаз, ещё не знавший руки ювелира.', fallbackColor: '#B9F2FF', baseXP: 120, baseSell: 120 }
    ]
  },
  {
    id: 'undergroundlake',
    items: [
      { id: 'lake_pearl', name: 'Озёрная жемчужина', icon: '🫧', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Жемчужина из подземного озера. Светится голубым.', fallbackColor: '#00FFFF', baseXP: 32, baseSell: 32 },
      { id: 'abyssal_scale', name: 'Глубинная чешуя', icon: '🐟', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', glowClass: 'glow-common', description: 'Чешуя слепой пещерной рыбы. Переливается в темноте.', fallbackColor: '#4682B4', baseXP: 60, baseSell: 60 },
      { id: 'water_crystal', name: 'Водяной кристалл', icon: '💧', rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare', glowClass: 'glow-gold', description: 'Кристалл чистейшей воды, не тающий при комнатной температуре.', fallbackColor: '#1E90FF', baseXP: 130, baseSell: 130 }
    ]
  },
  {
    id: 'magmaheart',
    items: [
      { id: 'basalt_chunk', name: 'Базальтовая глыба', icon: '🪨', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Кусок чёрного базальта. Тяжёлый и прочный.', fallbackColor: '#2F2F2F', baseXP: 34, baseSell: 34 },
      { id: 'lava_gem', name: 'Лавовый самоцвет', icon: '🔴', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', glowClass: 'glow-common', description: 'Камень, рождённый в магме. До сих пор горячий.', fallbackColor: '#FF2400', baseXP: 65, baseSell: 65 },
      { id: 'ruby_core', name: 'Рубиновое ядро', icon: '❤️', rarity: 'Эпический', rarityClass: 'epic', rarityLevel: 'epic', glowClass: 'glow-platinum', description: 'Огромный рубин, сформированный под давлением земных недр.', fallbackColor: '#E0115F', baseXP: 220, baseSell: 220 }
    ]
  },
  {
    id: 'fossildepths',
    items: [
      { id: 'bone_shard', name: 'Костяной осколок', icon: '🦴', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Осколок кости неизвестного существа. Твёрже гранита.', fallbackColor: '#F5F5DC', baseXP: 33, baseSell: 33 },
      { id: 'skull_fragment', name: 'Фрагмент черепа', icon: '💀', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', glowClass: 'glow-common', description: 'Часть черепа древнего ящера. Зубы всё ещё острые.', fallbackColor: '#FFF8DC', baseXP: 62, baseSell: 62 },
      { id: 'amber_eye', name: 'Янтарный глаз', icon: '👁️', rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare', glowClass: 'glow-gold', description: 'Глаз ископаемого существа, превратившийся в янтарь.', fallbackColor: '#FFBF00', baseXP: 135, baseSell: 135 }
    ]
  },
  {
    id: 'glowwormcave',
    items: [
      { id: 'silk_thread', name: 'Шёлковая нить', icon: '🧵', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Нить пещерного светлячка. Светится в темноте.', fallbackColor: '#ADFF2F', baseXP: 31, baseSell: 31 },
      { id: 'glow_goo', name: 'Светящаяся слизь', icon: '🟢', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', glowClass: 'glow-common', description: 'Биолюминесцентная субстанция. Можно использовать как лампу.', fallbackColor: '#32CD32', baseXP: 58, baseSell: 58 },
      { id: 'cocoon_gem', name: 'Коконный самоцвет', icon: '💠', rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare', glowClass: 'glow-gold', description: 'Самоцвет, образовавшийся внутри кокона гигантского светлячка.', fallbackColor: '#7FFF00', baseXP: 128, baseSell: 128 }
    ]
  },
  {
    id: 'deepmushroom',
    items: [
      { id: 'spore_cap', name: 'Споровая шляпка', icon: '🍄', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Шляпка гигантского гриба. Пахнет землёй и временем.', fallbackColor: '#8B0000', baseXP: 30, baseSell: 30 },
      { id: 'mycelium_brick', name: 'Грибничный кирпич', icon: '🧱', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', glowClass: 'glow-common', description: 'Спрессованная грибница. Лёгкая, но прочная.', fallbackColor: '#DDA0DD', baseXP: 56, baseSell: 56 },
      { id: 'truffle_gem', name: 'Трюфельный самоцвет', icon: '💎', rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare', glowClass: 'glow-gold', description: 'Редчайший подземный трюфель, пропитанный минералами.', fallbackColor: '#4B0082', baseXP: 125, baseSell: 125 }
    ]
  }
]);
Object.assign(CONFIG_ITEMS, DEEPCAVERNS_ITEMS);

// ============================================================
// ЭПОХА 4: ИНДУСТРИАЛЬНАЯ ЭРА (уровни 43-60) — 6 локаций
// ============================================================
const INDUSTRIAL_ITEMS = createEraItems('industrial', ERAS['industrial'], [
  {
    id: 'rustfactory',
    items: [
      { id: 'gear_scrap', name: 'Шестерёночный лом', icon: '⚙️', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Сломанная шестерня гигантского механизма. Зубья стёрты, но металл крепок.', fallbackColor: '#808080', baseXP: 40, baseSell: 40 },
      { id: 'piston_rod', name: 'Поршневой шток', icon: '🔧', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', glowClass: 'glow-common', description: 'Изношенный, но всё ещё прочный шток парового поршня.', fallbackColor: '#696969', baseXP: 75, baseSell: 75 },
      { id: 'boiler_plate', name: 'Котельная плита', icon: '🛡️', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', glowClass: 'glow-common', description: 'Кусок обшивки парового котла. Держит тепло и давление.', fallbackColor: '#A52A2A', baseXP: 78, baseSell: 78 }
    ]
  },
  {
    id: 'techswamp',
    items: [
      { id: 'circuit_board', name: 'Печатная плата', icon: '📟', rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare', glowClass: 'glow-gold', description: 'Плата древнего компьютера. Дорожки ещё проводят ток.', fallbackColor: '#00FF00', baseXP: 180, baseSell: 180 },
      { id: 'copper_coil', name: 'Медная катушка', icon: '🧲', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', glowClass: 'glow-common', description: 'Катушка индуктивности. Гудит, если поднести к уху.', fallbackColor: '#B87333', baseXP: 80, baseSell: 80 },
      { id: 'led_scrap', name: 'Светодиодный лом', icon: '💡', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Сломанные светодиоды. Некоторые ещё мерцают.', fallbackColor: '#FF69B4', baseXP: 45, baseSell: 45 }
    ]
  },
  {
    id: 'abandonedlab',
    items: [
      { id: 'chem_vial', name: 'Химическая ампула', icon: '🧪', rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare', glowClass: 'glow-gold', description: 'Запаянная ампула с неизвестной жидкостью.', fallbackColor: '#7FFF00', baseXP: 190, baseSell: 190 },
      { id: 'nano_powder', name: 'Нанопорошок', icon: '🦠', rarity: 'Эпический', rarityClass: 'epic', rarityLevel: 'epic', glowClass: 'glow-platinum', description: 'Серебристая пыль, которая движется сама по себе.', fallbackColor: '#C0C0C0', baseXP: 350, baseSell: 350 },
      { id: 'glassware', name: 'Лабораторное стекло', icon: '🔬', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', glowClass: 'glow-common', description: 'Осколки лабораторной посуды. Идеально прозрачные.', fallbackColor: '#ADD8E6', baseXP: 85, baseSell: 85 }
    ]
  },
  {
    id: 'powerplant',
    items: [
      { id: 'uranium_ore', name: 'Урановая руда', icon: '☢️', rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare', glowClass: 'glow-gold', description: 'Радиоактивная руда. Светится зелёным в темноте.', fallbackColor: '#00FF00', baseXP: 200, baseSell: 200 },
      { id: 'coolant_rod', name: 'Охлаждающий стержень', icon: '🪣', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', glowClass: 'glow-common', description: 'Стержень из реактора. Холодный на ощупь.', fallbackColor: '#4682B4', baseXP: 82, baseSell: 82 },
      { id: 'turbine_blade', name: 'Лопасть турбины', icon: '🌀', rarity: 'Эпический', rarityClass: 'epic', rarityLevel: 'epic', glowClass: 'glow-platinum', description: 'Титановая лопасть паровой турбины. Аэродинамически идеальна.', fallbackColor: '#C0C0C0', baseXP: 360, baseSell: 360 }
    ]
  },
  {
    id: 'scrapyard',
    items: [
      { id: 'car_chassis', name: 'Автомобильный остов', icon: '🚗', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Остов древнего автомобиля. Ржавый, но металл можно переплавить.', fallbackColor: '#B22222', baseXP: 42, baseSell: 42 },
      { id: 'muffler_pipe', name: 'Глушитель', icon: '🔧', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', glowClass: 'glow-common', description: 'Выхлопная труба. Проржавела, но сталь высокого качества.', fallbackColor: '#8B4513', baseXP: 76, baseSell: 76 },
      { id: 'catalytic_core', name: 'Каталитическое ядро', icon: '💠', rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare', glowClass: 'glow-gold', description: 'Ядро катализатора. Содержит платину.', fallbackColor: '#E5E4E2', baseXP: 185, baseSell: 185 }
    ]
  },
  {
    id: 'oilrefinery',
    items: [
      { id: 'crude_oil', name: 'Сырая нефть', icon: '🛢️', rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled', glowClass: 'glow-recycled', description: 'Густая чёрная жидкость. Горит очень жарко.', fallbackColor: '#1A1A1A', baseXP: 44, baseSell: 44 },
      { id: 'polymer_chunk', name: 'Полимерный кусок', icon: '🧴', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', glowClass: 'glow-common', description: 'Кусок синтетического полимера. Не разлагается веками.', fallbackColor: '#FF1493', baseXP: 79, baseSell: 79 },
      { id: 'oil_crystal', name: 'Нефтяной кристалл', icon: '💎', rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare', glowClass: 'glow-gold', description: 'Кристаллизовавшаяся нефть. Чистейший углерод.', fallbackColor: '#2F2F2F', baseXP: 195, baseSell: 195 }
    ]
  }
]);
Object.assign(CONFIG_ITEMS, INDUSTRIAL_ITEMS);

// ============================================================
// ЭПОХА 5: АСТРАЛЬНЫЕ МИРЫ (уровни 61-80) — 6 локаций
// ============================================================
const ASTRAL_ITEMS = createEraItems('astral', ERAS['astral'], [
  {
    id: 'nebula',
    items: [
      { id: 'star_dust', name: 'Звёздная пыль', icon: '✨', rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare', glowClass: 'glow-gold', description: 'Частицы разрушенных звёзд, собранные в туманности.', fallbackColor: '#FFD700', baseXP: 250, baseSell: 250 },
      { id: 'void_essence', name: 'Эссенция пустоты', icon: '🕳️', rarity: 'Эпический', rarityClass: 'epic', rarityLevel: 'epic', glowClass: 'glow-platinum', description: 'Сгусток чистой темноты, который поглощает свет.', fallbackColor: '#1A1A2E', baseXP: 480, baseSell: 480 },
      { id: 'light_fragment', name: 'Световой осколок', icon: '💫', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', glowClass: 'glow-common', description: 'Кристаллизованный свет. Тёплый на ощупь.', fallbackColor: '#FFFACD', baseXP: 120, baseSell: 120 }
    ]
  },
  {
    id: 'gravitywell',
    items: [
      { id: 'graviton_ore', name: 'Гравитонная руда', icon: '🪨', rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare', glowClass: 'glow-gold', description: 'Руда, которая искажает гравитацию вокруг себя.', fallbackColor: '#800080', baseXP: 260, baseSell: 260 },
      { id: 'mass_shard', name: 'Масс-осколок', icon: '💠', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', glowClass: 'glow-common', description: 'Осколок нейтронной звезды. Невероятно тяжёлый.', fallbackColor: '#4B0082', baseXP: 125, baseSell: 125 },
      { id: 'singular_pearl', name: 'Сингулярная жемчужина', icon: '⚫', rarity: 'Эпический', rarityClass: 'epic', rarityLevel: 'epic', glowClass: 'glow-platinum', description: 'Микро-чёрная дыра, стабилизированная в кристалле.', fallbackColor: '#000000', baseXP: 500, baseSell: 500 }
    ]
  },
  {
    id: 'quasar',
    items: [
      { id: 'plasma_orb', name: 'Плазменная сфера', icon: '🔵', rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare', glowClass: 'glow-gold', description: 'Шар раскалённой плазмы. Удерживается магнитным полем.', fallbackColor: '#00BFFF', baseXP: 255, baseSell: 255 },
      { id: 'quasar_core', name: 'Квазарное ядро', icon: '💥', rarity: 'Легендарный', rarityClass: 'legendary', rarityLevel: 'legendary', glowClass: 'glow-diamond', description: 'Ядро квазара. Источает невероятную энергию.', fallbackColor: '#FF4500', baseXP: 700, baseSell: 700 },
      { id: 'beam_crystal', name: 'Лучевой кристалл', icon: '💎', rarity: 'Эпический', rarityClass: 'epic', rarityLevel: 'epic', glowClass: 'glow-platinum', description: 'Кристалл, который фокусирует свет в лазерный луч.', fallbackColor: '#FF1493', baseXP: 450, baseSell: 450 }
    ]
  },
  {
    id: 'darkmatter',
    items: [
      { id: 'dark_shard', name: 'Тёмный осколок', icon: '🖤', rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare', glowClass: 'glow-gold', description: 'Осколок тёмной материи. Не отражает свет.', fallbackColor: '#0A0A0A', baseXP: 270, baseSell: 270 },
      { id: 'antimatter_flake', name: 'Антиматерия', icon: '⚠️', rarity: 'Эпический', rarityClass: 'epic', rarityLevel: 'epic', glowClass: 'glow-platinum', description: 'Крупица антиматерии в магнитной ловушке.', fallbackColor: '#FF00FF', baseXP: 520, baseSell: 520 },
      { id: 'reality_fabric', name: 'Ткань реальности', icon: '🕸️', rarity: 'Легендарный', rarityClass: 'legendary', rarityLevel: 'legendary', glowClass: 'glow-diamond', description: 'Нить, из которой соткана вселенная.', fallbackColor: '#FFFFFF', baseXP: 750, baseSell: 750 }
    ]
  },
  {
    id: 'wormhole',
    items: [
      { id: 'portal_stone', name: 'Портальный камень', icon: '🌀', rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare', glowClass: 'glow-gold', description: 'Камень, пронизанный микро-червоточинами.', fallbackColor: '#00FFFF', baseXP: 265, baseSell: 265 },
      { id: 'bridge_crystal', name: 'Мостовой кристалл', icon: '💠', rarity: 'Эпический', rarityClass: 'epic', rarityLevel: 'epic', glowClass: 'glow-platinum', description: 'Кристалл, способный соединять две точки пространства.', fallbackColor: '#87CEEB', baseXP: 490, baseSell: 490 },
      { id: 'wormhole_heart', name: 'Сердце кротовой норы', icon: '🫀', rarity: 'Легендарный', rarityClass: 'legendary', rarityLevel: 'legendary', glowClass: 'glow-diamond', description: 'Пульсирующее ядро пространственно-временного туннеля.', fallbackColor: '#FF69B4', baseXP: 720, baseSell: 720 }
    ]
  },
  {
    id: 'supernova',
    items: [
      { id: 'nova_ash', name: 'Пепел сверхновой', icon: '🌫️', rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare', glowClass: 'glow-gold', description: 'Остатки взорвавшейся звезды. Содержит все элементы таблицы Менделеева.', fallbackColor: '#FFDAB9', baseXP: 258, baseSell: 258 },
      { id: 'pulsar_fragment', name: 'Пульсарный фрагмент', icon: '⚡', rarity: 'Эпический', rarityClass: 'epic', rarityLevel: 'epic', glowClass: 'glow-platinum', description: 'Фрагмент пульсара. Вибрирует с частотой миллион раз в секунду.', fallbackColor: '#00FFFF', baseXP: 510, baseSell: 510 },
      { id: 'supernova_core', name: 'Ядро сверхновой', icon: '🌟', rarity: 'Легендарный', rarityClass: 'legendary', rarityLevel: 'legendary', glowClass: 'glow-diamond', description: 'Невероятно плотное ядро взорвавшейся звезды.', fallbackColor: '#FFD700', baseXP: 780, baseSell: 780 }
    ]
  }
]);
Object.assign(CONFIG_ITEMS, ASTRAL_ITEMS);

// ============================================================
// ЭПОХА 6: ТРАНСЦЕНДЕНЦИЯ (уровни 81-100) — 6 локаций
// ============================================================
const TRANSCENDENCE_ITEMS = createEraItems('transcendence', ERAS['transcendence'], [
  {
    id: 'creationforge',
    items: [
      { id: 'primordial_essence', name: 'Изначальная эссенция', icon: '💧', rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare', glowClass: 'glow-gold', description: 'Субстанция, из которой были созданы первые звёзды.', fallbackColor: '#FFF8DC', baseXP: 300, baseSell: 300 },
      { id: 'creator_spark', name: 'Искра творца', icon: '⚡', rarity: 'Эпический', rarityClass: 'epic', rarityLevel: 'epic', glowClass: 'glow-platinum', description: 'Микроскопическая искра чистой созидательной энергии.', fallbackColor: '#FFFFFF', baseXP: 600, baseSell: 600 },
      { id: 'creation_core', name: 'Ядро творения', icon: '🌟', rarity: 'Легендарный', rarityClass: 'legendary', rarityLevel: 'legendary', glowClass: 'glow-diamond', description: 'Сердце кузницы миров. Может создать что угодно.', fallbackColor: '#FFD700', baseXP: 1000, baseSell: 1000 }
    ]
  },
  {
    id: 'chronorift',
    items: [
      { id: 'time_sand', name: 'Песок времени', icon: '⏳', rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare', glowClass: 'glow-gold', description: 'Песок, который течёт в обе стороны.', fallbackColor: '#F4A460', baseXP: 310, baseSell: 310 },
      { id: 'chrono_crystal', name: 'Хроно-кристалл', icon: '💎', rarity: 'Эпический', rarityClass: 'epic', rarityLevel: 'epic', glowClass: 'glow-platinum', description: 'Кристалл, внутри которого время остановлено.', fallbackColor: '#00FFFF', baseXP: 620, baseSell: 620 },
      { id: 'eternity_shard', name: 'Осколок вечности', icon: '♾️', rarity: 'Легендарный', rarityClass: 'legendary', rarityLevel: 'legendary', glowClass: 'glow-diamond', description: 'Фрагмент самого времени.', fallbackColor: '#E0FFFF', baseXP: 1050, baseSell: 1050 }
    ]
  },
  {
    id: 'multiverse',
    items: [
      { id: 'reality_shard', name: 'Осколок реальности', icon: '🪞', rarity: 'Эпический', rarityClass: 'epic', rarityLevel: 'epic', glowClass: 'glow-platinum', description: 'Кусочек альтернативной вселенной.', fallbackColor: '#FF69B4', baseXP: 580, baseSell: 580 },
      { id: 'dimension_fabric', name: 'Ткань измерений', icon: '🕸️', rarity: 'Легендарный', rarityClass: 'legendary', rarityLevel: 'legendary', glowClass: 'glow-diamond', description: 'Материал, соединяющий параллельные миры.', fallbackColor: '#DDA0DD', baseXP: 980, baseSell: 980 },
      { id: 'omniverse_key', name: 'Ключ вселенных', icon: '🔑', rarity: 'Мифический', rarityClass: 'legendary', rarityLevel: 'mythic', glowClass: 'glow-diamond', description: 'Ключ, открывающий двери между всеми реальностями.', fallbackColor: '#FFD700', baseXP: 2000, baseSell: 2000 }
    ]
  },
  {
    id: 'entropyfields',
    items: [
      { id: 'entropy_dust', name: 'Энтропийная пыль', icon: '🌫️', rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare', glowClass: 'glow-gold', description: 'Пыль, ускоряющая распад всего, к чему прикасается.', fallbackColor: '#8B0000', baseXP: 305, baseSell: 305 },
      { id: 'decay_crystal', name: 'Кристалл распада', icon: '💀', rarity: 'Эпический', rarityClass: 'epic', rarityLevel: 'epic', glowClass: 'glow-platinum', description: 'Кристаллизованная энтропия.', fallbackColor: '#4B0082', baseXP: 610, baseSell: 610 },
      { id: 'heat_death_core', name: 'Ядро тепловой смерти', icon: '❄️', rarity: 'Легендарный', rarityClass: 'legendary', rarityLevel: 'legendary', glowClass: 'glow-diamond', description: 'Абсолютный ноль, заключённый в кристалл.', fallbackColor: '#00FFFF', baseXP: 1020, baseSell: 1020 }
    ]
  },
  {
    id: 'infinity',
    items: [
      { id: 'infinite_dust', name: 'Бесконечная пыль', icon: '✨', rarity: 'Эпический', rarityClass: 'epic', rarityLevel: 'epic', glowClass: 'glow-platinum', description: 'Пыль, которая никогда не заканчивается.', fallbackColor: '#FFD700', baseXP: 590, baseSell: 590 },
      { id: 'loop_stone', name: 'Камень петли', icon: '🔄', rarity: 'Легендарный', rarityClass: 'legendary', rarityLevel: 'legendary', glowClass: 'glow-diamond', description: 'Камень, зацикленный во времени.', fallbackColor: '#00FF00', baseXP: 990, baseSell: 990 },
      { id: 'infinity_core', name: 'Ядро бесконечности', icon: '♾️', rarity: 'Мифический', rarityClass: 'legendary', rarityLevel: 'mythic', glowClass: 'glow-diamond', description: 'Источник бесконечной энергии.', fallbackColor: '#FFFFFF', baseXP: 2500, baseSell: 2500 }
    ]
  },
  {
    id: 'source',
    items: [
      { id: 'source_dust', name: 'Пыль источника', icon: '💫', rarity: 'Эпический', rarityClass: 'epic', rarityLevel: 'epic', glowClass: 'glow-platinum', description: 'Пыль из самого центра мироздания.', fallbackColor: '#FFF8DC', baseXP: 595, baseSell: 595 },
      { id: 'source_crystal', name: 'Кристалл источника', icon: '💎', rarity: 'Легендарный', rarityClass: 'legendary', rarityLevel: 'legendary', glowClass: 'glow-diamond', description: 'Кристалл чистой энергии творения.', fallbackColor: '#FFD700', baseXP: 1000, baseSell: 1000 },
      { id: 'source_of_all', name: 'Источник всего', icon: '☀️', rarity: 'Мифический', rarityClass: 'legendary', rarityLevel: 'mythic', glowClass: 'glow-diamond', description: 'Точка, из которой возникла вся материя.', fallbackColor: '#FFFFFF', baseXP: 3000, baseSell: 3000 }
    ]
  }
]);
Object.assign(CONFIG_ITEMS, TRANSCENDENCE_ITEMS);

// ============================================================
// КОЛЛЕКЦИОННЫЕ АРТЕФАКТЫ (по одному на каждую эпоху + бонусные)
// ============================================================
const COLLECTIBLES = {
  // Эпоха Трясины
  bog_heart: {
    id: 'bog_heart', name: 'Топяной сгусток', icon: '💚',
    rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
    sourceType: 'expedition', location: 'swamp', era: 'mire',
    glowClass: 'glow-bogheart',
    description: 'Живой сгусток болотной материи, пульсирующий тусклым зелёным светом.',
    imagePath: 'assets/ingots/bog_heart.png', fallbackColor: '#32CD32', isCollectible: true,
    xpValue: 200, sellValue: 400,
    effect_id: 'recycled_chance', effect_power: 8, effect_name: 'Шанс Вторичного лута +8%'
  },
  rot_core: {
    id: 'rot_core', name: 'Сердцевина гнильца', icon: '🖤',
    rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
    sourceType: 'expedition', location: 'rotforest', era: 'mire',
    glowClass: 'glow-rotcore',
    description: 'Чёрная сердцевина мёртвого дерева, источающая ауру распада.',
    imagePath: 'assets/ingots/rot_core.png', fallbackColor: '#1A1A1A', isCollectible: true,
    xpValue: 250, sellValue: 500,
    effect_id: 'expedition_speed', effect_power: 12, effect_name: 'Ускорение экспедиций на 12%'
  },
  rust_nucleus: {
    id: 'rust_nucleus', name: 'Ржавое ядро', icon: '🧡',
    rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
    sourceType: 'expedition', location: 'rustbottom', era: 'mire',
    glowClass: 'glow-rustnucleus',
    description: 'Ядро древнего механизма, покрытое благородной ржавчиной.',
    imagePath: 'assets/ingots/rust_nucleus.png', fallbackColor: '#FF4500', isCollectible: true,
    xpValue: 300, sellValue: 600,
    effect_id: 'double_drop', effect_power: 12, effect_name: 'Шанс двойного дропа жеоды 12%'
  },
  
  // Эпоха Диких Земель
  volcanic_heart: {
    id: 'volcanic_heart', name: 'Вулканическое сердце', icon: '❤️‍🔥',
    rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
    sourceType: 'expedition', location: 'magmafissure', era: 'wildlands',
    glowClass: 'glow-bogheart',
    description: 'Пульсирующий камень из жерла вулкана. Дарует невероятный жар.',
    imagePath: 'assets/ingots/volcanic_heart.png', fallbackColor: '#FF4500', isCollectible: true,
    xpValue: 500, sellValue: 1000,
    effect_id: 'rush_chance', effect_power: 8, effect_name: 'Шанс Ража +8%'
  },
  desert_rose: {
    id: 'desert_rose', name: 'Роза пустыни', icon: '🌹',
    rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
    sourceType: 'expedition', location: 'stonedesert', era: 'wildlands',
    glowClass: 'glow-rotcore',
    description: 'Кристаллическое образование в форме цветка. Символ жизни в пустоши.',
    imagePath: 'assets/ingots/desert_rose.png', fallbackColor: '#FFC0CB', isCollectible: true,
    xpValue: 550, sellValue: 1100,
    effect_id: 'xp_boost', effect_power: 20, effect_name: 'Бонус опыта +20%'
  },
  tar_heart: {
    id: 'tar_heart', name: 'Смоляное сердце', icon: '🖤',
    rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
    sourceType: 'expedition', location: 'tar_pits', era: 'wildlands',
    glowClass: 'glow-rustnucleus',
    description: 'Сгусток древней смолы, в котором заключена душа ископаемого.',
    imagePath: 'assets/ingots/tar_heart.png', fallbackColor: '#1A1A1A', isCollectible: true,
    xpValue: 600, sellValue: 1200,
    effect_id: 'recycled_chance', effect_power: 15, effect_name: 'Шанс Вторичного лута +15%'
  },
  
  // Эпоха Глубинных Пещер
  crystal_soul: {
    id: 'crystal_soul', name: 'Кристальная душа', icon: '💎',
    rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
    sourceType: 'expedition', location: 'crystalgrotto', era: 'deepcaverns',
    glowClass: 'glow-osmium',
    description: 'Кристалл, в котором живёт отражение души шахтёра.',
    imagePath: 'assets/ingots/crystal_soul.png', fallbackColor: '#E6E6FA', isCollectible: true,
    xpValue: 1200, sellValue: 2500,
    effect_id: 'double_drop', effect_power: 18, effect_name: 'Шанс двойного дропа +18%'
  },
  abyss_eye: {
    id: 'abyss_eye', name: 'Глаз бездны', icon: '👁️',
    rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
    sourceType: 'expedition', location: 'undergroundlake', era: 'deepcaverns',
    glowClass: 'glow-darkmatter',
    description: 'Слепой глаз пещерного гиганта. Видит сквозь камень.',
    imagePath: 'assets/ingots/abyss_eye.png', fallbackColor: '#00FFFF', isCollectible: true,
    xpValue: 1300, sellValue: 2700,
    effect_id: 'expedition_speed', effect_power: 20, effect_name: 'Ускорение экспедиций на 20%'
  },
  magma_soul: {
    id: 'magma_soul', name: 'Душа магмы', icon: '🔥',
    rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
    sourceType: 'expedition', location: 'magmaheart', era: 'deepcaverns',
    glowClass: 'glow-rustnucleus',
    description: 'Сгусток чистой магмы, обретший сознание.',
    imagePath: 'assets/ingots/magma_soul.png', fallbackColor: '#FF4500', isCollectible: true,
    xpValue: 1400, sellValue: 2900,
    effect_id: 'rush_duration', effect_power: 15, effect_name: 'Длительность Ража +15 сек'
  },
  
  // Эпоха Индустриальной Эры
  reactor_core: {
    id: 'reactor_core', name: 'Реакторное ядро', icon: '☢️',
    rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
    sourceType: 'expedition', location: 'powerplant', era: 'industrial',
    glowClass: 'glow-osmium',
    description: 'Миниатюрный реактор. Питает целый город.',
    imagePath: 'assets/ingots/reactor_core.png', fallbackColor: '#00FF00', isCollectible: true,
    xpValue: 2800, sellValue: 5600,
    effect_id: 'energy_regen', effect_power: 5, effect_name: 'Регенерация энергии +5/сек'
  },
  ai_chip: {
    id: 'ai_chip', name: 'Чип ИИ', icon: '🧠',
    rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
    sourceType: 'expedition', location: 'abandonedlab', era: 'industrial',
    glowClass: 'glow-darkmatter',
    description: 'Процессор древнего искусственного интеллекта.',
    imagePath: 'assets/ingots/ai_chip.png', fallbackColor: '#00FFFF', isCollectible: true,
    xpValue: 3000, sellValue: 6000,
    effect_id: 'auto_tap', effect_power: 3, effect_name: 'Авто-тап каждые 3 сек'
  },
  nano_swarm: {
    id: 'nano_swarm', name: 'Нано-рой', icon: '🦠',
    rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
    sourceType: 'expedition', location: 'techswamp', era: 'industrial',
    glowClass: 'glow-rustnucleus',
    description: 'Колония самовоспроизводящихся нанороботов.',
    imagePath: 'assets/ingots/nano_swarm.png', fallbackColor: '#C0C0C0', isCollectible: true,
    xpValue: 3200, sellValue: 6400,
    effect_id: 'heavy_tap', effect_power: 50, effect_name: 'Сила тапа +50%'
  },
  
  // Эпоха Астральных Миров
  star_heart: {
    id: 'star_heart', name: 'Звёздное сердце', icon: '⭐',
    rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
    sourceType: 'expedition', location: 'nebula', era: 'astral',
    glowClass: 'glow-osmium',
    description: 'Сердце умирающей звезды. Всё ещё излучает тепло.',
    imagePath: 'assets/ingots/star_heart.png', fallbackColor: '#FFD700', isCollectible: true,
    xpValue: 6500, sellValue: 13000,
    effect_id: 'xp_boost', effect_power: 50, effect_name: 'Бонус опыта +50%'
  },
  void_soul: {
    id: 'void_soul', name: 'Душа пустоты', icon: '🕳️',
    rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
    sourceType: 'expedition', location: 'darkmatter', era: 'astral',
    glowClass: 'glow-darkmatter',
    description: 'Сущность, рождённая в абсолютной пустоте.',
    imagePath: 'assets/ingots/void_soul.png', fallbackColor: '#1A1A2E', isCollectible: true,
    xpValue: 7000, sellValue: 14000,
    effect_id: 'double_drop', effect_power: 30, effect_name: 'Шанс двойного дропа +30%'
  },
  quasar_pulse: {
    id: 'quasar_pulse', name: 'Пульс квазара', icon: '💥',
    rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
    sourceType: 'expedition', location: 'quasar', era: 'astral',
    glowClass: 'glow-rustnucleus',
    description: 'Энергетический импульс от далёкого квазара.',
    imagePath: 'assets/ingots/quasar_pulse.png', fallbackColor: '#FF4500', isCollectible: true,
    xpValue: 7500, sellValue: 15000,
    effect_id: 'rush_chance', effect_power: 15, effect_name: 'Шанс Ража +15%'
  },
  
  // Эпоха Трансценденции
  creation_spark: {
    id: 'creation_spark', name: 'Искра творения', icon: '⚡',
    rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
    sourceType: 'expedition', location: 'creationforge', era: 'transcendence',
    glowClass: 'glow-osmium',
    description: 'Первая искра, породившая вселенную.',
    imagePath: 'assets/ingots/creation_spark.png', fallbackColor: '#FFFFFF', isCollectible: true,
    xpValue: 15000, sellValue: 30000,
    effect_id: 'xp_boost', effect_power: 100, effect_name: 'Бонус опыта +100%'
  },
  time_gem: {
    id: 'time_gem', name: 'Самоцвет времени', icon: '⏳',
    rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
    sourceType: 'expedition', location: 'chronorift', era: 'transcendence',
    glowClass: 'glow-darkmatter',
    description: 'Драгоценный камень, внутри которого время течёт вспять.',
    imagePath: 'assets/ingots/time_gem.png', fallbackColor: '#00FFFF', isCollectible: true,
    xpValue: 16000, sellValue: 32000,
    effect_id: 'expedition_speed', effect_power: 50, effect_name: 'Ускорение экспедиций на 50%'
  },
  omniverse_orb: {
    id: 'omniverse_orb', name: 'Сфера вселенных', icon: '🔮',
    rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
    sourceType: 'expedition', location: 'multiverse', era: 'transcendence',
    glowClass: 'glow-rustnucleus',
    description: 'Сфера, содержащая в себе бесконечное множество вселенных.',
    imagePath: 'assets/ingots/omniverse_orb.png', fallbackColor: '#FF69B4', isCollectible: true,
    xpValue: 18000, sellValue: 36000,
    effect_id: 'double_drop', effect_power: 50, effect_name: 'Шанс двойного дропа +50%'
  },
  source_shard: {
    id: 'source_shard', name: 'Осколок источника', icon: '💫',
    rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
    sourceType: 'expedition', location: 'source', era: 'transcendence',
    glowClass: 'glow-diamond',
    description: 'Фрагмент самого источника всего сущего.',
    imagePath: 'assets/ingots/source_shard.png', fallbackColor: '#FFD700', isCollectible: true,
    xpValue: 20000, sellValue: 40000,
    effect_id: 'energy_regen', effect_power: 20, effect_name: 'Регенерация энергии +20/сек'
  }
};

// Добавляем все коллекционные предметы в общий реестр
Object.assign(CONFIG_ITEMS, COLLECTIBLES);

// ============================================================
// СПЛАВЫ ТРЯСИНЫ (АЛХИМИЯ) — каждая эпоха даёт свои рецепты
// ============================================================
const ALL_ALCHEMY_ITEMS = {};

// Генератор алхимических предметов
function createAlchemyItems(locationId, combinations) {
  const items = {};
  combinations.forEach(combo => {
    const id = combo.id;
    items[id] = {
      id: id,
      name: combo.name,
      icon: combo.icon,
      rarity: 'Вторичный',
      rarityClass: 'recycled',
      rarityLevel: 'recycled',
      sourceType: 'alchemy',
      location: locationId,
      era: combo.era,
      glowClass: 'glow-recycled',
      description: combo.description,
      imagePath: `assets/ingots/${id}.png`,
      fallbackColor: combo.fallbackColor || '#888888',
      isCollectible: false,
      xpValue: Math.floor(combo.baseXP * ERAS[combo.era].xpMultiplier),
      sellValue: Math.floor(combo.baseSell * ERAS[combo.era].xpMultiplier)
    };
  });
  return items;
}

// Трясина: сплавы
const MIRE_ALCHEMY = createAlchemyItems('swamp', [
  { id: 'silt_mass', name: 'Иловая масса', icon: '🟤', era: 'mire', description: 'Вязкая смесь влажного песка и грязи.', fallbackColor: '#6B5A45', baseXP: 15, baseSell: 15 },
  { id: 'bog_clump', name: 'Топкий ком', icon: '🟢', era: 'mire', description: 'Ком влажного песка и ила.', fallbackColor: '#5A6B4A', baseXP: 15, baseSell: 15 },
  { id: 'swamp_mix', name: 'Болотная смесь', icon: '🟤', era: 'mire', description: 'Однородная смесь грязи и ила.', fallbackColor: '#4A5A3A', baseXP: 15, baseSell: 15 },
  { id: 'rot_mix', name: 'Трухлявая смесь', icon: '🪵', era: 'mire', description: 'Смесь корявого бруска и коры.', fallbackColor: '#5A4A3A', baseXP: 18, baseSell: 18 },
  { id: 'rot_alloy', name: 'Гнилой сплав', icon: '🦴', era: 'mire', description: 'Сплав корявого бруска и сгнившего сука.', fallbackColor: '#3A3A2A', baseXP: 18, baseSell: 18 },
  { id: 'root_clump', name: 'Корневой ком', icon: '🧱', era: 'mire', description: 'Ком коры и гнилого сука.', fallbackColor: '#4A3A2A', baseXP: 18, baseSell: 18 },
  { id: 'rust_alloy', name: 'Ржавый сплав', icon: '🔩', era: 'mire', description: 'Сплав металлолома и проволоки.', fallbackColor: '#8B5A3A', baseXP: 20, baseSell: 20 },
  { id: 'scrap_mix', name: 'Битый сплав', icon: '🧩', era: 'mire', description: 'Сплав металлолома и битого кафеля.', fallbackColor: '#7A6A5A', baseXP: 20, baseSell: 20 },
  { id: 'scrap_ingot', name: 'Металлоломный слиток', icon: '🧶', era: 'mire', description: 'Слиток из проволоки и кафеля.', fallbackColor: '#9A7A5A', baseXP: 20, baseSell: 20 }
]);
Object.assign(CONFIG_ITEMS, MIRE_ALCHEMY);
Object.assign(ALL_ALCHEMY_ITEMS, MIRE_ALCHEMY);

// Дикие Земли: сплавы
const WILDLANDS_ALCHEMY = createAlchemyItems('ashwaste', [
  { id: 'cinder_block', name: 'Пепельный блок', icon: '🪶', era: 'wildlands', description: 'Спрессованный пепел и магма.', fallbackColor: '#4A4A4A', baseXP: 35, baseSell: 35 },
  { id: 'magma_brick', name: 'Магматический кирпич', icon: '🧱', era: 'wildlands', description: 'Кирпич из застывшей лавы.', fallbackColor: '#FF4500', baseXP: 38, baseSell: 38 },
  { id: 'sand_alloy', name: 'Песчаный сплав', icon: '🪨', era: 'wildlands', description: 'Сплав песка и окаменелостей.', fallbackColor: '#D2B48C', baseXP: 40, baseSell: 40 },
  { id: 'salt_brick', name: 'Соляной кирпич', icon: '💎', era: 'wildlands', description: 'Прессованная соль с жемчугом.', fallbackColor: '#FFFFFF', baseXP: 42, baseSell: 42 },
  { id: 'volcanic_glass', name: 'Вулканическое стекло', icon: '🖤', era: 'wildlands', description: 'Сплав обсидиана с магмой.', fallbackColor: '#1C1C1C', baseXP: 45, baseSell: 45 },
  { id: 'tar_resin', name: 'Смоляная смола', icon: '🖤', era: 'wildlands', description: 'Очищенная смола с костяной крошкой.', fallbackColor: '#2F1B14', baseXP: 44, baseSell: 44 },
  { id: 'cactus_plate', name: 'Кактусовая плита', icon: '🌵', era: 'wildlands', description: 'Прессованное кактусовое волокно.', fallbackColor: '#90EE90', baseXP: 42, baseSell: 42 },
  { id: 'desert_glass', name: 'Пустынное стекло', icon: '💠', era: 'wildlands', description: 'Стекло из пустынного жемчуга.', fallbackColor: '#FFF8DC', baseXP: 50, baseSell: 50 },
  { id: 'fossil_plate', name: 'Ископаемая плита', icon: '🦴', era: 'wildlands', description: 'Плита из спрессованных окаменелостей.', fallbackColor: '#8B7355', baseXP: 48, baseSell: 48 }
]);
Object.assign(CONFIG_ITEMS, WILDLANDS_ALCHEMY);
Object.assign(ALL_ALCHEMY_ITEMS, WILDLANDS_ALCHEMY);

// Глубинные Пещеры: сплавы
const DEEPCAVERNS_ALCHEMY = createAlchemyItems('crystalgrotto', [
  { id: 'crystal_glass', name: 'Хрустальное стекло', icon: '💠', era: 'deepcaverns', description: 'Стекло из кварца и аметиста.', fallbackColor: '#E6E6FA', baseXP: 80, baseSell: 80 },
  { id: 'pearl_alloy', name: 'Жемчужный сплав', icon: '🫧', era: 'deepcaverns', description: 'Сплав жемчуга и чешуи.', fallbackColor: '#00FFFF', baseXP: 85, baseSell: 85 },
  { id: 'basalt_brick', name: 'Базальтовый кирпич', icon: '🪨', era: 'deepcaverns', description: 'Кирпич из базальта и лавы.', fallbackColor: '#2F2F2F', baseXP: 82, baseSell: 82 },
  { id: 'bone_plate', name: 'Костяная плита', icon: '🦴', era: 'deepcaverns', description: 'Плита из кости и черепа.', fallbackColor: '#F5F5DC', baseXP: 83, baseSell: 83 },
  { id: 'glow_brick', name: 'Светящийся кирпич', icon: '🟢', era: 'deepcaverns', description: 'Кирпич из светящейся слизи.', fallbackColor: '#32CD32', baseXP: 81, baseSell: 81 },
  { id: 'mushroom_plate', name: 'Грибная плита', icon: '🍄', era: 'deepcaverns', description: 'Плита из грибницы и спор.', fallbackColor: '#DDA0DD', baseXP: 84, baseSell: 84 },
  { id: 'diamond_dust', name: 'Алмазная пыль', icon: '💎', era: 'deepcaverns', description: 'Пыль из алмазов и рубинов.', fallbackColor: '#B9F2FF', baseXP: 90, baseSell: 90 },
  { id: 'lake_stone', name: 'Озёрный камень', icon: '💧', era: 'deepcaverns', description: 'Камень из водяного кристалла.', fallbackColor: '#1E90FF', baseXP: 88, baseSell: 88 },
  { id: 'cave_metal', name: 'Пещерный металл', icon: '⛏️', era: 'deepcaverns', description: 'Металл из трюфельного самоцвета.', fallbackColor: '#4B0082', baseXP: 92, baseSell: 92 }
]);
Object.assign(CONFIG_ITEMS, DEEPCAVERNS_ALCHEMY);
Object.assign(ALL_ALCHEMY_ITEMS, DEEPCAVERNS_ALCHEMY);

// Индустриальная Эра: сплавы
const INDUSTRIAL_ALCHEMY = createAlchemyItems('rustfactory', [
  { id: 'gear_alloy', name: 'Шестерёночный сплав', icon: '⚙️', era: 'industrial', description: 'Сплав шестерён и поршней.', fallbackColor: '#808080', baseXP: 160, baseSell: 160 },
  { id: 'circuit_gold', name: 'Микросхемное золото', icon: '📟', era: 'industrial', description: 'Золото из печатных плат.', fallbackColor: '#00FF00', baseXP: 175, baseSell: 175 },
  { id: 'chem_metal', name: 'Химический металл', icon: '🧪', era: 'industrial', description: 'Металл из химических ампул.', fallbackColor: '#7FFF00', baseXP: 180, baseSell: 180 },
  { id: 'uranium_glass', name: 'Урановое стекло', icon: '☢️', era: 'industrial', description: 'Стекло из урановой руды.', fallbackColor: '#00FF00', baseXP: 190, baseSell: 190 },
  { id: 'car_metal', name: 'Автомобильный металл', icon: '🚗', era: 'industrial', description: 'Металл из автомобильного остова.', fallbackColor: '#B22222', baseXP: 165, baseSell: 165 },
  { id: 'oil_plastic', name: 'Нефтяной пластик', icon: '🛢️', era: 'industrial', description: 'Пластик из сырой нефти.', fallbackColor: '#1A1A1A', baseXP: 170, baseSell: 170 },
  { id: 'turbine_blade_alloy', name: 'Турбинный сплав', icon: '🌀', era: 'industrial', description: 'Сплав из лопастей турбин.', fallbackColor: '#C0C0C0', baseXP: 200, baseSell: 200 },
  { id: 'catalytic_metal', name: 'Каталитический металл', icon: '💠', era: 'industrial', description: 'Металл из катализатора.', fallbackColor: '#E5E4E2', baseXP: 185, baseSell: 185 },
  { id: 'reactor_steel', name: 'Реакторная сталь', icon: '🪣', era: 'industrial', description: 'Сталь из охлаждающих стержней.', fallbackColor: '#4682B4', baseXP: 195, baseSell: 195 }
]);
Object.assign(CONFIG_ITEMS, INDUSTRIAL_ALCHEMY);
Object.assign(ALL_ALCHEMY_ITEMS, INDUSTRIAL_ALCHEMY);

// Астральные Миры: сплавы
const ASTRAL_ALCHEMY = createAlchemyItems('nebula', [
  { id: 'star_alloy', name: 'Звёздный сплав', icon: '✨', era: 'astral', description: 'Сплав звёздной пыли и света.', fallbackColor: '#FFD700', baseXP: 400, baseSell: 400 },
  { id: 'grav_metal', name: 'Гравитационный металл', icon: '🪨', era: 'astral', description: 'Металл из гравитонной руды.', fallbackColor: '#800080', baseXP: 420, baseSell: 420 },
  { id: 'plasma_steel', name: 'Плазменная сталь', icon: '🔵', era: 'astral', description: 'Сталь из плазменной сферы.', fallbackColor: '#00BFFF', baseXP: 410, baseSell: 410 },
  { id: 'dark_metal', name: 'Тёмный металл', icon: '🖤', era: 'astral', description: 'Металл из тёмного осколка.', fallbackColor: '#0A0A0A', baseXP: 430, baseSell: 430 },
  { id: 'portal_stone', name: 'Портальный камень', icon: '🌀', era: 'astral', description: 'Камень из червоточины.', fallbackColor: '#00FFFF', baseXP: 415, baseSell: 415 },
  { id: 'nova_steel', name: 'Сталь сверхновой', icon: '🌫️', era: 'astral', description: 'Сталь из пепла сверхновой.', fallbackColor: '#FFDAB9', baseXP: 425, baseSell: 425 },
  { id: 'quasar_metal', name: 'Квазарный металл', icon: '💥', era: 'astral', description: 'Металл из ядра квазара.', fallbackColor: '#FF4500', baseXP: 450, baseSell: 450 },
  { id: 'void_alloy', name: 'Сплав пустоты', icon: '🕳️', era: 'astral', description: 'Сплав эссенции пустоты.', fallbackColor: '#1A1A2E', baseXP: 440, baseSell: 440 },
  { id: 'reality_metal', name: 'Металл реальности', icon: '🕸️', era: 'astral', description: 'Металл из ткани реальности.', fallbackColor: '#FFFFFF', baseXP: 460, baseSell: 460 }
]);
Object.assign(CONFIG_ITEMS, ASTRAL_ALCHEMY);
Object.assign(ALL_ALCHEMY_ITEMS, ASTRAL_ALCHEMY);

// Трансценденция: сплавы
const TRANSCENDENCE_ALCHEMY = createAlchemyItems('creationforge', [
  { id: 'creation_metal', name: 'Металл творения', icon: '💧', era: 'transcendence', description: 'Металл из изначальной эссенции.', fallbackColor: '#FFF8DC', baseXP: 800, baseSell: 800 },
  { id: 'time_alloy', name: 'Временной сплав', icon: '⏳', era: 'transcendence', description: 'Сплав из песка времени.', fallbackColor: '#F4A460', baseXP: 820, baseSell: 820 },
  { id: 'reality_alloy', name: 'Сплав реальностей', icon: '🪞', era: 'transcendence', description: 'Сплав из осколков реальности.', fallbackColor: '#FF69B4', baseXP: 830, baseSell: 830 },
  { id: 'entropy_metal', name: 'Энтропийный металл', icon: '🌫️', era: 'transcendence', description: 'Металл из энтропийной пыли.', fallbackColor: '#8B0000', baseXP: 810, baseSell: 810 },
  { id: 'infinite_alloy', name: 'Бесконечный сплав', icon: '✨', era: 'transcendence', description: 'Сплав из бесконечной пыли.', fallbackColor: '#FFD700', baseXP: 840, baseSell: 840 },
  { id: 'source_metal', name: 'Металл источника', icon: '💫', era: 'transcendence', description: 'Металл из пыли источника.', fallbackColor: '#FFF8DC', baseXP: 850, baseSell: 850 },
  { id: 'eternity_steel', name: 'Сталь вечности', icon: '♾️', era: 'transcendence', description: 'Сталь из осколка вечности.', fallbackColor: '#E0FFFF', baseXP: 860, baseSell: 860 },
  { id: 'loop_metal', name: 'Петлевой металл', icon: '🔄', era: 'transcendence', description: 'Металл из камня петли.', fallbackColor: '#00FF00', baseXP: 845, baseSell: 845 },
  { id: 'source_alloy', name: 'Сплав источника', icon: '☀️', era: 'transcendence', description: 'Сплав из источника всего.', fallbackColor: '#FFFFFF', baseXP: 900, baseSell: 900 }
]);
Object.assign(CONFIG_ITEMS, TRANSCENDENCE_ALCHEMY);
Object.assign(ALL_ALCHEMY_ITEMS, TRANSCENDENCE_ALCHEMY);

// ============================================================
// КРАФТЫ ПЛАВИЛЬНИ (для Великой Переплавки) — расширенные
// ============================================================
export const CRAFT_RECIPES = {
  // Трясина
  black_mirror: { id: 'black_mirror', name: 'Чёрное Зеркало', icon: '🌑', description: 'Сплав космической стали и сидерита.', resultIngotId: 'black_mirror', ingredients: { cosmic_steel: 2, siderite: 1 }, xpReward: 30, smeltTime: 10, reqLevel: 1, era: 'mire' },
  astro_bronze: { id: 'astro_bronze', name: 'Астро-Бронза', icon: '🛰️', description: 'Сплав звёздного серебра и астралиума.', resultIngotId: 'astro_bronze', ingredients: { star_silver: 2, astralium: 1 }, xpReward: 45, smeltTime: 15, reqLevel: 3, era: 'mire' },
  chrome_titan: { id: 'chrome_titan', name: 'Хромированный Титан', icon: '🛡️', description: 'Броня из люминора и метеоритного золота.', resultIngotId: 'chrome_titan', ingredients: { luminor: 2, meteor_gold: 1 }, xpReward: 55, smeltTime: 20, reqLevel: 5, era: 'mire' },
  platinum_alloy: { id: 'platinum_alloy', name: 'Платиновый Сплав', icon: '💎', description: 'Вершина метеоритной кузни.', resultIngotId: 'platinum_alloy', ingredients: { cosmonium: 2, nebulite: 2, singular: 1 }, xpReward: 75, smeltTime: 25, reqLevel: 6, era: 'mire' },
  
  // Дикие Земли
  volcanic_ingot: { id: 'volcanic_ingot', name: 'Вулканический слиток', icon: '🌋', description: 'Слиток из пепла и магмы.', resultIngotId: 'volcanic_ingot', ingredients: { cinder_chunk: 3, smolder_core: 2, ember_dust: 1 }, xpReward: 120, smeltTime: 30, reqLevel: 12, era: 'wildlands' },
  desert_alloy: { id: 'desert_alloy', name: 'Пустынный сплав', icon: '🏜️', description: 'Сплав песка и окаменелостей.', resultIngotId: 'desert_alloy', ingredients: { grit_chunk: 2, sand_brick: 2, fossil_fragment: 1 }, xpReward: 140, smeltTime: 35, reqLevel: 15, era: 'wildlands' },
  salt_ingot: { id: 'salt_ingot', name: 'Соляной слиток', icon: '🧂', description: 'Слиток из кристаллов соли.', resultIngotId: 'salt_ingot', ingredients: { salt_crystal: 2, brine_pearl: 2, cave_shell: 1 }, xpReward: 160, smeltTime: 40, reqLevel: 18, era: 'wildlands' },
  magma_alloy: { id: 'magma_alloy', name: 'Магматический сплав', icon: '🔥', description: 'Сплав обсидиана и магмы.', resultIngotId: 'magma_alloy', ingredients: { obsidian_shard: 3, magma_scale: 2, fire_opal: 1 }, xpReward: 180, smeltTime: 45, reqLevel: 20, era: 'wildlands' },
  
  // Глубинные Пещеры
  crystal_ingot: { id: 'crystal_ingot', name: 'Хрустальный слиток', icon: '💎', description: 'Слиток из горного хрусталя.', resultIngotId: 'crystal_ingot', ingredients: { quartz_shard: 3, amethyst_cluster: 2, diamond_raw: 1 }, xpReward: 280, smeltTime: 50, reqLevel: 28, era: 'deepcaverns' },
  abyss_alloy: { id: 'abyss_alloy', name: 'Сплав бездны', icon: '🌊', description: 'Сплав жемчуга и чешуи.', resultIngotId: 'abyss_alloy', ingredients: { lake_pearl: 2, abyssal_scale: 2, water_crystal: 1 }, xpReward: 300, smeltTime: 55, reqLevel: 32, era: 'deepcaverns' },
  magma_ingot: { id: 'magma_ingot', name: 'Магмовый слиток', icon: '🔴', description: 'Слиток из базальта и лавы.', resultIngotId: 'magma_ingot', ingredients: { basalt_chunk: 3, lava_gem: 2, ruby_core: 1 }, xpReward: 320, smeltTime: 60, reqLevel: 35, era: 'deepcaverns' },
  fossil_alloy: { id: 'fossil_alloy', name: 'Ископаемый сплав', icon: '🦴', description: 'Сплав костей и янтаря.', resultIngotId: 'fossil_alloy', ingredients: { bone_shard: 2, skull_fragment: 2, amber_eye: 1 }, xpReward: 340, smeltTime: 65, reqLevel: 38, era: 'deepcaverns' },
  
  // Индустриальная Эра
  gear_ingot: { id: 'gear_ingot', name: 'Шестерёночный слиток', icon: '⚙️', description: 'Слиток из шестерён и поршней.', resultIngotId: 'gear_ingot', ingredients: { gear_scrap: 3, piston_rod: 2, boiler_plate: 1 }, xpReward: 500, smeltTime: 70, reqLevel: 45, era: 'industrial' },
  circuit_alloy: { id: 'circuit_alloy', name: 'Микросхемный сплав', icon: '📟', description: 'Сплав из печатных плат.', resultIngotId: 'circuit_alloy', ingredients: { circuit_board: 2, copper_coil: 2, led_scrap: 1 }, xpReward: 550, smeltTime: 80, reqLevel: 48, era: 'industrial' },
  chem_ingot: { id: 'chem_ingot', name: 'Химический слиток', icon: '🧪', description: 'Слиток из химических ампул.', resultIngotId: 'chem_ingot', ingredients: { chem_vial: 2, nano_powder: 1, glassware: 2 }, xpReward: 600, smeltTime: 90, reqLevel: 52, era: 'industrial' },
  reactor_alloy: { id: 'reactor_alloy', name: 'Реакторный сплав', icon: '☢️', description: 'Сплав из урановой руды.', resultIngotId: 'reactor_alloy', ingredients: { uranium_ore: 2, coolant_rod: 2, turbine_blade: 1 }, xpReward: 650, smeltTime: 100, reqLevel: 55, era: 'industrial' },
  
  // Астральные Миры
  star_ingot: { id: 'star_ingot', name: 'Звёздный слиток', icon: '⭐', description: 'Слиток из звёздной пыли.', resultIngotId: 'star_ingot', ingredients: { star_dust: 3, void_essence: 1, light_fragment: 2 }, xpReward: 900, smeltTime: 110, reqLevel: 63, era: 'astral' },
  graviton_alloy: { id: 'graviton_alloy', name: 'Гравитонный сплав', icon: '🪨', description: 'Сплав из гравитонной руды.', resultIngotId: 'graviton_alloy', ingredients: { graviton_ore: 2, mass_shard: 2, singular_pearl: 1 }, xpReward: 1000, smeltTime: 120, reqLevel: 67, era: 'astral' },
  plasma_ingot: { id: 'plasma_ingot', name: 'Плазменный слиток', icon: '🔵', description: 'Слиток из плазмы.', resultIngotId: 'plasma_ingot', ingredients: { plasma_orb: 2, quasar_core: 1, beam_crystal: 1 }, xpReward: 1100, smeltTime: 130, reqLevel: 70, era: 'astral' },
  dark_alloy: { id: 'dark_alloy', name: 'Тёмный сплав', icon: '🖤', description: 'Сплав из тёмной материи.', resultIngotId: 'dark_alloy', ingredients: { dark_shard: 2, antimatter_flake: 1, reality_fabric: 1 }, xpReward: 1200, smeltTime: 140, reqLevel: 74, era: 'astral' },
  
  // Трансценденция
  creation_ingot: { id: 'creation_ingot', name: 'Слиток творения', icon: '💧', description: 'Слиток из изначальной эссенции.', resultIngotId: 'creation_ingot', ingredients: { primordial_essence: 3, creator_spark: 1, creation_core: 1 }, xpReward: 2000, smeltTime: 150, reqLevel: 83, era: 'transcendence' },
  time_alloy_ingot: { id: 'time_alloy_ingot', name: 'Временной слиток', icon: '⏳', description: 'Слиток из песка времени.', resultIngotId: 'time_alloy_ingot', ingredients: { time_sand: 2, chrono_crystal: 1, eternity_shard: 1 }, xpReward: 2200, smeltTime: 160, reqLevel: 87, era: 'transcendence' },
  reality_ingot: { id: 'reality_ingot', name: 'Слиток реальности', icon: '🪞', description: 'Слиток из осколков реальности.', resultIngotId: 'reality_ingot', ingredients: { reality_shard: 2, dimension_fabric: 1, omniverse_key: 1 }, xpReward: 2500, smeltTime: 170, reqLevel: 90, era: 'transcendence' },
  source_ingot: { id: 'source_ingot', name: 'Слиток источника', icon: '☀️', description: 'Слиток из источника всего.', resultIngotId: 'source_ingot', ingredients: { source_dust: 3, source_crystal: 2, source_of_all: 1 }, xpReward: 3000, smeltTime: 180, reqLevel: 95, era: 'transcendence' }
};

// Результаты крафтов добавляем в CONFIG_ITEMS
const CRAFT_RESULTS = {};
for (let recipeId in CRAFT_RECIPES) {
  const recipe = CRAFT_RECIPES[recipeId];
  CRAFT_RESULTS[recipe.resultIngotId] = {
    id: recipe.resultIngotId,
    name: recipe.name,
    icon: recipe.icon,
    rarity: 'Крафтовый',
    rarityClass: recipe.reqLevel >= 80 ? 'legendary' : (recipe.reqLevel >= 40 ? 'epic' : 'rare'),
    rarityLevel: recipe.reqLevel >= 80 ? 'legendary' : (recipe.reqLevel >= 40 ? 'epic' : 'rare'),
    sourceType: 'crafted',
    location: 'craft',
    era: recipe.era || 'mire',
    glowClass: recipe.reqLevel >= 80 ? 'glow-diamond' : (recipe.reqLevel >= 40 ? 'glow-platinum' : 'glow-gold'),
    description: recipe.description,
    imagePath: `assets/ingots/${recipe.resultIngotId}.png`,
    fallbackColor: '#FFD700',
    isCollectible: false,
    xpValue: recipe.xpReward * 2,
    sellValue: recipe.xpReward * 3
  };
}
Object.assign(CONFIG_ITEMS, CRAFT_RESULTS);

// ============================================================
// ЖЕОДЫ (генерируем для каждой локации)
// ============================================================
function generateGeodes(locations, eraConfig, baseTimers) {
  const geodes = {};
  
  locations.forEach((loc, index) => {
    const locId = loc.id;
    const baseTimer = baseTimers[index] || 30;
    
    // Обычная жеода
    geodes[locId] = {
      id: locId,
      name: loc.geodeName,
      icon: loc.geodeIcon,
      isSpecial: false,
      timer: Math.floor(baseTimer * eraConfig.costMultiplier),
      description: loc.geodeDescription,
      stages: [
        { minTaps: 7, maxTaps: 10, imagePath: `assets/geodes/${locId}_stage1.png`, fallbackIcon: loc.geodeIcon },
        { minTaps: 3, maxTaps: 6, imagePath: `assets/geodes/${locId}_stage2.png`, fallbackIcon: '💔' },
        { minTaps: 1, maxTaps: 2, imagePath: `assets/geodes/${locId}_stage3.png`, fallbackIcon: '💥' }
      ],
      lootTable: loc.items.map(item => ({
        ingotId: item.id,
        chance: item.rarityLevel === 'junk' ? 0.40 : (item.rarityLevel === 'recycled' ? 0.35 : 0.25)
      })),
      xpValue: Math.floor(5 * eraConfig.xpMultiplier)
    };
    
    // Особая жеода (коллекционная)
    if (loc.collectibleId) {
      geodes[`special_${locId}`] = {
        id: `special_${locId}`,
        name: loc.specialGeodeName || `Особая жеода ${loc.name}`,
        icon: loc.specialGeodeIcon || '💎',
        isSpecial: true,
        location: locId,
        timer: Math.floor(baseTimer * 1.5 * eraConfig.costMultiplier),
        description: loc.specialGeodeDescription || 'Содержит редкий коллекционный артефакт.',
        stages: [
          { minTaps: 7, maxTaps: 10, imagePath: `assets/geodes/special_${locId}_stage1.png`, fallbackIcon: '💎' },
          { minTaps: 3, maxTaps: 6, imagePath: `assets/geodes/special_${locId}_stage2.png`, fallbackIcon: '🟢' },
          { minTaps: 1, maxTaps: 2, imagePath: `assets/geodes/special_${locId}_stage3.png`, fallbackIcon: '✨' }
        ],
        possibleIngots: [loc.collectibleId],
        xpValue: Math.floor(80 * eraConfig.xpMultiplier)
      };
    }
  });
  
  return geodes;
}

export const CONFIG_GEODES = {};

// Трясина — жеоды
Object.assign(CONFIG_GEODES, generateGeodes([
  { id: 'swamp', name: 'Болото', geodeName: 'Тинистая жеода', geodeIcon: '🟤', geodeDescription: 'Ком спрессованного ила, внутри может оказаться что угодно.', items: [{ id: 'wet_sand', rarityLevel: 'junk' }, { id: 'mud_ingot', rarityLevel: 'junk' }, { id: 'silt_clump', rarityLevel: 'recycled' }], collectibleId: 'bog_heart', specialGeodeName: 'Сердце трясины', specialGeodeIcon: '💚', specialGeodeDescription: 'Живая жеода, пульсирующая болотной энергией.' },
  { id: 'rotforest', name: 'Гнилой лес', geodeName: 'Гнилостная жеода', geodeIcon: '🪵', geodeDescription: 'Жеода, образовавшаяся внутри гниющего ствола.', items: [{ id: 'warped_bar', rarityLevel: 'recycled' }, { id: 'bark_ingot', rarityLevel: 'recycled' }, { id: 'rotted_bough', rarityLevel: 'recycled' }], collectibleId: 'rot_core', specialGeodeName: 'Гнилая сердцевина', specialGeodeIcon: '🖤', specialGeodeDescription: 'Чёрное ядро мёртвого дерева.' },
  { id: 'rustbottom', name: 'Ржавое дно', geodeName: 'Ржавая жеода', geodeIcon: '🔩', geodeDescription: 'Окисленная капсула со дна пересохшего водоёма.', items: [{ id: 'rusty_scrap', rarityLevel: 'common' }, { id: 'wire_clump', rarityLevel: 'recycled' }, { id: 'broken_tile', rarityLevel: 'recycled' }], collectibleId: 'rust_nucleus', specialGeodeName: 'Окисленная капсула', specialGeodeIcon: '🧡', specialGeodeDescription: 'Герметичная капсула древних.' },
  { id: 'mossycave', name: 'Мшистая пещера', geodeName: 'Мшистая жеода', geodeIcon: '🌿', geodeDescription: 'Жеода, покрытая светящимся мхом.', items: [{ id: 'moss_clump', rarityLevel: 'junk' }, { id: 'glow_spore', rarityLevel: 'recycled' }, { id: 'cave_resin', rarityLevel: 'recycled' }], collectibleId: null },
  { id: 'peatbog', name: 'Торфяное болото', geodeName: 'Торфяная жеода', geodeIcon: '🟫', geodeDescription: 'Спрессованный торф с вкраплениями.', items: [{ id: 'peat_block', rarityLevel: 'junk' }, { id: 'bog_iron', rarityLevel: 'recycled' }, { id: 'amber_chunk', rarityLevel: 'common' }], collectibleId: null },
  { id: 'willowgrove', name: 'Ивовая роща', geodeName: 'Ивовая жеода', geodeIcon: '🌳', geodeDescription: 'Жеода из коры древней ивы.', items: [{ id: 'willow_bark', rarityLevel: 'junk' }, { id: 'sap_glob', rarityLevel: 'recycled' }, { id: 'root_fiber', rarityLevel: 'common' }], collectibleId: null }
], ERAS['mire'], [10, 25, 45, 60, 75, 90]));

// Дикие Земли — жеоды
Object.assign(CONFIG_GEODES, generateGeodes([
  { id: 'ashwaste', name: 'Пепельная пустошь', geodeName: 'Пепельная жеода', geodeIcon: '🪶', geodeDescription: 'Жеода из вулканического пепла.', items: [{ id: 'cinder_chunk', rarityLevel: 'junk' }, { id: 'smolder_core', rarityLevel: 'junk' }, { id: 'ember_dust', rarityLevel: 'recycled' }], collectibleId: null },
  { id: 'stonedesert', name: 'Каменная пустыня', geodeName: 'Пустынная жеода', geodeIcon: '🪨', geodeDescription: 'Жеода, отшлифованная песчаными бурями.', items: [{ id: 'grit_chunk', rarityLevel: 'recycled' }, { id: 'sand_brick', rarityLevel: 'recycled' }, { id: 'fossil_fragment', rarityLevel: 'recycled' }], collectibleId: 'desert_rose', specialGeodeName: 'Роза пустыни', specialGeodeIcon: '🌹', specialGeodeDescription: 'Кристаллическое образование в форме цветка.' },
  { id: 'saltcaves', name: 'Соляные пещеры', geodeName: 'Соляная жеода', geodeIcon: '💎', geodeDescription: 'Кристаллическая жеода из соли.', items: [{ id: 'salt_crystal', rarityLevel: 'common' }, { id: 'brine_pearl', rarityLevel: 'recycled' }, { id: 'cave_shell', rarityLevel: 'recycled' }], collectibleId: null },
  { id: 'magmafissure', name: 'Магматическая трещина', geodeName: 'Обсидиановая жеода', geodeIcon: '🖤', geodeDescription: 'Жеода из вулканического стекла.', items: [{ id: 'obsidian_shard', rarityLevel: 'recycled' }, { id: 'magma_scale', rarityLevel: 'common' }, { id: 'fire_opal', rarityLevel: 'rare' }], collectibleId: 'volcanic_heart', specialGeodeName: 'Вулканическое сердце', specialGeodeIcon: '❤️‍🔥', specialGeodeDescription: 'Пульсирующий камень из жерла вулкана.' },
  { id: 'tar_pits', name: 'Смоляные ямы', geodeName: 'Смоляная жеода', geodeIcon: '🖤', geodeDescription: 'Вязкая жеода из природной смолы.', items: [{ id: 'tar_clump', rarityLevel: 'junk' }, { id: 'bone_tar', rarityLevel: 'recycled' }, { id: 'amber_fossil', rarityLevel: 'common' }], collectibleId: 'tar_heart', specialGeodeName: 'Смоляное сердце', specialGeodeIcon: '🖤', specialGeodeDescription: 'Сгусток древней смолы с душой ископаемого.' },
  { id: 'cactusforest', name: 'Кактусовый лес', geodeName: 'Кактусовая жеода', geodeIcon: '🌵', geodeDescription: 'Жеода, найденная внутри гигантского кактуса.', items: [{ id: 'cactus_spine', rarityLevel: 'junk' }, { id: 'cactus_fiber', rarityLevel: 'recycled' }, { id: 'desert_pearl', rarityLevel: 'rare' }], collectibleId: null }
], ERAS['wildlands'], [30, 55, 80, 105, 130, 155]));

// Глубинные Пещеры — жеоды
Object.assign(CONFIG_GEODES, generateGeodes([
  { id: 'crystalgrotto', name: 'Хрустальный грот', geodeName: 'Хрустальная жеода', geodeIcon: '💠', geodeDescription: 'Сверкающая жеода из горного хрусталя.', items: [{ id: 'quartz_shard', rarityLevel: 'recycled' }, { id: 'amethyst_cluster', rarityLevel: 'common' }, { id: 'diamond_raw', rarityLevel: 'rare' }], collectibleId: 'crystal_soul', specialGeodeName: 'Кристальная душа', specialGeodeIcon: '💎', specialGeodeDescription: 'Кристалл с отражением души.' },
  { id: 'undergroundlake', name: 'Подземное озеро', geodeName: 'Озёрная жеода', geodeIcon: '🫧', geodeDescription: 'Влажная жеода с озёрного дна.', items: [{ id: 'lake_pearl', rarityLevel: 'recycled' }, { id: 'abyssal_scale', rarityLevel: 'common' }, { id: 'water_crystal', rarityLevel: 'rare' }], collectibleId: 'abyss_eye', specialGeodeName: 'Глаз бездны', specialGeodeIcon: '👁️', specialGeodeDescription: 'Слепой глаз пещерного гиганта.' },
  { id: 'magmaheart', name: 'Сердце магмы', geodeName: 'Лавовая жеода', geodeIcon: '🔴', geodeDescription: 'Обжигающая жеода из магматической камеры.', items: [{ id: 'basalt_chunk', rarityLevel: 'recycled' }, { id: 'lava_gem', rarityLevel: 'common' }, { id: 'ruby_core', rarityLevel: 'epic' }], collectibleId: 'magma_soul', specialGeodeName: 'Душа магмы', specialGeodeIcon: '🔥', specialGeodeDescription: 'Сгусток чистой магмы, обретший сознание.' },
  { id: 'fossildepths', name: 'Ископаемые глубины', geodeName: 'Костяная жеода', geodeIcon: '🦴', geodeDescription: 'Жеода из окаменелых костей.', items: [{ id: 'bone_shard', rarityLevel: 'recycled' }, { id: 'skull_fragment', rarityLevel: 'common' }, { id: 'amber_eye', rarityLevel: 'rare' }], collectibleId: null },
  { id: 'glowwormcave', name: 'Пещера светлячков', geodeName: 'Светящаяся жеода', geodeIcon: '🟢', geodeDescription: 'Биолюминесцентная жеода.', items: [{ id: 'silk_thread', rarityLevel: 'recycled' }, { id: 'glow_goo', rarityLevel: 'common' }, { id: 'cocoon_gem', rarityLevel: 'rare' }], collectibleId: null },
  { id: 'deepmushroom', name: 'Глубинный гриб', geodeName: 'Грибная жеода', geodeIcon: '🍄', geodeDescription: 'Жеода, выросшая на гигантском грибе.', items: [{ id: 'spore_cap', rarityLevel: 'recycled' }, { id: 'mycelium_brick', rarityLevel: 'common' }, { id: 'truffle_gem', rarityLevel: 'rare' }], collectibleId: null }
], ERAS['deepcaverns'], [60, 90, 120, 150, 180, 210]));

// Индустриальная Эра — жеоды
Object.assign(CONFIG_GEODES, generateGeodes([
  { id: 'rustfactory', name: 'Ржавый завод', geodeName: 'Заводская жеода', geodeIcon: '⚙️', geodeDescription: 'Жеода из заводских отходов.', items: [{ id: 'gear_scrap', rarityLevel: 'recycled' }, { id: 'piston_rod', rarityLevel: 'common' }, { id: 'boiler_plate', rarityLevel: 'common' }], collectibleId: null },
  { id: 'techswamp', name: 'Техно-свалка', geodeName: 'Электронная жеода', geodeIcon: '📟', geodeDescription: 'Жеода из электронного мусора.', items: [{ id: 'circuit_board', rarityLevel: 'rare' }, { id: 'copper_coil', rarityLevel: 'common' }, { id: 'led_scrap', rarityLevel: 'recycled' }], collectibleId: 'nano_swarm', specialGeodeName: 'Нано-рой', specialGeodeIcon: '🦠', specialGeodeDescription: 'Колония самовоспроизводящихся нанороботов.' },
  { id: 'abandonedlab', name: 'Заброшенная лаборатория', geodeName: 'Лабораторная жеода', geodeIcon: '🧪', geodeDescription: 'Жеода из лабораторных отходов.', items: [{ id: 'chem_vial', rarityLevel: 'rare' }, { id: 'nano_powder', rarityLevel: 'epic' }, { id: 'glassware', rarityLevel: 'common' }], collectibleId: 'ai_chip', specialGeodeName: 'Чип ИИ', specialGeodeIcon: '🧠', specialGeodeDescription: 'Процессор древнего искусственного интеллекта.' },
  { id: 'powerplant', name: 'Электростанция', geodeName: 'Реакторная жеода', geodeIcon: '☢️', geodeDescription: 'Радиоактивная жеода.', items: [{ id: 'uranium_ore', rarityLevel: 'rare' }, { id: 'coolant_rod', rarityLevel: 'common' }, { id: 'turbine_blade', rarityLevel: 'epic' }], collectibleId: 'reactor_core', specialGeodeName: 'Реакторное ядро', specialGeodeIcon: '☢️', specialGeodeDescription: 'Миниатюрный реактор.' },
  { id: 'scrapyard', name: 'Авто-свалка', geodeName: 'Автомобильная жеода', geodeIcon: '🚗', geodeDescription: 'Жеода из автомобильных останков.', items: [{ id: 'car_chassis', rarityLevel: 'recycled' }, { id: 'muffler_pipe', rarityLevel: 'common' }, { id: 'catalytic_core', rarityLevel: 'rare' }], collectibleId: null },
  { id: 'oilrefinery', name: 'Нефтепереработка', geodeName: 'Нефтяная жеода', geodeIcon: '🛢️', geodeDescription: 'Жеода из нефтяных отложений.', items: [{ id: 'crude_oil', rarityLevel: 'recycled' }, { id: 'polymer_chunk', rarityLevel: 'common' }, { id: 'oil_crystal', rarityLevel: 'rare' }], collectibleId: null }
], ERAS['industrial'], [180, 220, 260, 300, 340, 380]));

// Астральные Миры — жеоды
Object.assign(CONFIG_GEODES, generateGeodes([
  { id: 'nebula', name: 'Туманность', geodeName: 'Звёздная жеода', geodeIcon: '✨', geodeDescription: 'Жеода из космической пыли.', items: [{ id: 'star_dust', rarityLevel: 'rare' }, { id: 'void_essence', rarityLevel: 'epic' }, { id: 'light_fragment', rarityLevel: 'common' }], collectibleId: 'star_heart', specialGeodeName: 'Звёздное сердце', specialGeodeIcon: '⭐', specialGeodeDescription: 'Сердце умирающей звезды.' },
  { id: 'gravitywell', name: 'Гравитационный колодец', geodeName: 'Гравитонная жеода', geodeIcon: '🪨', geodeDescription: 'Жеода, искажающая гравитацию.', items: [{ id: 'graviton_ore', rarityLevel: 'rare' }, { id: 'mass_shard', rarityLevel: 'common' }, { id: 'singular_pearl', rarityLevel: 'epic' }], collectibleId: null },
  { id: 'quasar', name: 'Квазар', geodeName: 'Квазарная жеода', geodeIcon: '🔵', geodeDescription: 'Жеода из плазменных выбросов.', items: [{ id: 'plasma_orb', rarityLevel: 'rare' }, { id: 'quasar_core', rarityLevel: 'legendary' }, { id: 'beam_crystal', rarityLevel: 'epic' }], collectibleId: 'quasar_pulse', specialGeodeName: 'Пульс квазара', specialGeodeIcon: '💥', specialGeodeDescription: 'Энергетический импульс от далёкого квазара.' },
  { id: 'darkmatter', name: 'Тёмная материя', geodeName: 'Тёмная жеода', geodeIcon: '🖤', geodeDescription: 'Жеода из тёмной материи.', items: [{ id: 'dark_shard', rarityLevel: 'rare' }, { id: 'antimatter_flake', rarityLevel: 'epic' }, { id: 'reality_fabric', rarityLevel: 'legendary' }], collectibleId: 'void_soul', specialGeodeName: 'Душа пустоты', specialGeodeIcon: '🕳️', specialGeodeDescription: 'Сущность, рождённая в абсолютной пустоте.' },
  { id: 'wormhole', name: 'Кротовая нора', geodeName: 'Портальная жеода', geodeIcon: '🌀', geodeDescription: 'Жеода из червоточины.', items: [{ id: 'portal_stone', rarityLevel: 'rare' }, { id: 'bridge_crystal', rarityLevel: 'epic' }, { id: 'wormhole_heart', rarityLevel: 'legendary' }], collectibleId: null },
  { id: 'supernova', name: 'Сверхновая', geodeName: 'Жеода сверхновой', geodeIcon: '🌫️', geodeDescription: 'Жеода из остатков сверхновой.', items: [{ id: 'nova_ash', rarityLevel: 'rare' }, { id: 'pulsar_fragment', rarityLevel: 'epic' }, { id: 'supernova_core', rarityLevel: 'legendary' }], collectibleId: null }
], ERAS['astral'], [300, 360, 420, 480, 540, 600]));

// Трансценденция — жеоды
Object.assign(CONFIG_GEODES, generateGeodes([
  { id: 'creationforge', name: 'Кузница творения', geodeName: 'Жеода творения', geodeIcon: '💧', geodeDescription: 'Жеода из изначальной эссенции.', items: [{ id: 'primordial_essence', rarityLevel: 'rare' }, { id: 'creator_spark', rarityLevel: 'epic' }, { id: 'creation_core', rarityLevel: 'legendary' }], collectibleId: 'creation_spark', specialGeodeName: 'Искра творения', specialGeodeIcon: '⚡', specialGeodeDescription: 'Первая искра, породившая вселенную.' },
  { id: 'chronorift', name: 'Хроно-разлом', geodeName: 'Временная жеода', geodeIcon: '⏳', geodeDescription: 'Жеода из разлома времени.', items: [{ id: 'time_sand', rarityLevel: 'rare' }, { id: 'chrono_crystal', rarityLevel: 'epic' }, { id: 'eternity_shard', rarityLevel: 'legendary' }], collectibleId: 'time_gem', specialGeodeName: 'Самоцвет времени', specialGeodeIcon: '⏳', specialGeodeDescription: 'Драгоценный камень с обратным временем.' },
  { id: 'multiverse', name: 'Мультивселенная', geodeName: 'Жеода реальностей', geodeIcon: '🪞', geodeDescription: 'Жеода из ткани реальности.', items: [{ id: 'reality_shard', rarityLevel: 'epic' }, { id: 'dimension_fabric', rarityLevel: 'legendary' }, { id: 'omniverse_key', rarityLevel: 'mythic' }], collectibleId: 'omniverse_orb', specialGeodeName: 'Сфера вселенных', specialGeodeIcon: '🔮', specialGeodeDescription: 'Сфера с бесконечным множеством вселенных.' },
  { id: 'entropyfields', name: 'Поля энтропии', geodeName: 'Энтропийная жеода', geodeIcon: '🌫️', geodeDescription: 'Жеода из энтропийной пыли.', items: [{ id: 'entropy_dust', rarityLevel: 'rare' }, { id: 'decay_crystal', rarityLevel: 'epic' }, { id: 'heat_death_core', rarityLevel: 'legendary' }], collectibleId: null },
  { id: 'infinity', name: 'Бесконечность', geodeName: 'Бесконечная жеода', geodeIcon: '✨', geodeDescription: 'Жеода из бесконечной пыли.', items: [{ id: 'infinite_dust', rarityLevel: 'epic' }, { id: 'loop_stone', rarityLevel: 'legendary' }, { id: 'infinity_core', rarityLevel: 'mythic' }], collectibleId: null },
  { id: 'source', name: 'Источник', geodeName: 'Жеода источника', geodeIcon: '💫', geodeDescription: 'Жеода из центра мироздания.', items: [{ id: 'source_dust', rarityLevel: 'epic' }, { id: 'source_crystal', rarityLevel: 'legendary' }, { id: 'source_of_all', rarityLevel: 'mythic' }], collectibleId: 'source_shard', specialGeodeName: 'Осколок источника', specialGeodeIcon: '💫', specialGeodeDescription: 'Фрагмент самого источника всего сущего.' }
], ERAS['transcendence'], [600, 720, 840, 960, 1080, 1200]));

// Метеоритные жеоды (для Метеоритного Шторма)
Object.assign(CONFIG_GEODES, {
  meteor_common: {
    id: 'meteor_common', name: 'Космический обломок', icon: '☄️', isSpecial: false, timer: 60,
    description: 'Обычный осколок метеоритного дождя.',
    stages: [
      { minTaps: 7, maxTaps: 10, imagePath: 'assets/geodes/meteor_common_stage1.png', fallbackIcon: '☄️' },
      { minTaps: 3, maxTaps: 6, imagePath: 'assets/geodes/meteor_common_stage2.png', fallbackIcon: '💫' },
      { minTaps: 1, maxTaps: 2, imagePath: 'assets/geodes/meteor_common_stage3.png', fallbackIcon: '💥' }
    ],
    lootTable: [
      { ingotId: 'rheolite', chance: 0.35 }, { ingotId: 'ferrite', chance: 0.30 },
      { ingotId: 'cosmic_steel', chance: 0.20 }, { ingotId: 'siderite', chance: 0.10 },
      { ingotId: 'star_silver', chance: 0.05 }
    ],
    xpValue: 15
  },
  meteor_rare: {
    id: 'meteor_rare', name: 'Звёздное ядро', icon: '🌟', isSpecial: false, timer: 600,
    description: 'Редкое ядро разрушенной звезды.',
    stages: [
      { minTaps: 7, maxTaps: 10, imagePath: 'assets/geodes/meteor_rare_stage1.png', fallbackIcon: '🌟' },
      { minTaps: 3, maxTaps: 6, imagePath: 'assets/geodes/meteor_rare_stage2.png', fallbackIcon: '✨' },
      { minTaps: 1, maxTaps: 2, imagePath: 'assets/geodes/meteor_rare_stage3.png', fallbackIcon: '💥' }
    ],
    lootTable: [
      { ingotId: 'siderite', chance: 0.25 }, { ingotId: 'star_silver', chance: 0.25 },
      { ingotId: 'astralium', chance: 0.20 }, { ingotId: 'luminor', chance: 0.15 },
      { ingotId: 'meteor_gold', chance: 0.10 }, { ingotId: 'singular', chance: 0.05 }
    ],
    xpValue: 50
  },
  meteor_legendary: {
    id: 'meteor_legendary', name: 'Осколок Пустоты', icon: '🕳️', isSpecial: false, timer: 1800,
    description: 'Легендарный осколок из глубин Межгалактической Пустоты.',
    stages: [
      { minTaps: 7, maxTaps: 10, imagePath: 'assets/geodes/meteor_legendary_stage1.png', fallbackIcon: '🕳️' },
      { minTaps: 3, maxTaps: 6, imagePath: 'assets/geodes/meteor_legendary_stage2.png', fallbackIcon: '🌌' },
      { minTaps: 1, maxTaps: 2, imagePath: 'assets/geodes/meteor_legendary_stage3.png', fallbackIcon: '💥' }
    ],
    lootTable: [
      { ingotId: 'astralium', chance: 0.20 }, { ingotId: 'meteor_gold', chance: 0.20 },
      { ingotId: 'singular', chance: 0.25 }, { ingotId: 'nebulite', chance: 0.25 },
      { ingotId: 'cosmonium', chance: 0.10 }
    ],
    xpValue: 120
  },
  special_meteor: {
    id: 'special_meteor', name: 'Ядро Галактики', icon: '🌀', isSpecial: true, location: 'meteor', timer: 3600,
    description: 'Сердце падшей звезды.',
    stages: [
      { minTaps: 7, maxTaps: 10, imagePath: 'assets/geodes/special_meteor_stage1.png', fallbackIcon: '🌀' },
      { minTaps: 3, maxTaps: 6, imagePath: 'assets/geodes/special_meteor_stage2.png', fallbackIcon: '🌌' },
      { minTaps: 1, maxTaps: 2, imagePath: 'assets/geodes/special_meteor_stage3.png', fallbackIcon: '💫' }
    ],
    possibleIngots: ['orion', 'andromeda'],
    xpValue: 300
  }
});

// ============================================================
// ГРУППЫ ЭКСПЕДИЦИЙ: ВСЕ 6 ЭПОХ
// ============================================================
export const EXPEDITION_GROUPS = [
  {
    id: 'mire',
    name: 'Трясина',
    icon: '🫧',
    expeditions: [
      { id: 'swamp', name: 'Болото', description: 'Вязкая топь, полная тинистых отложений. Самое безопасное место для начала пути.', imagePath: 'assets/expeditions/swamp.png', fallbackIcon: '🫧', timer: 10, requiredLevel: 1, specialGeodeChance: 0.08, specialGeodeId: 'special_swamp', unlockedByDefault: true, unlockCost: 0, unlockLevel: 1 },
      { id: 'rotforest', name: 'Гнилой лес', description: 'Мёртвый лес, где деревья превратились в подобие металла.', imagePath: 'assets/expeditions/rotforest.png', fallbackIcon: '🌲', timer: 25, requiredLevel: 1, specialGeodeChance: 0.10, specialGeodeId: 'special_rotforest', unlockedByDefault: false, unlockCost: 0, unlockLevel: 3 },
      { id: 'rustbottom', name: 'Ржавое дно', description: 'Высохшее озеро, усеянное остатками древних механизмов.', imagePath: 'assets/expeditions/rustbottom.png', fallbackIcon: '⚙️', timer: 45, requiredLevel: 1, specialGeodeChance: 0.12, specialGeodeId: 'special_rustbottom', unlockedByDefault: false, unlockCost: 0, unlockLevel: 6 },
      { id: 'mossycave', name: 'Мшистая пещера', description: 'Влажная пещера, покрытая светящимся мхом.', imagePath: 'assets/expeditions/mossycave.png', fallbackIcon: '🌿', timer: 60, requiredLevel: 1, specialGeodeChance: 0.06, specialGeodeId: null, unlockedByDefault: false, unlockCost: 0, unlockLevel: 7 },
      { id: 'peatbog', name: 'Торфяное болото', description: 'Глубокие залежи торфа с вкраплениями янтаря.', imagePath: 'assets/expeditions/peatbog.png', fallbackIcon: '🟫', timer: 75, requiredLevel: 1, specialGeodeChance: 0.07, specialGeodeId: null, unlockedByDefault: false, unlockCost: 0, unlockLevel: 8 },
      { id: 'willowgrove', name: 'Ивовая роща', description: 'Священная роща древних ив. Их корни уходят на километры вглубь.', imagePath: 'assets/expeditions/willowgrove.png', fallbackIcon: '🌳', timer: 90, requiredLevel: 1, specialGeodeChance: 0.08, specialGeodeId: null, unlockedByDefault: false, unlockCost: 0, unlockLevel: 9 }
    ]
  },
  {
    id: 'wildlands',
    name: 'Дикие Земли',
    icon: '🌋',
    expeditions: [
      { id: 'ashwaste', name: 'Пепельная пустошь', description: 'Выжженная земля, покрытая вулканическим пеплом.', imagePath: 'assets/expeditions/ashwaste.png', fallbackIcon: '🪶', timer: 120, requiredLevel: 1, specialGeodeChance: 0.06, specialGeodeId: null, unlockedByDefault: false, unlockCost: 0, unlockLevel: 11 },
      { id: 'stonedesert', name: 'Каменная пустыня', description: 'Бескрайняя пустыня, где ветер отшлифовал камни до блеска.', imagePath: 'assets/expeditions/stonedesert.png', fallbackIcon: '🪨', timer: 150, requiredLevel: 1, specialGeodeChance: 0.08, specialGeodeId: 'special_stonedesert', unlockedByDefault: false, unlockCost: 0, unlockLevel: 13 },
      { id: 'saltcaves', name: 'Соляные пещеры', description: 'Лабиринт соляных тоннелей с кристальными стенами.', imagePath: 'assets/expeditions/saltcaves.png', fallbackIcon: '💎', timer: 180, requiredLevel: 1, specialGeodeChance: 0.07, specialGeodeId: null, unlockedByDefault: false, unlockCost: 0, unlockLevel: 15 },
      { id: 'magmafissure', name: 'Магматическая трещина', description: 'Разлом в земной коре. Опасно, но награда стоит риска.', imagePath: 'assets/expeditions/magmafissure.png', fallbackIcon: '🖤', timer: 210, requiredLevel: 1, specialGeodeChance: 0.10, specialGeodeId: 'special_magmafissure', unlockedByDefault: false, unlockCost: 0, unlockLevel: 17 },
      { id: 'tar_pits', name: 'Смоляные ямы', description: 'Древние ловушки, где до сих пор находят ископаемых.', imagePath: 'assets/expeditions/tar_pits.png', fallbackIcon: '🖤', timer: 240, requiredLevel: 1, specialGeodeChance: 0.08, specialGeodeId: 'special_tar_pits', unlockedByDefault: false, unlockCost: 0, unlockLevel: 19 },
      { id: 'cactusforest', name: 'Кактусовый лес', description: 'Лес гигантских кактусов, внутри которых скрыты сокровища.', imagePath: 'assets/expeditions/cactusforest.png', fallbackIcon: '🌵', timer: 270, requiredLevel: 1, specialGeodeChance: 0.09, specialGeodeId: null, unlockedByDefault: false, unlockCost: 0, unlockLevel: 21 }
    ]
  },
  {
    id: 'deepcaverns',
    name: 'Глубинные Пещеры',
    icon: '🕳️',
    expeditions: [
      { id: 'crystalgrotto', name: 'Хрустальный грот', description: 'Подземный зал, стены которого усыпаны драгоценными камнями.', imagePath: 'assets/expeditions/crystalgrotto.png', fallbackIcon: '💠', timer: 300, requiredLevel: 1, specialGeodeChance: 0.10, specialGeodeId: 'special_crystalgrotto', unlockedByDefault: false, unlockCost: 0, unlockLevel: 26 },
      { id: 'undergroundlake', name: 'Подземное озеро', description: 'Огромное озеро в толще земли. Его глубины никто не измерял.', imagePath: 'assets/expeditions/undergroundlake.png', fallbackIcon: '🫧', timer: 330, requiredLevel: 1, specialGeodeChance: 0.09, specialGeodeId: 'special_undergroundlake', unlockedByDefault: false, unlockCost: 0, unlockLevel: 29 },
      { id: 'magmaheart', name: 'Сердце магмы', description: 'Раскалённая камера с озёрами жидкой лавы.', imagePath: 'assets/expeditions/magmaheart.png', fallbackIcon: '🔴', timer: 360, requiredLevel: 1, specialGeodeChance: 0.12, specialGeodeId: 'special_magmaheart', unlockedByDefault: false, unlockCost: 0, unlockLevel: 32 },
      { id: 'fossildepths', name: 'Ископаемые глубины', description: 'Кладбище древних ящеров. Кости здесь твёрже стали.', imagePath: 'assets/expeditions/fossildepths.png', fallbackIcon: '🦴', timer: 390, requiredLevel: 1, specialGeodeChance: 0.07, specialGeodeId: null, unlockedByDefault: false, unlockCost: 0, unlockLevel: 35 },
      { id: 'glowwormcave', name: 'Пещера светлячков', description: 'Тоннели, освещённые миллионами биолюминесцентных существ.', imagePath: 'assets/expeditions/glowwormcave.png', fallbackIcon: '🟢', timer: 420, requiredLevel: 1, specialGeodeChance: 0.08, specialGeodeId: null, unlockedByDefault: false, unlockCost: 0, unlockLevel: 37 },
      { id: 'deepmushroom', name: 'Глубинный гриб', description: 'Лес гигантских подземных грибов высотой с небоскрёб.', imagePath: 'assets/expeditions/deepmushroom.png', fallbackIcon: '🍄', timer: 450, requiredLevel: 1, specialGeodeChance: 0.09, specialGeodeId: null, unlockedByDefault: false, unlockCost: 0, unlockLevel: 39 }
    ]
  },
  {
    id: 'industrial',
    name: 'Индустриальная Эра',
    icon: '⚙️',
    expeditions: [
      { id: 'rustfactory', name: 'Ржавый завод', description: 'Огромный заброшенный завод. Машины ещё дышат паром.', imagePath: 'assets/expeditions/rustfactory.png', fallbackIcon: '⚙️', timer: 480, requiredLevel: 1, specialGeodeChance: 0.08, specialGeodeId: null, unlockedByDefault: false, unlockCost: 0, unlockLevel: 43 },
      { id: 'techswamp', name: 'Техно-свалка', description: 'Болото из электронных отходов. Микросхемы растут как грибы.', imagePath: 'assets/expeditions/techswamp.png', fallbackIcon: '📟', timer: 510, requiredLevel: 1, specialGeodeChance: 0.11, specialGeodeId: 'special_techswamp', unlockedByDefault: false, unlockCost: 0, unlockLevel: 46 },
      { id: 'abandonedlab', name: 'Заброшенная лаборатория', description: 'Секретная лаборатория. Эксперименты ещё продолжаются.', imagePath: 'assets/expeditions/abandonedlab.png', fallbackIcon: '🧪', timer: 540, requiredLevel: 1, specialGeodeChance: 0.13, specialGeodeId: 'special_abandonedlab', unlockedByDefault: false, unlockCost: 0, unlockLevel: 49 },
      { id: 'powerplant', name: 'Электростанция', description: 'Ядерный реактор. Радиация мутировала всё вокруг.', imagePath: 'assets/expeditions/powerplant.png', fallbackIcon: '☢️', timer: 570, requiredLevel: 1, specialGeodeChance: 0.10, specialGeodeId: 'special_powerplant', unlockedByDefault: false, unlockCost: 0, unlockLevel: 52 },
      { id: 'scrapyard', name: 'Авто-свалка', description: 'Кладбище автомобилей. Ржавчина и масло повсюду.', imagePath: 'assets/expeditions/scrapyard.png', fallbackIcon: '🚗', timer: 600, requiredLevel: 1, specialGeodeChance: 0.07, specialGeodeId: null, unlockedByDefault: false, unlockCost: 0, unlockLevel: 55 },
      { id: 'oilrefinery', name: 'Нефтепереработка', description: 'Заброшенный нефтезавод. Густая нефть сочится из труб.', imagePath: 'assets/expeditions/oilrefinery.png', fallbackIcon: '🛢️', timer: 630, requiredLevel: 1, specialGeodeChance: 0.08, specialGeodeId: null, unlockedByDefault: false, unlockCost: 0, unlockLevel: 57 }
    ]
  },
  {
    id: 'astral',
    name: 'Астральные Миры',
    icon: '🌌',
    expeditions: [
      { id: 'nebula', name: 'Туманность', description: 'Облако космической пыли, где рождаются новые звёзды.', imagePath: 'assets/expeditions/nebula.png', fallbackIcon: '✨', timer: 660, requiredLevel: 1, specialGeodeChance: 0.12, specialGeodeId: 'special_nebula', unlockedByDefault: false, unlockCost: 0, unlockLevel: 61 },
      { id: 'gravitywell', name: 'Гравитационный колодец', description: 'Область с аномальной гравитацией. Даже свет изгибается.', imagePath: 'assets/expeditions/gravitywell.png', fallbackIcon: '🪨', timer: 690, requiredLevel: 1, specialGeodeChance: 0.09, specialGeodeId: null, unlockedByDefault: false, unlockCost: 0, unlockLevel: 64 },
      { id: 'quasar', name: 'Квазар', description: 'Сверхмассивная чёрная дыра, выбрасывающая плазму.', imagePath: 'assets/expeditions/quasar.png', fallbackIcon: '🔵', timer: 720, requiredLevel: 1, specialGeodeChance: 0.14, specialGeodeId: 'special_quasar', unlockedByDefault: false, unlockCost: 0, unlockLevel: 67 },
      { id: 'darkmatter', name: 'Тёмная материя', description: 'Невидимая субстанция, пронизывающая космос.', imagePath: 'assets/expeditions/darkmatter.png', fallbackIcon: '🖤', timer: 750, requiredLevel: 1, specialGeodeChance: 0.11, specialGeodeId: 'special_darkmatter', unlockedByDefault: false, unlockCost: 0, unlockLevel: 70 },
      { id: 'wormhole', name: 'Кротовая нора', description: 'Туннель сквозь пространство-время.', imagePath: 'assets/expeditions/wormhole.png', fallbackIcon: '🌀', timer: 780, requiredLevel: 1, specialGeodeChance: 0.10, specialGeodeId: null, unlockedByDefault: false, unlockCost: 0, unlockLevel: 73 },
      { id: 'supernova', name: 'Сверхновая', description: 'Останки взорвавшейся звезды. Фантастическая красота.', imagePath: 'assets/expeditions/supernova.png', fallbackIcon: '🌫️', timer: 810, requiredLevel: 1, specialGeodeChance: 0.13, specialGeodeId: null, unlockedByDefault: false, unlockCost: 0, unlockLevel: 76 }
    ]
  },
  {
    id: 'transcendence',
    name: 'Трансценденция',
    icon: '♾️',
    expeditions: [
      { id: 'creationforge', name: 'Кузница творения', description: 'Место, где была выкована первая материя.', imagePath: 'assets/expeditions/creationforge.png', fallbackIcon: '💧', timer: 840, requiredLevel: 1, specialGeodeChance: 0.15, specialGeodeId: 'special_creationforge', unlockedByDefault: false, unlockCost: 0, unlockLevel: 81 },
      { id: 'chronorift', name: 'Хроно-разлом', description: 'Трещина во времени. Прошлое и будущее смешались.', imagePath: 'assets/expeditions/chronorift.png', fallbackIcon: '⏳', timer: 870, requiredLevel: 1, specialGeodeChance: 0.12, specialGeodeId: 'special_chronorift', unlockedByDefault: false, unlockCost: 0, unlockLevel: 84 },
      { id: 'multiverse', name: 'Мультивселенная', description: 'Перекрёсток бесконечных реальностей.', imagePath: 'assets/expeditions/multiverse.png', fallbackIcon: '🪞', timer: 900, requiredLevel: 1, specialGeodeChance: 0.16, specialGeodeId: 'special_multiverse', unlockedByDefault: false, unlockCost: 0, unlockLevel: 87 },
      { id: 'entropyfields', name: 'Поля энтропии', description: 'Пространство, где всё распадается на атомы.', imagePath: 'assets/expeditions/entropyfields.png', fallbackIcon: '🌫️', timer: 930, requiredLevel: 1, specialGeodeChance: 0.10, specialGeodeId: null, unlockedByDefault: false, unlockCost: 0, unlockLevel: 90 },
      { id: 'infinity', name: 'Бесконечность', description: 'Бескрайнее ничто, наполненное чистой энергией.', imagePath: 'assets/expeditions/infinity.png', fallbackIcon: '✨', timer: 960, requiredLevel: 1, specialGeodeChance: 0.14, specialGeodeId: null, unlockedByDefault: false, unlockCost: 0, unlockLevel: 93 },
      { id: 'source', name: 'Источник', description: 'Центр всего сущего. Здесь зародилась вселенная.', imagePath: 'assets/expeditions/source.png', fallbackIcon: '💫', timer: 1000, requiredLevel: 1, specialGeodeChance: 0.18, specialGeodeId: 'special_source', unlockedByDefault: false, unlockCost: 0, unlockLevel: 96 }
    ]
  }
];

export const CONFIG_EXPEDITIONS = {};
EXPEDITION_GROUPS.forEach(group => {
  group.expeditions.forEach(exp => {
    CONFIG_EXPEDITIONS[exp.id] = exp;
  });
});

// ============================================================
// АЛХИМИЯ: РЕЦЕПТЫ СПЛАВОВ (ВСЕ ЭПОХИ)
// ============================================================
export const ALCHEMY_RECIPES = {
  // ===== ТРЯСИНА =====
  silt_mass: { id: 'silt_mass', name: 'Иловая масса', icon: '🟤', description: 'Смесь влажного песка и грязи.', ingredients: ['wet_sand', 'mud_ingot'], resultIngotId: 'silt_mass', location: 'swamp', reqLevel: 3, xpReward: 25, discoveryBonusXP: 50, shavingsCost: 20 },
  bog_clump: { id: 'bog_clump', name: 'Топкий ком', icon: '🟢', description: 'Ком влажного песка и ила.', ingredients: ['wet_sand', 'silt_clump'], resultIngotId: 'bog_clump', location: 'swamp', reqLevel: 3, xpReward: 25, discoveryBonusXP: 50, shavingsCost: 25 },
  swamp_mix: { id: 'swamp_mix', name: 'Болотная смесь', icon: '🟤', description: 'Однородная смесь грязи и ила.', ingredients: ['mud_ingot', 'silt_clump'], resultIngotId: 'swamp_mix', location: 'swamp', reqLevel: 3, xpReward: 25, discoveryBonusXP: 50, shavingsCost: 25 },
  rot_mix: { id: 'rot_mix', name: 'Трухлявая смесь', icon: '🪵', description: 'Смесь корявого бруска и коры.', ingredients: ['warped_bar', 'bark_ingot'], resultIngotId: 'rot_mix', location: 'rotforest', reqLevel: 3, xpReward: 30, discoveryBonusXP: 60, shavingsCost: 30 },
  rot_alloy: { id: 'rot_alloy', name: 'Гнилой сплав', icon: '🦴', description: 'Сплав корявого бруска и сгнившего сука.', ingredients: ['warped_bar', 'rotted_bough'], resultIngotId: 'rot_alloy', location: 'rotforest', reqLevel: 3, xpReward: 30, discoveryBonusXP: 60, shavingsCost: 30 },
  root_clump: { id: 'root_clump', name: 'Корневой ком', icon: '🧱', description: 'Ком коры и гнилого сука.', ingredients: ['bark_ingot', 'rotted_bough'], resultIngotId: 'root_clump', location: 'rotforest', reqLevel: 3, xpReward: 30, discoveryBonusXP: 60, shavingsCost: 30 },
  rust_alloy: { id: 'rust_alloy', name: 'Ржавый сплав', icon: '🔩', description: 'Сплав металлолома и проволоки.', ingredients: ['rusty_scrap', 'wire_clump'], resultIngotId: 'rust_alloy', location: 'rustbottom', reqLevel: 3, xpReward: 35, discoveryBonusXP: 70, shavingsCost: 40 },
  scrap_mix: { id: 'scrap_mix', name: 'Битый сплав', icon: '🧩', description: 'Сплав металлолома и битого кафеля.', ingredients: ['rusty_scrap', 'broken_tile'], resultIngotId: 'scrap_mix', location: 'rustbottom', reqLevel: 3, xpReward: 35, discoveryBonusXP: 70, shavingsCost: 40 },
  scrap_ingot: { id: 'scrap_ingot', name: 'Металлоломный слиток', icon: '🧶', description: 'Слиток из проволоки и кафеля.', ingredients: ['wire_clump', 'broken_tile'], resultIngotId: 'scrap_ingot', location: 'rustbottom', reqLevel: 3, xpReward: 35, discoveryBonusXP: 70, shavingsCost: 40 },

  // ===== ДИКИЕ ЗЕМЛИ =====
  cinder_block: { id: 'cinder_block', name: 'Пепельный блок', icon: '🪶', description: 'Спрессованный пепел и магма.', ingredients: ['cinder_chunk', 'smolder_core'], resultIngotId: 'cinder_block', location: 'ashwaste', reqLevel: 12, xpReward: 80, discoveryBonusXP: 160, shavingsCost: 100 },
  magma_brick: { id: 'magma_brick', name: 'Магматический кирпич', icon: '🧱', description: 'Кирпич из застывшей лавы.', ingredients: ['cinder_chunk', 'ember_dust'], resultIngotId: 'magma_brick', location: 'ashwaste', reqLevel: 12, xpReward: 85, discoveryBonusXP: 170, shavingsCost: 110 },
  sand_alloy: { id: 'sand_alloy', name: 'Песчаный сплав', icon: '🪨', description: 'Сплав песка и окаменелостей.', ingredients: ['grit_chunk', 'sand_brick'], resultIngotId: 'sand_alloy', location: 'stonedesert', reqLevel: 14, xpReward: 90, discoveryBonusXP: 180, shavingsCost: 120 },
  salt_brick: { id: 'salt_brick', name: 'Соляной кирпич', icon: '💎', description: 'Прессованная соль с жемчугом.', ingredients: ['salt_crystal', 'brine_pearl'], resultIngotId: 'salt_brick', location: 'saltcaves', reqLevel: 16, xpReward: 95, discoveryBonusXP: 190, shavingsCost: 130 },
  volcanic_glass: { id: 'volcanic_glass', name: 'Вулканическое стекло', icon: '🖤', description: 'Сплав обсидиана с магмой.', ingredients: ['obsidian_shard', 'magma_scale'], resultIngotId: 'volcanic_glass', location: 'magmafissure', reqLevel: 18, xpReward: 100, discoveryBonusXP: 200, shavingsCost: 140 },
  tar_resin: { id: 'tar_resin', name: 'Смоляная смола', icon: '🖤', description: 'Очищенная смола с костяной крошкой.', ingredients: ['tar_clump', 'bone_tar'], resultIngotId: 'tar_resin', location: 'tar_pits', reqLevel: 20, xpReward: 105, discoveryBonusXP: 210, shavingsCost: 150 },
  cactus_plate: { id: 'cactus_plate', name: 'Кактусовая плита', icon: '🌵', description: 'Прессованное кактусовое волокно.', ingredients: ['cactus_spine', 'cactus_fiber'], resultIngotId: 'cactus_plate', location: 'cactusforest', reqLevel: 21, xpReward: 110, discoveryBonusXP: 220, shavingsCost: 160 },
  desert_glass: { id: 'desert_glass', name: 'Пустынное стекло', icon: '💠', description: 'Стекло из пустынного жемчуга.', ingredients: ['desert_pearl', 'sand_brick'], resultIngotId: 'desert_glass', location: 'cactusforest', reqLevel: 22, xpReward: 120, discoveryBonusXP: 240, shavingsCost: 170 },
  fossil_plate: { id: 'fossil_plate', name: 'Ископаемая плита', icon: '🦴', description: 'Плита из спрессованных окаменелостей.', ingredients: ['fossil_fragment', 'amber_fossil'], resultIngotId: 'fossil_plate', location: 'stonedesert', reqLevel: 22, xpReward: 125, discoveryBonusXP: 250, shavingsCost: 180 },

  // ===== ГЛУБИННЫЕ ПЕЩЕРЫ =====
  crystal_glass: { id: 'crystal_glass', name: 'Хрустальное стекло', icon: '💠', description: 'Стекло из кварца и аметиста.', ingredients: ['quartz_shard', 'amethyst_cluster'], resultIngotId: 'crystal_glass', location: 'crystalgrotto', reqLevel: 27, xpReward: 180, discoveryBonusXP: 360, shavingsCost: 250 },
  pearl_alloy: { id: 'pearl_alloy', name: 'Жемчужный сплав', icon: '🫧', description: 'Сплав жемчуга и чешуи.', ingredients: ['lake_pearl', 'abyssal_scale'], resultIngotId: 'pearl_alloy', location: 'undergroundlake', reqLevel: 30, xpReward: 190, discoveryBonusXP: 380, shavingsCost: 270 },
  basalt_brick: { id: 'basalt_brick', name: 'Базальтовый кирпич', icon: '🪨', description: 'Кирпич из базальта и лавы.', ingredients: ['basalt_chunk', 'lava_gem'], resultIngotId: 'basalt_brick', location: 'magmaheart', reqLevel: 33, xpReward: 200, discoveryBonusXP: 400, shavingsCost: 290 },
  bone_plate: { id: 'bone_plate', name: 'Костяная плита', icon: '🦴', description: 'Плита из кости и черепа.', ingredients: ['bone_shard', 'skull_fragment'], resultIngotId: 'bone_plate', location: 'fossildepths', reqLevel: 36, xpReward: 210, discoveryBonusXP: 420, shavingsCost: 310 },
  glow_brick: { id: 'glow_brick', name: 'Светящийся кирпич', icon: '🟢', description: 'Кирпич из светящейся слизи.', ingredients: ['silk_thread', 'glow_goo'], resultIngotId: 'glow_brick', location: 'glowwormcave', reqLevel: 38, xpReward: 220, discoveryBonusXP: 440, shavingsCost: 330 },
  mushroom_plate: { id: 'mushroom_plate', name: 'Грибная плита', icon: '🍄', description: 'Плита из грибницы и спор.', ingredients: ['spore_cap', 'mycelium_brick'], resultIngotId: 'mushroom_plate', location: 'deepmushroom', reqLevel: 40, xpReward: 230, discoveryBonusXP: 460, shavingsCost: 350 },
  diamond_dust: { id: 'diamond_dust', name: 'Алмазная пыль', icon: '💎', description: 'Пыль из алмазов и рубинов.', ingredients: ['diamond_raw', 'ruby_core'], resultIngotId: 'diamond_dust', location: 'crystalgrotto', reqLevel: 40, xpReward: 250, discoveryBonusXP: 500, shavingsCost: 380 },
  lake_stone: { id: 'lake_stone', name: 'Озёрный камень', icon: '💧', description: 'Камень из водяного кристалла.', ingredients: ['water_crystal', 'abyssal_scale'], resultIngotId: 'lake_stone', location: 'undergroundlake', reqLevel: 40, xpReward: 240, discoveryBonusXP: 480, shavingsCost: 360 },
  cave_metal: { id: 'cave_metal', name: 'Пещерный металл', icon: '⛏️', description: 'Металл из трюфельного самоцвета.', ingredients: ['truffle_gem', 'cocoon_gem'], resultIngotId: 'cave_metal', location: 'deepmushroom', reqLevel: 41, xpReward: 260, discoveryBonusXP: 520, shavingsCost: 400 },

  // ===== ИНДУСТРИАЛЬНАЯ ЭРА =====
  gear_alloy: { id: 'gear_alloy', name: 'Шестерёночный сплав', icon: '⚙️', description: 'Сплав шестерён и поршней.', ingredients: ['gear_scrap', 'piston_rod'], resultIngotId: 'gear_alloy', location: 'rustfactory', reqLevel: 44, xpReward: 400, discoveryBonusXP: 800, shavingsCost: 600 },
  circuit_gold: { id: 'circuit_gold', name: 'Микросхемное золото', icon: '📟', description: 'Золото из печатных плат.', ingredients: ['circuit_board', 'copper_coil'], resultIngotId: 'circuit_gold', location: 'techswamp', reqLevel: 47, xpReward: 430, discoveryBonusXP: 860, shavingsCost: 650 },
  chem_metal: { id: 'chem_metal', name: 'Химический металл', icon: '🧪', description: 'Металл из химических ампул.', ingredients: ['chem_vial', 'nano_powder'], resultIngotId: 'chem_metal', location: 'abandonedlab', reqLevel: 50, xpReward: 460, discoveryBonusXP: 920, shavingsCost: 700 },
  uranium_glass: { id: 'uranium_glass', name: 'Урановое стекло', icon: '☢️', description: 'Стекло из урановой руды.', ingredients: ['uranium_ore', 'coolant_rod'], resultIngotId: 'uranium_glass', location: 'powerplant', reqLevel: 53, xpReward: 490, discoveryBonusXP: 980, shavingsCost: 750 },
  car_metal: { id: 'car_metal', name: 'Автомобильный металл', icon: '🚗', description: 'Металл из автомобильного остова.', ingredients: ['car_chassis', 'muffler_pipe'], resultIngotId: 'car_metal', location: 'scrapyard', reqLevel: 56, xpReward: 520, discoveryBonusXP: 1040, shavingsCost: 800 },
  oil_plastic: { id: 'oil_plastic', name: 'Нефтяной пластик', icon: '🛢️', description: 'Пластик из сырой нефти.', ingredients: ['crude_oil', 'polymer_chunk'], resultIngotId: 'oil_plastic', location: 'oilrefinery', reqLevel: 58, xpReward: 550, discoveryBonusXP: 1100, shavingsCost: 850 },
  turbine_blade_alloy: { id: 'turbine_blade_alloy', name: 'Турбинный сплав', icon: '🌀', description: 'Сплав из лопастей турбин.', ingredients: ['turbine_blade', 'gear_scrap'], resultIngotId: 'turbine_blade_alloy', location: 'powerplant', reqLevel: 59, xpReward: 580, discoveryBonusXP: 1160, shavingsCost: 900 },
  catalytic_metal: { id: 'catalytic_metal', name: 'Каталитический металл', icon: '💠', description: 'Металл из катализатора.', ingredients: ['catalytic_core', 'piston_rod'], resultIngotId: 'catalytic_metal', location: 'scrapyard', reqLevel: 60, xpReward: 600, discoveryBonusXP: 1200, shavingsCost: 950 },
  reactor_steel: { id: 'reactor_steel', name: 'Реакторная сталь', icon: '🪣', description: 'Сталь из охлаждающих стержней.', ingredients: ['coolant_rod', 'boiler_plate'], resultIngotId: 'reactor_steel', location: 'powerplant', reqLevel: 60, xpReward: 620, discoveryBonusXP: 1240, shavingsCost: 1000 },

  // ===== АСТРАЛЬНЫЕ МИРЫ =====
  star_alloy: { id: 'star_alloy', name: 'Звёздный сплав', icon: '✨', description: 'Сплав звёздной пыли и света.', ingredients: ['star_dust', 'light_fragment'], resultIngotId: 'star_alloy', location: 'nebula', reqLevel: 62, xpReward: 1000, discoveryBonusXP: 2000, shavingsCost: 1500 },
  grav_metal: { id: 'grav_metal', name: 'Гравитационный металл', icon: '🪨', description: 'Металл из гравитонной руды.', ingredients: ['graviton_ore', 'mass_shard'], resultIngotId: 'grav_metal', location: 'gravitywell', reqLevel: 65, xpReward: 1050, discoveryBonusXP: 2100, shavingsCost: 1600 },
  plasma_steel: { id: 'plasma_steel', name: 'Плазменная сталь', icon: '🔵', description: 'Сталь из плазменной сферы.', ingredients: ['plasma_orb', 'beam_crystal'], resultIngotId: 'plasma_steel', location: 'quasar', reqLevel: 68, xpReward: 1100, discoveryBonusXP: 2200, shavingsCost: 1700 },
  dark_metal: { id: 'dark_metal', name: 'Тёмный металл', icon: '🖤', description: 'Металл из тёмного осколка.', ingredients: ['dark_shard', 'antimatter_flake'], resultIngotId: 'dark_metal', location: 'darkmatter', reqLevel: 71, xpReward: 1150, discoveryBonusXP: 2300, shavingsCost: 1800 },
  portal_stone: { id: 'portal_stone', name: 'Портальный камень', icon: '🌀', description: 'Камень из червоточины.', ingredients: ['portal_stone', 'bridge_crystal'], resultIngotId: 'portal_stone', location: 'wormhole', reqLevel: 74, xpReward: 1200, discoveryBonusXP: 2400, shavingsCost: 1900 },
  nova_steel: { id: 'nova_steel', name: 'Сталь сверхновой', icon: '🌫️', description: 'Сталь из пепла сверхновой.', ingredients: ['nova_ash', 'pulsar_fragment'], resultIngotId: 'nova_steel', location: 'supernova', reqLevel: 77, xpReward: 1250, discoveryBonusXP: 2500, shavingsCost: 2000 },
  quasar_metal: { id: 'quasar_metal', name: 'Квазарный металл', icon: '💥', description: 'Металл из ядра квазара.', ingredients: ['quasar_core', 'plasma_orb'], resultIngotId: 'quasar_metal', location: 'quasar', reqLevel: 78, xpReward: 1300, discoveryBonusXP: 2600, shavingsCost: 2100 },
  void_alloy: { id: 'void_alloy', name: 'Сплав пустоты', icon: '🕳️', description: 'Сплав эссенции пустоты.', ingredients: ['void_essence', 'dark_shard'], resultIngotId: 'void_alloy', location: 'nebula', reqLevel: 79, xpReward: 1350, discoveryBonusXP: 2700, shavingsCost: 2200 },
  reality_metal: { id: 'reality_metal', name: 'Металл реальности', icon: '🕸️', description: 'Металл из ткани реальности.', ingredients: ['reality_fabric', 'antimatter_flake'], resultIngotId: 'reality_metal', location: 'darkmatter', reqLevel: 80, xpReward: 1400, discoveryBonusXP: 2800, shavingsCost: 2300 },

  // ===== ТРАНСЦЕНДЕНЦИЯ =====
  creation_metal: { id: 'creation_metal', name: 'Металл творения', icon: '💧', description: 'Металл из изначальной эссенции.', ingredients: ['primordial_essence', 'creator_spark'], resultIngotId: 'creation_metal', location: 'creationforge', reqLevel: 82, xpReward: 2000, discoveryBonusXP: 4000, shavingsCost: 3000 },
  time_alloy: { id: 'time_alloy', name: 'Временной сплав', icon: '⏳', description: 'Сплав из песка времени.', ingredients: ['time_sand', 'chrono_crystal'], resultIngotId: 'time_alloy', location: 'chronorift', reqLevel: 85, xpReward: 2100, discoveryBonusXP: 4200, shavingsCost: 3200 },
  reality_alloy: { id: 'reality_alloy', name: 'Сплав реальностей', icon: '🪞', description: 'Сплав из осколков реальности.', ingredients: ['reality_shard', 'dimension_fabric'], resultIngotId: 'reality_alloy', location: 'multiverse', reqLevel: 88, xpReward: 2200, discoveryBonusXP: 4400, shavingsCost: 3400 },
  entropy_metal: { id: 'entropy_metal', name: 'Энтропийный металл', icon: '🌫️', description: 'Металл из энтропийной пыли.', ingredients: ['entropy_dust', 'decay_crystal'], resultIngotId: 'entropy_metal', location: 'entropyfields', reqLevel: 91, xpReward: 2300, discoveryBonusXP: 4600, shavingsCost: 3600 },
  infinite_alloy: { id: 'infinite_alloy', name: 'Бесконечный сплав', icon: '✨', description: 'Сплав из бесконечной пыли.', ingredients: ['infinite_dust', 'loop_stone'], resultIngotId: 'infinite_alloy', location: 'infinity', reqLevel: 94, xpReward: 2400, discoveryBonusXP: 4800, shavingsCost: 3800 },
  source_metal: { id: 'source_metal', name: 'Металл источника', icon: '💫', description: 'Металл из пыли источника.', ingredients: ['source_dust', 'source_crystal'], resultIngotId: 'source_metal', location: 'source', reqLevel: 97, xpReward: 2600, discoveryBonusXP: 5200, shavingsCost: 4000 },
  eternity_steel: { id: 'eternity_steel', name: 'Сталь вечности', icon: '♾️', description: 'Сталь из осколка вечности.', ingredients: ['eternity_shard', 'creation_core'], resultIngotId: 'eternity_steel', location: 'creationforge', reqLevel: 98, xpReward: 2800, discoveryBonusXP: 5600, shavingsCost: 4200 },
  loop_metal: { id: 'loop_metal', name: 'Петлевой металл', icon: '🔄', description: 'Металл из камня петли.', ingredients: ['loop_stone', 'chrono_crystal'], resultIngotId: 'loop_metal', location: 'infinity', reqLevel: 99, xpReward: 3000, discoveryBonusXP: 6000, shavingsCost: 4500 },
  source_alloy: { id: 'source_alloy', name: 'Сплав источника', icon: '☀️', description: 'Сплав из источника всего.', ingredients: ['source_of_all', 'creation_core'], resultIngotId: 'source_alloy', location: 'source', reqLevel: 100, xpReward: 3500, discoveryBonusXP: 7000, shavingsCost: 5000 }
};
// ============================================================
// ЗАКАЗЫ ГИЛЬДИИ (150+ квестов, масштабируемых по эпохам)
// ============================================================
export const GUILD_QUESTS = [
  // ===== ТРЯСИНА (уровни 1-10) =====
  { id: 'quest_1', name: 'Песчаная поставка', description: 'Гильдия просит влажный песок для фильтров.', reqLevel: 1, ingredients: { wet_sand: 3 }, rewardXP: 15 },
  { id: 'quest_2', name: 'Грязевой заказ', description: 'Строителям нужны слитки грязи для укреплений.', reqLevel: 1, ingredients: { mud_ingot: 3 }, rewardXP: 15 },
  { id: 'quest_3', name: 'Иловая проба', description: 'Алхимики изучают тинистые комья.', reqLevel: 2, ingredients: { silt_clump: 2 }, rewardXP: 25 },
  { id: 'quest_4', name: 'Древесный металл', description: 'Корабелы просят корявые бруски.', reqLevel: 3, ingredients: { warped_bar: 2 }, rewardXP: 30, rewardGeode: 'rotforest' },
  { id: 'quest_5', name: 'Корьевой сплав', description: 'Ювелиры ищут слитки коры для отделки.', reqLevel: 3, ingredients: { bark_ingot: 2 }, rewardXP: 30 },
  { id: 'quest_6', name: 'Гнилой сук', description: 'Таксидермистам нужен сгнивший сук.', reqLevel: 4, ingredients: { rotted_bough: 2 }, rewardXP: 35, rewardGeode: 'rotforest' },
  { id: 'quest_7', name: 'Металлоломный контракт', description: 'Кузнецы просят ржавый металлолом на переплавку.', reqLevel: 5, ingredients: { rusty_scrap: 2 }, rewardXP: 50, rewardGeode: 'rustbottom' },
  { id: 'quest_8', name: 'Проволочный моток', description: 'Электрикам нужен комок проволоки.', reqLevel: 5, ingredients: { wire_clump: 3 }, rewardXP: 45 },
  { id: 'quest_9', name: 'Кафельная мозаика', description: 'Реставраторы ищут битый кафель.', reqLevel: 6, ingredients: { broken_tile: 3 }, rewardXP: 45, rewardGeode: 'rustbottom' },
  { id: 'quest_10', name: 'Элитный заказ Гильдии', description: 'Верховный совет просит редкие ресурсы трёх локаций.', reqLevel: 6, ingredients: { silt_clump: 2, rotted_bough: 2, rusty_scrap: 1 }, rewardXP: 100, rewardGeode: 'special_rustbottom' },
  { id: 'quest_11', name: 'Мшистый сбор', description: 'Травники просят мшистые комья.', reqLevel: 7, ingredients: { moss_clump: 4 }, rewardXP: 55 },
  { id: 'quest_12', name: 'Споровый заказ', description: 'Осветители ищут светящиеся споры.', reqLevel: 7, ingredients: { glow_spore: 2 }, rewardXP: 60, rewardGeode: 'mossycave' },
  { id: 'quest_13', name: 'Торфяная поставка', description: 'Топливная гильдия просит торфяные блоки.', reqLevel: 8, ingredients: { peat_block: 4 }, rewardXP: 65 },
  { id: 'quest_14', name: 'Болотное железо', description: 'Оружейники ищут болотное железо.', reqLevel: 8, ingredients: { bog_iron: 2 }, rewardXP: 70, rewardGeode: 'peatbog' },
  { id: 'quest_15', name: 'Ивовая кора', description: 'Корзинщики просят ивовую кору.', reqLevel: 9, ingredients: { willow_bark: 4 }, rewardXP: 75 },
  { id: 'quest_16', name: 'Корневое волокно', description: 'Канатная мастерская ищет корневое волокно.', reqLevel: 10, ingredients: { root_fiber: 2 }, rewardXP: 80, rewardGeode: 'willowgrove' },
  { id: 'quest_17', name: 'Смешанный заказ Трясины', description: 'Гильдия просит по одному ресурсу из каждой локации.', reqLevel: 10, ingredients: { silt_clump: 1, rotted_bough: 1, rusty_scrap: 1, amber_chunk: 1, root_fiber: 1 }, rewardXP: 150, rewardGeode: 'special_swamp' },

  // ===== ДИКИЕ ЗЕМЛИ (уровни 11-25) =====
  { id: 'quest_18', name: 'Пепел пустоши', description: 'Алхимики изучают пепельные осколки.', reqLevel: 11, ingredients: { cinder_chunk: 4 }, rewardXP: 100 },
  { id: 'quest_19', name: 'Тлеющие ядра', description: 'Кузнецы просят тлеющие ядра для горнов.', reqLevel: 12, ingredients: { smolder_core: 3 }, rewardXP: 110, rewardGeode: 'ashwaste' },
  { id: 'quest_20', name: 'Угольная пыль', description: 'Взрывотехники ищут угольную пыль.', reqLevel: 13, ingredients: { ember_dust: 2 }, rewardXP: 120 },
  { id: 'quest_21', name: 'Щебень для дорог', description: 'Строители просят щебень пустоши.', reqLevel: 13, ingredients: { grit_chunk: 4 }, rewardXP: 125 },
  { id: 'quest_22', name: 'Песчаные кирпичи', description: 'Архитекторы ищут песчаные кирпичи.', reqLevel: 14, ingredients: { sand_brick: 3 }, rewardXP: 130, rewardGeode: 'stonedesert' },
  { id: 'quest_23', name: 'Ископаемые находки', description: 'Музей просит окаменелости.', reqLevel: 15, ingredients: { fossil_fragment: 2 }, rewardXP: 140 },
  { id: 'quest_24', name: 'Соляные кристаллы', description: 'Повара ищут соляные кристаллы.', reqLevel: 15, ingredients: { salt_crystal: 3 }, rewardXP: 145, rewardGeode: 'saltcaves' },
  { id: 'quest_25', name: 'Обсидиановые осколки', description: 'Стекольщики просят обсидиан.', reqLevel: 17, ingredients: { obsidian_shard: 3 }, rewardXP: 160 },
  { id: 'quest_26', name: 'Огненные опалы', description: 'Ювелиры ищут огненные опалы.', reqLevel: 18, ingredients: { fire_opal: 1 }, rewardXP: 180, rewardGeode: 'special_magmafissure' },
  { id: 'quest_27', name: 'Смоляные комья', description: 'Факельщики просят смолу.', reqLevel: 19, ingredients: { tar_clump: 4 }, rewardXP: 170 },
  { id: 'quest_28', name: 'Янтарные окаменелости', description: 'Коллекционеры ищут янтарь.', reqLevel: 20, ingredients: { amber_fossil: 2 }, rewardXP: 190, rewardGeode: 'tar_pits' },
  { id: 'quest_29', name: 'Кактусовое волокно', description: 'Ткачи просят кактусовое волокно.', reqLevel: 21, ingredients: { cactus_fiber: 3 }, rewardXP: 200 },
  { id: 'quest_30', name: 'Пустынный жемчуг', description: 'Искатели сокровищ ищут пустынный жемчуг.', reqLevel: 22, ingredients: { desert_pearl: 1 }, rewardXP: 220, rewardGeode: 'cactusforest' },
  { id: 'quest_31', name: 'Вулканический заказ', description: 'Гильдия просит редкие вулканические ресурсы.', reqLevel: 23, ingredients: { ember_dust: 2, magma_scale: 2, fire_opal: 1 }, rewardXP: 300, rewardGeode: 'special_magmafissure' },
  { id: 'quest_32', name: 'Пустынный заказ', description: 'Гильдия просит ресурсы пустыни.', reqLevel: 24, ingredients: { sand_brick: 2, fossil_fragment: 2, desert_pearl: 1 }, rewardXP: 320, rewardGeode: 'special_stonedesert' },
  { id: 'quest_33', name: 'Смешанный заказ Диких Земель', description: 'По одному ресурсу из каждой локации Диких Земель.', reqLevel: 25, ingredients: { cinder_chunk: 2, grit_chunk: 2, salt_crystal: 1, magma_scale: 1, amber_fossil: 1, cactus_fiber: 2 }, rewardXP: 400, rewardGeode: 'special_tar_pits' },

  // ===== ГЛУБИННЫЕ ПЕЩЕРЫ (уровни 26-42) =====
  { id: 'quest_34', name: 'Кварцевые осколки', description: 'Электронщики просят кварц.', reqLevel: 26, ingredients: { quartz_shard: 4 }, rewardXP: 250 },
  { id: 'quest_35', name: 'Аметистовые друзы', description: 'Декораторы ищут аметисты.', reqLevel: 27, ingredients: { amethyst_cluster: 2 }, rewardXP: 270, rewardGeode: 'crystalgrotto' },
  { id: 'quest_36', name: 'Неогранённые алмазы', description: 'Ювелиры просят алмазы.', reqLevel: 28, ingredients: { diamond_raw: 1 }, rewardXP: 300 },
  { id: 'quest_37', name: 'Озёрные жемчужины', description: 'Ныряльщики ищут жемчуг.', reqLevel: 29, ingredients: { lake_pearl: 3 }, rewardXP: 280, rewardGeode: 'undergroundlake' },
  { id: 'quest_38', name: 'Базальтовые глыбы', description: 'Строители просят базальт.', reqLevel: 32, ingredients: { basalt_chunk: 4 }, rewardXP: 310 },
  { id: 'quest_39', name: 'Рубиновые ядра', description: 'Королевский двор ищет рубины.', reqLevel: 33, ingredients: { ruby_core: 1 }, rewardXP: 350, rewardGeode: 'special_magmaheart' },
  { id: 'quest_40', name: 'Костяные осколки', description: 'Археологи просят кости.', reqLevel: 35, ingredients: { bone_shard: 4 }, rewardXP: 330 },
  { id: 'quest_41', name: 'Янтарные глаза', description: 'Таксидермисты ищут янтарные глаза.', reqLevel: 36, ingredients: { amber_eye: 1 }, rewardXP: 360, rewardGeode: 'fossildepths' },
  { id: 'quest_42', name: 'Шёлковые нити', description: 'Ткачи просят шёлк светлячков.', reqLevel: 37, ingredients: { silk_thread: 4 }, rewardXP: 340 },
  { id: 'quest_43', name: 'Коконные самоцветы', description: 'Маги ищут коконные самоцветы.', reqLevel: 38, ingredients: { cocoon_gem: 1 }, rewardXP: 370, rewardGeode: 'glowwormcave' },
  { id: 'quest_44', name: 'Грибничные кирпичи', description: 'Архитекторы просят грибничные кирпичи.', reqLevel: 39, ingredients: { mycelium_brick: 3 }, rewardXP: 360 },
  { id: 'quest_45', name: 'Трюфельные самоцветы', description: 'Гурманы ищут трюфельные самоцветы.', reqLevel: 40, ingredients: { truffle_gem: 1 }, rewardXP: 390, rewardGeode: 'deepmushroom' },
  { id: 'quest_46', name: 'Хрустальный заказ', description: 'Гильдия просит редкие кристаллы.', reqLevel: 40, ingredients: { diamond_raw: 1, ruby_core: 1, water_crystal: 1 }, rewardXP: 450, rewardGeode: 'special_crystalgrotto' },
  { id: 'quest_47', name: 'Пещерный заказ', description: 'Гильдия просит пещерные ресурсы.', reqLevel: 41, ingredients: { lake_pearl: 2, lava_gem: 2, amber_eye: 1, cocoon_gem: 1 }, rewardXP: 500, rewardGeode: 'special_undergroundlake' },
  { id: 'quest_48', name: 'Смешанный заказ Пещер', description: 'По одному ресурсу из каждой локации Пещер.', reqLevel: 42, ingredients: { quartz_shard: 2, lake_pearl: 2, lava_gem: 1, skull_fragment: 1, glow_goo: 2, mycelium_brick: 2 }, rewardXP: 600, rewardGeode: 'special_magmaheart' },

  // ===== ИНДУСТРИАЛЬНАЯ ЭРА (уровни 43-60) =====
  { id: 'quest_49', name: 'Шестерёночный лом', description: 'Механики просят шестерни.', reqLevel: 43, ingredients: { gear_scrap: 4 }, rewardXP: 500 },
  { id: 'quest_50', name: 'Поршневые штоки', description: 'Инженеры ищут поршни.', reqLevel: 44, ingredients: { piston_rod: 3 }, rewardXP: 520, rewardGeode: 'rustfactory' },
  { id: 'quest_51', name: 'Печатные платы', description: 'Электронщики просят платы.', reqLevel: 46, ingredients: { circuit_board: 2 }, rewardXP: 550 },
  { id: 'quest_52', name: 'Медные катушки', description: 'Электрики ищут катушки.', reqLevel: 47, ingredients: { copper_coil: 3 }, rewardXP: 540, rewardGeode: 'techswamp' },
  { id: 'quest_53', name: 'Нанопорошок', description: 'Учёные просят нанопорошок.', reqLevel: 49, ingredients: { nano_powder: 1 }, rewardXP: 600, rewardGeode: 'special_abandonedlab' },
  { id: 'quest_54', name: 'Урановая руда', description: 'Энергетики ищут уран.', reqLevel: 52, ingredients: { uranium_ore: 2 }, rewardXP: 620 },
  { id: 'quest_55', name: 'Турбинные лопасти', description: 'Авиастроители просят лопасти.', reqLevel: 53, ingredients: { turbine_blade: 1 }, rewardXP: 650, rewardGeode: 'special_powerplant' },
  { id: 'quest_56', name: 'Каталитические ядра', description: 'Химики ищут катализаторы.', reqLevel: 55, ingredients: { catalytic_core: 2 }, rewardXP: 640 },
  { id: 'quest_57', name: 'Нефтяные кристаллы', description: 'Геологи просят нефтяные кристаллы.', reqLevel: 57, ingredients: { oil_crystal: 1 }, rewardXP: 660, rewardGeode: 'oilrefinery' },
  { id: 'quest_58', name: 'Техногенный заказ', description: 'Гильдия просит редкие техногенные ресурсы.', reqLevel: 58, ingredients: { circuit_board: 1, nano_powder: 1, uranium_ore: 1, turbine_blade: 1 }, rewardXP: 800, rewardGeode: 'special_techswamp' },
  { id: 'quest_59', name: 'Заводской заказ', description: 'Гильдия просит заводские ресурсы.', reqLevel: 59, ingredients: { gear_scrap: 2, piston_rod: 2, boiler_plate: 2, coolant_rod: 1 }, rewardXP: 850, rewardGeode: 'special_powerplant' },
  { id: 'quest_60', name: 'Смешанный заказ Индустрии', description: 'По одному ресурсу из каждой локации Индустрии.', reqLevel: 60, ingredients: { gear_scrap: 2, circuit_board: 1, chem_vial: 1, uranium_ore: 1, catalytic_core: 1, oil_crystal: 1 }, rewardXP: 1000, rewardGeode: 'special_abandonedlab' },

  // ===== АСТРАЛЬНЫЕ МИРЫ (уровни 61-80) =====
  { id: 'quest_61', name: 'Звёздная пыль', description: 'Астрономы просят звёздную пыль.', reqLevel: 61, ingredients: { star_dust: 3 }, rewardXP: 1000 },
  { id: 'quest_62', name: 'Эссенция пустоты', description: 'Физики ищут эссенцию пустоты.', reqLevel: 62, ingredients: { void_essence: 1 }, rewardXP: 1100, rewardGeode: 'special_nebula' },
  { id: 'quest_63', name: 'Гравитонная руда', description: 'Инженеры просят гравитонную руду.', reqLevel: 64, ingredients: { graviton_ore: 2 }, rewardXP: 1050 },
  { id: 'quest_64', name: 'Сингулярная жемчужина', description: 'Исследователи ищут сингулярную жемчужину.', reqLevel: 65, ingredients: { singular_pearl: 1 }, rewardXP: 1200, rewardGeode: 'gravitywell' },
  { id: 'quest_65', name: 'Плазменная сфера', description: 'Энергетики просят плазму.', reqLevel: 67, ingredients: { plasma_orb: 2 }, rewardXP: 1100 },
  { id: 'quest_66', name: 'Квазарное ядро', description: 'Астрофизики ищут квазарное ядро.', reqLevel: 68, ingredients: { quasar_core: 1 }, rewardXP: 1300, rewardGeode: 'special_quasar' },
  { id: 'quest_67', name: 'Тёмный осколок', description: 'Исследователи тьмы просят тёмные осколки.', reqLevel: 70, ingredients: { dark_shard: 2 }, rewardXP: 1150 },
  { id: 'quest_68', name: 'Антиматерия', description: 'Физики ищут антиматерию.', reqLevel: 71, ingredients: { antimatter_flake: 1 }, rewardXP: 1350, rewardGeode: 'special_darkmatter' },
  { id: 'quest_69', name: 'Мостовой кристалл', description: 'Путешественники просят мостовые кристаллы.', reqLevel: 73, ingredients: { bridge_crystal: 2 }, rewardXP: 1200 },
  { id: 'quest_70', name: 'Сердце кротовой норы', description: 'Пространственные маги ищут сердце кротовой норы.', reqLevel: 74, ingredients: { wormhole_heart: 1 }, rewardXP: 1400, rewardGeode: 'wormhole' },
  { id: 'quest_71', name: 'Пульсарный фрагмент', description: 'Радиоастрономы просят пульсарные фрагменты.', reqLevel: 76, ingredients: { pulsar_fragment: 2 }, rewardXP: 1250 },
  { id: 'quest_72', name: 'Ядро сверхновой', description: 'Космологи ищут ядро сверхновой.', reqLevel: 77, ingredients: { supernova_core: 1 }, rewardXP: 1500, rewardGeode: 'supernova' },
  { id: 'quest_73', name: 'Астральный заказ', description: 'Гильдия просит редкие астральные ресурсы.', reqLevel: 78, ingredients: { star_dust: 2, graviton_ore: 1, plasma_orb: 1, dark_shard: 1 }, rewardXP: 1800, rewardGeode: 'special_quasar' },
  { id: 'quest_74', name: 'Космический заказ', description: 'Гильдия просит космические ресурсы.', reqLevel: 79, ingredients: { void_essence: 1, singular_pearl: 1, quasar_core: 1, antimatter_flake: 1 }, rewardXP: 2000, rewardGeode: 'special_darkmatter' },
  { id: 'quest_75', name: 'Смешанный заказ Астрала', description: 'По одному ресурсу из каждой астральной локации.', reqLevel: 80, ingredients: { star_dust: 2, graviton_ore: 1, plasma_orb: 1, dark_shard: 1, portal_stone: 1, nova_ash: 2 }, rewardXP: 2500, rewardGeode: 'special_nebula' },

  // ===== ТРАНСЦЕНДЕНЦИЯ (уровни 81-100) =====
  { id: 'quest_76', name: 'Изначальная эссенция', description: 'Творцы просят изначальную эссенцию.', reqLevel: 81, ingredients: { primordial_essence: 3 }, rewardXP: 2000 },
  { id: 'quest_77', name: 'Искра творца', description: 'Демиурги ищут искру творца.', reqLevel: 82, ingredients: { creator_spark: 1 }, rewardXP: 2200, rewardGeode: 'special_creationforge' },
  { id: 'quest_78', name: 'Песок времени', description: 'Хрономанты просят песок времени.', reqLevel: 84, ingredients: { time_sand: 3 }, rewardXP: 2100 },
  { id: 'quest_79', name: 'Хроно-кристалл', description: 'Временные маги ищут хроно-кристаллы.', reqLevel: 85, ingredients: { chrono_crystal: 1 }, rewardXP: 2400, rewardGeode: 'special_chronorift' },
  { id: 'quest_80', name: 'Осколок реальности', description: 'Путешественники по мирам просят осколки реальности.', reqLevel: 87, ingredients: { reality_shard: 2 }, rewardXP: 2300 },
  { id: 'quest_81', name: 'Ключ вселенных', description: 'Стражи врат ищут ключ вселенных.', reqLevel: 88, ingredients: { omniverse_key: 1 }, rewardXP: 2600, rewardGeode: 'special_multiverse' },
  { id: 'quest_82', name: 'Энтропийная пыль', description: 'Разрушители просят энтропийную пыль.', reqLevel: 90, ingredients: { entropy_dust: 3 }, rewardXP: 2400 },
  { id: 'quest_83', name: 'Кристалл распада', description: 'Некроманты ищут кристаллы распада.', reqLevel: 91, ingredients: { decay_crystal: 1 }, rewardXP: 2600, rewardGeode: 'entropyfields' },
  { id: 'quest_84', name: 'Бесконечная пыль', description: 'Математики просят бесконечную пыль.', reqLevel: 93, ingredients: { infinite_dust: 3 }, rewardXP: 2500 },
  { id: 'quest_85', name: 'Ядро бесконечности', description: 'Философы ищут ядро бесконечности.', reqLevel: 94, ingredients: { infinity_core: 1 }, rewardXP: 2800, rewardGeode: 'infinity' },
  { id: 'quest_86', name: 'Пыль источника', description: 'Искатели истины просят пыль источника.', reqLevel: 96, ingredients: { source_dust: 3 }, rewardXP: 2700 },
  { id: 'quest_87', name: 'Источник всего', description: 'Верховные маги ищут источник всего.', reqLevel: 97, ingredients: { source_of_all: 1 }, rewardXP: 3000, rewardGeode: 'special_source' },
  { id: 'quest_88', name: 'Трансцендентный заказ', description: 'Гильдия просит редкие трансцендентные ресурсы.', reqLevel: 98, ingredients: { creation_core: 1, eternity_shard: 1, omniverse_key: 1 }, rewardXP: 3500, rewardGeode: 'special_creationforge' },
  { id: 'quest_89', name: 'Божественный заказ', description: 'Гильдия просит божественные ресурсы.', reqLevel: 99, ingredients: { creator_spark: 1, chrono_crystal: 1, infinity_core: 1, source_crystal: 1 }, rewardXP: 4000, rewardGeode: 'special_source' },
  { id: 'quest_90', name: 'Финальный заказ Гильдии', description: 'Соберите по одному ресурсу из каждой локации Трансценденции.', reqLevel: 100, ingredients: { creation_core: 1, eternity_shard: 1, omniverse_key: 1, heat_death_core: 1, infinity_core: 1, source_of_all: 1 }, rewardXP: 5000, rewardGeode: 'special_source' }
];

// ============================================================
// УРОВНИ ИГРОКА И СТАТУСЫ (расширено до 100)
// ============================================================
export const LEVELS = [
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

export const STATUSES = [
  'Болотный странник', 'Иловый собиратель', 'Тинистый геолог', 'Лесной сталкер', 'Древесный кузнец',
  'Гнилой мастер', 'Ржавый искатель', 'Хранитель дна', 'Мшистый исследователь', 'Торфяной копатель',
  'Ивовый путник', 'Пепельный скиталец', 'Пустынный кочевник', 'Соляной шахтёр', 'Обсидиановый воин',
  'Смоляной охотник', 'Кактусовый рейнджер', 'Вулканический маг', 'Магматический лорд', 'Костяной археолог',
  'Хрустальный грот', 'Алмазный искатель', 'Озёрный ныряльщик', 'Бездонный глаз', 'Магмовый сердцеед',
  'Ископаемый воин', 'Светлячковый ткач', 'Грибной алхимик', 'Трюфельный гурман', 'Пещерный король',
  'Шестерёночный механик', 'Поршневой инженер', 'Микросхемный маг', 'Медный электрик', 'Нано-алхимик',
  'Урановый герой', 'Турбинный пилот', 'Каталитический химик', 'Нефтяной магнат', 'Заводской лорд',
  'Звёздный странник', 'Пустотный исследователь', 'Гравитонный мастер', 'Сингулярный физик', 'Плазменный воин',
  'Квазарный охотник', 'Тёмный материалист', 'Антиматериальный маг', 'Портальный путник', 'Пульсарный астроном',
  'Сверхновый герой', 'Астральный владыка', 'Космический титан', 'Творец реальности', 'Изначальный демиург',
  'Хроно-мастер', 'Временной лорд', 'Мультивселенский странник', 'Энтропийный разрушитель', 'Бесконечный математик',
  'Источниковый искатель', 'Трансцендентный маг', 'Божественный кузнец', 'Вечный творец', 'Абсолют'
];

// ============================================================
// СЛОТЫ ЭКИПИРОВКИ (расширено до 5 слотов для высоких уровней)
// ============================================================
export const EQUIP_SLOTS_CONFIG = {
  maxSlots: 5,
  unlockLevels: { 2: 10, 3: 25, 4: 50, 5: 80 },
  startingSlots: 1
};

// ============================================================
// СОСТОЯНИЕ ПО УМОЛЧАНИЮ
// ============================================================
export const DEFAULT_STATE = {
  expeditions: {},
  geodes: { swamp: 3 },
  ingots: {},
  discoveredSpecialGeodes: {},
  collectedArtifacts: { swamp: [], rotforest: [], rustbottom: [], meteor: [] },
  minedStats: {},
  player: { level: 1, xp: 0, totalOpened: 0, totalIngots: 0, totalArtifacts: 0 },
  echoCooldowns: {},
  expeditionBonuses: {},
  completedQuests: [],
  equippedArtifacts: [null, null, null, null, null],
  unlockedExpeditions: ['swamp'],
  discoveredAlchemyRecipes: []
};

// Инициализируем экспедиции для всех 36 локаций
EXPEDITION_GROUPS.forEach(group => {
  group.expeditions.forEach(exp => {
    DEFAULT_STATE.expeditions[exp.id] = { active: false, endTime: null, scanUsed: false, specialChanceBoost: null };
    DEFAULT_STATE.geodes[exp.id] = 0;
    DEFAULT_STATE.discoveredSpecialGeodes[exp.id] = false;
    DEFAULT_STATE.collectedArtifacts[exp.id] = [];
  });
});

// Добавляем метеоритные жеоды
DEFAULT_STATE.geodes.meteor_common = 0;
DEFAULT_STATE.geodes.meteor_rare = 0;
DEFAULT_STATE.geodes.meteor_legendary = 0;
DEFAULT_STATE.geodes.special_meteor = 0;
DEFAULT_STATE.collectedArtifacts.meteor = [];

// Инициализируем ingots и minedStats
Object.keys(CONFIG_ITEMS).forEach(k => {
  DEFAULT_STATE.ingots[k] = 0;
  DEFAULT_STATE.minedStats[k] = 0;
});

// ============================================================
// ИВЕНТЫ
// ============================================================
export const EVENTS_CONFIG = {
  rotationInterval: 30 * 60 * 1000,
  eventDuration: 15 * 60 * 1000,
  events: ['great_smelt', 'meteor_storm', 'contracts'],
  great_smelt: { id: 'great_smelt', name: 'Великая Переплавка', icon: '🔥', description: 'Древние кузни остывают!', longDescription: 'Собери ресурсы и создай крафтовые предметы в Плавильне!' },
  meteor_storm: { id: 'meteor_storm', name: 'Метеоритный Шторм', icon: '☄️', description: 'Небо пылает!', longDescription: 'Метеориты падают с небес! Тапай по ним, чтобы собрать осколки.', stormDuration: 30, meteorTypes: { legendary: { icon: '✨', emoji: '✨', color: '#FFD700', glowColor: 'rgba(255, 215, 0, 0.8)', speed: 2.2, size: 55, spawnWeight: 0.08, pointsPerUnit: 1, requiredForGeode: 2 }, rare: { icon: '🔥', emoji: '🔥', color: '#FF8C00', glowColor: 'rgba(255, 140, 0, 0.7)', speed: 3.0, size: 48, spawnWeight: 0.27, pointsPerUnit: 1, requiredForGeode: 4 }, common: { icon: '☄️', emoji: '☄️', color: '#A0A0A0', glowColor: 'rgba(160, 160, 160, 0.6)', speed: 3.8, size: 40, spawnWeight: 0.65, pointsPerUnit: 1, requiredForGeode: 6 } }, spawnInterval: 400, maxMeteorsOnScreen: 12, rewards: { legendary: { geodeId: 'special_meteor', geodeCount: 1, xpBonus: 150 }, rare: { geodeId: 'meteor_legendary', geodeCount: 1, xpBonus: 60 }, common: { geodeId: 'meteor_common', geodeCount: 1, xpBonus: 20 } } }
};

// ============================================================
// МЕТЕОРИТНЫЕ СЛИТКИ
// ============================================================
const METEOR_INGOTS = {
  rheolite: { id: 'rheolite', name: 'Реолит', icon: '🪨', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', sourceType: 'meteor', location: 'meteor', glowClass: 'glow-common', description: 'Матовый серый металл, основа основ метеоритного пояса.', imagePath: 'assets/ingots/rheolite.png', fallbackColor: '#9E9E9E', isCollectible: false, xpValue: 8, sellValue: 8 },
  ferrite: { id: 'ferrite', name: 'Феррит', icon: '🪨', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', sourceType: 'meteor', location: 'meteor', glowClass: 'glow-common', description: 'Тяжёлое, грубое метеоритное железо.', imagePath: 'assets/ingots/ferrite.png', fallbackColor: '#6B6B6B', isCollectible: false, xpValue: 10, sellValue: 10 },
  cosmic_steel: { id: 'cosmic_steel', name: 'Космическая Сталь', icon: '🌌', rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common', sourceType: 'meteor', location: 'meteor', glowClass: 'glow-common', description: 'Прочный сплав из обломков обшивки неизвестных кораблей.', imagePath: 'assets/ingots/cosmic_steel.png', fallbackColor: '#78909C', isCollectible: false, xpValue: 12, sellValue: 12 },
  siderite: { id: 'siderite', name: 'Сидерит', icon: '💫', rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare', sourceType: 'meteor', location: 'meteor', glowClass: 'glow-gold', description: 'Искрящийся ингот с вкраплениями кристаллических космических зёрен.', imagePath: 'assets/ingots/siderite.png', fallbackColor: '#C0C0C0', isCollectible: false, xpValue: 25, sellValue: 25 },
  star_silver: { id: 'star_silver', name: 'Звёздное Серебро', icon: '⭐', rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare', sourceType: 'meteor', location: 'meteor', glowClass: 'glow-platinum', description: 'Благородный металл, излучающий мягкий лунный свет.', imagePath: 'assets/ingots/star_silver.png', fallbackColor: '#E8E8E8', isCollectible: false, xpValue: 30, sellValue: 30 },
  astralium: { id: 'astralium', name: 'Астралиум', icon: '💜', rarity: 'Эпический', rarityClass: 'epic', rarityLevel: 'epic', sourceType: 'meteor', location: 'meteor', glowClass: 'glow-platinum', description: 'Фиолетовый переливающийся сплав, впитавший энергию туманностей.', imagePath: 'assets/ingots/astralium.png', fallbackColor: '#9C27B0', isCollectible: false, xpValue: 50, sellValue: 50 },
  luminor: { id: 'luminor', name: 'Люминор', icon: '💙', rarity: 'Эпический', rarityClass: 'epic', rarityLevel: 'epic', sourceType: 'meteor', location: 'meteor', glowClass: 'glow-platinum', description: 'Ярко-синий ингот, пульсирующий неоновым светом.', imagePath: 'assets/ingots/luminor.png', fallbackColor: '#00BCD4', isCollectible: false, xpValue: 55, sellValue: 55 },
  meteor_gold: { id: 'meteor_gold', name: 'Метеоритное Золото', icon: '✨', rarity: 'Эпический', rarityClass: 'epic', rarityLevel: 'epic', sourceType: 'meteor', location: 'meteor', glowClass: 'glow-platinum', description: 'Чистейшее космическое золото.', imagePath: 'assets/ingots/meteor_gold.png', fallbackColor: '#FFD700', isCollectible: false, xpValue: 60, sellValue: 60 },
  singular: { id: 'singular', name: 'Сингуляр', icon: '🕳️', rarity: 'Легендарный', rarityClass: 'legendary', rarityLevel: 'legendary', sourceType: 'meteor', location: 'meteor', glowClass: 'glow-diamond', description: 'Абсолютно чёрный слиток, поглощающий свет.', imagePath: 'assets/ingots/singular.png', fallbackColor: '#000000', isCollectible: false, xpValue: 100, sellValue: 100 },
  nebulite: { id: 'nebulite', name: 'Небулит', icon: '🌌', rarity: 'Легендарный', rarityClass: 'legendary', rarityLevel: 'legendary', sourceType: 'meteor', location: 'meteor', glowClass: 'glow-diamond', description: 'Металл с переливающейся неоновой микро-галактикой внутри.', imagePath: 'assets/ingots/nebulite.png', fallbackColor: '#FF4081', isCollectible: false, xpValue: 120, sellValue: 120 },
  cosmonium: { id: 'cosmonium', name: 'Космониум', icon: '🌈', rarity: 'Легендарный', rarityClass: 'legendary', rarityLevel: 'legendary', sourceType: 'meteor', location: 'meteor', glowClass: 'glow-diamond', description: 'Вершина космической эволюции.', imagePath: 'assets/ingots/cosmonium.png', fallbackColor: '#FFFFFF', isCollectible: false, xpValue: 150, sellValue: 150 },
  orion: { id: 'orion', name: 'Орион', icon: '🔵', rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible', sourceType: 'special_meteor', location: 'meteor', glowClass: 'glow-osmium', description: 'Глубокий тёмно-синий слиток с эффектом живого звёздного неба.', imagePath: 'assets/ingots/orion.png', fallbackColor: '#0D47A1', isCollectible: true, xpValue: 800, sellValue: 1500, effect_id: 'xp_boost', effect_power: 35, effect_name: 'Бонус опыта +35%' },
  andromeda: { id: 'andromeda', name: 'Андромеда', icon: '💜', rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible', sourceType: 'special_meteor', location: 'meteor', glowClass: 'glow-darkmatter', description: 'Красно-фиолетовый бурлящий металл.', imagePath: 'assets/ingots/andromeda.png', fallbackColor: '#6A1B9A', isCollectible: true, xpValue: 800, sellValue: 1500, effect_id: 'double_drop', effect_power: 15, effect_name: 'Шанс двойного дропа +15%' }
};
Object.assign(CONFIG_ITEMS, METEOR_INGOTS);
