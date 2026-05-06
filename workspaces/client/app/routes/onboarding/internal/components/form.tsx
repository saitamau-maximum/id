import { UserSettingForm } from "~/components/feature/user/setting/form";
import { useRegister } from "../hooks/use-register";

export const RegisterForm = () => {
	const { mutate, isPending } = useRegister();
	return (
		<UserSettingForm
			type="onboarding"
			onSubmit={mutate}
			isPending={isPending}
		/>
	);
};
