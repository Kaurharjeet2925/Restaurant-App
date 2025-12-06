export default function MenuItemCard({ title, value, gradient }) {
  return (
    <div
      className={`p-6 rounded-xl text-white shadow-lg ${gradient}`}
    >
      <div className="text-sm opacity-80">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
