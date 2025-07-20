import LandingNavbar from "@/components/landing/LandingNavbar";

const LandingPage = () => {
  return (
    <div>
      {/* <LandingNavbar />        */}
      <header className="flex items-center justify-between px-10 py-6">
        <div className="w-40">
          <img
            src="/mneumonicoreblack.svg"
            alt="Nuemonicore"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="h-10">
          <img
            src="/mneumonicorelogo.svg"
            alt="Nuemonicore"
            className="h-full w-full object-contain"
          />
        </div>
      </header>
      
      <LandingNavbar />
    </div>
  );
};

export default LandingPage;
