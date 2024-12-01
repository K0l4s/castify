import { useEffect, useState } from "react"
import UserInforCard from "../../../components/main/profile/UserInforCard"
import { userCard } from "../../../models/User"
import { userService } from "../../../services/UserService"

const SuggestFollow = () => {
    const [suggestUsers, setSuggestUsers] = useState<userCard[]>([])
    useEffect(() => {
        userService.getSuggestUser().then(res => {
            setSuggestUsers(res.data)
        })
    }, [])
    return (
        <div className="m-auto">
            <h1 className="text-xl text-center font-bold mb-3">Suggested Follow</h1>
            <div className="grid grid-cols-1 xl:grid-cols-4 md:grid-cols-2 gap-4 max-w-6xl m-auto">
                {suggestUsers.map((user, index) => (
                    <div key={index} className="flex">
                        <UserInforCard {...user} />
                    </div>
                ))}
            </div>

        </div>
    )
}

export default SuggestFollow