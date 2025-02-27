import type { ComponentProps } from "react";
import { ErrorDisplay } from "../error-display";
import { Textarea } from "../textarea";
import { WithLabelField } from "./with-label";

type Props = Exclude<ComponentProps<typeof Textarea>, "id"> & {
	error?: string;
	label: string;
};

export const TextAreaField = ({ error, label, required, ...props }: Props) => {
	return (
		<WithLabelField label={label} required={required}>
			{(id) => (
				<>
					<Textarea id={id} {...props} required={required} />
					<ErrorDisplay error={error} />
				</>
			)}
		</WithLabelField>
	);
};
