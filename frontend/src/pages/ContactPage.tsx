import PublicLayout from "@/layouts/PublicLayout";
import ContactHero from "@/components/landing/contact/ContactHero";
import AllFooter from "@/components/landing/AllFooter";
import LandingNavbar from "@/components/landing/LandingNavbar";


const ContactPage = () => {
  return (
    <PublicLayout>
      {/* Landing page always uses light mode - no theme toggle available */}
      <div className="bg-gradient-to-b from-purple-200 to-purple-50">
        <LandingNavbar />

        <ContactHero/>
        <AllFooter/>
       
        
        
       
      </div>
    </PublicLayout>
  );
};

export default ContactPage;
