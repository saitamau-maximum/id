import { css } from "styled-system/css";

export default function Settings() {
    return (
        <div>
            <div
                className={css({
                    marginBottom: 8,
                })}
            >
                <h1
                    className={css({
                        fontSize: "4xl",
                        fontWeight: "bold",
                        color: "gray.600",
                    })}
                >
                    Settings
                </h1>
                <span className={css({ color: "gray.500", fontSize: "md" })}>
                    プロフィール情報を変更することができます
                </span>
            </div>
            <div
                className={css({
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                })}
            >
            </div>
        </div>
    );
}
