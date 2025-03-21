export const Sidebar = () => {
    return (
        <div className="w-64 bg-gradient-to-b from-blue-500 to-blue-800 text-white p-5 space-y-6">
            <h2 className="text-xl font-bold">Invoice Management</h2>
            <hr />
            <nav>
                <ul className="space-y-4">
                    <li><a href="/" className="block p-2 hover:bg-blue-700 rounded">Dashboard</a></li>
                    <li><a href="/invoices" className="block p-2 hover:bg-blue-700 rounded">Invoices</a></li>
                    <li><a href="/settings" className="block p-2 hover:bg-blue-700 rounded">Settings</a></li>
                </ul>
            </nav>
        </div>
    );
};
