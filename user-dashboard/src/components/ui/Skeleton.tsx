import React from "react";
import styles from "./skeleton.module.css";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  borderRadius,
  style,
}) => {
  return (
    <div
      className={`${styles.skeleton} ${className || ""}`}
      style={{
        width: width,
        height: height,
        borderRadius: borderRadius,
        ...style,
      }}
    />
  );
};

export default Skeleton;
