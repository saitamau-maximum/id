import { valibotResolver } from "@hookform/resolvers/valibot";
import { useId } from "react";
import { Plus } from "react-feather";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { css } from "styled-system/css";
import * as v from "valibot";
import { ButtonLike } from "~/components/ui/button-like";
import { Form } from "~/components/ui/form";
import { IconButton } from "~/components/ui/icon-button";
import { OAuthSchemas } from "~/schema/oauth";
import { OAuthSectionHeader } from "../internal/components/oauth-section-header";

const RegisterFormSchema = v.object({
	applicationName: OAuthSchemas.ApplicationName,
	description: OAuthSchemas.Description,
});

type FormValues = v.InferInput<typeof RegisterFormSchema>;

export default function Register() {
	const appLogoId = useId();
	const appScopesId = useId();
	const appCallbackUrlsId = useId();

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: valibotResolver(RegisterFormSchema),
	});

	return (
		<div>
			<OAuthSectionHeader
				title="新規 OAuth アプリケーション登録"
				breadcrumb={[
					{ label: "アプリケーション一覧", to: "/oauth-apps" },
					{ label: "新規作成" },
				]}
			/>
			<form
				className={css({
					display: "grid",
					gridTemplateColumns: "repeat(2, minmax(320px, 1fr))",
					gap: 6,
				})}
			>
				<div
					className={css({ display: "flex", flexDirection: "column", gap: 6 })}
				>
					<Form.FieldSet>
						<label htmlFor={appLogoId}>
							<Form.LabelText>
								Application Logo (後で変えられます)
							</Form.LabelText>
						</label>
						<Form.Input type="file" name="logo" />
					</Form.FieldSet>
					<Form.Field.TextInput
						label="アプリケーション名"
						error={errors.applicationName?.message}
						placeholder="My Application"
						required
						{...register("applicationName")}
					/>

					<Form.Field.TextArea
						label="Application Description"
						error={errors.description?.message}
						placeholder="This is my awesome application"
						required
						{...register("description")}
					/>
					<Form.FieldSet>
						<label htmlFor={appScopesId}>
							<Form.LabelText>Scopes</Form.LabelText>
						</label>
						{/* TODO: 全 scopes から読みだして表示 */}
					</Form.FieldSet>
				</div>
				<div>
					<Form.FieldSet>
						<label htmlFor={appCallbackUrlsId}>
							<Form.LabelText>Callback URLs</Form.LabelText>
						</label>
						<button type="button">
							<IconButton label="Add Callback URL">
								<Plus size={16} />
							</IconButton>
						</button>
					</Form.FieldSet>
				</div>
				<div
					className={css({
						display: "flex",
						justifyContent: "center",
						gap: 4,
					})}
				>
					<Link to="/oauth-apps">
						<ButtonLike variant="secondary">キャンセル</ButtonLike>
					</Link>
					<button type="submit">
						<ButtonLike>Save</ButtonLike>
					</button>
				</div>
			</form>
		</div>
	);
}
