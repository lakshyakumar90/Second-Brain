import { motion } from "framer-motion";

const BentoGrid = () => {
  const boxes = [
    {
      title: "Capture Ideas Effortlessly",
      description:
        "Instantly jot down thoughts, sketches, or links in a workspace that adapts to your flow— no more switching apps.",
      icon: "●●",
      bgClass: "bg-[#9BB8E8] text-black",
      colSpan: "col-span-1",
    },
    {
      title: "Visualize Connections",
      description:
        "Drag and drop visuals, mind maps, and notes to see how ideas link up, turning chaos into clarity.",
      icon: "▨",
      bgClass: "bg-[#9BB8E8] text-black",
      colSpan: "col-span-1",
    },
    {
      title: "Collaborate in Real-Time",
      description:
        "Invite teams to brainstorm and edit together, with changes syncing instantly for seamless group creativity.",
      icon: "✦",
      bgClass: "bg-[#9BB8E8] text-black",
      colSpan: "col-span-1",
    },
    {
      title: "Secure Your Knowledge",
      description:
        "Rest easy with end-to-end encryption and privacy controls—your 'second brain' stays yours alone.",
      icon: "⟲",
      bgClass: "bg-[#9BB8E8] text-black",
      colSpan: "col-span-1",
    },
    {
      title: "Innovate Without Limits",
      description:
        "Access cutting-edge tools for productivity and creativity, constantly updated to fuel students, pros, and dreamers alike.",
      icon: "●",
      bgClass: "bg-[#023047] text-white",
      colSpan: "col-span-2",
    },
  ];

  return (
    <div className="py-20">
      <h2 className="text-[8vw] font-semibold-s mb-10">Discover Us</h2>
      <div className="grid grid-cols-3 gap-4 max-w-7xl mx-auto">
        {boxes.map((box, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`${box.bgClass} rounded-xl shadow-md p-6 flex flex-col justify-between ${box.colSpan}`}
          >
            <div className="mb-4">
              <span className="text-2xl mb-2 block">{box.icon}</span>
              <h3 className="text-xl font-bold">{box.title}</h3>
            </div>
            <p className="text-sm leading-relaxed">{box.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BentoGrid;
