/**
 * ミリ秒を表す定数。
 */
const MILLIS = 1;

/**
 * 秒を表す定数。ミリ秒を基準に計算。
 */
const SECONDS = MILLIS * 1000;

/**
 * 分を表す定数。秒を基準に計算。
 */
const MINUTES = SECONDS * 60;

/**
 * 指定された日付から年度を取得する関数。
 *
 * @param date - 対象の日付オブジェクト。
 * @returns 年度を表す数値。
 */
export const getFiscalYear = (date: Date): number => {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	if (month >= 4) {
		return year;
	}
	return year - 1;
};

/**
 * 今年度の最初の日付を取得する関数。
 *
 * @returns 今年度の最初の日付を表すDateオブジェクト。
 */
export const getFiscalYearStartDate = (): Date => {
	const date = new Date();
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	if (month >= 4) {
		return new Date(year, 3, 1);
	}
	return new Date(year - 1, 3, 1);
};

/**
 * DateオブジェクトをHTML5のDatePicker形式（YYYY-MM-DD）に変換する関数。
 *
 * @param date - 対象の日付オブジェクト。
 * @returns HTML5のDatePicker形式の文字列。
 */
export const toHTMLDatePickerFormat = (date: Date): string => {
	const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * MINUTES);
	return utcDate.toISOString().slice(0, 10);
};

/**
 * DateオブジェクトをHTML5のDateTimePicker形式（YYYY-MM-DDTHH:mm）に変換する関数。
 *
 * @param date - 対象の日付オブジェクト。
 * @returns HTML5のDateTimePicker形式の文字列。
 */
export const toHTMLDateTimePickerFormat = (date: Date): string => {
	const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * MINUTES);
	return utcDate.toISOString().slice(0, 16);
};

/**
 * 開始日時と終了日時を期間表示形式に変換する関数。
 * タイムゾーンは指定せず、クライアントのローカルタイムゾーンで表示。
 *
 * - 同じ日付の場合: `YYYY年MM月DD日(曜日) HH:mm - HH:mm`
 * - 異なる日付の場合: `YYYY年MM月DD日(曜日) HH:mm - YYYY年MM月DD日(曜日) HH:mm`
 *
 * @param startAt - 開始日時を表すDateオブジェクト。
 * @param endAt - 終了日時を表すDateオブジェクト。
 * @returns 期間を表す文字列。
 */
export const formatDuration = (startAt: Date, endAt: Date): string => {
	if (
		startAt.getFullYear() === endAt.getFullYear() &&
		startAt.getMonth() === endAt.getMonth() &&
		startAt.getDate() === endAt.getDate()
	) {
		const date = startAt.toLocaleDateString("ja-JP", {
			month: "2-digit",
			day: "2-digit",
			weekday: "short",
		});
		const startTimestamp = startAt.toLocaleTimeString("ja-JP", {
			hour: "2-digit",
			minute: "2-digit",
		});
		const endTimestamp = endAt.toLocaleTimeString("ja-JP", {
			hour: "2-digit",
			minute: "2-digit",
		});

		return `${date} ${startTimestamp} - ${endTimestamp}`;
	}

	const startDateTime = startAt.toLocaleDateString("ja-JP", {
		month: "2-digit",
		day: "2-digit",
		weekday: "short",
		hour: "2-digit",
		minute: "2-digit",
	});

	const endDateTime = endAt.toLocaleDateString("ja-JP", {
		month: "2-digit",
		day: "2-digit",
		weekday: "short",
		hour: "2-digit",
		minute: "2-digit",
	});

	return `${startDateTime} - ${endDateTime}`;
};

/**
 * 指定されたDateオブジェクトを日本語ローカル形式（YYYY/MM/DD HH:mm）でフォーマットして返す関数。
 *
 * @param date - フォーマット対象のDateオブジェクト。nullの場合は空文字列を返す。
 * @returns フォーマット済みの日付文字列。dateがnullの場合は空文字列。
 */
export const formatDateTime = (date: Date | null) => {
	if (!date) return "";
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	};
	return date.toLocaleDateString("ja-JP", options);
};
