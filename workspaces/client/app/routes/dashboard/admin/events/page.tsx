import { CreateEventDialog } from "./internal/components/callable-create-event-dialog";
import { EditEventDialog } from "./internal/components/callable-edit-event-dialog";
import { EventsEditor } from "./internal/components/events-editor";

export default function AdminCertifications() {
	return (
		<div>
			<EventsEditor />
			<CreateEventDialog.Root />
			<EditEventDialog.Root />
		</div>
	);
}
