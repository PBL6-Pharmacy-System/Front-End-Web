import Cart from "../components/Cart";

export default function CartPage({ onNavigate }) {
  return (
    <main className="flex-1">
      <Cart onNavigate={onNavigate} />
    </main>
  );
}
