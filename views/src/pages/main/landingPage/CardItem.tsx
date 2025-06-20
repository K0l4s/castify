import { Link } from "react-router-dom";

interface CardItemProps {
    title: string;
    subtitle: string;
    label: string;
    image: string;
    linkText: string;
    linkTo: string;
}

export const CardItem = ({
    title,
    subtitle,
    label,
    image,
    linkText,
    linkTo,
}: CardItemProps) => {
    // const backgroundImage = "https://tascam.com/wp-content/uploads/images/products/_tascam/mixcast_4/mixcast_4_w_4_people.jpg"
    return (
        <div
            className="w-full relative rounded-2xl h-full text-white flex flex-wrap items-center justify-between shadow-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300"
            style={{
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Overlay tối để dễ đọc chữ */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm hover:backdrop-blur-none z-0"></div>

            {/* Decorative Circles */}
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-2xl z-0"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-violet-300/20 rounded-full blur-2xl z-0"></div>

            {/* Content */}
            <div className="flex flex-col gap-4 px-5 py-6 z-10">
                <div>
                    <span className="uppercase tracking-widest text-gray-100 font-medium text-xs bg-white/10 px-2 py-0.5 rounded-full shadow">
                        {label}
                    </span>
                    <hr className="my-2 border-gray-200/30" />
                    <span className="block text-2xl font-extrabold leading-tight drop-shadow-lg">
                        <span className="text-white">{title}</span>
                        <span className="block text-lg font-semibold text-violet-100 mt-1">
                            {subtitle}
                        </span>
                    </span>
                </div>
                <Link
                    to={linkTo}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-sky-600 font-bold text-base shadow-lg hover:bg-sky-50 hover:text-violet-600 transition-all duration-300 group"
                >
                    <span>{linkText}</span>
                    <svg
                        className="w-4 h-4 text-sky-500 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>
            </div>
        </div>

    );
};
