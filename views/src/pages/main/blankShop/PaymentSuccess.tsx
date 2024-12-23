

const PaymentSuccess = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
            style={{
                background: 'linear-gradient(180deg, #006994 0%, #003366 100%)'
            }}>
            {/* Animated sea creatures */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="animate-swim1 absolute" style={{ left: '10%', top: '20%' }}>
                    <div className="text-4xl ">🐠</div>
                </div>
                <div className="animate-swim2 absolute" style={{ right: '15%', top: '40%' }}>
                    <div className="text-5xl ">🐋</div>
                </div>
                <div className="animate-swim3 absolute" style={{ left: '20%', bottom: '30%' }}>
                    <div className="text-3xl ">🐟</div>
                </div>
                <div className="animate-swim4 absolute" style={{ right: '25%', bottom: '20%' }}>
                    <div className="text-4xl ">🐡</div>
                </div>
                <div className="animate-swim5 absolute" style={{ left: '40%', top: '15%' }}>
                    <div className="text-3xl ">🦈</div>
                </div>
            </div>

            {/* Bubbles effect */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="animate-bubble1 absolute bg-white/20 rounded-full w-4 h-4" style={{ left: '10%', bottom: '0' }}></div>
                <div className="animate-bubble2 absolute bg-white/20 rounded-full w-6 h-6" style={{ left: '30%', bottom: '0' }}></div>
                <div className="animate-bubble3 absolute bg-white/20 rounded-full w-3 h-3" style={{ left: '50%', bottom: '0' }}></div>
                <div className="animate-bubble4 absolute bg-white/20 rounded-full w-5 h-5" style={{ left: '70%', bottom: '0' }}></div>
                <div className="animate-bubble5 absolute bg-white/20 rounded-full w-4 h-4" style={{ left: '90%', bottom: '0' }}></div>
            </div>

            <div className="bg-cyan-900/80 backdrop-blur-sm rounded-lg shadow-xl p-8 max-w-md w-full relative z-10 border-2 border-cyan-500/30">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-cyan-100 mb-2 drop-shadow-lg">Payment Success</h1>
                    <p className="text-emerald-300">Your payment is successfully, please check your wallet!</p>
                </div>

                <div className="flex justify-center">
                    <div className="bg-emerald-400/20 p-3 rounded-full">
                        <svg className="w-12 h-12 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                </div>
                {/* redirect to shop */}
                <button className="mt-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500">
                    Go to Shop
                </button>
            </div>

            <style>{`
       @keyframes swim1 {
           0% { transform: translate(0, 0) scaleX(-1); }
           25% { transform: translate(30vw, 20vh) scaleX(-1); }
           50% { transform: translate(30vw, 20vh) scaleX(1); }
           75% { transform: translate(0, 0) scaleX(1); }
           100% { transform: translate(0, 0) scaleX(-1); }
       }
       @keyframes swim2 {
           0% { transform: translate(0, 0) scaleX(1); }
           25% { transform: translate(-20vw, -10vh) scaleX(1); }
           50% { transform: translate(-20vw, -10vh) scaleX(-1); }
           75% { transform: translate(0, 0) scaleX(-1); }
           100% { transform: translate(0, 0) scaleX(1); }
       }
       @keyframes swim3 {
           0% { transform: translate(0, 0) scaleX(-1); }
           25% { transform: translate(25vw, -15vh) scaleX(-1); }
           50% { transform: translate(25vw, -15vh) scaleX(1); }
           75% { transform: translate(0, 0) scaleX(1); }
           100% { transform: translate(0, 0) scaleX(-1); }
       }
       @keyframes swim4 {
           0% { transform: translate(0, 0) scaleX(1); }
           25% { transform: translate(-15vw, 25vh) scaleX(1); }
           50% { transform: translate(-15vw, 25vh) scaleX(-1); }
           75% { transform: translate(0, 0) scaleX(-1); }
           100% { transform: translate(0, 0) scaleX(1); }
       }
       @keyframes swim5 {
           0% { transform: translate(0, 0) scaleX(-1); }
           25% { transform: translate(20vw, 10vh) scaleX(-1); }
           50% { transform: translate(20vw, 10vh) scaleX(1); }
           75% { transform: translate(0, 0) scaleX(1); }
           100% { transform: translate(0, 0) scaleX(-1); }
       }
       @keyframes bubble {
           0% { transform: translateY(0) scale(1); opacity: 0; }
           50% { transform: translateY(-50vh) scale(1.2); opacity: 1; }
           100% { transform: translateY(-100vh) scale(1); opacity: 0; }
       }
       .animate-swim1 { animation: swim1 15s infinite ease-in-out; }
       .animate-swim2 { animation: swim2 20s infinite ease-in-out; }
       .animate-swim3 { animation: swim3 18s infinite ease-in-out; }
       .animate-swim4 { animation: swim4 25s infinite ease-in-out; }
       .animate-swim5 { animation: swim5 22s infinite ease-in-out; }
       .animate-bubble1 { animation: bubble 8s infinite ease-out; }
       .animate-bubble2 { animation: bubble 10s infinite ease-out; }
       .animate-bubble3 { animation: bubble 7s infinite ease-out; }
       .animate-bubble4 { animation: bubble 9s infinite ease-out; }
       .animate-bubble5 { animation: bubble 11s infinite ease-out; }
   `}</style>
        </div>
    )
}

export default PaymentSuccess