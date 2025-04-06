import { CertificationCreator } from "./internal/components/certification-creator";
import { CertificationTable } from "./internal/components/certification-table";
import { CertificationRequestList } from "./internal/components/request-list";

export default function AdminCertifications() {
	return (
		<div>
			<CertificationRequestList />
			<CertificationCreator />
			<CertificationTable />
		</div>
	);
}
