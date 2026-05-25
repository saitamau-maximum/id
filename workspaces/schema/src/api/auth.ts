import type * as v from "valibot";
import { User } from "../entity/user";

export const GetMeResponse = User;
export type GetMeResponse = v.InferOutput<typeof GetMeResponse>;
