import React from "react";

export default function InterviewsPanel({ interviews = [] }) {
  if (!interviews?.length) return null;

  return (
    <div className="mt-4 space-y-2">
      <h4 className="text-xs font-extrabold tracking-wider text-gray-500 uppercase">
        All Interviews
      </h4>

      <div className="space-y-2">
        {interviews.map((interview, idx) => (
          <div
            key={interview?.id || idx}
            className="p-3 border border-gray-100 rounded-lg bg-gray-50 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-extrabold text-[#1e1e2d] text-sm truncate">
                  {interview?.name || "Interview"}
                </div>
                {interview?.message ? (
                  <div className="text-xs font-medium text-gray-500 mt-0.5">
                    {interview.message}
                  </div>
                ) : null}
              </div>

              {interview?.status ? (
                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#1DB32F]/10 text-[#1DB32F] uppercase tracking-wide">
                  {interview.status}
                </span>
              ) : null}
            </div>

            <div className="mt-2.5 text-xs font-medium text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
              {interview?.date ? (
                <div>Date: {new Date(interview.date).toLocaleDateString()}</div>
              ) : null}

              {(interview?.startTime || interview?.endTime) && (
                <div>
                  Time: {interview?.startTime || "--"} - {interview?.endTime || "--"}
                </div>
              )}

              {interview?.videoLink ? (
                <a
                  href={interview.videoLink}
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
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Join Meeting
                </a>
              ) : null}

              {interview?.location ? <div>Location: {interview.location}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}