import { useCallback } from "react";
import { createCallable } from "react-call";
import { css } from "styled-system/css";
import { ButtonLike } from "~/components/ui/button-like";
import { Dialog } from "~/components/ui/dialog";

interface Props {
	title: string;
	children?: React.ReactNode;
}

type Payload =
	| {
			type: "success";
	  }
	| {
			type: "dismiss";
	  };

export const ConfirmDialog = createCallable<Props, Payload>(
	({ call, title, children }) => {
		const handleOK = useCallback(() => {
			call.end({ type: "success" });
		}, [call]);

		return (
			<Dialog
				title={title}
				isOpen
				isDismissable
				onOpenChange={(isOpen) => {
					if (!isOpen) call.end({ type: "dismiss" });
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
					<button type="button" onClick={() => call.end({ type: "dismiss" })}>
						<ButtonLike variant="secondary">キャンセル</ButtonLike>
					</button>
					<button type="button" onClick={handleOK}>
						<ButtonLike>OK</ButtonLike>
					</button>
				</div>
			</Dialog>
		);
	},
);
