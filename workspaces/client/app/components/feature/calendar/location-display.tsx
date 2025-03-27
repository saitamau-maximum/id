import { css } from "styled-system/css";
import { Document } from "~/components/ui/document";
import { useMarkdown } from "~/hooks/use-markdown";
import { useLocationDetail } from "~/routes/dashboard/calendar/hooks/use-location-detail";

interface Props {
	locationId: string;
}

export const LocationDisplay = ({ locationId }: Props) => {
	const { data: location } = useLocationDetail({ locationId });

	const { reactContent } = useMarkdown(location?.description);

	return (
		<div>
			<h2
				className={css({
					fontSize: "xl",
					fontWeight: "bold",
					marginBottom: 4,
					textAlign: "center",
				})}
			>
				{location?.name}
			</h2>
			{location ? (
				<Document>{reactContent}</Document>
			) : (
				"活動場所が見つかりませんでした"
			)}
		</div>
	);
};
