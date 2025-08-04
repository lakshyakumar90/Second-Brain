import { ArrowRight, Globe, Instagram, Linkedin, Mail, Twitter } from "lucide-react";
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const RotatingText = () => {
  const texts = [
    "Effortlessly.",
    "Powerfull.",
    "Creative",
    "With Ai",
  ];
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

const AllFooter = () => {
  return (
    <div className="h-[90vh] bg-red-50 mt-20">
      <div className="h-[80vh]  px-10">
        <div className="bg-white h-full border-b border-b-gray-300 hover:border-b-gray-200 pt-20 pl-20">
              <div className="group h-[10vw] w-[45vw] hover:text-[#6ee166] ">
                    <div className="flex gap-3 items-center ">
                    <h1 className="text-7xl font-bold ">Let's make</h1>
                    <ArrowRight className="group-hover:translate-x-3 transition-transform ease-in-out"  size={62} color="#6ee166" strokeWidth={3} />
                    </div>
                   <div className="flex gap-3">
                   <h1 className="text-7xl font-bold">something</h1>
                   < RotatingText /> 
                   </div>
              </div>
              <div className="mt-40 flex">
                      <div className="leading-3  w-60">
                              <div className="flex gap-1 items-center ">
                                      <Globe />
                                      <p className="text-xl font-bold ">We work globally</p>
                              </div>
                               <Link to="/auth/register">
                               <div className="flex gap-1 items-center group">
                                      <p className="text-lg">Submit a brief</p>
                                      <ArrowRight className="group-hover:translate-x-1 transition-transform ease-in-out" size={20} strokeWidth={2} />
                               </div>
                               </Link>
                              <a className="hover:border-b-2 border-black" href="">contact@mneumonicore</a>
                      </div>
                      <div className="leading-3">
                              <p className="text-xl font-bold">India</p>
                              <p className="text-lg">Uttarakhand,Dehradun</p>
                              <a className="hover:border-b-2 border-black" href="">lakshya@mneumonicore</a>
                      </div>
              </div>
        </div>
      </div>

      <div className="mx-10 border-t border-t-gray-300 hover:border-t-gray-200 w-[95%] py-10">
       
        <div className="px-5 flex justify-between">
          <div className="w-40">
            <motion.img
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              src="/mneumonicoreblack.svg"
              alt="Nuemonicore"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex items-center gap-5 px-4 ">
            <a className="text-gray-700 hover:text-gray-500" href="#"><Twitter /></a>
            <a className="text-gray-700 hover:text-gray-500" href="#"><Linkedin /></a>
            <a className="text-gray-700 hover:text-gray-500" href="#"><Mail /></a>
            <a className="text-gray-700 hover:text-gray-500" href="#"><Instagram /></a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllFooter;
