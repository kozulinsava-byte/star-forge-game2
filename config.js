// ============================================================
// STAR FORGE - АЛЬФА 008 "ТРЯСИНА"
// КОНФИГУРАЦИЯ ИГРЫ
// ============================================================

export const CONFIG_ITEMS = {
    // ============================================================
    // РЕДКОСТИ: Хлам → Вторичный → Обычный → Редкий → Эпический → Легендарный → Мифический
    // ============================================================

    // ========== БОЛОТО: ЛУТ ИЗ ТИНИСТОЙ ЖЕОДЫ ==========
    wet_sand: {
        id: 'wet_sand', name: 'Влажный песок', icon: '🏖️',
        rarity: 'Хлам', rarityClass: 'junk', rarityLevel: 'junk',
        sourceType: 'expedition', location: 'swamp',
        glowClass: 'glow-junk',
        description: 'Мокрый песок со дна болота. Слишком грязный даже для стекла, но опытный кузнец найдёт ему применение.',
        imagePath: 'assets/ingots/wet_sand.png', fallbackColor: '#8B7D6B', isCollectible: false, xpValue: 2, sellValue: 2
    },
    mud_ingot: {
        id: 'mud_ingot', name: 'Слиток грязи', icon: '🟤',
        rarity: 'Хлам', rarityClass: 'junk', rarityLevel: 'junk',
        sourceType: 'expedition', location: 'swamp',
        glowClass: 'glow-junk',
        description: 'Спрессованная болотная жижа. Выглядит отвратительно, но после просушки держит форму.',
        imagePath: 'assets/ingots/mud_ingot.png', fallbackColor: '#5C4A3A', isCollectible: false, xpValue: 2, sellValue: 2
    },
    silt_clump: {
        id: 'silt_clump', name: 'Тинистый ком', icon: '🟢',
        rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled',
        sourceType: 'expedition', location: 'swamp',
        glowClass: 'glow-recycled',
        description: 'Комок спрессованного ила с вкраплениями органики. Можно переплавить во что-то приличное.',
        imagePath: 'assets/ingots/silt_clump.png', fallbackColor: '#4A5D3A', isCollectible: false, xpValue: 8, sellValue: 8
    },

    // ========== ГНИЛОЙ ЛЕС: ЛУТ ИЗ ГНИЛОСТНОЙ ЖЕОДЫ ==========
    warped_bar: {
        id: 'warped_bar', name: 'Корявый брусок', icon: '🪵',
        rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled',
        sourceType: 'expedition', location: 'rotforest',
        glowClass: 'glow-recycled',
        description: 'Покорёженный кусок древесного металла. Природа попыталась создать сплав — получилось криво, но прочно.',
        imagePath: 'assets/ingots/warped_bar.png', fallbackColor: '#6B4E3D', isCollectible: false, xpValue: 10, sellValue: 10
    },
    bark_ingot: {
        id: 'bark_ingot', name: 'Слиток коры', icon: '🧱',
        rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled',
        sourceType: 'expedition', location: 'rotforest',
        glowClass: 'glow-recycled',
        description: 'Окаменевшая кора, пропитанная минералами. Твёрже дерева, легче камня.',
        imagePath: 'assets/ingots/bark_ingot.png', fallbackColor: '#5D4E37', isCollectible: false, xpValue: 10, sellValue: 10
    },
    rotted_bough: {
        id: 'rotted_bough', name: 'Сгнивший сук', icon: '🦴',
        rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled',
        sourceType: 'expedition', location: 'rotforest',
        glowClass: 'glow-recycled',
        description: 'Сук древнего дерева, частично обратившийся в труху, но сохранивший металлический блеск сердцевины.',
        imagePath: 'assets/ingots/rotted_bough.png', fallbackColor: '#4A3C2A', isCollectible: false, xpValue: 10, sellValue: 10
    },

    // ========== РЖАВОЕ ДНО: ЛУТ ИЗ РЖАВОЙ ЖЕОДЫ ==========
    rusty_scrap: {
        id: 'rusty_scrap', name: 'Ржавый металлолом', icon: '🔩',
        rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common',
        sourceType: 'expedition', location: 'rustbottom',
        glowClass: 'glow-common',
        description: 'Кусок проржавевшего металла со дна высохшего озера. Под слоем ржавчины скрывается пригодная сталь.',
        imagePath: 'assets/ingots/rusty_scrap.png', fallbackColor: '#8B4513', isCollectible: false, xpValue: 20, sellValue: 20
    },
    wire_clump: {
        id: 'wire_clump', name: 'Комок проволоки', icon: '🧶',
        rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled',
        sourceType: 'expedition', location: 'rustbottom',
        glowClass: 'glow-recycled',
        description: 'Спутанный моток медной проволоки. Местами окислена, но после очистки — ценный материал.',
        imagePath: 'assets/ingots/wire_clump.png', fallbackColor: '#CD7F32', isCollectible: false, xpValue: 12, sellValue: 12
    },
    broken_tile: {
        id: 'broken_tile', name: 'Битый кафель', icon: '🧩',
        rarity: 'Вторичный', rarityClass: 'recycled', rarityLevel: 'recycled',
        sourceType: 'expedition', location: 'rustbottom',
        glowClass: 'glow-recycled',
        description: 'Осколок керамической плитки неизвестного происхождения. Кто-то строил здесь задолго до нас.',
        imagePath: 'assets/ingots/broken_tile.png', fallbackColor: '#C0C0C0', isCollectible: false, xpValue: 12, sellValue: 12
    },

    // ========== КОЛЛЕКЦИОННЫЕ СЛИТКИ ТРЯСИНЫ ==========
    bog_heart: {
        id: 'bog_heart', name: 'Топяной сгусток', icon: '💚',
        rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
        sourceType: 'expedition', location: 'swamp',
        glowClass: 'glow-bogheart',
        description: 'Живой сгусток болотной материи, пульсирующий тусклым зелёным светом. Увеличивает шанс найти что-то ценное среди хлама.',
        imagePath: 'assets/ingots/bog_heart.png', fallbackColor: '#32CD32', isCollectible: true, xpValue: 200, sellValue: 400,
        effect_id: 'recycled_chance', effect_power: 8, effect_name: 'Шанс Вторичного лута +8%'
    },
    rot_core: {
        id: 'rot_core', name: 'Сердцевина гнильца', icon: '🖤',
        rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
        sourceType: 'expedition', location: 'rotforest',
        glowClass: 'glow-rotcore',
        description: 'Чёрная сердцевина мёртвого дерева, источающая ауру распада. Ускоряет экспедиции, вытягивая время из окружения.',
        imagePath: 'assets/ingots/rot_core.png', fallbackColor: '#1A1A1A', isCollectible: true, xpValue: 250, sellValue: 500,
        effect_id: 'expedition_speed', effect_power: 12, effect_name: 'Ускорение экспедиций на 12%'
    },
    rust_nucleus: {
        id: 'rust_nucleus', name: 'Ржавое ядро', icon: '🧡',
        rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
        sourceType: 'expedition', location: 'rustbottom',
        glowClass: 'glow-rustnucleus',
        description: 'Ядро древнего механизма, покрытое благородной ржавчиной. Дарует шанс двойной добычи.',
        imagePath: 'assets/ingots/rust_nucleus.png', fallbackColor: '#FF4500', isCollectible: true, xpValue: 300, sellValue: 600,
        effect_id: 'double_drop', effect_power: 12, effect_name: 'Шанс двойного дропа жеоды 12%'
    },

    // ============================================================
    // МЕТЕОРИТНЫЕ СЛИТКИ (для Метеоритного Шторма)
    // ============================================================
    rheolite: {
        id: 'rheolite', name: 'Реолит', icon: '🪨',
        rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common',
        sourceType: 'meteor', location: 'meteor',
        glowClass: 'glow-iron',
        description: 'Матовый серый металл, основа основ метеоритного пояса.',
        imagePath: 'assets/ingots/rheolite.png', fallbackColor: '#9E9E9E', isCollectible: false, xpValue: 8, sellValue: 8
    },
    ferrite: {
        id: 'ferrite', name: 'Феррит', icon: '🪨',
        rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common',
        sourceType: 'meteor', location: 'meteor',
        glowClass: 'glow-iron',
        description: 'Тяжёлое, грубое метеоритное железо, прошедшее через атмосферу сотен миров.',
        imagePath: 'assets/ingots/ferrite.png', fallbackColor: '#6B6B6B', isCollectible: false, xpValue: 10, sellValue: 10
    },
    cosmic_steel: {
        id: 'cosmic_steel', name: 'Космическая Сталь', icon: '🌌',
        rarity: 'Обычный', rarityClass: 'common', rarityLevel: 'common',
        sourceType: 'meteor', location: 'meteor',
        glowClass: 'glow-iron',
        description: 'Прочный сплав, выкованный из обломков обшивки неизвестных кораблей.',
        imagePath: 'assets/ingots/cosmic_steel.png', fallbackColor: '#78909C', isCollectible: false, xpValue: 12, sellValue: 12
    },
    siderite: {
        id: 'siderite', name: 'Сидерит', icon: '💫',
        rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare',
        sourceType: 'meteor', location: 'meteor',
        glowClass: 'glow-gold',
        description: 'Искрящийся ингот с вкраплениями кристаллических космических зёрен.',
        imagePath: 'assets/ingots/siderite.png', fallbackColor: '#C0C0C0', isCollectible: false, xpValue: 25, sellValue: 25
    },
    star_silver: {
        id: 'star_silver', name: 'Звёздное Серебро', icon: '⭐',
        rarity: 'Редкий', rarityClass: 'rare', rarityLevel: 'rare',
        sourceType: 'meteor', location: 'meteor',
        glowClass: 'glow-platinum',
        description: 'Благородный металл, излучающий мягкий лунный свет даже в полной темноте.',
        imagePath: 'assets/ingots/star_silver.png', fallbackColor: '#E8E8E8', isCollectible: false, xpValue: 30, sellValue: 30
    },
    astralium: {
        id: 'astralium', name: 'Астралиум', icon: '💜',
        rarity: 'Эпический', rarityClass: 'epic', rarityLevel: 'epic',
        sourceType: 'meteor', location: 'meteor',
        glowClass: 'glow-platinum',
        description: 'Фиолетовый переливающийся сплав, впитавший энергию звёздной пыли туманностей.',
        imagePath: 'assets/ingots/astralium.png', fallbackColor: '#9C27B0', isCollectible: false, xpValue: 50, sellValue: 50
    },
    luminor: {
        id: 'luminor', name: 'Люминор', icon: '💙',
        rarity: 'Эпический', rarityClass: 'epic', rarityLevel: 'epic',
        sourceType: 'meteor', location: 'meteor',
        glowClass: 'glow-platinum',
        description: 'Ярко-синий ингот, который пульсирует неоновым светом в присутствии живых существ.',
        imagePath: 'assets/ingots/luminor.png', fallbackColor: '#00BCD4', isCollectible: false, xpValue: 55, sellValue: 55
    },
    meteor_gold: {
        id: 'meteor_gold', name: 'Метеоритное Золото', icon: '✨',
        rarity: 'Эпический', rarityClass: 'epic', rarityLevel: 'epic',
        sourceType: 'meteor', location: 'meteor',
        glowClass: 'glow-platinum',
        description: 'Чистейшее космическое золото со шлейфом из микрочастиц, танцующих вокруг слитка.',
        imagePath: 'assets/ingots/meteor_gold.png', fallbackColor: '#FFD700', isCollectible: false, xpValue: 60, sellValue: 60
    },
    singular: {
        id: 'singular', name: 'Сингуляр', icon: '🕳️',
        rarity: 'Легендарный', rarityClass: 'legendary', rarityLevel: 'legendary',
        sourceType: 'meteor', location: 'meteor',
        glowClass: 'glow-diamond',
        description: 'Абсолютно чёрный слиток, поглощающий свет вокруг себя.',
        imagePath: 'assets/ingots/singular.png', fallbackColor: '#000000', isCollectible: false, xpValue: 100, sellValue: 100
    },
    nebulite: {
        id: 'nebulite', name: 'Небулит', icon: '🌌',
        rarity: 'Легендарный', rarityClass: 'legendary', rarityLevel: 'legendary',
        sourceType: 'meteor', location: 'meteor',
        glowClass: 'glow-diamond',
        description: 'Металл, внутри которого заперта переливающаяся неоновая микро-галактика.',
        imagePath: 'assets/ingots/nebulite.png', fallbackColor: '#FF4081', isCollectible: false, xpValue: 120, sellValue: 120
    },
    cosmonium: {
        id: 'cosmonium', name: 'Космониум', icon: '🌈',
        rarity: 'Легендарный', rarityClass: 'legendary', rarityLevel: 'legendary',
        sourceType: 'meteor', location: 'meteor',
        glowClass: 'glow-diamond',
        description: 'Вершина космической эволюции, сверкающая всеми спектрами радуги одновременно.',
        imagePath: 'assets/ingots/cosmonium.png', fallbackColor: '#FFFFFF', isCollectible: false, xpValue: 150, sellValue: 150
    },

    // ============================================================
    // КОЛЛЕКЦИОННЫЕ МЕТЕОРИТНЫЕ АРТЕФАКТЫ
    // ============================================================
    orion: {
        id: 'orion', name: 'Орион', icon: '🔵',
        rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
        sourceType: 'special_meteor', location: 'meteor',
        glowClass: 'glow-osmium',
        description: 'Глубокий тёмно-синий слиток с эффектом живого звёздного неба внутри.',
        imagePath: 'assets/ingots/orion.png', fallbackColor: '#0D47A1', isCollectible: true, xpValue: 800, sellValue: 1500,
        effect_id: 'xp_boost', effect_power: 35, effect_name: 'Бонус опыта +35% из всех источников'
    },
    andromeda: {
        id: 'andromeda', name: 'Андромеда', icon: '💜',
        rarity: 'COLLECTIBLE', rarityClass: 'collectible', rarityLevel: 'collectible',
        sourceType: 'special_meteor', location: 'meteor',
        glowClass: 'glow-darkmatter',
        description: 'Красно-фиолетовый бурлящий металл, символизирующий расширение Вселенной.',
        imagePath: 'assets/ingots/andromeda.png', fallbackColor: '#6A1B9A', isCollectible: true, xpValue: 800, sellValue: 1500,
        effect_id: 'double_drop', effect_power: 15, effect_name: 'Шанс двойного дропа жеоды 15%'
    }
};

// ============================================================
// КРАФТЫ ПЛАВИЛЬНИ (для Великой Переплавки)
// ============================================================
export const CRAFT_RECIPES = {
    black_mirror: { id: 'black_mirror', name: 'Чёрное Зеркало', icon: '🌑', description: 'Сплав космической стали и сидерита.', resultIngotId: 'black_mirror', ingredients: { cosmic_steel: 2, siderite: 1 }, xpReward: 30, smeltTime: 10, reqLevel: 1 },
    astro_bronze: { id: 'astro_bronze', name: 'Астро-Бронза', icon: '🛰️', description: 'Сплав звёздного серебра и астралиума.', resultIngotId: 'astro_bronze', ingredients: { star_silver: 2, astralium: 1 }, xpReward: 45, smeltTime: 15, reqLevel: 3 },
    chrome_titan: { id: 'chrome_titan', name: 'Хромированный Титан', icon: '🛡️', description: 'Броня из люминора и метеоритного золота.', resultIngotId: 'chrome_titan', ingredients: { luminor: 2, meteor_gold: 1 }, xpReward: 55, smeltTime: 20, reqLevel: 5 },
    platinum_alloy: { id: 'platinum_alloy', name: 'Платиновый Сплав', icon: '💎', description: 'Вершина метеоритной кузни.', resultIngotId: 'platinum_alloy', ingredients: { cosmonium: 2, nebulite: 2, singular: 1 }, xpReward: 75, smeltTime: 25, reqLevel: 6 }
};

// ============================================================
// КРАФТОВЫЕ СЛИТКИ ПЛАВИЛЬНИ
// ============================================================
// Добавляем крафтовые слитки в общий список
CONFIG_ITEMS.black_mirror = {
    id: 'black_mirror', name: 'Чёрное Зеркало', icon: '🌑',
    rarity: 'Крафтовый', rarityClass: 'epic', rarityLevel: 'epic',
    sourceType: 'crafted', location: 'craft',
    glowClass: 'glow-darkmatter',
    description: 'Загадочный артефакт, созданный в горниле Великой Переплавки из космической стали и сидерита.',
    imagePath: 'assets/ingots/black_mirror.png', fallbackColor: '#1a1a1a', isCollectible: false, xpValue: 50, sellValue: 120
};
CONFIG_ITEMS.astro_bronze = {
    id: 'astro_bronze', name: 'Астро-Бронза', icon: '🛰️',
    rarity: 'Крафтовый', rarityClass: 'epic', rarityLevel: 'epic',
    sourceType: 'crafted', location: 'craft',
    glowClass: 'glow-platinum',
    description: 'Сплав, созданный по технологиям древних космических цивилизаций из звёздного серебра и астралиума.',
    imagePath: 'assets/ingots/astro_bronze.png', fallbackColor: '#CDAA7D', isCollectible: false, xpValue: 65, sellValue: 150
};
CONFIG_ITEMS.chrome_titan = {
    id: 'chrome_titan', name: 'Хромированный Титан', icon: '🛡️',
    rarity: 'Крафтовый', rarityClass: 'epic', rarityLevel: 'epic',
    sourceType: 'crafted', location: 'craft',
    glowClass: 'glow-platinum',
    description: 'Сверхпрочная броня из люминора с метеоритным золотом.',
    imagePath: 'assets/ingots/chrome_titan.png', fallbackColor: '#7B9FC5', isCollectible: false, xpValue: 80, sellValue: 180
};
CONFIG_ITEMS.platinum_alloy = {
    id: 'platinum_alloy', name: 'Платиновый Сплав', icon: '💎',
    rarity: 'Крафтовый', rarityClass: 'legendary', rarityLevel: 'legendary',
    sourceType: 'crafted', location: 'craft',
    glowClass: 'glow-diamond',
    description: 'Вершина кузнечного мастерства. Космониум, небулит и сингуляр сливаются в сплав, который не подвластен времени.',
    imagePath: 'assets/ingots/platinum_alloy.png', fallbackColor: '#E6E8FA', isCollectible: false, xpValue: 120, sellValue: 250
};

// ============================================================
// ЖЕОДЫ
// ============================================================
export const CONFIG_GEODES = {
    // ========== БОЛОТО ==========
    swamp: {
        id: 'swamp', name: 'Тинистая жеода', icon: '🟤', isSpecial: false, timer: 10,
        description: 'Ком спрессованного ила, внутри может оказаться что угодно — от мокрого песка до редкого тинистого кома.',
        stages: [
            { minTaps: 7, maxTaps: 10, imagePath: 'assets/geodes/swamp_stage1.png', fallbackIcon: '🟤' },
            { minTaps: 3, maxTaps: 6, imagePath: 'assets/geodes/swamp_stage2.png', fallbackIcon: '💔' },
            { minTaps: 1, maxTaps: 2, imagePath: 'assets/geodes/swamp_stage3.png', fallbackIcon: '💥' }
        ],
        lootTable: [
            { ingotId: 'wet_sand', chance: 0.45 },
            { ingotId: 'mud_ingot', chance: 0.35 },
            { ingotId: 'silt_clump', chance: 0.20 }
        ],
        xpValue: 5
    },

    // ========== ГНИЛОЙ ЛЕС ==========
    rotforest: {
        id: 'rotforest', name: 'Гнилостная жеода', icon: '🪵', isSpecial: false, timer: 25,
        description: 'Жеода, образовавшаяся внутри гниющего ствола. Пахнет сыростью и старыми секретами.',
        stages: [
            { minTaps: 7, maxTaps: 10, imagePath: 'assets/geodes/rotforest_stage1.png', fallbackIcon: '🪵' },
            { minTaps: 3, maxTaps: 6, imagePath: 'assets/geodes/rotforest_stage2.png', fallbackIcon: '🍂' },
            { minTaps: 1, maxTaps: 2, imagePath: 'assets/geodes/rotforest_stage3.png', fallbackIcon: '🪓' }
        ],
        lootTable: [
            { ingotId: 'warped_bar', chance: 0.40 },
            { ingotId: 'bark_ingot', chance: 0.35 },
            { ingotId: 'rotted_bough', chance: 0.25 }
        ],
        xpValue: 8
    },

    // ========== РЖАВОЕ ДНО ==========
    rustbottom: {
        id: 'rustbottom', name: 'Ржавая жеода', icon: '🔩', isSpecial: false, timer: 45,
        description: 'Окисленная капсула со дна пересохшего водоёма. Внутри — остатки забытой цивилизации.',
        stages: [
            { minTaps: 7, maxTaps: 10, imagePath: 'assets/geodes/rustbottom_stage1.png', fallbackIcon: '🔩' },
            { minTaps: 3, maxTaps: 6, imagePath: 'assets/geodes/rustbottom_stage2.png', fallbackIcon: '⚙️' },
            { minTaps: 1, maxTaps: 2, imagePath: 'assets/geodes/rustbottom_stage3.png', fallbackIcon: '💥' }
        ],
        lootTable: [
            { ingotId: 'rusty_scrap', chance: 0.40 },
            { ingotId: 'wire_clump', chance: 0.35 },
            { ingotId: 'broken_tile', chance: 0.25 }
        ],
        xpValue: 12
    },

    // ========== ОСОБЫЕ ЖЕОДЫ ТРЯСИНЫ (КОЛЛЕКЦИОННЫЕ) ==========
    special_swamp: {
        id: 'special_swamp', name: 'Сердце трясины', icon: '💚', isSpecial: true, location: 'swamp', timer: 15,
        description: 'Живая жеода, пульсирующая болотной энергией. Внутри — редчайший Топяной сгусток.',
        stages: [
            { minTaps: 7, maxTaps: 10, imagePath: 'assets/geodes/special_swamp_stage1.png', fallbackIcon: '💚' },
            { minTaps: 3, maxTaps: 6, imagePath: 'assets/geodes/special_swamp_stage2.png', fallbackIcon: '🟢' },
            { minTaps: 1, maxTaps: 2, imagePath: 'assets/geodes/special_swamp_stage3.png', fallbackIcon: '✨' }
        ],
        possibleIngots: ['bog_heart'],
        xpValue: 80
    },

    special_rotforest: {
        id: 'special_rotforest', name: 'Гнилая сердцевина', icon: '🖤', isSpecial: true, location: 'rotforest', timer: 35,
        description: 'Чёрное ядро мёртвого дерева. Содержит Сердцевину гнильца.',
        stages: [
            { minTaps: 7, maxTaps: 10, imagePath: 'assets/geodes/special_rotforest_stage1.png', fallbackIcon: '🖤' },
            { minTaps: 3, maxTaps: 6, imagePath: 'assets/geodes/special_rotforest_stage2.png', fallbackIcon: '🌑' },
            { minTaps: 1, maxTaps: 2, imagePath: 'assets/geodes/special_rotforest_stage3.png', fallbackIcon: '✨' }
        ],
        possibleIngots: ['rot_core'],
        xpValue: 100
    },

    special_rustbottom: {
        id: 'special_rustbottom', name: 'Окисленная капсула', icon: '🧡', isSpecial: true, location: 'rustbottom', timer: 60,
        description: 'Герметичная капсула древних, покрытая благородной ржавчиной. Внутри — Ржавое ядро.',
        stages: [
            { minTaps: 7, maxTaps: 10, imagePath: 'assets/geodes/special_rustbottom_stage1.png', fallbackIcon: '🧡' },
            { minTaps: 3, maxTaps: 6, imagePath: 'assets/geodes/special_rustbottom_stage2.png', fallbackIcon: '⚡' },
            { minTaps: 1, maxTaps: 2, imagePath: 'assets/geodes/special_rustbottom_stage3.png', fallbackIcon: '✨' }
        ],
        possibleIngots: ['rust_nucleus'],
        xpValue: 120
    },

    // ========== МЕТЕОРИТНЫЕ ЖЕОДЫ (для Метеоритного Шторма) ==========
    meteor_common: {
        id: 'meteor_common', name: 'Космический обломок', icon: '☄️', isSpecial: false, timer: 60,
        description: 'Обычный осколок метеоритного дождя.',
        stages: [
            { minTaps: 7, maxTaps: 10, imagePath: 'assets/geodes/meteor_common_stage1.png', fallbackIcon: '☄️' },
            { minTaps: 3, maxTaps: 6, imagePath: 'assets/geodes/meteor_common_stage2.png', fallbackIcon: '💫' },
            { minTaps: 1, maxTaps: 2, imagePath: 'assets/geodes/meteor_common_stage3.png', fallbackIcon: '💥' }
        ],
        lootTable: [
            { ingotId: 'rheolite', chance: 0.35 },
            { ingotId: 'ferrite', chance: 0.30 },
            { ingotId: 'cosmic_steel', chance: 0.20 },
            { ingotId: 'siderite', chance: 0.10 },
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
            { ingotId: 'siderite', chance: 0.25 },
            { ingotId: 'star_silver', chance: 0.25 },
            { ingotId: 'astralium', chance: 0.20 },
            { ingotId: 'luminor', chance: 0.15 },
            { ingotId: 'meteor_gold', chance: 0.10 },
            { ingotId: 'singular', chance: 0.05 }
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
            { ingotId: 'astralium', chance: 0.20 },
            { ingotId: 'meteor_gold', chance: 0.20 },
            { ingotId: 'singular', chance: 0.25 },
            { ingotId: 'nebulite', chance: 0.25 },
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
};

// ============================================================
// ГРУППЫ ЭКСПЕДИЦИЙ: ЭПОХА «ТРЯСИНА»
// ============================================================
export const EXPEDITION_GROUPS = [
    {
        id: 'mire',
        name: 'Трясина',
        icon: '🫧',
        expeditions: [
            {
                id: 'swamp',
                name: 'Болото',
                description: 'Вязкая топь, полная тинистых отложений. Самое безопасное место для начала пути.',
                imagePath: 'assets/expeditions/swamp.png',
                fallbackIcon: '🫧',
                timer: 10,
                requiredLevel: 1,
                specialGeodeChance: 0.08,
                specialGeodeId: 'special_swamp',
                unlockedByDefault: true,
                unlockCost: 0,
                unlockLevel: 1
            },
            {
                id: 'rotforest',
                name: 'Гнилой лес',
                description: 'Мёртвый лес, где деревья превратились в подобие металла. Опаснее, но добыча ценнее.',
                imagePath: 'assets/expeditions/rotforest.png',
                fallbackIcon: '🌲',
                timer: 25,
                requiredLevel: 1,
                specialGeodeChance: 0.10,
                specialGeodeId: 'special_rotforest',
                unlockedByDefault: false,
                unlockCost: 0,
                unlockLevel: 3
            },
            {
                id: 'rustbottom',
                name: 'Ржавое дно',
                description: 'Высохшее озеро, усеянное остатками древних механизмов. Здесь начинается настоящая охота за сокровищами.',
                imagePath: 'assets/expeditions/rustbottom.png',
                fallbackIcon: '⚙️',
                timer: 45,
                requiredLevel: 1,
                specialGeodeChance: 0.12,
                specialGeodeId: 'special_rustbottom',
                unlockedByDefault: false,
                unlockCost: 0,
                unlockLevel: 6
            }
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
// АЛХИМИЯ (появится в следующих этапах)
// ============================================================
export const ALCHEMY_RECIPES = {};

// ============================================================
// ЗАКАЗЫ ГИЛЬДИИ
// ============================================================
export const GUILD_QUESTS = [
    { id: 'quest_1', name: 'Песчаная поставка', description: 'Гильдия просит влажный песок для фильтров.', reqLevel: 1, ingredients: { wet_sand: 3 }, rewardXP: 15 },
    { id: 'quest_2', name: 'Грязевой заказ', description: 'Строителям нужны слитки грязи для укреплений.', reqLevel: 1, ingredients: { mud_ingot: 3 }, rewardXP: 15 },
    { id: 'quest_3', name: 'Иловая проба', description: 'Алхимики изучают тинистые комья.', reqLevel: 2, ingredients: { silt_clump: 2 }, rewardXP: 25 },
    { id: 'quest_4', name: 'Древесный металл', description: 'Корабелы просят корявые бруски.', reqLevel: 3, ingredients: { warped_bar: 2 }, rewardXP: 30, rewardGeode: 'rotforest' },
    { id: 'quest_5', name: 'Корьевой сплав', description: 'Ювелиры ищут слитки коры для отделки.', reqLevel: 3, ingredients: { bark_ingot: 2 }, rewardXP: 30 },
    { id: 'quest_6', name: 'Гнилой сук', description: 'Таксидермистам нужен сгнивший сук.', reqLevel: 4, ingredients: { rotted_bough: 2 }, rewardXP: 35, rewardGeode: 'rotforest' },
    { id: 'quest_7', name: 'Металлоломный контракт', description: 'Кузнецы просят ржавый металлолом на переплавку.', reqLevel: 5, ingredients: { rusty_scrap: 2 }, rewardXP: 50, rewardGeode: 'rustbottom' },
    { id: 'quest_8', name: 'Проволочный моток', description: 'Электрикам нужен комок проволоки.', reqLevel: 5, ingredients: { wire_clump: 3 }, rewardXP: 45 },
    { id: 'quest_9', name: 'Кафельная мозаика', description: 'Реставраторы ищут битый кафель.', reqLevel: 6, ingredients: { broken_tile: 3 }, rewardXP: 45, rewardGeode: 'rustbottom' },
    { id: 'quest_10', name: 'Элитный заказ Гильдии', description: 'Верховный совет просит редкие ресурсы всех трёх локаций.', reqLevel: 6, ingredients: { silt_clump: 2, rotted_bough: 2, rusty_scrap: 1 }, rewardXP: 100, rewardGeode: 'special_rustbottom' }
];

// ============================================================
// УРОВНИ ИГРОКА И СТАТУСЫ
// ============================================================
export const LEVELS = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3300, 4000, 4800, 5700, 6700, 7800, 9000, 10300, 11700, 13200, 15000];
export const STATUSES = ['Болотный странник', 'Иловый собиратель', 'Тинистый геолог', 'Лесной сталкер', 'Древесный кузнец', 'Гнилой мастер', 'Ржавый искатель', 'Хранитель дна', 'Легенда Трясины'];

// ============================================================
// СЛОТЫ ЭКИПИРОВКИ
// ============================================================
export const EQUIP_SLOTS_CONFIG = {
    maxSlots: 3,
    unlockLevels: { 2: 10, 3: 20 },
    startingSlots: 1
};

// ============================================================
// СОСТОЯНИЕ ПО УМОЛЧАНИЮ
// ============================================================
export const DEFAULT_STATE = {
    expeditions: { swamp: { active: false, endTime: null, scanUsed: false, specialChanceBoost: null }, rotforest: { active: false, endTime: null, scanUsed: false, specialChanceBoost: null }, rustbottom: { active: false, endTime: null, scanUsed: false, specialChanceBoost: null } },
    geodes: { swamp: 3, rotforest: 0, rustbottom: 0, special_swamp: 0, special_rotforest: 0, special_rustbottom: 0, meteor_common: 0, meteor_rare: 0, meteor_legendary: 0, special_meteor: 0 },
    ingots: {},
    discoveredSpecialGeodes: { swamp: false, rotforest: false, rustbottom: false, meteor: false },
    collectedArtifacts: { swamp: [], rotforest: [], rustbottom: [], meteor: [] },
    minedStats: {},
    player: { level: 1, xp: 0, totalOpened: 0, totalIngots: 0, totalArtifacts: 0 },
    echoCooldowns: {},
    expeditionBonuses: {},
    completedQuests: [],
    equippedArtifacts: [null, null, null],
    unlockedExpeditions: ['swamp'],
    discoveredAlchemyRecipes: []
};

// ============================================================
// ИВЕНТЫ
// ============================================================
export const EVENTS_CONFIG = {
    rotationInterval: 30 * 60 * 1000,
    eventDuration: 15 * 60 * 1000,
    events: ['great_smelt', 'meteor_storm'],
    great_smelt: { id: 'great_smelt', name: 'Великая Переплавка', icon: '🔥', description: 'Древние кузни остывают!', longDescription: 'Собери ресурсы и создай крафтовые предметы в Плавильне!' },
    meteor_storm: { id: 'meteor_storm', name: 'Метеоритный Шторм', icon: '☄️', description: 'Небо пылает!', longDescription: 'Метеориты падают с небес! Тапай по ним, чтобы собрать осколки.', stormDuration: 30, meteorTypes: { legendary: { icon: '✨', emoji: '✨', color: '#FFD700', glowColor: 'rgba(255, 215, 0, 0.8)', speed: 2.2, size: 55, spawnWeight: 0.08, pointsPerUnit: 1, requiredForGeode: 2 }, rare: { icon: '🔥', emoji: '🔥', color: '#FF8C00', glowColor: 'rgba(255, 140, 0, 0.7)', speed: 3.0, size: 48, spawnWeight: 0.27, pointsPerUnit: 1, requiredForGeode: 4 }, common: { icon: '☄️', emoji: '☄️', color: '#A0A0A0', glowColor: 'rgba(160, 160, 160, 0.6)', speed: 3.8, size: 40, spawnWeight: 0.65, pointsPerUnit: 1, requiredForGeode: 6 } }, spawnInterval: 400, maxMeteorsOnScreen: 12, rewards: { legendary: { geodeId: 'special_meteor', geodeCount: 1, xpBonus: 150 }, rare: { geodeId: 'meteor_legendary', geodeCount: 1, xpBonus: 60 }, common: { geodeId: 'meteor_common', geodeCount: 1, xpBonus: 20 } } }
};
