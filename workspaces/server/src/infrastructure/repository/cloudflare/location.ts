import { eq } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type {
	ILocationRepository,
	Location,
} from "../../../repository/location";

export class CloudflareLocationRepository implements ILocationRepository {
	private client: DrizzleD1Database<typeof schema>;

	constructor(db: D1Database) {
		this.client = drizzle(db, { schema });
	}

	async createLocation(params: Omit<Location, "id">): Promise<string> {
		const id = crypto.randomUUID();
		await this.client.insert(schema.locations).values({ ...params, id });
		return id;
	}

	async getLocationById(id: string): Promise<Location> {
		const res = await this.client.query.locations.findFirst({
			where: eq(schema.locations.id, id),
		});
		if (!res) {
			throw new Error(`Location not found: ${id}`);
		}
		return {
			id: res.id,
			name: res.name,
			description: res.description,
			createdAt: res.createdAt,
		};
	}

	async getLocations(): Promise<Omit<Location, "description">[]> {
		const res = await this.client.query.locations.findMany({
			columns: {
				id: true,
				name: true,
				createdAt: true,
			},
		});
		return res.map((location) => ({
			id: location.id,
			name: location.name,
			createdAt: location.createdAt,
		}));
	}

	async updateLocation(params: Location): Promise<void> {
		await this.client
			.update(schema.locations)
			.set(params)
			.where(eq(schema.locations.id, params.id));
	}

	async deleteLocation(id: string): Promise<void> {
		await this.client
			.delete(schema.locations)
			.where(eq(schema.locations.id, id));
	}
}
