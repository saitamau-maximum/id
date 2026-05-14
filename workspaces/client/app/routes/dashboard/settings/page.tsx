import type { MetaFunction } from "react-router";
import { css } from "styled-system/css";
import { UserSettingForm } from "~/components/feature/user/setting/form";
import { useUpdateProfile } from "./internal/hooks/use-update-profile";

export const meta: MetaFunction = () => {
	return [{ title: "Settings | Maximum IdP" }];
};

export default function Settings() {
	const { mutate, isPending } = useUpdateProfile();

	return (
		<div>
			<div
				className={css({
					marginBottom: 8,
				})}
			>
				<h1
					className={css({
						fontSize: "4xl",
						fontWeight: "bold",
						color: "gray.600",
					})}
				>
					Settings
				</h1>
				<span className={css({ color: "gray.500", fontSize: "md" })}>
					プロフィール情報を変更することができます
				</span>
			</div>

			<UserSettingForm type="update" isPending={isPending} onSubmit={mutate} />
		</div>
	);
}
