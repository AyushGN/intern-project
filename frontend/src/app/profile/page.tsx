import { User, Settings, Package, Heart, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full pt-20 md:pt-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
      
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center text-primary">
          <User size={48} />
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="text-2xl font-bold text-gray-900">John Doe</h2>
          <p className="text-gray-500 mb-4">john.doe@example.com</p>
          <button className="bg-primary-light text-primary font-semibold py-2 px-6 rounded-full hover:bg-primary hover:text-white transition-colors">
            Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
            <Package size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">My Orders</h3>
            <p className="text-sm text-gray-500">View your order history</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500">
            <Heart size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Favorites</h3>
            <p className="text-sm text-gray-500">Your saved products</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-600">
            <Settings size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Settings</h3>
            <p className="text-sm text-gray-500">Account preferences</p>
          </div>
        </div>

        <Link href="/login" className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500">
            <LogOut size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-red-500">Sign Out</h3>
            <p className="text-sm text-gray-500">Log out of your account</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
