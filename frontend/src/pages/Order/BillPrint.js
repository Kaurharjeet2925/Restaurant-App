const BillPrint = ({ order, billMeta }) => {

  const area =
    order?.area?.name ||
   order?.tableId?.area?.name ||
    "";

  const customerName =
    order?.tableId?.customerId?.name ||
    order?.customerId?.name ||
    order?.customer ||
    "";

  const customerPhone =
    order?.tableId?.customerId?.phone ||
    order?.customerId?.phone ||
    "";

  const restaurantName =  "DICE RESTAURANT";

  // Format money: show decimals only when needed (e.g., 15.50) otherwise whole
  const formatMoney = (value) => {
    const num = Number(value || 0);
    if (Number.isNaN(num)) return "0";
    return num % 1 === 0 ? String(num) : num.toFixed(2);
  };

  return (
    <div
      style={{
        width: "280px",
        fontFamily: "monospace",
        fontSize: "13px",
        lineHeight: "1.4",
      }}
    >
      <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "18px" }}>
        {restaurantName}
      </div>

      <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "14px", marginTop: 4 }}>
        INVOICE
      </div>

      <hr />

      <div>Order No: #ORD{order._id.slice(-4).toUpperCase()}</div>
      <div>Table: {order.tableId?.tableNumber}</div>
      {area && <div>Area: {area}</div>}

      {(customerName || customerPhone) && (
        <>
          <div>Customer: {customerName}</div>
          {customerPhone && <div>Mobile: {customerPhone}</div>}
        </>
      )}

      <div>
        Date: {new Date(order.createdAt).toLocaleDateString()}{" "}
        {new Date(order.createdAt).toLocaleTimeString()}
      </div>

      <hr />

      {/* ITEMS */}
      {order.items.map((item, idx) => (
        <div
          key={idx}
          style={{ display: "flex", justifyContent: "space-between" }}
        >
         <span>
  {item.name} ({item.variant}) × {item.qty}
</span>

          <span>₹{formatMoney(item.price * item.qty)}</span>
        </div>
      ))}

      <hr />

      {/* SUMMARY */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Subtotal</span>
        <span>₹{formatMoney(order.subTotal)}</span>
      </div>

      {(Number(order.tax || 0) > 0 || typeof order.taxPercent !== 'undefined') && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>GST{typeof order.taxPercent !== 'undefined' ? ` (${order.taxPercent}%)` : ''}</span>
          <span>₹{formatMoney(order.tax)}</span>
        </div>
      )}

    {(Number(order.serviceAmount || billMeta?.serviceAmount || 0) > 0) && (
  <div style={{ display: "flex", justifyContent: "space-between" }}>
    <span>
      Service
      {order?.servicePercent ? ` (${order.servicePercent}%)` : ""}
    </span>
    <span>
      ₹{formatMoney(order.serviceAmount || billMeta.serviceAmount)}
    </span>
  </div>
)}


      {Number(order.discount || 0) > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Discount</span>
          <span>-₹{formatMoney(order.discount)}</span>
        </div>
      )}

      <hr />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: "bold",
          fontSize: "15px",
        }}
      >
        <span>TOTAL</span>
        <span>₹{formatMoney(order.totalAmount)}</span>
      </div>

      <hr />

      <div style={{ textAlign: "center" }}>
        Payment: {order.paymentMethod?.toUpperCase() || "CASH"}
      </div>

      <p style={{ textAlign: "center", marginTop: "8px" }}>
        --- THANK YOU ---
      </p>
    </div>
  );
};

export default BillPrint;
