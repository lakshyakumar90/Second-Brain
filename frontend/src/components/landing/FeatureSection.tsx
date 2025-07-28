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
                        <img className="h-full object-cover object-center" src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
                    </div>
            </div>
        </div>
        
    )
}

export default FeatureSection;