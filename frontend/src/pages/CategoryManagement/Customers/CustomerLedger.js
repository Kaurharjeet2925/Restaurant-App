import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
// import ThemedTable from "../../components/ThemedTable";
// import AdjustPaymentModal from "./AdjustPaymentModal";
import apiClient from "../../../apiclient/apiclient";
/* ================= HELPERS ================= */
const formatAmount = (amt) =>
  amt ? `₹ ${amt.toLocaleString()}` : "-";

const formatBalance = (bal) =>
  bal > 0
    ? `₹ ${bal.toLocaleString()} Debit`
    : bal < 0
    ? `₹ ${Math.abs(bal).toLocaleString()} Credit`
    : "₹ 0";

const CustomerLedger = () => {
  const { id: customerId } = useParams();
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [ledgerData, setLedgerData] = useState([]);
  const [customer, setCustomer] = useState(null); // Add customer state

  const [summary, setSummary] = useState({
    totalDebit: 0,
    totalCredit: 0,
    currentBalance: 0,
  });
  const [stats, setStats] = useState({
    totalBills: 0,
    totalBillAmount: 0,
  });

  const [loading, setLoading] = useState(false);
  // const [adjustOpen, setAdjustOpen] = useState(false);
const [search, setSearch] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [type, setType] = useState("all");

  /* ================= FETCH LEDGER ================= */
  const fetchLedger = useCallback(async () => {
    if (!customerId) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/customers/${customerId}/ledger`);
      setLedgerData(res.data.ledger || []);
      setSummary({
        totalDebit: res.data.totalDebit || 0,
        totalCredit: res.data.totalCredit || 0,
        currentBalance: res.data.currentBalance || 0,
      });
    } catch (error) {
      console.error("ledger fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [customerId]);
// Remove handleDownloadReport and all client/clientId usage



const getInitials = (name = "") => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};
useEffect(() => {
  // Only count ledger rows of type "bill"
  const creditOrders = ledgerData.filter((row) => row.type === "bill");
  setStats({
    totalBills: creditOrders.length,
    totalBillAmount: creditOrders.reduce((sum, o) => sum + (o.debit || 0), 0),
  });
}, [ledgerData]);

  /* ================= EFFECT ================= */
  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  /* ================= FETCH CUSTOMER ================= */
  useEffect(() => {
    if (!customerId) return;
    apiClient.get(`/customers/${customerId}`)
      .then(res => setCustomer(res.data))
      .catch(() => setCustomer(null));
  }, [customerId]);

  /* ================= FILTERED LEDGER ================= */
  const filteredLedger = useMemo(() => {
  return ledgerData.filter((row) => {
    const rowDate = new Date(row.createdAt);

    if (fromDate && rowDate < new Date(fromDate)) return false;
    if (toDate && rowDate > new Date(toDate + "T23:59:59")) return false;

    if (type === "debit" && row.debit <= 0) return false;
    if (type === "credit" && row.credit <= 0) return false;

    if (search) {
      const s = search.toLowerCase();
      const desc = row.description?.toLowerCase() || "";
      const note = row.note?.toLowerCase() || "";
      const orderNo = row.orderId ? `ord${row.orderId.toString().slice(-4).toLowerCase()}` : "";
      if (
        !desc.includes(s) &&
        !note.includes(s) &&
        !orderNo.includes(s)
      ) {
        return false;
      }
    }

    return true;
  });
}, [ledgerData, fromDate, toDate, type, search]);

// Remove fetchClient and setClient

  return (
    <div>
      {/* ================= HEADER ================= */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 border"
            title="Back"
          >
            {/* Simple left arrow, or use an icon library if you have one */}
            <span className="text-xl">&#8592;</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Customer Ledger
            </h1>
            <p className="text-sm text-slate-500">
              Complete transaction history with running balance
            </p>
          </div>
        </div>

        {/* Record Payment button removed, use CreditPaymentModal elsewhere */}
      </div>

      {/* ================= SUMMARY CARDS ================= */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 px-1 sm:px-0">

  {/* COLUMN 1 — CLIENT */}
  <div className="bg-white p-3 sm:p-5 rounded-xl border flex items-center gap-4">
  <div className="h-14 w-14 rounded-full bg-blue-900 text-white flex items-center justify-center text-xl font-bold">
    {getInitials(customer?.name)}
  </div>
  <div className="min-w-0">
    <h2 className="text-lg font-semibold truncate">{customer?.name || "Customer"}</h2>
    <p className="text-xs text-slate-500">{customer?.phone ? `📞 ${customer.phone}`:""}</p>
  </div>
</div>

  {/* COLUMN 2 */}
  <div className="bg-orange-50 border-orange-300 p-4 rounded-xl border">
  <p className="text-xs text-orange-500">Total Credit Orders</p>
  <p className="text-2xl text-orange-700 font-bold">
    {stats.totalBills}
  </p>
</div>
  <div className="bg-green-100 p-4 rounded-xl border border-green-300">
    <p className="text-xs text-green-600">Total Billed</p>
    <p className="text-2xl font-bold text-green-700">
      ₹ {summary.totalDebit.toLocaleString()}
    </p>
  </div>

  {/* COLUMN 4 */}
  <div className="bg-blue-50 p-4 rounded-xl border border-blue-300">
    <p className="text-xs text-blue-600">Current Balance</p>
    <p className="text-2xl font-bold text-blue-800">
      {formatBalance(summary.currentBalance)}
    </p>
  </div>

</div>


      {/* ================= FILTER BAR ================= */}
      <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl mb-6">
  <div className="flex flex-wrap gap-3 items-center">
    <input
      type="date"
      value={fromDate}
      onChange={(e) => setFromDate(e.target.value)}
      className="h-9 px-3 rounded-md border text-sm"
    />
    <input
      type="date"
      value={toDate}
      onChange={(e) => setToDate(e.target.value)}
      className="h-9 px-3 rounded-md border text-sm"
    />
    <select
      value={type}
      onChange={(e) => setType(e.target.value)}
      className="h-9 px-3 rounded-md border text-sm"
    >
      <option value="all">All</option>
      <option value="debit">Debit</option>
      <option value="credit">Credit</option>
    </select>
    <input
      type="text"
      placeholder="Search description / order..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="h-9 px-3 rounded-md border text-sm flex-1 min-w-[180px]"
    />
    {/* <button
      className="h-9 px-4 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700"
    >
      Download Report
    </button> */}
  </div>
</div>


      {/* ================= LEDGER TABLE ================= */}
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white">
  <table className="min-w-[700px] w-full">
    <thead className="bg-gray-200 text-slate-700">
      <tr className="h-12">
        <th className="px-6 text-left">Date</th>
        <th className="px-6 text-left">Description</th>
        <th className="px-6 text-right">Debit</th>
        <th className="px-6 text-right">Credit</th>
        <th className="px-6 text-right">Balance</th>
      </tr>
    </thead>
    <tbody>
      {loading ? (
        <tr>
          <td
            colSpan="5"
            className="px-6 py-6 text-center text-slate-500"
          >
            Loading ledger...
          </td>
        </tr>
      ) : filteredLedger.length > 0 ? (
        filteredLedger.map((row) => (
          <tr
            key={row._id}
            className="border-b h-[56px] hover:bg-gray-50"
          >
            <td className="px-6">
              {new Date(row.createdAt).toLocaleDateString()}
            </td>
            <td className="px-6 font-medium">
              {row.type === "bill" && row.orderId ? (
                <span>Order Placed (Order No: #ORD{row.orderId.toString().slice(-4).toUpperCase()})</span>
              ) : row.note ? (
                row.note
              ) : row.description || "-"}
            </td>
            <td className="px-6 text-right text-green-700 font-medium">
              {row.debit ? formatAmount(row.debit) : "-"}
            </td>
            <td className="px-6 text-right text-red-700 font-medium">
              {row.credit ? formatAmount(row.credit) : "-"}
            </td>
            <td className="px-6 text-right font-semibold">
              {formatBalance(row.balanceAfter)}
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td
            colSpan="5"
            className="px-6 py-6 text-center text-slate-500"
          >
            No ledger entries found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

      {/* AdjustPaymentModal removed. Use CreditPaymentModal for adjustments. */}
    </div>
  );
};

export default CustomerLedger;
