import { useCallback, useState } from "react";
import { Check, Copy } from "react-feather";
import { css } from "styled-system/css";
import { IconButton } from "~/components/ui/icon-button";
import { useToast } from "~/hooks/use-toast";

interface Props {
	secret: string;
}

export const GeneratedSecretDisplay = ({ secret }: Props) => {
	const [copied, setCopied] = useState(false);
	const { pushToast } = useToast();

	const handleCopyClientId = useCallback(() => {
		navigator.clipboard.writeText(secret);
		setCopied(true);
		pushToast({
			type: "success",
			title: "クライアントIDをコピーしました",
		});
		setTimeout(() => setCopied(false), 3000);
	}, [secret, pushToast]);

	return (
		<div>
			<div className={css({ display: "flex", gap: 2, alignItems: "center" })}>
				<code
					className={css({
						backgroundColor: "gray.100",
						borderRadius: "md",
						padding: 2,
					})}
				>
					{secret}
				</code>
				<IconButton
					type="button"
					onClick={handleCopyClientId}
					label="Copy Client ID"
				>
					{copied ? (
						<Check size={16} className={css({ color: "green.600" })} />
					) : (
						<Copy size={16} />
					)}
				</IconButton>
			</div>
			<p className={css({ fontSize: "sm", color: "gray.600", marginTop: 2 })}>
				このシークレットは一度しか表示されません。必ずコピーして安全な場所に保存してください。
			</p>
		</div>
	);
};
