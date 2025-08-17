// 型 T に定義されている key のうち、 T[key] が型 U となるものを取得する
export type KeyOfType<T, U> = {
	[K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
