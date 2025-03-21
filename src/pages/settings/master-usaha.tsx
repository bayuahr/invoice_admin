import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "../components/Sidebar";
import DataTable from "react-data-table-component";
import Modal from "react-modal";
import { Pencil, Trash } from "lucide-react";
import { Header } from "../components/Header";

export default function MasterUsaha() {
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [masterUsaha, setMasterUsaha] = useState<any>([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    
    useEffect(() => {
        const fetchMasterUsaha = async () => {
            setLoading(true);
            let { data, error } = await supabase.from("USAHA").select("*");
            if (error) console.error(error);
            else setMasterUsaha(data);
            setLoading(false);
        };
        fetchMasterUsaha();
    }, []);

    const handleSearch = (event) => {
        setSearch(event.target.value);
    };

    const filteredMasterUsaha = masterUsaha.filter((usaha) =>
        usaha.NAMA_USAHA.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        { name: "NO", selector: (row, index) => index + 1, sortable: false },
        { name: "NAMA USAHA", selector: (row) => row.NAMA_USAHA, sortable: true },
        { name: "DESKRIPSI", selector: (row) => row.DESKRIPSI_USAHA, sortable: true },
        {
            name: "Actions",
            cell: (row) => (
                <div className="space-x-3">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => openEditModal(row)}><Pencil size={14} /></button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleDelete(row.ID_USAHA)}><Trash size={14} /></button>
                </div>
            ),
        },
    ];

    const openAddModal = () => {
        setIsEdit(false);
        setFormData({ NAMA_USAHA: "", DESKRIPSI_USAHA: "" });
        setModalIsOpen(true);
    };

    const openEditModal = (usaha) => {
        setIsEdit(true);
        setFormData(usaha);
        setModalIsOpen(true);
    };

    const handleSubmit = async () => {
        if (isEdit) {
            await supabase.from("USAHA").update(formData).eq("ID_USAHA", formData.ID_USAHA);
        } else {
            await supabase.from("USAHA").insert([formData]);
        }
        setModalIsOpen(false);
        window.location.reload();
    };

    const handleDelete = async (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus usaha ini?")) {
            await supabase.from("USAHA").delete().eq("ID_USAHA", id);
            window.location.reload();
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <div className="flex-1 p-6">
                    <h1 className="text-3xl font-bold mb-4">Master Usaha</h1>
                    <hr />
                    <div className="mt-4 mb-4 flex space-x-4 relative">
                        <input
                            type="text"
                            placeholder="Cari Usaha..."
                            value={search}
                            onChange={handleSearch}
                            className="p-2 border rounded w-1/3"
                        />
                        <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={openAddModal}>Tambah Usaha</button>
                    </div>
                    <div className="flex justify-between mt-4 p-4 bg-white shadow rounded-lg">
                        <h2 className="text-lg font-bold">Total Jumlah Usaha:</h2>
                        <span className="text-lg font-bold">{filteredMasterUsaha.length} Usaha</span>
                    </div>
                    <div className="bg-white p-4 shadow rounded-lg mt-3">
                        <DataTable columns={columns} data={filteredMasterUsaha} progressPending={loading} pagination />
                    </div>
                </div>
            </div>
            {/* Modal */}
            <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} className="modal" overlayClassName="overlay">
                <h2 className="text-xl font-bold mb-4">{isEdit ? "Edit" : "Tambah"} Usaha</h2>
                <input
                    type="text"
                    placeholder="Nama Usaha"
                    value={formData.NAMA_USAHA}
                    onChange={(e) => setFormData({ ...formData, NAMA_USAHA: e.target.value })}
                    className="p-2 border rounded w-full mb-3"
                />
                <textarea
                    placeholder="Deskripsi"
                    value={formData.DESKRIPSI_USAHA}
                    onChange={(e) => setFormData({ ...formData, DESKRIPSI_USAHA: e.target.value })}
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
