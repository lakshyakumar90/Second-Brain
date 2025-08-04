import PublicLayout from "@/layouts/PublicLayout";
import ContactHero from "@/components/landing/contact/ContactHero";
import Footer from "@/components/landing/Footer";
import LandingNavbar from "@/components/landing/LandingNavbar";

const ContactPage = () => {
  return (
    <PublicLayout>
      {/* Landing page always uses light mode - no theme toggle available */}
      <div className="bg-gradient-to-b from-purple-200 to-purple-50">
        <LandingNavbar />
        <ContactHero />
        <Footer />
      </div>
    </PublicLayout>
  );
};

export default ContactPage;
