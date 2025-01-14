import { UsersTable } from "./internal/components/table";
import { useAllUsers } from "./internal/hooks/use-all-user";

export default function AdminUsers() {
	const users = useAllUsers();
	return (
		<div>
			<UsersTable users={users.data ?? []} />
		</div>
	);
}
