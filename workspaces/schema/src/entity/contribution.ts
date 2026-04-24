import * as v from "valibot";

export const DailyContributions = v.object({
	date: v.pipe(v.string(), v.isoDate()),
	rate: v.number(),
});
export type DailyContributions = v.InferOutput<typeof DailyContributions>;

export const WeeklyContributions = v.array(DailyContributions);
export type WeeklyContributions = v.InferOutput<typeof WeeklyContributions>;

export const Contributions = v.array(WeeklyContributions);
export type Contributions = v.InferOutput<typeof Contributions>;
