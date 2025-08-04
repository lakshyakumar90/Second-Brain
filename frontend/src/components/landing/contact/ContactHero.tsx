
import { ArrowRight} from 'lucide-react';
import { Link } from 'react-router-dom';
import {  motion } from 'framer-motion';

const ContactHero = () => {
  return (
    <div className="h-[90vh] ">
      <div className=" h-full w-full flex">
        <div className="w-[100%]">
          <motion.h1 
           initial={{ y:10,opacity:0 }}
            whileInView={{y:0,opacity:1 }}
            transition={{duration:0.6,delay:0.3}}
            viewport={{once:true}}
          className="text-[8vw] font-semibold  tracking-tighter pl-20 pt-30  pb-10 leading-28 ">
            We're <br /> Here to Help
          </motion.h1>
          <motion.p
          initial={{ y:10,opacity:0 }}
            whileInView={{y:0,opacity:1 }}
            transition={{duration:0.6,delay:0.3}}
            viewport={{once:true}}
          className="px-20 text-xl font-medium mb-8">
            Questions, feedback, partnership inquiries, or need technical
            support? <br />
            Reach out—we love hearing from you.
          </motion.p>
          <Link to="/auth/register">
             <motion.button
             initial={{ y:10,opacity:0 }}
            whileInView={{y:0,opacity:1 }}
            transition={{duration:0.6,delay:0.3}}
            viewport={{once:true}}
             className="mb-30 py-2 px-4 mx-20 flex gap-1 w-43 items-center bg-black border border-black rounded-4xl group ">
                <h3 className="text-xl text-white group-hover:font-bold"> Get Started</h3>
                <motion.span  className=' group-hover:translate-x-1 transition-transform ease-in-out'><ArrowRight color="#ffffff" /></motion.span>
             </motion.button>
             </Link>
        </div>

        <div className="w-1/2 h-full">
          {/* <ThreeDElement /> */}
        </div>
      </div>
    </div>
  );
};
export default ContactHero;
