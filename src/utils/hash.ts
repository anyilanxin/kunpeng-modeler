import SparkMD5 from 'spark-md5';

/**
 * 计算字符串内容的 MD5 哈希值。
 * 用于判断内存中的 XML 与磁盘文件内容是否一致（"是否已保存"）。
 */
export function md5Of(content: string): string {
  return SparkMD5.hash(content);
}
