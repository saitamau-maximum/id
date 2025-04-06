import { CreateEventDialog } from "./internal/components/callable-create-event-dialog";
import { CreateLocationDialog } from "./internal/components/callable-create-location-dialog";
import { EditEventDialog } from "./internal/components/callable-edit-event-dialog";
import { EditLocationDialog } from "./internal/components/callable-edit-location-dialog";
import { EventsEditor } from "./internal/components/events-editor";
import { LocationEditor } from "./internal/components/location-editor";

export default function AdminEvents() {
	return (
		<div>
			<EventsEditor />
			<LocationEditor />
			<CreateEventDialog.Root />
			<EditEventDialog.Root />
			<CreateLocationDialog.Root />
			<EditLocationDialog.Root />
		</div>
	);
}
