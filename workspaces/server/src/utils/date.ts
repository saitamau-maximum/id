/**
 * 開始日時と終了日時を期間表示形式に変換する関数。
 * タイムゾーンは Asia/Tokyo
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
			timeZone: "Asia/Tokyo",
		});
		const startTimestamp = startAt.toLocaleTimeString("ja-JP", {
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "Asia/Tokyo",
		});
		const endTimestamp = endAt.toLocaleTimeString("ja-JP", {
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "Asia/Tokyo",
		});

		return `${date} ${startTimestamp} - ${endTimestamp}`;
	}

	const startDateTime = startAt.toLocaleDateString("ja-JP", {
		month: "2-digit",
		day: "2-digit",
		weekday: "short",
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "Asia/Tokyo",
	});

	const endDateTime = endAt.toLocaleDateString("ja-JP", {
		month: "2-digit",
		day: "2-digit",
		weekday: "short",
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "Asia/Tokyo",
	});

	return `${startDateTime} - ${endDateTime}`;
};
