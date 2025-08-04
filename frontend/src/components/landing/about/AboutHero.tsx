import { motion } from "framer-motion";

const AboutHero = () => {
  return (
    <div className="  w-full">
      <h1 className="px-10  text-[7vw] font-semibold tracking-tighter pt-20  mb-15 leading-25">
        Your Space <br /> for Creative Thinking
      </h1>
            <div className="  h-100p-10 flex items-center justify-between px-20 mb-20">
                   <div className="h-70 w-110 bg- bg-blue-100 hover:bg-blue-50  shadow-2xl p-5 flex flex-col items-center rounded-2xl">
          <p className="text-xl text-center py-5">
            We founded Mneumonicare because today’s thinkers need more than
            old-fashioned note apps or clunky collaboration tools. We believe in
            a more fluid workflow, where notes, visuals, ideas, and teamwork
            blend seamlessly in one digital space—a true “second brain.”
          </p>
                    </div>
                    <div className="h-70 w-110 bg- bg-[#ebedf0] hover:bg-gray-300 border-2   shadow p-5 flex flex-col items-center rounded-2xl">
          <p className="text-xl text-center py-5">
            Our goal is to empower you to capture, connect, and grow your ideas
            effortlessly. With Mneumonicare, your creativity and collaboration
            flow freely—all in one secure, intuitive platform.
          </p>
                    </div>
                    <div className="h-70 w-110 bg- bg-[#ebedf0] hover:bg-gray-300 border-2   shadow p-5 flex flex-col items-center rounded-2xl">
          <p className="text-xl text-center py-5">
            We are dedicated to a human-first design that adapts to how you
            think and work. Your knowledge stays private and protected, letting
            you focus on what matters most. Join us in building a smarter, more
            connected way to think, create, and achieve—together.
          </p>
                        </div>
             </div>
      <div className="border border-black mx-10 w-[92%] mb-20"></div>
      <div className="bg-red-200 px-10 h-[50vh] mb-40">
        <div className="bg-white">Bento grip</div>
      </div>
      <div className="border border-black mx-10 w-[95%] mb-30"></div>
      <div className="px-10 mb-30">
        <motion.p
          initial={{
            y: -20,
            opacity: 0,
          }}
          whileInView={{
            y: 0,
            opacity: 1,
          }}
          transition={{
            duration: 0.5,
            delay: 0.1,
          }}
          className="text-5xl font-medium text-center"
        >
          Individuals seeking a smarter, always-ready place to organize life or
          learning..
        </motion.p>
        <motion.p
          initial={{
            y: -20,
            opacity: 0,
          }}
          whileInView={{
            y: 0,
            opacity: 1,
          }}
          transition={{
            duration: 0.7,
            delay: 0.1,
          }}
          className="text-5xl font-medium  text-center"
        >
          Teams & Orgs that want real-time collaboration—brainstorming, project
          planning, documentation, and more.
        </motion.p>
        <motion.p
          initial={{
            y: -20,
            opacity: 0,
          }}
          whileInView={{
            y: 0,
            opacity: 1,
          }}
          transition={{
            duration: 0.9,
            delay: 0.1,
          }}
          className="text-5xl font-medium  text-center"
        >
          Students & Educators who need to blend notes, visuals, research, and
          class work.
        </motion.p>
        <motion.p
          initial={{
            y: -20,
            opacity: 0,
          }}
          whileInView={{
            y: 0,
            opacity: 1,
          }}
          transition={{
            duration: 1,
            delay: 0.1,
          }}
          className="text-5xl font-medium  text-center"
        >
          Creative professionals who think visually, need flexibility, and want
          a living, collaborative knowledge base.
        </motion.p>
      </div>
      <div className="border border-black mx-10 w-[95%] mb-10"></div>
      <div className=" px-10 flex justify-between ">
        <div>
          <h1 className="text-5xl mb-4 ">Join Us</h1>
          <p className="text-2xl mb-4">
            <span className="font-semibold">Mneumonicare</span> is growing
            rapidly. We’d love you to be part of our journey <br />
            —share feedback, join our community, or build something amazing
            together.
          </p>
          <button className="mb-5 p-2  flex gap-1 items-center border border-black rounded-2xl ">
            <h3 className="text-xl"> Get Started</h3>
            <svg
              className="w-8"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
            </svg>
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
          <p className="text-lm text-gray-600">
            © 2025{" "}
            <a
              className="border-b border-gray-300 hover:border-gray-600"
              href="#"
            >
              Privacy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutHero;
