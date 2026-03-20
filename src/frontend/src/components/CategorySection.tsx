import { motion } from "motion/react";

interface CategorySectionProps {
  onCategoryClick?: (category: string) => void;
}

const categories = [
  {
    id: "fragrance",
    label: "Fragrance",
    image: "/assets/generated/zenethic-category-fragrance.dim_600x400.jpg",
  },
  {
    id: "skincare",
    label: "Skincare",
    image: "/assets/generated/zenethic-category-skincare.dim_600x400.jpg",
  },
  {
    id: "accessories",
    label: "Aesthetic Accessories",
    image: "/assets/generated/zenethic-category-accessories.dim_600x400.jpg",
  },
];

export function CategorySection({ onCategoryClick }: CategorySectionProps) {
  return (
    <section className="py-10" aria-labelledby="category-heading">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6 text-center"
        >
          <h2 id="category-heading" className="section-title">
            Shop by Category
          </h2>
        </motion.div>

        {/* Category cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.id}
              type="button"
              data-ocid={`category.${cat.id}.button`}
              onClick={() => onCategoryClick?.(cat.id)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group overflow-hidden rounded-2xl bg-white text-left transition-all hover:-translate-y-1 hover:shadow-lg"
              style={{ boxShadow: "0 2px 8px rgba(17,24,39,0.07)" }}
              aria-label={`Shop ${cat.label}`}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(17,24,39,0.35) 0%, transparent 55%)",
                  }}
                />
              </div>

              {/* Label below */}
              <div className="px-4 py-3">
                <h3 className="font-display text-base font-bold text-gray-900">
                  {cat.label}
                </h3>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
