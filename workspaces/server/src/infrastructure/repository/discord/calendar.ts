import type {
	ICalendarEventNotify,
	ICalendarNotifier,
} from "../../../repository/calendar";
import { formatDuration } from "../../../utils/date";

export class DiscordCalendarNotifier implements ICalendarNotifier {
	private webhookUrl: string;
	private readonly CALENDAR_URL = "https://id.maximum.vc/calendar/";

	constructor(webhookUrl: string) {
		this.webhookUrl = webhookUrl;
	}

	private embedBuilder(embedInfo: ICalendarEventNotify & { color: number }) {
		return {
			title: embedInfo.title,
			description: embedInfo.description,
			color: embedInfo.color,
			fields: [
				{
					name: "日時",
					value: formatDuration(embedInfo.startAt, embedInfo.endAt),
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
			description?: string;
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
