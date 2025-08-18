import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "react-feather";
import { css } from "styled-system/css";
import { IconButton } from "../icon-button";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	maxVisiblePages?: number;
}

export const Pagination = ({
	currentPage,
	totalPages,
	onPageChange,
	maxVisiblePages = 5,
}: PaginationProps) => {
	if (totalPages <= 1) return null;

	const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
	const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
	const adjustedStartPage = Math.max(1, endPage - maxVisiblePages + 1);

	const pageNumbers = [];
	for (let i = adjustedStartPage; i <= endPage; i++) {
		pageNumbers.push(i);
	}

	return (
		<div
			className={css({
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				gap: 2,
				marginTop: 4,
			})}
		>
			<IconButton
				label="最初のページ"
				onClick={() => onPageChange(1)}
				disabled={currentPage === 1}
			>
				<ChevronsLeft size={16} />
			</IconButton>

			<IconButton
				label="前のページ"
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
			>
				<ChevronLeft size={16} />
			</IconButton>

			{adjustedStartPage > 1 && (
				<>
					<PageButton
						page={1}
						currentPage={currentPage}
						onPageChange={onPageChange}
					/>
					{adjustedStartPage > 2 && (
						<span className={css({ padding: 2 })}>...</span>
					)}
				</>
			)}

			{pageNumbers.map((page) => (
				<PageButton
					key={page}
					page={page}
					currentPage={currentPage}
					onPageChange={onPageChange}
				/>
			))}

			{endPage < totalPages && (
				<>
					{endPage < totalPages - 1 && (
						<span className={css({ padding: 2 })}>...</span>
					)}
					<PageButton
						page={totalPages}
						currentPage={currentPage}
						onPageChange={onPageChange}
					/>
				</>
			)}

			<IconButton
				label="次のページ"
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
			>
				<ChevronRight size={16} />
			</IconButton>

			<IconButton
				label="最後のページ"
				onClick={() => onPageChange(totalPages)}
				disabled={currentPage === totalPages}
			>
				<ChevronsRight size={16} />
			</IconButton>
		</div>
	);
};

interface PageButtonProps {
	page: number;
	currentPage: number;
	onPageChange: (page: number) => void;
}

const PageButton = ({ page, currentPage, onPageChange }: PageButtonProps) => {
	const isActive = page === currentPage;
	
	return (
		<button
			type="button"
			onClick={() => onPageChange(page)}
			className={css({
				padding: 2,
				minWidth: 8,
				minHeight: 8,
				borderRadius: "md",
				border: "1px solid",
				borderColor: isActive ? "blue.500" : "gray.300",
				backgroundColor: isActive ? "blue.500" : "white",
				color: isActive ? "white" : "gray.700",
				fontSize: "sm",
				cursor: "pointer",
				transition: "all 0.2s",
				_hover: {
					backgroundColor: isActive ? "blue.600" : "gray.100",
					borderColor: isActive ? "blue.600" : "gray.400",
				},
				_disabled: {
					cursor: "not-allowed",
					opacity: 0.5,
				},
			})}
		>
			{page}
		</button>
	);
};