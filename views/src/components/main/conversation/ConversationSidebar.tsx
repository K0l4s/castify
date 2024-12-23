const ConversationSidebar = () => {
    return (
        <div className="h-screen w-56 text-black bg-gray-100 border-r"
        >
            <div className="p-4">
                <h1 className="text-xl font-bold">Conversations</h1>
                <div className="mt-4">
                    <div className="flex items-center gap-2">
                        <img
                            src="https://randomuser.me/api/portraits"
                            alt="avatar"
                            className="w-10 h-10 rounded-full"
                        />
                        <div>
                            <h2 className="font-semibold">John Doe</h2>
                            <p className="text-gray-500">Hello, how are you?</p>
                        </div>
                    </div>
                </div></div>
        </div>
    )
}

export default ConversationSidebar