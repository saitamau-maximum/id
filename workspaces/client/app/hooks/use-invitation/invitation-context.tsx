import { createContext } from "react";

interface InvitationContextProps {
	invitationCode: string;
	setInvitationCode: (invitationCode: string) => void;
}

export const InvitationContext = createContext<InvitationContextProps>({
	invitationCode: "",
	setInvitationCode: () => {
		throw new Error("InvitationContext is not implemented");
	},
});
