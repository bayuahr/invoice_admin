import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "../../components/Sidebar";
import DataTable from "react-data-table-component";
import Modal from "react-modal";
import { Pencil, Trash } from "lucide-react";
import { Header } from "../../components/Header";

export default function MasterPayment() {
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [masterPayment, setMasterPayment] = useState<any>([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [isEdit, setIsEdit] = useState(false);
    
    useEffect(() => {
        const fetchMasterPayment = async () => {
            setLoading(true);
            let { data, error } = await supabase.from("PAYMENT").select("*");
            if (error) console.error(error);
            else setMasterPayment(data);
            setLoading(false);
        };
        fetchMasterPayment();
    }, []);

    const handleSearch = (event:any) => {
        setSearch(event.target.value);
    };

    const filteredMasterPayment = masterPayment.filter((Payment:any) =>
        Payment.NAMA.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        { name: "NO", selector: (row:any, index:any) => index + 1, sortable: false },
        { name: "NAMA Payment", selector: (row:any) => row.NAMA, sortable: true },
        {
            name: "Actions",
            cell: (row:any) => (
                <div className="space-x-3">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => openEditModal(row)}><Pencil size={14} /></button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleDelete(row.id)}><Trash size={14} /></button>
                </div>
            ),
        },
    ];

    const openAddModal = () => {
        setIsEdit(false);
        setFormData({ NAMA: ""});
        setModalIsOpen(true);
    };

    const openEditModal = (Payment:any) => {
        setIsEdit(true);
        setFormData(Payment);
        setModalIsOpen(true);
    };

    const handleSubmit = async () => {
        if (isEdit) {
            await supabase.from("PAYMENT").update(formData).eq("id", formData.id);
        } else {
            await supabase.from("PAYMENT").insert([formData]);
        }
        setModalIsOpen(false);
        window.location.reload();
    };

    const handleDelete = async (id:any) => {
        if (confirm("Apakah Anda yakin ingin menghapus Payment ini?")) {
            await supabase.from("PAYMENT").delete().eq("id", id);
            window.location.reload();
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <div className="flex-1 p-6">
                    <h1 className="text-3xl font-bold mb-4">Master Payment</h1>
                    <hr />
                    <div className="mt-4 mb-4 flex space-x-4 relative">
                        <input
                            type="text"
                            placeholder="Cari Payment..."
                            value={search}
                            onChange={handleSearch}
                            className="p-2 border rounded w-1/3"
                        />
                        <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={openAddModal}>Tambah Payment</button>
                    </div>
                    <div className="flex justify-between mt-4 p-4 bg-white shadow rounded-lg">
                        <h2 className="text-lg font-bold">Total Jumlah Payment:</h2>
                        <span className="text-lg font-bold">{filteredMasterPayment.length} Payment</span>
                    </div>
                    <div className="bg-white p-4 shadow rounded-lg mt-3">
                        <DataTable columns={columns} data={filteredMasterPayment} progressPending={loading} pagination />
                    </div>
                </div>
            </div>
            {/* Modal */}
            <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} className="modal" overlayClassName="overlay">
                <h2 className="text-xl font-bold mb-4">{isEdit ? "Edit" : "Tambah"} Payment</h2>
                <input
                    type="text"
                    placeholder="Nama Payment"
                    value={formData.NAMA}
                    onChange={(e) => setFormData({ ...formData, NAMA: e.target.value })}
                    className="p-2 border rounded w-full mb-3"
                />
                <div className="flex space-x-3">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSubmit}>{isEdit ? "Simpan Perubahan" : "Tambah"}</button>
                    <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={() => setModalIsOpen(false)}>Batal</button>
                </div>
            </Modal>
        </div>
    );
}
