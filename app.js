(async () => {
  "use strict";

  const library = Array.isArray(window.HUMAN_AUDIO_LIBRARY) ? window.HUMAN_AUDIO_LIBRARY : [];
  const i18n = window.FLOW_I18N || {};
  const $ = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

  const supportedLocales = ["zh-CN", "en", "pt-BR", "ja", "ko"];
  const translationFiles = {
    "pt-BR": "translations-pt-br.js",
    ja: "translations-ja.js",
    ko: "translations-ko.js"
  };
  const assetRevision = "20260712-8000";
  const translationLoads = {};

  const normalizeLocale = value => {
    const code = String(value || "").toLowerCase();
    if (code.startsWith("zh")) return "zh-CN";
    if (code.startsWith("pt")) return "pt-BR";
    if (code.startsWith("ja")) return "ja";
    if (code.startsWith("ko")) return "ko";
    return "en";
  };

  let savedLocale = "";
  try { savedLocale = localStorage.getItem("flowLocale") || ""; } catch (_) {}
  const browserLocale = typeof navigator !== "undefined" ? navigator.language : "zh-CN";
  let locale = supportedLocales.includes(savedLocale) ? savedLocale : normalizeLocale(browserLocale);

  const t = (key, values = {}) => {
    const pack = i18n[locale] || i18n.en || i18n["zh-CN"] || {};
    const fallback = i18n.en || i18n["zh-CN"] || {};
    let text = pack[key] ?? fallback[key] ?? key;
    Object.entries(values).forEach(([name, value]) => {
      text = String(text).replaceAll(`{${name}}`, String(value));
    });
    return text;
  };

  const number = value => {
    try { return new Intl.NumberFormat(locale).format(value); }
    catch (_) { return Number(value).toLocaleString(); }
  };

  const ensureTranslations = targetLocale => {
    const file = translationFiles[targetLocale];
    if (!file || window.FLOW_TRANSLATIONS?.[targetLocale]) return Promise.resolve();
    if (translationLoads[targetLocale]) return translationLoads[targetLocale];
    translationLoads[targetLocale] = new Promise(resolve => {
      const script = document.createElement("script");
      script.src = `${file}?v=${assetRevision}`;
      script.dataset.flowLocale = targetLocale;
      script.onload = resolve;
      script.onerror = resolve;
      document.head.appendChild(script);
    });
    return translationLoads[targetLocale];
  };

  const meaningFor = item => {
    if (locale === "zh-CN") return item.m || item.e;
    if (locale === "en") return item.e;
    return window.FLOW_TRANSLATIONS?.[locale]?.[String(item.id)] || item.e;
  };

  const zones = [
    { id: "social", name: "社交与恋爱", terms: "love like date girlfriend boyfriend husband wife friend meet look beautiful handsome chat relationship" },
    { id: "travel", name: "出行与住宿", terms: "taxi bus train airport station hotel travel trip ticket street left right direction" },
    { id: "food", name: "餐饮与购物", terms: "food coffee restaurant menu drink eat order shop buy price clothes outfit" },
    { id: "work", name: "工作与学习", terms: "work office job meeting email school study teacher class english learn" },
    { id: "housing", name: "租房与日常办事", terms: "rent flat apartment room landlord house home key repair address" },
    { id: "health", name: "医疗与紧急", terms: "doctor hospital medicine sick pain health pharmacy ambulance police emergency danger" },
    { id: "banking", name: "银行与支付", terms: "bank money cash card account pay charge cost bill payment" },
    { id: "help", name: "求助与真实表达", terms: "help please sorry excuse repeat understand tell explain mean want need could can" }
  ].map(item => ({ ...item, words: item.terms.split(" ") }));

  const zoneLabels = {
    "zh-CN": { social: "社交与恋爱", travel: "出行与住宿", food: "餐饮与购物", work: "工作与学习", housing: "租房与日常办事", health: "医疗与紧急", banking: "银行与支付", help: "求助与真实表达" },
    en: { social: "Social life & dating", travel: "Travel & accommodation", food: "Food & shopping", work: "Work & study", housing: "Housing & errands", health: "Health & emergencies", banking: "Banking & payments", help: "Help & real-life expression" },
    "pt-BR": { social: "Vida social e namoro", travel: "Viagem e hospedagem", food: "Comida e compras", work: "Trabalho e estudos", housing: "Moradia e tarefas", health: "Saúde e emergências", banking: "Banco e pagamentos", help: "Ajuda e comunicação real" },
    ja: { social: "交流・恋愛", travel: "移動・宿泊", food: "食事・買い物", work: "仕事・学習", housing: "住居・日常手続き", health: "医療・緊急時", banking: "銀行・支払い", help: "助けを求める・実用表現" },
    ko: { social: "사교와 데이트", travel: "이동과 숙박", food: "식사와 쇼핑", work: "업무와 학습", housing: "주거와 생활 업무", health: "의료와 응급 상황", banking: "은행과 결제", help: "도움 요청과 실전 표현" }
  };

  const categoryLabels = {
    "zh-CN": { "出行问路": "出行问路", "医疗健康": "医疗健康", "学习教育": "学习教育", "工作沟通": "工作沟通", "恋爱社交": "恋爱社交", "日常交流": "日常交流", "社交开场": "社交开场", "租房居住": "租房居住", "紧急求助": "紧急求助", "请求帮助": "请求帮助", "购物餐饮": "购物餐饮", "银行支付": "银行支付" },
    en: { "出行问路": "Travel & directions", "医疗健康": "Health", "学习教育": "Study", "工作沟通": "Work", "恋爱社交": "Dating & social life", "日常交流": "Everyday conversation", "社交开场": "Conversation starters", "租房居住": "Housing", "紧急求助": "Emergencies", "请求帮助": "Asking for help", "购物餐饮": "Shopping & food", "银行支付": "Banking & payments" },
    "pt-BR": { "出行问路": "Viagem e direções", "医疗健康": "Saúde", "学习教育": "Estudos", "工作沟通": "Trabalho", "恋爱社交": "Namoro e vida social", "日常交流": "Conversa cotidiana", "社交开场": "Início de conversa", "租房居住": "Moradia", "紧急求助": "Emergências", "请求帮助": "Pedir ajuda", "购物餐饮": "Compras e alimentação", "银行支付": "Banco e pagamentos" },
    ja: { "出行问路": "移動・道案内", "医疗健康": "医療・健康", "学习教育": "学習", "工作沟通": "仕事", "恋爱社交": "恋愛・交流", "日常交流": "日常会話", "社交开场": "会話のきっかけ", "租房居住": "住居", "紧急求助": "緊急時", "请求帮助": "助けを求める", "购物餐饮": "買い物・食事", "银行支付": "銀行・支払い" },
    ko: { "出行问路": "이동과 길 찾기", "医疗健康": "의료와 건강", "学习教育": "학습", "工作沟通": "업무", "恋爱社交": "데이트와 사교", "日常交流": "일상 대화", "社交开场": "대화 시작", "租房居住": "주거", "紧急求助": "응급 상황", "请求帮助": "도움 요청", "购物餐饮": "쇼핑과 식사", "银行支付": "은행과 결제" }
  };

  const zoneLabel = id => zoneLabels[locale]?.[id] || zoneLabels.en[id] || id;
  const categoryLabel = value => categoryLabels[locale]?.[value] || categoryLabels.en[value] || t("everydayEnglish");

  const termRelevance = (item, targetZone) => {
    const haystack = `${item.e} ${item.m} ${item.c}`.toLowerCase();
    return targetZone ? targetZone.words.reduce((total, word) => total + (haystack.includes(word) ? 5 : 0), 0) : 0;
  };
  const score = (item, targetZone) => {
    const relevance = termRelevance(item, targetZone);
    return relevance
      + (item.c === "请求帮助" && targetZone?.id === "help" ? 9 : 0)
      + (item.c === "日常交流" ? 1 : 0);
  };

  const categoryPriority = { "请求帮助": 22, "紧急求助": 21, "日常交流": 20, "出行问路": 18, "购物餐饮": 17, "租房居住": 17, "银行支付": 16, "医疗健康": 16, "工作沟通": 14, "学习教育": 12, "恋爱社交": 11, "社交开场": 10 };
  const practicalPhrases = ["thank you", "excuse me", "how are you", "i need", "i want", "can i", "could you", "do you", "is there", "where is", "how much", "help me", "please", "i'm looking", "i would like", "can you"];
  const zoneCategories = { social: ["恋爱社交", "社交开场"], travel: ["出行问路"], food: ["购物餐饮"], work: ["工作沟通", "学习教育"], housing: ["租房居住"], health: ["医疗健康", "紧急求助"], banking: ["银行支付"], help: ["请求帮助", "日常交流"] };
  const practicalScore = (item, targetZone) => {
    const text = item.e.toLowerCase().trim();
    const words = text.match(/[a-z']+/g) || [];
    let value = score(item, targetZone) * 6 + (categoryPriority[item.c] || 0);
    for (const phrase of practicalPhrases) if (text.includes(phrase)) value += 36;
    if (/\b(i|you|we)\b/.test(text)) value += 18;
    if (/\b(i need|i want|i have|can you|could you|can i|could i|where is|where are|how much|how do i|do you|is there|i'm looking|please|help)\b/.test(text)) value += 24;
    if (/^(what|where|when|why|how|can|could|would|do|is|are)\b/.test(text)) value += 14;
    if (/[?]/.test(text)) value += 9;
    if (words.length >= 2 && words.length <= 8) value += 34;
    else if (words.length <= 12) value += 17;
    else if (words.length > 18) value -= Math.min(28, words.length - 18);
    if (/^(more and more|this |that |the |there )/.test(text) || /\b(has begun|have begun|used to|people say)\b/.test(text)) value -= 22;
    return value;
  };

  const zonePools = {};
  const itemZones = new Map();
  zones.forEach(targetZone => {
    const isRelevant = item => termRelevance(item, targetZone) > 0 || zoneCategories[targetZone.id].includes(item.c);
    const ranked = [...library].sort((first, second) => Number(isRelevant(second)) - Number(isRelevant(first)) || practicalScore(second, targetZone) - practicalScore(first, targetZone) || first.e.localeCompare(second.e));
    const picked = ranked.slice(0, 850);
    picked.forEach(item => {
      if (!itemZones.has(String(item.id))) itemZones.set(String(item.id), targetZone.id);
    });
    zonePools[targetZone.id] = picked;
  });
  const allPool = [...library].sort((first, second) => practicalScore(second) - practicalScore(first) || first.e.localeCompare(second.e));

  let zone = "all";
  let query = "";
  let index = 0;
  let blind = false;
  let catalogOpen = false;
  let catalogLimit = 60;
  let currentItem = null;
  let mediaRecorder = null;
  let mediaStream = null;
  let speechRecognition = null;
  let recordedAudioUrl = "";
  let recordedChunks = [];
  let recognisedText = "";
  let recognitionEnded = true;
  let recorderEnded = true;
  let shadowActive = false;
  let shadowStopping = false;
  let recognitionAvailable = false;
  let shadowSession = 0;
  let shadowPlayback = null;

  const matches = item => {
    const itemZone = itemZones.get(String(item.id));
    const haystack = `${item.e} ${item.m} ${meaningFor(item)} ${item.c} ${categoryLabel(item.c)} ${itemZone ? zoneLabel(itemZone) : ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  };
  const pool = () => (zone === "all" ? allPool : zonePools[zone]).filter(matches);
  const chunks = text => {
    const words = text.match(/[^\s]+/g) || [];
    const groups = [];
    for (let wordIndex = 0; wordIndex < words.length; wordIndex += 3) groups.push(words.slice(wordIndex, wordIndex + 3).join(" "));
    return groups;
  };
  const audioUrl = item => `https://tatoeba.org/audio/download/${item.audioId}`;

  const ruleNames = {
    "zh-CN": { contraction: "常见口语缩约", dYou: "/t/ /d/ + you 融合", doYou: "do you 融合", sYou: "/s/ /z/ + you 同化", functionWord: "功能词弱读", consonantVowel: "辅音 + 元音连接", vowelVowel: "元音 + 元音滑音", cluster: "辅音群中的失爆/省音", linkingR: "linking r", nasal: "鼻音同化", hDrop: "代词 h 弱化", tYou: "/t/ + you 融合", shared: "相同辅音共享", flap: "美音闪音 /ɾ/", writtenContraction: "缩写与弱拍", sentenceStress: "句子重音", thoughtGroups: "意群与节奏" },
    en: { contraction: "Common spoken reduction", dYou: "/t/ or /d/ + you fusion", doYou: "do you fusion", sYou: "/s/ or /z/ + you assimilation", functionWord: "Weak function word", consonantVowel: "Consonant-to-vowel linking", vowelVowel: "Vowel-to-vowel glide", cluster: "Unreleased sound or elision", linkingR: "Linking /r/", nasal: "Nasal assimilation", hDrop: "Weak pronoun /h/", tYou: "/t/ + you fusion", shared: "Shared consonant", flap: "American flap /ɾ/", writtenContraction: "Contraction and weak beat", sentenceStress: "Sentence stress", thoughtGroups: "Thought groups and rhythm" },
    "pt-BR": { contraction: "Redução comum na fala", dYou: "Fusão de /t/ ou /d/ + you", doYou: "Fusão de do you", sYou: "Assimilação de /s/ ou /z/ + you", functionWord: "Palavra funcional reduzida", consonantVowel: "Ligação consoante-vogal", vowelVowel: "Deslizamento entre vogais", cluster: "Som não liberado ou elisão", linkingR: "Ligação com /r/", nasal: "Assimilação nasal", hDrop: "/h/ fraco em pronomes", tYou: "Fusão de /t/ + you", shared: "Consoante compartilhada", flap: "Flap americano /ɾ/", writtenContraction: "Contração e tempo fraco", sentenceStress: "Acento frasal", thoughtGroups: "Grupos de sentido e ritmo" },
    ja: { contraction: "会話でよく起こる短縮", dYou: "/t/・/d/ + you の融合", doYou: "do you の融合", sYou: "/s/・/z/ + you の同化", functionWord: "機能語の弱形", consonantVowel: "子音と母音のリンキング", vowelVowel: "母音間のわたり音", cluster: "子音群の未開放・脱落", linkingR: "linking /r/", nasal: "鼻音の同化", hDrop: "代名詞の /h/ の弱化", tYou: "/t/ + you の融合", shared: "同じ子音の共有", flap: "アメリカ英語のフラップ /ɾ/", writtenContraction: "短縮形と弱い拍", sentenceStress: "文の強勢", thoughtGroups: "意味のまとまりとリズム" },
    ko: { contraction: "회화에서 자주 쓰는 축약", dYou: "/t/ 또는 /d/ + you 융합", doYou: "do you 융합", sYou: "/s/ 또는 /z/ + you 동화", functionWord: "기능어 약화", consonantVowel: "자음-모음 연결", vowelVowel: "모음 사이 활음", cluster: "자음군 미파열·탈락", linkingR: "linking /r/", nasal: "비음 동화", hDrop: "대명사 /h/ 약화", tYou: "/t/ + you 융합", shared: "동일 자음 공유", flap: "미국 영어 탄설음 /ɾ/", writtenContraction: "축약형과 약박", sentenceStress: "문장 강세", thoughtGroups: "의미 단위와 리듬" }
  };

  const tipTemplates = {
    "zh-CN": {
      contraction: "{phrase} 在自然语速中常压缩，先模仿节奏，不必刻意夸张。", dYou: "{word} 的尾音与 you 的 /j/ 融合，听起来接近 “j” 音。", doYou: "{phrase} 不分成两个独立重拍，you 通常弱读。", sYou: "{phrase} 的相邻声音会互相靠近，常产生 /ʒ/ 或 /ʃ/。", functionWord: "{word} 通常不承载主要信息，读得短、轻、快。", consonantVowel: "{first} 的尾辅音直接滑向 {second} 的开头，中间不停顿。", vowelVowel: "{first} 与 {second} 之间可能出现轻微 /j/ 或 /w/，保持声音连续。", cluster: "{first} 末尾的 /t/ 或 /d/ 常不完全释放，再进入后词辅音。", linkingR: "部分英式口音会在 {first} 与 {second} 之间连接 /r/。", nasal: "/n/ 遇到 /p b m/ 时，发音位置可能向双唇靠近。", hDrop: "{second} 非重读时 /h/ 可能弱化或省略，前词直接连过去。", tYou: "{first} 的 /t/ 与 you 的 /j/ 在快速口语中可融合为 /tʃ/。", shared: "相邻的同类辅音通常只保持一次较长阻塞，不重复爆破。", flap: "在常见美音环境中，词内 /t/ 可能变成快速闪音 [ɾ]；英音不一定如此。", writtenContraction: "{phrase} 作为一个声音块完成，不拆回完整形式逐词读。"
    },
    en: {
      contraction: "{phrase} often contracts in natural speech. Copy the rhythm without exaggerating it.", dYou: "The final sound in {word} merges with /j/ in you and approaches a ‘j’ sound.", doYou: "Keep {phrase} in one rhythm group; you is usually reduced.", sYou: "Adjacent sounds in {phrase} move together and may produce /ʒ/ or /ʃ/.", functionWord: "{word} usually carries little new information, so keep it short, light, and quick.", consonantVowel: "Move the final consonant of {first} directly into the vowel at the start of {second}.", vowelVowel: "A light /j/ or /w/ may connect {first} and {second}; keep the voice continuous.", cluster: "The final /t/ or /d/ in {first} is often unreleased before the next consonant.", linkingR: "Some non-rhotic British accents link {first} and {second} with /r/.", nasal: "Before /p b m/, /n/ may move toward the lips and sound closer to /m/.", hDrop: "When {second} is unstressed, /h/ may weaken or disappear and the words link.", tYou: "The /t/ in {first} can merge with /j/ in you to make /tʃ/ in fast speech.", shared: "Matching consonants across a boundary are usually held once, not released twice.", flap: "In common American environments, an internal /t/ can become a quick [ɾ]; this is not universal in British English.", writtenContraction: "Say {phrase} as one sound block rather than restoring and separating every full word."
    },
    "pt-BR": {
      contraction: "{phrase} costuma se reduzir na fala natural. Imite o ritmo sem exagerar.", dYou: "O som final de {word} se junta ao /j/ de you e se aproxima de um som de ‘j’.", doYou: "Mantenha {phrase} no mesmo grupo rítmico; you geralmente fica reduzido.", sYou: "Os sons próximos em {phrase} se aproximam e podem formar /ʒ/ ou /ʃ/.", functionWord: "{word} costuma trazer pouca informação nova; pronuncie de forma curta, leve e rápida.", consonantVowel: "Leve a consoante final de {first} diretamente para a vogal inicial de {second}.", vowelVowel: "Um /j/ ou /w/ leve pode ligar {first} e {second}; mantenha a voz contínua.", cluster: "O /t/ ou /d/ final de {first} costuma não ser liberado antes da próxima consoante.", linkingR: "Alguns sotaques britânicos não róticos ligam {first} e {second} com /r/.", nasal: "Antes de /p b m/, o /n/ pode se aproximar dos lábios e soar mais como /m/.", hDrop: "Quando {second} não recebe acento, o /h/ pode enfraquecer ou desaparecer.", tYou: "O /t/ de {first} pode se fundir ao /j/ de you e formar /tʃ/ na fala rápida.", shared: "Consoantes iguais na fronteira são mantidas uma vez, sem duas solturas.", flap: "Em contextos comuns do inglês americano, /t/ pode virar um [ɾ] rápido; isso não vale para todo sotaque britânico.", writtenContraction: "Pronuncie {phrase} como um bloco sonoro, sem separar novamente cada palavra completa."
    },
    ja: {
      contraction: "{phrase} は自然な会話でよく短縮されます。誇張せず、リズムをまねしましょう。", dYou: "{word} の語末音と you の /j/ が融合し、「j」に近い音になります。", doYou: "{phrase} を1つのリズムにまとめ、you を弱く発音します。", sYou: "{phrase} の隣り合う音が影響し合い、/ʒ/ または /ʃ/ になることがあります。", functionWord: "{word} は新しい情報を担わないことが多いため、短く軽く速く発音します。", consonantVowel: "{first} の語末子音を {second} の語頭母音へ直接つなげます。", vowelVowel: "{first} と {second} の間に軽い /j/ または /w/ が入り、声を切らずにつなぎます。", cluster: "{first} の語末 /t/ または /d/ は、次の子音の前で破裂させないことがあります。", linkingR: "一部の非r音性イギリス英語では、{first} と {second} を /r/ でつなぎます。", nasal: "/p b m/ の前では /n/ の調音位置が唇に近づき、/m/ に近くなることがあります。", hDrop: "{second} が非強勢のとき、/h/ が弱くなるか脱落して前の語とつながります。", tYou: "速い会話では {first} の /t/ と you の /j/ が融合して /tʃ/ になることがあります。", shared: "語境界の同じ子音は2回破裂させず、1回長めに保ちます。", flap: "一般的なアメリカ英語では語中の /t/ が速い [ɾ] になることがありますが、すべてのイギリス英語には当てはまりません。", writtenContraction: "{phrase} を完全形に戻して分けず、1つの音のかたまりとして発音します。"
    },
    ko: {
      contraction: "{phrase}는 자연스러운 말에서 자주 축약됩니다. 과장하지 말고 리듬을 따라 하세요.", dYou: "{word}의 끝소리와 you의 /j/가 합쳐져 ‘j’에 가까운 소리가 납니다.", doYou: "{phrase}를 하나의 리듬 단위로 말하고 you는 약하게 발음합니다.", sYou: "{phrase}의 인접한 소리가 서로 영향을 주어 /ʒ/ 또는 /ʃ/가 될 수 있습니다.", functionWord: "{word}는 새 정보를 담지 않는 경우가 많으므로 짧고 가볍고 빠르게 발음합니다.", consonantVowel: "{first}의 끝 자음을 {second}의 첫 모음으로 바로 연결합니다.", vowelVowel: "{first}와 {second} 사이에 약한 /j/ 또는 /w/가 생길 수 있으니 소리를 끊지 마세요.", cluster: "{first} 끝의 /t/ 또는 /d/는 다음 자음 앞에서 완전히 파열하지 않는 경우가 많습니다.", linkingR: "일부 비권설 영국식 억양에서는 {first}와 {second}를 /r/로 연결합니다.", nasal: "/p b m/ 앞에서 /n/의 조음 위치가 입술 쪽으로 이동해 /m/에 가까워질 수 있습니다.", hDrop: "{second}가 강세를 받지 않으면 /h/가 약해지거나 탈락해 앞 단어와 연결됩니다.", tYou: "빠른 말에서 {first}의 /t/와 you의 /j/가 합쳐져 /tʃ/가 될 수 있습니다.", shared: "경계의 같은 자음은 두 번 파열하지 않고 한 번 길게 유지합니다.", flap: "일반적인 미국식 발음 환경에서 단어 안의 /t/가 빠른 [ɾ]로 바뀔 수 있지만 모든 영국식 발음에 적용되지는 않습니다.", writtenContraction: "{phrase}를 완전한 단어로 다시 나누지 말고 하나의 소리 덩어리로 말합니다."
    }
  };

  const ruleName = key => ruleNames[locale]?.[key] || ruleNames.en[key] || key;
  const ruleTip = (key, values) => {
    const localeTemplates = tipTemplates[locale] || tipTemplates.en;
    let text = localeTemplates[key] || tipTemplates.en[key] || "";
    Object.entries(values).forEach(([name, value]) => {
      text = text.replaceAll(`{${name}}`, value);
    });
    return text;
  };

  const connectedRules = [
    { key: "contraction", re: /\b(going|want|got|have|used)\s+to\b/i, ipa: match => ({ going: "/ˈɡənə/", want: "/ˈwɒnə/", got: "/ˈɡɒtə/", have: "/ˈhæftə/", used: "/ˈjuːstə/" })[match[1].toLowerCase()], values: match => ({ phrase: match[0] }) },
    { key: "dYou", re: /\b(could|would|did|had|should)\s+you\b/i, ipa: match => `/${match[1].toLowerCase() === "did" ? "dɪdʒə" : "…dʒə"}/`, values: match => ({ word: match[1] }) },
    { key: "doYou", re: /\b(do|don't)\s+you\b/i, ipa: () => "/dʒə/ · /dəʊntʃə/", values: match => ({ phrase: match[0] }) },
    { key: "sYou", re: /\b(is|does|was|miss)\s+you\b/i, ipa: () => "/ʒə/ or /ʃə/", values: match => ({ phrase: match[0] }) },
    { key: "functionWord", re: /\b(to|for|and|of|can|a|the)\b/i, ipa: match => ({ to: "/tə/", for: "/fə/", and: "/ən/ or /n/", of: "/əv/", can: "/kən/", a: "/ə/", the: "/ðə/" })[match[1].toLowerCase()], values: match => ({ word: match[1] }) },
    { key: "consonantVowel", re: /\b([a-z]+[bcdfghjklmnpqrstvwxyz])\s+([aeiou][a-z]*)\b/i, ipa: match => `${match[1]}‿${match[2]}`, values: match => ({ first: match[1], second: match[2] }) },
    { key: "vowelVowel", re: /\b([a-z]*[aeiou])\s+([aeiou][a-z]*)\b/i, ipa: match => `${match[1]}‿/j,w/‿${match[2]}`, values: match => ({ first: match[1], second: match[2] }) },
    { key: "cluster", re: /\b([a-z]*[td])\s+([bcdfghjklmnpqrstvwxyz][a-z]*)\b/i, ipa: match => `${match[1]}̚ ${match[2]}`, values: match => ({ first: match[1], second: match[2] }) },
    { key: "linkingR", re: /\b([a-z]*(?:r|re))\s+([aeiou][a-z]*)\b/i, ipa: match => `${match[1]}‿r‿${match[2]}`, values: match => ({ first: match[1], second: match[2] }) },
    { key: "nasal", re: /\b([a-z]*n)\s+([pbm][a-z]*)\b/i, ipa: match => `${match[1]} → /m/ + ${match[2]}`, values: () => ({}) },
    { key: "hDrop", re: /\b(tell|ask|give|see|call|help)\s+(him|her|he|have)\b/i, ipa: match => `${match[1]}‿${match[2].replace(/^h/i, "")}`, values: match => ({ first: match[1], second: match[2] }) },
    { key: "tYou", re: /\b([a-z]*t)\s+you\b/i, ipa: match => `${match[1]}‿/tʃə/`, values: match => ({ first: match[1] }) },
    { key: "shared", re: /\b([a-z]*([bcdfghjklmnpqrstvwxyz]))\s+\2([a-z]*)\b/i, ipa: match => `${match[1]}_${match[2]}${match[3]}`, values: () => ({}) },
    { key: "flap", re: /\b([a-z]*[aeiou])t([aeiou][a-z]*)\b/i, ipa: match => `${match[1]}ɾ${match[2]}`, values: () => ({}) },
    { key: "writtenContraction", re: /\b([a-z]+)'(m|re|ll|ve|d|s|t)\b/i, ipa: match => `${match[1]}‿'${match[2]}`, values: match => ({ phrase: match[0] }) }
  ];

  const ruleExamples = [
    ["consonantVowel", "in a", "/ɪn‿ə/", "in a"],
    ["dYou", "Could you", "/kʊdʒə/", "could you"],
    ["dYou", "Did you", "/dɪdʒə/", "did you"],
    ["dYou", "Would you", "/wʊdʒə/", "would you"],
    ["functionWord", "Can you", "/kən jə/", "can you"],
    ["doYou", "Do you", "/dʒə/", "do you"],
    ["contraction", "Want to", "/ˈwɒnə/", "want to"],
    ["contraction", "Going to", "/ˈɡənə/", "going to"],
    ["contraction", "Have to", "/ˈhæftə/", "have to"],
    ["contraction", "Used to", "/ˈjuːstə/", "used to"],
    ["functionWord", "for a", "/fər‿ə/", "for a"],
    ["functionWord", "and a", "/ən‿ə/", "and a"],
    ["functionWord", "of a", "/əv‿ə/", "of a"],
    ["sYou", "is your", "/ɪʒə/", "is your"],
    ["linkingR", "there are", "/ðeər‿r‿ɑː/", "there are"],
    ["vowelVowel", "I am", "/aɪ‿j‿æm/", "i am"],
    ["sentenceStress", "What do you want to do right now?", "/wɒdəjə ˈwɒnə duː raɪt ˈnaʊ/", "right now"],
    ["thoughtGroups", "Could you tell me where the bus stop is?", "/kʊdʒə ˈtel mi | weə ðə ˈbʌs stɒp ɪz/", "bus stop"]
  ];

  function showLab() {
    $("lab").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderFilters() {
    const entries = [{ id: "all", label: t("all") }, ...zones.map(item => ({ id: item.id, label: zoneLabel(item.id) }))];
    $("filters").innerHTML = entries.map(item => `<button class="filter ${item.id === zone ? "active" : ""}" data-zone="${item.id}">${esc(item.label)}</button>`).join("");
    document.querySelectorAll(".filter").forEach(button => {
      button.onclick = () => {
        zone = button.dataset.zone;
        index = 0;
        catalogLimit = 60;
        renderFilters();
        render();
      };
    });
  }

  function renderScenes() {
    $("sceneMap").innerHTML = zones.map(item => `<button class="scene" data-zone="${item.id}"><b>${esc(zoneLabel(item.id))}</b><span>${esc(t("sceneCount"))}</span></button>`).join("");
    document.querySelectorAll(".scene").forEach(button => {
      button.onclick = () => {
        zone = button.dataset.zone;
        index = 0;
        catalogOpen = true;
        catalogLimit = 60;
        renderFilters();
        render();
        showLab();
      };
    });
  }

  function renderCatalog() {
    const catalog = $("catalog");
    const toggle = $("toggleCatalog");
    catalog.hidden = !catalogOpen;
    toggle.textContent = t(catalogOpen ? "directoryClose" : "directoryOpen");
    toggle.setAttribute("aria-expanded", String(catalogOpen));
    if (!catalogOpen) return;
    const items = pool();
    const visibleItems = items.slice(0, catalogLimit);
    $("catalogList").innerHTML = visibleItems.map((item, itemIndex) => `<button class="catalog-row ${item.id === currentItem?.id ? "active" : ""}" type="button" data-catalog-index="${itemIndex}"><span class="catalog-rank">${esc(t("directoryRank", { rank: number(itemIndex + 1) }))}</span><span><span class="catalog-english">${esc(item.e)}</span><span class="catalog-meaning">${esc(meaningFor(item))}</span></span></button>`).join("");
    document.querySelectorAll(".catalog-row").forEach(button => {
      button.onclick = () => {
        index = Number(button.dataset.catalogIndex);
        render();
        document.querySelector(".practice").scrollIntoView({ behavior: "smooth", block: "start" });
      };
    });
    const remaining = Math.max(0, items.length - visibleItems.length);
    $("catalogMore").hidden = remaining === 0;
    $("catalogMore").textContent = t("showMore", { count: number(remaining) });
    $("catalogAll").hidden = remaining !== 0;
    $("catalogAll").textContent = t("allShown", { count: number(items.length) });
  }

  function setBlind(value) {
    blind = value;
    $("blind").classList.toggle("on", blind);
    $("blind").setAttribute("aria-pressed", String(blind));
    $("blind").textContent = t(blind ? "blindOn" : "blindOff");
    ["phrase", "translation", "chunks"].forEach(id => $(id).classList.toggle("hidden-text", blind));
  }

  function setFlowStage(stage) {
    const stageId = { listen: "flowListen", shadow: "flowShadow", link: "flowLink" }[stage];
    document.querySelectorAll(".flow-node").forEach(button => button.classList.toggle("active", button.id === stageId));
  }

  function warm(items) {
    if (!items.length) return;
    const next = items[(index + 1) % items.length];
    const preload = $("preload");
    const url = audioUrl(next);
    if (preload.src !== url) {
      preload.src = url;
      preload.load();
    }
  }

  function sentenceRulesFor(text) {
    const found = [];
    for (const rule of connectedRules) {
      const match = text.match(rule.re);
      if (match) found.push({ key: rule.key, name: ruleName(rule.key), tip: ruleTip(rule.key, rule.values(match)), ipa: rule.ipa(match), phrase: match[0] });
      if (found.length === 4) break;
    }
    if (!found.length) found.push({ key: "sentenceStress", name: t("defaultRuleName"), tip: t("defaultRuleTip"), ipa: "CONTENT words > function words", phrase: text });
    return found;
  }

  function renderSentenceRules(text) {
    const found = sentenceRulesFor(text);
    $("sentenceRules").innerHTML = found.map(item => `<div class="sentence-rule"><b>${esc(item.name)}</b><span>${esc(item.tip)}<code>${esc(item.ipa)}</code></span></div>`).join("");
  }

  const tokenize = text => String(text || "").toLowerCase().replace(/[^a-z'\s]/g, " ").split(/\s+/).filter(Boolean);

  function matchedTokenIndexes(expected, heard) {
    const rows = expected.length + 1;
    const columns = heard.length + 1;
    const table = Array.from({ length: rows }, () => Array(columns).fill(0));
    for (let expectedIndex = 1; expectedIndex < rows; expectedIndex += 1) {
      for (let heardIndex = 1; heardIndex < columns; heardIndex += 1) {
        table[expectedIndex][heardIndex] = expected[expectedIndex - 1] === heard[heardIndex - 1]
          ? table[expectedIndex - 1][heardIndex - 1] + 1
          : Math.max(table[expectedIndex - 1][heardIndex], table[expectedIndex][heardIndex - 1]);
      }
    }
    const matched = new Set();
    let expectedIndex = expected.length;
    let heardIndex = heard.length;
    while (expectedIndex > 0 && heardIndex > 0) {
      if (expected[expectedIndex - 1] === heard[heardIndex - 1]) {
        matched.add(expectedIndex - 1);
        expectedIndex -= 1;
        heardIndex -= 1;
      } else if (table[expectedIndex - 1][heardIndex] >= table[expectedIndex][heardIndex - 1]) {
        expectedIndex -= 1;
      } else {
        heardIndex -= 1;
      }
    }
    return matched;
  }

  function splitPhrase(phrase) {
    const words = String(phrase || "").trim().split(/\s+/).filter(Boolean);
    return words.length > 1 ? words.join(" | ") : (words[0] || "—");
  }

  function renderSplitTeaching(rules) {
    return `<div class="split-title">${esc(t("linkedTeaching"))}</div>${rules.map(rule => `<article class="split-card"><b>${esc(rule.name)}</b><p>${esc(rule.tip)}</p><div class="split-steps"><div class="split-step"><em>1. ${esc(t("splitClear"))}</em><code>${esc(splitPhrase(rule.phrase))}</code></div><div class="split-step"><em>2. ${esc(t("splitLinked"))}</em><code>${esc(rule.phrase)}</code></div><div class="split-step"><em>3. ${esc(t("splitBack"))}</em><code>${esc(rule.ipa)}</code></div></div><button class="slow-play" type="button" data-slow-play="true">${esc(t("playSlow"))}</button></article>`).join("")}`;
  }

  function bindSlowPlayback() {
    document.querySelectorAll("[data-slow-play]").forEach(button => {
      button.onclick = () => {
        const audio = $("audio");
        $("speed").value = "0.35";
        audio.playbackRate = 0.35;
        audio.currentTime = 0;
        audio.play().catch(() => {});
      };
    });
  }

  function renderShadowFeedback() {
    const target = currentItem?.e || "";
    const rules = sentenceRulesFor(target);
    const result = $("shadowResult");
    setFlowStage("link");
    result.hidden = false;
    if (!recognitionAvailable) {
      result.innerHTML = `<div class="shadow-summary"><div class="coverage-score">—</div><div><h4>${esc(t("speechUnavailable"))}</h4><p>${esc(t("recordingReady"))}</p></div></div>${renderSplitTeaching(rules.slice(0, 3))}`;
      bindSlowPlayback();
      return;
    }
    if (!recognisedText.trim()) {
      result.innerHTML = `<div class="shadow-summary"><div class="coverage-score">—</div><div><h4>${esc(t("noSpeech"))}</h4><p>${esc(t("coverageNote"))}</p></div></div>${renderSplitTeaching(rules.slice(0, 3))}`;
      bindSlowPlayback();
      return;
    }
    const expected = tokenize(target);
    const heard = tokenize(recognisedText);
    const matched = matchedTokenIndexes(expected, heard);
    const coverage = expected.length ? Math.round((matched.size / expected.length) * 100) : 0;
    const missed = expected.filter((word, wordIndex) => !matched.has(wordIndex));
    const priorityRules = [...rules].sort((first, second) => {
      const firstMisses = tokenize(first.phrase).filter(word => missed.includes(word)).length;
      const secondMisses = tokenize(second.phrase).filter(word => missed.includes(word)).length;
      return secondMisses - firstMisses;
    }).slice(0, 3);
    result.innerHTML = `<div class="shadow-summary"><div class="coverage-score">${coverage}%</div><div><h4>${esc(t("coverage"))}</h4><p>${esc(t("coverageNote"))}</p></div></div><div class="recognised-text"><b>${esc(t("recognitionResult"))}</b><br>${esc(recognisedText)}</div>${missed.length ? `<div class="missed"><b>${esc(t("missedWords"))}：</b>${esc(missed.slice(0, 10).join(" · "))}</div>` : ""}${renderSplitTeaching(priorityRules)}`;
    bindSlowPlayback();
  }

  function stopMediaTracks() {
    if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }

  function resetShadowPractice() {
    shadowSession += 1;
    if (shadowPlayback) shadowPlayback.pause();
    shadowPlayback = null;
    if (shadowActive) {
      shadowActive = false;
      shadowStopping = false;
      if (mediaRecorder?.state !== "inactive") mediaRecorder.stop();
      if (speechRecognition && !recognitionEnded) {
        try { speechRecognition.stop(); } catch (_) {}
      }
      stopMediaTracks();
    }
    if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    recordedAudioUrl = "";
    recognisedText = "";
    recognitionAvailable = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
    $("playShadow").hidden = true;
    $("shadowResult").hidden = true;
    $("shadowResult").innerHTML = "";
    $("startShadow").disabled = false;
    $("stopShadow").disabled = true;
    $("shadowStatus").textContent = t("shadowIdle");
  }

  function maybeFinishShadowAnalysis() {
    if (!shadowStopping || !recorderEnded || !recognitionEnded) return;
    shadowStopping = false;
    $("startShadow").disabled = false;
    $("stopShadow").disabled = true;
    $("shadowStatus").textContent = t("recordingReady");
    renderShadowFeedback();
  }

  async function startShadowPractice() {
    if (shadowActive || !currentItem) return;
    setFlowStage("shadow");
    resetShadowPractice();
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      $("shadowStatus").textContent = t("micDenied");
      return;
    }
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (_) {
      $("shadowStatus").textContent = t("micDenied");
      return;
    }
    recordedChunks = [];
    recognisedText = "";
    recorderEnded = false;
    recognitionEnded = true;
    shadowActive = true;
    shadowStopping = false;
    const session = shadowSession;
    mediaRecorder = new MediaRecorder(mediaStream);
    mediaRecorder.ondataavailable = event => { if (session === shadowSession && event.data.size) recordedChunks.push(event.data); };
    mediaRecorder.onstop = () => {
      if (session !== shadowSession) return;
      recorderEnded = true;
      stopMediaTracks();
      if (recordedChunks.length) {
        const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || "audio/webm" });
        recordedAudioUrl = URL.createObjectURL(blob);
        $("playShadow").hidden = false;
      }
      maybeFinishShadowAnalysis();
    };

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionAvailable = Boolean(SpeechRecognition);
    if (SpeechRecognition) {
      speechRecognition = new SpeechRecognition();
      speechRecognition.lang = "en-US";
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;
      speechRecognition.maxAlternatives = 1;
      recognitionEnded = false;
      speechRecognition.onresult = event => {
        if (session !== shadowSession) return;
        let liveText = "";
        for (let resultIndex = event.resultIndex; resultIndex < event.results.length; resultIndex += 1) {
          const text = event.results[resultIndex][0].transcript;
          if (event.results[resultIndex].isFinal) recognisedText += `${text} `;
          else liveText += text;
        }
        const heard = `${recognisedText} ${liveText}`.trim();
        $("shadowStatus").textContent = heard ? `${t("shadowRecording")} ${heard}` : t("shadowRecording");
      };
      speechRecognition.onerror = event => {
        if (session !== shadowSession) return;
        if (event.error === "not-allowed" || event.error === "service-not-allowed") $("shadowStatus").textContent = t("micDenied");
      };
      speechRecognition.onend = () => {
        if (session !== shadowSession) return;
        recognitionEnded = true;
        maybeFinishShadowAnalysis();
      };
      try { speechRecognition.start(); }
      catch (_) { recognitionAvailable = false; recognitionEnded = true; }
    }
    mediaRecorder.start();
    $("startShadow").disabled = true;
    $("stopShadow").disabled = false;
    $("shadowStatus").textContent = recognitionAvailable ? t("shadowRecording") : t("speechUnavailable");
  }

  function stopShadowPractice() {
    if (!shadowActive) return;
    shadowActive = false;
    shadowStopping = true;
    $("stopShadow").disabled = true;
    $("shadowStatus").textContent = t("shadowAnalyzing");
    if (mediaRecorder?.state !== "inactive") mediaRecorder.stop();
    else recorderEnded = true;
    if (speechRecognition && !recognitionEnded) {
      try { speechRecognition.stop(); }
      catch (_) { recognitionEnded = true; }
    }
    maybeFinishShadowAnalysis();
  }

  function render() {
    const items = pool();
    const visibleZone = zone === "all" ? t("fullCorpus") : zoneLabel(zone);
    $("status").textContent = query
      ? t("statusSearch", { zone: visibleZone, count: number(items.length), query })
      : t("statusReady", { zone: visibleZone, count: number(items.length) });

    if (!items.length) {
      currentItem = null;
      resetShadowPractice();
      $("audio").pause();
      $("category").textContent = t("noResultsTitle");
      $("phrase").textContent = t("noResultsHint");
      $("translation").textContent = t("noResultsExample");
      $("chunks").innerHTML = "";
      $("sentenceRules").innerHTML = "";
      renderCatalog();
      return;
    }

    const item = items[index % items.length];
    currentItem = item;
    resetShadowPractice();
    const audio = $("audio");
    audio.pause();
    audio.loop = false;
    $("loop").classList.remove("on");
    $("loop").setAttribute("aria-pressed", "false");
    $("loop").textContent = t("loopOff");
    $("category").textContent = `${zone === "all" ? categoryLabel(item.c) : zoneLabel(zone)} · ${t("humanCorpus")}`;
    $("phrase").textContent = item.e;
    $("translation").textContent = meaningFor(item);
    $("chunks").innerHTML = chunks(item.e).map(value => `<span>${esc(value)}</span>`).join("");
    renderSentenceRules(item.e);
    setFlowStage("listen");
    $("note").textContent = t("trainingNote");
    $("attribution").textContent = t("audioAttribution", { user: item.user, license: item.license });
    $("license").href = item.attribution;
    $("buffer").textContent = t("bufferLoading");
    audio.src = audioUrl(item);
    audio.playbackRate = Number($("speed").value);
    audio.preservesPitch = true;
    audio.load();
    warm(items);
    setBlind(blind);
    renderCatalog();
  }

  function renderRules() {
    const available = ruleExamples.map(item => ({ item, found: library.find(entry => entry.e.toLowerCase().includes(item[3])) })).filter(entry => entry.found);
    $("rulesGrid").innerHTML = available.map(({ item: [nameKey, example, ipa, searchText] }) => `<article class="rule"><b>${esc(ruleName(nameKey))}</b><p>${esc(example)}</p><div class="ipa">${esc(ipa)}</div><button data-query="${esc(searchText)}">${esc(t("playHumanExample"))}</button></article>`).join("");
    document.querySelectorAll(".rule button").forEach(button => {
      button.onclick = () => {
        const found = library.find(item => item.e.toLowerCase().includes(button.dataset.query));
        if (!found) return;
        zone = "all";
        query = found.e;
        index = 0;
        $("search").value = found.e;
        renderFilters();
        render();
        showLab();
        $("audio").play().catch(() => {});
      };
    });
  }

  function localizeStatic() {
    document.documentElement.lang = locale;
    document.title = t("pageTitle");
    document.querySelectorAll("[data-i18n]").forEach(element => {
      element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-html]").forEach(element => {
      element.innerHTML = t(element.dataset.i18nHtml);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
      element.placeholder = t(element.dataset.i18nPlaceholder);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach(element => {
      element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
    });
    $("languageSelect").value = locale;
  }

  async function applyLocale(nextLocale) {
    locale = supportedLocales.includes(nextLocale) ? nextLocale : "en";
    $("languageSelect").disabled = true;
    $("settingsDialog").setAttribute("aria-busy", "true");
    await ensureTranslations(locale);
    try { localStorage.setItem("flowLocale", locale); } catch (_) {}
    localizeStatic();
    renderFilters();
    renderScenes();
    renderRules();
    render();
    $("languageSelect").disabled = false;
    $("settingsDialog").removeAttribute("aria-busy");
  }

  const closeDialog = () => {
    const dialog = $("settingsDialog");
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  };
  $("openSettings").onclick = () => {
    const dialog = $("settingsDialog");
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  };
  $("closeSettings").onclick = closeDialog;
  $("closeSettingsDone").onclick = closeDialog;
  $("settingsDialog").onclick = event => {
    if (event.target !== $("settingsDialog")) return;
    const rect = $("settingsDialog").getBoundingClientRect();
    const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (!inside) closeDialog();
  };
  $("languageSelect").onchange = event => applyLocale(event.target.value);
  $("search").oninput = event => { query = event.target.value.trim(); index = 0; render(); };
  $("clear").onclick = () => { $("search").value = ""; query = ""; index = 0; render(); };
  $("next").onclick = () => { const items = pool(); if (items.length) { index = (index + 1) % items.length; render(); } };
  $("blind").onclick = () => setBlind(!blind);
  $("flowListen").onclick = () => {
    setFlowStage("listen");
    $("audio").currentTime = 0;
    $("audio").play().catch(() => {});
  };
  $("flowShadow").onclick = () => {
    setFlowStage("shadow");
    $("shadowPractice").scrollIntoView({ behavior: "smooth", block: "center" });
    $("startShadow").focus();
  };
  $("flowLink").onclick = () => {
    setFlowStage("link");
    document.querySelector(".sentence-teaching").scrollIntoView({ behavior: "smooth", block: "center" });
  };
  $("toggleCatalog").onclick = () => {
    catalogOpen = !catalogOpen;
    catalogLimit = 60;
    renderCatalog();
  };
  $("catalogMore").onclick = () => {
    catalogLimit += 60;
    renderCatalog();
  };
  $("startShadow").onclick = () => startShadowPractice();
  $("stopShadow").onclick = () => stopShadowPractice();
  $("playShadow").onclick = () => {
    if (!recordedAudioUrl) return;
    if (shadowPlayback) shadowPlayback.pause();
    shadowPlayback = new Audio(recordedAudioUrl);
    shadowPlayback.play().catch(() => {});
  };
  $("speed").onchange = () => { $("audio").playbackRate = Number($("speed").value); };
  $("loop").onclick = () => {
    const audio = $("audio");
    audio.loop = !audio.loop;
    $("loop").classList.toggle("on", audio.loop);
    $("loop").setAttribute("aria-pressed", String(audio.loop));
    $("loop").textContent = t(audio.loop ? "loopOn" : "loopOff");
  };
  $("audio").oncanplay = () => { $("buffer").textContent = t("ready"); };
  $("audio").onplay = () => setFlowStage("listen");
  $("audio").onwaiting = () => { $("buffer").textContent = t("buffering"); };
  $("audio").onerror = () => { $("buffer").textContent = t("slowLoad"); };

  $("totalMetric").textContent = number(library.length);
  await ensureTranslations(locale);
  localizeStatic();
  renderFilters();
  renderScenes();
  renderRules();
  render();
})();
