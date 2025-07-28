import { Instagram, Linkedin, Mail, Twitter } from "lucide-react"
import {  motion } from 'framer-motion';

const AllFooter = () => {
  return (
    <div>
        <div className=' mx-10 border-t border-t-gray-300 hover:border-t-gray-200 w-[95%] h-1vh py-10'>
            <div className='px-5 flex justify-between'>
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
                        <a className="text-gray-700 hover:text-gray-500" href="#"><  Twitter /></a>
                        <a className="text-gray-700 hover:text-gray-500" href="#"><Linkedin /></a>
                        <a className="text-gray-700 hover:text-gray-500" href="#"><Mail /></a>
                        <a className="text-gray-700 hover:text-gray-500" href="#"><Instagram /></a>
                </div>
            </div>
        </div>
    </div>
  )
}

export default AllFooter