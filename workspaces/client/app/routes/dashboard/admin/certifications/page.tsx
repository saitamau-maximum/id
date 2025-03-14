import { CertificationCreator } from "./internal/components/certification-creator";
import { CertificationRequestList } from "./internal/components/request-list";

export default function AdminCertifications() {
	return (
		<div>
			<CertificationCreator />
			<CertificationRequestList />
		</div>
	);
}
