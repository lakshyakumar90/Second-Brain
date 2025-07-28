import {  motion } from 'framer-motion';
import { ArrowRight} from 'lucide-react';
const HeroAI=()=>{
    return(
        <div className="  w-full ">
            <motion.h1 
             initial={{ y:-20,opacity:0 }}
            whileInView={{y:0,opacity:1 }}
            transition={{duration:0.6,delay:0.5}}
            viewport={{once:true}}
            className="text-[8vw] font-semibold-s px-10 pt-20  mb-10 leading-28">Meet Your <br /> Creative AI Companion</motion.h1>
            <motion.p 
             initial={{ y:-20,opacity:0 }}
            whileInView={{y:0,opacity:1 }}
            transition={{duration:0.6,delay:0.9}}
            viewport={{once:true}}
            className=" px-10 text-2xl mb-6"><span className="font-semibold">Mneumonicare AI</span> isn’t just another add-on—<br />it’s an embedded
             assistant that helps you  think, create, and stay organized.</motion.p>
             <motion.button
             initial={{ y:-20,opacity:0 }}
            whileInView={{y:0,opacity:1 }}
            transition={{duration:0.6,delay:0.9}}
            viewport={{once:true}}
             className="mb-30 py-2 px-4 mx-10 flex gap-1 w-43 items-center bg-black border border-black rounded-4xl group ">
                <h3 className="text-xl text-white group-hover:font-bold"> Get Started</h3>
                <motion.span  className=' group-hover:translate-x-1 transition-transform ease-in-out'><ArrowRight color="#ffffff" /></motion.span>
             </motion.button>
            <div className="h-[105vh] py- 10 px-10 mb-30">
                <motion.img
                initial={{scale:0.9,opacity:0}} 
                whileInView={{scale:1,opacity:1}}
                transition={{delay:1,duration:1}}
                viewport={{once:true}}
                 className="h-full w-full rounded-xl object-cover object-center" src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
            </div>
        </div>
    )
}

export default HeroAI;
