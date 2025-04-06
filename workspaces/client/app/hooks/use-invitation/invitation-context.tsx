import { createContext } from "react";

interface InvitationContextProps {
	isInvited: boolean | null;
	setIsInvited: (isInvited: boolean) => void;
}

export const InvitationContext = createContext<InvitationContextProps>({
	isInvited: null,
	setIsInvited: () => {
		throw new Error("InvitationContext is not implemented");
	},
});
