// // src/components/ProfileCompletionGuide.jsx
// import { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';

// const ProfileCompletionGuide = () => {
//   const [completionData, setCompletionData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Get token from Redux store
//   const token = useSelector((state) => state.auth.token); // adjust path if your slice is named differently

//   useEffect(() => {
//     if (!token) {
//       setError('User not authenticated');
//       setLoading(false);
//       return;
//     }

//     const fetchProfileCompletion = async () => {
//       try {
//         setLoading(true);
//         const res = await fetch(
//           `${import.meta.env.VITE_BASE_URL}/user-details/profile-completion?detailed=true`,
//           {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         if (!res.ok) {
//           const errorData = await res.json().catch(() => ({}));
//           throw new Error(errorData.message || 'Failed to load profile completion');
//         }

//         const result = await res.json();
//         if (result.success) {
//           setCompletionData(result.data);
//         } else {
//           throw new Error(result.message || 'Unexpected response format');
//         }
//       } catch (err) {
//         console.error('Error fetching profile completion:', err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfileCompletion();
//   }, [token]); // Re-fetch if token changes

//   if (loading) return <div className="py-8 text-center text-gray-600">Loading your profile...</div>;
//   if (error) return <div className="py-4 text-center text-red-500">⚠️ {error}</div>;
//   if (!completionData) return null;

//   const { profile_completion_percentage: percent, breakdown } = completionData;

//   const sections = Object.entries(breakdown).map(([name, data]) => ({
//     id: name,
//     ...data,
//   }));

//   const formatSectionName = (name) => {
//     return name
//       .replace(/_/g, ' ')
//       .replace(/\b\w/g, (l) => l.toUpperCase());
//   };

//   return (
//     <div className="max-w-3xl p-6 mx-auto bg-white shadow-md rounded-xl">
//       <h2 className="mb-2 text-2xl font-bold text-gray-800">Complete Your Profile</h2>
//       <p className="mb-6 text-gray-600">
//         A complete profile helps you get better visibility.
//       </p>

//       {/* Progress Bar */}
//       <div className="mb-8">
//         <div className="flex justify-between mb-1">
//           <span className="font-medium text-gray-700">Profile Completion</span>
//           <span className="font-bold text-indigo-600">{percent}%</span>
//         </div>
//         <div className="w-full h-3 bg-gray-200 rounded-full">
//           <div
//             className="h-3 transition-all duration-500 ease-out bg-indigo-600 rounded-full"
//             style={{ width: `${Math.min(100, percent)}%` }}
//           ></div>
//         </div>
//       </div>

//       {/* Checklist */}
//       <div className="space-y-5">
//         {sections.map((section) => {
//           const isCompleted = section.completed;
//           const hasMissing = section.missing && section.missing.length > 0;

//           return (
//             <div
//               key={section.id}
//               className={`border-l-4 pl-4 py-2 ${
//                 isCompleted
//                   ? 'border-green-500 bg-green-50'
//                   : 'border-yellow-500 bg-yellow-50'
//               }`}
//             >
//               <div className="flex items-start">
//                 <div className="mr-3 mt-0.5">
//                   {isCompleted ? (
//                     <svg
//                       className="w-5 h-5 text-green-600"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M5 13l4 4L19 7"
//                       />
//                     </svg>
//                   ) : (
//                     <div className="w-5 h-5 border-2 border-gray-400 rounded-full"></div>
//                   )}
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-gray-800">
//                     {formatSectionName(section.id)}{' '}
//                     <span className="ml-2 text-xs font-normal text-gray-500">
//                       ({section.weight}%)
//                     </span>
//                   </h3>

//                   {hasMissing && !isCompleted && (
//                     <ul className="pl-5 mt-2 space-y-1 text-sm text-gray-700 list-disc">
//                       {section.missing.map((item, idx) => (
//                         <li key={idx} className="capitalize">
//                           {item.replace(/_/g, ' ')}
//                         </li>
//                       ))}
//                     </ul>
//                   )}

//                   {(section.current_count !== undefined || section.target_count !== undefined) &&
//                     !isCompleted && (
//                       <p className="mt-1 text-sm text-gray-600">
//                         {section.current_count || 0} of {section.target_count} added
//                       </p>
//                     )}

//                   {section.not_applicable && (
//                     <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
//                       Not applicable
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <div className="mt-8 text-sm text-center text-gray-500">
//         Update your profile in settings to increase completion.
//       </div>
//     </div>
//   );
// };

// export default ProfileCompletionGuide;




































// src/components/ProfileCompletionGuide.jsx
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const ProfileCompletionGuide = () => {
  const [completionData, setCompletionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true); // ← New state for toggle

  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (!token) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    const fetchProfileCompletion = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/user-details/profile-completion?detailed=true`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to load profile completion');
        }

        const result = await res.json();
        if (result.success) {
          setCompletionData(result.data);
        } else {
          throw new Error(result.message || 'Unexpected response format');
        }
      } catch (err) {
        console.error('Error fetching profile completion:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileCompletion();
  }, [token]);

  if (loading) return <div className="py-8 text-center text-gray-600">Loading your profile...</div>;
  if (error) return <div className="py-4 text-center text-red-500">⚠️ {error}</div>;
  if (!completionData) return null;

  const { profile_completion_percentage: percent, breakdown } = completionData;

  const sections = Object.entries(breakdown).map(([name, data]) => ({
    id: name,
    ...data,
  }));

  const formatSectionName = (name) => {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div className="w-full p-6 mx-auto bg-white shadow-md rounded-xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Complete Your Profile</h2>
          <p className="mb-4 text-gray-600">
            A complete profile helps you get better visibility.
          </p>
        </div>

        {/* Toggle Arrow Button */}
        <button
          onClick={toggleExpand}
          className="flex items-center justify-center w-8 h-8 mt-1 ml-2 rounded-full hover:bg-gray-100 focus:outline-none"
          aria-label={isExpanded ? 'Collapse details' : 'Expand details'} 
        >
          <svg
            className={`w-5 h-5 text-indigo-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Progress Bar - Always Visible */}
      <div className="mb-6">
        <div className="flex justify-between mb-1">
          <span className="font-medium text-gray-700">Profile Completion</span>
          <span className="font-bold text-indigo-600">{percent}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full">
          <div
            className="h-3 transition-all duration-500 ease-out bg-indigo-600 rounded-full"
            style={{ width: `${Math.min(100, percent)}%` }}
          ></div>
        </div>
      </div>

      {/* Collapsible Section Checklist */}
      {isExpanded && (
        <div className="pt-4 mt-4 space-y-5 border-t border-gray-100">
          {sections.map((section) => {
            const isCompleted = section.completed;
            const hasMissing = section.missing && section.missing.length > 0;

            return (
              <div
                key={section.id}
                className={`border-l-4 pl-4 py-2 ${isCompleted
                    ? 'border-green-500 bg-green-50'
                    : 'border-yellow-500 bg-yellow-50'
                  }`}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    {isCompleted ? (
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-400 rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {formatSectionName(section.id)}{' '}
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        ({section.weight}%)
                      </span>
                    </h3>

                    {hasMissing && !isCompleted && (
                      <ul className="pl-5 mt-2 space-y-1 text-sm text-gray-700 list-disc">
                        {section.missing.map((item, idx) => (
                          <li key={idx} className="capitalize">
                            {item.replace(/_/g, ' ')}
                          </li>
                        ))}
                      </ul>
                    )}

                    {(section.current_count !== undefined || section.target_count !== undefined) &&
                      !isCompleted && (
                        <p className="mt-1 text-sm text-gray-600">
                          {section.current_count || 0} of {section.target_count} added
                        </p>
                      )}

                    {section.not_applicable && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                        Not applicable
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 text-sm text-center text-gray-500">
        Update your profile in settings to increase completion.
      </div>
    </div>
  );
};

export default ProfileCompletionGuide;