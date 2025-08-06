import PublicLayout from "@/layouts/PublicLayout";
import AboutHero from "@/components/landing/about/AboutHero";
import Footer from "@/components/landing/Footer";
import LandingNavbar from "@/components/landing/LandingNavbar";
import AnimatedLayout from "@/layouts/AnimatedLayout";

const AboutPage = () => {
  return (
    <PublicLayout>
      {/* Landing page always uses light mode - no theme toggle available */}
      <div className="bg-white">
        <div className="bg-blue-100">
          <LandingNavbar />
        </div>
        <AnimatedLayout className="relative z-10 rounded-b-[50px] font-[neue-regular] bg-gradient-to-b from-blue-100 to-blue-50">
          <AboutHero />
        </AnimatedLayout>
        <Footer />
      </div>
    </PublicLayout>
  );
};

export default AboutPage;
