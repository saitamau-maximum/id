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

		const equipments = await EquipmentRepository.getAllEquipments();
		return c.json(equipments);
	})
	.get("/:id", memberOnlyMiddleware, async (c) => {
		const id = c.req.param("id");
		const { EquipmentRepository } = c.var;

		const equipment = await EquipmentRepository.getEquipmentById(id).catch(
			() => null,
		);

		if (!equipment) {
			return c.body(null, 404);
		}

		return c.json(equipment);
	})
	.post(
		"/",
		equipmentMutableMiddleware,
		vValidator("json", createEquipmentSchema),
		async (c) => {
			const { name, description, ownerId } = c.req.valid("json");
			const { EquipmentRepository } = c.var;

			await EquipmentRepository.createEquipment({
				name,
				description: description !== "" ? description : undefined,
				createdAt: new Date(),
				updatedAt: new Date(),
				ownerId,
			});
			return c.body(null, 201);
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

			// 存在チェック
			const equipment = await EquipmentRepository.getEquipmentById(id).catch(
				() => null,
			);
			if (!equipment) {
				return c.body(null, 404);
			}

			await EquipmentRepository.updateEquipment({
				id,
				name,
				description: description !== "" ? description : undefined,
				updatedAt: new Date(),
				ownerId,
			});
			return c.body(null, 204);
		},
	)
	.delete("/:id", equipmentMutableMiddleware, async (c) => {
		const id = c.req.param("id");
		const { EquipmentRepository } = c.var;

		// 存在チェック
		const equipment = await EquipmentRepository.getEquipmentById(id).catch(
			() => null,
		);
		if (!equipment) {
			return c.body(null, 404);
		}

		await EquipmentRepository.deleteEquipment(id);
		return c.body(null, 204);
	});

export { route as equipmentRoute };
