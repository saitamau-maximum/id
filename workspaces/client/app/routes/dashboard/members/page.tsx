import { ROLE_BY_ID } from "node_modules/@idp/server/dist/constants/role";
import { useId } from "react";
import { Link } from "react-router";
import { css } from "styled-system/css";
import { ProfileCard } from "~/components/feature/user/profile-card";
import { Form } from "~/components/ui/form";
import { Select } from "~/components/ui/form/select";
import { GRADE } from "~/constant";
import { DashboardHeader } from "../internal/components/dashboard-title";
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

	const keywordInputId = useId();

	if (!data) {
		return null;
	}

	return (
		<div>
			<DashboardHeader
				title="Members"
				subtitle="Maximum IDPに登録されているメンバーの一覧です"
			/>
			<div
				className={css({
					backgroundColor: "gray.50",
					padding: 4,
					borderRadius: "xl",
					marginBottom: 4,
					display: "flex",
					flexDirection: "column",
					gap: 4,
				})}
			>
				<Form.FieldSet>
					<label htmlFor={keywordInputId}>
						<Form.LabelText>キーワードで絞り込む</Form.LabelText>
					</label>
					<Form.Input
						id={keywordInputId}
						value={filter.keyword}
						onChange={handleKeywordChange}
						placeholder="名前、IDで検索"
					/>
				</Form.FieldSet>
				<Form.FieldSet>
					<p
						className={css({
							fontSize: "md",
							color: "gray.600",
						})}
					>
						<Form.LabelText>学年で絞り込む</Form.LabelText>
					</p>
					<div
						className={css({
							display: "flex",
							gap: "token(spacing.2) token(spacing.4)",
							flexWrap: "wrap",
						})}
					>
						{GRADE.map((grade) => (
							<div
								key={grade.label}
								className={css({
									display: "flex",
									flexDirection: "column",
									gap: "token(spacing.2)",
								})}
							>
								<Form.LabelText>{grade.label}</Form.LabelText>
								<Form.SelectGroup>
									{grade.identifier.map((id) => (
										<Select
											key={id}
											value={id}
											label={id}
											checked={filter.selectedGrades.includes(id)}
											onChange={handleGradeSelectChange}
										/>
									))}
								</Form.SelectGroup>
							</div>
						))}
					</div>
				</Form.FieldSet>
				<Form.FieldSet>
					<p
						className={css({
							fontSize: "md",
							color: "gray.600",
						})}
					>
						<Form.LabelText>ロールで絞り込む</Form.LabelText>
					</p>
					<div
						className={css({
							display: "flex",
							gap: "token(spacing.2) token(spacing.4)",
							flexWrap: "wrap",
						})}
					>
						<Form.SelectGroup>
							{Object.entries(ROLE_BY_ID).map(([id, role]) => (
								<Select
									key={id}
									value={id}
									label={role.name}
									checked={filter.selectedRoleIds.includes(Number(id))}
									onChange={handleRoleSelectChange}
								/>
							))}
						</Form.SelectGroup>
					</div>
				</Form.FieldSet>
			</div>
			<div
				className={css({
					display: "flex",
					flexWrap: "wrap",
					gap: 8,
				})}
			>
				{filteredMembers.map((user) =>
					user.initialized ? (
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
							<ProfileCard
								key={user.id}
								displayName={user.displayName}
								realName={user.realName}
								displayId={user.displayId}
								profileImageURL={user.profileImageURL}
								grade={user.grade}
								initialized={user.initialized}
								roles={user.roles}
							/>
						</Link>
					) : (
						<ProfileCard
							key={user.id}
							displayName={user.displayName}
							realName={user.realName}
							displayId={user.displayId}
							profileImageURL={user.profileImageURL}
							grade={user.grade}
							initialized={user.initialized}
							roles={user.roles}
						/>
					),
				)}
			</div>
		</div>
	);
}
