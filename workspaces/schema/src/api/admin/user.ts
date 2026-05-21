import * as v from "valibot";
import { Invite } from "../../entity/invite";
import { User } from "../../entity/user";

export const AdminUserGetUsersResponse = v.array(
	v.omit(User, ["certifications", "oauthConnections", "inviteIssuedAt"]),
);
export type AdminUserGetUsersResponse = v.InferOutput<
	typeof AdminUserGetUsersResponse
>;

export const AdminUserGetProvisionalUsersResponse = v.array(
	v.intersect([
		v.omit(User, ["certifications", "oauthConnections", "inviteIssuedAt"]),
		v.object({
			invitationTitle: v.optional(Invite.entries.title),
			invitationId: v.optional(Invite.entries.id),
		}),
	]),
);
export type AdminUserGetProvisionalUsersResponse = v.InferOutput<
	typeof AdminUserGetProvisionalUsersResponse
>;
