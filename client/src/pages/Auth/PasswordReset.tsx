import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL } from '../../utils/contants';

type Step = 'email' | 'code' | 'password' | 'success';

interface ResetState {
    currentStep: Step;
    isLoading: boolean;
    error: string | null;
    userEmail: string;
    verificationCode: string;
    resetToken: string;
}

interface FormData {
    email: string;
    code: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    email?: string;
    code?: string;
    password?: string;
    confirmPassword?: string;
}

const PasswordReset: React.FC = () => {
    const navigate = useNavigate();
    const [state, setState] = useState<ResetState>({
        currentStep: 'email',
        isLoading: false,
        error: null,
        userEmail: '',
        verificationCode: '',
        resetToken: ''
    });

    const [formData, setFormData] = useState<FormData>({
        email: '',
        code: '',
        password: '',
        confirmPassword: ''
    });

    const [searchParams] = useSearchParams();
    const role = searchParams.get('role');

    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);

    const validateEmail = (): boolean => {
        const newErrors: FormErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateCode = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.code) {
            newErrors.code = 'Verification code is required';
        } else if (formData.code.length !== 6) {
            newErrors.code = 'Please enter the 6-digit code';
        } else if (!/^\d{6}$/.test(formData.code)) {
            newErrors.code = 'Code must contain only numbers';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePassword = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Step 1: Send email for password reset
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateEmail()) return;

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // TODO: Replace with your actual API endpoint
            const response = await axios.post(`${API_URL}/${role === "PATIENT" ? "users" : "hospitals"}/forgotpassword`, {
                email: formData.email
            });

            if (response.status !== 200) {
                throw new Error('Failed to send verification code');
            }

            setState(prev => ({
                ...prev,
                isLoading: false,
                currentStep: 'code',
                userEmail: formData.email
            }));
        } catch (error: any) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || 'Failed to send verification code. Please try again.'
            }));
        }
    };

    // Step 2: Verify the 6-digit code
    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateCode()) return;

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // TODO: Replace with your actual API endpoint
            const response = await axios.post(`${API_URL}/${role === "PATIENT" ? "users" : "hospitals"}/verify-reset-code`, {
                email: state.userEmail,
                code: formData.code
            });

            if (response.status !== 200) {
                throw new Error('Invalid verification code');
            }

            setState(prev => ({
                ...prev,
                isLoading: false,
                currentStep: 'password',
                resetToken: response.data.resetToken || '' // Assuming backend returns a reset token
            }));
        } catch (error: any) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || 'Invalid verification code. Please try again.'
            }));
        }
    };

    // Step 3: Set new password
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePassword()) return;

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // TODO: Replace with your actual API endpoint
            await axios.put(`${API_URL}/${role === "PATIENT" ? "users" : "hospitals"}/resetpassword`, {
                email: state.userEmail,
                password: formData.password
            });

            setState(prev => ({
                ...prev,
                isLoading: false,
                currentStep: 'success'
            }));
        } catch (error: any) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || 'Failed to reset password. Please try again.'
            }));
        }
    };

    // Step 4: Go to login after success
    const handleGoToLogin = () => {
        navigate('/auth');
    };

    const handleBack = () => {
        setErrors({});
        setState(prev => ({ ...prev, error: null }));

        if (state.currentStep === 'code') {
            setState(prev => ({ ...prev, currentStep: 'email' }));
        } else if (state.currentStep === 'password') {
            setState(prev => ({ ...prev, currentStep: 'code' }));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear specific error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleResendCode = async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // TODO: Replace with your actual API endpoint
            await axios.post(`${API_URL}/${role === "PATIENT" ? "users" : "hospitals"}/forgotpassword`, {
                email: state.userEmail
            });

            setState(prev => ({ ...prev, isLoading: false }));
            // You might want to show a success message here
        } catch (error: any) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || 'Failed to resend code. Please try again.'
            }));
        }
    };

    // Step 1: Email Input
    const renderEmailStep = () => (
        <>
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-envelope text-3xl text-teal-500"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Your Password</h2>
                <p className="text-gray-600">Enter your email address to receive a verification code</p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${errors.email ? 'border-red-300' : 'border-gray-300'
                            }`}
                        placeholder="Enter your email address"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={state.isLoading}
                    className="w-full bg-teal-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {state.isLoading ? (
                        <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Sending Code...
                        </>
                    ) : (
                        'Send Verification Code'
                    )}
                </button>

                <button
                    type="button"
                    onClick={handleGoToLogin}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200"
                >
                    Back to Login
                </button>
            </form>
        </>
    );

    // Step 2: Code Verification
    const renderCodeStep = () => (
        <>
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-shield-alt text-3xl text-blue-500"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter Verification Code</h2>
                <p className="text-gray-600">
                    We've sent a 6-digit code to <span className="font-medium">{state.userEmail}</span>
                </p>
            </div>

            <form onSubmit={handleCodeSubmit} className="space-y-6">
                <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Code
                    </label>
                    <input
                        type="text"
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        maxLength={6}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-center text-2xl tracking-widest ${errors.code ? 'border-red-300' : 'border-gray-300'
                            }`}
                        placeholder="000000"
                    />
                    {errors.code && (
                        <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                    )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                        <i className="fas fa-info-circle text-blue-400 mt-0.5 mr-3"></i>
                        <div className="text-sm text-blue-700">
                            <p>Didn't receive the code? Check your spam folder or
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={state.isLoading}
                                    className="ml-1 font-medium underline hover:no-underline disabled:opacity-50"
                                >
                                    resend it
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={state.isLoading}
                    className="w-full bg-teal-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {state.isLoading ? (
                        <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Verifying...
                        </>
                    ) : (
                        'Verify Code'
                    )}
                </button>

                <button
                    type="button"
                    onClick={handleBack}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200"
                >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Change Email
                </button>
            </form>
        </>
    );

    // Step 3: Password Reset
    const renderPasswordStep = () => (
        <>
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-key text-3xl text-teal-500"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Set New Password</h2>
                <p className="text-gray-600">Enter your new password below</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 pr-12 ${errors.password ? 'border-red-300' : 'border-gray-300'
                                }`}
                            placeholder="Enter your new password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-gray-400 hover:text-gray-600`}></i>
                        </button>
                    </div>
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                            }`}
                        placeholder="Confirm your new password"
                    />
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                        <i className="fas fa-info-circle text-blue-400 mt-0.5 mr-3"></i>
                        <div className="text-sm text-blue-700">
                            <p className="font-medium mb-1">Password Requirements:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>At least 8 characters long</li>
                                <li>Contains uppercase and lowercase letters</li>
                                <li>Contains at least one number</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={state.isLoading}
                    className="w-full bg-teal-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {state.isLoading ? (
                        <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Resetting Password...
                        </>
                    ) : (
                        'Reset Password'
                    )}
                </button>

                <button
                    type="button"
                    onClick={handleBack}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200"
                >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Back
                </button>
            </form>
        </>
    );

    // Step 4: Success
    const renderSuccessStep = () => (
        <>
            <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-check-circle text-4xl text-green-500"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Password Reset Successfully!</h2>
                <p className="text-gray-600 mb-8">
                    Your password has been changed successfully. You can now log in with your new password.
                </p>
                <button
                    onClick={handleGoToLogin}
                    className="w-full bg-teal-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-600 transition-colors duration-200"
                >
                    Go to Login
                </button>
            </div>
        </>
    );

    const getCurrentStepContent = () => {
        switch (state.currentStep) {
            case 'email':
                return renderEmailStep();
            case 'code':
                return renderCodeStep();
            case 'password':
                return renderPasswordStep();
            case 'success':
                return renderSuccessStep();
            default:
                return renderEmailStep();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-400 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
                {/* Progress indicator */}
                {state.currentStep !== 'success' && (
                    <div className="flex justify-center mb-8">
                        <div className="flex items-center space-x-2">
                            {['email', 'code', 'password'].map((step, index) => (
                                <React.Fragment key={step}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${state.currentStep === step
                                        ? 'bg-teal-500 text-white'
                                        : index < ['email', 'code', 'password'].indexOf(state.currentStep)
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {index < ['email', 'code', 'password'].indexOf(state.currentStep) ? (
                                            <i className="fas fa-check text-xs"></i>
                                        ) : (
                                            index + 1
                                        )}
                                    </div>
                                    {index < 2 && (
                                        <div className={`w-12 h-0.5 ${index < ['email', 'code', 'password'].indexOf(state.currentStep)
                                            ? 'bg-green-500'
                                            : 'bg-gray-200'
                                            }`}></div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error display */}
                {state.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex">
                            <i className="fas fa-exclamation-circle text-red-400 mt-0.5 mr-3"></i>
                            <span className="text-red-700">{state.error}</span>
                        </div>
                    </div>
                )}

                {/* Current step content */}
                {getCurrentStepContent()}
            </div>
        </div>
    );
};

export default PasswordReset;