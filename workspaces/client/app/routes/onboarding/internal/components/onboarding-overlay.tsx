import { useCallback, useRef } from "react";
import { css } from "styled-system/css";

interface Props {
	children: (triggerAnimation: (displayId: string) => void) => React.ReactNode;
}

const easeInOut = (targets: string[], t: number, ease: string) =>
	targets.map((target) => `${target} ${t}s ${ease}`).join(", ");

export const OnboardingOverlay = ({ children }: Props) => {
	const containerRef = useRef(null);
	const logoRef = useRef(null);
	const innerRef = useRef(null);
	const messageRef = useRef(null);

	const triggerAnimation = useCallback(async (displayId: string) => {
		if (
			!containerRef.current ||
			!logoRef.current ||
			!innerRef.current ||
			!messageRef.current
		) {
			return;
		}
		const inner = innerRef.current as HTMLElement;
		const container = containerRef.current as HTMLElement;
		const logo = logoRef.current as HTMLImageElement;
		const message = messageRef.current as HTMLElement;

		inner.style.transition = easeInOut(["opacity"], 1, "ease-out");
		inner.style.opacity = "0";
		inner.style.pointerEvents = "none";
		inner.style.userSelect = "none";
		container.style.transition = easeInOut(["background"], 1, "ease-out");
		container.style.background = "black";

		await new Promise((resolve) => setTimeout(resolve, 2000));

		logo.style.transition = easeInOut(
			["opacity", "z-index", "width", "height"],
			2,
			"ease-in-out",
		);
		logo.style.opacity = "1";
		logo.style.zIndex = "1";
		logo.style.width = "min(calc(100vw - 1rem * 2), 320px)";
		logo.style.height = "auto";

		await new Promise((resolve) => setTimeout(resolve, 2000));

		message.style.transition = easeInOut(["height"], 1, "ease-in-out");
		message.style.height = "100px";

		await new Promise((resolve) => setTimeout(resolve, 1000));

		const messageText = `./welcome.sh @${displayId}`;
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
			await new Promise((resolve) => setTimeout(resolve, 150));
			message.innerHTML = `> ${messageText.slice(0, i + 1)}${PLACEHOLDER_EMPTY}`;
			void message.offsetWidth;
		}
		{
			const currentMessage = message.innerHTML.slice(0, -1);
			for (let i = 0; i < 10; i++) {
				await new Promise((resolve) => setTimeout(resolve, 300));
				message.innerHTML = `${currentMessage}${PLACEHOLDER_FULL}`;
				await new Promise((resolve) => setTimeout(resolve, 300));
				message.innerHTML = `${currentMessage}${PLACEHOLDER_EMPTY}`;
			}
			message.innerHTML = `${currentMessage}${PLACEHOLDER_FULL}`;
		}
	}, []);

	return (
		<div
			ref={containerRef}
			className={css({
				display: "flex",
				justifyContent: "center",
				flexDirection: "column",
				height: "100%",
			})}
		>
			<div
				ref={logoRef}
				className={css({
					width: "100%",
					height: "100%",
					opacity: 0,
					position: "fixed",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					zIndex: -1,
				})}
			>
				<img
					src="/Maximum-logo-white.svg"
					alt="Maximum logo"
					width="600"
					height="150"
					className={css({
						width: "100%",
						height: "auto",
						aspectRatio: "4 / 1",
					})}
				/>

				<pre
					ref={messageRef}
					className={css({
						height: 0,
						width: "100%",
						overflow: "hidden",
						fontSize: "lg",
						fontWeight: "bold",
						color: "white",
						display: "flex",
						alignItems: "center",
					})}
				/>
			</div>
			<div ref={innerRef}>{children(triggerAnimation)}</div>
		</div>
	);
};
