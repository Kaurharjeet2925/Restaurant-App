import { useEffect, useMemo, useState } from "react";
import apiClient from "../../apiclient/apiclient";
import { toast } from "react-toastify";
import { ShoppingCart, X } from "lucide-react";
import KotPrint from "../Kitchen/Kot/KotPrint";
import BillPrint from "../Order/BillPrint";
import CustomerForm from "../CategoryManagement/Customers/CustomerForm";
import VariantModal from "../MenuItemManaement/VariantModal"

const printElement = (id, title) => {
  const el = document.getElementById(id);
  if (!el) return toast.warn(`${title} not ready`);

  const win = window.open("", "_blank", "width=300,height=600");
  if (!win) return toast.warn("Popup blocked");

  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>body{font-family:monospace;padding:10px}</style>
      </head>
      <body>${el.innerHTML}</body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
};
const CategoryButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
      active
        ? "bg-red-500 text-white shadow-lg"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    {label === "all" ? "All Items" : label}
  </button>
);
const MenuItemCard = ({ item, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg active:scale-95 transition-all"
  >
    <div className="h-20 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
      {item.image ? (
        <img
          src={`${process.env.REACT_APP_IMAGE_URL}${item.image}`}
          className="h-full w-full object-cover"
          alt={item.name}
        />
      ) : (
        <div className="h-full w-full bg-gray-300" />
      )}
    </div>

    <div className="p-2">
      <p className="text-xs font-semibold line-clamp-2 text-gray-900">
        {item.name}
      </p>
      <p className="text-sm font-bold text-red-500">
        ₹{item.price}
      </p>
    </div>
  </button>
);

const MobilePOS = () => {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
const [variantQty, setVariantQty] = useState(1);
  const [activeCat, setActiveCat] = useState("all");
  const [cart, setCart] = useState([]);
  const [taxPercent, setTaxPercent] = useState(0);
const [order, setOrder] = useState(null);
const [billMeta, setBillMeta] = useState(null);
const [showCreditModal, setShowCreditModal] = useState(false);
const [discount, setDiscount] = useState(0);

  const [showCheckout, setShowCheckout] = useState(false);
  //const [expandedItemId, setExpandedItemId] = useState(null);
  const [variantItem, setVariantItem] = useState(null);

  /* ================= LOAD MENU ================= */
  useEffect(() => {
    apiClient.get("/menu").then((res) => {
      setMenu(res.data || []);
      setCategories([
        ...new Set(
          res.data
            .map((i) => i.category?.name || i.category)
            .filter(Boolean)
        ),
      ]);
    });
  }, []);

  const filteredMenu =
    activeCat === "all"
      ? menu
      : menu.filter(
          (i) => (i.category?.name || i.category) === activeCat
        );

  /* ================= CART ================= */
const addItem = (item, unit, qty = 1) => {
  const key = `${item._id}_${unit?.name || "default"}`;

  setCart((prev) => {
    const existing = prev.find((i) => i.key === key);

    if (existing) {
      return prev.map((i) =>
        i.key === key ? { ...i, qty: i.qty + qty } : i
      );
    }

    const price =
      unit && item.portionType
        ? item.portionType.pricingRule === "percentage"
          ? Math.round((item.price * unit.value) / 100)
          : unit.value
        : item.price;

    return [
      ...prev,
      {
        key,
        menuItemId: item._id,
        name: item.name,
        price,
        unit,
        qty,
      },
    ];
  });
};



  const changeQty = (key, diff) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.key === key ? { ...i, qty: i.qty + diff } : i
        )
        .filter((i) => i.qty > 0)
    );
  };

  const subtotal = useMemo(
  () => cart.reduce((s, i) => s + i.price * i.qty, 0),
  [cart]
);

const taxAmount = useMemo(
  () => Number(((subtotal * taxPercent) / 100).toFixed(2)),
  [subtotal, taxPercent]
);

const finalTotal = useMemo(
  () => Math.max(0, subtotal + taxAmount - discount),
  [subtotal, taxAmount, discount]
);
const payAndPrint = async () => {
  if (!cart.length) return toast.info("Cart is empty");

  try {
    const res = await apiClient.post("/orders/counter", {
      orderType: "counter",
      items: cart.map((i) => ({
        menuItemId: i.menuItemId,
        name: i.name,
        price: i.price,
        qty: i.qty,
        variant: i.unit?.name || "Default",
      })),
      taxPercent,
      discount,
      paymentMethod: "cash",
    });

    const ord = res.data.order;
    setOrder(ord);
    setBillMeta(res.data.billMeta);

    toast.success("Payment successful");
    setShowCheckout(false);
    setTimeout(() => printElement("counter-kot", "KOT"), 400);
    setTimeout(() => printElement("counter-bill", "Bill"), 1200);

    setTimeout(() => {
      setCart([]);
      setOrder(null);
      setBillMeta(null);
    }, 2000);
  } catch {
    toast.error("Payment failed");
  }
};
const payLater = async ({ name, phone, address }) => {
  try {
    let customer;

    // 1️⃣ Check customer by phone
    const existing = await apiClient.get(`/by-phone/${phone}`);
    customer = existing.data;

    // 2️⃣ If customer does NOT exist → create
    if (!customer) {
      const created = await apiClient.post("/customers", {
        name,
        phone,
        address,
      });
      customer = created.data;
    }

    // 3️⃣ Create credit order USING customerId
    const res = await apiClient.post("/orders/counter/credit", {
      customerId: customer._id,
      items: cart.map((i) => ({
        menuItemId: i.menuItemId,
        name: i.name,
        price: i.price,
        qty: i.qty,
        variant: i.unit?.name || "Default",
      })),
      taxPercent,
      discount,
    });

    setOrder(res.data.order);
    setBillMeta(res.data.billMeta);

    toast.success("Credit order saved");

    setShowCreditModal(false);
    setShowCheckout(false); // ✅ auto close bill sheet

    // 🔥 Print
    setTimeout(() => printElement("counter-kot", "KOT"), 400);
    setTimeout(() => printElement("counter-bill", "Bill"), 1200);

    // 🔄 Reset
    setTimeout(() => {
      setCart([]);
      setOrder(null);
      setBillMeta(null);
    }, 2000);

  } catch (err) {
    toast.error(
      err.response?.data?.message || "Failed to save credit order"
    );
  }
};


// all cart entries for this item
const getItemVariants = (itemId) =>
  cart.filter((i) => i.menuItemId === itemId);

// total qty (all variants combined)
const getItemTotalQty = (itemId) =>
  getItemVariants(itemId).reduce((s, i) => s + i.qty, 0);

// check if item has multiple variants in cart
const hasMultipleVariantsInCart = (itemId) =>
  getItemVariants(itemId).length > 1;

const updateVariantQty = (item, unit, diff) => {
  const key = `${item._id}_${unit.name}`;

  setCart((prev) => {
    const existing = prev.find((i) => i.key === key);

    // REMOVE
    if (existing && existing.qty + diff <= 0) {
      return prev.filter((i) => i.key !== key);
    }

    // UPDATE
    if (existing) {
      return prev.map((i) =>
        i.key === key
          ? { ...i, qty: i.qty + diff }
          : i
      );
    }

    // ADD NEW
    const price =
      item.portionType.pricingRule === "percentage"
        ? Math.round((item.price * unit.value) / 100)
        : unit.value;

    return [
      ...prev,
      {
        key,
        menuItemId: item._id,
        name: item.name,
        unit,
        price,
        qty: 1,
      },
    ];
  });
};

  return (
<div className="bg-white flex flex-col relative w-full max-w-none">

  {/* ================= CATEGORIES (FIXED) ================= */}
 <div className="native-swipe gap-2 px-3 py-2 whitespace-nowrap">
  <button
    onClick={() => setActiveCat("all")}
    className="shrink-0 px-4 py-2 rounded-full bg-red-500 text-white"
  >
    All Items
  </button>

  {categories.map((c) => (
    <button
      key={c}
      onClick={() => setActiveCat(c)}
      className="shrink-0 px-4 py-2 rounded-full bg-gray-100"
    >
      {c}
    </button>
  ))}
</div>


  {/* ================= MENU (ONLY THIS SCROLLS) ================= */}
  <div className="flex-1 overflow-y-auto w-full">
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 p-2 sm:p-4 pb-40 w-full">
      {filteredMenu.map((item) => (
        <div
          key={item._id}
          className="bg-white rounded-xl overflow-hidden border transition cursor-pointer hover:shadow-lg active:scale-95"
          onClick={() => {
            const portion = item.portionType;
            // ✅ No variant → add directly
            if (!portion || !portion.units?.length) {
              addItem(item, null, 1);
              return;
            }
            // ✅ Single unit → add directly
            if (portion.units.length === 1) {
              addItem(item, portion.units[0], 1);
              return;
            }
            // ✅ Multiple units → open modal
            setVariantItem(item);
          }}
        >
          {/* IMAGE */}
          <div className="h-20 bg-slate-200 overflow-hidden">
            {item.image ? (
              <img
                src={`${process.env.REACT_APP_IMAGE_URL}${item.image}`}
                className="h-full w-full object-cover"
                alt={item.name}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No Image
              </div>
            )}
          </div>
          {/* INFO */}
          <div className="p-2">
            <h3 className="text-xs font-semibold line-clamp-2">
              {item.name}
            </h3>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm font-bold text-red-500">
                ₹{item.price}
              </p>
              {(() => {
const totalQty = getItemTotalQty(item._id);
const variantsInCart = getItemVariants(item._id);
const hasVariants = item.portionType?.units?.length > 1;
const multipleVariants = hasMultipleVariantsInCart(item._id);


  // 👉 NOT ADDED YET
if (totalQty === 0) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (hasVariants) {
          setVariantItem(item); // open variant modal
        } else {
          addItem(item, null, 1);
        }
      }}
      className="border border-[#ff4d4d] text-[#ff4d4d] px-3 py-1 rounded-lg text-sm font-semibold"
    >
      ADD
    </button>
  );
}


  // 👉 ALREADY ADDED → SHOW QTY CONTROLS
  return (
  <div className="flex items-center border border-[#ff4d4d] rounded-lg">
    {/* MINUS */}
    <button
      onClick={(e) => {
        e.stopPropagation();

        if (hasVariants) {
          if (multipleVariants) {
            // 🔥 multiple customisations → open modal
            setVariantItem(item);
          } else {
            // single variant → reduce directly
            changeQty(variantsInCart[0].key, -1);
          }
        } else {
          changeQty(variantsInCart[0].key, -1);
        }
      }}
      className="px-2 text-lg text-[#ff4d4d]"
    >
      −
    </button>

    <span className="px-3 text-sm font-semibold">
      {totalQty}
    </span>

    {/* PLUS */}
    <button
      onClick={(e) => {
        e.stopPropagation();

        if (hasVariants) {
          if (multipleVariants) {
            // 🔥 ask which customisation
            setVariantItem(item);
          } else {
            // same variant → increase
            changeQty(variantsInCart[0].key, 1);
          }
        } else {
          changeQty(variantsInCart[0].key, 1);
        }
      }}
      className="px-2 text-lg text-[#ff4d4d]"
    >
      +
    </button>
  </div>
);

})()}
</div>

          </div>

    
          
           
        </div>
      ))}
    </div>
  </div>
{cart.length > 0 && (
  <div className="fixed left-4 right-4 z-50
        bottom-[calc(env(safe-area-inset-bottom)+1rem)]
        bg-red-500 text-white py-3 rounded-xl
        font-semibold shadow-xl flex justify-center gap-2">
    <button
   onClick={() => setShowCheckout(true)}
      className="w-full flex justify-between items-center px-2 py-2"
    >
      <div className="flex items-center gap-2 font-semibold">
        <ShoppingCart size={18} />
        <span>
          {cart.reduce((s, i) => s + i.qty, 0)} Items
        </span>
      </div>

      <div className="font-bold">
        ₹{subtotal.toFixed(2)}
      </div>
    </button>
  </div>
)}
  {/* ================= CHECKOUT BUTTON (SAFE AREA FIXED) =================
  {cart.length > 0 && (
    <button
      onClick={() => setShowCheckout(true)}
      className="
        fixed left-4 right-4 z-50
        bottom-[calc(env(safe-area-inset-bottom)+1rem)]
        bg-red-500 text-white py-3 rounded-xl
        font-semibold shadow-xl flex justify-center gap-2
      "
    >
      <ShoppingCart size={18} />
      Checkout  {cart.reduce((s, i) => s + i.qty, 0)} Items
    </button>
  )} */}

  {/* ================= CHECKOUT BOTTOM SHEET ================= */}
  {showCheckout && (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-50"
        onClick={() => setShowCheckout(false)}
      />

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[90dvh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-lg font-bold">Bill Summary</h2>
          <button onClick={() => setShowCheckout(false)}>
            <X />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {cart.map((item) => (
            <div
              key={item.key}
              className="flex justify-between items-center bg-slate-50 p-4 rounded-xl"
            >
              <div>
                <p className="text-sm font-medium">
                  {item.name}
                </p>
                <p className="text-xs text-slate-500">
                  {item.unit?.name || "Default"} × {item.qty}
                </p>
                <p className="text-xs text-slate-400">
                  ₹{item.price} each
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeQty(item.key, -1)}
                  className="w-7 h-7 border rounded-full"
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold">
                  {item.qty}
                </span>
                <button
                  onClick={() => changeQty(item.key, 1)}
                  className="w-7 h-7 border rounded-full"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
     
<div className="border-t bg-slate-50 p-5 space-y-3">

  {/* SUBTOTAL */}
  <div className="flex justify-between text-sm">
    <span>Subtotal</span>
    <span>₹{subtotal}</span>
  </div>

  {/* GST */}
  <div className="flex items-center gap-2 text-sm">
    <label className="w-20">GST (%)</label>
    <input
      type="number"
      min="0"
      value={taxPercent}
      onChange={(e) =>
        setTaxPercent(Number(e.target.value || 0))
      }
      className="w-16 p-1 border rounded text-right"
    />
    <span className="ml-auto">₹{taxAmount}</span>
  </div>

  {/* DISCOUNT */}
  <div className="flex items-center gap-2 text-sm">
    <label className="w-20">Discount</label>
    <input
      type="number"
      min="0"
      value={discount}
      onChange={(e) =>
        setDiscount(Number(e.target.value || 0))
      }
      className="w-20 p-1 border rounded text-right"
    />
    <span className="ml-auto">-₹{discount}</span>
  </div>

  {/* TOTAL */}
  <div className="flex justify-between text-lg font-bold border-t pt-3">
    <span>Total</span>
    <span className="text-red-500">₹{finalTotal}</span>
  </div>


  
  <div className="flex gap-2 mt-3">
  {/* PAY NOW */}
  <button
    onClick={payAndPrint}
    className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold"
  >
    Pay & Print
  </button>

  {/* PAY LATER */}
  <button
    onClick={() => {
      if (!cart.length) {
        toast.info("Cart is empty");
        return;
      }
      setShowCreditModal(true);
    }}
    className="w-full bg-yellow-500 text-white py-3 rounded-xl font-semibold"
  >
    Pay Later
  </button>
</div>

</div>


      </div>
    </>
  )}
{variantItem && (
  <VariantModal
    item={variantItem}
    cart={cart}
    onQtyChange={updateVariantQty}
    onClose={() => setVariantItem(null)}
  />
)}



{showCreditModal && (
  <CustomerForm
    mode="counter"
    close={() => setShowCreditModal(false)}
    onDone={payLater}
  />
)}

<div style={{ display: "none" }}>
  {order?.kots?.[0] && (
    <div id="counter-kot">
      <KotPrint kot={order.kots[0]} order={order} />
    </div>
  )}

  {order && (
    <div id="counter-bill">
      <BillPrint order={order} billMeta={billMeta} />
    </div>
  )}
</div>


</div>

  );
};

export default MobilePOS;
