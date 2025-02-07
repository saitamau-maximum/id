import { useId } from "react";
import { Link } from "react-router";
import { css } from "styled-system/css";
import { ButtonLike } from "~/components/ui/button-like";
import { Form } from "~/components/ui/form";
import { useAuth } from "~/hooks/use-auth";
import { OAuthSectionHeader } from "../internal/components/oauth-section-header";

export default function Register() {
	const { user } = useAuth();

	const appLogoId = useId();
	const appNameId = useId();
	const appDescriptionId = useId();
	const appScopesId = useId();
	const appCallbackUrlsId = useId();

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
					display: "flex",
					flexDirection: "column",
					gap: 6,
				})}
			>
				<Form.FieldSet>
					<label htmlFor={appLogoId}>
						<Form.LabelText>Application Logo (後で変えられます)</Form.LabelText>
					</label>
					<Form.Input type="file" name="logo" />
				</Form.FieldSet>
				<Form.FieldSet>
					<label htmlFor={appNameId}>
						<Form.LabelText>Application Name</Form.LabelText>
					</label>
					<Form.Input id={appNameId} type="text" required />
				</Form.FieldSet>
				<Form.FieldSet>
					<label htmlFor={appDescriptionId}>
						<Form.LabelText>Application Description</Form.LabelText>
					</label>
					<Form.Input id={appDescriptionId} />
				</Form.FieldSet>
				<Form.FieldSet>
					<label htmlFor={appScopesId}>
						<Form.LabelText>Scopes</Form.LabelText>
					</label>
					{/* TODO: 全 scopes から読みだして表示 */}
				</Form.FieldSet>
				<Form.FieldSet>
					<label htmlFor={appCallbackUrlsId}>
						<Form.LabelText>Callback URLs</Form.LabelText>
					</label>
					[callback url 追加ボタン]
				</Form.FieldSet>
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
