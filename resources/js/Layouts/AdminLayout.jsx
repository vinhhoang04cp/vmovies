export default function AdminLayout({ children }) {
    return (
        <div className="flex h-screen bg-gray-50 font-sans text-black">
            {/* Main Content Full Width */}
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    );
}

