import { useCallback, useState } from "react";
import { createCallable } from "react-call";
import { css } from "styled-system/css";
import * as v from "valibot";
import { ButtonLike } from "~/components/ui/button-like";
import { Dialog } from "~/components/ui/dialog";
import { Form } from "~/components/ui/form";
import type { CertificationRequestParams } from "~/repository/certification";
import type { Certification } from "~/types/certification";

interface Props {
	certifications: Certification[];
}

type Payload =
	| {
			type: "success";
			request: CertificationRequestParams;
	  }
	| {
			type: "dismiss";
	  };

export const CertificationRequest = createCallable<Props, Payload>(
	({ call, certifications }) => {
		const [selectedCertification, setSelectedCertification] =
			useState<Certification | null>(null);
		const [certifiedIn, setCertifiedIn] = useState<number | null>(null);
		const [validationError, setValidationError] = useState<string | null>(null);

		const handleSendRequest = useCallback(() => {
			const CertificationRequestSchema = v.object({
				certificationId: v.pipe(
					v.string("資格・試験を選択してください"),
					v.custom(
						(value) => certifications.some((c) => c.id === value),
						"選択された資格・試験は申請できません",
					),
				),
				certifiedIn: v.pipe(
					v.number("取得年を入力してください"),
					v.minValue(2000, "2000 年以降の年を入力してください"),
					v.maxValue(
						new Date().getFullYear(),
						"今年以前の年を入力してください",
					),
				),
			});

			const validationCheck = v.safeParse(CertificationRequestSchema, {
				certificationId: selectedCertification?.id,
				certifiedIn,
			});
			if (!validationCheck.success) {
				setValidationError(validationCheck.issues[0].message);
				return;
			}

			call.end({
				type: "success",
				request: {
					certificationId: validationCheck.output.certificationId,
					certifiedIn: validationCheck.output.certifiedIn,
				},
			});
		}, [call, selectedCertification, certifiedIn, certifications]);

		const handleUpdateRadio = useCallback(
			(id: string) => {
				setSelectedCertification(
					certifications.find((c) => c.id === id) ?? null,
				);
			},
			[certifications],
		);

		return (
			<Dialog
				title="資格・試験の情報を申請"
				isOpen
				isDismissable
				onOpenChange={(isOpen) => {
					if (!isOpen) call.end({ type: "dismiss" });
				}}
			>
				<div
					className={css({
						display: "grid",
						gap: 4,
						maxWidth: 800,
						width: "100%",
					})}
				>
					<div
						className={css({
							display: "grid",
							gap: 4,
							maxHeight: "30vh",
							overflowY: "auto",
						})}
					>
						<Form.RadioGroup>
							{certifications.map((cert) => (
								<Form.Radio
									key={cert.id}
									value={cert.id}
									label={cert.title ?? ""}
									onChange={() => handleUpdateRadio(cert.id)}
									name="certification"
								/>
							))}
						</Form.RadioGroup>
					</div>
					<Form.Field.WithLabel label="詳細情報">
						{() =>
							selectedCertification ? (
								<div className={css({ maxHeight: "30vh", overflowY: "auto" })}>
									<p
										className={css({
											color: "gray.500",
											fontSize: "sm",
											marginBottom: 4,
										})}
									>
										{selectedCertification.description ||
											"説明書きはありません"}
									</p>
									<Form.Field.TextInput
										label="取得年 (合格発表の年を記入、年度ではない)"
										placeholder={new Date().getFullYear().toString()}
										required
										onChange={(e) =>
											setCertifiedIn(Number.parseInt(e.target.value, 10))
										}
									/>
								</div>
							) : (
								<p
									className={css({
										color: "gray.500",
										textAlign: "center",
										fontSize: "sm",
									})}
								>
									まずは資格・試験を選択してください
								</p>
							)
						}
					</Form.Field.WithLabel>
					{validationError && (
						<p
							className={css({
								color: "red.500",
								textAlign: "center",
								fontSize: "sm",
							})}
						>
							{validationError}
						</p>
					)}
					<div
						className={css({
							display: "flex",
							justifyContent: "center",
							gap: 4,
							gridColumn: "1 / -1",
						})}
					>
						<button type="button" onClick={() => call.end({ type: "dismiss" })}>
							<ButtonLike variant="secondary">キャンセル</ButtonLike>
						</button>
						<button type="button" onClick={handleSendRequest}>
							<ButtonLike>送信</ButtonLike>
						</button>
					</div>
				</div>
			</Dialog>
		);
	},
);
