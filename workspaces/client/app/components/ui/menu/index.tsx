import type { ComponentProps } from "react";
import {
	Button as RAButton,
	Menu as RAMenu,
	MenuItem as RAMenuItem,
	MenuTrigger as RAMenuTrigger,
	Popover as RAPopover,
} from "react-aria-components";
import { css } from "styled-system/css";

type PopoverProps = Omit<ComponentProps<typeof RAPopover>, "className">;

const StyledRAPopover = (props: PopoverProps) => (
	<RAPopover
		className={css({
			minWidth: "200px",
		})}
		{...props}
	/>
);

type MenuProps = Omit<ComponentProps<typeof RAMenu>, "className">;

const StyledRAMenu = (props: MenuProps) => (
	<RAMenu
		className={css({
			background: "white",
			overflow: "hidden",
			borderRadius: 8,
			borderColor: "gray.200",
			borderWidth: 1,
			boxShadow: "0 2px 14px -2px rgba(0, 0, 0, 0.1)",
			_focusVisible: {
				outlineColor: "green.500",
				outlineWidth: 1,
				outlineStyle: "solid",
			},
		})}
		{...props}
	/>
);

type MenuItemProps = Omit<ComponentProps<typeof RAMenuItem>, "className">;

const StyledRAMenuItem = (props: MenuItemProps) => (
	<RAMenuItem
		className={css({
			padding: "token(spacing.2) token(spacing.4)",
			borderBottomWidth: 1,
			borderBottomColor: "gray.200",
			cursor: "pointer",
			transition: "background",
			background: "transparent",
			display: "flex",
			alignItems: "center",
			gap: 3,
			"&:last-child": {
				borderBottomWidth: 0,
			},
			_hover: {
				background: "gray.100",
			},
			_focusVisible: {
				background: "gray.100",
				outline: "none",
			},
		})}
		{...props}
	/>
);

export const Menu = {
	Trigger: RAMenuTrigger,
	Popover: StyledRAPopover,
	Button: RAButton,
	Root: StyledRAMenu,
	Item: StyledRAMenuItem,
};
