import { useState } from "react";
import { InvitationContext } from "./invitation-context";

interface Props {
	children: React.ReactNode;
}

export const InvitationProvider = ({ children }: Props) => {
	const [isInvited, setIsInvited] = useState(false);

	return (
		<InvitationContext.Provider
			value={{
				isInvited,
				setIsInvited,
			}}
		>
			{children}
		</InvitationContext.Provider>
	);
};
