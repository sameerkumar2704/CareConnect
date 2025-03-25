{
    /* Loading Spinner Using Tailwind */
}

const LoadingSpinner = () => {
    return (
        <div className="flex justify-center w-full p-8">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2"></div>
        </div>
    );
};

export default LoadingSpinner;