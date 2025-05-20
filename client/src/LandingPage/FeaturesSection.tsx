const features = [
  {
    title: "End-to-End Encryption",
    description: "Your messages stay private — always.",
  },
  {
    title: "Real-time Messaging",
    description: "Lightning-fast delivery across the globe.",
  },
  {
    title: "Noise-Free Design",
    description: "A sleek, minimalist chat experience built for focus.",
  },
];

export default function FeatureSection() {
  return (
    <section className="py-12 px-6">
      <h3 className="text-3xl font-bold text-center mb-12">Why Murmur?</h3>
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 text-center border border-gray-100"
          >
            <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
            <p className="text-gray-700">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
