import React from "react";
import Select from "react-select";

export default function SortBySelect({
  options = [],
  value,
  onChange,
  styles,
  menuPortalTarget,
  className = "text-sm",
  classNamePrefix = "select",
}) {
  return (
    <Select
      inputId="sort-by"
      isSearchable={false}
      options={options}
      value={value}
      onChange={onChange}
      className={className}
      classNamePrefix={classNamePrefix}
      styles={styles}
      menuPortalTarget={menuPortalTarget}
      menuPosition="fixed"
    />
  );
}