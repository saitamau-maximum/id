import { LEADER_ROLE_IDS } from "node_modules/@idp/server/dist/constants/role";
import { useAuth } from "~/hooks/use-auth";
import { CreateEventDialog } from "./internal/components/callable-create-event-dialog";
import { CreateLocationDialog } from "./internal/components/callable-create-location-dialog";
import { EditEventDialog } from "./internal/components/callable-edit-event-dialog";
import { EditLocationDialog } from "./internal/components/callable-edit-location-dialog";
import { EventsEditor } from "./internal/components/events-editor";
import { LocationEditor } from "./internal/components/location-editor";

export default function CalenderEdit() {
	const { user, isLoading } = useAuth();

	if (
		isLoading ||
		!user?.roles.some((role) =>
			(Object.values(LEADER_ROLE_IDS) as number[]).includes(role.id),
		)
	) {
		return null;
	}

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
