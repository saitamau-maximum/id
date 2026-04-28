import type { User } from "@idp/schema/entity/user";

type ExportableUser = Pick<User, "realName" | "studentId">;

export const exportMembersTsv = (users: ExportableUser[]) => {
	const rows = [
		["学籍番号", "氏名"],
		...users.map((user) => [user.studentId ?? "", user.realName ?? ""]),
	];
	const tsv = rows.map((row) => row.join("\t")).join("\n");
	const blob = new Blob([tsv], { type: "text/tab-separated-values" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "members.tsv";
	a.click();
	URL.revokeObjectURL(url);
};
