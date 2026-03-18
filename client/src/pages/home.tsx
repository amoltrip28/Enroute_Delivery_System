import { Header } from "@/components/header";
import { ProductGrid } from "@/components/product-grid";
import { CartSidebar } from "@/components/cart-sidebar";
import { CheckoutModal } from "@/components/checkout-modal";
import { OrderConfirmation } from "@/components/order-confirmation";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { ArrowRight, ShoppingBag, Truck, Clock } from "lucide-react";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const { isOpen, setCartOpen } = useCart();

  const handleCheckout = () => {
    setCartOpen(false);
    setShowCheckout(true);
  };

  const handleOrderSuccess = (orderNum: string) => {
    setShowCheckout(false);
    setShowConfirmation(true);
    setOrderNumber(orderNum);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setOrderNumber('');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Modern Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl animate-slide-up">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-500/30 border border-blue-400/50 text-blue-100 text-sm font-medium mb-6 backdrop-blur-sm">
              🚀 Now shipping to Bangalore
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
              Groceries delivered <br />
              <span className="text-walmart-yellow">in minutes.</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 font-light max-w-2xl">
              Fresh produce, daily essentials, and electronics delivered directly to your doorstep or a convenient pickup point.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-walmart-yellow text-walmart-dark px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                Start Shopping <ArrowRight className="w-5 h-5" />
              </button>
              <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                View Locations <MapPinIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Floating Features */}
        <div className="hidden lg:flex absolute right-10 bottom-10 gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <FeatureCard icon={Truck} title="Fast Delivery" desc="Within 2 hours" />
          <FeatureCard icon={Clock} title="24/7 Service" desc="Order anytime" />
          <FeatureCard icon={ShoppingBag} title="Fresh Stock" desc="Guaranteed quality" />
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 -mt-10 relative z-20">
        {/* Category Filter Pills (if needed above grid) */}

        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 min-h-[600px] animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Trending Products</h2>
            <div className="flex gap-2">
              {/* Filters could go here */}
            </div>
          </div>

          <ProductGrid
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
          />
        </div>
      </main>

      <CartSidebar onCheckout={handleCheckout} />

      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          onSuccess={handleOrderSuccess}
        />
      )}

      {showConfirmation && (
        <OrderConfirmation
          orderNumber={orderNumber}
          onClose={handleCloseConfirmation}
        />
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setCartOpen(false)}
        />
      )}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-3 w-64">
      <div className="p-3 bg-walmart-yellow/20 rounded-full text-walmart-yellow">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-bold text-white">{title}</h3>
        <p className="text-blue-100 text-sm">{desc}</p>
      </div>
    </div>
  );
}

function MapPinIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
