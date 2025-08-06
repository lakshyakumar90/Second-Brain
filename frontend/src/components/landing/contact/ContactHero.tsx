import { ArrowRight, Globe } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

interface ContactHeroProps {
  onOpenForm: () => void;
}

const ContactHero: React.FC<ContactHeroProps> = ({ onOpenForm }) => {
  return (
    <div className="mx-auto px-20 pb-10">
      <div className="w-full max-w-7xl flex">
        <div className="w-1/2 flex flex-col justify-center py-20">
          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-[7vw] font-semibold text-white leading-[1.05] mb-8"
          >
            We've got a <br /> great feeling <br /> about this
          </motion.h1>
          <button
            onClick={onOpenForm}
            className="flex items-center gap-2 bg-[#281545] hover:bg-purple-400 cursor-pointer transition-all duration-300 text-white px-4 py-2 rounded-full w-fit"
          >
            Submit a brief
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="w-1/2">{/* Blank space on the right */}</div>
      </div>

      <div className="flex flex-col pb-10 gap-8">
        <div className="leading-relaxed">
          <div className="flex gap-2 items-center mb-2">
            <Globe className="w-5 h-5 text-green-600" />
            <p className="text-xl font-semibold">We work globally</p>
          </div>
          <a
            className="text-lg hover:border-b-2 border-black/80 transition-colors"
            href="mailto:contact@mneumonicore.com"
          >
            contact@mneumonicore.com
          </a>
        </div>
        <div className="leading-relaxed">
          <p className="text-xl font-bold mb-2">India</p>
          <p className="text-lg mb-1 text-gray-500 cursor-default">
            Uttarakhand, Dehradun
          </p>
          <a
            className="text-lg text-gray-500 hover:border-b-2 border-gray-400 transition-colors"
            href="mailto:lakshya@mneumonicore.com"
          >
            lakshya@mneumonicore.com
          </a>
        </div>
      </div>

      <div className="border-t border-t-gray-300 pt-10">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8">
              <img
                src="/mneumonicorelogo.svg"
                alt="Mneumonicore"
                className="h-full w-full object-contain"
              />
            </div>
            <p className="text-sm text-gray-600">
              © 2025{" "}
              <a
                className="border-b border-gray-300 hover:border-gray-600"
                href="#"
              >
                Privacy
              </a>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 bg-green-500 rounded-full"></span>
              <a className="text-gray-700 hover:text-gray-500" href="#">
                Twitter X
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 bg-green-500 rounded-full"></span>
              <a className="text-gray-700 hover:text-gray-500" href="#">
                Instagram
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 bg-green-500 rounded-full"></span>
              <a className="text-gray-700 hover:text-gray-500" href="#">
                Linkedin
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactHero;
