export type Location = {
	id: string;
	name: string;
	description: string;
	createdAt: Date;
};

export interface ILocationRepository {
	createLocation: (params: Omit<Location, "id">) => Promise<string>;
	getLocationById: (id: string) => Promise<Location>;
	getLocations: () => Promise<Omit<Location, "description">[]>;
	updateLocation: (params: Location) => Promise<void>;
	deleteLocation: (id: string) => Promise<void>;
}
