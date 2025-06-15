import React from "react";
import { Link } from "react-router-dom";

interface SidebarLinkProps {
    to: string;
    icon: React.ReactNode;
    label: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label }) => {
    return (
        <Link
            to={to}
            className="gap-2 flex items-center block py-2.5 px-4 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
        </Link>
    );
};

export default SidebarLink;