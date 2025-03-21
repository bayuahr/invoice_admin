import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "../components/Sidebar";
import DataTable from "react-data-table-component";
import Modal from "react-modal";
import { Pencil, Trash } from "lucide-react";
import { Header } from "../components/Header";

export default function Setting() {
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [setting, setSetting] = useState<any>([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        const fetchSetting = async () => {
            setLoading(true);
            let { data, error } = await supabase.from("SETTINGS").select("*");
            if (error) console.error(error);
            else setSetting(data);
            setLoading(false);
        };
        fetchSetting();
    }, []);


    const columns = [
        { name: "NO", selector: (row:any, index:any) => index + 1, sortable: false ,width:'100px'},
        { name: "FEE (%)", selector: (row:any) => row.FEE + ' %', sortable: true ,width:'100px' },
        { name: "KETERANGAN", selector: (row:any) => row.KETERANGAN_INVOICES, sortable: true  ,width:'850px'},
        {
            name: "Actions",
            cell: (row:any) => (
                <div className="space-x-3">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => openEditModal(row)}><Pencil size={14} /></button>
                </div>
            ),
        },
    ];

    const openAddModal = () => {
        setIsEdit(false);
        setFormData({ FEE: 0, KETERANGAN_INVOICES: "" });
        setModalIsOpen(true);
    };

    const openEditModal = (usaha:any) => {
        setIsEdit(true);
        setFormData(usaha);
        setModalIsOpen(true);
    };

    const handleSubmit = async () => {
        if (isEdit) {
            await supabase.from("SETTINGS").update(formData).eq("ID", formData.ID);
        } else {
            await supabase.from("SETTINGS").insert([formData]);
        }
        setModalIsOpen(false);
        window.location.reload();
    };


    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <div className="flex-1 p-6">
                    <h1 className="text-3xl font-bold mb-4">Settings</h1>
                    <hr />
                    <div className="bg-white p-4 shadow rounded-lg mt-3">
                        <DataTable columns={columns} data={setting} progressPending={loading} pagination />
                    </div>
                </div>
            </div>
            {/* Modal */}
            <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} className="modal" overlayClassName="overlay">
                <h2 className="text-xl font-bold mb-4">{isEdit ? "Edit" : "Tambah"} FEE</h2>
                <input
                    type="number"
                    placeholder="FEE"
                    value={formData.FEE}
                    onChange={(e) => setFormData({ ...formData, FEE: e.target.value })}
                    className="p-2 border rounded w-full mb-3"
                />
                <textarea
                    placeholder="Keterangan"
                    value={formData.KETERANGAN_INVOICES}
                    onChange={(e) => setFormData({ ...formData, KETERANGAN_INVOICES: e.target.value })}
                    className="p-2 border rounded w-full mb-3"
                ></textarea>
                <div className="flex space-x-3">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSubmit}>{isEdit ? "Simpan Perubahan" : "Tambah"}</button>
                    <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={() => setModalIsOpen(false)}>Batal</button>
                </div>
            </Modal>
        </div>
    );
}
