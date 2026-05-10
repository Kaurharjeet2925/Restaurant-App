import { useEffect, useMemo, useState } from "react";
import apiClient from "../../apiclient/apiclient";
import { Plus, Minus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import KotPrint from "../Kitchen/Kot/KotPrint";
import { useSearchParams } from "react-router-dom";
import MenuCard from "./MenuCard";
import VariantModal from "../MenuItemManaement/VariantModal";
import BillPrint from "../Order/BillPrint";
import BillSummary from "./BillSummary";
import CustomerForm from "../CategoryManagement/Customers/CustomerForm";
/* ================= PRINT HELPER ================= */
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
const getDefaultUnit = (item) => {
  const portion = item.portionType;

  if (!portion || !Array.isArray(portion.units) || portion.units.length === 0) {
    return {
      name: "Regular",
      value: 100,
    };
  }

  return portion.units[0];
};
const CounterPOS = () => {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState("all");
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [params] = useSearchParams();
const searchQuery = (params.get("q") || "").toLowerCase();

  const [variantItem, setVariantItem] = useState(null);
  const [taxPercent, setTaxPercent] = useState(0);
  const [showCreditModal, setShowCreditModal] = useState(false);
const [discount, setDiscount] = useState(0);
const [billMeta, setBillMeta] = useState(null);
const [isProcessing, setIsProcessing] = useState(false);

const orderType = "counter";
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


const filteredMenu = menu.filter((item) => {
  const itemName = (item.name || "").toLowerCase();
  const categoryName =
    (item.category?.name || item.category || "").toLowerCase();

  const matchesCategoryTab =
    activeCat === "all" ||
    categoryName === activeCat.toLowerCase();

  const matchesSearch =
    !searchQuery ||
    itemName.includes(searchQuery) ||
    categoryName.includes(searchQuery);

  return matchesCategoryTab && matchesSearch;
});

useEffect(() => {
  if (!searchQuery) {
    setActiveCat("all");
    return;
  }

  const matchedCategory = categories.find((cat) =>
    cat.toLowerCase().includes(searchQuery)
  );

  if (matchedCategory) {
    setActiveCat(matchedCategory);
  } else {
    setActiveCat("all");
  }
}, [searchQuery, categories]);

  /* ================= CART ================= */
  const addItem = (item, unit) => {
    const key = `${item._id}_${unit.name}`;

    setCart((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, qty: i.qty + 1 } : i
        );
      }

      return [
        ...prev,
        {
          key,
          menuItemId: item._id,
          name: item.name,
          price:
            item.portionType?.pricingRule === "percentage"
              ? (item.price * unit.value) / 100
              : unit.value,
          unit,
          qty: 1,
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


  /* ================= PAY & PRINT ================= */
  const payAndPrint = async () => {
  if (cart.length === 0) return toast.info("Cart is empty");
  setIsProcessing(true);

  try {
   const res = await apiClient.post("/orders/counter", {
  orderType,
  items: cart.map(i => ({
    menuItemId: i.menuItemId,
    name: i.name,
    price: i.price,
    qty: i.qty,
    variant: i.unit.name,
  })),
  taxPercent,
  discount,
  paymentMethod: "cash",
});


    const ord = res.data.order;
    setOrder(ord);

    toast.success("Payment successful");

    setTimeout(() => printElement("counter-kot", "KOT"), 400);
    setTimeout(() => printElement("counter-bill", "Bill"), 1200);

    setTimeout(() => {
      setCart([]);
      setOrder(null);
      setIsProcessing(false);
    }, 2000);
  } catch (err) {
    toast.error("Payment failed");
    setIsProcessing(false);
  }
};



  return (
<div className="h-[calc(100vh-64px)] bg-gray-50 p-4 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-4 h-full">

        {/* MENU */}
        <div className="md:col-span-8 col-span-1 bg-white rounded-xl p-2 sm:p-4 overflow-y-auto">

          <div className="sticky top-0 z-10 bg-card pb-3 mb-4 flex gap-2 flex-wrap border-b border-borderLight">
            <CategoryTab
              label="All"
              active={activeCat === "all"}
              onClick={() => setActiveCat("all")}
            />
            {categories.map((c) => (
              <CategoryTab
                key={c}
                label={c}
                active={activeCat === c}
                onClick={() => setActiveCat(c)}
              />
            ))}
          </div>

  <div className="grid
grid-cols-2
sm:grid-cols-3
md:grid-cols-4
xl:grid-cols-5
gap-4">            {filteredMenu.map((item) => {
              // Calculate total quantity in cart for this item
              const totalQty = cart
                .filter((i) => i.menuItemId === item._id)
                .reduce((sum, i) => sum + i.qty, 0);
              return (
                <MenuCard
                  key={item._id}
                  item={item}
                  totalQty={totalQty}
                 onPress={() => {
  const portion = item.portionType;

  // No variants → use default
  if (!portion || !portion.units?.length) {
    addItem(item, getDefaultUnit(item));
    return;
  }

  if (portion.units.length === 1) {
    addItem(item, portion.units[0]);
  } else {
    setVariantItem(item);
  }
}}
                 onIncrease={() => {
  const portion = item.portionType;

  if (!portion || !portion.units?.length) {
    addItem(item, getDefaultUnit(item));
    return;
  }

  if (portion.units.length === 1) {
    addItem(item, portion.units[0]);
  } else {
    setVariantItem(item);
  }
}}
                  onDecrease={() => {
                    // Decrease qty for the first unit (if only one unit)
                   const portion = item.portionType;

if (!portion || !portion.units?.length) {
  const key = `${item._id}_Regular`;
  changeQty(key, -1);
  return;
}
                    if (portion.units.length === 1) {
                      const key = `${item._id}_${portion.units[0].name}`;
                      changeQty(key, -1);
                    } else {
                      setVariantItem(item);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* CART */}
       <div className="md:col-span-4 col-span-1 bg-card rounded-xl p-4 flex flex-col mt-2 md:mt-0 shadow-card border border-borderLight">

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
  isProcessing={isProcessing}

  onConfirm={payAndPrint}
  onCredit={() => {
    if (cart.length === 0) return toast.info("Cart is empty");
    setShowCreditModal(true);
  }}
/>

</div>
      </div>

      {/* 🔥 VARIANT MODAL (shared) */}
      {variantItem && (
        <VariantModal
          item={variantItem}
          cart={cart}
          onQtyChange={(item, unit, diff) => {
            const key = `${item._id}_${unit.name}`;
            if (diff > 0) {
              addItem(item, unit);
            } else {
              changeQty(key, diff);
            }
          }}
          onClose={() => setVariantItem(null)}
        />
      )}
    {showCreditModal && (
  <CustomerForm
    mode="counter"
    close={() => setShowCreditModal(false)}
    onDone={async ({ name, phone }) => {
      setIsProcessing(true);
      try {
        // 1. Lookup customer by phone
        let customerId = null;
        let customerRes = await apiClient.get(`/by-phone/${phone}`);
        if (customerRes.data && customerRes.data._id) {
          customerId = customerRes.data._id;
        } else {
          // 2. Create customer if not found
          const createRes = await apiClient.post("/customers", { name, phone });
          customerId = createRes.data._id;
        }
        // 3. Post order with customerId
        const res = await apiClient.post("/orders/counter/credit", {
          customerId,
          items: cart.map((i) => ({
            menuItemId: i.menuItemId,
            name: i.name,
            price: i.price,
            qty: i.qty,
            variant: i.unit.name,
          })),
          taxPercent,
          discount,
        });
        setOrder(res.data.order);
        setBillMeta(res.data.billMeta);
        toast.success("Credit order saved");
        setShowCreditModal(false);
        setTimeout(() => printElement("counter-kot", "KOT"), 400);
        setTimeout(() => printElement("counter-bill", "Bill"), 1200);
        setTimeout(() => {
          setCart([]);
          setOrder(null);
          setBillMeta(null);
          setIsProcessing(false);
        }, 2000);
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to save credit"
        );
        setIsProcessing(false);
      }
    }}
  />
)}


      {/* 🔥 HIDDEN PRINT */}
      <div style={{ display: "none" }}>
        {order?.kots?.[0] && (
          <div id="counter-kot">
            <KotPrint kot={order.kots[0]} order={order} />
          </div>
        )}
        {order && (
          <div id="counter-bill">
            <BillPrint order={order} billMeta={billMeta}/>
          </div>
        )}
      </div>
    </div>
  );
};

const CategoryTab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-1.5 rounded-full text-sm font-medium transition
      ${
        active
          ? "bg-primary text-white shadow-sm"
          : "bg-background text-gray-700 hover:bg-primary/10"
      }
    `}
  >
    {label}
  </button>
);

export default CounterPOS;
