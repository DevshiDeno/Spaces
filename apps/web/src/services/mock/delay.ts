export function delay<T>(value: T, ms: number = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
