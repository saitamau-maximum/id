import { vValidator } from "@hono/valibot-validator";
import * as v from "valibot";
import { factory } from "../factory";
import {
	equipmentMutableMiddleware,
	memberOnlyMiddleware,
} from "../middleware/auth";

const app = factory.createApp();

const createEquipmentSchema = v.object({
	name: v.pipe(v.string(), v.nonEmpty()),
	description: v.optional(v.string()),
	ownerId: v.pipe(v.string(), v.nonEmpty()),
});

const updateEquipmentSchema = v.object({
	name: v.pipe(v.string(), v.nonEmpty()),
	description: v.optional(v.string()),
	ownerId: v.pipe(v.string(), v.nonEmpty()),
});

const route = app
	.get("/", memberOnlyMiddleware, async (c) => {
		const { EquipmentRepository } = c.var;

		try {
			const equipments = await EquipmentRepository.getAllEquipments();
			return c.json(equipments);
		} catch (e) {
			return c.text("equipments not found", 404);
		}
	})
	.get("/:id", memberOnlyMiddleware, async (c) => {
		const id = c.req.param("id");
		const { EquipmentRepository } = c.var;

		try {
			const equipment = await EquipmentRepository.getEquipmentById(id);
			return c.json(equipment);
		} catch (e) {
			return c.text("equipment not found", 404);
		}
	})
	.post(
		"/",
		equipmentMutableMiddleware,
		vValidator("json", createEquipmentSchema),
		async (c) => {
			const { name, description, ownerId } = c.req.valid("json");
			const { EquipmentRepository } = c.var;

			try {
				const id = await EquipmentRepository.createEquipment({
					name,
					description: description !== "" ? description : undefined,
					createdAt: new Date(),
					updatedAt: new Date(),
					ownerId,
				});
				return c.json({ id }, 201);
			} catch (e) {
				return c.text("Internal Server Error", 500);
			}
		},
	)
	.put(
		"/:id",
		equipmentMutableMiddleware,
		vValidator("json", updateEquipmentSchema),
		async (c) => {
			const id = c.req.param("id");
			const { name, description, ownerId } = c.req.valid("json");
			const { EquipmentRepository } = c.var;

			try {
				await EquipmentRepository.updateEquipment({
					id,
					name,
					description: description !== "" ? description : undefined,
					updatedAt: new Date(),
					ownerId,
				});
				return c.json({ id }, 200);
			} catch (e) {
				return c.text("Internal Server Error", 500);
			}
		},
	)
	.delete("/:id", equipmentMutableMiddleware, async (c) => {
		const id = c.req.param("id");
		const { EquipmentRepository } = c.var;

		try {
			await EquipmentRepository.deleteEquipment(id);
			return c.text("ok", 200);
		} catch (e) {
			return c.text("Internal Server Error", 500);
		}
	});

export { route as equipmentRoute };
