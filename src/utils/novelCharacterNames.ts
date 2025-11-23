/**
 * 小说/漫画风格角色名字生成器
 * 生成更有文学感和个性的角色名字
 */

// 日系/动漫风格名字
const animeNames = {
  female: [
    '绯月', '雪音', '樱', '凛', '琉璃', '紫苑', '椿', '茜',
    '夜', '星罗', '千雪', '梦', '瑠奈', '诗音', '铃兰', '花音',
    '霞', '月姬', '晓', '琴音', '雾岛', '枫', '白雪', '莉莉丝',
    '夏目', '冬马', '春日', '秋叶', '朝雾', '夕颜', '星野', '天音',
    '神乐', '巫女', '姬', '公主', '圣', '魔女', '天使', '恶魔'
  ],
  male: [
    '零', '夜神', '银', '冰', '炎', '龙', '凤', '狼',
    '影', '刃', '剑', '枪', '弓', '盾', '魔', '圣',
    '天', '地', '风', '雷', '光', '暗', '空', '海',
    '修罗', '罗刹', '阎罗', '判官', '鬼', '神', '仙', '魔',
    '白夜', '黑羽', '赤焰', '青龙', '玄武', '朱雀', '白虎', '麒麟'
  ]
};

// 中国古风名字
const chineseNames = {
  surname: [
    '慕容', '上官', '司徒', '欧阳', '轩辕', '南宫', '东方', '西门',
    '夏侯', '诸葛', '公孙', '令狐', '独孤', '皇甫', '尉迟', '长孙',
    '云', '风', '雪', '月', '星', '夜', '霜', '冰',
    '柳', '花', '叶', '竹', '梅', '兰', '菊', '莲'
  ],
  female: [
    '倾城', '倾国', '若雪', '如梦', '似水', '流年', '浅夏', '初晴',
    '清歌', '浅唱', '轻舞', '飞扬', '凝霜', '落雁', '沉鱼', '闭月',
    '羞花', '画眉', '红袖', '青衣', '白衣', '紫衣', '锦瑟', '华年',
    '烟雨', '江南', '北国', '西域', '东海', '南山', '明月', '清风',
    '幽兰', '芷若', '蝶舞', '凤鸣', '龙吟', '虎啸', '狼嚎', '鹰击'
  ],
  male: [
    '无双', '无敌', '无极', '无痕', '无影', '无声', '无名', '无情',
    '天行', '地煞', '风云', '雷霆', '光明', '黑暗', '苍穹', '玄冥',
    '破军', '贪狼', '七杀', '天枢', '天璇', '天玑', '天权', '玉衡',
    '开阳', '摇光', '紫微', '天府', '太阳', '太阴', '巨门', '天机',
    '天梁', '天同', '文昌', '文曲', '左辅', '右弼', '天魁', '天钺'
  ]
};

// 西方奇幻名字
const fantasyNames = {
  female: [
    'Aria', 'Luna', 'Stella', 'Aurora', 'Seraphina', 'Celestia', 'Lyra', 'Nova',
    'Elara', 'Freya', 'Iris', 'Athena', 'Diana', 'Selene', 'Artemis', 'Aphrodite',
    'Lilith', 'Morgana', 'Raven', 'Scarlett', 'Violet', 'Rose', 'Lily', 'Jasmine',
    'Evangeline', 'Isabella', 'Anastasia', 'Victoria', 'Elizabeth', 'Catherine', 'Sophia', 'Amelia'
  ],
  male: [
    'Lucifer', 'Dante', 'Raven', 'Shadow', 'Blade', 'Storm', 'Phoenix', 'Dragon',
    'Orion', 'Atlas', 'Zeus', 'Apollo', 'Ares', 'Hades', 'Poseidon', 'Hermes',
    'Asher', 'Cain', 'Abel', 'Seth', 'Noah', 'Elijah', 'Gabriel', 'Michael',
    'Alexander', 'Sebastian', 'Nathaniel', 'Theodore', 'Vincent', 'Damien', 'Adrian', 'Xavier'
  ]
};

// 赛博朋克风格名字
const cyberpunkNames = {
  prefix: [
    'Neon', 'Cyber', 'Digital', 'Virtual', 'Quantum', 'Neural', 'Chrome', 'Steel',
    'Ghost', 'Phantom', 'Shadow', 'Void', 'Zero', 'Null', 'Glitch', 'Hack',
    'Code', 'Data', 'Byte', 'Pixel', 'Matrix', 'System', 'Protocol', 'Firewall'
  ],
  suffix: [
    'Runner', 'Walker', 'Rider', 'Hunter', 'Killer', 'Slayer', 'Breaker', 'Maker',
    'Seeker', 'Finder', 'Keeper', 'Watcher', 'Guardian', 'Sentinel', 'Warrior', 'Soldier',
    'X', 'Z', '404', '666', '777', '999', '2077', '2099'
  ]
};

// 哥特/黑暗风格名字
const gothicNames = {
  female: [
    '暗夜玫瑰', '血色蔷薇', '黑色曼陀罗', '死亡百合', '地狱之花', '堕落天使',
    '暗影女王', '血月公主', '黑暗圣女', '死神新娘', '吸血鬼伯爵夫人', '暗夜女巫',
    'Morticia', 'Raven', 'Lilith', 'Belladonna', 'Nightshade', 'Crimson',
    'Ebony', 'Onyx', 'Obsidian', 'Midnight', 'Eclipse', 'Twilight'
  ],
  male: [
    '暗夜君王', '血色伯爵', '黑暗骑士', '死神使者', '地狱领主', '堕落天使',
    '暗影刺客', '血月猎人', '黑暗法师', '死亡骑士', '吸血鬼伯爵', '暗夜魔王',
    'Dracula', 'Lucian', 'Damien', 'Raven', 'Shadow', 'Phantom',
    'Obsidian', 'Onyx', 'Midnight', 'Eclipse', 'Void', 'Abyss'
  ]
};

// 可爱/萌系名字
const cuteNames = {
  female: [
    '小樱', '小雪', '小月', '小星', '小花', '小草', '小鸟', '小猫',
    '糖糖', '蜜蜜', '甜甜', '软软', '萌萌', '呆呆', '乖乖', '宝宝',
    '草莓', '樱桃', '桃子', '苹果', '橙子', '柠檬', '葡萄', '西瓜',
    '布丁', '泡芙', '马卡龙', '棉花糖', '巧克力', '奶茶', '可可', '拿铁',
    'Momo', 'Nana', 'Kiki', 'Lulu', 'Mimi', 'Coco', 'Cici', 'Didi'
  ],
  male: [
    '小白', '小黑', '小灰', '小蓝', '小红', '小绿', '小紫', '小金',
    '阿呆', '阿傻', '阿笨', '阿蠢', '阿萌', '阿乖', '阿宝', '阿福',
    '团子', '丸子', '包子', '饺子', '汤圆', '年糕', '麻糬', '大福'
  ]
};

// 霸气/强者名字
const powerfulNames = {
  title: [
    '剑圣', '剑神', '剑魔', '剑皇', '剑帝', '剑仙', '剑尊', '剑圣',
    '魔王', '魔神', '魔帝', '魔皇', '魔尊', '魔圣', '魔主', '魔君',
    '天帝', '天皇', '天尊', '天圣', '天神', '天魔', '天王', '天君',
    '战神', '战皇', '战帝', '战尊', '战圣', '战魔', '战王', '战君',
    '龙皇', '凤皇', '虎皇', '狼皇', '鹰皇', '蛇皇', '熊皇', '狮皇'
  ],
  name: [
    '破天', '灭地', '裂空', '碎海', '崩山', '震岳', '撼世', '惊天',
    '无敌', '无双', '无极', '无上', '无量', '无边', '无尽', '无穷',
    '至尊', '至高', '至强', '至圣', '至魔', '至神', '至仙', '至妖'
  ]
};

/**
 * 根据角色风格生成合适的名字
 */
export function generateCharacterName(
  gender: 'male' | 'female' | 'unknown',
  style: 'anime' | 'chinese' | 'fantasy' | 'cyberpunk' | 'gothic' | 'cute' | 'powerful' | 'random' = 'random'
): string {
  // 如果是随机，先随机选择一个风格
  if (style === 'random') {
    const styles = ['anime', 'chinese', 'fantasy', 'cyberpunk', 'gothic', 'cute', 'powerful'];
    style = styles[Math.floor(Math.random() * styles.length)] as any;
  }

  switch (style) {
    case 'anime':
      return generateAnimeName(gender);
    
    case 'chinese':
      return generateChineseName(gender);
    
    case 'fantasy':
      return generateFantasyName(gender);
    
    case 'cyberpunk':
      return generateCyberpunkName();
    
    case 'gothic':
      return generateGothicName(gender);
    
    case 'cute':
      return generateCuteName(gender);
    
    case 'powerful':
      return generatePowerfulName(gender);
    
    default:
      return generateAnimeName(gender);
  }
}

/**
 * 生成日系/动漫风格名字
 */
function generateAnimeName(gender: 'male' | 'female' | 'unknown'): string {
  if (gender === 'female') {
    return animeNames.female[Math.floor(Math.random() * animeNames.female.length)];
  } else if (gender === 'male') {
    return animeNames.male[Math.floor(Math.random() * animeNames.male.length)];
  } else {
    const allNames = [...animeNames.female, ...animeNames.male];
    return allNames[Math.floor(Math.random() * allNames.length)];
  }
}

/**
 * 生成中国古风名字
 */
function generateChineseName(gender: 'male' | 'female' | 'unknown'): string {
  const surname = chineseNames.surname[Math.floor(Math.random() * chineseNames.surname.length)];
  
  if (gender === 'female') {
    const givenName = chineseNames.female[Math.floor(Math.random() * chineseNames.female.length)];
    return `${surname}${givenName}`;
  } else if (gender === 'male') {
    const givenName = chineseNames.male[Math.floor(Math.random() * chineseNames.male.length)];
    return `${surname}${givenName}`;
  } else {
    const allGivenNames = [...chineseNames.female, ...chineseNames.male];
    const givenName = allGivenNames[Math.floor(Math.random() * allGivenNames.length)];
    return `${surname}${givenName}`;
  }
}

/**
 * 生成西方奇幻名字
 */
function generateFantasyName(gender: 'male' | 'female' | 'unknown'): string {
  if (gender === 'female') {
    return fantasyNames.female[Math.floor(Math.random() * fantasyNames.female.length)];
  } else if (gender === 'male') {
    return fantasyNames.male[Math.floor(Math.random() * fantasyNames.male.length)];
  } else {
    const allNames = [...fantasyNames.female, ...fantasyNames.male];
    return allNames[Math.floor(Math.random() * allNames.length)];
  }
}

/**
 * 生成赛博朋克风格名字
 */
function generateCyberpunkName(): string {
  const prefix = cyberpunkNames.prefix[Math.floor(Math.random() * cyberpunkNames.prefix.length)];
  const suffix = cyberpunkNames.suffix[Math.floor(Math.random() * cyberpunkNames.suffix.length)];
  return `${prefix}${suffix}`;
}

/**
 * 生成哥特/黑暗风格名字
 */
function generateGothicName(gender: 'male' | 'female' | 'unknown'): string {
  if (gender === 'female') {
    return gothicNames.female[Math.floor(Math.random() * gothicNames.female.length)];
  } else if (gender === 'male') {
    return gothicNames.male[Math.floor(Math.random() * gothicNames.male.length)];
  } else {
    const allNames = [...gothicNames.female, ...gothicNames.male];
    return allNames[Math.floor(Math.random() * allNames.length)];
  }
}

/**
 * 生成可爱/萌系名字
 */
function generateCuteName(gender: 'male' | 'female' | 'unknown'): string {
  if (gender === 'female') {
    return cuteNames.female[Math.floor(Math.random() * cuteNames.female.length)];
  } else if (gender === 'male') {
    return cuteNames.male[Math.floor(Math.random() * cuteNames.male.length)];
  } else {
    const allNames = [...cuteNames.female, ...cuteNames.male];
    return allNames[Math.floor(Math.random() * allNames.length)];
  }
}

/**
 * 生成霸气/强者名字
 */
function generatePowerfulName(_gender: 'male' | 'female' | 'unknown'): string {
  const title = powerfulNames.title[Math.floor(Math.random() * powerfulNames.title.length)];
  const name = powerfulNames.name[Math.floor(Math.random() * powerfulNames.name.length)];
  
  // 50% 概率只返回称号，50% 概率返回 称号+名字
  if (Math.random() > 0.5) {
    return title;
  } else {
    return `${name}${title}`;
  }
}

/**
 * 根据提示词自动判断风格并生成名字
 */
export function generateNameFromPrompt(prompt: string, gender: 'male' | 'female' | 'unknown'): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // 根据提示词关键词判断风格
  if (lowerPrompt.includes('anime') || lowerPrompt.includes('manga') || lowerPrompt.includes('niji')) {
    return generateCharacterName(gender, 'anime');
  }
  
  if (lowerPrompt.includes('cyberpunk') || lowerPrompt.includes('cyber') || lowerPrompt.includes('futuristic')) {
    return generateCharacterName(gender, 'cyberpunk');
  }
  
  if (lowerPrompt.includes('gothic') || lowerPrompt.includes('dark') || lowerPrompt.includes('vampire')) {
    return generateCharacterName(gender, 'gothic');
  }
  
  if (lowerPrompt.includes('fantasy') || lowerPrompt.includes('medieval') || lowerPrompt.includes('magic')) {
    return generateCharacterName(gender, 'fantasy');
  }
  
  if (lowerPrompt.includes('chinese') || lowerPrompt.includes('hanfu') || lowerPrompt.includes('traditional')) {
    return generateCharacterName(gender, 'chinese');
  }
  
  if (lowerPrompt.includes('cute') || lowerPrompt.includes('kawaii') || lowerPrompt.includes('chibi')) {
    return generateCharacterName(gender, 'cute');
  }
  
  if (lowerPrompt.includes('warrior') || lowerPrompt.includes('knight') || lowerPrompt.includes('powerful')) {
    return generateCharacterName(gender, 'powerful');
  }
  
  // 默认使用动漫风格
  return generateCharacterName(gender, 'anime');
}

/**
 * 生成多个候选名字供选择
 */
export function generateNameCandidates(
  gender: 'male' | 'female' | 'unknown',
  count: number = 5
): string[] {
  const names = new Set<string>();
  const styles: Array<'anime' | 'chinese' | 'fantasy' | 'cyberpunk' | 'gothic' | 'cute' | 'powerful'> = 
    ['anime', 'chinese', 'fantasy', 'cyberpunk', 'gothic', 'cute', 'powerful'];
  
  while (names.size < count) {
    const style = styles[Math.floor(Math.random() * styles.length)];
    const name = generateCharacterName(gender, style);
    names.add(name);
  }
  
  return Array.from(names);
}
