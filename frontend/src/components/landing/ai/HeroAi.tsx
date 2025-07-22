const HeroAI=()=>{
    return(
        <div className="  w-full ">
            <h1 className="text-[8vw] font-semibold-s px-10 pt-20  mb-10 leading-28">Meet Your <br /> Creative AI Companion</h1>
            <p className=" px-10 text-2xl mb-6"><span className="font-semibold">Mneumonicare AI</span> isn’t just another add-on—<br />it’s an embedded
             assistant that helps you  think, create, and stay organized.</p>
             <button className="mb-30 p-2 mx-10 flex gap-1 items-center border border-black rounded-2xl ">
                <h3 className="text-xl"> Get Started</h3>
                <svg className="w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path></svg>
             </button>
            <div className="h-[105vh] py- 10 px-10 mb-50">
                <img className="h-full w-full rounded-xl object-cover object-center" src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
            </div>
        </div>
    )
}

export default HeroAI;
