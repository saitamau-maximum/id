import { CertificationCreator } from "./internal/components/certification-creator";
import { CertificationTable } from "./internal/components/certification-table";
import { CertificationRequestList } from "./internal/components/request-list";
import { useCertifications } from "./internal/hooks/use-certifications";

export default function AdminCertifications() {
	const { data: certifications } = useCertifications();

	return (
		<div>
			<CertificationRequestList certifications={certifications ?? []} />
			<CertificationCreator />
			<CertificationTable certifications={certifications ?? []} />
		</div>
	);
}
