

const Loading = () => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="p-8 rounded-lg shadow-lg flex flex-col items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-50"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-15"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
                </div>
            </div>
            <style>
            {`
                .delay-50 {
                    animation-delay: -0.5s;
                }
                .delay-15 {
                    animation-delay: -0.15s;
                }
            `}
        </style>
        </div>
        
    )
}

export default Loading;