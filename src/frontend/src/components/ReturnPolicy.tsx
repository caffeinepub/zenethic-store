import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Package,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";

interface ReturnPolicyProps {
  onBack: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.45,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  }),
};

function PolicyCard({
  icon: Icon,
  title,
  iconColor,
  children,
  index,
}: {
  icon: React.ElementType;
  title: string;
  iconColor: string;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${iconColor}1a` }}
        >
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
        </div>
        <h2 className="font-display text-base font-bold uppercase tracking-[0.1em] text-gray-900 md:text-lg">
          {title}
        </h2>
      </div>
      {children}
    </motion.div>
  );
}

function ListItem({
  children,
  check,
}: { children: React.ReactNode; check?: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-700">
      <span
        className="mt-0.5 h-4 w-4 shrink-0 font-bold"
        style={{ color: check ? "oklch(55% 0.22 15)" : "oklch(50% 0.23 15)" }}
      >
        {check ? "✓" : "•"}
      </span>
      {children}
    </li>
  );
}

export function ReturnPolicy({ onBack }: ReturnPolicyProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero banner */}
      <div className="relative overflow-hidden border-b border-rose-100 bg-gradient-to-br from-rose-50 via-pink-50 to-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <button
            type="button"
            data-ocid="policy.back_button"
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-rose-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-rose-700">
              <RefreshCw className="h-3 w-3" />
              Customer Policy
            </div>
            <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-5xl">
              Return &amp; Refund
              <span className="block text-rose-600">Policy</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-600 md:text-base">
              At Zenethic store, we aim to provide the best quality products to
              our customers. Please read our return &amp; refund policy
              carefully before placing an order.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Policy sections */}
      <div className="container mx-auto max-w-3xl px-4 py-10 md:py-14">
        <div className="flex flex-col gap-5">
          {/* Returns Eligibility */}
          <PolicyCard
            index={0}
            icon={CheckCircle}
            title="Returns Eligibility"
            iconColor="oklch(55% 0.22 15)"
          >
            <p className="mb-3 text-sm text-gray-700">
              We accept returns <strong className="text-gray-900">only</strong>{" "}
              under the following conditions:
            </p>
            <ul className="space-y-2">
              <ListItem check>The product is damaged during delivery</ListItem>
              <ListItem check>The wrong product has been delivered</ListItem>
              <ListItem check>The product is defective or leaking</ListItem>
            </ul>
          </PolicyCard>

          {/* Return Request Time */}
          <PolicyCard
            index={1}
            icon={AlertCircle}
            title="Return Request Time"
            iconColor="oklch(65% 0.18 70)"
          >
            <p className="text-sm leading-relaxed text-gray-700">
              Customers must request a return within{" "}
              <strong className="text-gray-900">48 hours of delivery</strong> by
              contacting us on{" "}
              <strong className="text-gray-900">WhatsApp or email</strong> with
              proper proof (photos / videos).
            </p>
          </PolicyCard>

          {/* Non-Returnable */}
          <PolicyCard
            index={2}
            icon={XCircle}
            title="Non-Returnable Conditions"
            iconColor="oklch(55% 0.2 25)"
          >
            <p className="mb-3 text-sm text-gray-700">
              We do <strong className="text-red-600">NOT</strong> accept returns
              if:
            </p>
            <ul className="space-y-2">
              <ListItem>The product has been used or opened</ListItem>
              <ListItem>
                The customer does not like the fragrance or product
              </ListItem>
              <ListItem>The product is ordered by mistake</ListItem>
            </ul>
          </PolicyCard>

          {/* Return Process */}
          <PolicyCard
            index={3}
            icon={Package}
            title="Return Process"
            iconColor="oklch(55% 0.15 200)"
          >
            <ul className="space-y-2">
              <ListItem check>
                Once your return request is approved, we will arrange a pickup
                through our delivery partner
              </ListItem>
              <ListItem check>
                The product must be unused and in original packaging
              </ListItem>
            </ul>
          </PolicyCard>

          {/* Refund Policy */}
          <PolicyCard
            index={4}
            icon={CreditCard}
            title="Refund Policy"
            iconColor="oklch(55% 0.18 145)"
          >
            <ul className="space-y-2">
              <ListItem check>
                Refund will be processed after we receive and inspect the
                product
              </ListItem>
              <ListItem check>
                Refund will be credited within{" "}
                <strong className="text-gray-900">5–7 working days</strong> to
                the original payment method
              </ListItem>
            </ul>
          </PolicyCard>
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.45 }}
          className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-6 text-center"
        >
          <p className="mb-1 font-display text-base font-bold text-gray-900">
            Need help with a return?
          </p>
          <p className="mb-2 text-sm text-gray-700">
            Contact us within 48 hours of delivery via WhatsApp or email with
            photo / video proof.
          </p>
          <p className="mb-4 font-semibold text-gray-900">📞 9405923854</p>
          <button
            type="button"
            data-ocid="policy.back_button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white transition-all hover:bg-rose-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </button>
        </motion.div>
      </div>
    </div>
  );
}
