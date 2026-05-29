import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import EditTextButton from "../../components/jobs/EditTextButton";
import SaveTextButton from "../../components/jobs/SaveTextButton";
import CancelTextButton from "../../components/jobs/CancelTextButton";
import CollapseToggleButton from "../../components/jobs/CollapseToggleButton";

export default function CollapsibleSectionHeader({
  title,
  percentage = 0,
  isComplete = false,

  // edit controls
  showEditControls = false,
  isEditing = false,
  isSaving = false,
  onEditClick,
  onSaveClick,
  onCancelClick,

  // toggle
  expanded = false,
  onToggle,
  className = "",
}) {
  const pct = Math.min(100, Math.max(0, Number(percentage) || 0));

  return (
    <div
      className={[
        "flex items-center justify-between gap-3",
        "p-4 cursor-pointer",
        "bg-white hover:bg-gray-50 transition-colors",
        className,
      ].join(" ")}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onToggle?.(e);
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-2 min-w-0">
        <h3 className="text-sm sm:text-base font-extrabold text-[#1e1e2d] truncate">
          {title}
        </h3>

        {isComplete ? (
          <FaCheckCircle className="shrink-0 text-[#1DB32F]" size={16} />
        ) : null}
      </div>

      {/* Right cluster */}
      <div
        className="flex items-center gap-3 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-28 h-2 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
            <div
              className={[
                "h-full rounded-full transition-all duration-500",
                isComplete
                  ? "bg-gradient-to-r from-[#1DB32F] to-[#00C950]"
                  : "bg-gradient-to-r from-[#9BC87C] to-[#8ab76b]",
              ].join(" ")}
              style={{ width: `${pct}%` }}
            />
          </div>

          <span
            className={[
              "text-xs font-extrabold tabular-nums",
              isComplete ? "text-[#1DB32F]" : "text-[#9BC87C]",
            ].join(" ")}
          >
            {pct}%
          </span>
        </div>

        {/* Edit / Save / Cancel */}
        {showEditControls ? (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <SaveTextButton loading={isSaving} onClick={onSaveClick} />
                <CancelTextButton onClick={onCancelClick} />
              </>
            ) : (
              <EditTextButton onClick={onEditClick} />
            )}
          </div>
        ) : null}

        {/* Toggle */}
        <CollapseToggleButton
          expanded={expanded}
          onClick={onToggle}
          className="w-9 h-9"
        />
      </div>
    </div>
  );
}