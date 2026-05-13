import { isOutsideGrade } from "@idp/schema/entity/grade";
import type { User } from "@idp/schema/entity/user";

type ExportableUser = Pick<User, "realName" | "studentId" | "grade">;

export const copyMembersTsv = (users: ExportableUser[]) => {
	const rows = [
		["学籍番号", "氏名"],
		...users
			.filter(
				(user) => user.studentId && user.grade && !isOutsideGrade(user.grade),
			)
			.map((user) => [user.studentId ?? "", user.realName ?? ""]),
	];
	const tsv = rows.map((row) => row.join("\t")).join("\n");
	if (!navigator.clipboard?.writeText) {
		throw new Error(
			"クリップボードへのアクセスがサポートされていません。最新版のブラウザで実行してください。",
		);
	}
	return navigator.clipboard.writeText(tsv);
};
