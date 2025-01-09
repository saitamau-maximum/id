import { useCallback } from "react";
import { Link, useLocation } from "react-router";
import { css } from "styled-system/css";
import { ButtonLike } from "~/components/ui/button-like";
import { JWT_STORAGE_KEY } from "~/constant";
import { useAuth } from "~/hooks/useAuth";

const NAVIGATION = [
	{
		label: "Home",
		to: "/",
		isActive: (location: string) => location === "/",
	},
	{
		comingSoon: true,
		label: "Calendar",
		to: "/calendar",
		isActive: (location: string) => location === "/calendar",
	},
	{
		comingSoon: true,
		label: "Members",
		to: "/members",
		isActive: (location: string) => location === "/members",
	},
];

const Dot = ({ isActive }: { isActive?: boolean }) => (
	<span
		className={css({
			width: 4,
			height: 4,
			flexShrink: 0,
			backgroundGradient: "primary",
			borderRadius: "50%",
			opacity: isActive ? 1 : 0,
		})}
	/>
);

export const Sidebar = () => {
	const { user, refetch } = useAuth();
	const location = useLocation();

	const handleLogout = useCallback(() => {
		localStorage.removeItem(JWT_STORAGE_KEY);
		refetch();
	}, [refetch]);

	if (!user) {
		return null;
	}

	return (
		<div
			className={css({
				width: "320px",
				height: "100%",
				padding: 8,
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				alignItems: "center",
			})}
		>
			<img src="/Maximum-logo.svg" alt="logo" width="200" height="50" />

			<div
				className={css({
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 8,
					width: "100%",
				})}
			>
				<nav>
					<ul
						className={css({
							display: "flex",
							flexDirection: "column",
							gap: 4,
						})}
					>
						{NAVIGATION.map((nav) => (
							<li
								key={nav.to}
								className={css({
									display: "flex",
									alignItems: "center",
									gap: 2,
								})}
							>
								<Dot isActive={nav.isActive(location.pathname)} />
								{nav.comingSoon ? (
									<span
										className={css({
											display: "block",
											padding: "token(spacing.2) token(spacing.4)",
											width: "100%",
											borderRadius: 8,
											color: "gray.500",
											fontSize: "sm",
											fontWeight: "600",
											cursor: "not-allowed",
										})}
									>
										<span
											className={css({
												fontSize: "lg",
												fontWeight: "normal",
											})}
										>
											{nav.label}
										</span>
										<br />
										Coming Soon ...
									</span>
								) : (
									<Link
										to={nav.to}
										className={css({
											display: "block",
											padding: "token(spacing.2) token(spacing.4)",
											width: "100%",
											borderRadius: 8,
											color: nav.isActive(location.pathname)
												? "gray.800"
												: "gray.500",
											textDecoration: "none",
											fontSize: "2xl",
											fontWeight: "600",
											transition: "colors",
											_hover: {
												color: "green.600",
											},
										})}
									>
										{nav.label}
									</Link>
								)}
								<Dot />
							</li>
						))}
					</ul>
				</nav>
				<button onClick={handleLogout} type="button">
					<ButtonLike variant="secondary">Logout</ButtonLike>
				</button>
			</div>

			<div className={css({ display: "flex", gap: 2, alignItems: "center" })}>
				<img
					className={css({
						width: "48px",
						height: "48px",
						borderRadius: "50%",
					})}
					src={user.profileImageURL}
					alt={user.displayName}
				/>
				<p
					className={css({
						fontSize: "2xl",
						fontWeight: "bold",
					})}
				>
					{user.displayName}
				</p>
			</div>
		</div>
	);
};
