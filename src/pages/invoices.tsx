import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "../components/Sidebar";
import DataTable from "react-data-table-component";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRangePicker } from "react-date-range";
import { format } from "date-fns";
import { useRouter } from "next/router";
import { Pencil, Printer, Trash } from "lucide-react";
import { Header } from "../components/Header";

export default function Invoices() {
    
    const [invoices, setInvoices] = useState<any>([]);
    const [partners, setPartners] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [partnerFilter, setPartnerFilter] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: "selection",
        },
    ]);

    const router = useRouter();

    const getNamaPartner = (partnerId : any) => {
        const partner:any = partners.find((p:any) => p.ID === partnerId);
        return partner ? partner.NAMA : "";
    };

    useEffect(() => {

        const fetchInvoices = async () => {
            setLoading(true);
            let query = supabase.from("INVOICES").select("*,DETAIL_INVOICE(UNIT_PRICE,QTY)");

            if (dateRange[0].startDate && dateRange[0].endDate) {
                const startDate = format(dateRange[0].startDate, "yyyy-MM-dd");
                const endDate = format(dateRange[0].endDate, "yyyy-MM-dd");
                query = query.gte("TANGGAL", startDate).lte("TANGGAL", endDate);
            }
            if (partnerFilter) {
                query = query.eq("PARTNER_ID", partnerFilter);
            }
            query = query.order('NO', { ascending: true });
            const { data, error } = await query;
            if (error) {
                console.error(error);
            }
            else {
                const processedData:any = data.map((invoice) => ({
                    ...invoice,
                    total: invoice.DETAIL_INVOICE.reduce(
                        (sum:any, detail:any) => sum + detail.UNIT_PRICE * detail.QTY, 0
                    ),
                }));

                setInvoices(processedData);
            }
            setLoading(false);
        };

        fetchInvoices();
    }, [dateRange, partnerFilter]);

    useEffect(() => {
        const fetchPartners = async () => {
            const { data, error } = await supabase.from("PARTNER").select("*");
            if (error) console.error(error);
            else setPartners(data);
        };

        fetchPartners();
    }, []);

    const handleSearch = (event:any) => {
        setSearch(event.target.value);
    };

    const handleDateSelect = (ranges:any) => {
        setDateRange([ranges.selection]);
    };

    const filteredInvoices = invoices.filter((invoice:any) =>
        invoice.NO.toLowerCase().includes(search.toLowerCase())
    );

    const columns:any = [
        { name: "NO", selector: (row: any, index: number) => index + 1, sortable: false },
        { name: "TANGGAL", selector: (row: any) => row.TANGGAL, sortable: true },
        { name: "INVOICES", selector: (row: any) => row.NO, sortable: true },
        { name: "PARTNER", selector: (row: any) => getNamaPartner(row.PARTNER_ID), sortable: false },
        { name: "NOMINAL", selector: (row: any) => `${row.total}`, sortable: false },
        {
            name: "Actions",
            cell: (row: { NO: any; }) => (
                <div className="space-x-3">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={()=>handleEdit(row.NO)}><Pencil size={14} /></button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleDelete(row.NO)}><Trash size={14} /></button>
                    <button className="bg-green-500 text-white px-3 py-1 rounded"><Printer size={14} /></button>
                </div>
            ),
        },
    ];

    const handleEdit = (id: any) => {
        router.push(`/edit_invoice?id=${id}`);
    };

    const handleDelete = async (id: any) => {
        if (!confirm("Apakah Anda yakin ingin menghapus invoice ini?")) return;

        setLoading(true);
        const { error } = await supabase.from("INVOICES").delete().eq("NO", id);

        if (error) {
            console.error("Gagal menghapus invoice:", error);
        } else {
            setInvoices(invoices.filter((invoice: { NO: any; }) => invoice.NO !== id));
        }
        setLoading(false);
    };

    const handlePrint = (id: any) => {
        router.push(`/print_invoice/${id}`);
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <div className="flex-1 p-6">
                    <h1 className="text-3xl font-bold mb-4">Invoices</h1>
                    <hr />
                    <div className="mt-4 mb-4 flex space-x-4 relative">
                        <input
                            type="text"
                            placeholder="Cari Invoice..."
                            value={search}
                            onChange={handleSearch}
                            className="p-2 border rounded w-1/3"
                        />
                        <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="p-2 border rounded bg-gray-200 w-1/4"
                        >
                            {`${format(dateRange[0].startDate, "dd/MM/yyyy")} - ${format(dateRange[0].endDate, "dd/MM/yyyy")}`}
                        </button>
                        {showDatePicker && (
                            <div className="absolute top-12 left-0 z-10 bg-white shadow-lg rounded-lg p-4">
                                <DateRangePicker
                                    editableDateInputs={true}
                                    ranges={dateRange}
                                    onChange={handleDateSelect}
                                    moveRangeOnFirstSelection={true}
                                />
                            </div>
                        )}
                        <select
                            value={partnerFilter}
                            onChange={(e) => setPartnerFilter(e.target.value)}
                            className="p-2 border rounded w-1/4"
                        >
                            <option value="">Semua Partner</option>
                            {partners.map((partner: any) => (
                                <option key={partner.ID} value={partner.ID}>
                                    {partner.NAMA}
                                </option>
                            ))}
                        </select>
                        <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => router.push("/tambah_invoices")}>Tambah Invoice</button>
                    </div>
                    <div className="flex justify-between mt-4 p-4 bg-white shadow rounded-lg">
                        <h2 className="text-lg font-bold">Total Jumlah Invoices:</h2>
                        <span className="text-lg font-bold">{filteredInvoices.length} Invoice(s)</span>
                    </div>
                    <div className="bg-white p-4 shadow rounded-lg mt-3">
                        <DataTable columns={columns} data={filteredInvoices} progressPending={loading} pagination />
                    </div>
                </div>
            </div>

        </div>
    );
}
