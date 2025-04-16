import { Role } from "@idp/schema/entity/role";
import { ROLE_BY_ID } from "node_modules/@idp/server/dist/constants/role";
import { useId } from "react";
import { css } from "styled-system/css";
import * as v from "valibot";
import { Form } from "~/components/ui/form";
import { GRADE } from "~/constant";
import type { Filter } from "../hooks/use-members-filter";

type Props = {
	filter: Filter;
	onKeywordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onGradeSelectChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onRoleSelectChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const FilterForm = ({
	filter,
	onKeywordChange: handleKeywordChange,
	onGradeSelectChange: handleGradeSelectChange,
	onRoleSelectChange: handleRoleSelectChange,
}: Props) => {
	const keywordInputId = useId();

	return (
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
									<Form.Select
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
							<Form.Select
								key={id}
								value={id}
								label={role.name}
								checked={filter.selectedRoleIds.includes(
									v.parse(Role.entries.id, Number(id)),
								)}
								onChange={handleRoleSelectChange}
							/>
						))}
					</Form.SelectGroup>
				</div>
			</Form.FieldSet>
		</div>
	);
};
