// T or Promise<T>
export type Awaitable<T> = Promise<T> | T;

// object の null を undefined に変換する
export type NullToUndefined<T> = {
  [K in keyof T]: null extends T[K] ? Exclude<T[K], null> | undefined : T[K];
}
export const NullToUndefined = <T>(obj: T): NullToUndefined<T> => {
  const result: Partial<NullToUndefined<T>> = {};
  for (const key in obj) {
    if (obj[key] === null) {
      result[key] = undefined;
    } else {
      result[key] = obj[key] as NullToUndefined<T>[typeof key];
    }
  }
  return result as NullToUndefined<T>;
}