import type { UserProfileUpdateParams } from "@idp/schema/api/user";
import type * as v from "valibot";

export type FormInputValues = v.InferInput<typeof UserProfileUpdateParams>;
export type FormOutputValues = v.InferOutput<typeof UserProfileUpdateParams>;

export interface ChildFormProps {
	isOnboarding: boolean;
	getFormErrorMessage: (fieldName: keyof FormInputValues) => string | undefined;
}
