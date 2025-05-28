// Server から Client にリダイレクト後に表示される Toast 内容の定義

// client/app/components/ui/toast/toast-item.tsx にあわせる
interface ToastItem {
	type: "error" | "success";
	title: string;
	description?: string;
	to?: string;
}

export const ToastHashFn = (item: ToastItem): string => {
	const key = `${item.type}--${item.title}--${item.description || ""}--${item.to || ""}`;
	let hash = 0;
	for (let i = 0; i < key.length; i++) {
		hash = (hash << 5) - hash + key.charCodeAt(i);
		hash |= 0; // Convert to 32bit integer
	}
	return hash.toString(36);
};

export const TOAST_SEARCHPARAM = "toast";

export const PLEASE_LOGIN_FOR_OAUTH: ToastItem = {
	type: "error",
	title: "ログインしてください",
	description: "OAuth アプリケーションを利用するためにはログインが必要です",
} as const;

export const ONLY_GITHUB_LOGIN_IS_AVAILABLE_FOR_INVITATION: ToastItem = {
	type: "error",
	title: "このログインは利用できません",
	description:
		"招待コードを使用するには GitHub アカウントでログインしてください。",
} as const;

export const PLEASE_CONNECT_OAUTH_ACCOUNT: ToastItem = {
	type: "error",
	title: "OAuth アカウントを接続してください",
	description:
		"この機能を利用するには、まず設定画面からアカウントを紐づける必要があります。",
} as const;

const TOAST_ITEMS = [
	PLEASE_LOGIN_FOR_OAUTH,
	ONLY_GITHUB_LOGIN_IS_AVAILABLE_FOR_INVITATION,
	PLEASE_CONNECT_OAUTH_ACCOUNT,
];

// ハッシュ衝突チェック
const TOAST_HASHES = TOAST_ITEMS.map((item) => ToastHashFn(item));
if (new Set(TOAST_HASHES).size !== TOAST_HASHES.length) {
	throw new Error(
		"ToastItem のハッシュが重複しています。定義を見直してください。",
	);
}

export const TOAST_MESSAGES = Object.fromEntries(
	TOAST_ITEMS.map((item) => [ToastHashFn(item), item]),
) as Record<string, ToastItem>;
