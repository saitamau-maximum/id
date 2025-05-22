// 最終ログイン日時を更新する頻度 (ms)
export const AUTH_PING_INTERVAL = 30_000;

// 現在ログイン中か判定する関数
// PING_INTERVAL (30s) 以内ならログイン中とみなす
export const isNowLoggedIn = (lastLoginAt?: Date) => {
	if (!lastLoginAt) return false;
	const lastLoginTime = new Date(lastLoginAt).getTime();
	return Date.now() - lastLoginTime < AUTH_PING_INTERVAL;
};
