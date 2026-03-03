// ===== SAME AGE — Pure JS (No Firebase) =====

// ===== App State =====
let currentCard = 0;
let fatherName = 'お父さん';
let targetAge = 18;
let fatherCurrentAge = 50;
let answers = [];
let eraData = null;

// ===== 時代背景データベース（1965年〜2015年） =====
const eraDatabase = {
  1965: {
    events: ['東京オリンピック翌年', 'ベトナム戦争激化'],
    music: ['ザ・ビートルズ「Help!」', '美空ひばり「柔」'],
    movies: ['サウンド・オブ・ミュージック'],
    trends: ['みゆき族', 'エレキギターブーム'],
    spirit: '高度経済成長の真っ只中。日本が自信を取り戻し始めた時代。'
  },
  1970: {
    events: ['大阪万博開催', '三島由紀夫事件', 'ビートルズ解散'],
    music: ['サイモン&ガーファンクル「明日に架ける橋」', '由紀さおり「夜明けのスキャット」'],
    movies: ['男はつらいよ シリーズ開始'],
    trends: ['万博ブーム', 'ヒッピー文化'],
    spirit: '万博に未来を夢見た。でも学生運動の時代でもあった。'
  },
  1975: {
    events: ['ベトナム戦争終結', '沖縄海洋博覧会'],
    music: ['クイーン「ボヘミアン・ラプソディ」', '中島みゆき「時代」'],
    movies: ['ジョーズ'],
    trends: ['ディスコブーム前夜', 'スーパーカーブーム'],
    spirit: '高度経済成長が終わり、新しい価値観が生まれ始めた時代。'
  },
  1980: {
    events: ['モスクワオリンピックボイコット', 'ジョン・レノン射殺'],
    music: ['松田聖子デビュー', 'YMO「テクノポリス」', 'オフコース「さよなら」'],
    movies: ['スター・ウォーズ 帝国の逆襲', '影武者'],
    trends: ['竹の子族', 'インベーダーゲームブーム', 'ウォークマン'],
    spirit: 'テクノロジーとポップカルチャーが融合し始めた。新しいものがキラキラしていた。'
  },
  1985: {
    events: ['日航機墜落事故', 'つくば万博', 'プラザ合意'],
    music: ['中森明菜「ミ・アモーレ」', 'チェッカーズ', 'a-ha「Take On Me」'],
    movies: ['バック・トゥ・ザ・フューチャー'],
    trends: ['ファミコンブーム', 'DCブランドブーム', 'おニャン子クラブ'],
    spirit: 'バブル前夜。日本が世界一豊かな国になろうとしていた。'
  },
  1988: {
    events: ['昭和天皇崩御前年', 'ソウルオリンピック', 'リクルート事件'],
    music: ['光GENJI', 'プリンセス プリンセス', 'マイケル・ジャクソン「BAD」'],
    movies: ['となりのトトロ', '火垂るの墓', 'ダイ・ハード'],
    trends: ['バブル経済最盛期', 'ボディコン', 'ユーロビート'],
    spirit: '日本中がお金と夢に溢れていた。信じられないほど楽観的な空気。'
  },
  1990: {
    events: ['バブル崩壊始まる', '東西ドイツ統一', 'スーパーファミコン発売'],
    music: ['B\'z「太陽のKomachi Angel」', 'ドリカム「笑顔の行方」', 'MC Hammer'],
    movies: ['ホーム・アローン', 'バック・トゥ・ザ・フューチャー3'],
    trends: ['カラオケボックス普及', 'ジュリアナ東京前夜'],
    spirit: 'まだバブルの余韻が残っていた。でもどこかで終わりを予感していた。'
  },
  1993: {
    events: ['Jリーグ開幕', '皇太子ご成婚', 'EU発足'],
    music: ['ZARD「負けないで」', 'Mr.Children「CROSS ROAD」', 'WANDS'],
    movies: ['ジュラシック・パーク', 'シンドラーのリスト'],
    trends: ['Jリーグブーム', 'ポケベル', '合コン文化'],
    spirit: 'バブルは弾けた。でもJリーグという新しい熱狂が生まれた。'
  },
  1995: {
    events: ['阪神・淡路大震災', '地下鉄サリン事件', 'Windows 95発売'],
    music: ['Mr.Children「Tomorrow never knows」', '小室ファミリー', 'Dreams Come True'],
    movies: ['新世紀エヴァンゲリオン（TV）', 'トイ・ストーリー', '耳をすませば'],
    trends: ['Windows 95フィーバー', 'PHS', 'ルーズソックス'],
    spirit: '震災とテロで日本が揺れた年。同時にインターネットの時代が始まった。'
  },
  1998: {
    events: ['長野オリンピック', 'サッカーW杯初出場', '金融危機'],
    music: ['宇多田ヒカル「Automatic」', 'GLAY「誘惑」', 'SPEED'],
    movies: ['タイタニック', 'もののけ姫（前年大ヒット）'],
    trends: ['たまごっち', 'プリクラ', 'ルーズソックス'],
    spirit: '不況の中でも、若者文化は爆発していた。宇多田ヒカルの衝撃。'
  },
  2000: {
    events: ['ミレニアム', 'シドニーオリンピック', 'PlayStation 2発売'],
    music: ['浜崎あゆみ「SEASONS」', 'サザンオールスターズ「TSUNAMI」', 'Eminem'],
    movies: ['バトル・ロワイアル', 'グラディエーター', '千と千尋の神隠し（翌年）'],
    trends: ['IT革命', 'iモード普及', 'カリスマ店員'],
    spirit: '21世紀が始まった。インターネットが普通になり始めた。全てが変わる予感。'
  },
  2003: {
    events: ['イラク戦争', 'SARS流行', '地上デジタル放送開始'],
    music: ['SMAP「世界に一つだけの花」', 'オレンジレンジ', '中島美嘉「雪の華」'],
    movies: ['踊る大捜査線 THE MOVIE 2', 'ロード・オブ・ザ・リング 王の帰還'],
    trends: ['ケータイ小説', 'ブログ', 'メイド喫茶'],
    spirit: '「世界に一つだけの花」。みんなが「自分らしさ」を模索し始めた。'
  },
  2005: {
    events: ['愛知万博', 'YouTubeサービス開始', '郵政選挙'],
    music: ['Mr.Children「四次元」', 'ORANGE RANGE「花」', 'レミオロメン「粉雪」'],
    movies: ['ALWAYS 三丁目の夕日', 'ハリー・ポッターと炎のゴブレット'],
    trends: ['iPod', 'ブログブーム', '電車男'],
    spirit: 'YouTubeが生まれた年。誰もが発信者になれる時代の幕開け。'
  },
  2008: {
    events: ['リーマン・ショック', '北京オリンピック', 'iPhone 3G日本上陸'],
    music: ['GReeeeN「キセキ」', 'Perfume「ポリリズム」', '嵐「truth」'],
    movies: ['崖の上のポニョ', 'ダークナイト'],
    trends: ['スマートフォン元年', 'ニコニコ動画', '草食系男子'],
    spirit: 'リーマン・ショックで世界が震えた。でもiPhoneが全てを変え始めた。'
  },
  2010: {
    events: ['チリ鉱山救助', 'iPad発売', 'はやぶさ帰還'],
    music: ['AKB48「ヘビーローテーション」', '嵐全盛期', 'K-POPブーム'],
    movies: ['借りぐらしのアリエッティ', 'インセプション', 'トイ・ストーリー3'],
    trends: ['Twitter普及', 'スマホシフト', 'AKB総選挙'],
    spirit: 'SNSで誰もが繋がった。「いいね」の時代が始まった。'
  },
  2013: {
    events: ['東京オリンピック決定', '富士山世界遺産登録', 'アベノミクス'],
    music: ['きゃりーぱみゅぱみゅ', 'EXILE TRIBE', 'ONE OK ROCK'],
    movies: ['風立ちぬ', 'アナと雪の女王（年末公開）'],
    trends: ['LINE普及', 'Instagram', '半沢直樹'],
    spirit: '「倍返しだ！」が流行語に。景気回復への期待感。'
  },
  2015: {
    events: ['北陸新幹線開業', 'パリ同時多発テロ', 'マイナンバー開始'],
    music: ['星野源「SUN」', 'back number', 'Adele「Hello」'],
    movies: ['スター・ウォーズ/フォースの覚醒', 'バケモノの子'],
    trends: ['インバウンド爆買い', 'Instagramブーム', 'ラグビーW杯旋風'],
    spirit: '訪日外国人が急増。日本が改めて「発見」され始めた。'
  }
};

// ===== 父のプリセット記憶データ =====
// （カードゲーム中は隠しておき、比較画面で初めて表示する）
const fatherMemories = {
  dream: '高校生の頃は漠然とエンジニアになりたいと思っていた。ものを作るのが好きだったから。',
  fear: '受験に落ちるのが怖かった。自分だけ取り残されるんじゃないかと。',
  secret: '実は親に内緒でバイトをしていた。バイク買うために。',
  joy: '友達と放課後に自転車で遠くまで行くのが楽しかった。目的地なんてなかった。',
  regret: 'もっと色んな人と話しておけばよかった。あの頃は狭い世界で生きていた。'
};

// ===== 5枚のカードテンプレート =====
const cardTemplates = [
  {
    type: 'DREAM',
    label: '夢・志',
    color: '#7C5BBA',
    question: '{{age}}のとき、将来の夢は何でしたか？\n今の自分に近い夢でしたか？',
    hint: '夢が変わっていても、変わっていなくてもOK。聞いてみよう。',
    memoryKey: 'dream',
  },
  {
    type: 'FEAR',
    label: '恐れ・不安',
    color: '#C0392B',
    question: '{{age}}のとき、一番怖かったことや\n不安だったことは何ですか？',
    hint: '失敗への不安、人間関係、将来への焦り。誰でも持っていたはず。',
    memoryKey: 'fear',
  },
  {
    type: 'SECRET',
    label: '本音・秘密',
    color: '#1A8A7A',
    question: '{{age}}のとき、親に言えなかった\n秘密や本音はありましたか？',
    hint: '言えなかった言葉が、今日のヒントかもしれない。',
    memoryKey: 'secret',
  },
  {
    type: 'JOY',
    label: '喜び・日常',
    color: '#D4821A',
    question: '{{age}}のとき、何が一番楽しかった？\n毎週何をして過ごしていましたか？',
    hint: '当時の日常がそのまま、その人の性格を表している。',
    memoryKey: 'joy',
  },
  {
    type: 'REGRET',
    label: '後悔・伝言',
    color: '#2C3E6B',
    question: '{{age}}の自分に、今の自分なら\n何を伝えたいですか？',
    hint: 'この答えの中に、お父さんがあなたに本当に伝えたいことがあるかもしれない。',
    memoryKey: 'regret',
  },
];

// ===== Utility =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(id);
  screen.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== Particles =====
function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 15; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.bottom = Math.random() * 40 + '%';
    p.style.animationDelay = Math.random() * 8 + 's';
    p.style.animationDuration = (5 + Math.random() * 5) + 's';
    p.style.width = (3 + Math.random() * 4) + 'px';
    p.style.height = p.style.width;
    container.appendChild(p);
  }
}

// ===== 年代データ取得 =====
function getEraForYear(year) {
  const years = Object.keys(eraDatabase).map(Number).sort((a, b) => a - b);
  let closest = years[0];
  for (const y of years) {
    if (Math.abs(y - year) < Math.abs(closest - year)) {
      closest = y;
    }
  }
  return { year: closest, data: eraDatabase[closest] };
}

// ===== Setup =====
function updateAgeContext() {
  const childAge = parseInt(document.getElementById('child-age').value);
  const fatherCurrentAgeVal = parseInt(document.getElementById('father-age').value);
  const badge = document.getElementById('age-badge');
  const desc = document.getElementById('age-description');

  if (childAge && fatherCurrentAgeVal) {
    const currentYear = 2026;
    const fatherBirthYear = currentYear - fatherCurrentAgeVal;
    const targetYear = fatherBirthYear + childAge;
    targetAge = childAge;
    fatherCurrentAge = fatherCurrentAgeVal;

    badge.style.display = 'block';
    desc.style.display = 'block';
    badge.textContent = childAge + '歳';
    desc.innerHTML = `${fatherName || 'お父さん'}が<strong>${childAge}歳</strong>だったのは<strong>${targetYear}年</strong>頃。<br>あなたと同い年の頃。`;
  }
}

function goToSetup() {
  showScreen('screen-setup');
}

function showEraScreen() {
  const childAge = parseInt(document.getElementById('child-age').value);
  const fAge = parseInt(document.getElementById('father-age').value);
  const fname = document.getElementById('father-name').value.trim();

  if (!childAge || !fAge) {
    showToast('年齢を入力してください');
    return;
  }

  targetAge = childAge;
  fatherCurrentAge = fAge;
  fatherName = fname || 'お父さん';

  const currentYear = 2026;
  const fatherBirthYear = currentYear - fatherCurrentAge;
  const targetYear = fatherBirthYear + targetAge;

  const era = getEraForYear(targetYear);
  eraData = era;

  // 時代背景画面を構成
  const container = document.getElementById('era-content-area');
  container.innerHTML = '';

  // ヘッダー年表示
  document.getElementById('era-year-display').textContent = `${targetYear}年`;
  document.getElementById('era-subtitle').innerHTML =
    `${fatherName}が<strong>${targetAge}歳</strong>だった頃。<br>あなたと同い年の頃の世界。`;

  // Spirit
  const spiritEl = document.createElement('div');
  spiritEl.className = 'era-spirit';
  spiritEl.innerHTML = `<p>"${era.data.spirit}"</p>`;
  container.appendChild(spiritEl);

  // カテゴリ別表示
  const categories = [
    { key: 'events', icon: '📰', label: '社会の出来事' },
    { key: 'music', icon: '🎵', label: '音楽' },
    { key: 'movies', icon: '🎬', label: '映画・エンタメ' },
    { key: 'trends', icon: '✨', label: '流行・トレンド' },
  ];

  categories.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'era-card';
    const items = era.data[cat.key].map(item => `<li>${item}</li>`).join('');
    card.innerHTML = `
      <div class="era-card-header">
        <span class="era-card-icon">${cat.icon}</span>
        <span class="era-card-label">${cat.label}</span>
      </div>
      <ul class="era-card-list">${items}</ul>
    `;
    container.appendChild(card);
  });

  showScreen('screen-era');
}

// ===== カードゲーム開始 =====
function startGame() {
  currentCard = 0;
  answers = [];
  buildProgressDots();
  loadCard(0);
  showScreen('screen-game');
}

// ===== Card Game =====
function buildProgressDots() {
  const container = document.getElementById('progress-dots');
  container.innerHTML = '';
  cardTemplates.forEach((card, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.id = 'dot-' + i;
    container.appendChild(dot);
  });
}

function loadCard(index) {
  const card = cardTemplates[index];
  // {{age}} → "20歳" に置換
  const question = card.question.replace(/{{age}}/g, targetAge + '歳');

  document.getElementById('card-type').textContent = card.type;
  document.getElementById('card-type-label').textContent = card.label;
  document.getElementById('card-num').textContent = String(index + 1).padStart(2, '0');
  document.getElementById('card-age-context').textContent = `${fatherName}が ${targetAge}歳のとき`;
  document.getElementById('card-question').textContent = question;
  document.getElementById('card-hint').textContent = card.hint;
  document.getElementById('progress-text').textContent = `${index + 1} / ${cardTemplates.length}`;
  document.getElementById('answer-input').value = '';

  // カテゴリカラー適用
  const mainCard = document.getElementById('main-card');
  mainCard.style.setProperty('--card-accent', card.color);
  document.getElementById('card-type').style.color = card.color;

  // Progress dots update
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.className = 'dot' + (i < index ? ' done' : i === index ? ' active' : '');
    if (i === index) d.style.background = card.color;
    else if (i < index) d.style.background = cardTemplates[i].color;
    else d.style.background = '';
  });
}

function nextCard() {
  const answer = document.getElementById('answer-input').value.trim();
  const answerData = {
    card: cardTemplates[currentCard],
    text: answer,
    age: targetAge,
  };
  answers.push(answerData);

  // ローカルストレージに保存
  try {
    const year = new Date().getFullYear();
    const stored = JSON.parse(localStorage.getItem('sameage_answers') || '{}');
    stored[year] = answers;
    localStorage.setItem('sameage_answers', JSON.stringify(stored));
  } catch (e) { /* ignore */ }

  const cardEl = document.getElementById('main-card');
  cardEl.classList.add('flip-out');

  setTimeout(() => {
    currentCard++;
    if (currentCard >= cardTemplates.length) {
      // 5問すべて終了 → 比較画面へ
      showReveal();
      return;
    }
    cardEl.classList.remove('flip-out');
    cardEl.classList.add('flip-in');
    loadCard(currentCard);
    setTimeout(() => cardEl.classList.remove('flip-in'), 600);
  }, 400);
}

// ===== 比較・対話画面 =====
// 5問終了後に、父の回答を初めて見せる＝対話のきっかけ
function showReveal() {
  showScreen('screen-reveal');
  const container = document.getElementById('reveal-cards');
  container.innerHTML = '';

  cardTemplates.forEach((card, i) => {
    const childAnswer = answers[i] ? answers[i].text : '';
    const fatherAnswer = fatherMemories[card.memoryKey] || '';
    const question = card.question.replace(/{{age}}/g, targetAge + '歳');

    const el = document.createElement('div');
    el.className = 'reveal-card';
    el.style.animationDelay = (i * 0.15) + 's';

    el.innerHTML = `
      <div class="reveal-card-header" style="border-left-color:${card.color}">
        <span class="reveal-card-type" style="color:${card.color}">${card.type}</span>
        <span class="reveal-card-label">${card.label}</span>
      </div>
      <div class="reveal-question">${question}</div>
      <div class="reveal-answers">
        <div class="reveal-answer-box child-box">
          <div class="reveal-answer-label">🙋 あなたの回答</div>
          <div class="reveal-answer-text ${!childAnswer ? 'skipped' : ''}">${childAnswer || '（スキップ）'}</div>
        </div>
        <div class="reveal-divider">
          <div class="reveal-divider-line"></div>
          <span class="reveal-divider-icon">💬</span>
          <div class="reveal-divider-line"></div>
        </div>
        <div class="reveal-answer-box father-box" style="border-left-color:${card.color}">
          <div class="reveal-answer-label" style="color:${card.color}">👨 ${fatherName}の回答</div>
          <div class="reveal-answer-text">${fatherAnswer}</div>
        </div>
      </div>
      <div class="reveal-talk-prompt">
        ↑ この回答について、${fatherName}と話してみよう
      </div>
    `;
    container.appendChild(el);
  });
}

// ===== End Screen =====
function showEnd() {
  const recapEl = document.getElementById('answers-recap');
  recapEl.innerHTML = '<p class="recap-title">今日の記録</p>';

  answers.forEach((a) => {
    if (!a.text) return;
    const item = document.createElement('div');
    item.className = 'recap-item';
    item.innerHTML = `
      <div class="recap-who" style="background:${a.card.color}">あなた</div>
      <div class="recap-q">${a.card.type} — ${a.card.label}</div>
      <div class="recap-a">${a.text}</div>
    `;
    recapEl.appendChild(item);
  });

  if (recapEl.querySelectorAll('.recap-item').length === 0) {
    recapEl.innerHTML += '<p style="color:#aaa;font-size:13px;">記録なし（スキップされました）</p>';
  }

  // 来年プレビュー
  const nextAge = targetAge + 1;
  const nextYear = 2026 - fatherCurrentAge + nextAge;
  const nextEra = getEraForYear(nextYear);
  document.getElementById('next-year-age').textContent = nextAge;
  document.getElementById('next-year-year').textContent = nextYear;
  document.getElementById('next-year-spirit').textContent = nextEra.data.spirit;

  showScreen('screen-end');
}

// ===== History (LocalStorage) =====
function showHistory() {
  showScreen('screen-history');
  const container = document.getElementById('history-list');
  container.innerHTML = '';

  try {
    const stored = JSON.parse(localStorage.getItem('sameage_answers') || '{}');
    const years = Object.keys(stored).sort().reverse();

    if (years.length === 0) {
      container.innerHTML = '<p style="color:#aaa;text-align:center;padding:40px;">まだ履歴がありません</p>';
      return;
    }

    years.forEach(year => {
      const yearDiv = document.createElement('div');
      yearDiv.className = 'history-year';
      yearDiv.innerHTML = `<div class="history-year-label">${year}年の記録</div>`;

      stored[year].forEach(a => {
        if (!a.text) return;
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
          <div class="history-q">${a.card.type} — ${a.card.question.replace(/{{age}}/g, a.age + '歳')}</div>
          <div class="history-a"><span class="recap-who" style="background:${a.card.color}">あなた</span> ${a.text}</div>
        `;
        yearDiv.appendChild(item);
      });

      container.appendChild(yearDiv);
    });
  } catch (e) {
    container.innerHTML = '<p style="color:#aaa;text-align:center;padding:40px;">履歴の読み込みに失敗しました</p>';
  }
}

function restart() {
  showScreen('screen-intro');
}

function goToEnd() {
  showEnd();
}

// ===== Init =====
function init() {
  createParticles();

  // Expose functions to HTML onclick handlers
  window.goToSetup = goToSetup;
  window.updateAgeContext = updateAgeContext;
  window.showEraScreen = showEraScreen;
  window.startGame = startGame;
  window.nextCard = nextCard;
  window.showReveal = showReveal;
  window.goToEnd = goToEnd;
  window.showHistory = showHistory;
  window.restart = restart;
}

init();
