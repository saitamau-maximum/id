import { useState } from "react";
import { InvitationContext } from "./invitation-context";

interface Props {
	children: React.ReactNode;
}

export const InvitationProvider = ({ children }: Props) => {
	const [invitationCode, setInvitationCode] = useState("");

	return (
		<InvitationContext.Provider
			value={{
				invitationCode,
				setInvitationCode,
			}}
		>
			{children}
		</InvitationContext.Provider>
	);
};
