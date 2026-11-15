export const STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
export const BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

export function mod(value, base) {
  return ((value % base) + base) % base;
}

export function pillarFromIndex(index) {
  const stem = STEMS[mod(index, 10)];
  const branch = BRANCHES[mod(index, 12)];
  return { stem, branch, text: stem + branch };
}

export function isYangStem(stem) {
  return STEMS.indexOf(stem) % 2 === 0;
}
