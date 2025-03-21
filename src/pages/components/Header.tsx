import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/router";
export const Header = () => {
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (!data.user) {
                router.push("/login");
            } else {
                setUser(data.user);
            }
        };
        fetchUser();
    }, []);
    const router = useRouter()
    return (
        <div className="bg-white p-2 shadow flex justify-between items-center">
            <h1 className="text-xl font-bold">Hello, Admin!</h1>
            <div className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 border-2 border-gray-300 p-2 rounded-full">
                    <img src='https://t4.ftcdn.net/jpg/00/65/77/27/360_F_65772719_A1UV5kLi5nCEWI0BNLLiFaBPEkUbv5Fv.jpg' alt="Profile" className="w-10 h-10 rounded-full" />
                </button>
                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden border border-gray-300">
                        <div className="px-4 py-2 text-gray-700 border-b border-gray-200">{user?.email}</div>
                        <button
                            onClick={async () => {
                                await supabase.auth.signOut();
                                router.push("/login");
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>);
}