import * as v from "valibot";

export const InvitationURLSchemas = {
	RemainingUse: v.nullable(
		v.pipe(
			v.string(),
			v.transform((v) => Number.parseInt(v)),
			v.integer(),
			v.minValue(1),
		),
	),
	ExpiresAt: v.nullable(
		v.pipe(
			v.string(),
			v.transform((v) => new Date(v)),
			v.date(),
		),
	),
};
