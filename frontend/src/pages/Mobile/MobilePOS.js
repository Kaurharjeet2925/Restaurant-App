import { useEffect, useMemo, useState } from "react";
import apiClient from "../../apiclient/apiclient";
import { toast } from "react-toastify";
import { ShoppingCart, X } from "lucide-react";
import KotPrint from "../Kitchen/Kot/KotPrint";
import BillPrint from "../Order/BillPrint";
import CustomerForm from "../CategoryManagement/Customers/CustomerForm";
import VariantModal from "../MenuItemManaement/VariantModal"
import MenuCard from "../Order/MenuCard";
import BillSummary from "../Order/BillSummary";

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
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [cart, setCart] = useState([]);
  const [taxPercent, setTaxPercent] = useState(0);
const [order, setOrder] = useState(null);
const [view, setView] = useState("grid");
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

   const filteredMenu = useMemo(() => {
  let items = menu;

  // category filter
  if (activeCat !== "all") {
    items = items.filter(
      (i) => (i.category?.name || i.category) === activeCat
    );
  }

  // search filter
  if (search.trim()) {
    items = items.filter((i) =>
      i.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  return items;
}, [menu, activeCat, search]);

useEffect(() => {
  if (!search.trim()) return;

  const match = menu.find((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  if (match) {
    const itemCategory = match.category?.name || match.category;

    if (itemCategory && itemCategory !== activeCat) {
      setActiveCat(itemCategory);
    }
  }
}, [search, menu]);
useEffect(() => {
  if (!search.trim()) {
    setActiveCat("all");
  }
}, [search]);
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
    <div className="h-screen bg-white flex  pt-0.5 flex-col p-5 ">
<div className="mb-3">
    <input
    type="text"
    placeholder="Search menu items..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
  />
</div>
  {/* ================= CATEGORIES (FIXED) ================= */}
<div className="native-swipe gap-2 py-4 whitespace-nowrap">
  <button
    onClick={() => setActiveCat("all")}
     className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
        activeCat === "all"
          ? "bg-primary text-white shadow"
          : "bg-card border border-borderLight text-gray-600"
      }`}
  >
    All Items
  </button>

  {categories.map((c) => (
    <button
      key={c}
      onClick={() => setActiveCat(c)}
       className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
        activeCat === c
          ? "bg-primary text-white shadow"
          : "bg-card border border-borderLight text-gray-600"
      }`}
    >
      {c}
    </button>
  ))}
</div>
<div className="flex justify-end gap-2 mb-2">
  <button
    onClick={() => setView("grid")}
    className={`px-3 py-1 rounded ${view === "grid" ? "bg-primary text-white" : "bg-gray-200"}`}
  >
    Grid
  </button>

  <button
    onClick={() => setView("list")}
    className={`px-3 py-1 rounded ${view === "list" ? "bg-primary text-white" : "bg-gray-200"}`}
  >
    List
  </button>
</div>

  {/* ================= MENU (ONLY THIS SCROLLS) ================= */}
  <div className="flex-1 overflow-y-auto w-full">
<div
  className={`pb-40 w-full ${
    view === "grid"
      ? "grid grid-cols-2 sm:grid-cols-4 gap-2"
      : "flex flex-col gap-2"
  }`}
>       {filteredMenu.map((item) => {
  const totalQty = getItemTotalQty(item._id);
  const variantsInCart = getItemVariants(item._id);
  const hasVariants = item.portionType?.units?.length > 1;
  const multipleVariants = hasMultipleVariantsInCart(item._id);

  return (
  <MenuCard
 item={item}
  totalQty={totalQty}
  view={view}
  onPress={() => {
    if (hasVariants) {
      setVariantItem(item);     // ✅ MODAL OPENS
    } else {
      addItem(item, null, 1);
    }
  }}
 onIncrease={() => {
    if (hasVariants && multipleVariants) {
      // ❌ more than one variant → ask user
      setVariantItem(item);
    } else {
      // ✅ only one variant → safe increment
      changeQty(variantsInCart[0].key, 1);
    }
  }}

  /* MINUS */
  onDecrease={() => {
    if (hasVariants && multipleVariants) {
      // ❌ more than one variant → ask user
      setVariantItem(item);
    } else {
      // ✅ only one variant → safe decrement
       changeQty(variantsInCart[0].key, -1);
    }
  }}
/>


  );
})}
    </div>
  </div>
{cart.length > 0 && (
  <div className="fixed left-4 right-4 z-50
        bottom-[calc(env(safe-area-inset-bottom)+1rem)]
        bg-primary text-white py-3 rounded-xl
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
    {/* Overlay */}
    <div
      className="fixed inset-0 bg-black/40 z-50"
      onClick={() => setShowCheckout(false)}
    />

    {/* Bottom Sheet */}
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 bg-white rounded-t-2xl shadow-2xl h-[80vh] flex flex-col">

      <BillSummary
        mode="pos"
        editable={true}

        cart={cart.map(i => ({
          cartKey: i.key,
          name: i.name,
          qty: i.qty,
          basePrice: i.price,
          selectedUnit: { name: i.unit?.name || "Default" }
        }))}

        onIncrease={(key) => changeQty(key, 1)}
        onDecrease={(key) => changeQty(key, -1)}

        kotSubtotal={subtotal}

        checkoutTaxPercent={taxPercent}
        setCheckoutTaxPercent={setTaxPercent}

        servicePercent={0}
        setServicePercent={() => {}}

        taxAmount={taxAmount}
        serviceAmount={0}

        discount={discount}
        setDiscount={setDiscount}

        finalTotal={finalTotal}

        onConfirm={payAndPrint}

        onCredit={() => {
          if (!cart.length) {
            toast.info("Cart is empty");
            return;
          }
          setShowCreditModal(true);
        }}

        onCancel={() => setShowCheckout(false)}
      />

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
