import PublicLayout from "@/layouts/PublicLayout";
import AboutHero from "@/components/landing/about/AboutHero";
const AboutPage = () => {
  return (
    <PublicLayout>
      {/* Landing page always uses light mode - no theme toggle available */}
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

        <AboutHero/>
        
       
      </div>
    </PublicLayout>
  );
};

export default AboutPage;
