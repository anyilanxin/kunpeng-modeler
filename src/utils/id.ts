/**
 * 生成唯一 ID（用于 BPMN/DMN 元素）
 */
let idCounter = 0;

export function nextId(prefix: string): string {
  idCounter += 1;
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `${prefix}${time}${rand}${idCounter}`;
}
