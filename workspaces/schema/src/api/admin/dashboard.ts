import * as v from "valibot";
import { DashboardUser } from "../../entity/user";

export const GetDashboardInfoResponse = v.array(DashboardUser);
export type GetDashboardInfoResponse = v.InferOutput<
	typeof GetDashboardInfoResponse
>;
