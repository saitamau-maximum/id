import type { ComponentProps } from "react";
import { ErrorDisplay } from "../error-display";
import { Input } from "../input";
import { WithLabelField } from "./with-label";

type Props = Exclude<ComponentProps<"input">, "id"> & {
	error?: string;
	label: string;
};

export const TextInputField = ({ error, label, required, ...props }: Props) => {
	return (
		<WithLabelField label={label} required={required}>
			{(id) => (
				<>
					<Input id={id} {...props} required={required} />
					<ErrorDisplay error={error} />
				</>
			)}
		</WithLabelField>
	);
};
