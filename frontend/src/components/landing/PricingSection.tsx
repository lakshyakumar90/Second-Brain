import { motion } from "framer-motion";
import {
  Check,
  Star,
  Zap,
  FileText,
  Palette,
  Settings,
  MessageCircle,
  Layers,
  Code,
  Users,
  Shield,
  ArrowRight,
} from "lucide-react";
import LandingButton from "../ui/landing-button";
import { Link } from "react-router-dom";

const PricingSection = () => {
  return (
    <div className="min-h-screen px-10 py-20 relative z-10">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h1 className="text-[7vw] font-semibold mb-4">PRICING</h1>
        <h2 className="text-[3vw] font-semibold mb-6">
          Simple, Transparent Plans for Every Mind
        </h2>
        <p className="text-2xl max-w-4xl mx-auto text-gray-600">
          Whether you're a solo learner, a creative professional, or a growing
          team, Mneumonicore has a plan to fit your needs. Start for
          free—upgrade any time, no hidden fees.
        </p>
      </motion.div>

      <div className="flex justify-center items-start gap-8 max-w-7xl mx-auto">
        {/* Free Tier */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="w-80 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-gray-600">
                mneumonicore
              </span>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            <div className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full w-fit mb-4">
              Free Plan
            </div>

            {/* Title and Price */}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-gray-900">$0</span>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              Perfect for individuals and students getting started with their
              digital knowledge management journey.
            </p>

            {/* Features */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">
                  Create unlimited notes & boards
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">Basic sharing</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">
                  10 AI queries/month
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">2 devices</span>
              </div>
            </div>

            {/* CTA Button */}
            <LandingButton link="/auth/register">
              Get Started Free
            </LandingButton>
          </div>
        </motion.div>

        {/* Pro Tier */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="w-80 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-200 relative"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 border-2 border-purple-500 rounded-sm flex items-center justify-center">
                <div className="w-2 h-2 bg-purple-500 rounded-sm"></div>
              </div>
              <span className="text-sm font-medium text-gray-600">
                mneumonicore
              </span>
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            </div>
            <div className="bg-purple-100 text-purple-700 text-xs font-medium px-3 py-1 rounded-full w-fit mb-4">
              Pro Plan
            </div>

            {/* Title and Price */}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-gray-900">$9</span>
              <span className="text-gray-500">/month</span>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              Everything Free, plus unlimited sharing, advanced collaboration,
              templates, and priority support.
            </p>

            {/* Features */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">Everything Free</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">Unlimited sharing</span>
              </div>
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">
                  Advanced collaboration
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Palette className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">Templates</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">
                  100 AI queries/month
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">Priority support</span>
              </div>
            </div>

            {/* CTA Button */}
            <LandingButton link="/auth/register">Get Pro Plan</LandingButton>
          </div>
        </motion.div>

        {/* Custom Tier */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="w-80 bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 border-2 border-white rounded-full animate-spin"></div>
            </div>

            {/* Title and Price */}
            <h3 className="text-2xl font-bold text-white mb-2">Custom</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-white">Custom</span>
            </div>
            <div className="bg-gray-800 text-gray-300 text-xs font-medium px-3 py-1 rounded-full w-fit mb-4">
              Custom Pricing
            </div>

            {/* Description */}
            <p className="text-gray-300 mb-6 leading-relaxed">
              Dedicated onboarding, custom security (SSO, audit logs), API
              access, and priority SLA for companies and institutions.
            </p>

            {/* Features */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">
                  Dedicated onboarding
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">
                  Custom security (SSO, audit logs)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Code className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">
                  API access, priority SLA
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <Link to="/contact">
              <button className="cursor-pointer w-full bg-white text-gray-900 py-3 px-4 rounded-xl font-medium hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2">
                Request Quote
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Additional Info Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
        className="mt-16 text-center"
      >
        <h2 className="text-2xl font-semibold mb-6">All Plans Include:</h2>
        <div className="flex justify-center gap-8 mb-8">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-lg">Multi-device sync</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="text-lg">End-to-end encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-green-500" />
            <span className="text-lg">Upgrades or downgrades anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-500" />
            <span className="text-lg">Unlimited whiteboards and notes</span>
          </div>
        </div>
        <p className="text-xl text-gray-600">
          Free 14-day trial on all paid features, no credit card required.
        </p>
      </motion.div>
    </div>
  );
};

export default PricingSection;
