import { cn } from "@/lib/utils";
import * as React from "react";

export interface ISpinProps {
  /* Size of the spinner */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  width?: number;
}

const sizes = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

export interface SpinProps
  extends React.HTMLAttributes<SVGSVGElement>,
    ISpinProps {}

export const Spinner = (props: SpinProps) => {
  const { size = "sm", width = 10, className, ...rest } = props;
  const classes = sizes[size];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      className={cn(classes, className, "animate-spin")}
      fill="none"
      viewBox="0 0 66 66"
      {...rest}
    >
      <circle
        cx="33"
        cy="33"
        fill="none"
        r="28"
        stroke="currentColor"
        strokeWidth={width}
        className="opacity-30"
      />
      <circle
        cx="33"
        cy="33"
        fill="none"
        r="28"
        stroke="currentColor"
        strokeDasharray="40, 134"
        strokeDashoffset="325"
        strokeLinecap="butt"
        strokeWidth={width}
        className="opacity-70"
      />
    </svg>
  );
};

export default Spinner;
