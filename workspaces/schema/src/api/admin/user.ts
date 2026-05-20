import * as v from "valibot";
import { User } from "../../entity/user";

export const AdminUserGetUsersResponse = v.array(
	v.omit(User, ["certifications", "oauthConnections", "inviteIssuedAt"]),
);
export type AdminUserGetUsersResponse = v.InferOutput<
	typeof AdminUserGetUsersResponse
>;

export const AdminUserGetProvisionalUsersResponse = v.array(
	v.omit(User, ["certifications", "oauthConnections", "inviteIssuedAt"]),
);
export type AdminUserGetProvisionalUsersResponse = v.InferOutput<
	typeof AdminUserGetProvisionalUsersResponse
>;
