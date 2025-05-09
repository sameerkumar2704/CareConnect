import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/contants';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheckCircle,
    faTimesCircle,
    faFilePdf,
    faIdCard,
    faCertificate,
    faBuilding,
    faFileImage,
    faDownload,
    faExclamationTriangle,
    faCheck,
    faTimes,
    faEye
} from '@fortawesome/free-solid-svg-icons';

interface Document {
    id: string;
    name: string;
    type: string;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    url: string;
    uploadedAt: string;
    rejectionReason?: string;
}

interface AdminDocumentVerificationTabProps {
    userId: string;
    role: string; // 'DOCTOR' or 'FACILITY'
    userName?: string; // Optional: display user name in the UI
}

const AdminDocumentVerificationTab = ({ userId, role, userName }: AdminDocumentVerificationTabProps) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [rejectionReason, setRejectionReason] = useState<string>('');
    const [documentToReject, setDocumentToReject] = useState<string | null>(null);
    const [showRejectionModal, setShowRejectionModal] = useState<boolean>(false);

    // Document type mapping for display purposes
    const documentTypes = role === 'DOCTOR'
        ? [
            { id: 'medical_license', name: 'Medical License', icon: faCertificate },
            { id: 'board_certification', name: 'Board Certification', icon: faCertificate },
            { id: 'educational_credentials', name: 'Educational Credentials', icon: faCertificate },
            { id: 'identity_proof', name: 'Government ID', icon: faIdCard },
            { id: 'professional_photo', name: 'Professional Photo', icon: faFileImage },
            { id: 'additional_certifications', name: 'Additional Certifications', icon: faFilePdf },
        ]
        : [
            { id: 'business_license', name: 'Business License', icon: faBuilding },
            { id: 'facility_certification', name: 'Facility Certification', icon: faCertificate },
            { id: 'healthcare_accreditation', name: 'Healthcare Accreditation', icon: faCertificate },
            { id: 'tax_identification', name: 'Tax Identification', icon: faIdCard },
            { id: 'liability_insurance', name: 'Liability Insurance', icon: faFilePdf },
            { id: 'ownership_proof', name: 'Ownership Documentation', icon: faBuilding },
        ];

    useEffect(() => {
        fetchDocuments();
    }, [userId]);

    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            // Assuming there's an admin endpoint for fetching user documents
            const response = await axios.get(`${API_URL}/admin/${role.toLowerCase()}/documents/${userId}`);
            setDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
            setError('Failed to load documents. Please try again.');
            setDocuments([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyDocument = async (documentId: string) => {
        try {
            await axios.put(`${API_URL}/admin/documents/verify/${documentId}`);
            setSuccess('Document verified successfully!');
            fetchDocuments(); // Refresh the documents list
        } catch (error) {
            console.error('Error verifying document:', error);
            setError('Failed to verify document. Please try again.');
        }
    };

    const openRejectModal = (documentId: string) => {
        setDocumentToReject(documentId);
        setRejectionReason('');
        setShowRejectionModal(true);
    };

    const closeRejectModal = () => {
        setShowRejectionModal(false);
        setDocumentToReject(null);
        setRejectionReason('');
    };

    const handleRejectDocument = async () => {
        if (!documentToReject) return;

        try {
            await axios.put(`${API_URL}/admin/documents/reject/${documentToReject}`, {
                rejectionReason
            });
            setSuccess('Document rejected successfully!');
            closeRejectModal();
            fetchDocuments(); // Refresh the documents list
        } catch (error) {
            console.error('Error rejecting document:', error);
            setError('Failed to reject document. Please try again.');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'VERIFIED':
                return 'bg-green-100 text-green-700';
            case 'REJECTED':
                return 'bg-red-100 text-red-600';
            default:
                return 'bg-yellow-100 text-yellow-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'VERIFIED':
                return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
            case 'REJECTED':
                return <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />;
            default:
                return <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500" />;
        }
    };

    // Rejection modal component
    const RejectionModal = () => {
        if (!showRejectionModal) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md">
                    <h3 className="text-lg font-medium mb-4">Document Rejection</h3>
                    <p className="mb-4 text-gray-600">Please provide a reason for rejecting this document:</p>

                    <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                        rows={4}
                        placeholder="Enter rejection reason..."
                    />

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={closeRejectModal}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRejectDocument}
                            disabled={!rejectionReason.trim()}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Reject Document
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-2">Document Verification</h2>
            {userName && (
                <p className="text-gray-600 mb-4">Reviewing documents for: <span className="font-medium">{userName}</span></p>
            )}

            {error && (
                <div className="mt-4 mb-4 bg-red-50 text-red-700 p-3 rounded-md">
                    {error}
                </div>
            )}

            {success && (
                <div className="mt-4 mb-4 bg-green-50 text-green-700 p-3 rounded-md">
                    {success}
                </div>
            )}

            {/* Document Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium mb-4">Documents Pending Review</h3>

                <div className="mt-2 mb-4 bg-blue-50 p-4 rounded-md text-blue-700 text-sm">
                    <p className="font-medium mb-1">Admin Instructions:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Review all documents carefully before verification</li>
                        <li>Ensure documents are authentic, clear, legible, and valid</li>
                        <li>Check expiration dates when applicable</li>
                        <li>Provide clear reasons when rejecting documents</li>
                        <li>User will be notified automatically upon verification or rejection</li>
                    </ul>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <LoadingSpinner />
                    </div>
                ) : documents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                                    <th className="py-3 px-6 text-left">Document</th>
                                    <th className="py-3 px-6 text-left">Type</th>
                                    <th className="py-3 px-6 text-left">Status</th>
                                    <th className="py-3 px-6 text-left">Uploaded</th>
                                    <th className="py-3 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm">
                                {documents.map((doc) => (
                                    <tr key={doc.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-3 px-6 text-left">
                                            <div className="flex items-center">
                                                <FontAwesomeIcon
                                                    icon={doc.type.includes('photo') ? faFileImage : faFilePdf}
                                                    className="mr-2 text-teal-500"
                                                />
                                                <span className="font-medium">{doc.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-left">
                                            {documentTypes.find(t => t.id === doc.type)?.name || doc.type}
                                        </td>
                                        <td className="py-3 px-6 text-left">
                                            <div className="flex items-center">
                                                {getStatusIcon(doc.status)}
                                                <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(doc.status)}`}>
                                                    {doc.status}
                                                </span>
                                            </div>
                                            {doc.status === 'REJECTED' && doc.rejectionReason && (
                                                <div className="mt-1 text-xs text-red-600">
                                                    Reason: {doc.rejectionReason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-6 text-left">
                                            {formatDate(doc.uploadedAt)}
                                        </td>
                                        <td className="py-3 px-6 text-right">
                                            <div className="flex item-center justify-end">
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-8 h-8 mr-2 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                                                    title="View Document"
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </a>
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-8 h-8 mr-2 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                    title="Download Document"
                                                >
                                                    <FontAwesomeIcon icon={faDownload} />
                                                </a>

                                                {doc.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleVerifyDocument(doc.id)}
                                                            className="w-8 h-8 mr-2 flex items-center justify-center rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                                                            title="Verify Document"
                                                        >
                                                            <FontAwesomeIcon icon={faCheck} />
                                                        </button>
                                                        <button
                                                            onClick={() => openRejectModal(doc.id)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                                                            title="Reject Document"
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <FontAwesomeIcon icon={faFilePdf} className="text-gray-300 text-5xl mb-3" />
                        <p className="text-gray-500">No documents available for this user.</p>
                    </div>
                )}

                {/* Required Documents Information */}
                <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Required Documents Status</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {documentTypes.map((docType) => {
                            const isUploaded = documents.some(doc => doc.type === docType.id);
                            const isVerified = documents.some(doc => doc.type === docType.id && doc.status === 'VERIFIED');
                            const isRejected = documents.some(doc => doc.type === docType.id && doc.status === 'REJECTED');

                            return (
                                <div key={docType.id} className={`p-4 rounded-lg border ${isVerified ? 'border-green-200 bg-green-50' : isRejected ? 'border-red-200 bg-red-50' : isUploaded ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'}`}>
                                    <div className="flex items-center mb-2">
                                        <FontAwesomeIcon
                                            icon={docType.icon}
                                            className={`${isVerified ? 'text-green-500' : isRejected ? 'text-red-500' : isUploaded ? 'text-yellow-500' : 'text-gray-400'} mr-2`}
                                        />
                                        <h4 className="font-medium">{docType.name}</h4>
                                    </div>
                                    <div className="ml-6 text-sm">
                                        {isVerified ? (
                                            <span className="text-green-600 flex items-center">
                                                <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Verified
                                            </span>
                                        ) : isRejected ? (
                                            <span className="text-red-600 flex items-center">
                                                <FontAwesomeIcon icon={faTimesCircle} className="mr-1" /> Rejected
                                            </span>
                                        ) : isUploaded ? (
                                            <span className="text-yellow-600 flex items-center">
                                                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" /> Pending Review
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">Not uploaded</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Rejection Modal */}
            <RejectionModal />
        </div>
    );
};

export default AdminDocumentVerificationTab;