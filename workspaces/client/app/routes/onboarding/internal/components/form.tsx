import type { UserRegisterParams } from "@idp/schema/api/user";
import { useCallback } from "react";
import {
	ProfileForm,
	type ProfileFormOutputValues,
} from "~/components/feature/user/profile-form";
import { useRegister } from "../hooks/use-register";

export const RegisterForm = () => {
	const { mutate, isPending } = useRegister();

	const handleSubmit = useCallback(
		(data: ProfileFormOutputValues) => {
			const { socialLinks: _socialLinks, bio: _bio, ...registerParams } = data;
			mutate(registerParams as UserRegisterParams);
		},
		[mutate],
	);

	return (
		<ProfileForm
			mode="onboarding"
			onSubmit={handleSubmit}
			isPending={isPending}
			submitLabel="はじめる"
		/>
	);
};
