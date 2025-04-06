import * as v from "valibot";

export const MaxLines = (maxLines: number, error: string) =>
	v.custom<string>((input) => {
		if (typeof input !== "string") return false;
		const lines = input.split("\n");
		if (lines.length > maxLines) return false;
		return true;
	}, error);
