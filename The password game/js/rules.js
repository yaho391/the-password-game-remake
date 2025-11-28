// rules.js (RU)
import {
  computeMetrics,
  includesMonthRU,
  findRomanSubstringEven,
  isPrime
} from './utils.js';

// Параметры правил (в памяти)
const params = {};

function getParam(ruleId, key) {
  params[ruleId] ??= {};
  return params[ruleId][key];
}
function setParam(ruleId, key, value) {
  params[ruleId] ??= {};
  params[ruleId][key] = value;
}

function createCtx(password, level) {
  const now = new Date();
  return {
    metrics: computeMetrics(password),
    params,
    now,
    level
  };
}

const RULES = [
  // 1. Минимальная длина
  {
    id: 'len12',
    title: 'Минимальная длина',
    description: 'Пароль должен быть длиной не менее 12 символов.',
    validate(pw, ctx) {
      const ok = ctx.metrics.length >= 12;
      return { pass: ok, message: ok ? '' : `Сейчас ${ctx.metrics.length}, нужно 12+.` };
    }
  },

  // 2. Строчные и заглавные буквы
  {
    id: 'letters-case',
    title: 'Буквы разных регистров',
    description: 'Добавьте хотя бы одну строчную и одну заглавную букву.',
    validate(pw, ctx) {
      const m = ctx.metrics;
      const ok = m.hasLower && m.hasUpper;
      return { pass: ok, message: ok ? '' : 'Нужны и строчные, и заглавные буквы.' };
    }
  },

  // 3. Цифра
  {
    id: 'digit-required',
    title: 'Цифра обязательна',
    description: 'Добавьте хотя бы одну цифру.',
    validate(pw, ctx) {
      const ok = ctx.metrics.hasDigit;
      return { pass: ok, message: ok ? '' : 'Добавьте хотя бы одну цифру.' };
    }
  },

  // 4. Спецсимвол
  {
    id: 'special-required',
    title: 'Спецсимвол',
    description: 'Добавьте хотя бы один специальный символ (например, !, @, #, %).',
    validate(pw, ctx) {
      const ok = ctx.metrics.hasSpecial;
      return { pass: ok, message: ok ? '' : 'Добавьте спецсимвол.' };
    }
  },

  // 5. Без пробелов по краям
  {
    id: 'trim-edges',
    title: 'Без пробелов по краям',
    description: 'Запрещены пробелы в начале и/или в конце.',
    validate(pw, ctx) {
      const ok = ctx.metrics.trimmedEqual;
      return { pass: ok, message: ok ? '' : 'Уберите пробел(ы) по краям.' };
    }
  },

  // 6. Эмодзи
  {
    id: 'emoji',
    title: 'Добавьте эмодзи',
    description: 'Включите хотя бы один эмодзи.',
    validate(pw, ctx) {
      const ok = ctx.metrics.hasEmoji;
      return { pass: ok, message: ok ? '' : 'Добавьте любой эмодзи (например, 😀🔥🍀).' };
    }
  },

  // Дополнительные правила
  {
    id: 'starts-letter',
    title: 'Начинается с буквы',
    description: 'Пароль должен начинаться с буквы (латиница или кириллица).',
    validate(pw) {
      const ok = /^[A-Za-zА-Яа-яЁё]/.test(pw);
      return { pass: ok, message: ok ? '' : 'Пароль должен начинаться с буквы.' };
    }
  },

  {
    id: 'ends-digit',
    title: 'Заканчивается цифрой',
    description: 'Последний символ пароля должен быть цифрой.',
    validate(pw) {
      const ok = /\d$/.test(pw);
      return { pass: ok, message: ok ? '' : 'Пароль должен заканчиваться цифрой.' };
    }
  },

  {
    id: 'two-specials',
    title: 'Два спецсимвола',
    description: 'В пароле должно быть хотя бы два разных спецсимвола.',
    validate(pw) {
      const specials = pw.match(/[^A-Za-zА-Яа-яЁё0-9\s]/g);
      const unique = specials ? new Set(specials).size : 0;
      const ok = unique >= 2;
      return { pass: ok, message: ok ? '' : `Сейчас уникальных спецсимволов: ${unique}.` };
    }
  },

  {
    id: 'even-length',
    title: 'Чётная длина',
    description: 'Длина пароля должна быть чётной.',
    validate(pw) {
      const ok = pw.length % 2 === 0;
      return { pass: ok, message: ok ? '' : `Длина = ${pw.length}, нужна чётная.` };
    }
  },

  {
    id: 'contains-game',
    title: 'Содержит слово game',
    description: 'Пароль должен содержать слово "game" или "игра".',
    validate(pw) {
      const ok = /game/i.test(pw) || /игра/i.test(pw);
      return { pass: ok, message: ok ? '' : 'Добавьте "game" или "игра".' };
    }
  },

  {
    id: 'no-4-digits',
    title: 'Не более 5 цифр подряд',
    description: 'Запрещено иметь более трёх цифр подряд.',
    validate(pw) {
      const ok = !/\d{6,}/.test(pw);
      return { pass: ok, message: ok ? '' : 'Обнаружено 4+ цифры подряд.' };
    }
  },

  {
    id: 'mixed-alphabets',
    title: 'Разные алфавиты',
    description: 'Пароль должен содержать хотя бы одну букву кириллицей и одну латиницей.',
    validate(pw) {
      const hasCyr = /[А-Яа-яЁё]/.test(pw);
      const hasLat = /[A-Za-z]/.test(pw);
      const ok = hasCyr && hasLat;
      return { pass: ok, message: ok ? '' : 'Добавьте буквы и кириллицей, и латиницей.' };
    }
  },

  // Сумма цифр = целевое число
  {
    id: 'digits-sum',
    title: 'Сумма цифр',
    description: 'Сумма всех цифр в пароле должна равняться числу написанному ниже.',
    dynamic: true,
    onUnlock(ctx) {
      const target = 14 + Math.floor(Math.random() * 23); // 14..36
      setParam('digits-sum', 'target', target);
    },
    validate(pw, ctx) {
      const target = getParam('digits-sum', 'target') ?? 25;
      const sum = ctx.metrics.digitsSum;
      const ok = sum === target;
      return {
        pass: ok,
        message: ok ? '' : `Сумма цифр = ${sum}, требуется ${target}.`
      };
    }
  },

  // Название месяца
  {
    id: 'month',
    title: 'Назови месяц',
    description: 'Добавьте любое русское название месяца (например, март или октябрь).',
    validate(pw) {
      const m = includesMonthRU(pw);
      return { pass: !!m, message: m ? '' : 'Месяц не найден.' };
    }
  },

  // Римская цифра присутствует
  {
    id: 'roman-present',
    title: 'Римская цифра',
    description: 'Добавьте римскую цифру (IVXLCDM) длиной ≥ 2.',
    validate(pw) {
      const found = findRomanSubstringEven(pw, 2);
      return { pass: !!found, message: found ? '' : 'Добавьте римскую цифру, например VI, XIV.' };
    }
  },

  // Римская цифра должна быть чётной
  {
    id: 'roman-even',
    title: 'Чётное значение римской цифры',
    description: 'Римская цифра должна давать чётное значение.',
    validate(pw) {
      const found = findRomanSubstringEven(pw, 2);
      const ok = found && found.val % 2 === 0;
      return { pass: ok, message: ok ? '' : 'Значение должно быть чётным.' };
    }
  },

  // Без тройных повторов
  {
    id: 'no-triple',
    title: 'Без тройных подряд',
    description: 'Ни один символ не должен встречаться 3+ раз подряд.',
    validate(pw, ctx) {
      const ok = !ctx.metrics.tripleRepeat;
      return { pass: ok, message: ok ? '' : 'Обнаружен тройной повтор.' };
    }
  },

  // Текущий год
  {
    id: 'current-year',
    title: 'Текущий год',
    description: 'Добавьте текущий год.',
    validate(pw, ctx) {
      const year = String(ctx.now.getFullYear());
      const ok = pw.includes(year);
      return { pass: ok, message: ok ? '' : `Добавьте ${year}.` };
    }
  },

  // Гласные присутствуют
  {
    id: 'vowels-present',
    title: 'Гласные',
    description: 'Пароль должен содержать хотя бы одну гласную.',
    validate(pw, ctx) {
      const ok = ctx.metrics.vowelsCount > 0;
      return { pass: ok, message: ok ? '' : 'Добавьте хотя бы одну гласную.' };
    }
  },

  // Вставьте число гласных
  {
    id: 'vowels-self',
    title: 'Сколько гласных — такая и цифра',
    description: 'Если в пароле N гласных, где-то должна присутствовать цифра N.',
    validate(pw, ctx) {
      const v = ctx.metrics.vowelsCount;
      const ok = pw.includes(String(v));
      return { pass: ok, message: ok ? '' : `Сейчас гласных: ${v}. Вставьте «${v}».` };
    }
  },

  // Количество цифр — простое
  {
    id: 'prime-digit-count',
    title: 'Простое число цифр',
    description: 'Количество цифр в пароле должно быть простым числом.',
    validate(pw, ctx) {
      const c = ctx.metrics.digitsCount;
      const ok = isPrime(c);
      return { pass: ok, message: ok ? '' : `Сейчас цифр: ${c}. Сделайте их простым количеством.` };
    }
  },

  // Запрещённое слово
  {
    id: 'no-password',
    title: 'Запрещённое слово',
    description: 'Запрещено использовать слово «password» (в любом регистре).',
    validate(pw) {
      const ok = !/password/i.test(pw);
      return { pass: ok, message: ok ? '' : 'Уберите «password».' };
    }
  },
];

function getRules() { return RULES; }
function getParams() { return params; }

export { getRules, getParams, createCtx, setParam, getParam };
