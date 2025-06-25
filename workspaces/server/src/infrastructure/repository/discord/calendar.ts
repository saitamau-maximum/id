import type {
	ICalendarEventNotify,
	ICalendarNotifier,
} from "../../../repository/calendar";

export class DiscordCalendarNotifier implements ICalendarNotifier {
	private webhookUrl: string;
	private readonly CALENDAR_URL = "https://id.maximum.vc/calendar/";

	constructor(webhookUrl: string) {
		this.webhookUrl = webhookUrl;
	}

	// 期間を表示する形式に変換する
	// タイムゾーンについては Asia/Tokyo を明示的に指定
	private formatDateTime(startAt: Date, endAt: Date): string {
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

		const startAtDate = startAt.toLocaleDateString("ja-JP", {
			month: "2-digit",
			day: "2-digit",
			weekday: "short",
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "Asia/Tokyo",
		});

		const endAtDate = endAt.toLocaleDateString("ja-JP", {
			month: "2-digit",
			day: "2-digit",
			weekday: "short",
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "Asia/Tokyo",
		});

		return `${startAtDate} - ${endAtDate}`;
	}

	private embedBuilder(embedInfo: ICalendarEventNotify & { color: number }) {
		return {
			title: embedInfo.title,
			description: embedInfo.description ?? "",
			color: embedInfo.color,
			fields: [
				{
					name: "日時",
					value: this.formatDateTime(embedInfo.startAt, embedInfo.endAt),
				},
				{
					name: "場所",
					value: `${embedInfo.location?.name || "未定"}\n\n[カレンダーを見る](${this.CALENDAR_URL})`,
				},
			],
		};
	}

	private async sendNotification(payload: {
		content: string;
		embeds: {
			title: string;
			description: string;
			color: number;
			fields: { name: string; value: string }[];
		}[];
	}): Promise<void> {
		try {
			await fetch(this.webhookUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});
		} catch (error) {
			throw new Error("Failed to send notification");
		}
	}

	async notifyAddEvent(event: ICalendarEventNotify): Promise<void> {
		const payload = {
			content: "**予定が追加されました！**",
			embeds: [
				this.embedBuilder({
					...event,
					color: 0x2ecc71,
				}),
			],
		};
		try {
			await this.sendNotification(payload);
		} catch (error) {
			throw new Error("Failed to send notification");
		}
	}

	async notifyUpdateEvent(event: ICalendarEventNotify): Promise<void> {
		const payload = {
			content: "**予定が更新されました！**",
			embeds: [
				this.embedBuilder({
					...event,
					color: 0x3498db,
				}),
			],
		};
		try {
			await this.sendNotification(payload);
		} catch (error) {
			throw new Error("Failed to send notification");
		}
	}
}
