const CardsAi=()=>{
    return(
        <div className="  w-full  mb-30">
            <div className="flex items-center justify-center mt-20 space-x-[-4rem]">
            
            <div className="w-80 h-100 bg-gray-300 shadow-xl rounded-xl z-50 transform transition hover:scale-105 hover:z-50">
                <div className="p-15 font-semibold text-gray-800">
                    <h1 className="text-2xl text-center mb-5">Automatic Organization</h1>
                    <p className="text-md text-center">When you jot down quick ideas, upload documents, or sketch mind maps, 
                        Mneumonicare intelligently groups and tags related content, so you stay organized without manual effort.</p>
                </div>
            </div>

            <div className="w-80 h-100 bg-red-200 shadow-xl rounded-xl z-30 transform transition hover:scale-105 hover:z-50">
                <div className="p-15 font-semibold text-gray-800">
                    <h1 className="text-2xl text-center mb-5">Smart Connections</h1>
                    <p className="text-md text-center"> The more you use Mneumonicare, the more helpful it becomes—offering connections to similar topics,
                         suggesting project links, or providing relevant templates to jumpstart your workflow.</p>
                </div>
            </div>

            <div className="w-80 h-100 bg-red-100 shadow-xl rounded-xl z-20 transform transition hover:scale-105 hover:z-50">
                <div className="p-15 font-semibold text-gray-800">
                    <h1 className="text-2xl text-center mb-5">Conversational Search</h1>
                    <p className="text-md text-center">No more hunting through piles of files. Just ask a question in plain language
                        , and the AI finds the answer—whether it’s in a note, diagram, or meeting minute.</p>
                </div>
            </div>

           
            <div className="w-80 h-100 bg-red-200 shadow-xl rounded-xl z-10 transform transition hover:scale-105 hover:z-50">
                <div className="p-15 font-semibold text-gray-800">
                    <h1 className="text-2xl text-center mb-5">Whiteboard Magic</h1>
                    <p className="text-md text-center">Messy sketches? The AI tidy-ups diagrams, transcribes
                         handwriting into digital text, and even suggests ways to expand your ideas visually.</p>
                </div>
            </div>


            <div className="w-80 h-100 bg-red-100 shadow-xl rounded-xl z-40 transform transition hover:scale-105 hover:z-50">
                <div className="p-15 font-semibold text-gray-800">
                    <h1 className="text-2xl text-center mb-5">Idea Boosting</h1>
                    <p className="text-md text-center"> Feeling stuck? With a single click, get creative prompts, outlines,
                         or brainstorming help, tailored to your unique context.</p>
                </div>
            </div>
            </div>


            
        </div>
    )
}

export default CardsAi;