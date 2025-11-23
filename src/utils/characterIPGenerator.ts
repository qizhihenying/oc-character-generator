/**
 * 角色 IP 设定生成器
 * 根据提示词生成完整的角色 IP 设定
 */

import { generateNameFromPrompt } from './novelCharacterNames';

export interface CharacterIP {
  // 基本信息
  name: string;
  style: string;
  gender: string;
  
  // 性格特征
  personality: {
    keywords: string[];
    description: string;
  };
  
  // 外貌描述
  appearance: {
    keywords: string[];
    description: string;
  };
  
  // 背景设定
  background: {
    story: string;
    occupation: string;
    age: string;
  };
  
  // AI 提示词
  prompt: string;
  
  // 创作建议
  creativeAdvice: {
    suitableScenes: string[];
    creativeDirection: string;
  };

  // AI 增强的详细信息（可选）
  aiEnhanced?: {
    detailedPersonality: string;
    detailedBackground: string;
    relationships: string;
    abilities: string;
    goals: string;
    fears: string;
    quirks: string;
  };
}

// 名字库 - 根据不同风格
const nameDatabase = {
  // 古风名字
  chinese: {
    male: [
      '云深', '墨轩', '清风', '寒江', '明月', '星河', '凌霄', '玄夜',
      '苍穹', '逸尘', '沧澜', '寒烟', '萧然', '慕容', '司徒', '上官',
      '白衣', '青衫', '竹影', '松风', '雪落', '霜华', '剑尘', '琴心'
    ],
    female: [
      '若雪', '清音', '月华', '云裳', '紫烟', '碧落', '红袖', '青黛',
      '素心', '婉儿', '倾城', '浅笑', '幽兰', '芷若', '梦瑶', '诗涵',
      '雨薇', '霜儿', '柳眉', '桃夭', '莲心', '菡萏', '芙蓉', '锦瑟'
    ]
  },
  
  // 现代名字
  modern: {
    male: [
      '林逸', '陈墨', '张轩', '李寒', '王明', '赵星', '刘凌', '周夜',
      '吴苍', '郑尘', '孙澜', '马烟', '朱然', '许容', '何徒', '高官',
      '梁白', '宋青', '唐竹', '韩松', '冯雪', '于霜', '丁剑', '蔡琴'
    ],
    female: [
      '林若', '陈清', '张月', '李云', '王紫', '赵碧', '刘红', '周青',
      '吴素', '郑婉', '孙倾', '马浅', '朱幽', '许芷', '何梦', '高诗',
      '梁雨', '宋霜', '唐柳', '韩桃', '冯莲', '于菡', '丁芙', '蔡锦'
    ]
  },
  
  // 奇幻名字
  fantasy: {
    male: [
      'Aldric', 'Theron', 'Kael', 'Zephyr', 'Orion', 'Phoenix', 'Draven', 'Raven',
      'Asher', 'Dante', 'Lucian', 'Sirius', 'Atlas', 'Magnus', 'Cassius', 'Aurelius',
      '艾尔德', '瑟伦', '凯尔', '泽菲尔', '奥利安', '菲尼克斯', '德雷文', '雷文'
    ],
    female: [
      'Aria', 'Luna', 'Seraphina', 'Aurora', 'Celeste', 'Lyra', 'Nova', 'Stella',
      'Iris', 'Freya', 'Athena', 'Diana', 'Selene', 'Elara', 'Astrid', 'Thalia',
      '艾莉亚', '露娜', '塞拉菲娜', '奥罗拉', '塞莱斯特', '莱拉', '诺娃', '斯特拉'
    ]
  },
  
  // 赛博朋克名字
  cyberpunk: {
    male: [
      'Neo', 'Cipher', 'Blade', 'Ghost', 'Rogue', 'Vex', 'Jax', 'Zane',
      'Kai', 'Rex', 'Axel', 'Volt', 'Neon', 'Cyber', 'Matrix', 'Glitch',
      '尼奥', '赛弗', '刀锋', '幽灵', '游侠', '维克斯', '杰克斯', '赞恩'
    ],
    female: [
      'Nova', 'Echo', 'Raven', 'Viper', 'Jade', 'Scarlet', 'Nyx', 'Zara',
      'Kira', 'Ava', 'Mira', 'Luna', 'Pixel', 'Chrome', 'Neon', 'Cyber',
      '诺娃', '回音', '渡鸦', '毒蛇', '翡翠', '猩红', '尼克斯', '扎拉'
    ]
  },
  
  // 哥特名字
  gothic: {
    male: [
      'Damien', 'Lucifer', 'Morpheus', 'Vlad', 'Raven', 'Shadow', 'Dante', 'Draven',
      'Noir', 'Obsidian', 'Onyx', 'Midnight', 'Eclipse', 'Phantom', 'Specter', 'Wraith',
      '达米安', '路西法', '墨菲斯', '弗拉德', '渡鸦', '暗影', '但丁', '德雷文'
    ],
    female: [
      'Lilith', 'Morticia', 'Raven', 'Belladonna', 'Nocturne', 'Vesper', 'Elvira', 'Salem',
      'Crimson', 'Ebony', 'Velvet', 'Scarlet', 'Mystique', 'Tempest', 'Storm', 'Nightshade',
      '莉莉丝', '莫蒂西亚', '渡鸦', '颠茄', '夜曲', '维斯帕', '艾薇拉', '塞勒姆'
    ]
  },
  
  // 吉卜力名字
  ghibli: {
    male: [
      '小杰', '阿修', '翔太', '健太', '大辅', '拓也', '悠人', '春树',
      '诚', '翼', '陆', '海', '空', '风', '光', '树',
      'Haku', 'Howl', 'Ashitaka', 'Pazu', 'Tombo', 'Seiji', 'Shun', 'Umi'
    ],
    female: [
      '小千', '小玲', '小梅', '小月', '琪琪', '菲奥', '苏菲', '希塔',
      '春', '夏', '秋', '冬', '花', '叶', '雨', '雪',
      'Chihiro', 'Sophie', 'Kiki', 'Sheeta', 'Fio', 'Nausicaa', 'San', 'Arrietty'
    ]
  }
};

// 性格关键词库 - 小说/漫画风格
const personalityKeywords = {
  // 正面性格（温暖、积极）
  positive: [
    '温柔', '善良', '温暖', '体贴', '贴心', '细腻', '柔和', '温顺',
    '勇敢', '无畏', '果敢', '英勇', '胆识过人', '视死如归', '临危不惧',
    '聪明', '睿智', '机智', '敏锐', '聪慧', '才智过人', '足智多谋', '智谋超群',
    '乐观', '开朗', '阳光', '活泼', '开朗活泼', '积极向上', '充满朝气',
    '热情', '热心', '热忱', '激情', '充满活力', '热血沸腾', '激情澎湃',
    '真诚', '诚实', '坦率', '直率', '真挚', '赤诚', '诚恳待人',
    '坚强', '坚韧', '不屈', '顽强', '坚毅', '百折不挠', '坚韧不拔',
    '自信', '自信满满', '从容', '淡定', '胸有成竹', '气定神闲',
    '正义', '正直', '公正', '光明磊落', '刚正不阿', '嫉恶如仇',
    '忠诚', '忠心', '忠义', '义薄云天', '重情重义', '肝胆相照'
  ],
  
  // 中性性格（复杂、多面）
  neutral: [
    '冷静', '沉着', '镇定', '处变不惊', '临危不乱', '泰山崩于前而色不变',
    '理性', '理智', '客观', '冷静分析', '逻辑缜密', '思维清晰',
    '独立', '自立', '自主', '特立独行', '我行我素', '不随波逐流',
    '神秘', '神秘莫测', '高深莫测', '深不可测', '难以捉摸', '扑朔迷离',
    '沉默', '寡言', '少言', '沉默寡言', '惜字如金', '深藏不露',
    '内敛', '含蓄', '低调', '不露锋芒', '韬光养晦', '深藏功与名',
    '谨慎', '小心', '细心', '谨小慎微', '步步为营', '如履薄冰',
    '专注', '专心', '执着', '一心一意', '心无旁骛', '全神贯注',
    '严肃', '严谨', '一丝不苟', '认真', '严格', '不苟言笑',
    '淡然', '淡泊', '超脱', '看淡一切', '宠辱不惊', '云淡风轻',
    '矛盾', '复杂', '多面', '亦正亦邪', '善恶难辨', '黑白交织',
    '慵懒', '散漫', '随性', '自由自在', '无拘无束', '随心所欲'
  ],
  
  // 负面性格（黑暗、极端）
  negative: [
    '冷酷', '冷血', '无情', '铁石心肠', '冷酷无情', '心如铁石',
    '傲慢', '自大', '狂妄', '目中无人', '自视甚高', '唯我独尊',
    '孤僻', '孤独', '离群索居', '不合群', '独来独往', '形单影只',
    '叛逆', '反叛', '桀骜不驯', '不羁', '放荡不羁', '我行我素',
    '固执', '执拗', '倔强', '一根筋', '死心眼', '不撞南墙不回头',
    '多疑', '猜疑', '疑神疑鬼', '草木皆兵', '杯弓蛇影', '疑心重重',
    '敏感', '脆弱', '玻璃心', '易碎', '多愁善感', '感情细腻',
    '悲观', '消极', '厌世', '看破红尘', '万念俱灰', '心如死灰',
    '暴躁', '易怒', '火爆', '脾气暴躁', '一点就着', '喜怒无常',
    '阴郁', '阴暗', '灰暗', '阴沉', '郁郁寡欢', '愁云惨雾',
    '残忍', '残暴', '凶残', '嗜血', '杀戮成性', '视人命如草芥',
    '腹黑', '阴险', '狡诈', '诡计多端', '心机深沉', '城府极深',
    '疯狂', '癫狂', '狂乱', '失控', '丧失理智', '走火入魔',
    '偏执', '极端', '走极端', '钻牛角尖', '不达目的不罢休'
  ],
  
  // 特殊性格（独特、罕见）
  special: [
    '双重人格', '多重人格', '人格分裂', '善恶交织', '天使与恶魔共存',
    '病娇', '黑化', '扭曲', '变态', '心理扭曲', '精神异常',
    '中二', '中二病', '妄想症', '幻想家', '活在自己的世界',
    '傲娇', '口是心非', '表里不一', '嘴硬心软', '刀子嘴豆腐心',
    '天然呆', '天然黑', '呆萌', '迷糊', '大智若愚', '看似愚钝实则聪慧',
    '毒舌', '嘴毒', '刻薄', '说话尖酸刻薄', '一针见血', '直击要害',
    '腹黑', '黑心', '表面温和内心阴暗', '笑里藏刀', '外柔内刚',
    '完美主义', '强迫症', '洁癖', '追求完美', '容不得瑕疵',
    '自闭', '社恐', '社交恐惧', '害怕与人交往', '封闭自我',
    '控制欲强', '占有欲强', '偏执狂', '掌控一切', '不容背叛'
  ]
};

// 职业库 - 小说/漫画风格
const occupations = {
  // 中国古风职业
  chinese: [
    '剑圣', '剑仙', '剑魔', '剑侠', '剑客', '刀客', '枪客', '棍僧',
    '神医', '毒医', '药王', '医仙', '炼丹师', '炼器师', '符师', '阵法师',
    '琴圣', '棋圣', '书圣', '画圣', '诗仙', '词仙', '文豪', '才子',
    '侠客', '大侠', '剑侠', '刀侠', '枪侠', '暗影刺客', '血影杀手', '夜行者',
    '掌门', '宗主', '长老', '护法', '执事', '弟子', '散修', '隐士',
    '将军', '元帅', '统帅', '军师', '谋士', '参将', '都尉', '校尉',
    '商贾', '富商', '巨贾', '掌柜', '镖师', '镖头', '帮主', '堂主',
    '术士', '方士', '道士', '和尚', '尼姑', '巫师', '祭司', '占卜师',
    '皇帝', '皇后', '太子', '公主', '王爷', '郡主', '驸马', '太监',
    '江湖浪子', '游侠', '独行侠', '赏金猎人', '杀手', '刺客', '密探', '细作'
  ],
  
  // 现代都市职业
  modern: [
    '顶级设计师', '首席设计师', '创意总监', 'UI设计师', '平面设计师', '室内设计师',
    '全栈工程师', '架构师', '算法工程师', 'AI研究员', '黑客', '白帽黑客', '安全专家',
    '外科医生', '心理医生', '法医', '急诊医生', '兽医', '中医', '药剂师', '护士',
    '畅销作家', '推理作家', '科幻作家', '言情作家', '网络作家', '编剧', '诗人', '评论家',
    '调查记者', '战地记者', '主持人', '新闻主播', '摄影师', '纪录片导演', '自媒体人',
    '刑事律师', '辩护律师', '检察官', '法官', '侦探', '私家侦探', '警察', '特工',
    '企业家', 'CEO', '投资人', '金融分析师', '股票经纪人', '会计师', '审计师',
    '大学教授', '中学教师', '小学教师', '家庭教师', '培训师', '讲师', '研究员',
    '演员', '歌手', '舞者', '音乐家', '画家', '雕塑家', '行为艺术家', '街头艺人',
    '电竞选手', '游戏主播', '美食博主', 'UP主', '网红', '模特', '时尚买手', '造型师',
    '咖啡师', '调酒师', '厨师', '糕点师', '花艺师', '宠物美容师', '健身教练', '瑜伽教练',
    '赛车手', '飞行员', '船长', '潜水员', '登山家', '探险家', '考古学家', '天文学家'
  ],
  
  // 奇幻魔法职业
  fantasy: [
    '大魔法师', '魔导师', '元素法师', '火焰法师', '冰霜法师', '雷电法师', '暗影法师',
    '圣光法师', '时空法师', '召唤师', '死灵法师', '幻术师', '变形师', '附魔师',
    '圣骑士', '黑暗骑士', '龙骑士', '魔剑士', '符文剑士', '战斗法师', '魔法剑士',
    '狂战士', '剑圣', '剑豪', '武器大师', '格斗家', '拳师', '斗士', '角斗士',
    '游侠', '弓箭手', '神射手', '猎人', '驯兽师', '德鲁伊', '自然使者', '森林守护者',
    '刺客', '暗杀者', '影舞者', '夜行者', '盗贼', '飞贼', '神偷', '宝藏猎人',
    '牧师', '主教', '大主教', '圣女', '圣骑士', '审判官', '驱魔师', '光明使者',
    '吟游诗人', '行吟者', '说书人', '舞者', '乐师', '魔音师', '幻音师',
    '炼金术师', '药剂师', '毒药师', '爆破专家', '工程师', '机械师', '发明家',
    '占星师', '预言家', '占卜师', '命运编织者', '时间守护者', '空间行者', '位面旅者',
    '龙语者', '精灵王', '兽人酋长', '矮人王', '巨人族长', '恶魔领主', '天使长',
    '冒险者', '佣兵', '赏金猎人', '探险家', '寻宝者', '遗迹探索者', '地下城征服者'
  ],
  
  // 赛博朋克职业
  cyberpunk: [
    '顶级黑客', '网络幽灵', '数据窃贼', '系统破坏者', '代码诗人', '矩阵行者',
    '赏金猎人', '街头武士', '义体战士', '改造人', '机械战士', '电子骑士',
    '网络侦探', '数字侦探', '赛博警探', '信息猎手', '真相追寻者', '谜团解密者',
    '数据分析师', '信息经纪人', '情报商人', '秘密交易者', '黑市商人', '走私者',
    '义体改造师', '机械医生', '生化工程师', '基因编辑师', '纳米技术师', '神经改造师',
    '企业特工', '公司杀手', '商业间谍', '工业破坏者', '竞争对手', '影子行者',
    '媒体黑客', '信息战士', '舆论操控者', '虚拟偶像', '全息明星', '数字艺术家',
    '地下医生', '黑市医师', '非法诊所', '器官交易者', '记忆编辑师', '梦境设计师',
    '赛车手', '悬浮车手', '摩托骑士', '飞行器驾驶员', '载具改装师', '速度狂人',
    '酒保', '夜店DJ', '霓虹调酒师', '娱乐区经理', '红灯区老板', '地下拳手',
    '废土拾荒者', '辐射区探险者', '遗迹猎人', '科技考古学家', '旧世界研究者'
  ],
  
  // 哥特暗黑职业
  gothic: [
    '吸血鬼伯爵', '血族公爵', '血族亲王', '血族长老', '血族猎人', '吸血鬼杀手',
    '死灵法师', '亡灵召唤师', '尸巫', '骨法师', '灵魂收割者', '死神使者',
    '黑暗骑士', '堕落骑士', '暗影骑士', '诅咒骑士', '死亡骑士', '末日骑士',
    '暗影刺客', '夜之刺客', '血之刺客', '暗杀大师', '影之舞者', '死亡使者',
    '诅咒术士', '黑魔法师', '禁忌法师', '堕落法师', '混沌法师', '虚空法师',
    '幽灵召唤师', '灵媒', '通灵师', '亡魂引导者', '鬼语者', '幽冥使者',
    '血族贵族', '暗夜贵族', '古堡领主', '黑暗公爵', '暗影伯爵', '午夜男爵',
    '狼人', '狼人族长', '月夜狼王', '野兽之王', '变形者', '兽化战士',
    '恶魔契约者', '恶魔召唤师', '地狱使者', '魔鬼交易者', '灵魂商人', '堕落天使',
    '暗黑牧师', '异端审判官', '黑暗主教', '邪教教主', '禁忌祭司', '血祭司',
    '瘟疫医生', '疯狂科学家', '人体实验者', '禁忌研究者', '黑暗炼金术师',
    '墓地守护者', '陵墓管理员', '送葬者', '掘墓人', '尸体收集者', '死亡商人',
    '暗夜诗人', '哥特作家', '恐怖小说家', '暗黑艺术家', '死亡画家', '血色雕刻家'
  ],
  
  // 吉卜力风格职业
  ghibli: [
    '魔女快递员', '飞行魔女', '见习魔女', '魔法学徒', '魔法使', '魔法师',
    '面包师', '糕点师', '咖啡师', '茶艺师', '料理人', '厨师',
    '飞行员', '飞艇驾驶员', '热气球驾驶员', '滑翔机驾驶员', '机械师', '工程师',
    '花店老板', '园艺师', '植物学家', '森林守护者', '自然学者', '生态学家',
    '图书管理员', '书店老板', '作家', '画家', '音乐家', '艺术家',
    '旅行者', '冒险家', '探险家', '寻宝者', '地图绘制者', '导游',
    '治愈师', '草药师', '医师', '护士', '兽医', '动物保护者',
    '工匠', '木匠', '铁匠', '陶艺师', '织布工', '裁缝',
    '农夫', '牧羊人', '渔夫', '猎人', '采集者', '村民',
    '学生', '教师', '研究员', '学者', '考古学家', '历史学家',
    '邮递员', '送货员', '车站员工', '列车员', '船员', '水手',
    '精灵守护者', '森林精灵', '水之精灵', '风之精灵', '自然之子', '大地守护者'
  ]
};

/**
 * 生成角色名字
 */
export function generateCharacterName(style: string, gender: string): string {
  // style 现在是英文的 'chinese', 'fantasy' 等
  let styleKey = style;
  
  // 如果是 anime 风格，默认使用 modern 名字
  if (styleKey === 'anime') {
    styleKey = 'modern';
  }
  
  const genderKey = gender === 'female' ? 'female' : 'male';
  const names = nameDatabase[styleKey as keyof typeof nameDatabase][genderKey];
  
  return names[Math.floor(Math.random() * names.length)];
}

/**
 * 生成性格描述 - 小说/漫画风格
 */
function generatePersonality(): { keywords: string[]; description: string } {
  const keywords: string[] = [];
  
  // 随机决定性格类型组合
  const rand = Math.random();
  let allKeywords: string[];
  
  if (rand < 0.3) {
    // 30% 概率：正面性格为主
    allKeywords = [
      ...personalityKeywords.positive,
      ...personalityKeywords.neutral.slice(0, 20)
    ];
  } else if (rand < 0.6) {
    // 30% 概率：中性复杂性格
    allKeywords = [
      ...personalityKeywords.neutral,
      ...personalityKeywords.positive.slice(0, 20),
      ...personalityKeywords.negative.slice(0, 20)
    ];
  } else if (rand < 0.85) {
    // 25% 概率：负面性格为主
    allKeywords = [
      ...personalityKeywords.negative,
      ...personalityKeywords.neutral.slice(0, 20)
    ];
  } else {
    // 15% 概率：特殊性格（可能包含病娇、傲娇等）
    allKeywords = [
      ...personalityKeywords.special,
      ...personalityKeywords.neutral.slice(0, 10),
      ...personalityKeywords.negative.slice(0, 10)
    ];
  }
  
  // 随机选择 2-4 个性格关键词
  const count = 2 + Math.floor(Math.random() * 3);
  const selectedKeywords = new Set<string>();
  
  while (selectedKeywords.size < count && selectedKeywords.size < allKeywords.length) {
    const keyword = allKeywords[Math.floor(Math.random() * allKeywords.length)];
    selectedKeywords.add(keyword);
  }
  
  keywords.push(...Array.from(selectedKeywords));
  
  // 生成更有文学感的描述
  const descriptions = [
    `性格${keywords.join('、')}，在面对困难时展现出独特的处理方式。内心深处隐藏着不为人知的一面，随着故事发展逐渐展现真实的自我。`,
    `拥有${keywords.join('、')}的性格特质，这使得TA在人群中显得与众不同。表面之下，隐藏着更加复杂的内心世界。`,
    `${keywords.join('、')}是TA最显著的性格特征。这样的性格塑造了TA独特的行事风格，也决定了TA的命运轨迹。`,
    `性格上表现出${keywords.join('、')}的特点，这既是TA的优势，也可能成为TA的软肋。在关键时刻，这些性格特质将发挥决定性作用。`,
    `${keywords.join('、')}的性格让TA在这个世界中走出了一条独特的道路。TA的内心世界远比表面看起来更加丰富多彩。`,
    `表面上${keywords[0]}，实则${keywords.slice(1).join('、')}。这种复杂的性格使得TA难以被他人真正理解，也让TA的人生充满了戏剧性。`
  ];
  
  const description = descriptions[Math.floor(Math.random() * descriptions.length)];
  
  return { keywords, description };
}

/**
 * 生成外貌描述
 */
function generateAppearance(elements: { [category: string]: string }): { keywords: string[]; description: string } {
  const keywords: string[] = [];
  
  // 从元素中提取关键词
  if (elements['发型发色']) keywords.push(elements['发型发色']);
  if (elements['眼睛特征']) keywords.push(elements['眼睛特征']);
  if (elements['服装主体']) keywords.push(elements['服装主体']);
  
  const description = `拥有${elements['发型发色'] || '独特的发型'}和${elements['眼睛特征'] || '迷人的眼睛'}，身着${elements['服装主体'] || '精致的服装'}。整体形象${elements['艺术风格'] || '独具特色'}，给人留下深刻印象。`;
  
  return { keywords, description };
}

/**
 * 生成背景故事
 */
function generateBackground(style: string, name: string): { story: string; occupation: string; age: string } {
  // style 现在是英文的 'chinese', 'fantasy' 等
  let styleKey = style;
  
  // 如果是 anime 风格，默认使用 modern 职业
  if (styleKey === 'anime') {
    styleKey = 'modern';
  }
  
  const occupationList = occupations[styleKey as keyof typeof occupations];
  const occupation = occupationList[Math.floor(Math.random() * occupationList.length)];
  
  const age = `${18 + Math.floor(Math.random() * 12)}岁`;
  
  const stories = [
    `${name}出生于一个普通家庭，从小展现出与众不同的天赋。经历了一系列波折后，最终成为了一名${occupation}，在自己的领域中崭露头角。`,
    `作为${occupation}的${name}，拥有着不为人知的过去。一次偶然的机会改变了命运的轨迹，从此踏上了一条充满挑战的道路。`,
    `${name}曾经历过人生的低谷，但凭借坚韧的意志和不懈的努力，最终在${occupation}这个职业中找到了属于自己的位置。`,
    `神秘的${name}以${occupation}的身份出现在众人面前，背后隐藏着一段不为人知的故事。随着时间推移，真相逐渐浮出水面。`
  ];
  
  const story = stories[Math.floor(Math.random() * stories.length)];
  
  return { story, occupation, age };
}

/**
 * 生成创作建议
 */
function generateCreativeAdvice(style: string): { suitableScenes: string[]; creativeDirection: string } {
  const scenesByStyle: { [key: string]: string[] } = {
    chinese: ['江湖恩怨', '宫廷斗争', '武林大会', '山水之间', '古镇街道', '竹林深处'],
    modern: ['都市街头', '咖啡厅', '办公室', '校园', '公园', '商业区'],
    fantasy: ['魔法森林', '古老城堡', '神秘遗迹', '龙之巢穴', '精灵王国', '暗影之地'],
    cyberpunk: ['霓虹街道', '高楼天台', '地下黑市', '虚拟空间', '机械工厂', '赛博酒吧'],
    gothic: ['古堡废墟', '月光墓地', '暗影教堂', '迷雾森林', '血色玫瑰园', '黑暗宫殿'],
    ghibli: ['乡村田野', '海边小镇', '森林深处', '天空之城', '魔法工坊', '温馨小屋']
  };
  
  // style 现在是英文的 'chinese', 'fantasy' 等
  let styleKey = style;
  if (styleKey === 'anime') styleKey = 'modern';
  
  const scenes = scenesByStyle[styleKey] || scenesByStyle.modern;
  const suitableScenes = scenes.slice(0, 3 + Math.floor(Math.random() * 2));
  
  const directions = [
    '可以围绕角色的成长历程展开故事，展现其内心的变化和成长。',
    '建议从角色的日常生活入手，通过细节刻画展现人物性格。',
    '可以设计一个重大事件作为转折点，推动角色命运的改变。',
    '适合创作系列作品，逐步揭示角色背后的秘密和故事。'
  ];
  
  const creativeDirection = directions[Math.floor(Math.random() * directions.length)];
  
  return { suitableScenes, creativeDirection };
}

/**
 * 生成完整的角色 IP 设定
 */
export function generateCharacterIP(
  prompt: string,
  elements: { [category: string]: string },
  style: string,
  gender: string
): CharacterIP {
  // 使用新的命名系统生成名字
  const genderType = gender === 'female' ? 'female' : gender === 'male' ? 'male' : 'unknown';
  const name = generateNameFromPrompt(prompt, genderType);
  
  // 生成性格
  const personality = generatePersonality();
  
  // 生成外貌
  const appearance = generateAppearance(elements);
  
  // 生成背景
  const background = generateBackground(style, name);
  
  // 生成创作建议
  const creativeAdvice = generateCreativeAdvice(style);
  
  return {
    name,
    style: elements['艺术风格'] || style,
    gender: gender === 'female' ? '女性' : '男性',
    personality,
    appearance,
    background,
    prompt,
    creativeAdvice
  };
}
