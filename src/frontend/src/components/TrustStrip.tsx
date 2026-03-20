import { RefreshCw, Shield, Truck } from "lucide-react";
import { motion } from "motion/react";

const trustItems = [
  {
    id: "shipping",
    icon: Truck,
    title: "Free Shipping",
    subtitle: "on Orders Over ₹499",
  },
  {
    id: "returns",
    icon: RefreshCw,
    title: "Easy Returns",
    subtitle: "48 Hour Return Policy",
  },
  {
    id: "secure",
    icon: Shield,
    title: "Secure Payment",
    subtitle: "100% Safe & Secure",
  },
];

export function TrustStrip() {
  return (
    <section className="py-5" aria-label="Trust signals">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="trust-strip grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0"
        >
          {trustItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-6 py-5">
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "oklch(96% 0.018 15)" }}
              >
                <item.icon
                  className="h-5 w-5"
                  style={{ color: "oklch(50% 0.16 15)" }}
                  strokeWidth={1.8}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
