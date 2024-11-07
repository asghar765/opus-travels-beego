"use client";

import { motion } from "framer-motion";
import { Shield, Star, Clock, HeartHandshake } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "ATOL Protected",
    description:
      "Your holiday is protected under the ATOL scheme, ensuring your money is safe.",
  },
  {
    icon: Star,
    title: "Expert Service",
    description:
      "Our travel experts provide personalized service to create your perfect trip.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description:
      "Round-the-clock assistance available throughout your journey.",
  },
  {
    icon: HeartHandshake,
    title: "Best Price Guarantee",
    description:
      "We match any comparable price you find elsewhere.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-muted py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Why Choose InTravel?
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-muted-foreground">
            We're committed to making your travel experience exceptional from start
            to finish.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}