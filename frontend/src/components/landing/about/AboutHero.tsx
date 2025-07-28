import Carousel from "@/components/ui/carousel";
import { motion } from 'framer-motion';


const AboutHero = () => {
  
  const slideData = [
    {
      title: "Mystic Mountains",
      button: "Explore Component",
      src: "https://images.unsplash.com/photo-1494806812796-244fe51b774d?q=80&w=3534&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Urban Dreams",
      button: "Explore Component",
      src: "https://images.unsplash.com/photo-1518710843675-2540dd79065c?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Neon Nights",
      button: "Explore Component",
      src: "https://images.unsplash.com/photo-1590041794748-2d8eb73a571c?q=80&w=3456&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Desert Whispers",
      button: "Explore Component",
      src: "https://images.unsplash.com/photo-1679420437432-80cfbf88986c?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];
  return (
    <div className="  w-full">
            <h1 className="text-[8vw] font-semibold-s px-10 pt-20  mb-15 leading-30">Shaping<br /> the  Future of <br />Work  & Learning</h1>
            <p className=" px-10 text-3xl mb-20">We founded <span className="font-semibold">Mneumonicare</span> because today’s thinkers need more than old-fashioned
                 note apps or clunky collaboration tools. We believe in a more fluid workflow, where notes,
                  visuals, ideas, and teamwork blend seamlessly in one digital space—a true <span className="font-semibold">“second brain.”</span></p>
            <div className="border border-black mx-10 w-[92%] mb-20"></div>
            <div className="bg-red-200 px-10 h-[50vh] mb-40">
                <div className="bg-white">Bento grip</div>
            </div>
            <div className="border border-black mx-10 w-[95%] mb-30"></div>

            <div 
            className="px-10 mb-30">
                           
                            <motion.p 
                            initial={{
                              y:-20,
                              opacity:0
                            }}
                            whileInView={{
                              y:0,
                              opacity:1
                            }}
                            transition={{
                              duration:0.5,
                              delay:0.1
                            }}
                            className="text-5xl font-medium text-center">Individuals seeking a smarter, always-ready place to organize life or learning..</motion.p> 
                            <motion.p 
                             initial={{
                              y:-20,
                              opacity:0
                            }}
                            whileInView={{
                              y:0,
                              opacity:1
                            }}
                            transition={{
                              duration:0.7,
                              delay:0.1
                            }}
                            className="text-5xl font-medium  text-center">Teams & Orgs that want real-time collaboration—brainstorming, project planning, documentation, and more.</motion.p>
                            <motion.p
                             initial={{
                              y:-20,
                              opacity:0
                            }}
                            whileInView={{
                              y:0,
                              opacity:1
                            }}
                            transition={{
                              duration:0.9,
                              delay:0.1
                            }}
                            className="text-5xl font-medium  text-center">Students & Educators who need to blend notes, visuals, research, and class work.</motion.p>
                            <motion.p 
                             initial={{
                              y:-20,
                              opacity:0
                            }}
                            whileInView={{
                              y:0,
                              opacity:1
                            }}
                            transition={{
                              duration:1,
                              delay:0.1
                            }}
                            className="text-5xl font-medium  text-center">Creative professionals who think visually, need flexibility, and want a living, collaborative knowledge base.</motion.p>
             </div>
             <div className="border border-black mx-10 w-[95%] mb-10"></div>

             <div className=" px-10 flex justify-between ">
                <div>
                    <h1 className="text-5xl mb-4 ">Join Us</h1>
                    <p className="text-2xl mb-4"><span className="font-semibold">Mneumonicare</span> is growing rapidly.
                        We’d love you to be part of our journey <br />
                        —share feedback, join our community,
                        or build something amazing together.</p>
                        <button className="mb-5 p-2  flex gap-1 items-center border border-black rounded-2xl ">
                <h3 className="text-xl"> Get Started</h3>
                <svg className="w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path></svg>
             </button>
                </div>
                <div className="flex items-center gap-2">
                                    <div className="h-15">
                                        <img  
                                        src="/mneumonicorelogo.svg"
                                        alt="Nuemonicore"
                                        className="h-full w-full object-contain"
                                        />
                                    </div>
                                    <p className="text-lm text-gray-600">© 2025 <a className="border-b border-gray-300 hover:border-gray-600" href="#">Privacy</a></p>
                        </div>
             </div>

             "use client";



 
    <div className="relative overflow-hidden w-full h-full py-20">
      <Carousel slides={slideData} />
    </div>
  




             
        </div>
  )
}

export default AboutHero;