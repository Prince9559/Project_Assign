import { useState } from 'react';
import { useApplyToJob } from '../../../hooks/useApplyToJob';
import ErrorMessage from '../../../components/ui/ErrorMessage';
import SuccessMessage from '../../../components/ui/SuccessMessage';
import { useSelector } from "react-redux";
import { getLastApplication } from '../../../api/lastApplicationApi';

export default function ApplyForm({ jobId, screeningQuestions = [], onClose, onSubmit }) {
    const token = useSelector((state) => state.auth.token);
    const [formErrors, setFormErrors] = useState({});
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [formData, setFormData] = useState({
        why_should_we_hire_you: '',
        project: '',
        github_link: '',
        portfolio_link: '',
        confirm_availability: false,
        screening_answers: screeningQuestions.map(q => ''),
    });

    const {
        applyToJob,
        loading: applyLoading,
        error: applyError,
    } = useApplyToJob();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const applicationData = {
                ...formData,
                // Ensure confirm_availability is a boolean
                confirm_availability: Boolean(formData.confirm_availability)
            };

            // Pass jobId and applicationData separately
            const result = await applyToJob(jobId, applicationData);

            if (!result?.success) {
                throw new Error(result?.message || 'Failed to submit application');
            }

            setSubmitSuccess(true);

            if (onSubmit) {
                onSubmit(applicationData);
            }

            // Reset form and close after 2 seconds
            setTimeout(() => {
                setFormData({
                    why_should_we_hire_you: '',
                    // project: '',
                    // github_link: '',
                    portfolio_link: '',
                    confirm_availability: false,
                });
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Application failed:', error);
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.why_should_we_hire_you.trim()) {
            errors.why_should_we_hire_you = 'This field is required';
        }
        // if (!formData.project.trim()) {
        //     errors.project = 'Please provide project details';
        // }
        if (!formData.confirm_availability) {
            errors.confirm_availability = 'Please confirm your availability';
        }

        // Validate screening questions
        screeningQuestions.forEach((q, index) => {
            const ans = formData.screening_answers[index]?.trim();
            if (!ans) {
                const key = `screening_${index}`;
                errors[key] = 'This question is required';
            }
        });

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };


    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.startsWith('screening_')) {
            // Format: screening_2 → index = 2
            const index = parseInt(name.split('_')[1], 10);
            setFormData(prev => ({
                ...prev,
                screening_answers: prev.screening_answers.map((ans, i) =>
                    i === index ? value : ans
                ),
            }));

            // Clear error for this question
            if (formErrors[name]) {
                setFormErrors(prev => ({ ...prev, [name]: '' }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));

            if (formErrors[name]) {
                setFormErrors(prev => ({ ...prev, [name]: '' }));
            }
        }
    };


    const handleCopyLastApplication = async () => {
        if (!token) {
            alert("Please login first");
            return;
        }

        const res = await getLastApplication(token);

        if (res?.data) {
            const lastApp = res.data;

            setFormData({
                why_should_we_hire_you: lastApp.why_should_we_hire_you || '',
                project: lastApp.project || '',
                github_link: lastApp.github_link || '',
                portfolio_link: lastApp.portfolio_link || '',
                confirm_availability: lastApp.confirm_availability || false,
                screening_answers: lastApp.screening_answers || screeningQuestions.map(() => ''),
            });
        } else {
            alert("No previous application found");
        }
    };

    return (
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4">
                <h2 className="text-xl font-bold">Apply for this Position</h2>
                <button
                    type="button"
                    onClick={handleCopyLastApplication}
                    className="text-sm px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200"
                >
                    Copy Last Application
                </button>
            </div>

            {applyError && (
                <SuccessMessage className="mb-2 text-lg">
                    {applyError}
                </SuccessMessage>
            )}
            {submitSuccess && (
                // <SuccessMessage className="mb-2">
                //     Application submitted successfully!
                // </SuccessMessage>
                //                 <SuccessMessage className="mb-2 text-green-600 bg-green-100 border border-green-300 px-3 py-2 rounded">
                //   Application submitted successfully!
                // </SuccessMessage>
                <SuccessMessage className="mb-2 !text-green-600 !bg-green-100 !border-green-300">
                    Application submitted successfully!
                </SuccessMessage>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Why Hire */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Why should we hire you? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="why_should_we_hire_you"
                        value={formData.why_should_we_hire_you}
                        onChange={handleInputChange}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-md ${formErrors.why_should_we_hire_you ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Explain why you're a great fit..."
                        disabled={applyLoading}
                    />
                    {formErrors.why_should_we_hire_you && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.why_should_we_hire_you}</p>
                    )}
                </div>

                {/* Project */}
                {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Details <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="project"
                        value={formData.project}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${formErrors.project ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Briefly describe a project..."
                        disabled={applyLoading}
                    />
                    {formErrors.project && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.project}</p>
                    )}
                </div> */}

                {/* GitHub */}
                {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Link</label>
                    <input
                        type="url"
                        name="github_link"
                        value={formData.github_link}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="https://github.com/username/project"
                        disabled={applyLoading}
                    />
                </div> */}

                {/* Portfolio */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Link</label>
                    <input
                        type="url"
                        name="portfolio_link"
                        value={formData.portfolio_link}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="https://yourportfolio.com"
                        disabled={applyLoading}
                    />
                </div>

                {/* Screening Questions */}
                {screeningQuestions && screeningQuestions.length > 0 && (
                    <div className="pt-2 pb-4 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.5 2.4-3 3.2l-.8 2.4c-.16.48-.64.8-1.2.8H8.228z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                            Screening Questions
                        </h3>
                        <div className="space-y-4">
                            {screeningQuestions.map((question, index) => {
                                const errorKey = `screening_${index}`;
                                const value = formData.screening_answers[index] || '';
                                return (
                                    <div key={index} className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <span className="font-bold text-gray-800">Q{index + 1}:</span> {question}
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <textarea
                                            name={`screening_${index}`}
                                            value={value}
                                            onChange={handleInputChange}
                                            rows={2}
                                            className={`w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${formErrors[errorKey] ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Your answer..."
                                            disabled={applyLoading}
                                        />
                                        {formErrors[errorKey] && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors[errorKey]}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Availability */}
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="confirm_availability"
                            name="confirm_availability"
                            type="checkbox"
                            checked={formData.confirm_availability}
                            onChange={handleInputChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            disabled={applyLoading}
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="confirm_availability" className="font-medium text-gray-700">
                            I confirm my availability <span className="text-red-500">*</span>
                        </label>
                        {formErrors.confirm_availability && (
                            <p className="mt-1 text-red-600">{formErrors.confirm_availability}</p>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={applyLoading}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={applyLoading}
                        className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                        {applyLoading ? 'Submitting...' : 'Submit Application'}
                    </button>
                </div>
            </form>
        </div>
    );
}
