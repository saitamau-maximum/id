import type { Member } from "@idp/schema/entity/member";
import { Role } from "@idp/schema/entity/role";
import { useCallback, useMemo, useState } from "react";
import * as v from "valibot";

export interface Filter {
	keyword: string;
	selectedGrades: string[];
	selectedRoleIds: Role["id"][];
}

const katakanaToHiragana = (str: string) => {
	return str.replace(/[\u30a1-\u30f6]/g, (match) =>
		String.fromCharCode(match.charCodeAt(0) - 0x60),
	);
};

export function useMembersFilter(
	members: Omit<Member, "certifications" | "bio">[],
) {
	const [filter, setFilter] = useState<Filter>({
		keyword: "",
		selectedGrades: [],
		selectedRoleIds: [],
	});

	const filteredMembers = useMemo(() => {
		return members.filter((member) => {
			if (filter.keyword) {
				if (
					!member.displayName
						?.toLowerCase()
						.includes(filter.keyword.toLowerCase()) &&
					!member.realName
						?.toLowerCase()
						.includes(filter.keyword.toLowerCase()) &&
					!member.realNameKana
						?.toLowerCase()
						.includes(filter.keyword.toLowerCase()) &&
					!katakanaToHiragana(member.realNameKana ?? "")
						.toLowerCase()
						.includes(filter.keyword.toLowerCase()) &&
					!member.displayId
						?.toLowerCase()
						.includes(filter.keyword.toLowerCase())
				)
					return false;
			}

			if (filter.selectedGrades.length > 0) {
				if (!filter.selectedGrades.includes(member.grade ?? "")) {
					return false;
				}
			}

			if (filter.selectedRoleIds.length > 0) {
				if (
					!filter.selectedRoleIds.some((id) =>
						member.roles.some((role) => role.id === id),
					)
				) {
					return false;
				}
			}

			return true;
		});
	}, [members, filter]);

	const handleGradeSelectChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const value = event.target.value;
			setFilter((prev) => {
				if (prev.selectedGrades.includes(value)) {
					return {
						...prev,
						selectedGrades: prev.selectedGrades.filter((id) => id !== value),
					};
				}
				return {
					...prev,
					selectedGrades: [...prev.selectedGrades, value],
				};
			});
		},
		[],
	);

	const handleRoleSelectChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const value = v.parse(Role.entries.id, Number(event.target.value));
			setFilter((prev) => {
				if (prev.selectedRoleIds.includes(value)) {
					return {
						...prev,
						selectedRoleIds: prev.selectedRoleIds.filter((id) => id !== value),
					};
				}
				return {
					...prev,
					selectedRoleIds: [...prev.selectedRoleIds, value],
				};
			});
		},
		[],
	);

	const handleKeywordChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setFilter((prev) => ({
				...prev,
				keyword: event.target.value,
			}));
		},
		[],
	);

	return {
		filter,
		filteredMembers,
		handleGradeSelectChange,
		handleRoleSelectChange,
		handleKeywordChange,
	};
}
