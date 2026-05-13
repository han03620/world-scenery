// ============================================================
// 世界风景随机展示 — 从本地 wallpapers.json 加载壁纸
// 无 API 调用、无 CORS 问题、国内可直接访问
// ============================================================

const WALLPAPERS_URL = 'data/wallpapers.json';
const IMAGE_BASE = 'https://cn.bing.com';
const PICSUM_MAX_ID = 1084; // Lorem Picsum 图库约 1000 张

let wallpapers = [];

// ---- 翻译 ----

const COUNTRY_ZH = {
    'United States': '美国', 'United Kingdom': '英国', 'Germany': '德国',
    'France': '法国', 'Italy': '意大利', 'Japan': '日本', 'Canada': '加拿大',
    'Australia': '澳大利亚', 'Switzerland': '瑞士', 'Austria': '奥地利',
    'Norway': '挪威', 'Iceland': '冰岛', 'Sweden': '瑞典', 'Finland': '芬兰',
    'Denmark': '丹麦', 'Netherlands': '荷兰', 'Belgium': '比利时',
    'Spain': '西班牙', 'Portugal': '葡萄牙', 'Greece': '希腊',
    'Turkey': '土耳其', 'Russia': '俄罗斯', 'China': '中国',
    'South Korea': '韩国', 'India': '印度', 'Thailand': '泰国',
    'Vietnam': '越南', 'Indonesia': '印尼', 'Malaysia': '马来西亚',
    'Philippines': '菲律宾', 'New Zealand': '新西兰', 'Brazil': '巴西',
    'Argentina': '阿根廷', 'Chile': '智利', 'Peru': '秘鲁', 'Colombia': '哥伦比亚',
    'Mexico': '墨西哥', 'Cuba': '古巴', 'South Africa': '南非',
    'Morocco': '摩洛哥', 'Egypt': '埃及', 'Kenya': '肯尼亚',
    'Tanzania': '坦桑尼亚', 'Nepal': '尼泊尔', 'Bhutan': '不丹',
    'Croatia': '克罗地亚', 'Slovenia': '斯洛文尼亚', 'Czech Republic': '捷克',
    'Poland': '波兰', 'Hungary': '匈牙利', 'Romania': '罗马尼亚',
    'Ireland': '爱尔兰', 'Scotland': '苏格兰', 'Wales': '威尔士',
    'United Arab Emirates': '阿联酋', 'Israel': '以色列', 'Jordan': '约旦',
    'Costa Rica': '哥斯达黎加', 'Panama': '巴拿马', 'Bolivia': '玻利维亚',
    'Ecuador': '厄瓜多尔', 'Slovakia': '斯洛伐克', 'Estonia': '爱沙尼亚',
    'Latvia': '拉脱维亚', 'Lithuania': '立陶宛', 'Luxembourg': '卢森堡',
    'Monaco': '摩纳哥', 'Malta': '马耳他', 'Cyprus': '塞浦路斯',
    'Bulgaria': '保加利亚', 'Serbia': '塞尔维亚', 'Ukraine': '乌克兰',
    'Qatar': '卡塔尔', 'Oman': '阿曼', 'Sri Lanka': '斯里兰卡',
    'Myanmar': '缅甸', 'Cambodia': '柬埔寨', 'Laos': '老挝',
    'Mongolia': '蒙古', 'Fiji': '斐济', 'Greenland': '格陵兰',
    'Namibia': '纳米比亚', 'Botswana': '博茨瓦纳', 'Madagascar': '马达加斯加',
    'Mauritius': '毛里求斯', 'Seychelles': '塞舌尔',
};

const CITY_ZH = {
    'Paris': '巴黎', 'London': '伦敦', 'New York': '纽约', 'Tokyo': '东京',
    'Rome': '罗马', 'Venice': '威尼斯', 'Sydney': '悉尼', 'Berlin': '柏林',
    'Barcelona': '巴塞罗那', 'Amsterdam': '阿姆斯特丹', 'Prague': '布拉格',
    'Vienna': '维也纳', 'Budapest': '布达佩斯', 'Lisbon': '里斯本',
    'Istanbul': '伊斯坦布尔', 'Dubai': '迪拜', 'Singapore': '新加坡',
    'Bangkok': '曼谷', 'Seoul': '首尔', 'Kyoto': '京都', 'Osaka': '大阪',
    'Toronto': '多伦多', 'Vancouver': '温哥华', 'Chicago': '芝加哥',
    'San Francisco': '旧金山', 'Los Angeles': '洛杉矶', 'Miami': '迈阿密',
    'Reykjavik': '雷克雅未克', 'Oslo': '奥斯陆', 'Stockholm': '斯德哥尔摩',
    'Helsinki': '赫尔辛基', 'Copenhagen': '哥本哈根', 'Zurich': '苏黎世',
    'Geneva': '日内瓦', 'Munich': '慕尼黑', 'Hamburg': '汉堡', 'Cologne': '科隆',
    'Florence': '佛罗伦萨', 'Naples': '那不勒斯', 'Milan': '米兰',
    'Edinburgh': '爱丁堡', 'Dublin': '都柏林', 'Brussels': '布鲁塞尔',
    'Madrid': '马德里', 'Seville': '塞维利亚', 'Porto': '波尔图',
    'Athens': '雅典', 'Cairo': '开罗', 'Cape Town': '开普敦',
    'Rio de Janeiro': '里约热内卢', 'Buenos Aires': '布宜诺斯艾利斯',
    'Lima': '利马', 'Mexico City': '墨西哥城', 'Havana': '哈瓦那',
    'Kathmandu': '加德满都', 'Shanghai': '上海', 'Beijing': '北京',
    'Hong Kong': '香港', 'Taipei': '台北', 'Moscow': '莫斯科',
    'Saint Petersburg': '圣彼得堡', 'Marrakech': '马拉喀什', 'Queenstown': '皇后镇',
    'Banff': '班夫', 'Chamonix': '霞慕尼', 'Zermatt': '采尔马特',
    'Interlaken': '因特拉肯', 'Hallstatt': '哈尔施塔特', 'Santorini': '圣托里尼',
    'Mykonos': '米科诺斯', 'Bora Bora': '波拉波拉', 'Maldives': '马尔代夫',
    'Bali': '巴厘岛', 'Phuket': '普吉岛', 'Maui': '毛伊岛',
    'Dolomites': '多洛米蒂', 'Alps': '阿尔卑斯', 'Yosemite': '优胜美地',
    'Yellowstone': '黄石', 'Grand Canyon': '大峡谷', 'Antelope Canyon': '羚羊谷',
    'Mount Fuji': '富士山', 'Mount Cook': '库克山', 'Matterhorn': '马特洪峰',
    'Lofoten': '罗弗敦', 'Cinque Terre': '五渔村', 'Amalfi Coast': '阿马尔菲海岸',
    'Tuscany': '托斯卡纳', 'Provence': '普罗旺斯', 'Scottish Highlands': '苏格兰高地',
    'Lake District': '湖区', 'Bavaria': '巴伐利亚', 'Black Forest': '黑森林',
    'Bled': '布莱德', 'Plitvice': '十六湖', 'Dubrovnik': '杜布罗夫尼克',
    'Kotor': '科托尔', 'Bruges': '布鲁日', 'Rotterdam': '鹿特丹',
    'Krakow': '克拉科夫', 'Warsaw': '华沙', 'Tallinn': '塔林', 'Riga': '里加',
    'Bergen': '卑尔根', 'Tromso': '特罗姆瑟', 'Grindelwald': '格林德瓦',
    'Lauterbrunnen': '劳特布龙嫩', 'Lucerne': '卢塞恩', 'Salzburg': '萨尔茨堡',
    'Annecy': '安纳西', 'Nice': '尼斯', 'Strasbourg': '斯特拉斯堡',
    'Colmar': '科尔马', 'Oxford': '牛津', 'Cambridge': '剑桥',
    'Manchester': '曼彻斯特', 'Galway': '戈尔韦', 'Bologna': '博洛尼亚',
    'Verona': '维罗纳', 'Siena': '锡耶纳', 'Como': '科莫',
    'Granada': '格拉纳达', 'Valencia': '瓦伦西亚', 'Mallorca': '马略卡',
    'Sintra': '辛特拉', 'Sao Paulo': '圣保罗', 'Cartagena': '卡塔赫纳',
    'Cusco': '库斯科', 'Patagonia': '巴塔哥尼亚', 'Atacama': '阿塔卡马',
    'Torres del Paine': '百内', 'Cappadocia': '卡帕多奇亚', 'Pamukkale': '棉花堡',
    'Petra': '佩特拉', 'Jerusalem': '耶路撒冷', 'Siem Reap': '暹粒',
    'Chiang Mai': '清迈', 'Krabi': '甲米', 'Hanoi': '河内',
    'Hoi An': '会安', 'Ha Long Bay': '下龙湾', 'Jaipur': '斋浦尔',
    'Agra': '阿格拉', 'Varanasi': '瓦拉纳西', 'Kerala': '喀拉拉邦',
    'Goa': '果阿', 'Tbilisi': '第比利斯', 'Casablanca': '卡萨布兰卡',
    'Chefchaouen': '舍夫沙万', 'Melbourne': '墨尔本', 'Perth': '珀斯',
    'Gold Coast': '黄金海岸', 'Cairns': '凯恩斯', 'Uluru': '乌鲁鲁',
    'Great Barrier Reef': '大堡礁', 'Tasmania': '塔斯马尼亚', 'Rotorua': '罗托鲁瓦',
    'Auckland': '奥克兰', 'Christchurch': '基督城', 'Milford Sound': '米尔福德峡湾',
    'Wanaka': '瓦纳卡', 'Tekapo': '特卡波', 'Honolulu': '檀香山',
    'Big Sur': '大苏尔', 'Zion': '锡安', 'Monument Valley': '纪念碑谷',
    'Lake Tahoe': '太浩湖', 'Sedona': '塞多纳', 'Lake Louise': '路易斯湖',
    'Moraine Lake': '梦莲湖', 'Jasper': '贾斯珀', 'Niagara Falls': '尼亚加拉瀑布',
    'Whistler': '惠斯勒', 'Mount Rainier': '雷尼尔山', 'Death Valley': '死亡谷',
    'Bryce Canyon': '布莱斯峡谷', 'Arches': '拱门', 'Redwood': '红杉',
    'Joshua Tree': '约书亚树', 'Great Wall': '长城',
    'Machu Picchu': '马丘比丘', 'Taj Mahal': '泰姬陵', 'Angkor Wat': '吴哥窟',
    'Alabama Hills': '阿拉巴马山', 'Sierra Nevada': '内华达山脉',
    'California': '加利福尼亚', 'Arizona': '亚利桑那', 'Croatia': '克罗地亚',
    'Queensland': '昆士兰', 'Manitoba': '曼尼托巴', 'Bulgaria': '保加利亚',
    'Wapusk National Park': '瓦普斯克国家公园', 'Krka National Park': '克尔卡国家公园',
    'Kofa National Wildlife Refuge': '科法国家野生动物保护区',
};

function translateCountry(country) {
    return COUNTRY_ZH[country] || '';
}

function translateCity(city) {
    return CITY_ZH[city] || '';
}

function findChineseTranslation(text) {
    if (!text) return '';
    const parts = [];
    for (const [en, zh] of Object.entries(COUNTRY_ZH)) {
        if (text.includes(en)) { parts.push(zh); break; }
    }
    const sortedCities = Object.entries(CITY_ZH).sort((a, b) => b[0].length - a[0].length);
    for (const [en, zh] of sortedCities) {
        if (text.includes(en)) { parts.unshift(zh); break; }
    }
    return [...new Set(parts)].join('，');
}

// ---- Helpers ----

function showLoading(show) {
    document.getElementById('loading').classList.toggle('hidden', !show);
}

function showError(message) {
    document.getElementById('error-msg').classList.remove('hidden');
    document.getElementById('error-text').textContent = message;
}

function hideError() {
    document.getElementById('error-msg').classList.add('hidden');
}

// ---- 加载壁纸数据 ----

async function loadWallpapers() {
    const resp = await fetch(WALLPAPERS_URL);
    if (!resp.ok) throw new Error(`壁纸数据加载失败 (${resp.status})`);
    wallpapers = await resp.json();
    if (!wallpapers.length) throw new Error('壁纸数据为空，请稍后刷新。');
}

// ---- Picsum 随机风景（补充 Bing 之外的多样性）----

function displayPicsumPhoto() {
    const photoBg = document.getElementById('photo-bg');
    const locationName = document.getElementById('location-name');
    const locationCountry = document.getElementById('location-country');
    const photographerCredit = document.getElementById('photographer-credit');
    const locationNameZh = document.getElementById('location-name-zh');

    const id = Math.floor(Math.random() * PICSUM_MAX_ID);
    const imageUrl = `https://picsum.photos/id/${id}/1920/1080`;

    const img = new Image();
    img.onload = () => {
        photoBg.style.backgroundImage = `url(${imageUrl})`;
        photoBg.classList.add('loaded');
    };
    img.onerror = () => {
        // 该 ID 无效，递归重试另一个 ID
        displayPicsumPhoto();
    };
    img.src = imageUrl;

    locationName.textContent = '世界美景';
    locationCountry.textContent = '随机风景';
    locationNameZh.textContent = '';
    photographerCredit.textContent = 'photo by Lorem Picsum';

    sessionStorage.setItem('lastPhotoId', 'picsum-' + id);
}

// ---- 显示 ----

function displayWallpaper(wallpaper) {
    const photoBg = document.getElementById('photo-bg');
    const locationName = document.getElementById('location-name');
    const locationCountry = document.getElementById('location-country');
    const photographerCredit = document.getElementById('photographer-credit');
    const locationNameZh = document.getElementById('location-name-zh');

    const imageUrl = IMAGE_BASE + wallpaper.url;
    const img = new Image();
    img.onload = () => {
        photoBg.style.backgroundImage = `url(${imageUrl})`;
        photoBg.classList.add('loaded');
    };
    img.onerror = () => {
        // UHD 可能不可用，降级到 1920x1080
        const fallbackUrl = IMAGE_BASE + wallpaper.url;
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
            photoBg.style.backgroundImage = `url(${fallbackUrl})`;
            photoBg.classList.add('loaded');
        };
        fallbackImg.src = fallbackUrl;
    };
    img.src = imageUrl;

    // 解析 copyright
    const copyright = wallpaper.copyright || '';
    let locationText, photographer;
    if (copyright.includes('(©')) {
        const idx = copyright.lastIndexOf('(©');
        locationText = copyright.substring(0, idx).trim();
        photographer = copyright.substring(idx + 2).replace(/^\)?\s*/, '').trim();
    } else {
        const copyParts = copyright.split('©');
        locationText = copyParts[0].trim();
        photographer = copyParts[1] ? copyParts[1].trim() : '';
    }

    const locParts = locationText.split(',').map(s => s.trim()).filter(Boolean);

    if (locParts.length >= 2) {
        const country = locParts[locParts.length - 1];
        const city = locParts.slice(0, -1).join('，');
        locationName.textContent = city || locationText;
        locationCountry.textContent = country;
    } else if (locParts.length === 1) {
        locationName.textContent = locParts[0];
        locationCountry.textContent = '';
    } else {
        locationName.textContent = locationText || '未知地点';
        locationCountry.textContent = '';
    }

    // 中文翻译
    if (/[一-鿿]/.test(locationText)) {
        locationNameZh.textContent = '';
    } else {
        const zhCity = translateCity(locParts.slice(0, -1).join(', ').trim());
        const zhCountry = translateCountry(locParts[locParts.length - 1] || '');
        if (zhCity && zhCountry) {
            locationNameZh.textContent = zhCity + '，' + zhCountry;
        } else if (zhCity) {
            locationNameZh.textContent = zhCity;
        } else if (zhCountry) {
            locationNameZh.textContent = zhCountry;
        } else {
            locationNameZh.textContent = findChineseTranslation(locationText);
        }
    }

    if (photographer) {
        photographerCredit.textContent = '© ' + photographer;
    } else {
        photographerCredit.textContent = '';
    }
}

// ---- 随机选择 ----

function pickRandomWallpaper() {
    const lastId = sessionStorage.getItem('lastPhotoId');
    let wallpaper;
    for (let i = 0; i < 20; i++) {
        const candidate = wallpapers[Math.floor(Math.random() * wallpapers.length)];
        if (candidate.urlbase !== lastId || wallpapers.length === 1) {
            wallpaper = candidate;
            break;
        }
    }
    if (!wallpaper) wallpaper = wallpapers[0];
    sessionStorage.setItem('lastPhotoId', wallpaper.urlbase);
    return wallpaper;
}

// ---- 主流程 ----

async function loadNewPhoto() {
    const photoBg = document.getElementById('photo-bg');
    photoBg.classList.remove('loaded');
    hideError();

    try {
        // 70% Bing（有地名） / 30% Picsum（纯风景，更大图库）
        if (Math.random() < 0.7) {
            if (wallpapers.length === 0) {
                showLoading(true);
                await loadWallpapers();
                showLoading(false);
            }
            displayWallpaper(pickRandomWallpaper());
        } else {
            showLoading(false);
            displayPicsumPhoto();
        }
    } catch (error) {
        showLoading(false);
        showError(error.message || '加载失败，请检查网络后重试。');
    }
}

// ---- 初始化 ----

document.addEventListener('DOMContentLoaded', () => {
    loadNewPhoto();

    document.getElementById('refresh-btn').addEventListener('click', loadNewPhoto);
    document.getElementById('retry-btn').addEventListener('click', loadNewPhoto);

    document.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'ArrowRight') {
            e.preventDefault();
            loadNewPhoto();
        }
    });
});
