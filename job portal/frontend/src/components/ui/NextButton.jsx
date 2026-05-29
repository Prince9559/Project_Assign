import React from "react";
import Button from "./Button";

export default function NextButton({
  loading = false,
  disabled = false,
  children = "Next",
  className = "",
  ...props
}) {
  return (
    <Button
      type="button"
      variant="primary"
      loading={loading}
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}