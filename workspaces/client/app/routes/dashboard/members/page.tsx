import { css } from "styled-system/css";
import { MemberCard } from "~/components/feature/user/member-card";
import { DashboardHeader } from "../internal/components/dashboard-title";
import { FilterForm } from "./internal/components/filter-form";
import { useMembers } from "./internal/hooks/use-members";
import { useMembersFilter } from "./internal/hooks/use-members-filter";

export default function Members() {
	const { data } = useMembers();
	const {
		filteredMembers,
		filter,
		handleGradeSelectChange,
		handleRoleSelectChange,
		handleKeywordChange,
	} = useMembersFilter(data ?? []);

	if (!data) {
		return null;
	}

	return (
		<div>
			<DashboardHeader
				title="Members"
				subtitle="Maximum IDPに登録されているメンバーの一覧です"
			/>
			<FilterForm
				filter={filter}
				onKeywordChange={handleKeywordChange}
				onGradeSelectChange={handleGradeSelectChange}
				onRoleSelectChange={handleRoleSelectChange}
			/>
			<div
				className={css({
					display: "flex",
					flexWrap: "wrap",
					gap: 4,
				})}
			>
				{filteredMembers.map((member) => (
					<MemberCard
						key={member.id}
						id={member.id}
						displayName={member.displayName}
						realName={member.realName}
						displayId={member.displayId}
						profileImageURL={member.profileImageURL}
						grade={member.grade}
						roles={member.roles}
					/>
				))}
			</div>
		</div>
	);
}
