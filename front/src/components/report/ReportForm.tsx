import React, {ChangeEvent, FormEvent, useState} from 'react';
import {useQuery} from '@apollo/client';
import axios from 'axios';
import {GET_COMMON_RIDES} from '../../graphQl/queries/commonRides';
import {CommonRide} from '../../types/report';
import {ReportSubjectType} from "../../enums/ReportSubjectType.ts";
import {useNavigate} from "react-router";

interface ReportFormProps {
    reporterId: number;
    reporterEmail: string;
    reportedUser: {
        id: number;
        name: string;
        lastName: string;
        email: string;
    };
}

const ReportForm: React.FC<ReportFormProps> = ({
                                                   reporterId,
                                                   reportedUser
                                               }) => {
    const [reason, setReason] = useState<string>('');
    const [proof, setProof] = useState<File | null>(null);
    const [selectedRideId, setSelectedRideId] = useState<number | undefined>(undefined);
    const [subjectType, setSubjectType] = useState<ReportSubjectType>(ReportSubjectType.BEHAVIOR);
    const [step, setStep] = useState<number>(1);
    const navigate = useNavigate();
    const { data, loading } = useQuery<{ getCommonRides: CommonRide[] }>(
        GET_COMMON_RIDES,
        {
            variables: { userId1: reporterId, userId2: reportedUser.id },
            skip: subjectType !== 'RIDE',
            fetchPolicy: 'network-only',
        }
    );

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setProof(e.target.files[0]);
        }
    };

    const onHandleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        // Ne soumettre que si on est à l’étape 3
        if (step !== 3) {
            return;
        }
        if (!subjectType || !reason || (subjectType === 'RIDE' && !selectedRideId)) {
            alert('Please complete all required fields.');
            return;
        }

        const formData = new FormData();
        formData.append('subjectType', subjectType);
        formData.append('reason', reason);
        formData.append('reporterId', reporterId.toString());
        formData.append('reportedUserId', reportedUser.id.toString());
        if (subjectType === 'RIDE') {
            formData.append('reportedRideId', selectedRideId!.toString());
        }
        if (proof) {
            formData.append('proof', proof);
        }
        const token = localStorage.getItem('auth_token');
        try {
            await axios.post('http://localhost:3000/reports', formData, {
                headers: { 'Content-Type': 'multipart/form-data'
                    , Authorization: `Bearer ${token}` },
                withCredentials: true,
            });

            navigate(-1);
            alert('Your report has been submitted successfully.');
        } catch (err) {
            console.error(err);
            setSubjectType(ReportSubjectType.BEHAVIOR);
            setReason('');
            setSelectedRideId(undefined);
            setProof(null);

            setStep(1);

        }
    };

    const nextStep = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault(); // Empêche tout comportement par défaut
        if (step === 1 && !subjectType) {
            alert('Please select a report category.');
            return;
        }
        if (step === 2 && subjectType === 'RIDE' && !selectedRideId) {
            alert('Please select a ride.');
            return;
        }
        if (step === 2 && !reason) {
            alert('Please provide a detailed description.');
            return;
        }
        setStep(step + 1);
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    const orderedSubjectTypes = [
        ReportSubjectType.BEHAVIOR,
        ReportSubjectType.LATE_ARRIVAL,
        ReportSubjectType.NO_SHOW,
        ReportSubjectType.DANGEROUS_DRIVING,
        ReportSubjectType.RIDE,
        ReportSubjectType.VEHICLE_MALFUNCTION,
        ReportSubjectType.IMPROPER_CONDUCT,
        ReportSubjectType.POOR_COMMUNICATION,
        ReportSubjectType.TRAFFIC_VIOLATION,
        ReportSubjectType.OTHER
    ];

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-6 md:p-8 lg:p-10 rounded-3xl shadow-2xl backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
            {/* Reported user banner */}
            <div className="flex items-center mb-8 bg-white/70 dark:bg-gray-800/70 p-4 rounded-2xl backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-md">
                <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mr-4 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Reported User</h3>
                    <div className="text-gray-900 dark:text-gray-100 font-medium">{reportedUser.name} {reportedUser.lastName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{reportedUser.email}</div>
                </div>
            </div>

            {/* Progress indicator */}
            <div className="mb-8">
                <div className="flex justify-between mb-2">
                    {['Category', 'Details', 'Proof'].map((label, index) => (
                        <div key={index} className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                step > index+1 ? 'bg-green-500 dark:bg-green-600 text-white' :
                                    step === index+1 ? 'bg-indigo-600 dark:bg-indigo-500 text-white' :
                                        'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}>
                                {step > index+1 ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    index + 1
                                )}
                            </div>
                            <span className={`text-xs ${step === index+1 ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className="absolute top-0 left-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-full transition-all duration-300 ease-in-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    ></div>
                </div>
            </div>

            <form onSubmit={onHandleSubmit}>
                {/* Step 1: Category Selection */}
                {step === 1 && (
                    <div className="space-y-8 animate-fadeIn">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">What would you like to report?</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {orderedSubjectTypes.map((type) => (
                                <div
                                    key={type}
                                    onClick={() => setSubjectType(type)}
                                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                                        subjectType === type
                                            ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg scale-105 transform'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:shadow-md'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <div>
                                            <h3 className={`font-medium ${subjectType === type ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                                                {type.replace('_', ' ').toLowerCase().replace(/(^\w)|\s(\w)/g, (m) => m.toUpperCase())}
                                            </h3>
                                            <p className={`text-sm ${subjectType === type ? 'text-indigo-100 dark:text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {type === 'BEHAVIOR' && 'Report inappropriate conduct or behavior'}
                                                {type === 'LATE_ARRIVAL' && 'Report issues with late arrival to pickup point'}
                                                {type === 'NO_SHOW' && 'Driver or passenger failed to show up'}
                                                {type === 'DANGEROUS_DRIVING' && 'Report unsafe or reckless driving behavior'}
                                                {type === 'RIDE' && 'Issues with a specific shared ride'}
                                                {type === 'VEHICLE_MALFUNCTION' && 'Problems with the vehicle condition or operation'}
                                                {type === 'IMPROPER_CONDUCT' && 'Report inappropriate actions or language'}
                                                {type === 'POOR_COMMUNICATION' && 'Issues with unclear or lack of communication'}
                                                {type === 'TRAFFIC_VIOLATION' && 'Report traffic rule violations during trip'}
                                                {type === 'OTHER' && 'Other issues not covered by categories'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Details */}
                {step === 2 && (
                    <div className="space-y-8 animate-fadeIn">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Provide details about the issue</h2>

                        {subjectType === 'RIDE' && (
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Select the ride in question</label>
                                {loading ? (
                                    <div className="flex items-center justify-center py-4">
                                        <div className="w-6 h-6 border-2 border-t-indigo-500 border-gray-200 rounded-full animate-spin"></div>
                                        <span className="ml-2 text-gray-500 dark:text-gray-400">Loading rides…</span>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <select
                                            value={selectedRideId || ''}
                                            onChange={e => setSelectedRideId(parseInt(e.target.value))}
                                            required
                                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 appearance-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
                                        >
                                            <option value="">Select a ride</option>
                                            {data?.getCommonRides.map(ride => (
                                                <option key={ride.id} value={ride.id}>
                                                    {ride.departure} → {ride.arrival} ({new Date(ride.date).toLocaleDateString()})
                                                </option>
                                            ))}
                                            {data?.getCommonRides.length === 0 && (
                                                <option disabled>No shared rides found</option>
                                            )}
                                        </select>
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                            <textarea
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                required
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-4 min-h-[150px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
                                placeholder="Please provide a detailed description of the issue..."
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: Proof Upload */}
                {step === 3 && (
                    <div className="space-y-8 animate-fadeIn">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Upload Evidence (Optional)</h2>

                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <input
                                type="file"
                                id="proof-file"
                                onChange={handleFileChange}
                                accept="image/*,video/*,.pdf,.doc,.docx"
                                className="hidden"
                            />

                            {!proof ? (
                                <label
                                    htmlFor="proof-file"
                                    className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-indigo-500 dark:text-indigo-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-indigo-600 dark:text-indigo-400 font-medium">Upload evidence (optional)</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Click or drag & drop your file here</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">PNG, JPG, GIF, PDF, DOC up to 10MB</p>
                                </label>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="relative mb-4 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                                        {proof.type.startsWith('image/') ? (
                                            <div className="h-48 w-48 relative">
                                                <img
                                                    src={URL.createObjectURL(proof)}
                                                    alt="Preview"
                                                    className="h-full w-full object-cover rounded-md"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-48 w-48 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            className="absolute -top-2 -right-2 bg-white dark:bg-gray-700 rounded-full p-1 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 shadow-sm border border-gray-200 dark:border-gray-600"
                                            onClick={() => setProof(null)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">{proof.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{(proof.size / 1024 / 1024).toFixed(2)} MB</div>
                                </div>
                            )}
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-lg p-4 mt-4">
                            <div className="flex text-amber-800 dark:text-amber-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm">The evidence you provide will only be used to investigate this report and will be handled securely. Providing evidence is optional but can help resolve your report faster.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation buttons */}
                <div className="mt-10 flex justify-between">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className={`px-6 py-2 rounded-lg text-white font-medium transition-colors flex items-center ml-auto ${
                                step === 1 && !subjectType ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600'
                            }`}
                            disabled={step === 1 && !subjectType}
                        >
                            Next
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 dark:hover:from-indigo-700 dark:hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition shadow-md ml-auto flex items-center"
                        >
                            Submit Report
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </button>
                    )}
                </div>
            </form>

            {/* Add CSS Animations */}
            <style >{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ReportForm;