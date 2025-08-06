import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import PublicLayout from "@/layouts/PublicLayout";
import ContactHero from "@/components/landing/contact/ContactHero";
import LandingNavbar from "@/components/landing/LandingNavbar";
import BriefForm from "@/components/landing/contact/BriefForm";

const ContactPage = () => {
  const [showBriefForm, setShowBriefForm] = useState(false);

  return (
    <PublicLayout>
      <div className="bg-gradient-to-b from-[#B8B3C9] to-purple-100">
        <LandingNavbar />
        <ContactHero onOpenForm={() => setShowBriefForm(true)} />
        <AnimatePresence>
          {showBriefForm && <BriefForm onClose={() => setShowBriefForm(false)} />}
        </AnimatePresence>
      </div>
    </PublicLayout>
  );
};

export default ContactPage;
