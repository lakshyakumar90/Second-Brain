const GallerySection = () => {
  return (
    <div className="w-full pb-40 bg-[#F3F3E9]">
      <div className="h-[105vh] py-10 px-10">
        <img
          className="h-full w-full rounded-3xl object-cover object-center"
          src="assets/WhatsApp Image 2025-07-28 at 9.48.32 PM.jpeg"
          alt=""
        />
      </div>
      <div className="h-[100vh] flex justify-between gap-5 px-10">
        <img
          className="w-[50%] rounded-3xl object-cover object-center"
          src="assets/ai5.png"
          alt=""
        />
        <img
          className="w-[50%] rounded-3xl object-cover object-center"
          src="assets/ai2.png"
          alt=""
        />
      </div>
    </div>
  );
};

export default GallerySection;
