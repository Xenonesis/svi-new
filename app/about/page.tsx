"use client";

import { motion } from 'motion/react';
import { Target, Heart, Lightbulb, Award, CheckCircle } from 'lucide-react';

export default function About() {
  return (
    <div className="pt-24 pb-20 bg-white dark:bg-gray-900 min-h-screen">
      <section className="bg-brand-bg dark:bg-gray-800 py-24 text-center border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-brand-navy dark:text-gray-100 mb-6"
          >
            About SVI Infra Solutions
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-px bg-brand-gold mx-auto"
          ></motion.div>
        </div>
      </section>

      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 dark:text-gray-500 mb-6">Our Story</h4>
            <h2 className="text-3xl font-serif text-brand-navy dark:text-gray-100 mb-8">Building Legacies Since 2009</h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-6 text-lg leading-relaxed">
              <p>
                For over 17 years, SVI Infra Solutions Pvt. Ltd. has been synonymous with trust, quality, and integrity in the Indian real estate market. We have successfully completed 15+ projects, delivering joy to over 5000+ happy clients.
              </p>
              <p>
                Our vision extends beyond just building structures; we create communities, shape lifestyles, and provide high-value investment avenues. Focused significantly on the Phulera Smart City, Jaipur region, and the DMIC/DFC corridors, our integrity-driven approach has made us a preferred partner for home buyers and investors alike.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-brand-navy dark:bg-gray-900 text-white relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)', backgroundSize: '40px 40px' }}></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
             <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-gold mb-4">Core Principles</h4>
             <h2 className="text-4xl font-serif text-white mb-8">Mission & Values</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Target />, title: "Integrity", desc: "Honesty and transparency in every transaction." },
              { icon: <Heart />, title: "Customer-Centricity", desc: "Putting our clients' needs and aspirations first." },
              { icon: <Lightbulb />, title: "Innovation", desc: "Pioneering new standards in real estate." },
              { icon: <Award />, title: "Excellence", desc: "Delivering world-class quality without compromise." },
            ].map((val, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 dark:bg-gray-800/50 p-10 border border-white/10 dark:border-gray-700 hover:border-brand-gold dark:hover:border-brand-gold transition-colors text-center"
              >
                 <div className="w-16 h-16 mx-auto bg-brand-gold/10 text-brand-gold flex items-center justify-center mb-8 rounded-full">
                   {val.icon}
                 </div>
                 <h3 className="text-xl font-serif text-white dark:text-gray-100 mb-4">{val.title}</h3>
                 <p className="text-gray-300 dark:text-gray-400 text-sm leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white dark:bg-gray-800">
         <div className="container mx-auto px-4">
           <div className="flex flex-col md:flex-row gap-16 items-center">
             <div className="md:w-1/2">
                <img 
                  src="/images/house1.png" 
                  alt="SVI Infra residential property showcasing quality construction and modern design"
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={600}
                  className="shadow-2xl dark:shadow-none border dark:border-gray-700"
                />
             </div>
             <div className="md:w-1/2">
               <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 dark:text-gray-500 mb-6">Expertise</h4>
               <h2 className="text-4xl font-serif text-brand-navy dark:text-gray-100 mb-10">Services We Offer</h2>
               <div className="space-y-4">
                 {[
                   "Residential Properties",
                   "Commercial Properties",
                   "Property Management",
                   "Real Estate Builders and Developers",
                   "Project Development"
                 ].map((service, idx) => (
                   <motion.div 
                     key={idx}
                     initial={{ opacity: 0, x: 20 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: idx * 0.1 }}
                     className="flex items-center gap-6 border-b border-gray-100 dark:border-gray-700 pb-4 group"
                   >
                     <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center group-hover:border-brand-gold dark:group-hover:border-brand-gold transition-colors">
                       <CheckCircle className="text-brand-gold shrink-0 w-4 h-4" />
                     </div>
                     <span className="text-lg text-brand-navy dark:text-gray-200 font-serif">{service}</span>
                   </motion.div>
                 ))}
               </div>
             </div>
           </div>
         </div>
      </section>
    </div>
  );
}
