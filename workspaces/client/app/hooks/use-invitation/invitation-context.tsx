import { createContext } from "react";

interface InvitationContextProps {
	isInvited: boolean;
	setIsInvited: (isInvited: boolean) => void;
}

export const InvitationContext = createContext<InvitationContextProps>({
	isInvited: false,
	setIsInvited: () => {
		throw new Error("InvitationContext is not implemented");
	},
});
