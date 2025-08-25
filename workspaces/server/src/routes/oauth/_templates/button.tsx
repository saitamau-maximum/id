import type { NonNullableFC } from "./_types";

const buttonVariants = {
	primary:
		"bg-green-600 border-green-600 text-white hover:bg-white hover:text-green-600 transition-colors",
	secondary:
		"bg-white border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-colors",
} as const;

interface ButtonProps {
	text: string;
	variant?: keyof typeof buttonVariants;
	type?: "button" | "submit" | "reset";
	name: string;
	value: string;
}

export const _Button: NonNullableFC<ButtonProps> = ({
	text,
	variant = "primary",
	type = "button",
	name,
	value,
}) => (
	<button
		className={`px-4 py-2 rounded-lg font-bold focus:outline-none border-2 w-full ${
			buttonVariants[variant]
		}`}
		type={type}
		name={name}
		value={value}
	>
		{text}
	</button>
);
