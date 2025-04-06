import type { Location } from "~/types/location";
import { client } from "~/utils/hono";

export interface ILocationRepository {
	getAllLocations: () => Promise<Omit<Location, "description">[]>;
	getAllLocations$$key: () => unknown[];
	getLocationById: (locationId: Location["id"]) => Promise<Location>;
	getLocationById$$key: (locationId: Location["id"]) => unknown[];
	createLocation: (
		location: Omit<Location, "id" | "createdAt">,
	) => Promise<void>;
	updateLocation: (location: Omit<Location, "createdAt">) => Promise<void>;
	deleteLocation: (locationId: Location["id"]) => Promise<void>;
}

export class LocationRepositoryImpl implements ILocationRepository {
	async getAllLocations() {
		const res = await client.calendar.locations.$get();
		if (!res.ok) {
			throw new Error("Failed to fetch location");
		}
		return (await res.json()).map((location) => ({
			...location,
			createdAt: new Date(location.createdAt),
		}));
	}

	getAllLocations$$key() {
		return ["location"];
	}

	async getLocationById(locationId: Location["id"]) {
		const res = await client.calendar.locations[":id"].$get({
			param: {
				id: locationId,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to fetch location");
		}
		const location = await res.json();
		return {
			...location,
			createdAt: new Date(location.createdAt),
		};
	}

	getLocationById$$key(locationId: Location["id"]) {
		return ["location", locationId];
	}

	async createLocation(location: Omit<Location, "id" | "createdAt">) {
		const res = await client.calendar.locations.$post({
			json: {
				...location,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to create location");
		}
	}

	async updateLocation(location: Omit<Location, "createdAt">) {
		const res = await client.calendar.locations[":id"].$put({
			param: {
				id: location.id,
			},
			json: {
				...location,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to update location");
		}
	}

	async deleteLocation(locationId: Location["id"]) {
		const res = await client.calendar.locations[":id"].$delete({
			param: {
				id: locationId,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to delete location");
		}
	}
}
