import React, { useEffect, useMemo, useState } from "react";
import apiClient from "../../apiclient/apiclient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";

const SalesReport = () => {
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [search, setSearch] = useState("");

  const [cards, setCards] = useState({});
  const [chart, setChart] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [table, setTable] = useState([]);

  /* ================= FETCH REPORT ================= */
  const fetchReport = async () => {
    if (!from || !to) return alert("Please select date range");

    try {
      const start = format(from, "yyyy-MM-dd");
      const end = format(to, "yyyy-MM-dd");

      const res = await apiClient.get(
        `/reports/sales-report?start=${start}&end=${end}`
      );

      setCards(res.data.cards || {});
      setChart(res.data.chart || []);
      setTopProducts(res.data.topProducts || []);
      setTable(res.data.table || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load report");
    }
  };
const downloadExcel = async () => {
  if (!from || !to) {
    alert("Please select date range");
    return;
  }

  try {
    const start = format(from, "yyyy-MM-dd");
    const end = format(to, "yyyy-MM-dd");

    const response = await apiClient.get(
      `/reports/sales-report?start=${start}&end=${end}&download=true`,
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = `sales-report-${start}-to-${end}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();

  } catch (err) {
    console.error(err);
    alert("Download failed");
  }
};
  /* ================= FILTER TABLE ================= */
  const filteredTable = useMemo(() => {
    const q = search.toLowerCase();

    return table.filter((order) =>
      order.orderNumber?.toLowerCase().includes(q) ||
      order.customerName?.toLowerCase().includes(q) ||
      order.tableName?.toLowerCase().includes(q) ||
      order.areaName?.toLowerCase().includes(q)
    );
  }, [table, search]);

  /* ================= DEFAULT LOAD ================= */
  useEffect(() => {
    const today = new Date();
    const last7 = new Date();
    last7.setDate(today.getDate() - 6);

    setFrom(last7);
    setTo(today);
  }, []);

  useEffect(() => {
    if (from && to) fetchReport();
  }, [from, to]);

  return (
    <div className="p-6 min-h-screen">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Sales Report
        </h1>
        <p className="text-sm text-gray-500">
          Overview of completed sales within selected date range
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-white p-4 rounded-xl shadow">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">From</label>
          <DatePicker
            selected={from}
            onChange={setFrom}
            dateFormat="dd-MM-yyyy"
            className="border rounded px-3 py-2 w-40"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">To</label>
          <DatePicker
            selected={to}
            onChange={setTo}
            dateFormat="dd-MM-yyyy"
            className="border rounded px-3 py-2 w-40"
          />
        </div>

        <input
          type="text"
          placeholder="Search order / customer / table..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-4 py-2 flex-1 min-w-[250px]"
        />
<button
  onClick={fetchReport}
  className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2 rounded-lg"
>
  View
</button>

<button
  onClick={downloadExcel}
  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
>
  Download Excel
</button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card title="Today Sales" value={cards.todaySales} />
        <Card title="Last 7 Days" value={cards.weekSales} />
        <Card title="This Month" value={cards.monthSales} />
        <Card title="Top Product" value={cards.topProduct} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Sales Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(v) => [`₹ ${v}`, "Sales"]} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#2563eb"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Selling Products">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ angle: -35, textAnchor: "end", fontSize: 12 }}
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow border">
        <div className="px-6 py-4 border-b flex justify-between">
          <h3 className="text-lg font-semibold">Sales Details</h3>
          <span className="text-sm text-slate-500">
            {filteredTable.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Order No</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Table</th>
                <th className="px-4 py-3 text-left">Area</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-center">Payment</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredTable.map((order, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3">
                    {order.customerName}
                  </td>
                  <td className="px-4 py-3">
                    {order.tableName}
                  </td>
                  <td className="px-4 py-3">
                    {order.areaName}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    ₹ {order.totalAmount}
                  </td>
                  <td className="px-4 py-3 text-center capitalize">
                    {order.paymentStatus}
                  </td>
                  <td className="px-4 py-3 text-center capitalize">
                    {order.status}
                  </td>
                </tr>
              ))}

              {filteredTable.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-500">
                    No sales found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* Reusable Components */

const Card = ({ title, value }) => (
  <div className="bg-white rounded-xl shadow border p-5">
    <p className="text-sm text-slate-500">{title}</p>
    <p className="text-xl font-semibold text-slate-800">
      {typeof value === "number" ? `₹ ${value}` : value || "N/A"}
    </p>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow border p-6">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

export default SalesReport;