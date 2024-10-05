
const Loading = () => {
    return (
        <>
            <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V2.83a1 1 0 112 0V4a8 8 0 018 8h2.83a1 1 0 110 2H20a8 8 0 01-8 8v2.83a1 1 0 11-2 0V20a8 8 0 01-8-8H4a1 1 0 01-1-1z"
                ></path>
            </svg>
            <p>Loading...</p>
        </>
    )
}

export default Loading