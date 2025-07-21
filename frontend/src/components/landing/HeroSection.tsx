const HeroSection =() =>{
    return(
        <div className="  w-full ">
            <h1 className="text-[8vw] font-semibold-s px-10 pt-20 pb-30 leading-29">Empower Your <br /> Mind  with Mneumonicare</h1>
            <div className="h-[105vh] py- 10 px-10 mb-50">
                <img className="h-full w-full rounded-xl object-cover object-center" src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
            </div>
            <div className="bg-red-400 h-[50vh] flex flex-col items-center gap-2 mb-50 ">
                <h1 className="text-7xl font-semibold ">Imagine a single workspace</h1>
                <h1 className="text-7xl font-semibold">and collaborations live side-by-side</h1>
                <h1 className="text-7xl font-semibold">where your notes, ideas, sketches,</h1>
                <h1 className="text-7xl font-semibold"> this is Mneumonicare</h1>
            </div>
        </div>
    )
}

export default HeroSection;