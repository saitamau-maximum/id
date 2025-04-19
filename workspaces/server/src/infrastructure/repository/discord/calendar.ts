import type {
	ICalendarEventWithLocation,
	ICalendarNotifier,
} from "../../../repository/calendar";

export class DiscordCalendarNotifier implements ICalendarNotifier {
	private webhookUrl: string;

	constructor(webhookUrl: string) {
		this.webhookUrl = webhookUrl;
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
							value: `${event.startAt.toLocaleDateString("ja-JP", {
								year: "numeric",
								month: "2-digit",
								day: "2-digit",
							})} ${event.startAt.toLocaleTimeString("ja-JP", {
								hour: "2-digit",
								minute: "2-digit",
							})} - ${event.endAt.toLocaleTimeString("ja-JP", {
								hour: "2-digit",
								minute: "2-digit",
							})}`,
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
