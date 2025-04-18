import { env } from "cloudflare:workers";
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
			content: "New calendar event created",
			embeds: [
				{
					title: event.title,
					description: event.description,
					fields: [
						{
							name: "Start At",
							value: event.startAt.toISOString(),
						},
						{
							name: "End At",
							value: event.endAt.toISOString(),
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
			console.error("Error sending notification:", error);
			throw new Error("Failed to send notification");
		}
	}
}
