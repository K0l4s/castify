export default function FancyCard({
  title,
  icon,
  number,
  color,
  cornorColor,
}: {
  title: string;
  icon: React.ReactNode;
  number: number;
  color?: string;
  cornorColor?: string;
}) {
  const gradient = color ? color : 'from-red-700 to-red-500';
  const cornor = cornorColor ? cornorColor : 'bg-red-900';

  return (
    <div className="relative w-[200px] h-[200px] group hover:scale-105 transition-transform duration-300 ease-in-out rounded-lg shadow-lg flex flex-col justify-center items-center p-4 text-center text-gray-800">
      {/* corners */}
      <div className={`w-[38px] h-[25px] ${cornor} absolute -bottom-3 left-1 rotate-[30deg] opacity-0 group-hover:opacity-100 transition-all duration-300`}></div>
      <div className={`w-[40px] h-[25px] ${cornor} absolute top-2 -right-[10px] rotate-[150deg] opacity-0 group-hover:opacity-100 transition-all duration-300`}></div>

      {/* background gradient */}
      <div className={`w-full h-full top-5 left-5 absolute p-2 bg-gradient-to-t shadow-lg ${gradient}  opacity-0 group-hover:opacity-100 transition-all duration-300`}>
        <div className="w-full h-full rounded-sm border-2 border-white border-dashed z-0"></div>
      </div>

      {/* content */}
      <div className={`absolute w-full  h-full bg-white rounded-xl group-hover:rounded-none transition-all duration-300 z-0 text-orange-500 flex flex-col justify-center p-4 items-center shadow-lg`}>
        <div className="text-4xl mb-2 text-gray-500">{icon}</div>
        <h2 className={`text-2xl font-bold bg-gradient-to-t ${gradient} bg-clip-text text-transparent`}>{title}</h2>
        <p className="text-3xl font-semibold text-gray-500">{number}</p>
      </div>
    </div>
  );
}
