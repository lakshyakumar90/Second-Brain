const GallerySection=()=>{
    return(
        <div className="  w-full">
            <div className="h-[105vh] py- 10 px-10 mb-50">
                <img className="h-full w-full rounded-xl object-cover object-center" src="assets/WhatsApp Image 2025-07-28 at 9.48.32 PM.jpeg" alt="" />
            </div>
            <div className="h-[100vh] flex justify-between gap-5 bg-red-500 px-10 mb-50">
                    <img className="w-[50%] rounded-xl object-cover object-center" src="assets1/WhatsApp Image 2025-07-28 at 9.48.32 PM.jpeg" alt="" />
                    <img className="w-[50%] rounded-xl object-cover object-center" src="assets1/WhatsApp Image 2025-07-28 at 9.48.32 PM.jpeg" alt="" />
            </div>
        </div>
    )
}

export default GallerySection;