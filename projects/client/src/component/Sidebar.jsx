import React, {useState} from 'react'
import { HiMenu } from 'react-icons/hi';
import { Link } from 'react-router-dom';

export default function Sidebar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };
  return (
    <div className="flex h-screen">
        <div className="hidden lg:flex flex-col w-80 bg-white border-lightgrey border-r-2 text-darkgrey font-inter text-lg">
            <ul className="py-4">
                <li className="px-4 py-2 w-9/12 border-b border-lightgrey">Home</li>
                <li className="px-4 py-2 w-9/12 border-b border-lightgrey">Manage Product</li>
                <li className="px-4 py-2 w-9/12 border-b border-lightgrey">Manage Category</li>
                <li className="px-4 py-2 w-9/12 border-b border-lightgrey"><Link to="/admin/manage-branch">Manage Branch</Link></li>
                <li className="px-4 py-2 w-9/12 border-b border-lightgrey">Orders</li>
                <li className="px-4 py-2 w-9/12 border-b border-lightgrey">Reports</li>
                <li className="px-4 py-2 w-9/12 border-b border-lightgrey text-reddanger">Log Out</li>
            </ul>
        </div>
        <div className={`lg:hidden fixed top-0 left-0 ${isMobileMenuOpen ? 'h-screen border-r-2 border-lightgrey' : 'h-16 left-14 bg-white'} w-64 bg-white text-darkgrey transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform`}>
            <div className="p-4 pl-6 h-16 flex justify-end">
                <HiMenu className="text-maingreen w-6 h-6" onClick={toggleMobileMenu} />
            </div>
            <ul className="pt-4">
                <li className="px-4 py-2 w-9/12 border-b border-lightgrey">Home</li>
                <li className="px-4 py-2 w-9/12 border-b border-lightgrey">Manage Product</li>
                <li className="px-4 py-2 w-9/12 border-b border-lightgrey">Manage Category</li>
                <li className="px-4 py-2 w-9/12 border-b border-lightgrey"><Link to="/admin/manage-branch">Manage Branch</Link></li>
                <li className="px-4 py-2 w-9/12 border-b border-lightgrey">Orders</li>
                <li className="px-4 py-2 w-9/12 border-b border-lightgrey">Reports</li>
                <li className="px-4 py-2 w-9/12 border-b border-lightgrey text-reddanger">Log Out</li>

            </ul>
        </div>
    </div>
  )
}
