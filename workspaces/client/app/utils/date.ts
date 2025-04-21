const MILLIS = 1; // 1
const SECONDS = MILLIS * 1000; // 1 * 1000
const MINUTES = SECONDS * 60; // 1 * 1000 * 60

// dateから年度を取得する
export const getFiscalYear = (date: Date) => {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	if (month >= 4) {
		return year;
	}
	return year - 1;
};

// 今年度の最初の日付を取得する
export const getFiscalYearStartDate = () => {
	const date = new Date();
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	if (month >= 4) {
		return new Date(year, 3, 1);
	}
	return new Date(year - 1, 3, 1);
};

// DateをHTML5のDatePickerの形式に変換する
export const toHTMLDatePickerFormat = (date: Date) => {
	const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * MINUTES);
	return utcDate.toISOString().slice(0, 10);
};

// DateをHTML5のTimePickerの形式に変換する
export const toHTMLDateTimePickerFormat = (date: Date) => {
	const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * MINUTES);
	return utcDate.toISOString().slice(0, 16);
};

// 期間を表示する形式に変換する
// タイムゾーンは指定せず、クライアントのローカルタイムゾーンで表示させる
// 例: 2023年4月1日(土) 12:00 - 13:00 (同じ日付)
// 例: 2023年4月1日(土) 12:00 - 2023年4月2日(土) 13:00 (日付が異なる)
export const formatDuration = (startAt: Date, endAt: Date) => {
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
