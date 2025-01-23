import { role } from "@idp/server/shared/role";
import { useCallback, useState } from "react";
import { Key, LogOut, Settings } from "react-feather";
import { Link, useLocation, useNavigate } from "react-router";
import { css } from "styled-system/css";
import { Menu } from "~/components/ui/menu";
import { JWT_STORAGE_KEY } from "~/constant";
import { useAuth } from "~/hooks/use-auth";
import type { User } from "~/repository/auth";
import { FLAG } from "~/utils/flag";

type Navigation = {
	label: string;
	to: string;
	isActive: (location: string) => boolean;
	shouldDisplay?: (user: User) => boolean;
	comingSoon?: boolean;
};

const NAVIGATION: Navigation[] = [
	{
		label: "Home",
		to: "/",
		isActive: (location: string) => location === "/",
	},
	{
		label: "Members",
		to: "/members",
		isActive: (location: string) => location.startsWith("/members"),
	},
	{
		shouldDisplay: (user: User) =>
			user.roles.some((r) => r.id === role.ROLE_IDS.ADMIN),
		label: "Admin",
		to: "/admin",
		isActive: (location: string) => location.startsWith("/admin"),
	},
	{
		comingSoon: true,
		label: "Calendar",
		to: "/calendar",
		isActive: (location: string) => location === "/calendar",
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

interface HumbergerButtonProps {
	isOpen: boolean;
	onToggle: () => void;
}

const HumbergerButton = ({ isOpen, onToggle }: HumbergerButtonProps) => (
	<button
		type="button"
		className={css({
			position: "fixed",
			top: 4,
			right: 4,
			display: "none",
			zIndex: 3,
			width: 12,
			height: 12,
			cursor: "pointer",
			borderRadius: 4,
			// hover state
			transition: "background",
			"&:hover": {
				background: "gray.100",
			},
			mdDown: {
				display: "block",
			},
		})}
		aria-label={isOpen ? "Close Sidebar" : "Open Sidebar"}
		onClick={onToggle}
	>
		<span
			className={css({
				position: "absolute",
				width: 8,
				height: "2px",
				background: "gray.600",
				top: "50%",
				left: "50%",
				transform: isOpen
					? "translate(-50%, -50%) rotate(45deg)"
					: "translate(-50%, calc(-50% - 8px))",
				transition: "transform",
			})}
		/>
		<span
			className={css({
				position: "absolute",
				width: 8,
				height: "2px",
				background: "gray.600",
				top: "50%",
				left: "50%",
				transform: "translate(-50%, -50%)",
				opacity: isOpen ? 0 : 1,
				transition: "opacity",
			})}
		/>
		<span
			className={css({
				position: "absolute",
				width: 8,
				height: "2px",
				background: "gray.600",
				top: "50%",
				left: "50%",
				transform: isOpen
					? "translate(-50%, -50%) rotate(-45deg)"
					: "translate(-50%, calc(-50% + 8px))",
				transition: "transform",
			})}
		/>
	</button>
);

export const Sidebar = () => {
	const { user, refetch } = useAuth();
	const location = useLocation();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const navigate = useNavigate();

	const handleLogout = useCallback(() => {
		localStorage.removeItem(JWT_STORAGE_KEY);
		refetch();
	}, [refetch]);

	if (!user) {
		return null;
	}

	return (
		<>
			<HumbergerButton
				isOpen={isMenuOpen}
				onToggle={() => setIsMenuOpen((prev) => !prev)}
			/>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			<div
				className={css({
					position: "fixed",
					width: "100%",
					height: "100%",
					top: 0,
					left: 0,
					pointerEvents: isMenuOpen ? "auto" : "none",
					opacity: isMenuOpen ? 1 : 0,
					transition: "opacity",
					background: "rgba(0, 0, 0, 0.25)",
					zIndex: 1,
				})}
				onClick={() => setIsMenuOpen(false)}
			/>
			<div
				className={css({
					background: "white",
					width: "100%",
					maxWidth: "320px",
					height: "100%",
					padding: 8,
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					alignItems: "center",
					mdDown: {
						position: "fixed",
						right: 0,
						top: 0,
						transform: isMenuOpen ? "translateX(0)" : "translateX(100%)",
						transition: "transform 0.3s",
						boxShadow: "0 0 16px rgba(0, 0, 0, 0.25)",
						zIndex: 2,
					},
				})}
			>
				<img
					src="/Maximum-logo.svg"
					alt="logo"
					width="200"
					height="50"
					className={css({
						width: "200px",
						height: "50px",
						mdDown: {
							width: "160px",
							height: "40px",
						},
					})}
				/>

				<nav>
					<ul
						className={css({
							display: "flex",
							flexDirection: "column",
							gap: 4,
						})}
					>
						{NAVIGATION.map(
							(nav) =>
								(!nav.shouldDisplay || nav.shouldDisplay(user)) && (
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
												onClick={() => setIsMenuOpen(false)}
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
								),
						)}
					</ul>
				</nav>

				<Menu.Trigger>
					<Menu.Button
						className={css({
							borderRadius: 8,
							padding: 3,
							margin: -3,
							cursor: "pointer",
							transition: "background",
							_hover: {
								background: "gray.100",
							},
							_focusVisible: {
								background: "gray.100",
								outline: "none",
							},
						})}
					>
						<div
							className={css({ display: "flex", gap: 4, alignItems: "center" })}
						>
							<img
								className={css({
									width: "48px",
									height: "48px",
									borderRadius: "50%",
								})}
								src={user.profileImageURL}
								alt={user.displayName}
							/>
							<div
								className={css({
									display: "flex",
									flexDirection: "column",
									alignItems: "flex-start",
								})}
							>
								<p
									className={css({
										fontSize: "lg",
										fontWeight: 500,
									})}
								>
									{user.displayName}
								</p>
								<p
									className={css({
										color: "gray.500",
										fontSize: "xs",
									})}
								>
									@{user.displayId}
								</p>
							</div>
						</div>
					</Menu.Button>
					<Menu.Popover>
						<Menu.Root>
							<Menu.Item
								onAction={() => {
									setIsMenuOpen(false);
									navigate("/settings");
								}}
							>
								<Settings
									size={20}
									className={css({
										color: "gray.500",
									})}
								/>
								Settings
							</Menu.Item>
							{FLAG.ENABLE_OAUTH_REGISTRATION && (
								<Menu.Item
									onAction={() => {
										setIsMenuOpen(false);
										navigate("/oauth-apps");
									}}
								>
									<Key
										size={20}
										className={css({
											color: "gray.500",
										})}
									/>
									OAuth Apps
								</Menu.Item>
							)}
							<Menu.Item
								onAction={() => {
									setIsMenuOpen(false);
									handleLogout();
								}}
							>
								<LogOut
									size={20}
									className={css({
										color: "gray.500",
									})}
								/>
								Logout
							</Menu.Item>
						</Menu.Root>
					</Menu.Popover>
				</Menu.Trigger>
			</div>
		</>
	);
};
