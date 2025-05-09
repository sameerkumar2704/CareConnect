import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/contants';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileUpload,
    faCheckCircle,
    faTimesCircle,
    faFilePdf,
    faIdCard,
    faCertificate,
    faBuilding,
    faTrash,
    faFileImage,
    faDownload,
    faExclamationTriangle,
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

interface DocumentVerificationTabProps {
    userId: string;
    role: string;
}

const DocumentVerificationTab = ({ userId, role }: DocumentVerificationTabProps) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [uploading, setUploading] = useState<boolean>(false);
    const [uploadType, setUploadType] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
            const response = await axios.get(`${API_URL}/${role.toLowerCase()}/documents/${userId}`);
            setDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
            setDocuments([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            // Check if file size is less than 5MB
            if (file.size > 5 * 1024 * 1024) {
                setError('File size should be less than 5MB');
                return;
            }

            // Check file type
            const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                setError('File type should be PDF, JPEG, or PNG');
                return;
            }

            setSelectedFile(file);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !uploadType) {
            setError('Please select a file and document type');
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('type', uploadType);
        formData.append('userId', userId);

        try {
            await axios.post(`${API_URL}/${role.toLowerCase()}/documents/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess('Document uploaded successfully!');
            setSelectedFile(null);
            setUploadType('');
            fetchDocuments(); // Refresh the documents list
        } catch (error) {
            console.error('Error uploading document:', error);
            setError('Failed to upload document. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteDocument = async (documentId: string) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                await axios.delete(`${API_URL}/${role.toLowerCase()}/documents/${documentId}`);
                setSuccess('Document deleted successfully!');
                fetchDocuments(); // Refresh the documents list
            } catch (error) {
                console.error('Error deleting document:', error);
                setError('Failed to delete document. Please try again.');
            }
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

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Document Verification</h2>

            {/* Document Upload Section */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium mb-4">Upload New Document</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Document Type</label>
                        <select
                            value={uploadType}
                            onChange={(e) => setUploadType(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="">Select Document Type</option>
                            {documentTypes.map((type) => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">File (PDF, JPEG, PNG only, max 5MB)</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
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
                        onClick={handleUpload}
                        disabled={uploading || !selectedFile || !uploadType}
                        className="bg-teal-500 text-white px-6 py-2 rounded-md hover:bg-teal-600 transition duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FontAwesomeIcon icon={faFileUpload} className="mr-2" />
                        {uploading ? 'Uploading...' : 'Upload Document'}
                    </button>
                </div>
            </div>

            {/* Document Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium mb-4">Verification Status</h3>
                <div className="mt-2 mb-4 bg-blue-50 p-4 rounded-md text-blue-700 text-sm">
                    <p className="font-medium mb-1">Important Information:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>All uploaded documents will be reviewed by our team within 2-3 business days</li>
                        <li>Make sure all documents are clear, legible, and valid</li>
                        <li>You will receive an email notification once your documents are verified</li>
                        <li>Documents that are rejected will require re-submission</li>
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
                                                    className="w-4 mr-4 transform hover:text-teal-500 hover:scale-110"
                                                >
                                                    <FontAwesomeIcon icon={faDownload} />
                                                </a>
                                                <button
                                                    onClick={() => handleDeleteDocument(doc.id)}
                                                    className="w-4 mr-2 transform hover:text-red-500 hover:scale-110"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
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
                        <p className="text-gray-500">No documents uploaded yet. Please upload required documents for verification.</p>
                    </div>
                )}

                {/* Required Documents Information */}
                <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Required Documents</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {documentTypes.map((docType) => {
                            const isUploaded = documents.some(doc => doc.type === docType.id);
                            const isVerified = documents.some(doc => doc.type === docType.id && doc.status === 'VERIFIED');

                            return (
                                <div key={docType.id} className={`p-4 rounded-lg border ${isVerified ? 'border-green-200 bg-green-50' : isUploaded ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'}`}>
                                    <div className="flex items-center mb-2">
                                        <FontAwesomeIcon icon={docType.icon} className={`${isVerified ? 'text-green-500' : isUploaded ? 'text-yellow-500' : 'text-gray-400'} mr-2`} />
                                        <h4 className="font-medium">{docType.name}</h4>
                                    </div>
                                    <div className="ml-6 text-sm">
                                        {isVerified ? (
                                            <span className="text-green-600 flex items-center">
                                                <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Verified
                                            </span>
                                        ) : isUploaded ? (
                                            <span className="text-yellow-600 flex items-center">
                                                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" /> Pending Verification
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
        </div>
    );
};

export default DocumentVerificationTab;