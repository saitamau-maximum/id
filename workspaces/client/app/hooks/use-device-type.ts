import { useEffect, useState } from "react";

type DeviceType = "sp" | "pc";

/**
 * 画面サイズからデバイスの種類を取得する
 * 横幅が480px未満の場合はスマートフォンと判定, それ以外はPCと判定
 *
 * @returns デバイスの種類
 * @example
 * const { deviceType } = useDeviceType();
 * if (deviceType === "sp") {
 *  // スマートフォンの場合の処理
 * } else {
 * // PCの場合の処理
 * }
 */
export const useDeviceType = () => {
	const [deviceType, setDeviceType] = useState<DeviceType>("pc");

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 480) {
				setDeviceType("sp");
			} else {
				setDeviceType("pc");
			}
		};

		handleResize();

		const resizeObserver = new ResizeObserver(() => {
			handleResize();
		});

		resizeObserver.observe(document.documentElement);

		return () => {
			resizeObserver.disconnect();
		};
	}, []);

	return { deviceType };
};
