import PublicLayout from "@/layouts/PublicLayout";
import AboutHero from "@/components/landing/about/AboutHero";
import AllFooter from "@/components/landing/AllFooter";
import LandingNavbar from "@/components/landing/LandingNavbar";



const AboutPage = () => {
  return (
    <PublicLayout>
      {/* Landing page always uses light mode - no theme toggle available */}
      <div className="bg-gradient-to-b from-blue-200 to-blue-50">
        <LandingNavbar />

        <AboutHero/>
        <AllFooter/>
       
        
      </div>
    </PublicLayout>
  );
};

export default AboutPage;
