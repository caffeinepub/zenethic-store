import { motion } from "motion/react";

const STAR_PATH =
  "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          // biome-ignore lint/suspicious/noArrayIndexKey: static stars
          key={i}
          aria-hidden="true"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill={i < count ? "oklch(72% 0.18 80)" : "none"}
          stroke={i < count ? "none" : "oklch(80% 0.01 280)"}
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}

const testimonials = [
  {
    id: "t1",
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "The perfumes from Zenethic are absolutely divine! The packaging is beautiful and the fragrance lasts all day. Got so many compliments at work!",
    initials: "PS",
    accent: "oklch(55% 0.18 15)",
  },
  {
    id: "t2",
    name: "Rahul Mehta",
    location: "Delhi",
    rating: 5,
    text: "Ordered 3 items and they all arrived in perfect condition. The skincare products are genuinely amazing — my skin looks so much better after just 2 weeks!",
    initials: "RM",
    accent: "oklch(55% 0.15 40)",
  },
  {
    id: "t3",
    name: "Ananya Patel",
    location: "Bangalore",
    rating: 5,
    text: "Super fast delivery and the quality is exactly as described. The aesthetic accessories are so pretty! Already bought gifts for my whole friend group 💕",
    initials: "AP",
    accent: "oklch(52% 0.14 295)",
  },
];

export function TestimonialsSection() {
  return (
    <section
      className="py-16"
      style={{ backgroundColor: "oklch(98% 0.008 15)" }}
      aria-labelledby="testimonials-heading"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <p
            className="mb-2 text-xs font-bold uppercase tracking-[0.2em]"
            style={{ color: "oklch(55% 0.18 15)" }}
          >
            Happy Customers
          </p>
          <h2 id="testimonials-heading" className="section-title">
            What Our Customers Say
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              data-ocid={`testimonials.item.${i + 1}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-card"
            >
              {/* Stars */}
              <Stars count={t.rating} />

              {/* Quote */}
              <blockquote
                className="flex-1 text-sm leading-relaxed"
                style={{ color: "oklch(20% 0.01 280)" }}
              >
                &ldquo;{t.text}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: t.accent }}
                >
                  {t.initials}
                </div>
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{ color: "oklch(15% 0.01 280)" }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(35% 0.01 280)" }}
                  >
                    {t.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
