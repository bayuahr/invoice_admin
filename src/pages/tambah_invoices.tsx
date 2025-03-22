import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "../components/Sidebar";
import { useRouter } from "next/router";


export default function TambahInvoice() {
     // Fungsi untuk memformat angka menjadi format 000.000
     const formatNumber = (num: number | string) => {
        if (!num) return "0"; // Jika kosong, tampilkan default
        return parseFloat(num.toString().replace(/\./g, ""))
            .toLocaleString("id-ID");
    };

    // Fungsi untuk menghapus titik pemisah ribuan sebelum disimpan
    const parseNumber = (numStr: string) => {
        return numStr.replace(/\./g, ""); // Hapus titik sebelum diproses
    };
    // Header
    const router = useRouter();
    const [partners, setPartners] = useState<any>([]);
    const [listUsaha, setListUsaha] = useState<any>([]);
    const [invoice, setInvoice] = useState({
        NO: "",
        TANGGAL: new Date().toISOString().split("T")[0],
        METODE: "",
        PAYMENT: "",
        KWITANSI: "",
        CUSTOMER: "",
        PARTNER_ID: "",
        USAHA_ID: ""
    });
    const [gross, setGross] = useState(0);
    const [diskon, setDiskon] = useState(0);
    useEffect(() => {
        const fetchUsaha = async () => {
            const { data, error } = await supabase.from("USAHA").select("*");
            if (error) console.error(error);
            else setListUsaha(data);
        };

        fetchUsaha();
    }, []);
    useEffect(() => {
        const fetchPartners = async () => {
            const { data, error } = await supabase.from("PARTNER").select("*");
            if (error) console.error(error);
            else setPartners(data);
        };

        fetchPartners();
    }, []);

    // useEffect(() => {
    //     const fetchInvoiceNumber = async () => {
    //         const newNumber = await generateInvoiceNumber();
    //         setInvoice((prev) => ({ ...prev, NO: newNumber! }));
    //     };

    //     fetchInvoiceNumber();
    // }, []);
    const handleChange = (e: any) => {
        setInvoice({ ...invoice, [e.target.name]: e.target.value });
    };
    const handleSubmit = async () => {
        console.log("Submitting invoice...");
        const { error: invoiceError } = await supabase.from("INVOICES").insert(invoice);
        if (invoiceError) {
            console.error("Invoice insert error:", invoiceError);
            return;
        }

        console.log("Invoice inserted successfully");
        const cleanedRows = rows.map(({ netAmount, ...rest }) => rest);
        const { error: detailError } = await supabase.from("DETAIL_INVOICE").insert(cleanedRows);
        if (detailError) {
            console.error("Detail insert error:", detailError);
            return;
        }

        console.log("Detail invoice inserted successfully");
        alert("Invoice berhasil ditambahkan");

        router.push("/");
    };

    // Detail Invoice
    const [rows, setRows] = useState([
        { SUB: 1, DESCRIPTION: "", QTY: 0, UNIT_PRICE: 0, netAmount: "", INVOICES_NO: invoice.NO },
    ]);
    useEffect(() => {
        if (invoice.NO) {
            setRows([{ SUB: 1, DESCRIPTION: "", QTY: 0, UNIT_PRICE: 0, netAmount: "", INVOICES_NO: invoice.NO }]);
        }
    }, [invoice.NO]);

    const addRow = () => {
        setRows([...rows, { SUB: rows.length + 1, DESCRIPTION: "", QTY: 0, UNIT_PRICE: 0, netAmount: "", INVOICES_NO: invoice.NO }]);
    };

    const deleteRow = (id: any) => {
        const updatedRows = rows.filter(row => row.SUB !== id);

        const normalizedRows = updatedRows.map((row, index) => ({
            ...row,
            SUB: index + 1,
        }));

        setRows(normalizedRows);
    };

    const handleChange2 = (id: any, field: any, value: any) => {
        const updatedRows = rows.map(row =>
            row.SUB === id ? { ...row, [field]: value } : row
        );

        setRows(updatedRows);
    };

    useEffect(() => {
        let totals = 0;
        rows.map((row) => {
            if (row.QTY !== 0 && row.UNIT_PRICE !== 0) {
                totals += (row.QTY) * (row.UNIT_PRICE);
            }
        })
        setGross(totals);
    }, [rows])

    const [keterangan, setKeterangan] = useState("");

    useEffect(() => {
        const fetchKeterangan = async () => {
            const { data, error } = await supabase.from("SETTINGS").select("KETERANGAN_INVOICES").single();
            if (error) console.error(error);
            else setKeterangan(data.KETERANGAN_INVOICES);
        }
        fetchKeterangan()
    }, [])

    // PAYMENT
    const [paymentOptions, setPaymentOptions] = useState<any>([]);
    const [selectedPayment, setSelectedPayment] = useState("");
    const [customPayment, setCustomPayment] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === "custom") {
            setIsAdding(true);
        } else {
            setSelectedPayment(value);
            setIsAdding(false);
        }
        setInvoice({ ...invoice, ['PAYMENT']: e.target.value });

    };

    const handleAddPayment = async () => {
        if (customPayment.trim() && !paymentOptions.includes(customPayment)) {
            await supabase.from("PAYMENT").insert({'NAMA': customPayment});
            setPaymentOptions([...paymentOptions, {'NAMA': customPayment}]);
            setSelectedPayment(customPayment);
        }
        setIsAdding(false);
        setCustomPayment("");
    };

    useEffect(() => {
        const fetchPayment = async () => {
            const { data, error } = await supabase.from("PAYMENT").select("NAMA");
            if (error) console.error(error);
            else setPaymentOptions(data);
        }
        fetchPayment()
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, sub: any, key: string) => {
        const rawValue = parseNumber(e.target.value); // Remove non-numeric characters
        handleChange2(sub, key, rawValue); // Update state with clean number
    };
    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 p-6">
                <h1 className="text-3xl font-bold mb-4">Tambah Invoice</h1>
                <hr />
                <h1 className="text-3xl font-bold mb-4 text-center">Invoice</h1>
                {/* Informasi Invoice */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">No INV</label>
                        <input
                            type="text"
                            name="NO"
                            value={invoice.NO}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            autoComplete="off"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Tanggal</label>
                        <input
                            type="date"
                            name="TANGGAL"
                            value={invoice.TANGGAL}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"

                        />
                    </div>
                </div>

                {/* Metode Transaksi & Pembayaran */}
                <div className="mt-3 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Metode Transaksi</label>
                        <select
                            name="METODE"
                            value={invoice.METODE}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"

                        >
                            <option value="">Pilih Metode</option>
                            <option value="Online">Online</option>
                            <option value="Offline">Offline</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Payment</label>
                        <select
                            name="PAYMENT"
                            value={selectedPayment}
                            onChange={handleSelectChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">-- Pilih Payment --</option>
                            {paymentOptions.map((option:any, index:any) => (
                                <option key={index} value={option.NAMA}>
                                    {option.NAMA}
                                </option>
                            ))}
                            <option value="custom">+ Tambah Metode Baru</option>
                        </select>

                        {isAdding && (
                            <div className="mt-2 flex gap-2">
                                <input
                                    type="text"
                                    value={customPayment}
                                    onChange={(e) => setCustomPayment(e.target.value)}
                                    placeholder="Masukkan metode pembayaran baru"
                                    className="p-2 border rounded w-full"
                                />
                                <button
                                    onClick={handleAddPayment}
                                    className="bg-blue-500 text-white p-2 rounded"
                                >
                                    Tambah
                                </button>
                            </div>
                        )}
                        
                    </div>
                </div>

                {/* KWITANSI & Partner */}
                <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                        <label className="block text-sm font-medium">KWITANSI</label>
                        <select
                            name="KWITANSI"
                            value={invoice.KWITANSI}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"

                        >
                            <option value="">-- Pilih KWITANSI --</option>
                            <option value="Cash">Cash</option>
                            <option value="Non-Cash">Non-Cash</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Partner</label>
                        <select
                            value={invoice.PARTNER_ID}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            name="PARTNER_ID"
                        >
                            <option value="">-- Pilih Partner --</option>
                            {partners.map((partner: any) => (
                                <option key={partner.ID} value={partner.ID}>
                                    {partner.NAMA}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* CUSTOMER dan Usaha*/}
                <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                        <label className="block text-sm font-medium">CUSTOMER</label>
                        <input type="text"
                            name="CUSTOMER"
                            value={invoice.CUSTOMER}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            placeholder="Masukkan Nama CUSTOMER"
                            autoComplete="off"

                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Usaha</label>
                        <select
                            value={invoice.USAHA_ID}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            name="USAHA_ID"
                        >
                            <option value="">-- Pilih Usaha --</option>
                            {listUsaha.map((usaha: any) => (
                                <option key={usaha.ID_USAHA} value={usaha.ID_USAHA}>
                                    {usaha.NAMA_USAHA}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto mt-3">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border p-2">No</th>
                                <th className="border p-2">Description</th>
                                <th className="border p-2">Qty</th>
                                <th className="border p-2">Unit Price</th>
                                <th className="border p-2">Net Amount</th>
                                <th className="border p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={row.SUB}>
                                    <td className="border p-2 text-center">{index + 1}</td>
                                    <td className="border p-2">
                                        <textarea
                                            className="w-full p-1 border rounded"
                                            value={row.DESCRIPTION}
                                            onChange={(e) => handleChange2(row.SUB, "DESCRIPTION", e.target.value)}
                                        />
                                    </td>
                                    <td className="border p-2">
                                        <input
                                            type="number"
                                            className="w-full p-1 border rounded"
                                            value={(row.QTY)}
                                            onChange={(e) => handleChange2(row.SUB, "QTY", e.target.value)}
                                        />
                                    </td>
                                    <td className="border p-2">
                                        <input
                                            type="text"
                                            className="w-full p-1 border rounded"
                                            value={formatNumber(row.UNIT_PRICE)}
                                            onChange={(e) => handleInputChange(e,row.SUB, "UNIT_PRICE")}
                                        />
                                    </td>
                                    <td className="border p-2">
                                        <input
                                            type="text"
                                            className="w-full p-1 border rounded"
                                            value={formatNumber((row.QTY) * (row.UNIT_PRICE)) || 0}
                                            readOnly
                                        />
                                    </td>
                                    <td className="border p-2 text-center">
                                        <button
                                            type="button"
                                            className="bg-red-500 text-white px-2 py-1 rounded"
                                            onClick={() => deleteRow(row.SUB)}
                                        >-</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button
                        type="button"
                        className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
                        onClick={addRow}
                    >+
                    </button>
                </div>
                <div className="mt-4">
                    <p>{keterangan}</p>
                    <div className="flex justify-end mt-6">
                        <div className="w-80 bg-white shadow-lg rounded-2xl p-4 border">
                            <div className="flex justify-between text-lg font-semibold">
                                <span>Gross Total:</span>
                                <span className="text-gray-700">{formatNumber(gross)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-semibold mt-2">
                                <span>Diskon:</span>
                                <span className="text-red-500">- {formatNumber(diskon)}</span>
                            </div>
                            <hr className="my-3 border-gray-300" />
                            <div className="flex justify-between text-xl font-bold">
                                <span>Total:</span>
                                <span className="text-green-600">{formatNumber(gross - diskon)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tombol */}
                <div className="flex justify-between mt-4">
                    <button
                        type="button"
                        className="px-4 py-2 bg-gray-400 text-white rounded"
                        onClick={() => router.push("/")}
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                        onClick={handleSubmit}
                    >
                        Simpan
                    </button>
                </div>
            </div>
        </div >
    )
}
