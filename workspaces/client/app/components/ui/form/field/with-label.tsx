import { useId } from "react";
import { FieldSet } from "../fieldset";
import { LabelText } from "../label-text";
import { RequiredIndicator } from "../required-indicator";

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
					{required && <RequiredIndicator />}
				</LabelText>
			</label>
			{children(id)}
		</FieldSet>
	);
};
