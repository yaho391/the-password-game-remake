// utils.js (RU)

const hasLower = s => /[a-zа-яё]/.test(s);
const hasUpper = s => /[A-ZА-ЯЁ]/.test(s);
const hasDigit = s => /\d/.test(s);
const hasSpecial = s => /[^A-Za-zА-Яа-яЁё0-9\s]/.test(s);

// Базовая проверка эмодзи (не охватывает все ZWJ-связки, но хватает для игры)
const emojiRegex = /\p{Extended_Pictographic}/u;

// Подсчёты
function countVowels(s) {
  // Гласные: и латиница, и кириллица
  const m = s.match(/[aeiouyAEIOUYауоыиэяюёеАУОЫИЭЯЮЁЕ]/g);
  return m ? m.length : 0;
}
function countDigits(s) {
  const m = s.match(/\d/g);
  return m ? m.length : 0;
}
function sumDigits(s) {
  const digits = s.match(/\d/g);
  return digits ? digits.map(d => +d).reduce((a,b)=>a+b,0) : 0;
}

// Римские числа
function parseRoman(str) {
  const map = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
  if (!/^[IVXLCDM]+$/.test(str)) return null;
  let total = 0;
  for (let i = 0; i < str.length; i++) {
    const v = map[str[i]];
    const next = map[str[i+1]] || 0;
    if (v < next) total -= v;
    else total += v;
  }
  return total;
}

function findRomanSubstringEven(password, minLen = 2) {
  const s = password.toUpperCase();
  for (let i = 0; i < s.length; i++) {
    for (let j = i + minLen; j <= s.length; j++) {
      const sub = s.slice(i, j);
      if (!/^[IVXLCDM]+$/.test(sub)) break;
      const val = parseRoman(sub);
      if (val !== null && val % 2 === 0 && val > 0) return { sub, val };
    }
  }
  return null;
}

// Простое число
function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

// Метрики
function computeMetrics(password) {
  return {
    length: password.length,
    hasLower: hasLower(password),
    hasUpper: hasUpper(password),
    hasDigit: hasDigit(password),
    hasSpecial: hasSpecial(password),
    hasEmoji: emojiRegex.test(password),
    digitsCount: countDigits(password),
    digitsSum: sumDigits(password),
    vowelsCount: countVowels(password),
    tripleRepeat: /(.)\1\1/.test(password),
    trimmedEqual: password.trim() === password,
  };
}

// Русские месяцы (именительный падеж)
const MONTHS_RU = [
  "январь","февраль","март","апрель","май","июнь",
  "июль","август","сентябрь","октябрь","ноябрь","декабрь"
];

function includesMonthRU(password) {
  const low = password.toLowerCase();
  return MONTHS_RU.find(m => low.includes(m)) || null;
}

function includesNumber(password, n) {
  return password.includes(String(n));
}

export {
  computeMetrics,
  includesMonthRU,
  includesNumber,
  findRomanSubstringEven,
  isPrime,
  emojiRegex
};
