import type { Role } from "@idp/schema/entity/role";
import { css } from "styled-system/css";

interface Props {
	role: Role;
	variant?: "default" | "large";
}

export const RoleBadge = ({ role, variant }: Props) => {
	return (
		<span
			className={css({
				display: "inline-block",
				padding:
					variant === "large"
						? "token(spacing.2) token(spacing.4)"
						: "token(spacing.1) token(spacing.2)",
				lineHeight: 1,
				borderRadius: variant === "large" ? 12 : 8,
				fontSize: variant === "large" ? 14 : 12,
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
