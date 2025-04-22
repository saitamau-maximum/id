import { cva } from "styled-system/css";

type Props = {
	variant?: "info" | "warning" | "error" | "success";
	children?: React.ReactNode;
	left?: React.ReactNode;
	right?: React.ReactNode;
	onClick?: () => void;
};

const messageBoxStyle = cva({
	base: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 2,
		borderRadius: 8,
		fontSize: "sm",
		fontWeight: 600,
		color: "white",
		borderWidth: 1,
		borderStyle: "solid",
		gap: 2,
		marginBottom: 4,
		textAlign: "center",
		width: "full",
		wordBreak: "break-word",
		whiteSpace: "pre-wrap",
		overflowWrap: "break-word",
		transition: "colors",
	},
	variants: {
		variant: {
			info: {
				backgroundColor: "blue.50",
				borderColor: "blue.300",
				color: "blue.500",
			},
			warning: {
				backgroundColor: "amber.50",
				borderColor: "amber.300",
				color: "amber.500",
			},
			error: {
				backgroundColor: "rose.50",
				borderColor: "rose.300",
				color: "rose.500",
			},
			success: {
				backgroundColor: "green.50",
				borderColor: "green.300",
				color: "green.500",
			},
		},
		clickable: {
			true: {
				cursor: "pointer",
			},
		},
	},
	compoundVariants: [
		{
			variant: "info",
			clickable: true,
			css: {
				"&:hover": {
					backgroundColor: "blue.100",
					borderColor: "blue.400",
				},
				"&:active": {
					backgroundColor: "blue.300",
					borderColor: "blue.500",
				},
				"&:focus": {
					outline: "2px solid blue.500",
					outlineOffset: "2px",
				},
			},
		},
		{
			variant: "warning",
			clickable: true,
			css: {
				"&:hover": {
					backgroundColor: "amber.100",
					borderColor: "amber.400",
				},
				"&:active": {
					backgroundColor: "amber.300",
					borderColor: "amber.500",
				},
				"&:focus": {
					outline: "2px solid amber.500",
					outlineOffset: "2px",
				},
			},
		},
		{
			variant: "error",
			clickable: true,
			css: {
				"&:hover": {
					backgroundColor: "rose.100",
					borderColor: "rose.400",
				},
				"&:active": {
					backgroundColor: "rose.300",
					borderColor: "rose.500",
				},
				"&:focus": {
					outline: "2px solid rose.500",
					outlineOffset: "2px",
				},
			},
		},
		{
			variant: "success",
			clickable: true,
			css: {
				"&:hover": {
					backgroundColor: "green.100",
					borderColor: "green.400",
				},
				"&:active": {
					backgroundColor: "green.300",
					borderColor: "green.500",
				},
				"&:focus": {
					outline: "2px solid green.500",
					outlineOffset: "2px",
				},
			},
		},
	],
});

export const MessageBox = ({
	variant = "info",
	children,
	left,
	right,
	onClick,
}: Props) => {
	return (
		<div
			className={messageBoxStyle({
				variant,
				clickable: !!onClick,
			})}
			onClick={onClick}
			role={onClick ? "button" : undefined}
			tabIndex={onClick ? 0 : undefined}
			aria-hidden={!onClick}
			onKeyDown={(e) => {
				if (onClick && e.key === "Enter") {
					onClick();
				}
				if (onClick && e.key === " ") {
					e.preventDefault();
					onClick();
				}
			}}
		>
			<div>{left}</div>
			<div>{children}</div>
			<div>{right}</div>
		</div>
	);
};
