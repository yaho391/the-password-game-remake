// app.js (RU)
import { getRules, createCtx } from './rules.js';

const el = {
  input: document.getElementById('password'),
  rulesList: document.getElementById('rules'),
  progressBar: document.getElementById('progress-bar'),
  progressText: document.getElementById('progress-text'),
};

const rules = getRules();

const state = {
  unlocked: 1, // с первого правила
  results: new Map(),
};

function init() {
  renderRules();
  attachEvents();
  evaluate();
}

function attachEvents() {
  el.input.addEventListener('input', evaluate);
}

// function renderRules() {
//   el.rulesList.innerHTML = '';
//   for(let i = 0; i < state.unlocked; i++) {
//     const rule = rules[i];
//     const li = document.createElement('li');
//     li.className = 'rule locked';
//     li.dataset.ruleId = rule.id;

//     const status = document.createElement('div');
//     status.className = 'status';

//     const body = document.createElement('div');
//     const title = document.createElement('div');
//     title.className = 'title';
//     title.textContent = `${idx + 1}. ${rule.title}`;

//     const desc = document.createElement('div');
//     desc.className = 'desc';
//     desc.textContent = rule.description;

//     const msg = document.createElement('div');
//     msg.className = 'message';
//     msg.textContent = '';

//     body.appendChild(title);
//     body.appendChild(desc);
//     body.appendChild(msg);

//     li.appendChild(status);
//     li.appendChild(body);
//     el.rulesList.appendChild(li);
//   }
// }
function renderRules() {
  el.rulesList.innerHTML = '';
  for (let i = 0; i < state.unlocked; i++) {
  const rule = rules[i];
  const li = document.createElement('li');
  li.className = 'rule';
  li.dataset.ruleId = rule.id;
  
  const status = document.createElement('div');
  status.className = 'status';
  
  const body = document.createElement('div');
  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = `${i + 1}. ${rule.title}`;
  
  const desc = document.createElement('div');
  desc.className = 'desc';
  desc.textContent = rule.description;
  
  const msg = document.createElement('div');
  msg.className = 'message';
  msg.textContent = '';
  
  body.appendChild(title);
  body.appendChild(desc);
  body.appendChild(msg);
  
  li.appendChild(status);
  li.appendChild(body);
  el.rulesList.appendChild(li);
  
  const res = state.results.get(rule.id);
  if (res) {
  if (res.pass) {
  li.classList.add('pass');
  } else {
  li.classList.add('fail');
  msg.textContent = res.message || '';
  }
  } else {
  li.classList.add('locked');
  }
  }
  }
  
  

function maybeUnlockNext() {
  const allPass = allUnlockedPass();
  if (allPass && state.unlocked < rules.length) {
    state.unlocked += 1;
    const rule = rules[state.unlocked - 1];
    if (rule.dynamic && typeof rule.onUnlock === 'function') {
      const ctx = createCtx(el.input.value, state.unlocked);
      rule.onUnlock(ctx);
    }
  }
}

function allUnlockedPass() {
  for (let i = 0; i < state.unlocked; i++) {
    const rule = rules[i];
    const res = state.results.get(rule.id);
    if (!res || !res.pass) return false;
  }
  return true;
}

// function evaluate() {
//   const password = el.input.value;
//   // let unlockedBefore = state.unlocked;

//   while (true) {
//     const ctx = createCtx(password, state.unlocked);

//     // Проверка всех правил до текущего уровня
//     for (let i = 0; i < rules.length; i++) {
//       const rule = rules[i];
//       const li = el.rulesList.querySelector(`.rule[data-rule-id="${rule.id}"]`);
//       const msg = li.querySelector('.message');

//       const result = rule.validate(password, ctx);
//       state.results.set(rule.id, result);

//       // if (i < state.unlocked) {
//       //   const result = rule.validate(password, ctx);
//       //   state.results.set(rule.id, result);

//         if (result.pass) {
//           li.classList.remove('fail');
//           li.classList.add('pass');
//           msg.textContent = '';
//         } else {
//           li.classList.remove('pass');
//           li.classList.add('fail');
//           msg.textContent = result.message || '';
//         }
//       // } else {
//       //   state.results.delete(rule.id);
//       //   li.classList.remove('pass', 'fail');
//       //   li.classList.add('locked');
//       //   msg.textContent = '';
//       // }
//     }

//     // Попробовать открыть следующее правило
//     const allPass = allUnlockedPass();
//     if (allPass && state.unlocked < rules.length) {
//       state.unlocked += 1;
//       renderRules();
//       // const rule = rules[state.unlocked - 1];
//       // if (rule.dynamic && typeof rule.onUnlock === 'function') {
//       //   const unlockCtx = createCtx(password, state.unlocked);
//       //   rule.onUnlock(unlockCtx);
//       continue;
//       }
//       break; 
//     }
    
//     updateProgress();
//   }

function evaluate() {
  const password = el.input.value;
  
  while (true) {
  const ctx = createCtx(password, state.unlocked);
  
  // Проверяем только открытые правила
  for (let i = 0; i < state.unlocked; i++) {
  const rule = rules[i];
  const li = el.rulesList.querySelector(`.rule[data-rule-id="${rule.id}"]`);
  const msg = li.querySelector('.message');
  
  const result = rule.validate(password, ctx);
  state.results.set(rule.id, result);
  
  if (result.pass) {
  li.classList.remove('fail');
  li.classList.add('pass');
  msg.textContent = '';
  } else {
  li.classList.remove('pass');
  li.classList.add('fail');
  msg.textContent = result.message || '';
  }
  }
  
  // Проверяем: все ли открытые правила выполнены
  const allPass = allUnlockedPass();
  if (allPass && state.unlocked < rules.length) {
  state.unlocked += 1;
  renderRules(); // перерисовываем список, добавляем новое правило
  continue; // проверяем снова, вдруг сразу выполнено
  }
  
  break;
  }
  
  updateProgress();
  }
  


function updateProgress() {
  const total = rules.length;
  const unlocked = state.unlocked;
  const passing = Array.from({ length: unlocked }).filter((_, i) => {
    const r = rules[i];
    const res = state.results.get(r.id);
    return res && res.pass;
  }).length;

  const pct = Math.round((unlocked / total) * 100);
  el.progressBar.style.width = `${pct}%`;
  el.progressText.textContent = `${unlocked} / ${total} правил открыто — ${passing}/${unlocked} выполнено`;
}

init();
