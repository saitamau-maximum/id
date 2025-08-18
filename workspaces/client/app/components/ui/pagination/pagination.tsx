import { ChevronLeft, ChevronRight } from "react-feather";
import { css } from "styled-system/css";
import { ButtonLike } from "~/components/ui/button-like";
import { IconButton } from "~/components/ui/icon-button";

export interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	showFirstLast?: boolean;
	maxVisiblePages?: number;
}

export const Pagination = ({
	currentPage,
	totalPages,
	onPageChange,
	showFirstLast = true,
	maxVisiblePages = 5,
}: PaginationProps) => {
	if (totalPages <= 1) return null;

	const getVisiblePages = () => {
		const half = Math.floor(maxVisiblePages / 2);
		let start = Math.max(1, currentPage - half);
		let end = Math.min(totalPages, start + maxVisiblePages - 1);

		if (end - start + 1 < maxVisiblePages) {
			start = Math.max(1, end - maxVisiblePages + 1);
		}

		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	};

	const visiblePages = getVisiblePages();
	const isFirstPage = currentPage === 1;
	const isLastPage = currentPage === totalPages;

	return (
		<div
			className={css({
				display: "flex",
				alignItems: "center",
				gap: 2,
				justifyContent: "center",
				marginTop: 4,
			})}
		>
			{/* First page button */}
			{showFirstLast && !isFirstPage && (
				<button
					type="button"
					onClick={() => onPageChange(1)}
					className={css({
						padding: 2,
						minWidth: 8,
						height: 8,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						border: "1px solid",
						borderColor: "gray.300",
						backgroundColor: "white",
						color: "gray.700",
						borderRadius: "md",
						fontSize: "sm",
						cursor: "pointer",
						_hover: {
							backgroundColor: "gray.50",
						},
					})}
				>
					1
				</button>
			)}

			{/* Ellipsis before visible pages */}
			{visiblePages[0] > 2 && (
				<span
					className={css({
						padding: 2,
						color: "gray.500",
						fontSize: "sm",
					})}
				>
					...
				</span>
			)}

			{/* Previous button */}
			<IconButton
				type="button"
				label="前のページ"
				onClick={() => onPageChange(currentPage - 1)}
				disabled={isFirstPage}
			>
				<ChevronLeft size={16} />
			</IconButton>

			{/* Page numbers */}
			{visiblePages.map((page) => (
				<button
					key={page}
					type="button"
					onClick={() => onPageChange(page)}
					className={css({
						padding: 2,
						minWidth: 8,
						height: 8,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						border: "1px solid",
						borderColor: page === currentPage ? "blue.500" : "gray.300",
						backgroundColor: page === currentPage ? "blue.500" : "white",
						color: page === currentPage ? "white" : "gray.700",
						borderRadius: "md",
						fontSize: "sm",
						cursor: "pointer",
						fontWeight: page === currentPage ? "bold" : "normal",
						_hover: {
							backgroundColor: page === currentPage ? "blue.600" : "gray.50",
						},
					})}
				>
					{page}
				</button>
			))}

			{/* Next button */}
			<IconButton
				type="button"
				label="次のページ"
				onClick={() => onPageChange(currentPage + 1)}
				disabled={isLastPage}
			>
				<ChevronRight size={16} />
			</IconButton>

			{/* Ellipsis after visible pages */}
			{visiblePages[visiblePages.length - 1] < totalPages - 1 && (
				<span
					className={css({
						padding: 2,
						color: "gray.500",
						fontSize: "sm",
					})}
				>
					...
				</span>
			)}

			{/* Last page button */}
			{showFirstLast && !isLastPage && (
				<button
					type="button"
					onClick={() => onPageChange(totalPages)}
					className={css({
						padding: 2,
						minWidth: 8,
						height: 8,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						border: "1px solid",
						borderColor: "gray.300",
						backgroundColor: "white",
						color: "gray.700",
						borderRadius: "md",
						fontSize: "sm",
						cursor: "pointer",
						_hover: {
							backgroundColor: "gray.50",
						},
					})}
				>
					{totalPages}
				</button>
			)}
		</div>
	);
};