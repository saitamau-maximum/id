import type { MetaFunction } from "react-router";
import { CertificationCreator } from "./internal/components/certification-creator";
import { CertificationTable } from "./internal/components/certification-table";
import { CertificationRequestList } from "./internal/components/request-list";

export const meta: MetaFunction = () => {
	return [{ title: "資格・試験の管理 | Maximum IdP" }];
};
export default function AdminCertifications() {
	return (
		<div>
			<CertificationRequestList />
			<CertificationCreator />
			<CertificationTable />
		</div>
	);
}
