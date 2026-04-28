import type { User } from "@idp/schema/entity/user";

type ExportableUser = Pick<User, "realName" | "studentId">;

export const copyMembersTsv = (users: ExportableUser[]) => {
	const rows = [
		["学籍番号", "氏名"],
		...users
			.filter((user) => user.studentId)
			.map((user) => [user.studentId ?? "", user.realName ?? ""]),
	];
	const tsv = rows.map((row) => row.join("\t")).join("\n");
	return navigator.clipboard.writeText(tsv);
};
