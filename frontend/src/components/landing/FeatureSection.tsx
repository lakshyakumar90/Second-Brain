import {  motion } from 'framer-motion';
const FeatureSection=()=>{
    return(
        <div className="mb-50">
            <motion.h1
                initial={{ y:20,opacity:0 }}
            whileInView={{y:0,opacity:1 }}
            transition={{duration:0.6,delay:0.3}}
            viewport={{once:true}}
            className="text-[8vw] font-semibold-s px-10 leading-30 mb-20" >Unify Your <br /> Work and Ideas </motion.h1>
            <div className="h-[105vh] py- 10 px-10  bg-red-400 flex gap-3 justify-between">
                    <div className="bg-white w-[50%] "></div>
                    <div className="bg-pink-100 w-[50%] ">
                        <img className="h-full object-cover object-center" src="assets1/WhatsApp Image 2025-07-28 at 9.48.32 PM.jpeg" alt="" />
                    </div>
            </div>
        </div>
        
    )
}

export default FeatureSection;