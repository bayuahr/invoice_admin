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
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    PDFDownloadLink,
    PDFViewer,
} from "@react-pdf/renderer";

// Define styles
const styles = StyleSheet.create({
    page: { padding: 20 },
    section: { marginBottom: 10, border: "1px solid black", padding: 20 },
    title: { fontSize: 8, fontWeight: "bold", textAlign: "center", marginBottom: 5 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        width: 75,
        textAlign: 'left',
        fontWeight: 'bold',
        fontSize: 8,
        marginBottom: 2
    },
    label2: {
        width: 100,
        textAlign: 'left',
        fontWeight: 'bold',
        fontSize: 8,
        marginBottom: 2
    },
    
    text: {
        fontSize: 8,
        marginLeft: 5,
        marginBottom: 2
    },
    text2: {
        fontSize: 8,
        marginLeft: 34,
        marginBottom: 2
    },
    text3: {
        fontSize: 8,
        marginLeft: 12,
        marginBottom: 2
    },
    text4: {
        fontSize: 8,
        marginLeft: 8.5,
        marginBottom: 2
    },
    table: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#000',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingVertical: 2,
    },
    tableHeader: {
        backgroundColor: '#eee',
    },
    tableCell: {
        flex: 1,
        textAlign: 'center',
        padding: 2,
        fontSize: 8
    },
    headerCell: {
        fontWeight: 'bold',
    },
    rowWhite: {
        backgroundColor: '#fff',
    },
    rowGrey: {
        backgroundColor: '#f2f2f2',
    },
    keterangan: {
        marginTop: 10,
        marginBottom: 10
    },
    totals: {
        marginTop: 10,
        flexDirection: "column",
        alignItems: "flex-end",
        marginBottom: 2,
    },
    rowTotal: {
        width: 125,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 2,
    },
    labelTotal: {
        flex: 1,
        fontWeight: "bold",
        fontSize: 8,
    },
    separatorTotal: {
        width: 10,
        textAlign: "center",
        fontSize: 8,
    },
    textTotal: {
        flex: 1,
        textAlign: "right",
        fontSize: 8,
    },
});

const formatRupiah = (num: number | string) => {
    if (!num) return "0"; // Jika kosong, tampilkan default
    return parseFloat(num.toString().replace(/\./g, ""))
        .toLocaleString("id-ID");
};
const terbilangRupiah = (num: number): string => {
    const units = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"];
    const teens = ["sepuluh", "sebelas", "dua belas", "tiga belas", "empat belas", "lima belas", "enam belas", "tujuh belas", "delapan belas", "sembilan belas"];
    const tens = ["", "", "dua puluh", "tiga puluh", "empat puluh", "lima puluh", "enam puluh", "tujuh puluh", "delapan puluh", "sembilan puluh"];
    const thousands = ["", "ribu", "juta", "miliar", "triliun"];

    if (num === 0) return "nol";

    let words = "";
    let i = 0;

    while (num > 0) {
        let chunk = num % 1000;
        if (chunk) {
            let chunkWords = "";

            if (chunk >= 100) {
                chunkWords += chunk === 100 ? "seratus " : units[Math.floor(chunk / 100)] + " ratus ";
                chunk %= 100;
            }
            if (chunk >= 10 && chunk < 20) {
                chunkWords += teens[chunk - 10] + " ";
            } else if (chunk >= 20) {
                chunkWords += tens[Math.floor(chunk / 10)] + " ";
                chunk %= 10;
            }
            if (chunk > 0 && chunk < 10) {
                chunkWords += units[chunk] + " ";
            }

            if (i === 1 && chunk === 1) {
                words = "seribu " + words;
            } else {
                words = chunkWords + thousands[i] + " " + words;
            }
        }
        num = Math.floor(num / 1000);
        i++;
    }

    return words.trim();
};

const InvoiceDocument = ({ invoiceNumber }: { invoiceNumber: string }) => {
    const [data, setData] = useState<any>(null);
    const [dataUsaha, setDataUsaha] = useState<any>(null);
    const [dataPartner, setDataPartner] = useState<any>(null);
    const [keterangan, setKeterangan] = useState("");
    const [fee, setFee] = useState(0);
    const [diskon, setDiskon] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            const { data: invoice } = await supabase
                .from("INVOICES")
                .select("*, DETAIL_INVOICE(*)")
                .eq("NO", invoiceNumber)
                .single();

            if (invoice) {
                const processedInvoice = {
                    ...invoice,
                    total: invoice.DETAIL_INVOICE?.reduce(
                        (sum: number, detail: any) => sum + (detail.UNIT_PRICE || 0) * (detail.QTY || 0),
                        0
                    ),
                };

                setData(processedInvoice);

                const { data: usaha } = await supabase
                    .from("USAHA")
                    .select("NAMA_USAHA, DESKRIPSI_USAHA")
                    .eq("ID_USAHA", invoice.USAHA_ID)
                    .single();
                setDataUsaha(usaha);
                const { data: partner } = await supabase
                    .from("PARTNER")
                    .select("NAMA")
                    .eq("ID", invoice.PARTNER_ID)
                    .single();
                setDataPartner(partner);
            }
        };
        const fetchKeterangan = async () => {
            const { data, error } = await supabase.from("SETTINGS").select("KETERANGAN_INVOICES").single();
            if (error) console.error(error);
            else setKeterangan(data.KETERANGAN_INVOICES);
        }

        const fetchFee = async () => {
            const { data, error } = await supabase.from("SETTINGS").select("FEE").single();
            if (error) console.error(error);
            else setFee(data.FEE);
        }
        fetchFee()
        fetchKeterangan()
        fetchData();
    }, [invoiceNumber]);


    // if (!data || !dataUsaha || !dataPartner) return <Text>Loading...</Text>;
    if (data && dataUsaha && dataPartner) {

        return (
            <Document>
                <Page size={[425.25, 567]} style={styles.page}>
                    <View>
                        <Text style={styles.title}>INVOICE</Text>
                    </View>
                    <View style={styles.header}>
                        <View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Nama Usaha</Text>
                                <Text style={styles.text}>: {dataUsaha.NAMA_USAHA}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>&nbsp;</Text>
                                <Text style={styles.text4}>{dataUsaha.DESKRIPSI_USAHA}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Customer</Text>
                                <Text style={styles.text}>: {data.CUSTOMER}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Partner</Text>
                                <Text style={styles.text}>: {dataPartner.NAMA}</Text>
                            </View>
                        </View>

                        <View>
                            <View style={styles.row}>
                                <Text style={styles.label}>No Invoice</Text>
                                <Text style={styles.text}>: {data.NO}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Tanggal</Text>
                                <Text style={styles.text}>: {data.TANGGAL}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Metode Trx</Text>
                                <Text style={styles.text}>: {data.METODE}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Payment</Text>
                                <Text style={styles.text}>: {data.PAYMENT}</Text>
                            </View>
                        </View>
                    </View>
                    {/* Tabel */}
                    <View style={styles.table}>
                        {/* Header Tabel */}
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={[styles.tableCell, styles.headerCell]}>No</Text>
                            <Text style={[styles.tableCell, styles.headerCell]}>Deskripsi</Text>
                            <Text style={[styles.tableCell, styles.headerCell]}>Qty</Text>
                            <Text style={[styles.tableCell, styles.headerCell]}>Harga</Text>
                            <Text style={[styles.tableCell, styles.headerCell]}>Subtotal</Text>
                        </View>

                        {/* Data dalam tabel */}
                        {data.DETAIL_INVOICE.map((item: any, index: number) => (
                            <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.rowWhite : styles.rowGrey]}>
                                <Text style={styles.tableCell}>{index + 1}</Text>
                                <Text style={styles.tableCell}>{item.DESCRIPTION}</Text>
                                <Text style={styles.tableCell}>{item.QTY}</Text>
                                <Text style={styles.tableCell}>{formatRupiah(item.UNIT_PRICE)}</Text>
                                <Text style={styles.tableCell}>{formatRupiah(item.QTY * item.UNIT_PRICE)}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.keterangan}>
                        <Text style={styles.text}>{keterangan}</Text>
                    </View>
                    <View style={styles.totals}>
                        <View style={styles.rowTotal}>
                            <Text style={styles.labelTotal}>Gross Total</Text>
                            <Text style={styles.separatorTotal}>:</Text>
                            <Text style={styles.textTotal}>{formatRupiah(data.total)}</Text>
                        </View>
                        <View style={styles.rowTotal}>
                            <Text style={styles.labelTotal}>Diskon</Text>
                            <Text style={styles.separatorTotal}>:</Text>
                            <Text style={styles.textTotal}>{formatRupiah(data.DISKON)}</Text>
                        </View>
                        <View style={styles.rowTotal}>
                            <Text style={styles.labelTotal}>Net Total</Text>
                            <Text style={styles.separatorTotal}>:</Text>
                            <Text style={styles.textTotal}>{formatRupiah(data.total - data.DISKON)}</Text>
                        </View>
                    </View>

                    <View style={[{marginTop:10,borderTop:1,borderTopWidth:1,borderTopColor:'black',borderTopStyle:'dashed'}]}>
                        <Text style={[styles.title,{marginTop:10}]}>KWITANSI PEMBAYARAN</Text>
                    </View>
                    <View style={styles.header}>
                        <View>
                            <View style={styles.row}>
                                <Text style={styles.label2}>Telah Terima Dari </Text>
                                <Text style={styles.text}>: {dataUsaha.NAMA_USAHA}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>&nbsp;</Text>
                                <Text style={styles.text2}>{dataUsaha.DESKRIPSI_USAHA}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label2}>Sejumlah Uang</Text>
                                <Text style={styles.text}>: {formatRupiah(data.total - diskon)}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={[styles.text, { fontStyle: "italic" }]}>( {terbilangRupiah(data.total - diskon)} rupiah )</Text>
                            </View>
                        </View>

                        <View>
                            <View style={styles.row}>
                                <Text style={styles.label}>No Invoice</Text>
                                <Text style={styles.text}>: {data.NO}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Metode</Text>
                                <Text style={styles.text}>: {data.KWITANSI}</Text>
                            </View>
                        </View>
                    </View>
                    {/* Tabel */}
                    <View style={styles.table}>
                        {/* Header Tabel */}
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={[styles.tableCell, styles.headerCell]}>No</Text>
                            <Text style={[styles.tableCell, styles.headerCell]}>Deskripsi</Text>
                            <Text style={[styles.tableCell, styles.headerCell]}>Qty</Text>
                            <Text style={[styles.tableCell, styles.headerCell]}>Harga</Text>
                            <Text style={[styles.tableCell, styles.headerCell]}>Subtotal</Text>
                        </View>

                        {/* Data dalam tabel */}
                        {data.DETAIL_INVOICE.map((item: any, index: number) => (
                            <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.rowWhite : styles.rowGrey]}>
                                <Text style={styles.tableCell}>{index + 1}</Text>
                                <Text style={styles.tableCell}>{item.DESCRIPTION}</Text>
                                <Text style={styles.tableCell}>{item.QTY}</Text>
                                <Text style={styles.tableCell}>{formatRupiah(item.UNIT_PRICE)}</Text>
                                <Text style={styles.tableCell}>{formatRupiah(item.QTY * item.UNIT_PRICE)}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.totals}>
                        <View style={styles.rowTotal}>
                            <Text style={styles.labelTotal}>Gross Total</Text>
                            <Text style={styles.separatorTotal}>:</Text>
                            <Text style={styles.textTotal}>{formatRupiah(data.total - data.DISKON)}</Text>
                        </View>
                        <View style={styles.rowTotal}>
                            <Text style={styles.labelTotal}>Aplikasi ({fee}%)</Text>
                            <Text style={styles.separatorTotal}>:</Text>
                            <Text style={styles.textTotal}>{formatRupiah(Math.round(fee * (data.total - data.DISKON) / 100))}</Text>
                        </View>
                        <View style={styles.rowTotal}>
                            <Text style={styles.labelTotal}>Net Total</Text>
                            <Text style={styles.separatorTotal}>:</Text>
                            <Text style={styles.textTotal}>{formatRupiah((data.total - data.DISKON) - (Math.round(fee * (data.total - data.DISKON) / 100)))}</Text>
                        </View>
                    </View>
                </Page>

            </Document>
        );
    }
};
export default function Invoices() {

    const [invoices, setInvoices] = useState<any>([]);
    const [partners, setPartners] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [partnerFilter, setPartnerFilter] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [previewInvoice, setPreviewInvoice] = useState(null);
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: "selection",
        },
    ]);

    const router = useRouter();

    const getNamaPartner = (partnerId: any) => {
        const partner: any = partners.find((p: any) => p.ID === partnerId);
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
                const processedData: any = data.map((invoice) => ({
                    ...invoice,
                    total: invoice.DETAIL_INVOICE.reduce(
                        (sum: any, detail: any) => sum - invoice.DISKON + detail.UNIT_PRICE * detail.QTY, 0
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

    const handleSearch = (event: any) => {
        setSearch(event.target.value);
    };

    const handleDateSelect = (ranges: any) => {
        setDateRange([ranges.selection]);
    };

    const filteredInvoices = invoices.filter((invoice: any) =>
        invoice.NO.toLowerCase().includes(search.toLowerCase())
    );

    const columns: any = [
        { name: "NO", selector: (row: any, index: number) => index + 1, sortable: false },
        { name: "TANGGAL", selector: (row: any) => row.TANGGAL, sortable: true },
        { name: "INVOICES", selector: (row: any) => row.NO, sortable: true },
        { name: "PARTNER", selector: (row: any) => getNamaPartner(row.PARTNER_ID), sortable: false },
        { name: "NOMINAL", selector: (row: any) => `${formatRupiah(row.total)}`, sortable: false },
        {
            name: "Actions",
            cell: (row: { NO: any; }) => (
                <div className="space-x-3">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => handleEdit(row.NO)}><Pencil size={14} /></button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleDelete(row.NO)}><Trash size={14} /></button>
                    {/* <PDFDownloadLink key={row.NO} document={<InvoiceDocument invoiceNumber={row.NO} />} fileName={`invoice_${row.NO}.pdf`}>
                        <button className="bg-green-500 text-white px-3 py-1 rounded">
                            <Printer size={14} />
                        </button>
                    </PDFDownloadLink> */}
                    <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={() => setPreviewInvoice(row.NO)}>
                        <Printer size={14} />
                    </button>
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
        const { error } = await supabase.from("DETAIL_INVOICE").delete().eq("INVOICES_NO", id);

        if (error) {
            console.error("Gagal menghapus invoice:", error);
        } else {
            const { error } = await supabase.from("INVOICES").delete().eq("NO", id);

            setInvoices(invoices.filter((invoice: { NO: any; }) => invoice.NO !== id));
        }
        setLoading(false);
    };

    const handlePrint = (id: any) => {
        <PDFDownloadLink document={<InvoiceDocument invoiceNumber={id} />} fileName="invoice.pdf">
            {({ loading }) => (loading ? "Loading document..." : "Download PDF")}
        </PDFDownloadLink>
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
            {previewInvoice && (
                <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg w-3/4 h-3/4 flex flex-col">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Pratinjau Invoice</h2>
                            <button className="text-red-500 text-lg font-bold" onClick={() => setPreviewInvoice(null)}>
                                ✖
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <PDFViewer width="100%" height="500px">
                                <InvoiceDocument invoiceNumber={previewInvoice} />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
