import type React from "react";
import { useCallback, useState } from "react";

import { css } from "styled-system/css";
import { ImageCropper } from "~/components/ui/image-cropper";
import { SkeletonOverlay } from "~/components/ui/skeleton-overlay";
import { useAuth } from "~/hooks/use-auth";
import { useUpdateProfileImage } from "../hooks/use-update-profile-image";

export const ProfileImageEditor = () => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const [isDialogOpen, setDialogOpen] = useState(false);

	const handleSelectFile = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			setSelectedFile(file);
			setDialogOpen(true);
		},
		[],
	);

	const { mutate: updateProfileImage, isPending } = useUpdateProfileImage();

	const handleCrop = useCallback(
		(file: File) => {
			updateProfileImage(file);
			setDialogOpen(false);
		},
		[updateProfileImage],
	);

	const { user } = useAuth();

	if (!user) return null;

	return (
		<div
			className={css({
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 4,
				flexShrink: 0,

				lgDown: {
					flexDirection: "row",
					justifyContent: "center",
				},
			})}
		>
			<ImageCropper
				title="プロフィール画像を変更"
				dialogOpen={isDialogOpen}
				filename={user.displayName || "avatar"}
				setDialogOpen={setDialogOpen}
				file={selectedFile}
				onCrop={handleCrop}
			/>
			<label
				className={css({
					cursor: "pointer",
					flexShrink: 0,
					position: "relative",
					overflow: "hidden",
					borderRadius: "full",
					borderWidth: 1,
					borderStyle: "solid",
					borderColor: "gray.200",

					"&:has(:focus-visible)": {
						borderWidth: 1,
						borderStyle: "solid",
						borderColor: "green.600",
					},
				})}
			>
				<input
					type="file"
					accept="image/*"
					className={css({
						// a11yを担保しつつデザインするためのかくし要素
						clip: "rect(0 0 0 0)",
						clipPath: "inset(50%)",
						height: 1,
						overflow: "hidden",
						position: "absolute",
						whiteSpace: "nowrap",
						width: 1,
						"&:focus-visible + img": {
							outlineColor: "green.500",
							outlineWidth: 1,
							outlineStyle: "solid",
						},
					})}
					onChange={handleSelectFile}
					onClick={(e) => {
						// valueを初期化して、同じファイルを選択してもonChangeが発火するようにする
						// @ts-ignore
						e.target.value = "";
					}}
				/>
				<SkeletonOverlay isLoading={isPending} />
				<img
					src={user.profileImageURL}
					alt={user.displayName}
					width="240"
					height="240"
					className={css({
						padding: 1,
						borderRadius: "full",
						aspectRatio: "1 / 1",

						lgDown: {
							width: "160px",
							height: "160px",
						},

						mdDown: {
							width: "120px",
							height: "120px",
						},
					})}
				/>
			</label>
			<p
				className={css({
					color: "gray.600",
					fontSize: "xs",
					textAlign: "center",
					textWrap: "balance",
					wordBreak: "auto-phrase",
					maxWidth: "240px",
					width: "100%",
				})}
			>
				画像をクリックしてプロフィール画像を変更
			</p>
		</div>
	);
};
