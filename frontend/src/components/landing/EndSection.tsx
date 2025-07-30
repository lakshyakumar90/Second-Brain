import { motion } from "framer-motion";
import { Check } from "lucide-react";

const EndSection = () => {
  return (
    <div className="h-[138vh] px-10">
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true }}
        className="text-[7vw] font-semibold"
      >
        PRICING
      </motion.h1>
      <h2 className="text-[3vw] font-semibold">
        Simple, Transparent Plans for Every Mind
      </h2>
      <p className="text-2xl mb-12">
        Whether you’re a solo learner, a creative professional, or a growing
        team, Mneumonicare has a plan to fit your needs. Start for free—upgrade
        any time, no hidden fees.
      </p>
      <div className="  h-110p-10 flex items-center justify-between">
        <div className="h-105 w-80 bg- bg-[#ebedf0] hover:bg-gray-300 border-3 shadow p-5 flex flex-col items-center rounded-2xl">
          <h1 className="text-4xl text-gray-700 mb-3">Basic</h1>
          <h1 className="text-6xl text-gray-700 font-bold mb-3">$0</h1>
          <p className="text-lg mb-3 text-gray-500">1 device / month</p>
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl text-gray-700">Individuals,Students</h1>
            <ul>
              <li className="flex gap-2">
                <Check color="#67d574" strokeWidth={4} />
                <p className="text-lg text-gray-700">Basic Sharing.</p>
              </li>
              <li className="flex gap-2">
                <Check color="#67d574" strokeWidth={4} />
                <p className="text-lg text-gray-700">
                  Create unlimited notes & boards.
                </p>
              </li>
              <li className="flex gap-2">
                <Check color="#67d574" strokeWidth={4} />
                <p className="text-lg text-gray-700">10 AI queries/month.</p>
              </li>
            </ul>
            <button className="h-10 w-65 bg-gray-800 rounded-xl hover:bg-gray-700">
              <h3 className="text-white">Explore</h3>
            </button>
          </div>
        </div>
        <div className="h-105 w-80 bg- bg-[#ebedf0] hover:bg-gray-300 border-2 border-yellow-400  shadow p-5 flex flex-col items-center rounded-2xl">
          <h1 className="text-4xl text-gray-700 mb-3">Pro</h1>
          <h1 className="text-6xl text-gray-700 font-bold mb-3">$9</h1>
          <p className="text-lg mb-3 text-gray-500">2 device / month</p>
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl text-gray-700"> Professionals</h1>
            <ul>
              <li className="flex gap-2">
                <Check color="#67d574" strokeWidth={4} />
                <p className="text-lg text-gray-700">Unlimited sharing.</p>
              </li>
              <li className="flex gap-2">
                <Check color="#67d574" strokeWidth={4} />
                <p className="text-lg text-gray-700">Priority support.</p>
              </li>
              <li className="flex gap-2">
                <Check color="#67d574" strokeWidth={4} />
                <p className="text-lg text-gray-700">Advanced collaboration.</p>
              </li>
              <li className="flex gap-2">
                <Check color="#67d574" strokeWidth={4} />
                <p className="text-lg text-gray-700">100 AI queries/month.</p>
              </li>
            </ul>
            <button className="h-10 w-65 bg-gray-800 rounded-xl hover:bg-gray-700">
              <h3 className="text-white">Explore</h3>
            </button>
          </div>
        </div>
        <div className="h-105 w-80 bg- bg-[#ebedf0] hover:bg-gray-300 border-3 border-yellow-400 shadow p-5 flex flex-col items-center rounded-2xl">
          <h1 className="text-4xl text-gray-700 mb-3">Team</h1>
          <h1 className="text-6xl text-gray-700 font-bold mb-3">$16</h1>
          <p className="text-lg mb-3 text-gray-500">3 device / month</p>
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl text-gray-700">Small Organisation</h1>
            <ul>
              <li className="flex gap-2">
                <Check color="#67d574" strokeWidth={4} />
                <p className="text-lg text-gray-700"> Admin controls.</p>
              </li>
              <li className="flex gap-2">
                <Check color="#67d574" strokeWidth={4} />
                <p className="text-lg text-gray-700">
                  All Pro features for each user.
                </p>
              </li>
              <li className="flex gap-2">
                <Check color="#67d574" strokeWidth={4} />
                <p className="text-lg text-gray-700">Ai analytics.</p>
              </li>

              <li className="flex gap-2">
                <Check color="#67d574" strokeWidth={4} />
                <p className="text-lg text-gray-700">Unlimited AI usage.</p>
              </li>
            </ul>
            <button className="h-10 w-65  bg-gray-800 rounded-xl hover:bg-gray-700">
              <h3 className="text-white">Explore</h3>
            </button>
          </div>
        </div>
        <div className="h-105 w-80 bg- bg-[#ebedf0] hover:bg-gray-300 border-4 border-yellow-400 shadow p-5 flex flex-col items-center rounded-2xl">
          <h1 className="text-4xl text-gray-700 mb-3">Enterprise</h1>
          <h1 className="text-6xl text-gray-700 font-bold mb-3">$36 +</h1>
          <p className="text-lg mb-3 text-gray-500"> User depends on package</p>
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl text-gray-700">Tech Companies</h1>
            <ul>
              <li className="flex gap-2 ">
                <Check color="#67d574" strokeWidth={4} />
                <p className="text-lg text-gray-700">Dedicated onboarding.</p>
              </li>
              <li className="flex gap-2">
                <Check color="#67d574" strokeWidth={4} />
                <p className="text-lg text-gray-700">
                  Custom security (SSO, audit logs).
                </p>
              </li>
              <li className="flex gap-2">
                <Check color="#67d574" strokeWidth={4} />
                <p className="text-lg text-gray-700">
                  API access, priority SLA.
                </p>
              </li>
            </ul>
            <button className="h-10 w-65 bg-gray-800 rounded-xl hover:bg-gray-700">
              <h3 className="text-white">Explore</h3>
            </button>
          </div>
        </div>
      </div>
      <div className="mt-10">
        <h2 className="text-2xl font-semibold">All Plans Include:</h2>
        <ol className="list-disc list-inside marker:text-xl text-xl">
          <li>Multi-device sync</li>
          <li>End-to-end encryption</li>
          <li>Upgrades or downgrades anytime</li>
          <li>Unlimited whiteboards and notes</li>
        </ol>
        <p className="text-xl">
          Free 14-day trial on all paid features, no credit card required.
        </p>
      </div>
    </div>
  );
};

export default EndSection;
