import type {
	ICalendarEventWithLocation,
	ICalendarNotifier,
} from "../../../repository/calendar";

export class DiscordCalendarNotifier implements ICalendarNotifier {
	private webhookUrl: string;

	constructor(webhookUrl: string) {
		this.webhookUrl = webhookUrl;
	}

	private formatDate(d: Date): string {
		const days = ["日", "月", "火", "水", "木", "金", "土"];
		const mm = (d.getMonth() + 1).toString().padStart(2, "0");
		const dd = d.getDate().toString().padStart(2, "0");
		const hh = d.getHours().toString().padStart(2, "0");
		const day = days[d.getDay()];
		return `${mm}/${dd} (${day})`;
	}

	private formatTime(d: Date): string {
		const hh = d.getHours().toString().padStart(2, "0");
		const mm = d.getMinutes().toString().padStart(2, "0");
		return `${hh}:${mm}`;
	}

	async notifyEvent(event: ICalendarEventWithLocation): Promise<void> {
		const payload = {
			content: "**新しい予定が追加されました！**",
			embeds: [
				{
					title: `${event.title}`,
					description: `${
						event.description
					}\n\n🔗 [詳細はこちら](https://id.maximum.vc/calendar/)`,
					color: 0x2ecc71,
					fields: [
						{
							name: "日時",
							value: `${
								this.formatDate(event.startAt) === this.formatDate(event.endAt)
									? `${this.formatDate(event.startAt)} ${this.formatTime(event.startAt)} - ${this.formatTime(
											event.endAt,
										)}`
									: `${this.formatDate(event.startAt)} ${this.formatTime(
											event.startAt,
										)} - ${this.formatDate(event.endAt)} ${this.formatTime(
											event.endAt,
										)}`
							}`,
						},
						{
							name: "活動場所",
							value: "図書館セミナー室",
						},
					],
				},
			],
		};

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
}
