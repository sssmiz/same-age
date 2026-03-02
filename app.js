// ===== Firebase Imports =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, query, where, serverTimestamp, updateDoc }
  from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// ===== Firebase Config =====
const firebaseConfig = {
  apiKey: "AIzaSyCN2MJYgr2h7BIaudNh-J1NEdYxJG463hQ",
  authDomain: "same-age.firebaseapp.com",
  projectId: "same-age",
  storageBucket: "same-age.firebasestorage.app",
  messagingSenderId: "999759654319",
  appId: "1:999759654319:web:258f0c7067f7e79371d35a",
  measurementId: "G-DZXX7S0G7Q"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ===== App State =====
let currentUser = null;
let userRole = null;      // 'father' or 'child'
let familyId = null;
let familyData = null;
let currentCard = 0;
let fatherName = 'お父さん';
let targetAge = 18;
let selectedWho = null;
let answers = [];

const cardTemplates = [
  {
    type: 'DREAM',
    question: '{{age}}歳のとき、将来の夢は何でしたか？\n今の自分に近い夢でしたか？',
    hint: '夢が変わっていても、変わっていなくてもOK。聞いてみよう。',
  },
  {
    type: 'FEAR',
    question: '{{age}}歳のとき、一番怖かったことや\n不安だったことは何ですか？',
    hint: '失敗への不安、人間関係、将来への焦り。誰でも持っていたはず。',
  },
  {
    type: 'SECRET',
    question: '{{age}}歳のとき、親に言えなかった\n秘密や本音はありましたか？',
    hint: '言えなかった言葉が、今日のヒントかもしれない。',
  },
  {
    type: 'JOY',
    question: '{{age}}歳のとき、何が一番楽しかった？\n毎週何をして過ごしていましたか？',
    hint: '当時の日常がそのまま、その人の性格を表している。',
  },
  {
    type: 'REGRET',
    question: '{{age}}歳の自分に、今の自分なら\n何を伝えたいですか？',
    hint: 'この答えの中に、お父さんがあなたに本当に伝えたいことがあるかもしれない。',
  },
];

// ===== Utility =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
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

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ===== Particles =====
function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.bottom = Math.random() * 30 + '%';
    p.style.animationDelay = Math.random() * 6 + 's';
    p.style.animationDuration = (4 + Math.random() * 4) + 's';
    container.appendChild(p);
  }
}

// ===== Auth =====
function updateUserBar(user) {
  const bar = document.getElementById('user-info-bar');
  if (user) {
    bar.classList.add('visible');
    document.getElementById('user-display-name').textContent = user.displayName || 'ユーザー';
    const avatar = document.getElementById('user-avatar');
    if (user.photoURL) {
      avatar.src = user.photoURL;
      avatar.style.display = 'block';
    } else {
      avatar.style.display = 'none';
    }
  } else {
    bar.classList.remove('visible');
  }
}

async function googleLogin() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    currentUser = result.user;
    updateUserBar(currentUser);

    // Save user info to Firestore (失敗しても画面遷移は続ける)
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        displayName: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL || null,
        lastLogin: serverTimestamp()
      }, { merge: true });
    } catch (firestoreError) {
      console.warn('Firestore save skipped:', firestoreError);
    }

    await checkExistingFamily();
  } catch (error) {
    console.error('Login error:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      showToast('ログインがキャンセルされました');
    } else {
      showToast('ログインエラーが発生しました');
    }
  }
}

async function logout() {
  await signOut(auth);
  currentUser = null;
  userRole = null;
  familyId = null;
  familyData = null;
  updateUserBar(null);
  showScreen('screen-intro');
}

// ===== Family / Pairing =====
async function checkExistingFamily() {
  try {
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const userData = userDoc.data();

    if (userData && userData.familyId) {
      familyId = userData.familyId;
      userRole = userData.role;
      const familyDoc = await getDoc(doc(db, 'families', familyId));
      if (familyDoc.exists()) {
        familyData = familyDoc.data();
        fatherName = familyData.fatherName || 'お父さん';
        targetAge = familyData.childAge || 18;
        showScreen('screen-setup');
        prefillSetup();
        showToast(`おかえりなさい！（${userRole === 'father' ? '父親' : '子供'}として参加中）`);
        return;
      }
    }
  } catch (err) {
    console.warn('Family check skipped:', err);
  }
  showScreen('screen-role');
}

function prefillSetup() {
  if (familyData) {
    if (familyData.childAge) document.getElementById('child-age').value = familyData.childAge;
    if (familyData.fatherAge) document.getElementById('father-age').value = familyData.fatherAge;
    if (familyData.fatherName) document.getElementById('father-name').value = familyData.fatherName;
    updateAgeContext();
  }
}

function selectRole(role) {
  userRole = role;
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  document.querySelector(`.role-card[data-role="${role}"]`).classList.add('selected');
}

function confirmRole() {
  if (!userRole) {
    showToast('役割を選んでください');
    return;
  }
  showScreen('screen-pairing');
  switchPairingTab(userRole === 'father' ? 'create' : 'join');
}

function switchPairingTab(tab) {
  document.querySelectorAll('.pairing-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.pairing-section').forEach(s => s.classList.remove('active'));
  document.querySelector(`.pairing-tab[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(`pairing-${tab}`).classList.add('active');
}

async function createFamily() {
  const code = generateCode();
  familyId = 'family_' + Date.now();

  await setDoc(doc(db, 'families', familyId), {
    code: code,
    createdAt: serverTimestamp(),
    members: { [userRole]: currentUser.uid },
    createdBy: currentUser.uid
  });

  await updateDoc(doc(db, 'users', currentUser.uid), {
    familyId: familyId,
    role: userRole
  });

  document.getElementById('generated-code').textContent = code;
  document.getElementById('code-created-area').style.display = 'block';
  document.getElementById('btn-create-family').style.display = 'none';
  showToast('家族コードを作成しました！');
}

async function joinFamily() {
  const inputCode = document.getElementById('join-code-input').value.trim().toUpperCase();
  if (!inputCode || inputCode.length !== 6) {
    showToast('6桁のコードを入力してください');
    return;
  }

  // Search for family with this code
  const familiesRef = collection(db, 'families');
  const q = query(familiesRef, where('code', '==', inputCode));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    showToast('コードが見つかりません');
    return;
  }

  const familyDoc = querySnapshot.docs[0];
  familyId = familyDoc.id;
  familyData = familyDoc.data();

  // Update family with this member
  const updateData = { [`members.${userRole}`]: currentUser.uid };
  await updateDoc(doc(db, 'families', familyId), updateData);

  await updateDoc(doc(db, 'users', currentUser.uid), {
    familyId: familyId,
    role: userRole
  });

  showToast('家族に参加しました！');
  showScreen('screen-setup');
  prefillSetup();
}

function skipPairing() {
  showScreen('screen-setup');
}

function goAfterCodeCreated() {
  showScreen('screen-setup');
}

// ===== Setup =====
function updateAgeContext() {
  const childAge = parseInt(document.getElementById('child-age').value);
  const fatherCurrentAge = parseInt(document.getElementById('father-age').value);
  const badge = document.getElementById('age-badge');
  const desc = document.getElementById('age-description');

  if (childAge && fatherCurrentAge) {
    const fatherBirthYear = new Date().getFullYear() - fatherCurrentAge;
    const targetYear = fatherBirthYear + childAge;
    targetAge = childAge;

    badge.style.display = 'block';
    desc.style.display = 'block';
    badge.textContent = childAge + '歳';
    desc.textContent = `お父さんが${childAge}歳だったのは${targetYear}年頃。あなたと同い年の頃。`;
  }
}

async function startGame() {
  const childAge = parseInt(document.getElementById('child-age').value);
  const fAge = parseInt(document.getElementById('father-age').value);
  const fname = document.getElementById('father-name').value.trim();

  if (!childAge || !fAge) { showToast('年齢を入力してください'); return; }

  targetAge = childAge;
  fatherName = fname || 'お父さん';
  currentCard = 0;
  answers = [];

  // Save setup to Firestore
  if (familyId) {
    await updateDoc(doc(db, 'families', familyId), {
      childAge: childAge,
      fatherAge: fAge,
      fatherName: fatherName
    }).catch(() => {});
  } else {
    // Create solo family for offline/solo use
    familyId = 'solo_' + currentUser.uid;
    await setDoc(doc(db, 'families', familyId), {
      childAge: childAge,
      fatherAge: fAge,
      fatherName: fatherName,
      members: { [userRole || 'child']: currentUser.uid },
      createdAt: serverTimestamp(),
      solo: true
    }, { merge: true });
    await updateDoc(doc(db, 'users', currentUser.uid), {
      familyId: familyId,
      role: userRole || 'child'
    });
  }

  buildProgressDots();
  loadCard(0);
  showScreen('screen-game');
}

// ===== Card Game =====
function buildProgressDots() {
  const container = document.getElementById('progress-dots');
  container.innerHTML = '';
  cardTemplates.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.id = 'dot-' + i;
    container.appendChild(dot);
  });
}

function loadCard(index) {
  const card = cardTemplates[index];
  const question = card.question.replace(/{{age}}/g, targetAge + '歳');

  document.getElementById('card-type').textContent = card.type;
  document.getElementById('card-num').textContent = String(index + 1).padStart(2, '0');
  document.getElementById('card-age-context').textContent = `${fatherName}が ${targetAge}歳のとき`;
  document.getElementById('card-question').textContent = question;
  document.getElementById('card-hint').textContent = card.hint;
  document.getElementById('progress-text').textContent = `${index + 1} / ${cardTemplates.length}`;
  document.getElementById('answer-input').value = '';
  selectedWho = null;
  document.getElementById('btn-father').classList.remove('selected');
  document.getElementById('btn-child').classList.remove('selected');

  document.querySelectorAll('.dot').forEach((d, i) => {
    d.className = 'dot' + (i < index ? ' done' : i === index ? ' active' : '');
  });
}

function selectWho(who) {
  selectedWho = who;
  document.getElementById('btn-father').classList.toggle('selected', who === 'father');
  document.getElementById('btn-child').classList.toggle('selected', who === 'child');
  const placeholder = who === 'father'
    ? `${fatherName}の答えを書いてあげよう…`
    : 'あなたも同じ質問に答えてみよう…';
  document.getElementById('answer-input').placeholder = placeholder;
}

async function nextCard() {
  const answer = document.getElementById('answer-input').value.trim();
  const answerData = {
    card: cardTemplates[currentCard],
    who: selectedWho,
    text: answer,
    age: targetAge,
  };
  answers.push(answerData);

  // Save to Firestore
  if (familyId && answer) {
    const year = new Date().getFullYear();
    const answerId = `q${currentCard}`;
    const answerField = selectedWho || userRole || 'unknown';
    try {
      await setDoc(doc(db, 'families', familyId, 'sessions', String(year), 'answers', answerId), {
        [answerField]: { text: answer, answeredAt: serverTimestamp(), answeredBy: currentUser.uid },
        cardType: cardTemplates[currentCard].type,
        question: cardTemplates[currentCard].question.replace(/{{age}}/g, targetAge + '歳'),
        targetAge: targetAge
      }, { merge: true });
    } catch (err) {
      console.error('Save error:', err);
    }
  }

  const cardEl = document.getElementById('main-card');
  cardEl.classList.add('flip-out');

  setTimeout(() => {
    currentCard++;
    if (currentCard >= cardTemplates.length) {
      showEnd();
      return;
    }
    cardEl.classList.remove('flip-out');
    cardEl.classList.add('flip-in');
    loadCard(currentCard);
    setTimeout(() => cardEl.classList.remove('flip-in'), 600);
  }, 400);
}

// ===== End Screen =====
function showEnd() {
  const recapEl = document.getElementById('answers-recap');
  recapEl.innerHTML = '<p class="recap-title">今日の記録</p>';

  answers.forEach((a) => {
    if (!a.text) return;
    const item = document.createElement('div');
    item.className = 'recap-item';
    const whoLabel = a.who === 'father' ? fatherName : 'あなた';
    item.innerHTML = `
      <div class="recap-who">${whoLabel}</div>
      <div class="recap-q">${a.card.type} — ${a.age}歳のとき</div>
      <div class="recap-a">${a.text}</div>
    `;
    recapEl.appendChild(item);
  });

  if (recapEl.querySelectorAll('.recap-item').length === 0) {
    recapEl.innerHTML += '<p style="color:#aaa;font-size:13px;">記録なし（スキップされました）</p>';
  }

  showScreen('screen-end');
}

// ===== Compare View =====
async function showComparison() {
  showScreen('screen-compare');
  const container = document.getElementById('compare-cards');
  container.innerHTML = '<div class="spinner"></div><p class="loading-text">回答を読み込み中...</p>';

  const year = new Date().getFullYear();
  try {
    const answersRef = collection(db, 'families', familyId, 'sessions', String(year), 'answers');
    const snapshot = await getDocs(answersRef);

    container.innerHTML = '';
    if (snapshot.empty) {
      container.innerHTML = '<p style="color:#aaa;text-align:center;padding:40px;">まだ回答がありません</p>';
      return;
    }

    const sortedDocs = snapshot.docs.sort((a, b) => {
      const aNum = parseInt(a.id.replace('q', ''));
      const bNum = parseInt(b.id.replace('q', ''));
      return aNum - bNum;
    });

    sortedDocs.forEach((d) => {
      const data = d.data();
      const card = document.createElement('div');
      card.className = 'compare-card';
      const fatherText = data.father ? data.father.text : null;
      const childText = data.child ? data.child.text : null;

      card.innerHTML = `
        <div class="compare-card-type">${data.cardType || ''}</div>
        <div class="compare-question">${data.question || ''}</div>
        <div class="compare-answers">
          <div class="compare-answer-box">
            <div class="compare-answer-label">👨 ${fatherName}の回答</div>
            <div class="compare-answer-text ${!fatherText ? 'waiting' : ''}">${fatherText || 'まだ回答されていません'}</div>
          </div>
          <div class="compare-answer-box child-answer">
            <div class="compare-answer-label">🙋 あなたの回答</div>
            <div class="compare-answer-text ${!childText ? 'waiting' : ''}">${childText || 'まだ回答されていません'}</div>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Compare error:', err);
    container.innerHTML = '<p style="color:#aaa;text-align:center;padding:40px;">回答の読み込みに失敗しました</p>';
  }
}

// ===== History =====
async function showHistory() {
  showScreen('screen-history');
  const container = document.getElementById('history-list');
  container.innerHTML = '<div class="spinner"></div><p class="loading-text">履歴を読み込み中...</p>';

  try {
    const sessionsRef = collection(db, 'families', familyId, 'sessions');
    const sessionsSnap = await getDocs(sessionsRef);

    container.innerHTML = '';
    if (sessionsSnap.empty) {
      container.innerHTML = '<p style="color:#aaa;text-align:center;padding:40px;">まだ履歴がありません</p>';
      return;
    }

    const years = sessionsSnap.docs.map(d => d.id).sort().reverse();

    for (const year of years) {
      const yearDiv = document.createElement('div');
      yearDiv.className = 'history-year';
      yearDiv.innerHTML = `<div class="history-year-label">${year}年の記録</div>`;

      const answersRef = collection(db, 'families', familyId, 'sessions', year, 'answers');
      const answersSnap = await getDocs(answersRef);

      answersSnap.docs.sort((a, b) => {
        const aNum = parseInt(a.id.replace('q', ''));
        const bNum = parseInt(b.id.replace('q', ''));
        return aNum - bNum;
      }).forEach(d => {
        const data = d.data();
        const item = document.createElement('div');
        item.className = 'history-item';
        let answerParts = [];
        if (data.father) answerParts.push(`<span class="recap-who">${fatherName}</span> ${data.father.text}`);
        if (data.child) answerParts.push(`<span class="recap-who" style="background:var(--sage)">あなた</span> ${data.child.text}`);
        item.innerHTML = `
          <div class="history-q">${data.cardType || ''} — ${data.question || ''}</div>
          <div class="history-a">${answerParts.join('<br>') || '回答なし'}</div>
        `;
        yearDiv.appendChild(item);
      });

      container.appendChild(yearDiv);
    }
  } catch (err) {
    console.error('History error:', err);
    container.innerHTML = '<p style="color:#aaa;text-align:center;padding:40px;">履歴の読み込みに失敗しました</p>';
  }
}

function restart() {
  showScreen('screen-intro');
}

function goToLogin() {
  showScreen('screen-login');
}

// ===== Init =====
function init() {
  createParticles();

  // Auth state listener
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      updateUserBar(user);
    }
  });

  // Expose functions to HTML onclick handlers
  window.goToLogin = goToLogin;
  window.googleLogin = googleLogin;
  window.logout = logout;
  window.selectRole = selectRole;
  window.confirmRole = confirmRole;
  window.switchPairingTab = switchPairingTab;
  window.createFamily = createFamily;
  window.joinFamily = joinFamily;
  window.skipPairing = skipPairing;
  window.goAfterCodeCreated = goAfterCodeCreated;
  window.updateAgeContext = updateAgeContext;
  window.startGame = startGame;
  window.selectWho = selectWho;
  window.nextCard = nextCard;
  window.showComparison = showComparison;
  window.showHistory = showHistory;
  window.restart = restart;
}

init();
