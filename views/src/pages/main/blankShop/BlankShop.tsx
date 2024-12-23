
import { useSelector } from "react-redux";
import coin from "../../../assets/images/coin.png";
import { RootState } from "../../../redux/store";
const BlankShop = () => {
    const products = [
        {
            id: 1,
            name: "Winter Vest Jacket",
            price: "79",
            image: "/vest.jpg", // Replace with actual image path
        },
        {
            id: 2,
            name: "Summer Sundress & Hat",
            price: "44",
            image: "/sundress.jpg",
        },
        {
            id: 3,
            name: "Pink Dress & Capris",
            price: "19",
            image: "/pink-dress.jpg",
        },
    ];
    const user = useSelector((state: RootState) => state.auth.user);
    return (
        <div className=" min-h-screen ">
            <div className="flex">
                <main className="flex-1 p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold">Welcome {user?.firstName} to BlankShop!</h1>
                        <p className="text-gray-500 mt-5 mb-5">
                            Get great deals online when you use coupon code{" "}
                            <span className="font-semibold text-blue-600">HAPPYNEWYEAR2025!</span>
                        </p>
                        <p className="text-xl font-semibold mb-5">
                            Your current balance: {user?.coin} <img src={coin} alt="coin" className="w-5 h-5 inline-block" /></p>
                        <button className="mt-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500">
                            Add to Wallet
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="bg-white p-4 rounded shadow-md text-black">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-48 object-cover mb-4"
                                />
                                <h3 className="text-lg font-semibold">{product.name}</h3>
                                <p className="text-blue-600 text-xl flex gap-1 items-center font-bold">{product.price}
                                    <div className="w-5 h-5">
                                        <img src={coin} alt="coin" className="w-full" />
                                    </div>
                                </p>
                                <div className="flex gap-3 px-2">
                                    <button className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500">
                                        GIFT
                                    </button>
                                    <button className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500">
                                        BUY NOW
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default BlankShop;