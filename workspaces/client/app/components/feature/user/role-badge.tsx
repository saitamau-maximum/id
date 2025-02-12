import { css } from "styled-system/css";
import type { Role } from "~/types/role";

interface Props {
	role: Role;
}

export const RoleBadge = ({ role }: Props) => {
	return (
		<span
			className={css({
				display: "inline-block",
				padding: "token(spacing.1) token(spacing.2)",
				lineHeight: 1,
				borderRadius: 8,
				fontSize: 12,
				fontWeight: 500,
			})}
			style={{
				backgroundColor: `${role.color}22`,
				border: `1px solid ${role.color}`,
				color: role.color,
			}}
		>
			{role.name}
		</span>
	);
};
