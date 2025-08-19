import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "react-feather";
import { css } from "styled-system/css";
import { ButtonLike } from "../button-like";
import { IconButton } from "../icon-button";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	pageSize: number;
	onPageSizeChange: (size: number) => void;
	totalItems: number;
	isLoading?: boolean;
}

export const Pagination = ({
	currentPage,
	totalPages,
	onPageChange,
	pageSize,
	onPageSizeChange,
	totalItems,
	isLoading = false,
}: PaginationProps) => {
	// Generate page numbers to display
	const getVisiblePages = () => {
		const pages: (number | "ellipsis")[] = [];
		const maxVisiblePages = 5;
		
		if (totalPages <= maxVisiblePages) {
			// Show all pages if total is small
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);
			
			if (currentPage <= 3) {
				// Show pages 2, 3, 4 and ellipsis
				for (let i = 2; i <= 4; i++) {
					pages.push(i);
				}
				if (totalPages > 4) {
					pages.push("ellipsis");
				}
			} else if (currentPage >= totalPages - 2) {
				// Show ellipsis and last 3 pages
				if (totalPages > 4) {
					pages.push("ellipsis");
				}
				for (let i = totalPages - 3; i <= totalPages - 1; i++) {
					if (i > 1) pages.push(i);
				}
			} else {
				// Show ellipsis, current page area, ellipsis
				pages.push("ellipsis");
				for (let i = currentPage - 1; i <= currentPage + 1; i++) {
					pages.push(i);
				}
				pages.push("ellipsis");
			}
			
			// Always show last page
			if (totalPages > 1) {
				pages.push(totalPages);
			}
		}
		
		return pages;
	};

	const visiblePages = getVisiblePages();
	const startItem = (currentPage - 1) * pageSize + 1;
	const endItem = Math.min(currentPage * pageSize, totalItems);

	if (totalPages <= 1) return null;

	return (
		<div
			className={css({
				display: "flex",
				flexDirection: "column",
				gap: 4,
				alignItems: "center",
				marginTop: 6,
			})}
		>
			{/* Items info */}
			<div
				className={css({
					fontSize: "sm",
					color: "gray.600",
					textAlign: "center",
				})}
			>
				{totalItems > 0 ? (
					<>
						<span className={css({ fontWeight: "semibold" })}>
							{startItem}-{endItem}
						</span>{" "}
						/ {totalItems}件を表示
					</>
				) : (
					"0件"
				)}
			</div>

			{/* Pagination controls */}
			<div
				className={css({
					display: "flex",
					alignItems: "center",
					gap: 2,
					flexWrap: "wrap",
					justifyContent: "center",
				})}
			>
				{/* First page button */}
				<IconButton
					type="button"
					label="最初のページ"
					disabled={currentPage === 1 || isLoading}
					onClick={() => onPageChange(1)}
					variant="border"
				>
					<ChevronsLeft size={16} />
				</IconButton>

				{/* Previous page button */}
				<IconButton
					type="button"
					label="前のページ"
					disabled={currentPage === 1 || isLoading}
					onClick={() => onPageChange(currentPage - 1)}
					variant="border"
				>
					<ChevronLeft size={16} />
				</IconButton>

				{/* Page numbers */}
				<div
					className={css({
						display: "flex",
						gap: 1,
						alignItems: "center",
					})}
				>
					{visiblePages.map((page, index) => (
						<div key={index}>
							{page === "ellipsis" ? (
								<span
									className={css({
										color: "gray.400",
										fontSize: "sm",
										padding: "0 8px",
									})}
								>
									...
								</span>
							) : (
								<button
									type="button"
									disabled={isLoading}
									onClick={() => onPageChange(page)}
									className={css({
										display: "inline-flex",
										alignItems: "center",
										justifyContent: "center",
										width: 8,
										height: 8,
										borderRadius: 4,
										fontSize: "sm",
										fontWeight: "medium",
										border: "1px solid",
										cursor: "pointer",
										transition: "all",
										backgroundColor:
											page === currentPage ? "green.600" : "transparent",
										color: page === currentPage ? "white" : "gray.600",
										borderColor:
											page === currentPage ? "green.600" : "gray.300",
										_hover:
											page !== currentPage
												? {
													backgroundColor: "gray.50",
													borderColor: "gray.400",
												}
												: {},
										_disabled: {
											opacity: 0.5,
											cursor: "not-allowed",
										},
									})}
									aria-label={`ページ ${page}`}
									aria-current={page === currentPage ? "page" : undefined}
								>
									{page}
								</button>
							)}
						</div>
					))}
				</div>

				{/* Next page button */}
				<IconButton
					type="button"
					label="次のページ"
					disabled={currentPage === totalPages || isLoading}
					onClick={() => onPageChange(currentPage + 1)}
					variant="border"
				>
					<ChevronRight size={16} />
				</IconButton>

				{/* Last page button */}
				<IconButton
					type="button"
					label="最後のページ"
					disabled={currentPage === totalPages || isLoading}
					onClick={() => onPageChange(totalPages)}
					variant="border"
				>
					<ChevronsRight size={16} />
				</IconButton>
			</div>

			{/* Page size selector */}
			<div
				className={css({
					display: "flex",
					alignItems: "center",
					gap: 2,
					fontSize: "sm",
					color: "gray.600",
				})}
			>
				<span>表示件数:</span>
				<select
					value={pageSize}
					onChange={(e) => onPageSizeChange(Number(e.target.value))}
					disabled={isLoading}
					className={css({
						padding: "4px 8px",
						borderRadius: 4,
						border: "1px solid",
						borderColor: "gray.300",
						fontSize: "sm",
						backgroundColor: "white",
						cursor: "pointer",
						_disabled: {
							opacity: 0.5,
							cursor: "not-allowed",
						},
					})}
					aria-label="表示件数を選択"
				>
					<option value={5}>5件</option>
					<option value={10}>10件</option>
					<option value={20}>20件</option>
					<option value={50}>50件</option>
				</select>
			</div>
		</div>
	);
};