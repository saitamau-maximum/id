import { useCallback, useState } from "react";
import {
	ChevronLeft,
	ChevronRight,
	Edit,
	Plus,
	PlusSquare,
	Trash,
} from "react-feather";
import { css } from "styled-system/css";
import { DeleteConfirmation } from "~/components/feature/delete-confirmation";
import { ConfirmDialog } from "~/components/logic/callable/confirm";
import { ButtonLike } from "~/components/ui/button-like";
import { IconButton } from "~/components/ui/icon-button";
import { Pagination } from "~/components/ui/pagination";
import { Table } from "~/components/ui/table";
import { usePaginatedCalendar } from "~/routes/dashboard/calendar/hooks/use-paginated-calendar";
import { useLocations } from "~/routes/dashboard/calendar/hooks/use-locations";
import type { CalendarEvent } from "~/types/event";
import { formatDuration, getFiscalYear } from "~/utils/date";
import { useCreateEvent } from "../hooks/use-create-event";
import { useDeleteEvent } from "../hooks/use-delete-event";
import { useUpdateEvent } from "../hooks/use-update-event";
import { CreateEventDialog } from "./callable-create-event-dialog";
import { EditEventDialog } from "./callable-edit-event-dialog";

export const EventsEditor = () => {
	// 選択中の年度
	const [selectedFisicalYear, setSelectedFisicalYear] = useState(
		getFiscalYear(new Date()),
	);
	
	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const { data, isLoading, error } = usePaginatedCalendar({
		page: currentPage,
		limit: pageSize,
		fiscalYear: selectedFisicalYear,
	});

	const { mutate: createEvent } = useCreateEvent();

	const handleCreateEvent = useCallback(async () => {
		const res = await CreateEventDialog.call();
		if (res.type === "dismiss") return;
		createEvent(res.payload);
	}, [createEvent]);

	const handleFiscalYearChange = useCallback((newYear: number) => {
		setSelectedFisicalYear(newYear);
		setCurrentPage(1); // Reset to first page when changing fiscal year
	}, []);

	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page);
	}, []);

	const handlePageSizeChange = useCallback((size: number) => {
		setPageSize(size);
		setCurrentPage(1); // Reset to first page when changing page size
	}, []);

	if (error) {
		return (
			<div className={css({ textAlign: "center", marginTop: 8, color: "rose.600" })}>
				イベントの読み込みに失敗しました
			</div>
		);
	}

	return (
		<div>
			<div
				className={css({
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginTop: 6,
					marginBottom: 4,
				})}
			>
				<div
					className={css({
						display: "flex",
						gap: 2,
						alignItems: "center",
					})}
				>
					<h2
						className={css({
							fontSize: "xl",
							fontWeight: "bold",
							color: "gray.600",
						})}
					>
						イベント一覧
					</h2>
					<div
						className={css({ display: "flex", gap: 1, alignItems: "center" })}
					>
						<IconButton
							type="button"
							label="前の年度"
							disabled={isLoading}
							onClick={() => handleFiscalYearChange(selectedFisicalYear - 1)}
						>
							<ChevronLeft size={16} />
						</IconButton>
						<span>{selectedFisicalYear}年度</span>
						<IconButton
							type="button"
							label="次の年度"
							disabled={isLoading}
							onClick={() => handleFiscalYearChange(selectedFisicalYear + 1)}
						>
							<ChevronRight size={16} />
						</IconButton>
					</div>
				</div>
				<button type="button" onClick={handleCreateEvent} disabled={isLoading}>
					<ButtonLike variant="primary" size="sm">
						<Plus size={16} />
						新規作成
					</ButtonLike>
				</button>
			</div>

			{isLoading && data.events.length === 0 ? (
				<div
					className={css({
						textAlign: "center",
						marginTop: 8,
						color: "gray.500",
					})}
				>
					読み込み中...
				</div>
			) : data.events.length === 0 ? (
				<p
					className={css({
						color: "gray.500",
						textAlign: "center",
						marginTop: 8,
					})}
				>
					この年度にイベントはありません
				</p>
			) : (
				<>
					<Table.Root>
						<thead>
							<Table.Tr>
								<Table.Th>タイトル</Table.Th>
								<Table.Th>説明</Table.Th>
								<Table.Th>期間</Table.Th>
								<Table.Th>活動場所</Table.Th>
								<Table.Th>操作</Table.Th>
							</Table.Tr>
						</thead>
						<tbody>
							{data.events.map((event) => (
								<EventTableRow event={event} key={event.id} />
							))}
						</tbody>
					</Table.Root>

					<Pagination
						currentPage={data.page}
						totalPages={data.totalPages}
						onPageChange={handlePageChange}
						pageSize={data.limit}
						onPageSizeChange={handlePageSizeChange}
						totalItems={data.total}
						isLoading={isLoading}
					/>
				</>
			)}
		</div>
	);
};

const EventTableRow = ({ event }: { event: CalendarEvent }) => {
	const { mutate: createEvent } = useCreateEvent();
	const { mutate: deleteEvent } = useDeleteEvent();
	const { mutate: updateEvent } = useUpdateEvent();
	const { locationMap } = useLocations();

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

	const handleDuplicateEvent = useCallback(async () => {
		const res = await EditEventDialog.call({ event });
		if (res.type === "dismiss") return;
		createEvent(res.payload);
	}, [event, createEvent]);

	const location = event.locationId ? locationMap.get(event.locationId) : null;

	return (
		<Table.Tr>
			<Table.Td>{event.title}</Table.Td>
			<Table.Td>
				<div
					className={css({
						color: "gray.500",
						fontSize: "sm",
						display: "-webkit-box",
						WebkitLineClamp: 2,
						boxOrient: "vertical",
						overflow: "hidden",
					})}
				>
					{event.description}
				</div>
			</Table.Td>
			<Table.Td>
				<span
					className={css({
						color: "gray.500",
						fontSize: "sm",
						display: "flex",
						justifyContent: "space-between",
					})}
				>
					{formatDuration(event.startAt, event.endAt)}
				</span>
			</Table.Td>
			<Table.Td>
				{location && (
					<p
						className={css({
							color: "gray.500",
							fontSize: "sm",
						})}
					>
						{location.name}
					</p>
				)}
			</Table.Td>
			<Table.Td>
				<div className={css({ display: "flex", gap: 2, width: "fit-content" })}>
					<IconButton label="複製" onClick={handleDuplicateEvent}>
						<PlusSquare size={16} />
					</IconButton>
					/
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
