import { createContext } from "react";
import type { PushToastOptions } from "./toast-provider";

interface ToastContextProps {
	pushToast: (options: PushToastOptions) => void;
}

export const ToastContext = createContext<ToastContextProps>({
	pushToast: () => {
		throw new Error("ToastContext is not implemented");
	},
});
