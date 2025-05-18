import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL } from '../../utils/contants';
import { useAuth } from '../../context/auth';
import LoadingSpinner from '../../components/LoadingSpinner';
import { verifyToken } from '../../utils/auth';

interface VerificationState {
    isLoading: boolean;
    isVerified: boolean;
    error: string | null;
    isSubmitting: boolean;
}

const EmailVerification: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [state, setState] = useState<VerificationState>({
        isLoading: false,
        isVerified: false,
        error: null,
        isSubmitting: false
    });

    const auth = useAuth();

    if (!auth) {
        <LoadingSpinner />;
        return;
    }

    const [searchParams] = useSearchParams();

    const role = searchParams.get('role');

    const { setUser, setAdmin } = auth;

    const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
    const [email, setEmail] = useState<string>('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Focus on first input when component mounts
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }

        // Optionally, you can fetch user email or other details using the id
        const fetchUserDetails = async () => {
            if (!id) return;

            try {
                // Replace with your actual API endpoint to get user details
                const response = await axios.get(`${API_URL}/${role === "PATIENT" ? "users" : "hospitals"}/${id}`);

                if (response.data.isVerified) {
                    setState(prev => ({ ...prev, isVerified: true }));
                    return;
                }

                if (response.data.email) {
                    setEmail(response.data.email);
                }

                await axios.post(`${API_URL}/${role === "PATIENT" ? "users" : "hospitals"}/email/${id}`, {
                    email: response.data.email
                });
            } catch (error) {
                console.error('Failed to fetch user details:', error);
            }
        };

        fetchUserDetails();
    }, [id]);

    const handleCodeChange = (index: number, value: string) => {
        // Only allow numeric input
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value.slice(-1); // Only take the last character
        setCode(newCode);

        // Clear error when user starts typing
        if (state.error) {
            setState(prev => ({ ...prev, error: null }));
        }

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace to move to previous input
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        // Handle paste
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text').replace(/\D/g, ''); // Remove non-digits

        if (pastedText.length === 6) {
            const newCode = pastedText.split('');
            setCode(newCode);
            setState(prev => ({ ...prev, error: null }));
            inputRefs.current[5]?.focus(); // Focus on last input
        }
    };

    const handleSubmit = async () => {
        const verificationCode = code.join('');

        if (verificationCode.length !== 6) {
            setState(prev => ({
                ...prev,
                error: 'Please enter all 6 digits'
            }));
            return;
        }

        if (!id) {
            setState(prev => ({
                ...prev,
                error: 'Invalid verification link'
            }));
            return;
        }

        setState(prev => ({ ...prev, isSubmitting: true, error: null }));

        try {
            // Replace with your actual API endpoint
            const response = await axios.post(`${API_URL}/${role === "PATIENT" ? "users" : "hospitals"}/verify/${id}`, {
                code: verificationCode
            });

            if (response.status === 200) {

                const verifiedToken = await verifyToken(response.data.token);

                setState(prev => ({
                    ...prev,
                    isSubmitting: false,
                    isVerified: true
                }));

                setTimeout(() => {
                    if (verifiedToken.role === "admin") {
                        setAdmin(verifiedToken);
                    }

                    setUser(verifiedToken);

                    localStorage.setItem("eWauthToken", response.data.token);
                }, 2000);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Invalid verification code';
            setState(prev => ({
                ...prev,
                isSubmitting: false,
                error: errorMessage
            }));
        }
    };

    const handleResendCode = async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Replace with your actual API endpoint
            await axios.post(`${API_URL}/${role === "PATIENT" ? "users" : "hospitals"}/${id}`);

            setState(prev => ({ ...prev, isLoading: false }));
            setCode(['', '', '', '', '', '']); // Clear the code
            inputRefs.current[0]?.focus(); // Focus on first input

            alert('Verification code sent successfully!');
        } catch (error: any) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || 'Failed to resend verification code'
            }));
        }
    };

    const handleGoToLogin = () => {
        navigate('/auth');
    };

    const handleGoHome = () => {
        navigate('/dashboard');
    };

    const maskEmail = (email: string) => {
        if (!email) return '';
        const [username, domain] = email.split('@');
        const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
        return `${maskedUsername}@${domain}`;
    };

    if (state.isVerified) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-400 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-check-circle text-4xl text-green-500"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Email Verified Successfully!</h2>
                    <p className="text-gray-600 mb-8">
                        Your email has been verified. You can now access all features of your account.
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={handleGoHome}
                            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-400 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-envelope-open text-3xl text-teal-500"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
                    <p className="text-gray-600">
                        We've sent a 6-digit verification code to
                    </p>
                    {email && (
                        <p className="font-semibold text-gray-800 mt-1">{maskEmail(email)}</p>
                    )}
                </div>

                {state.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex">
                            <i className="fas fa-exclamation-circle text-red-400 mt-0.5 mr-3"></i>
                            <span className="text-red-700">{state.error}</span>
                        </div>
                    </div>
                )}

                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                        Enter the 6-digit code
                    </label>
                    <div className="flex justify-center space-x-2">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleCodeChange(index, e.target.value)}
                                onKeyDown={e => handleKeyDown(index, e)}
                                onPaste={index === 0 ? handlePaste : undefined}
                                className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${state.error ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder="0"
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleSubmit}
                        disabled={state.isSubmitting || code.join('').length !== 6}
                        className="w-full bg-teal-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {state.isSubmitting ? (
                            <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Verifying...
                            </>
                        ) : (
                            'Verify Email'
                        )}
                    </button>

                    <div className="text-center">
                        <span className="text-gray-600 text-sm">Didn't receive the code? </span>
                        <button
                            onClick={handleResendCode}
                            disabled={state.isLoading}
                            className="text-teal-500 hover:text-teal-600 font-semibold text-sm disabled:opacity-50"
                        >
                            {state.isLoading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-1"></i>
                                    Sending...
                                </>
                            ) : (
                                'Resend Code'
                            )}
                        </button>
                    </div>

                    <button
                        onClick={handleGoToLogin}
                        className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200"
                    >
                        Back to Login
                    </button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start">
                        <i className="fas fa-info-circle text-blue-400 mt-1 mr-3"></i>
                        <div className="text-sm text-blue-700">
                            <p className="font-medium">Verification Tips:</p>
                            <ul className="mt-1 space-y-1">
                                <li>• Check your spam/junk folder</li>
                                <li>• Code expires in 10 minutes</li>
                                <li>• You can paste the full 6-digit code</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;