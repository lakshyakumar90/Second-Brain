import { motion } from "framer-motion";

// You can install a professional icon library like react-icons for a cleaner look
// npm install react-icons
// import { FaUser, FaUsers, FaGraduationCap, FaPaintBrush } from "react-icons/fa";

const WhoWeServeGrid = () => {
  const audiences = [
    {
      title: "Individuals",
      description: "A customizable second brain to organize thoughts, track goals, and spark daily inspiration.",
      icon: "🧑", // Or <FaUser /> if using react-icons
      color: "bg-blue-100 text-blue-800",
    },
    {
      title: "Teams & Orgs",
      description: "Enable seamless real-time collaboration for brainstorming, project management, and shared documentation.",
      icon: "👥", // Or <FaUsers />
      color: "bg-green-100 text-green-800",
    },
    {
      title: "Students & Educators",
      description: "Integrate notes, visuals, research, and assignments in one place to foster deeper learning.",
      icon: "🎓", // Or <FaGraduationCap />
      color: "bg-purple-100 text-purple-800",
    },
    {
      title: "Creative Professionals",
      description: "Build a flexible, visual knowledge base for designers, writers, and innovators to iterate and archive ideas.",
      icon: "🎨", // Or <FaPaintBrush />
      color: "bg-orange-100 text-orange-800",
    },
  ];

  // Animation variants for the container to orchestrate children animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  // Animation variants for the individual cards
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  } as const;

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-[8vw] font-semibold-s text-slate-900 leading-[1] tracking-tight">
            Built For Everyone  
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-slate-500">
            Whether you're organizing your personal life or driving a team project,
            our platform adapts to your needs.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {audiences.map((audience) => (
            <motion.div
              key={audience.title}
              variants={itemVariants}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center cursor-pointer"
            >
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${audience.color}`}
              >
                <span className="text-4xl">{audience.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                {audience.title}
              </h3>
              <p className="text-slate-500 leading-relaxed">
                {audience.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhoWeServeGrid;