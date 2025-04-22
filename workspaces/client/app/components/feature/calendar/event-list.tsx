import { useCallback } from "react";
import { Search } from "react-feather";
import { css } from "styled-system/css";
import { InformationDialog } from "~/components/logic/callable/information";
import { ButtonLike } from "~/components/ui/button-like";
import { Document } from "~/components/ui/document";
import { useMarkdown } from "~/hooks/use-markdown";
import { useLocations } from "~/routes/dashboard/calendar/hooks/use-locations";
import type { CalendarEvent } from "~/types/event";
import { formatDuration } from "~/utils/date";
import { LocationDisplay } from "./location-display";

interface Props {
	events: CalendarEvent[];
}

// あくまでも表示用のコンポーネントなので、ソートやフィルタなどの処理は行わない
export const EventList = ({ events }: Props) => {
	return (
		<div>
			{events.map((event) => (
				<EventRow key={event.id} event={event} />
			))}
		</div>
	);
};

const EventRow = ({ event }: { event: CalendarEvent }) => {
	const { locationMap } = useLocations();
	const isActiveEvent = useCallback((event: CalendarEvent) => {
		const now = new Date();
		return event.startAt <= now && now <= event.endAt;
	}, []);

	const handleLocationClick = useCallback(async (locationId: string) => {
		await InformationDialog.call({
			title: "活動場所紹介",
			children: <LocationDisplay locationId={locationId} />,
		});
	}, []);

	const { reactContent } = useMarkdown(event.description);

	return (
		<div
			key={event.id}
			className={css({
				position: "relative",
				paddingLeft: {
					base: 6,
					md: 8,
				},
				paddingBottom: 4,
				_before: {
					content: '""',
					position: "absolute",
					left: {
						base: 3,
						md: 4,
					},
					top: {
						base: 3,
						md: 4,
					},
					transform: "translateX(-50%)",
					width: "2px",
					height: "100%",
					backgroundColor: "gray.300",
				},
				_last: {
					_before: {
						display: "none",
					},
				},
				_after: {
					content: '""',
					position: "absolute",
					left: {
						base: 3,
						md: 4,
					},
					top: {
						base: 3,
						md: 4,
					},
					transform: "translate(-50%, -50%)",
					width: isActiveEvent(event) ? "12px" : "8px",
					height: isActiveEvent(event) ? "12px" : "8px",
					borderRadius: "50%",
					backgroundColor: isActiveEvent(event) ? "green.600" : "gray.400",
					animation: isActiveEvent(event) ? "pulseShadow 5s infinite" : "none",
				},
			})}
		>
			<span
				className={css({
					color: "gray.600",
					fontSize: {
						base: "lg",
						md: "xl",
					},
					fontWeight: 500,
				})}
			>
				{event.title}
			</span>
			<div
				className={css({
					display: "flex",
					gap: 2,
					marginTop: 2,
					flexDirection: "column",
					backgroundColor: "gray.50",
					border: "1px solid",
					borderColor: "gray.200",
					padding: 2,
					borderRadius: "md",
				})}
			>
				<table
					className={css({
						width: "100%",
						borderCollapse: "collapse",
						fontSize: "md",
						color: "gray.700",
					})}
				>
					<tbody>
						<tr>
							<th
								className={css({
									textAlign: "left",
									paddingRight: 4,
									color: "gray.500",
									fontWeight: 500,
									whiteSpace: "nowrap",
									fontSize: "sm",
								})}
							>
								日時:
							</th>
							<td
								className={css({
									width: "100%",
								})}
							>
								{formatDuration(event.startAt, event.endAt)}
							</td>
						</tr>
						{event.locationId && (
							<tr>
								<th
									className={css({
										textAlign: "left",
										paddingRight: 4,
										color: "gray.500",
										fontWeight: 500,
										whiteSpace: "nowrap",
										fontSize: "sm",
									})}
								>
									活動場所:
								</th>
								<td
									className={css({
										width: "100%",
									})}
								>
									<div
										className={css({
											display: "flex",
											gap: 2,
											alignItems: "center",
										})}
									>
										{locationMap.get(event.locationId)?.name}
										<button
											type="button"
											onClick={() =>
												event.locationId &&
												handleLocationClick(event.locationId)
											}
										>
											<ButtonLike variant="text" size="sm">
												<Search size={16} />
												活動場所を見る
											</ButtonLike>
										</button>
									</div>
								</td>
							</tr>
						)}
					</tbody>
				</table>
				<div
					className={css({
						color: "gray.600",
						fontSize: "sm",
					})}
				>
					<Document inlineOnly>{reactContent}</Document>
				</div>
			</div>
		</div>
	);
};
