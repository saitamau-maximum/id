import { valibotResolver } from "@hookform/resolvers/valibot";
import { scope } from "@idp/server/shared/scope";
import { useCallback, useMemo, useState } from "react";
import { Plus, X } from "react-feather";
import { useFieldArray, useForm } from "react-hook-form";
import type { MetaFunction } from "react-router";
import { css, cx } from "styled-system/css";
import * as v from "valibot";
import { ButtonLike } from "~/components/ui/button-like";
import { Form } from "~/components/ui/form";
import { IconButton } from "~/components/ui/icon-button";
import { ImageCropper } from "~/components/ui/image-cropper";
import { SkeletonOverlay } from "~/components/ui/skeleton-overlay";
import { OAuthSchemas } from "~/schema/oauth";
import { OAuthSectionHeader } from "../internal/components/oauth-section-header";
import { useRegisterOAuthApp } from "./internal/hooks/use-register-oauth-app";

export const meta: MetaFunction = () => {
	return [{ title: "OAuth アプリケーションの新規作成 | Maximum IdP" }];
};

const RegisterFormSchema = v.object({
	name: OAuthSchemas.ApplicationName,
	description: OAuthSchemas.Description,
	scopeIds: OAuthSchemas.ScopeIds,
	callbackUrls: OAuthSchemas.CallbackUrls,
	icon: OAuthSchemas.Icon,
});

type FormInputValues = v.InferInput<typeof RegisterFormSchema>;
type FormOutputValues = v.InferOutput<typeof RegisterFormSchema>;

const iconStyle = css({
	padding: 1,
	borderRadius: "full",
	aspectRatio: "1 / 1",

	width: "240px",
	height: "240px",

	lgDown: {
		width: "160px",
		height: "160px",
	},

	mdDown: {
		width: "120px",
		height: "120px",
	},
});

export default function Register() {
	const { mutate, isPending } = useRegisterOAuthApp();
	const [isDialogOpen, setDialogOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const {
		watch,
		control,
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<FormInputValues, unknown, FormOutputValues>({
		resolver: valibotResolver(RegisterFormSchema),
		defaultValues: {
			// hack: 初期値を配列にしておくと、checkboxの値が配列で返ってくる
			scopeIds: [],
			callbackUrls: [{ value: "" }], // 1 つは必ず表示
		},
	});

	const icon = watch("icon");

	const {
		fields: callbackUrls,
		append: appendCallbackUrl,
		remove: removeCallbackUrl,
	} = useFieldArray({
		control,
		name: "callbackUrls",
	});

	const handleSelectFile = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			setSelectedFile(file);
			setDialogOpen(true);
		},
		[],
	);

	const iconURL = useMemo(() => {
		if (!icon) return null;
		return URL.createObjectURL(icon);
	}, [icon]);

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
					gap: "token(spacing.8) token(spacing.12)",
					"@dashboard/2xl": {
						gridTemplateColumns: "1fr max-content",
					},
				})}
				onSubmit={handleSubmit((d) => mutate(d))}
			>
				<div
					className={css({ display: "flex", flexDirection: "column", gap: 6 })}
				>
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
					<Form.Field.WithLabel label="Callback URLs" required>
						{(id) => (
							<>
								{callbackUrls.map((field, index) => (
									<div
										key={field.id}
										className={css({
											display: "grid",
											gridTemplateColumns: index === 0 ? "1fr" : "1fr auto",
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
									<ButtonLike size="sm" variant="text">
										<Plus size={16} />
										Add
									</ButtonLike>
								</button>
								<Form.ErrorDisplay error={errors.callbackUrls?.message} />
							</>
						)}
					</Form.Field.WithLabel>
				</div>
				<div
					className={css({ display: "flex", flexDirection: "column", gap: 6 })}
				>
					<Form.Field.WithLabel label="アプリケーションロゴ (後で変えられます)">
						{() => (
							<div className={css({ display: "grid", placeItems: "center" })}>
								<label
									className={css({
										cursor: "pointer",
										flexShrink: 0,
										position: "relative",
										overflow: "hidden",
										borderRadius: "full",
										borderWidth: 1,
										borderStyle: "solid",
										borderColor: "gray.200",
										width: "fit-content",
										height: "fit-content",

										"&:has(:focus-visible)": {
											borderWidth: 1,
											borderStyle: "solid",
											borderColor: "green.600",
										},
									})}
								>
									<input
										type="file"
										accept="image/*"
										className={css({
											// a11yを担保しつつデザインするためのかくし要素
											clip: "rect(0 0 0 0)",
											clipPath: "inset(50%)",
											height: 1,
											overflow: "hidden",
											position: "absolute",
											whiteSpace: "nowrap",
											width: 1,
											"&:focus-visible + img": {
												outlineColor: "green.500",
												outlineWidth: 1,
												outlineStyle: "solid",
											},
										})}
										onChange={handleSelectFile}
										onClick={(e) => {
											// valueを初期化して、同じファイルを選択してもonChangeが発火するようにする
											// @ts-ignore
											e.target.value = "";
										}}
									/>
									<SkeletonOverlay isLoading={isPending} />
									{iconURL ? (
										<img
											src={iconURL}
											alt="Application Logo"
											width="240"
											height="240"
											className={iconStyle}
										/>
									) : (
										<div
											className={cx(
												iconStyle,
												css({
													display: "grid",
													placeItems: "center",
													backgroundColor: "gray.100",
													color: "gray.400",
												}),
											)}
										>
											<Plus size={48} />
										</div>
									)}
								</label>
								<Form.ErrorDisplay error={errors.icon?.message} />
								<ImageCropper
									title="アプリケーションロゴを変更"
									dialogOpen={isDialogOpen}
									filename="icon"
									setDialogOpen={setDialogOpen}
									file={selectedFile}
									onCrop={(file) => {
										setValue("icon", file);
										setDialogOpen(false);
									}}
								/>
							</div>
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
					<button type="submit" disabled={isPending}>
						<ButtonLike disabled={isPending}>登録</ButtonLike>
					</button>
				</div>
			</form>
		</div>
	);
}
