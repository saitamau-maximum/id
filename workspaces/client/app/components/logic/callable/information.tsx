import { createCallable } from "react-call";
import { css } from "styled-system/css";
import { ButtonLike } from "~/components/ui/button-like";
import { Dialog } from "~/components/ui/dialog";

interface Props {
	title: string;
	label?: string;
	children?: React.ReactNode;
}

export const InformationDialog = createCallable<Props>(
	({ call, title, label = "OK", children }) => {
		return (
			<Dialog
				title={title}
				isOpen
				isDismissable
				onOpenChange={(isOpen) => {
					if (!isOpen) call.end();
				}}
			>
				{children}
				<div
					className={css({
						display: "flex",
						justifyContent: "center",
						gap: 4,
						gridColumn: "1 / -1",
						marginTop: 4,
					})}
				>
					<button type="button" onClick={() => call.end()}>
						<ButtonLike>{label}</ButtonLike>
					</button>
				</div>
			</Dialog>
		);
	},
);
