import { UserSettingForm } from "~/components/feature/user/setting/form";
import { useUpdateProfile } from "../hooks/use-update-profile";

export const ProfileUpdateForm = () => {
	const { mutate, isPending } = useUpdateProfile();
	return (
		<UserSettingForm type="update" isPending={isPending} onSubmit={mutate} />
	);
};
