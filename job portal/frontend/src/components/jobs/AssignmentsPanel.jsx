import React from "react";

export default function AssignmentsPanel({
  assignments = [],
  upcomingAssignmentId = null,
}) {
  if (!assignments?.length) return null;

  return (
    <div className="mt-4 space-y-2">
      <h4 className="text-xs font-extrabold tracking-wider text-gray-500 uppercase">
        All Assignments
      </h4>

      <div className="space-y-2">
        {assignments.map((assignment, idx) => {
          const isCurrent =
            upcomingAssignmentId && assignment?.id === upcomingAssignmentId;

          return (
            <div
              key={assignment?.id || idx}
              className="p-3 border border-gray-100 rounded-lg bg-gray-50 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-extrabold text-[#1e1e2d] text-sm">
                    Assignment {idx + 1}
                  </div>
                  {assignment?.message ? (
                    <div className="text-xs font-medium text-gray-500 mt-0.5">
                      {assignment.message}
                    </div>
                  ) : null}
                </div>

                {isCurrent ? (
                  <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#9bc87c]/10 text-[#1e1e2d] border border-[#9bc87c]/30 uppercase tracking-wide">
                    Current
                  </span>
                ) : null}
              </div>

              <div className="mt-2.5 text-xs font-medium text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                {assignment?.deadline ? (
                  <div>
                    Deadline: {new Date(assignment.deadline).toLocaleDateString()}
                  </div>
                ) : null}

                <div>Status: {assignment?.status || "Pending"}</div>

                {assignment?.assignment_url ? (
                  <a
                    href={assignment.assignment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[#9bc87c] hover:text-[#8ab76b] hover:underline"
                  >
                    <svg
                      className="w-3.5 h-3.5 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {assignment?.status === "submitted"
                      ? "View Submission"
                      : "View Assignment"}
                  </a>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}