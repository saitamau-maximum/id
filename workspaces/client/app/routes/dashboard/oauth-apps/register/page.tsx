import { valibotResolver } from "@hookform/resolvers/valibot";
import { scope } from "@idp/server/shared/scope";
import { Plus, X } from "react-feather";
import { useFieldArray, useForm } from "react-hook-form";
import { Link } from "react-router";
import { css } from "styled-system/css";
import * as v from "valibot";
import { ButtonLike } from "~/components/ui/button-like";
import { Form } from "~/components/ui/form";
import { IconButton } from "~/components/ui/icon-button";
import { OAuthSchemas } from "~/schema/oauth";
import { OAuthSectionHeader } from "../internal/components/oauth-section-header";
import { useRegisterOAuthApp } from "./internal/hooks/use-register-oauth-app";

const RegisterFormSchema = v.object({
	name: OAuthSchemas.ApplicationName,
	description: OAuthSchemas.Description,
	scopeIds: OAuthSchemas.ScopeIds,
	callbackUrls: OAuthSchemas.CallbackUrls,
	icon: OAuthSchemas.Icon,
});

type FormValues = v.InferInput<typeof RegisterFormSchema>;

export default function Register() {
	const { mutate, isPending } = useRegisterOAuthApp();

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: valibotResolver(RegisterFormSchema),
		defaultValues: {
			// hack: 初期値を配列にしておくと、checkboxの値が配列で返ってくる
			scopeIds: [],
			callbackUrls: [{ value: "" }], // 1 つは必ず表示
		},
	});

	const {
		fields: callbackUrls,
		append: appendCallbackUrl,
		remove: removeCallbackUrl,
	} = useFieldArray({
		control,
		name: "callbackUrls",
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
					gridTemplateColumns: "1fr",
					gap: "token(spacing.8) token(spacing.6)",
					"@dashboard/2xl": {
						gridTemplateColumns: "repeat(2, minmax(320px, 1fr))",
					},
				})}
				onSubmit={handleSubmit((d) => mutate(d))}
			>
				<div
					className={css({ display: "flex", flexDirection: "column", gap: 6 })}
				>
					<Form.Field.WithLabel
						label="Application Logo (後で変えられます)"
						required
					>
						{(id) => (
							<>
								<Form.Input
									required
									id={id}
									type="file"
									accept="image/*"
									// accept single image file

									{...register("icon")}
								/>
								<Form.ErrorDisplay error={errors.icon?.message} />
							</>
						)}
					</Form.Field.WithLabel>
					<Form.Field.TextInput
						label="アプリケーション名"
						error={errors.name?.message}
						placeholder="My Application"
						required
						{...register("name")}
					/>
					<Form.Field.TextArea
						label="アプリケーションの説明"
						error={errors.description?.message}
						placeholder="This is my awesome application"
						required
						rows={4}
						{...register("description")}
					/>
					<Form.Field.WithLabel label="Scopes" required>
						{() => (
							<>
								<Form.SelectGroup>
									{Object.entries(scope.SCOPES_BY_ID).map(([id, scope]) => (
										<Form.Select
											key={id}
											value={id}
											label={scope.name}
											{...register("scopeIds")}
										/>
									))}
								</Form.SelectGroup>
								<Form.ErrorDisplay error={errors.scopeIds?.message} />
							</>
						)}
					</Form.Field.WithLabel>
				</div>
				<div
					className={css({ display: "flex", flexDirection: "column", gap: 6 })}
				>
					<Form.Field.WithLabel label="Callback URLs" required>
						{(id) => (
							<>
								{callbackUrls.map((field, index) => (
									<div
										key={field.id}
										className={css({
											display: "grid",
											gridTemplateColumns: "1fr auto",
											gap: 4,
											placeItems: "center",
										})}
									>
										<Form.Input
											required
											id={id}
											type="url"
											placeholder={`https://example.com/callback/${index + 1}`}
											{...register(`callbackUrls.${index}.value`)}
										/>
										{
											// 2 つ目以降の callback URL には削除ボタンを表示
											index > 0 && (
												<IconButton
													label={`Remove callback URL ${index + 1}`}
													onClick={() => removeCallbackUrl(index)}
												>
													<X size={16} />
												</IconButton>
											)
										}
									</div>
								))}
								<button
									type="button"
									onClick={() =>
										appendCallbackUrl({
											value: "",
										})
									}
								>
									<ButtonLike>
										<Plus size={24} />
										Add
									</ButtonLike>
								</button>
								<Form.ErrorDisplay error={errors.callbackUrls?.message} />
							</>
						)}
					</Form.Field.WithLabel>
				</div>
				<div
					className={css({
						display: "flex",
						justifyContent: "center",
						gap: 4,
						gridColumn: "1 / -1",
					})}
				>
					<Link to="/oauth-apps">
						<ButtonLike variant="secondary">キャンセル</ButtonLike>
					</Link>
					<button type="submit" disabled={isPending}>
						<ButtonLike disabled={isPending}>Save</ButtonLike>
					</button>
				</div>
			</form>
		</div>
	);
}
