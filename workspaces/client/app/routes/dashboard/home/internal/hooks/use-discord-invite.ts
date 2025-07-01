import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "~/hooks/use-auth";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

export function useDiscordInvite() {
	const { discordRepository } = useRepository();
	const { pushToast } = useToast();
	const queryClient = useQueryClient();
	const { user } = useAuth();

	return useMutation({
		mutationFn: () => discordRepository.inviteDiscord(),
		onError: (error) => {
			pushToast({
				type: "error",
				title: "Discord の招待に失敗しました",
				description:
					error instanceof Error ? error.message : "不明なエラーが発生しました",
			});
		},
		onSuccess: ({ status }) => {
			// DiscordInvitation が表示されている時点で user は存在するはず
			if (!user || !user.displayId) return;

			queryClient.invalidateQueries({
				queryKey: discordRepository.getDiscordInfoByUserDisplayID$$key(
					user.displayId,
				),
			});

			if (status === "failed") {
				pushToast({
					type: "error",
					title: "Discord の招待に失敗しました",
					description: "Discord アカウントが連携されていない可能性があります",
				});
			}
			if (status === "already_joined") {
				pushToast({
					type: "success",
					title: "すでに参加しています",
					description: "すでに Discord サーバーに参加しています",
				});
			}
			if (status === "added") {
				pushToast({
					type: "success",
					title: "Discord サーバーに参加しました",
					description: "Maximum の Discord サーバーに参加しました！",
				});
			}
		},
	});
}
