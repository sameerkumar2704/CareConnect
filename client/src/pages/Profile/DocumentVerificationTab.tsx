import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/contants';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLink,
    faCheckCircle,
    faTimesCircle,
    faFilePdf,
    faIdCard,
    faCertificate,
    faBuilding,
    faTrash,
    faFileImage,
    faExternalLinkAlt,
    faExclamationTriangle,
    faLock,
    faEdit,
} from '@fortawesome/free-solid-svg-icons';

interface Document {
    id: string;
    name: string;
    type: string;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    url: string;
    createdAt: string; // Changed from uploadedAt to match backend model
    updatedAt: string; // Added to match backend model
    rejectionReason?: string;
}

interface DocumentVerificationTabProps {
    userId: string;
    role: string;
}

const DocumentVerificationTab = ({ userId, role }: DocumentVerificationTabProps) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [selectedType, setSelectedType] = useState<string>('');
    const [driveLink, setDriveLink] = useState<string>('');
    const [documentName, setDocumentName] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    // Document type requirements based on role
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
            // Updated API URL to match your specified endpoint
            const response = await axios.get(`${API_URL}/hospitals/documents/${userId}`);
            setDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
            setDocuments([]);
        } finally {
            setIsLoading(false);
        }
    };

    const validateDriveLink = (link: string): boolean => {
        // Basic validation for Google Drive links
        return link.includes('drive.google.com') || link.includes('docs.google.com');
    };

    const handleSubmitLink = async () => {
        if (!selectedType || !driveLink) {
            setError('Please select a document type and provide a Google Drive link');
            return;
        }

        if (!validateDriveLink(driveLink)) {
            setError('Please provide a valid Google Drive link');
            return;
        }

        if (!documentName.trim()) {
            setError('Please provide a document name');
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');

        const documentData = {
            name: selectedType,
            url: driveLink,
        };

        try {
            // Updated API URL and request structure to match your specified endpoint
            await axios.post(`${API_URL}/hospitals/documents/${userId}`, {
                document: documentData,
            });

            setSuccess('Document link submitted successfully!');
            setDriveLink('');
            setSelectedType('');
            setDocumentName('');
            fetchDocuments(); // Refresh the documents list
        } catch (error) {
            console.error('Error submitting document link:', error);
            setError('Failed to submit document link. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteDocument = async (documentId: string) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                // Updated API URL to match your specified endpoint
                await axios.delete(`${API_URL}/documents/${userId}`, {
                    data: { id: documentId }
                });
                setSuccess('Document deleted successfully!');
                fetchDocuments(); // Refresh the documents list
            } catch (error) {
                console.error('Error deleting document:', error);
                setError('Failed to delete document. Please try again.');
            }
        }
    };

    const handleEditLink = (document: Document) => {
        setSelectedType(document.type);
        setDriveLink(document.url);
        setDocumentName(document.name);

        // Scroll to the form
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
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

    // Check if document type is already submitted and pending/verified
    const isDocumentLocked = (documentType: string) => {
        return documents.some(doc =>
            doc.name === documentType &&
            (doc.status === 'PENDING' || doc.status === 'VERIFIED')
        );
    };

    // Get available document types for submission (not locked)
    const getAvailableDocumentTypes = () => {
        return documentTypes.filter(type => !isDocumentLocked(type.id));
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Document Verification</h2>

            {/* Document Link Submission Section */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium mb-4">Submit Document Link</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Document Type</label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="">Select Document Type</option>
                            {getAvailableDocumentTypes().map((type) => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                        {getAvailableDocumentTypes().length === 0 && (
                            <p className="text-sm text-gray-600 mt-2">All document types are currently locked (pending verification or already verified)</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Document Name</label>
                        <input
                            type="text"
                            value={documentName}
                            onChange={(e) => setDocumentName(e.target.value)}
                            placeholder="Enter document name"
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-gray-700 mb-2">Google Drive Link</label>
                    <div className="flex">
                        <input
                            type="text"
                            value={driveLink}
                            onChange={(e) => setDriveLink(e.target.value)}
                            placeholder="Paste your Google Drive link here"
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Please ensure your document is shared with viewing permissions
                    </p>
                </div>

                {error && (
                    <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-md">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mt-4 bg-green-50 text-green-700 p-3 rounded-md">
                        {success}
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSubmitLink}
                        disabled={submitting || !driveLink || !selectedType || !documentName || getAvailableDocumentTypes().length === 0}
                        className="bg-teal-500 text-white px-6 py-2 rounded-md hover:bg-teal-600 transition duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FontAwesomeIcon icon={faLink} className="mr-2" />
                        {submitting ? 'Submitting...' : 'Submit Document Link'}
                    </button>
                </div>
            </div>

            {/* Document Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium mb-4">Verification Status</h3>
                <div className="mt-2 mb-4 bg-blue-50 p-4 rounded-md text-blue-700 text-sm">
                    <p className="font-medium mb-1">Important Information:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>All submitted document links will be reviewed by our team within 2-3 business days</li>
                        <li>Make sure all documents are accessible via the provided Google Drive links</li>
                        <li>You will receive an email notification once your documents are verified</li>
                        <li>Documents that are rejected will require re-submission with a new link</li>
                        <li>You cannot submit new links for documents that are pending verification or already verified</li>
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
                                    <th className="py-3 px-6 text-left">Submitted</th>
                                    <th className="py-3 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm">
                                {documents.map((doc) => (
                                    <tr key={doc.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-3 px-6 text-left">
                                            <div className="flex items-center">
                                                <FontAwesomeIcon
                                                    icon={doc.name.includes('photo') ? faFileImage : faFilePdf}
                                                    className="mr-2 text-teal-500"
                                                />
                                                <span className="font-medium">{doc.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-left">
                                            {documentTypes.find(t => t.id === doc.name)?.name || doc.name}
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
                                            {formatDate(doc.createdAt)}
                                        </td>
                                        <td className="py-3 px-6 text-right">
                                            <div className="flex item-center justify-end">
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-4 mr-4 transform hover:text-teal-500 hover:scale-110"
                                                >
                                                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                                                </a>

                                                {doc.status === 'REJECTED' && (
                                                    <button
                                                        onClick={() => handleEditLink(doc)}
                                                        className="w-4 mr-4 transform hover:text-blue-500 hover:scale-110"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                )}

                                                {doc.status === 'PENDING' || doc.status === 'VERIFIED' ? (
                                                    <span className="w-4 mr-2 text-gray-400">
                                                        <FontAwesomeIcon icon={faLock} />
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleDeleteDocument(doc.id)}
                                                        className="w-4 mr-2 transform hover:text-red-500 hover:scale-110"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
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
                        <p className="text-gray-500">No documents submitted yet. Please submit required document links for verification.</p>
                    </div>
                )}

                {/* Required Documents Information */}
                <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Required Documents</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {documentTypes.map((docType) => {
                            const isVerified = documents.some(doc => doc.name === docType.id && doc.status === 'VERIFIED');
                            const isPending = documents.some(doc => doc.name === docType.id && doc.status === 'PENDING');
                            const isRejected = documents.some(doc => doc.name === docType.id && doc.status === 'REJECTED');

                            return (
                                <div key={docType.id} className={`p-4 rounded-lg border ${isVerified ? 'border-green-200 bg-green-50' : isPending ? 'border-yellow-200 bg-yellow-50' : isRejected ? 'border-red-100 bg-red-50' : 'border-gray-200'}`}>
                                    <div className="flex items-center mb-2">
                                        <FontAwesomeIcon icon={docType.icon} className={`${isVerified ? 'text-green-500' : isPending ? 'text-yellow-500' : isRejected ? 'text-red-500' : 'text-gray-400'} mr-2`} />
                                        <h4 className="font-medium">{docType.name}</h4>
                                    </div>
                                    <div className="ml-6 text-sm">
                                        {isVerified ? (
                                            <span className="text-green-600 flex items-center">
                                                <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Verified
                                                <FontAwesomeIcon icon={faLock} className="ml-2 text-gray-500" title="This document is locked" />
                                            </span>
                                        ) : isPending ? (
                                            <span className="text-yellow-600 flex items-center">
                                                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" /> Pending Verification
                                                <FontAwesomeIcon icon={faLock} className="ml-2 text-gray-500" title="This document is locked" />
                                            </span>
                                        ) : isRejected ? (
                                            <span className="text-red-600 flex items-center">
                                                <FontAwesomeIcon icon={faTimesCircle} className="mr-1" /> Rejected (Re-submit)
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">Not submitted</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentVerificationTab;