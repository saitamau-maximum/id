import { User } from "@idp/schema/entity/user";
import * as v from "valibot";

export const UserBasicInfo = v.pick(User, [
	"id",
	"displayId",
	"displayName",
	"profileImageURL",
]);

export type UserBasicInfo = v.InferOutput<typeof UserBasicInfo>;
