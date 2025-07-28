import {  motion } from 'framer-motion';
const headingVariants = {
             hidden: { opacity: 0, y: 20 },
             visible: {
             opacity: 1,
             y: 0,
            transition: { duration: 0.6 }
                  }
                };

const HeroSection =() =>{
    return(
        <div className="  w-full ">
            <motion.h1 
            initial={{
                y:-50,
                opacity:0
            }}
            whileInView={{
                y:0,
                opacity:1
            }}
            transition={{duration:1,delay:0.6}}
            viewport={{once:true}}
            className="text-[8vw] font-semibold-s px-10 pt-20 pb-30 leading-29">Empower Your <br /> Mind  with Mneumonicare</motion.h1>
            <div className="h-[150vh] py- 10 px-10 mb-50 ">
                <div className='sticky top-20'>
                    <motion.img
                initial={{scale:0.7,opacity:0}} 
                whileInView={{scale:1.05,opacity:1}}
                transition={{delay:1,duration:1}}
                viewport={{once:true}}
                 className="h-full w-full rounded-xl object-cover object-center cursor-pointer" src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
                </div>
                
            </div>

            

            <motion.div 
                        initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{  staggerChildren: 0.2,delay:2 }}
            
            className="bg-red-400 h-[63vh] flex flex-col items-center gap-2 mb-50  ">
                <motion.h1
                 variants={headingVariants}
                
                 className="text-7xl font-semibold ">Imagine a single workspace</motion.h1>
                <motion.h1 variants={headingVariants} className="text-7xl font-semibold">and collaborations live side-by-side</motion.h1>
                <motion.h1 variants={headingVariants} className="text-7xl font-semibold">where your notes, ideas, sketches,</motion.h1>
                <motion.h1 variants={headingVariants} className="text-7xl font-semibold mb-7"> this is Mneumonicare</motion.h1>
                <motion.p variants={headingVariants} className="text-xl  text-center">Mneumonicare is your digital second brain—purpose-built to help you collect thoughts,<br /> organize projects, visualize concepts, and collaborate seamlessly with others.Whether you’re  <br />managing personal learning, running a team project, or <br /> simply making sense of busy life, Mneumonicare offers a unified space to think, build, and grow.</motion.p>
            </motion.div>
        </div>
    )
}

export default HeroSection;