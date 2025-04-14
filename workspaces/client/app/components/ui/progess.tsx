import { Check } from "react-feather";
import { css } from "styled-system/css";

interface Props {
	steps: {
		label: string;
		isActive: boolean;
		isCompleted: boolean;
	}[];
}

export const Progress = ({ steps }: Props) => {
	return (
		<div
			className={css({
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				width: "full",
			})}
		>
			{steps.map((step, index) => (
				<div
					key={step.label}
					className={css({
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 2,
						width: "full",
						flex: 1,
						flexShrink: 0,
						position: "relative",

						_after: {
							content: '""',
							display: index !== 0 ? "block" : "none",
							width: "full",
							height: 1,
							backgroundColor: step.isActive ? "green.600" : "gray.300",
							position: "absolute",
							top: "calc(token(spacing.6) / 2)",
							left: 0,
							transform: "translate(-50%, -50%)",
						},
					})}
				>
					<div
						className={css({
							width: 6,
							height: 6,
							borderRadius: "full",
							backgroundColor: step.isActive ? "green.600" : "gray.300",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							zIndex: 1,
							animation:
								step.isActive && !step.isCompleted
									? "pulseShadow 5s infinite"
									: "none",
						})}
					>
						{step.isCompleted && (
							<Check
								className={css({
									color: "white",
									width: 4,
									height: 4,
								})}
							/>
						)}
					</div>
					<span
						className={css({
							fontSize: "sm",
							color: step.isActive ? "green.600" : "gray.500",
						})}
					>
						{step.label}
					</span>
				</div>
			))}
		</div>
	);
};
