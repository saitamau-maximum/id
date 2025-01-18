import type React from "react";
import { useCallback, useState } from "react";

import { css } from "styled-system/css";
import { useAuth } from "~/hooks/use-auth";
import {
	type FileWithPreview,
	ProfileImageCropper,
} from "./profile-image-cropper";

export const ProfileImageEditor = () => {
	const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(
		null,
	);
	const [isDialogOpen, setDialogOpen] = useState(false);

	const handleSelectFile = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) {
				return;
			}

			const fileWithPreview = Object.assign(file, {
				preview: URL.createObjectURL(file),
			});

			setSelectedFile(fileWithPreview);
			setDialogOpen(true);
		},
		[],
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
			<ProfileImageCropper
				dialogOpen={isDialogOpen}
				displayName={user.displayName}
				setDialogOpen={setDialogOpen}
				selectedFile={selectedFile}
				setSelectedFile={setSelectedFile}
			/>
			<label
				className={css({
					cursor: "pointer",
					flexShrink: 0,
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
				/>
				<img
					src={user.profileImageURL}
					alt={user.displayName}
					width="240"
					height="240"
					className={css({
						borderRadius: "full",
						borderWidth: 1,
						borderColor: "gray.200",
						borderStyle: "solid",
						padding: 1,
						aspectRatio: "1 / 1",

						lgDown: {
							width: "160px",
							height: "160px",
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
				プロフィール画像を変更するには画像をクリックしてください
			</p>
		</div>
	);
};
