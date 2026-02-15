import { useEffect } from "react";
import { GitHub } from "react-feather";
import { type MetaFunction, useNavigate, useSearchParams } from "react-router";
import { css } from "styled-system/css";
import { useAuth } from "~/hooks/use-auth";
import { useInvitation } from "~/hooks/use-invitation";
import { env } from "~/utils/env";
import { LoginButtonLike } from "./internal/components/login-button";

export const meta: MetaFunction = () => {
	return [{ title: "Login | Maximum IdP" }];
};

export default function Login() {
	const { isLoading, isAuthorized, isMember } = useAuth();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { invitationCode } = useInvitation();

	const shouldProceed = !isLoading && isAuthorized && isMember;

	const loginSearchParams = new URLSearchParams();

	// もし continue_to がクエリパラメータに指定されていたらそれを使う
	const continueToURL =
		searchParams.get("continue_to") ?? `${window.location.origin}/verify`;
	loginSearchParams.set("continue_to", continueToURL);
	loginSearchParams.set("from", "login");

	// もし招待コードがあれば使う
	if (invitationCode) loginSearchParams.set("invitation_id", invitationCode);

	useEffect(() => {
		if (shouldProceed) {
			navigate("/");
		}
	}, [shouldProceed, navigate]);

	if (shouldProceed) {
		return null;
	}

	return (
		<div
			className={css({
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				gap: 8,
				padding: 4,
			})}
		>
			<img
				src="/Maximum-logo.svg"
				alt="logo"
				width="200"
				height="40"
				className={css({
					width: "200px",
					height: "40px",
					mdDown: {
						width: "150px",
						height: "30px",
					},
				})}
			/>
			<h1
				className={css({
					fontSize: "4xl",
					fontWeight: 800,
					color: "gray.600",
					mdDown: {
						fontSize: "3xl",
					},
				})}
			>
				Maximum IdP
			</h1>
			<p
				className={css({
					textAlign: "center",
					color: "gray.600",
					lineHeight: 2,
				})}
			>
				Maximum IdPへようこそ！
				<br />
				埼玉大学のプログラミングサークル「Maximum」のプロフィール管理システムです
				{invitationCode && (
					<p>
						招待を受け入れるには以下のボタンから GitHub
						アカウントでログインしてください。
					</p>
				)}
			</p>
			<div
				className={css({
					display: "flex",
					gap: 4,
					mdDown: { flexDirection: "column" },
				})}
			>
				<a
					href={`${env("SERVER_HOST")}/auth/login/github?${loginSearchParams.toString()}`}
				>
					<LoginButtonLike bgColor="#181717">
						<GitHub size={20} />
						GitHub でログイン
					</LoginButtonLike>
				</a>
				{
					// invitationCode がある場合には GitHub ログインを強制
					!invitationCode && (
						<a
							href={`${env("SERVER_HOST")}/auth/login/discord?${loginSearchParams.toString()}`}
						>
							<LoginButtonLike bgColor="#5865F2">
								<div
									role="img"
									aria-hidden="true"
									// img[src=svg] だと色が変更できない？ので mask-image を使う
									className={css({
										width: "20px",
										height: "20px",
										display: "inline-block",
										maskImage: "url(/discord.svg)",
										maskSize: "contain",
										maskRepeat: "no-repeat",
										maskPosition: "center",
										backgroundColor: "currentColor",
									})}
								/>
								Discord でログイン
							</LoginButtonLike>
						</a>
					)
				}
			</div>
		</div>
	);
}
