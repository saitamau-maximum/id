"use client";

import type React from "react";
import { type SyntheticEvent, useCallback, useRef, useState } from "react";

import ReactCrop, {
	centerCrop,
	makeAspectCrop,
	type Crop,
	type PixelCrop,
} from "react-image-crop";

import "react-image-crop/dist/ReactCrop.css";

import { css } from "styled-system/css";
import { ButtonLike } from "~/components/ui/button-like";
import { Dialog } from "~/components/ui/dialog";
import { useUploadProfileImage } from "../hooks/use-upload-profile-image";

export type FileWithPreview = File & {
	preview: string;
};

interface ImageCropperProps {
	displayName: string | undefined;
	dialogOpen: boolean;
	setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
	selectedFile: FileWithPreview | null;
	setSelectedFile: React.Dispatch<React.SetStateAction<FileWithPreview | null>>;
}

export const ProfileImageCropper = ({
	dialogOpen,
	displayName,
	setDialogOpen,
	selectedFile,
	setSelectedFile,
}: ImageCropperProps) => {
	const aspect = 1;

	const imgRef = useRef<HTMLImageElement | null>(null);
	const [isLoaded, setIsLoaded] = useState<boolean>(false);

	const [crop, setCrop] = useState<Crop>();
	const [croppedImageUrl, setCroppedImageUrl] = useState<string>("");

	const { mutate: uploadProfileImage, isError: isUploadError } =
		useUploadProfileImage({
			onSuccess: () => {
				setDialogOpen(false);
				const file = new File([croppedImageUrl], `${displayName}.png`, {
					type: "image/png",
				});
				const cropped = URL.createObjectURL(file);
				const fileWithPreview = Object.assign(file, {
					preview: cropped,
				});
				setSelectedFile(fileWithPreview);
			},
		});

	function onImageLoad(e: SyntheticEvent<HTMLImageElement>) {
		setIsLoaded(true);
		if (aspect) {
			const { width, height } = e.currentTarget;
			setCrop(centerAspectCrop(width, height, aspect));
		}
	}

	function onCropComplete(crop: PixelCrop) {
		if (imgRef.current && crop.width && crop.height) {
			const croppedImageUrl = getCroppedImg(imgRef.current, crop);
			setCroppedImageUrl(croppedImageUrl);
		}
	}

	function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): string {
		const canvas = document.createElement("canvas");
		const scaleX = image.naturalWidth / image.width;
		const scaleY = image.naturalHeight / image.height;

		canvas.width = crop.width * scaleX;
		canvas.height = crop.height * scaleY;

		const ctx = canvas.getContext("2d");

		if (ctx) {
			ctx.imageSmoothingEnabled = false;

			ctx.drawImage(
				image,
				crop.x * scaleX,
				crop.y * scaleY,
				crop.width * scaleX,
				crop.height * scaleY,
				0,
				0,
				crop.width * scaleX,
				crop.height * scaleY,
			);
		}

		return canvas.toDataURL("image/png", 1.0);
	}

	async function onCrop() {
		try {
			const blob = await fetch(croppedImageUrl).then((r) => r.blob());
			const file = new File([blob], `${displayName}.png`, {
				type: "image/png",
			});
			uploadProfileImage({ file });
		} catch (error) {
			alert("Something went wrong!");
		}
	}

	const handleCancel = useCallback(() => {
		setDialogOpen(false);
	}, [setDialogOpen]);

	return (
		<Dialog
			title="プロフィール画像の編集"
			isOpen={dialogOpen}
			onOpenChange={setDialogOpen}
		>
			<div
				className={css({
					marginBottom: 4,
					maxWidth: "500px",
					width: "100%",
					aspectRatio: "1 / 1",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
				})}
			>
				<ReactCrop
					circularCrop
					crop={crop}
					onChange={(_, percentCrop) => setCrop(percentCrop)}
					onComplete={(c) => onCropComplete(c)}
					aspect={aspect}
					className={css({ width: "100%" })}
				>
					<img
						ref={imgRef}
						className={css({ width: "100%", opacity: isLoaded ? 1 : 0 })}
						alt="Profile Editor"
						src={selectedFile?.preview}
						onLoad={onImageLoad}
					/>
					{!isLoaded && (
						<div
							className={css({
								position: "absolute",
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)",
								color: "gray.500",
							})}
						>
							Loading...
						</div>
					)}
				</ReactCrop>
			</div>
			{isUploadError && (
				<p
					className={css({
						color: "red.600",
						fontSize: "sm",
						marginBottom: 4,
					})}
				>
					アップロードに失敗しました。切り抜き後の画像が5MB以下を超えている可能性があります。
				</p>
			)}
			<div
				className={css({
					display: "flex",
					justifyContent: "flex-end",
					gap: 4,
				})}
			>
				<button type="button" onClick={handleCancel}>
					<ButtonLike variant="secondary">Cancel</ButtonLike>
				</button>
				<button type="button" onClick={onCrop}>
					<ButtonLike>確定</ButtonLike>
				</button>
			</div>
		</Dialog>
	);
};

// Helper function to center the crop
export function centerAspectCrop(
	mediaWidth: number,
	mediaHeight: number,
	aspect: number,
): Crop {
	return centerCrop(
		makeAspectCrop(
			{
				unit: "%",
				width: 50,
				height: 50,
			},
			aspect,
			mediaWidth,
			mediaHeight,
		),
		mediaWidth,
		mediaHeight,
	);
}
