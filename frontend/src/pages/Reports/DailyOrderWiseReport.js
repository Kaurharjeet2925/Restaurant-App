import React, { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/pageHeader";
import { FileBarChart } from "lucide-react";
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

    if (!from || !to) {
      alert("Please select date range");
      return;
    }

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

  /* ================= DOWNLOAD EXCEL ================= */

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
   <div className="">

      {/* HEADER */}
      <PageHeader 
        title="Sales Report" 
        subtitle="Overview of completed sales within selected date range" 
        
      />

      {/* FILTER BAR */}
<div className="px-5 pb-6 min-h-screen bg-white">
      <div
  className="
    bg-card rounded-2xl shadow-sm border border-borderLight
    p-4 sm:p-5 mb-6
  "
>

  <div
    className="
      grid grid-cols-1
      sm:grid-cols-2
      xl:grid-cols-[auto_auto_1fr_auto_auto]
      gap-4
      items-end
    "
  >

    {/* FROM */}
    <div>
      <label className="block text-sm font-medium mb-2">
        From
      </label>

      <DatePicker
        selected={from}
        onChange={setFrom}
        dateFormat="dd-MM-yyyy"
        className="
          w-full border border-borderLight
          rounded-xl px-4 py-3
          focus:outline-none focus:ring-2
          focus:ring-primaryLight
        "
      />
    </div>

    {/* TO */}
    <div>
      <label className="block text-sm font-medium mb-2">
        To
      </label>

      <DatePicker
        selected={to}
        onChange={setTo}
        dateFormat="dd-MM-yyyy"
        className="
          w-full border border-borderLight
          rounded-xl px-4 py-3
          focus:outline-none focus:ring-2
          focus:ring-primaryLight
        "
      />
    </div>

    {/* SEARCH */}
    <div>
      <label className="block text-sm font-medium mb-2">
        Search
      </label>

      <input
        type="text"
        placeholder="Search order / customer / table..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="
          w-full border border-borderLight
          rounded-xl px-4 py-3
          focus:outline-none focus:ring-2
          focus:ring-primaryLight
        "
      />
    </div>

    {/* VIEW */}
    <button
      onClick={fetchReport}
      className="
        bg-primary hover:bg-primaryDark
        text-white px-5 py-3 rounded-xl
        transition
      "
    >
      View
    </button>

    {/* DOWNLOAD */}
    <button
      onClick={downloadExcel}
      className="
        border border-primary
        text-primary
        hover:bg-primaryLight
        px-5 py-3 rounded-xl
        transition
      "
    >
      Download
    </button>

  </div>

</div>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        <Card title="Today Sales" value={cards.todaySales} />
        <Card title="Last 7 Days" value={cards.weekSales} />
        <Card title="This Month" value={cards.monthSales} />
        <Card title="Top Product" value={cards.topProduct} />

      </div>

      {/* CHARTS */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">

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
                stroke="#9D0942"
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

              <Bar dataKey="quantity" fill="#9D0942" />

            </BarChart>

          </ResponsiveContainer>

        </ChartCard>

      </div>

      {/* TABLE */}

      <div className="bg-card rounded-2xl shadow-sm border border-borderLight overflow-hidden">

        <div className="px-6 py-5 border-b border-borderLight flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between gap-4">

          <h3 className="text-lg font-semibold">
            Sales Details
          </h3>

          <span className="text-sm text-gray-500">
            {filteredTable.length} records
          </span>

        </div>

        <div className="overflow-x-auto">

       <table className="min-w-[900px] w-full text-sm">

            <thead className="bg-primaryLight text-xs uppercase text-gray-600">

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

            <tbody className="divide-y divide-borderLight">

              {filteredTable.map((order, index) => (

                <tr key={index} className="hover:bg-primaryLight">

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
                  <td colSpan={7} className="text-center py-6 text-gray-500">
                    No sales found
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>
</div>
    </div>
  );
};

/* ================= COMPONENTS ================= */

const Card = ({ title, value }) => (

  <div
    className="
      bg-card rounded-2xl
      shadow-sm border border-borderLight
      p-5
    "
  >

    <p className="text-sm text-gray-500 mb-2">
      {title}
    </p>

    <p className="text-2xl font-bold text-gray-800">
      {typeof value === "number"
        ? `₹ ${value}`
        : value || "N/A"}
    </p>

  </div>

);

const ChartCard = ({ title, children }) => (

  <div
    className="
      bg-card rounded-2xl
      shadow-sm border border-borderLight
      p-5 sm:p-6
    "
  >

    <h3 className="text-lg font-semibold mb-5">
      {title}
    </h3>

    {children}

  </div>

);

export default SalesReport;