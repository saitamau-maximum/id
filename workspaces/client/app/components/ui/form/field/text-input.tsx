import type { ComponentProps } from "react";
import { css } from "styled-system/css";
import { ErrorDisplay } from "../error-display";
import { Input } from "../input";
import { WithLabelField } from "./with-label";

type Props = Exclude<ComponentProps<"input">, "id"> & {
	error?: string;
	label: string;
	additionalInfo?: string;
};

export const TextInputField = ({
	error,
	label,
	required,
	additionalInfo,
	...props
}: Props) => {
	return (
		<WithLabelField label={label} required={required}>
			{(id) => (
				<>
					<Input id={id} {...props} required={required} />
					{additionalInfo && (
						<p
							className={css({
								fontSize: "sm",
								color: "gray.500",
							})}
						>
							{additionalInfo}
						</p>
					)}
					<ErrorDisplay error={error} />
				</>
			)}
		</WithLabelField>
	);
};
