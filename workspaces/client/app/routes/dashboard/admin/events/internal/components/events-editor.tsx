import { useCallback } from "react";
import { Edit, Plus, Trash } from "react-feather";
import { css } from "styled-system/css";
import { DeleteConfirmation } from "~/components/feature/delete-confirmation";
import { ConfirmDialog } from "~/components/logic/callable/comfirm";
import { ButtonLike } from "~/components/ui/button-like";
import { IconButton } from "~/components/ui/icon-button";
import { Table } from "~/components/ui/table";
import { useCalendar } from "~/routes/dashboard/calendar/hooks/use-calendar";
import type { CalendarEvent } from "~/types/event";
import { useCreateEvent } from "../hooks/use-create-event";
import { useDeleteEvent } from "../hooks/use-delete-event";
import { useUpdateEvent } from "../hooks/use-update-event";
import { CreateEventDialog } from "./callable-create-event-dialog";
import { EditEventDialog } from "./callable-edit-event-dialog";

const formatTerm = (startAt: Date, endAt: Date) => {
	if (startAt.getDate() === endAt.getDate()) {
		const startTimestamp = startAt.toLocaleTimeString("ja-JP", {
			hour: "2-digit",
			minute: "2-digit",
		});
		const endTimestamp = endAt.toLocaleTimeString("ja-JP", {
			hour: "2-digit",
			minute: "2-digit",
		});
		const date = startAt.toLocaleDateString("ja-JP", {
			month: "2-digit",
			day: "2-digit",
			weekday: "short",
		});
		return `${date} ${startTimestamp} - ${endTimestamp}`;
	}
	return `${startAt.toLocaleDateString("ja-JP", {
		month: "2-digit",
		day: "2-digit",
		weekday: "short",
		hour: "2-digit",
		minute: "2-digit",
	})} - ${endAt.toLocaleDateString("ja-JP", {
		month: "2-digit",
		day: "2-digit",
		weekday: "short",
		hour: "2-digit",
		minute: "2-digit",
	})}`;
};

export const EventsEditor = () => {
	const { data: events } = useCalendar();
	const sortedEvents = [...events].sort(
		(a, b) => b.startAt.getTime() - a.startAt.getTime(),
	);
	const { mutate: createEvent } = useCreateEvent();

	const handleCreateEvent = useCallback(async () => {
		const res = await CreateEventDialog.call();
		if (res.type === "dismiss") return;
		createEvent(res.payload);
	}, [createEvent]);

	return (
		<div>
			<div
				className={css({ display: "flex", justifyContent: "space-between" })}
			>
				<h2
					className={css({
						fontSize: "xl",
						fontWeight: "bold",
						color: "gray.600",
						marginTop: 6,
						marginBottom: 4,
					})}
				>
					イベント一覧
				</h2>
				<button type="button" onClick={handleCreateEvent}>
					<ButtonLike variant="primary" size="sm">
						<Plus size={16} />
						新規作成
					</ButtonLike>
				</button>
			</div>
			<Table.Root>
				<thead>
					<Table.Tr>
						<Table.Th>タイトル</Table.Th>
						<Table.Th>説明</Table.Th>
						<Table.Th>期間</Table.Th>
						<Table.Th>操作</Table.Th>
					</Table.Tr>
				</thead>
				<tbody>
					{sortedEvents.map((event) => (
						<EventTableRow event={event} key={event.id} />
					))}
				</tbody>
			</Table.Root>
		</div>
	);
};

const EventTableRow = ({ event }: { event: CalendarEvent }) => {
	const { mutate: deleteEvent } = useDeleteEvent();
	const { mutate: updateEvent } = useUpdateEvent();

	const handleDeleteEvent = useCallback(async () => {
		const res = await ConfirmDialog.call({
			title: "イベントの削除",
			children: <DeleteConfirmation title={event.title} />,
			danger: true,
		});
		if (res.type === "dismiss") return;
		deleteEvent(event);
	}, [event, deleteEvent]);

	const handleEditEvent = useCallback(async () => {
		const res = await EditEventDialog.call({ event });
		if (res.type === "dismiss") return;
		updateEvent(res.payload);
	}, [event, updateEvent]);

	return (
		<Table.Tr>
			<Table.Td>{event.title}</Table.Td>
			<Table.Td>{event.description}</Table.Td>
			<Table.Td>{formatTerm(event.startAt, event.endAt)}</Table.Td>
			<Table.Td>
				<div className={css({ display: "flex", gap: 2 })}>
					<IconButton label="編集" onClick={handleEditEvent}>
						<Edit size={16} />
					</IconButton>
					/
					<IconButton label="削除" color="danger" onClick={handleDeleteEvent}>
						<Trash size={16} />
					</IconButton>
				</div>
			</Table.Td>
		</Table.Tr>
	);
};
