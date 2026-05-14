import { Plus, X } from "react-feather";
import {
	type FieldError,
	useFieldArray,
	useFormContext,
} from "react-hook-form";
import { css } from "styled-system/css";
import { ButtonLike } from "~/components/ui/button-like";
import { Form } from "~/components/ui/form";
import { ErrorDisplay } from "~/components/ui/form/error-display";
import { IconButton } from "~/components/ui/icon-button";
import { SocialIcon } from "~/components/ui/social-icon";
import { detectSocialService } from "~/utils/social-link";
import type {
	ChildFormProps,
	FormInputValues,
	FormOutputValues,
} from "../types";

export const UserSettingFormContact = ({
	isOnboarding,
	getFormErrorMessage,
}: ChildFormProps) => {
	const {
		register,
		control,
		watch,
		formState: { errors },
	} = useFormContext<FormInputValues, unknown, FormOutputValues>();

	const {
		fields: socialLinks,
		append: appendSocialLink,
		remove: removeSocialLink,
	} = useFieldArray({
		control,
		name: "socialLinks",
	});

	return (
		<>
			<Form.Field.TextInput
				label="連絡の取れるメールアドレス"
				error={getFormErrorMessage("email")}
				additionalInfo={`
					大学のメールアドレス (~@ms.saitama-u.ac.jp) 以外のものを入力してください。
					「Maximum IdP でログイン」を利用したサービスで使われることがあります。
				`}
				placeholder="member@maximum.vc"
				required
				{...register("email")}
			/>

			{!isOnboarding && (
				<Form.FieldSet>
					<legend>
						<Form.LabelText>ソーシャルリンク (最大5つ)</Form.LabelText>
					</legend>
					<ul
						className={css({
							display: "flex",
							flexDirection: "column",
							gap: 2,
							marginTop: 2,
						})}
					>
						{socialLinks.map((field, index) => (
							<li className={css({ listStyle: "none" })} key={field.id}>
								<div
									className={css({
										display: "flex",
										gap: 4,
										placeItems: "center",
									})}
								>
									<SocialIcon
										service={detectSocialService(
											watch(`socialLinks.${index}.value`) ?? "",
										)}
										size={24}
									/>
									<Form.Input
										placeholder="https://example.com"
										{...register(`socialLinks.${index}.value`)}
									/>
									<IconButton
										label="Remove social link"
										onClick={() => removeSocialLink(index)}
										type="button"
									>
										<X size={16} />
									</IconButton>
								</div>
								<ErrorDisplay
									error={
										// socialLink[index] が string[] と型付けされているため value が存在しないといわれてしまうので型アサーション
										(
											errors.socialLinks?.[index] as
												| { value?: FieldError }
												| undefined
										)?.value?.message
									}
								/>
							</li>
						))}
					</ul>
					<div className={css({ textAlign: "center" })}>
						<button
							type="button"
							onClick={() => appendSocialLink({ value: "" })}
							disabled={socialLinks.length >= 5}
							className={css({
								width: "fit-content",
							})}
						>
							<ButtonLike
								variant="secondary"
								size="sm"
								disabled={socialLinks.length >= 5}
							>
								<Plus size={16} />
								Add
							</ButtonLike>
						</button>
					</div>
				</Form.FieldSet>
			)}
		</>
	);
};
