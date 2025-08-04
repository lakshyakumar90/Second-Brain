import {
  ArrowRight,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  Twitter,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const RotatingText = () => {
  const texts = ["Effortlessly.", "Powerful.", "Creative", "With Ai"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.h1
      key={index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      // whileHover={{color:'#6ee166'}}
      className=" text-7xl font-bold pb-6"
    >
      {texts[index]}
    </motion.h1>
  );
};

const Footer = () => {
  return (
    <div className="bg-white relative">
      <div className="h-[80vh] px-20 pt-20">
        <div className="h-full">
          <div className="group h-[10vw] w-[45vw] hover:text-[#6ee166] cursor-default ">
            <div className="flex gap-3 items-center ">
              <h1 className="text-7xl font-bold ">Let's make</h1>
              <ArrowRight
                className="group-hover:translate-x-3 transition-transform ease-in-out"
                size={62}
                color="#6ee166"
                strokeWidth={3}
              />
            </div>
            <div className="flex gap-3">
              <h1 className="text-7xl font-bold">something</h1>
              <RotatingText />
            </div>
          </div>
          <div className="mt-40 flex gap-16">
            <div className="leading-relaxed">
              <div className="flex gap-2 items-center mb-2">
                <Globe className="w-5 h-5 text-green-600" />
                <p className="text-xl font-bold">We work globally</p>
              </div>
              <Link to="/contact">
                <div className="flex gap-1 items-center group mb-1">
                  <p className="text-lg">Submit a brief</p>
                  <ArrowRight
                    className="group-hover:translate-x-1 transition-transform ease-in-out"
                    size={20}
                    strokeWidth={2}
                  />
                </div>
              </Link>
              <a className="text-lg hover:border-b-2 border-black transition-colors" href="mailto:contact@mneumonicore.com">
                contact@mneumonicore.com
              </a>
            </div>
            <div className="leading-relaxed">
              <p className="text-xl font-bold mb-2">India</p>
              <p className="text-lg mb-1">Uttarakhand, Dehradun</p>
              <a className="text-lg hover:border-b-2 border-black transition-colors" href="mailto:lakshya@mneumonicore.com">
                lakshya@mneumonicore.com
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-20 border-t border-t-gray-300 py-10">
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
              <a className="border-b border-gray-300 hover:border-gray-600" href="#">
                Privacy
              </a>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a className="text-gray-700 hover:text-gray-500" href="#">
              Twitter X
            </a>
            <span className="text-green-500">*</span>
            <a className="text-gray-700 hover:text-gray-500" href="#">
              Instagram
            </a>
            <span className="text-green-500">*</span>
            <a className="text-gray-700 hover:text-gray-500" href="#">
              Linkedin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
