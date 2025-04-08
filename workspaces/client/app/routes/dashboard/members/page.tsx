import { Link } from "react-router";
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
					gap: 8,
				})}
			>
				{filteredMembers.map((user) =>
					user.initializedAt ? (
						<Link
							key={user.id}
							to={`/members/${user.displayId}`}
							className={css({
								cursor: "pointer",
								borderRadius: "xl",
								padding: 2,
								transition: "background",
								_hover: {
									backgroundColor: "gray.100",
								},
							})}
						>
							<MemberCard
								key={user.id}
								id={user.id}
								displayName={user.displayName}
								realName={user.realName}
								displayId={user.displayId}
								profileImageURL={user.profileImageURL}
								grade={user.grade}
								initialized={true}
								roles={user.roles}
								shrinkRoles
							/>
						</Link>
					) : (
						<MemberCard
							key={user.id}
							id={user.id}
							displayName={user.displayName}
							realName={user.realName}
							displayId={user.displayId}
							profileImageURL={user.profileImageURL}
							grade={user.grade}
							initialized={false}
							roles={user.roles}
						/>
					),
				)}
			</div>
		</div>
	);
}
