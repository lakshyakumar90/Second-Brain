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
                        <div className="h-[150vh] px-10 py-10 mb-30">
                        <div className="sticky top-20">
                            <motion.video
                            initial={{ scale: 0.7, opacity: 0 }}
                            whileInView={{ scale: 1.05, opacity: 1 }}
                            transition={{ delay: 1, duration: 0.8 }}
                            viewport={{ once: true }}
                            src="assets1/A_fastpaced_visually_202507181103.mp4"
                            loop
                            muted
                            autoPlay
                            className="rounded-xl w-full"
                            ></motion.video>
                        </div>
                        </div>


            

            <motion.div 
                        initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{  staggerChildren: 0.2,delay:2 }}
            
            className=" h-[63vh] flex flex-col items-center gap-2 mb-30  ">
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