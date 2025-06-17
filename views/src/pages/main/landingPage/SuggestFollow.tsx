import { useEffect, useState } from "react"
import UserInforCard from "../../../components/main/profile/UserInforCard"
import { userCard } from "../../../models/User"
import { userService } from "../../../services/UserService"
import { useSelector } from "react-redux"
import { RootState } from "../../../redux/store"
import { Link } from "react-router-dom"
import { useLanguage } from "../../../context/LanguageContext"

const SuggestFollow = () => {
    const {language} = useLanguage();
    const [suggestUsers, setSuggestUsers] = useState<userCard[]>([])
    useEffect(() => {
        userService.getSuggestUser().then(res => {
            setSuggestUsers(res.data.content)
            console.log("Suggest users: ", res)
        })
    }, [])
    const userId = useSelector((state: RootState) => state.auth.user?.id)
    if (!userId || suggestUsers.length<1)
        return null;
    return (
        <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-950 via-indigo-900 to-gray-900 rounded-2xl shadow-2xl mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 text-white">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center sm:text-left drop-shadow-md">
                    {language.landingPage.suggestFollowTitle || "Creator matching for you!"}
                </h1>
                <Link to={"/suggest"} className="mt-4 sm:mt-0 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold shadow-md transition duration-200">
                    {language.common.viewAll || "View All"}
                </Link>
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