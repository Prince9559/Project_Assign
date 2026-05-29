// src/components/EditableField.jsx
import React, { useState } from 'react';

const EditableField = ({
  value = "",
  onChange = () => {},
  placeholder = "Click to edit...",
  className = "",
  tag: Tag = "span",
  isTextArea = false,
  rows = 3
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onChange(localValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isTextArea) {
      e.preventDefault();
      handleBlur();
    }
  };

  if (isEditing) {
    if (isTextArea) {
      return (
        <textarea
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
          rows={rows}
          autoFocus
        />
      );
    }
    if (!isEditing) {
  return value ? (
    <Tag className={className}>{value}</Tag>
  ) : null; // ← Don't show placeholder in PDF/view mode
}
    return (
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`border-b-2 border-dashed border-blue-400 bg-transparent focus:outline-none focus:border-blue-600 ${className}`}
        autoFocus
      />
    );
  }

  return (
    <Tag
      onDoubleClick={handleDoubleClick}
      className={`${className} cursor-pointer hover:bg-blue-50 hover:bg-opacity-50 rounded px-1 transition-colors duration-200`}
      title="Double-click to edit"
    >
      {value || placeholder}
    </Tag>
  );
};

export default EditableField;