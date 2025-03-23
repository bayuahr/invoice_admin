import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export const Sidebar = () => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <div className="w-64 bg-gradient-to-b from-blue-500 to-blue-800 text-white p-5 space-y-6">
            <h2 className="text-xl font-bold">Invoice Management</h2>
            <hr />
            <nav>
                <ul className="space-y-4">
                    <li>
                        <a href="/" className="block p-2 hover:bg-blue-700 rounded">Invoices</a>
                    </li>
                    <li>
                        <button
                            className="w-full flex justify-between items-center p-2 hover:bg-blue-700 rounded"
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        >
                            Settings {isSettingsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        {isSettingsOpen && (
                            <ul className="ml-4 mt-2 space-y-2">
                                <li><a href="/settings/master-usaha" className="block p-2 hover:bg-blue-600 rounded">Master Usaha</a></li>
                                <li><a href="/settings/master-partner" className="block p-2 hover:bg-blue-600 rounded">Master Partner</a></li>
                                <li><a href="/settings/master-payment" className="block p-2 hover:bg-blue-600 rounded">Master Payment</a></li>
                                <li><a href="/settings/setting" className="block p-2 hover:bg-blue-600 rounded">Setting</a></li>
                            </ul>
                        )}
                    </li>
                </ul>
            </nav>
        </div>
    );
};
