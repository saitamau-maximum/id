"use client";
import {
	type SyntheticEvent,
	useCallback,
	useMemo,
	useRef,
	useState,
} from "react";
import { Crop as RFCrop } from "react-feather";

import ReactCrop, {
	type Crop,
	centerCrop,
	makeAspectCrop,
	type PixelCrop,
} from "react-image-crop";

import "react-image-crop/dist/ReactCrop.css";
import { css } from "styled-system/css";
import { ButtonLike } from "~/components/ui/button-like";
import { Dialog } from "~/components/ui/dialog";

export type FileWithPreview = File & {
	preview: string;
};

interface ImageCropperProps {
	title: string;
	filename: string;
	dialogOpen: boolean;
	setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
	file: File | null;
	onCrop: (file: File) => void;
}

export const ImageCropper = ({
	title,
	dialogOpen,
	filename,
	setDialogOpen,
	file,
	onCrop,
}: ImageCropperProps) => {
	const selectedFile = useMemo(() => {
		if (!file) return null;
		return Object.assign(file, {
			preview: URL.createObjectURL(file),
		});
	}, [file]);

	const aspect = 1;

	const imgRef = useRef<HTMLImageElement | null>(null);
	const [isLoaded, setIsLoaded] = useState<boolean>(false);

	const [crop, setCrop] = useState<Crop>();
	const [croppedImageUrl, setCroppedImageUrl] = useState<string>("");

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

	const handleCrop = useCallback(async () => {
		try {
			const blob = await fetch(croppedImageUrl).then((r) => r.blob());
			const file = new File([blob], `${filename}.png`, {
				type: "image/png",
			});
			onCrop(file);
		} catch (error) {
			alert("Something went wrong!");
		}
	}, [croppedImageUrl, filename, onCrop]);

	const handleCancel = useCallback(() => {
		setDialogOpen(false);
	}, [setDialogOpen]);

	return (
		<Dialog
			title={title}
			isOpen={dialogOpen}
			onOpenChange={setDialogOpen}
			isDismissable
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
			<div
				className={css({
					display: "flex",
					justifyContent: "flex-end",
					gap: 4,
				})}
			>
				<button type="button" onClick={handleCancel}>
					<ButtonLike variant="secondary">キャンセル</ButtonLike>
				</button>
				<button type="button" onClick={handleCrop}>
					<ButtonLike>
						<RFCrop size={16} />
						切り取り
					</ButtonLike>
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
