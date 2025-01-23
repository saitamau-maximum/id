import { useId } from "react";
import { ChevronLeft } from "react-feather";
import { Link } from "react-router";
import { AnchorLike } from "~/components/ui/anchor-like";
import { ButtonLike } from "~/components/ui/button-like";
import { Form } from "~/components/ui/form";
import { useAuth } from "~/hooks/use-auth";
import { useRepository } from "~/hooks/use-repository";

export default function Register() {
	const { user } = useAuth();

	const appLogoId = useId();
	const appNameId = useId();
	const appDescriptionId = useId();
	const appScopesId = useId();
	const appCallbackUrlsId = useId();

	const { oauthAppsRepository } = useRepository();

	if (!user) return null;

	return (
		<div>
			<h1>Register a new OAuth App</h1>
			<Link to="/oauth-apps">
				<AnchorLike>
					<ChevronLeft /> 戻る
				</AnchorLike>
			</Link>
			{/* TODO: component 化 */}
			<form>
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
				<button type="submit">
					<ButtonLike>Save</ButtonLike>
				</button>
			</form>
		</div>
	);
}
