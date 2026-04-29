import type { User } from "@idp/schema/entity/user";
import { OUTSIDE_GRADE } from "~/constant";

type ExportableUser = Pick<User, "realName" | "studentId" | "grade">;

export const copyMembersTsv = (users: ExportableUser[]) => {
	const rows = [
		["学籍番号", "氏名"],
		...users
			.filter(
				(user) =>
					user.studentId && user.grade && !OUTSIDE_GRADE.includes(user.grade),
			)
			.map((user) => [user.studentId ?? "", user.realName ?? ""]),
	];
	const tsv = rows.map((row) => row.join("\t")).join("\n");
	return navigator.clipboard.writeText(tsv);
};
