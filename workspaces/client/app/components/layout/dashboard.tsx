import { Outlet } from "react-router";
import { css } from "styled-system/css";
import { Sidebar } from "./internal/sidebar";

export default function Dashboard() {
	return (
		<div className={css({ display: "flex", height: "100%" })}>
			<Sidebar />
			<div
				className={css({
					flex: 1,
				})}
			>
				<Outlet />
			</div>
		</div>
	);
}
