import type { Role } from "@idp/schema/entity/role";
import { css } from "styled-system/css";

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
				whiteSpace: "nowrap",
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
