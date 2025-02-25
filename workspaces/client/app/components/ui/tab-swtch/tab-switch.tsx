import type { ComponentProps, JSX } from "react";
import { css, cx } from "styled-system/css";
import { TabItem } from "./tab-item";

type TabSwitchProps = {
    className?: ComponentProps<"div">["className"];
    checked: boolean;
    onChange: () => void;
    onText: string;
    offText: string;
};

export const TabSwitch = ({
    className,
    checked,
    onChange,
    onText,
    offText,
}: TabSwitchProps): JSX.Element => {
    return (
        <button
            type="button"
            onClick={onChange}
            className={cx(
                css({
                    display: "flex",
                    gap: "4px",
                    padding: "4px",
                    alignItems: "center",
                    backgroundColor: "gray.200",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                }),
                className
            )}
        >
            <TabItem active={!checked} text={offText} />
            <TabItem active={checked} text={onText} />
        </button>
    );
};
