/**
 * Levenshtein 距离 - 计算两个字符串之间的编辑距离。
 * 用于英语发音的模糊匹配。
 */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  // 使用一维数组优化空间
  const prev = new Array<number>(n + 1);
  const curr = new Array<number>(n + 1);

  for (let j = 0; j <= n; j++) {
    prev[j] = j;
  }

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
    const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,       // 删除
        curr[j - 1] + 1,   // 插入
        prev[j - 1] + cost // 替换
      );
    }
    // 交换
    for (let j = 0; j <= n; j++) {
      prev[j] = curr[j];
    }
  }

  return prev[n];
}

/**
 * 计算相似度比例 (0~1)
 * 1 = 完全相同，0 = 完全不同
 */
export function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const dist = levenshtein(a.toLowerCase(), b.toLowerCase());
  return 1 - dist / maxLen;
}

/**
 * 判断两个字符串是否相似到可接受（默认阈值 0.6）
 */
export function isSimilar(a: string, b: string, threshold = 0.6): boolean {
  return similarity(a, b) >= threshold;
}
