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
  borderColor,
  children,
  index,
}: {
  icon: React.ElementType;
  title: string;
  iconColor: string;
  borderColor: string;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="rounded-xl p-5 md:p-6"
      style={{
        backgroundColor: "oklch(13% 0.01 280)",
        border: `1px solid ${borderColor}`,
      }}
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${iconColor}1a` }}
        >
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
        </div>
        <h2
          className="font-display text-base font-bold uppercase tracking-[0.1em] md:text-lg"
          style={{ color: iconColor }}
        >
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
    <li
      className="flex items-start gap-2.5 text-sm leading-relaxed"
      style={{ color: "oklch(75% 0.01 280)" }}
    >
      <span
        className="mt-0.5 h-4 w-4 shrink-0"
        style={{ color: check ? "oklch(65% 0.22 15)" : "oklch(55% 0.23 15)" }}
      >
        {check ? "✓" : "•"}
      </span>
      {children}
    </li>
  );
}

export function ReturnPolicy({ onBack }: ReturnPolicyProps) {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "oklch(10% 0.009 280)" }}
    >
      {/* Hero banner */}
      <div
        className="relative overflow-hidden py-12 md:py-16"
        style={{
          background:
            "linear-gradient(135deg, oklch(10% 0.009 280) 0%, oklch(14% 0.025 15) 100%)",
          borderBottom: "1px solid oklch(55% 0.23 15 / 0.15)",
        }}
      >
        {/* Glow blob */}
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: "oklch(55% 0.23 15 / 0.08)" }}
          aria-hidden="true"
        />
        <div className="container mx-auto px-4">
          <button
            type="button"
            data-ocid="policy.back_button"
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: "oklch(60% 0.015 280)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color =
                "oklch(65% 0.22 15)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color =
                "oklch(60% 0.015 280)";
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
              style={{
                backgroundColor: "oklch(55% 0.23 15 / 0.12)",
                color: "oklch(65% 0.22 15)",
                border: "1px solid oklch(55% 0.23 15 / 0.25)",
              }}
            >
              <RefreshCw className="h-3 w-3" />
              Customer Policy
            </div>
            <h1
              className="font-display text-3xl font-extrabold leading-tight tracking-tight md:text-5xl"
              style={{ color: "oklch(95% 0.005 280)" }}
            >
              Return &amp; Refund
              <span
                className="block"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(65% 0.22 15), oklch(50% 0.23 15))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Policy
              </span>
            </h1>
            <p
              className="mt-3 max-w-xl text-sm leading-relaxed md:text-base"
              style={{ color: "oklch(60% 0.012 280)" }}
            >
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
            iconColor="oklch(65% 0.22 15)"
            borderColor="oklch(55% 0.23 15 / 0.18)"
          >
            <p
              className="mb-3 text-sm"
              style={{ color: "oklch(65% 0.012 280)" }}
            >
              We accept returns{" "}
              <strong style={{ color: "oklch(75% 0.01 280)" }}>only</strong>{" "}
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
            iconColor="oklch(75% 0.18 70)"
            borderColor="oklch(75% 0.18 70 / 0.18)"
          >
            <p
              className="text-sm leading-relaxed"
              style={{ color: "oklch(72% 0.01 280)" }}
            >
              Customers must request a return within{" "}
              <strong style={{ color: "oklch(85% 0.01 280)" }}>
                48 hours of delivery
              </strong>{" "}
              by contacting us on{" "}
              <strong style={{ color: "oklch(85% 0.01 280)" }}>
                WhatsApp or email
              </strong>{" "}
              with proper proof (photos / videos).
            </p>
          </PolicyCard>

          {/* Non-Returnable */}
          <PolicyCard
            index={2}
            icon={XCircle}
            title="Non-Returnable Conditions"
            iconColor="oklch(60% 0.2 25)"
            borderColor="oklch(60% 0.2 25 / 0.18)"
          >
            <p
              className="mb-3 text-sm"
              style={{ color: "oklch(65% 0.012 280)" }}
            >
              We do <strong style={{ color: "oklch(70% 0.18 25)" }}>NOT</strong>{" "}
              accept returns if:
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
            iconColor="oklch(70% 0.15 200)"
            borderColor="oklch(70% 0.15 200 / 0.18)"
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
            iconColor="oklch(68% 0.18 145)"
            borderColor="oklch(68% 0.18 145 / 0.18)"
          >
            <ul className="space-y-2">
              <ListItem check>
                Refund will be processed after we receive and inspect the
                product
              </ListItem>
              <ListItem check>
                Refund will be credited within{" "}
                <strong style={{ color: "oklch(85% 0.01 280)" }}>
                  5–7 working days
                </strong>{" "}
                to the original payment method
              </ListItem>
            </ul>
          </PolicyCard>
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.45 }}
          className="mt-8 rounded-xl p-6 text-center"
          style={{
            background:
              "linear-gradient(135deg, oklch(55% 0.23 15 / 0.08), oklch(55% 0.23 15 / 0.04))",
            border: "1px solid oklch(55% 0.23 15 / 0.2)",
          }}
        >
          <p
            className="mb-1 font-display text-base font-bold"
            style={{ color: "oklch(85% 0.01 280)" }}
          >
            Need help with a return?
          </p>
          <p className="mb-4 text-sm" style={{ color: "oklch(60% 0.012 280)" }}>
            Contact us within 48 hours of delivery via WhatsApp or email with
            photo / video proof.
          </p>
          <button
            type="button"
            data-ocid="policy.back_button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold uppercase tracking-wider transition-all"
            style={{
              background:
                "linear-gradient(135deg, oklch(55% 0.23 15), oklch(45% 0.23 15))",
              color: "#ffffff",
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </button>
        </motion.div>
      </div>
    </div>
  );
}
