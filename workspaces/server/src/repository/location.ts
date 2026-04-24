import type { Location } from "@idp/schema/entity/calendar/location";

export type CreateLocationPayload = Omit<Location, "id">;

export type GetLocationsRes = Omit<Location, "description">[];

export interface ILocationRepository {
	createLocation: (params: CreateLocationPayload) => Promise<string>;
	getLocationById: (id: string) => Promise<Location>;
	getLocations: () => Promise<GetLocationsRes>;
	updateLocation: (params: Location) => Promise<void>;
	deleteLocation: (id: string) => Promise<void>;
}
