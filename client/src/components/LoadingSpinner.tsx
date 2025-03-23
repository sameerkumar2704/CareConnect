{
    /* Loading Spinner Using Tailwind */
}

const LoadingSpinner = () => {
    return (
        <div className="flex justify-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
        </div>
    );
};

export default LoadingSpinner;