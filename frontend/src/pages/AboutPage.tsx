import PublicLayout from "@/layouts/PublicLayout";
import AboutHero from "@/components/landing/about/AboutHero";
import AllFooter from "@/components/landing/AllFooter";
import {  motion } from 'framer-motion';



const AboutPage = () => {
  return (
    <PublicLayout>
      {/* Landing page always uses light mode - no theme toggle available */}
      <div className="bg-gradient-to-b from-blue-200 to-blue-50">
        {/* <LandingNavbar />        */}
        <header className="flex items-center justify-between px-10 py-6">
          <div className="w-40">
            <motion.img
            initial={{y:-20,opacity:0}}
            whileInView={{y:0,opacity:1}}
            viewport={{once:true}}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
              src="/mneumonicoreblack.svg"
              alt="Nuemonicore"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="h-10">
            <motion.img  
            initial={{y:-20,opacity:0}}
            whileInView={{y:0,opacity:1}}
            viewport={{once:true}}
            whileHover={{ rotate: 360 }}
             transition={{ duration: 0.6, ease: "easeInOut" }}
              src="/mneumonicorelogo.svg"
              alt="Nuemonicore"
              className="h-full w-full object-contain"
            />
          </div>
        </header>

        <AboutHero/>
        <AllFooter/>
       
        
      </div>
    </PublicLayout>
  );
};

export default AboutPage;
