import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import { css } from "styled-system/css";
import { useAuth } from "~/hooks/use-auth";
import { useRepository } from "~/hooks/use-repository";

interface Props {
	children: (triggerAnimation: (displayId: string) => void) => React.ReactNode;
}

const easeInOut = (targets: string[], t: number, ease: string) =>
	targets.map((target) => `${target} ${t}s ${ease}`).join(", ");

const ESCAPE_RULES = {
	"&": "&amp;",
	"'": "&apos;",
	'"': "&quot;",
	"<": "&lt;",
	">": "&gt;",
};

function sanitize(str: string): string {
	return str.replace(
		/[&'"<>]/g,
		(match) => ESCAPE_RULES[match as keyof typeof ESCAPE_RULES],
	);
}

export const OnboardingOverlay = ({ children }: Props) => {
	const allContainerRef = useRef(null);
	const centerContainerRef = useRef(null);
	const logoRef = useRef(null);
	const innerRef = useRef(null);
	const messageRef = useRef(null);
	const profileRef = useRef(null);
	const iconRef = useRef(null);
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const { authRepository } = useRepository();

	const triggerAnimation = useCallback(
		async (displayId: string) => {
			if (
				!allContainerRef.current ||
				!centerContainerRef.current ||
				!logoRef.current ||
				!innerRef.current ||
				!messageRef.current ||
				!profileRef.current ||
				!iconRef.current
			) {
				return;
			}
			const inner = innerRef.current as HTMLElement;
			const allContainer = allContainerRef.current as HTMLElement;
			const centerContainer = centerContainerRef.current as HTMLElement;
			const logo = logoRef.current as HTMLImageElement;
			const message = messageRef.current as HTMLElement;
			const profile = profileRef.current as HTMLElement;
			const icon = iconRef.current as HTMLImageElement;

			inner.style.transition = easeInOut(["opacity"], 1, "ease-out");
			inner.style.opacity = "0";
			inner.style.pointerEvents = "none";
			inner.style.userSelect = "none";
			allContainer.style.transition = easeInOut(["background"], 1, "ease-out");
			allContainer.style.background = "black";

			await new Promise((resolve) => setTimeout(resolve, 2000));

			centerContainer.style.zIndex = "1";
			logo.style.transition = easeInOut(["opacity"], 2, "ease-in-out");
			logo.style.opacity = "1";

			await new Promise((resolve) => setTimeout(resolve, 3000));

			message.style.transition = easeInOut(
				["height", "padding", "opacity"],
				1,
				"ease-in-out",
			);
			message.style.height = "100px";
			message.style.padding = "1rem";
			message.style.opacity = "1";

			await new Promise((resolve) => setTimeout(resolve, 1000));

			const messageText = `./register.sh @${sanitize(displayId)}`;
			const PLACEHOLDER_EMPTY = "_";
			const PLACEHOLDER_FULL = " ";
			{
				const currentMessage = "> ";
				for (let i = 0; i < 4; i++) {
					await new Promise((resolve) => setTimeout(resolve, 300));
					message.innerHTML = `${currentMessage}${PLACEHOLDER_FULL}`;
					await new Promise((resolve) => setTimeout(resolve, 300));
					message.innerHTML = `${currentMessage}${PLACEHOLDER_EMPTY}`;
				}
			}
			for (let i = 0; i < messageText.length; i++) {
				await new Promise((resolve) =>
					setTimeout(resolve, Math.random() * 200),
				);
				message.innerHTML = `> ${messageText.slice(0, i + 1)}${PLACEHOLDER_EMPTY}`;
				void message.offsetWidth;
			}
			{
				const currentMessage = message.innerHTML.slice(0, -1);
				for (let i = 0; i < 4; i++) {
					await new Promise((resolve) => setTimeout(resolve, 300));
					message.innerHTML = `${currentMessage}${PLACEHOLDER_FULL}`;
					await new Promise((resolve) => setTimeout(resolve, 300));
					message.innerHTML = `${currentMessage}${PLACEHOLDER_EMPTY}`;
				}
				message.innerHTML = `${currentMessage}${PLACEHOLDER_FULL}`;
			}
			(async () => {
				const LOADING_RATES = [{ time: 800, rate: 1 }];
				const randomRates = Array.from({ length: 10 }, () => Math.random());
				const uniqueRates = new Set(randomRates);
				uniqueRates.delete(1);
				const revSortedRates = Array.from(uniqueRates).sort((a, b) => b - a);
				for (const rate of revSortedRates) {
					LOADING_RATES.unshift({ time: Math.random() * 1000, rate });
				}
				await new Promise((resolve) => setTimeout(resolve, 200));
				message.innerHTML = `> ${messageText}<br>Loading...`;
				for (const { time, rate } of LOADING_RATES) {
					await new Promise((resolve) => setTimeout(resolve, time));
					const currentMessage = message.innerHTML;
					message.innerHTML = `${currentMessage}<br>Loading... ${(rate * 100).toFixed(2)}%`;
				}
				await new Promise((resolve) => setTimeout(resolve, 200));
				message.innerHTML = `> ${message.innerHTML}<br>Congratulations!<br>You have successfully registered!`;

				message.innerHTML = `> ${message.innerHTML}<br>Redirecting...`;

				await new Promise((resolve) => setTimeout(resolve, 2000));

				queryClient.invalidateQueries({
					queryKey: authRepository.me$$key(),
				});
			})();

			await new Promise((resolve) => setTimeout(resolve, 1000));

			profile.style.transition = easeInOut(["width"], 1, "ease-in-out");
			profile.style.width = "300px";

			await new Promise((resolve) => setTimeout(resolve, 1000));

			icon.style.transition = easeInOut(["opacity"], 1, "ease-in-out");
			icon.style.opacity = "1";
			icon.style.animation = "float 2s ease-in-out infinite";
		},
		[queryClient, authRepository],
	);

	return (
		<div
			ref={allContainerRef}
			className={css({
				display: "flex",
				justifyContent: "center",
				flexDirection: "column",
				height: "100%",
			})}
		>
			<div
				ref={centerContainerRef}
				className={css({
					width: "100%",
					height: "100%",
					position: "fixed",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					zIndex: -1,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				})}
			>
				<div
					className={css({
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 8,
					})}
				>
					<img
						ref={logoRef}
						src="/Maximum-logo-white.svg"
						alt="Maximum logo"
						width="600"
						height="150"
						className={css({
							width: "min(calc(100vw - 1rem * 2), 320px)",
							height: "auto",
							aspectRatio: "4 / 1",
							opacity: 0,
						})}
					/>

					<pre
						ref={messageRef}
						className={css({
							height: 0,
							opacity: 0,
							width: "500px",
							overflow: "hidden",
							fontSize: "lg",
							fontWeight: "bold",
							color: "neutral.300",
							display: "flex",
							alignItems: "flex-end",
							borderWidth: 1,
							borderStyle: "solid",
							borderColor: "neutral.600",
							borderRadius: "md",
							background: "neutral.900",
						})}
					/>
				</div>
				<div
					ref={profileRef}
					className={css({
						width: 0,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
					})}
				>
					<img
						ref={iconRef}
						src={user?.profileImageURL}
						alt={user?.displayName}
						width="160"
						height="160"
						className={css({
							opacity: 0,
							width: "160px",
							height: "160px",
							borderRadius: "full",
							objectFit: "cover",
						})}
					/>
				</div>
			</div>
			<div ref={innerRef}>{children(triggerAnimation)}</div>
		</div>
	);
};
