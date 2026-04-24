import * as v from "valibot";
import { Equipment, EquipmentWithOwner } from "../entity/equipment";

export const CreateOrUpdateEquipmentParams = v.pick(Equipment, [
	"name",
	"description",
	"ownerId",
]);
export type CreateOrUpdateEquipmentParams = v.InferOutput<
	typeof CreateOrUpdateEquipmentParams
>;

export const GetEquipmentsResponse = v.array(EquipmentWithOwner);
export type GetEquipmentsResponse = v.InferOutput<typeof GetEquipmentsResponse>;

export const GetEquipmentByIdResponse = EquipmentWithOwner;
export type GetEquipmentByIdResponse = v.InferOutput<
	typeof GetEquipmentByIdResponse
>;
