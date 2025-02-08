import type React from "react";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { Toast } from "~/components/ui/toast";
import type { ToastItemProps } from "~/components/ui/toast/toast-item";
import { ToastContext } from "./toast-context";

export type PushToastOptions = ToastItemProps & {
	timeout?: number;
};

type ToastItem = ToastItemProps & {
	id: string;
};

interface Props {
	children: React.ReactNode;
}

export const ToastProvider = ({ children }: Props) => {
	const [items, setItems] = useState<ToastItem[]>([]);

	const pushToast = useCallback(
		({ timeout = 5000, ...options }: PushToastOptions) => {
			const id = crypto.randomUUID();
			setItems((prev) => [...prev, { ...options, id }]);
			setTimeout(() => {
				setItems((prev) => prev.filter((item) => item.id !== id));
			}, timeout);
		},
		[],
	);

	return (
		<>
			<ToastContext.Provider
				value={{
					pushToast,
				}}
			>
				{children}
			</ToastContext.Provider>
			{createPortal(
				<Toast.Stack>
					{items.map((item) => (
						<Toast.Item key={item.id} {...item} />
					))}
				</Toast.Stack>,
				document.body,
			)}
		</>
	);
};
