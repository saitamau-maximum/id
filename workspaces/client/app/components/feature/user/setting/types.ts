import type { UserProfileUpdateParams } from "@idp/schema/api/user";
import type * as v from "valibot";

export interface ChildFormProps {
	isOnboarding: boolean;
}

export type FormInputValues = v.InferInput<typeof UserProfileUpdateParams>;
export type FormOutputValues = v.InferOutput<typeof UserProfileUpdateParams>;
