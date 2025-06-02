import { useEffect, useState } from "react"
import UserInforCard from "../../../components/main/profile/UserInforCard"
import { userCard } from "../../../models/User"
import { userService } from "../../../services/UserService"
import { useSelector } from "react-redux"
import { RootState } from "../../../redux/store"

const SuggestFollow = () => {
    const [suggestUsers, setSuggestUsers] = useState<userCard[]>([])
    useEffect(() => {
        userService.getSuggestUser().then(res => {
            setSuggestUsers(res.data.content)
        })
    }, [])
    const userId = useSelector((state: RootState) => state.auth.user?.id)
    if (!userId || suggestUsers.length<1)
        return null;
    return (
        <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-950 via-indigo-900 to-gray-900 rounded-2xl shadow-2xl mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 text-white">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center sm:text-left drop-shadow-md">
                    Creator matching with you
                </h1>
                <button className="mt-4 sm:mt-0 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold shadow-md transition duration-200">
                    See more
                </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
                {suggestUsers?.map((user, index) => (
                    <UserInforCard key={index} {...user} />
                ))}
            </div>
        </div>


    )
}

export default SuggestFollow