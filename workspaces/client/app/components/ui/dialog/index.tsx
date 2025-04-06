import type { ComponentProps } from "react";
import {
	Dialog as RADialog,
	Heading as RAHeading,
	Modal as RAModal,
	ModalOverlay as RAModalOverlay,
} from "react-aria-components";
import { css } from "styled-system/css";

type HeadingProps = Omit<ComponentProps<typeof RAHeading>, "className">;

const StyledRAHeading = (props: HeadingProps) => (
	<RAHeading
		slot="title"
		className={css({
			color: "gray.600",
			marginBottom: 4,
			fontSize: "lg",
		})}
		{...props}
	/>
);

type ModalOverlayProps = Omit<
	ComponentProps<typeof RAModalOverlay>,
	"className"
>;

const StyledRAModalOverlay = (props: ModalOverlayProps) => (
	<RAModalOverlay
		className={css({
			position: "fixed",
			top: 0,
			left: 0,
			width: "100vw",
			height: "100dvh",
			background: "rgba(0, 0, 0, 0.5)",
			zIndex: 1000,
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			padding: 4,

			"&[data-entering]": {
				animationName: "fadein",
				animationDuration: "300ms",
				animationTimingFunction: "ease",
			},

			"&[data-exiting]": {
				animationName: "fadein",
				animationDuration: "300ms",
				animationTimingFunction: "ease",
				animationDirection: "reverse",
			},
		})}
		{...props}
	/>
);

type ModalProps = Omit<ComponentProps<typeof RAModal>, "className">;

const StyledRAModal = (props: ModalProps) => (
	<RAModal
		className={css({
			maxWidth: "min(calc(100vw - 32px), 800px)", // dialog 分の padding があるので 32px
			width: "100%",
			boxShadow: "0 8px 20px rgba(0 0 0 / 0.1)",
			borderRadius: 6,
			background: "white",
			color: "gray.600",
			borderWidth: 1,
			borderColor: "gray.400",
			borderStyle: "solid",
			outline: "none",
			padding: 4,

			"&[data-entering]": {
				animationName: "zoom",
				animationDuration: "300ms",
				animationTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
			},
		})}
		{...props}
	/>
);

type BodyProps = Omit<ComponentProps<typeof RADialog>, "className">;

const StyledRADialog = (props: BodyProps) => (
	<RADialog
		className={css({
			_focusVisible: {
				outline: "none", // React Ariaがダイアログを開いた時にFOCUSを飛ばすが、FOCUSすればいいだけなのでoutlineを消す
			},
		})}
		{...props}
	/>
);

type Props = Omit<
	ComponentProps<typeof RAModalOverlay>,
	"className" | "children"
> & {
	title: string;
	children: React.ReactNode;
};

export const Dialog = ({ children, title, ...rest }: Props) => (
	<StyledRAModalOverlay {...rest}>
		<StyledRAModal>
			<StyledRADialog>
				<StyledRAHeading slot="title">{title}</StyledRAHeading>
				{children}
			</StyledRADialog>
		</StyledRAModal>
	</StyledRAModalOverlay>
);
