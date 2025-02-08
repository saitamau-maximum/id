import { useId } from "react";
import { css } from "styled-system/css";
import { FieldSet } from "../fieldset";
import { LabelText } from "../label-text";

type Props = {
	label: string;
	children: (id: string) => React.ReactNode;
	required?: boolean;
};

export const WithLabelField = ({ children, label, required }: Props) => {
	const id = useId();
	return (
		<FieldSet>
			<label htmlFor={id}>
				<LabelText>
					{label}
					{required && (
						<span
							aria-hidden="true"
							className={css({
								color: "red",
								marginLeft: "token(spacing.1)",
							})}
						>
							*
						</span>
					)}
				</LabelText>
			</label>
			{children(id)}
		</FieldSet>
	);
};
