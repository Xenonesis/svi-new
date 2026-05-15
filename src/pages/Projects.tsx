import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const currentProjectsData = [
  {
    id: 'shyam-aangan',
    title: 'Shyam Aangan',
    location: 'Basri Khurd near Jaipur',
    lat: 26.6500,
    lng: 75.8500,
    type: 'Integrated Township',
    description: 'JDA-approved integrated township on NH-12 (Tonk Road), perfectly positioned near the upcoming Inner Ring Road, IT corridors, and SEZs. Offers affordable pricing and flexible plans.',
    fullDescription: 'Shyam Aangan is a sprawling, JDA-approved integrated township situated strategically on NH-12 (Tonk Road). It provides unparalleled connectivity to the upcoming Inner Ring Road, key IT corridors, and Special Economic Zones (SEZs). Designed to cater to diverse residential needs, the project blends affordable pricing with world-class facilities, paving the way for substantial future appreciation and a thriving community atmosphere.',
    status: 'Under Development',
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  }
];

export default function Projects() {
  return (
    <div className="pt-24 min-h-screen flex flex-col bg-brand-bg dark:bg-gray-900">
      {/* Header */}
      <section className="bg-brand-bg dark:bg-gray-800 py-24 text-center border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-brand-navy dark:text-gray-100 mb-6"
          >
            Current Projects
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-px bg-brand-gold mx-auto"
          ></motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="flex-grow flex items-center justify-center py-20 relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #1a2744 0, #1a2744 1px, transparent 0, transparent 50%)', backgroundSize: '40px 40px' }}></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          {currentProjectsData.map((project, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-gray-800 p-8 max-w-2xl mx-auto shadow-sm border border-gray-200 dark:border-gray-700 mb-6"
            >
              <div className="flex flex-col md:flex-row items-start">
                <div className="w-20 h-20 border border-brand-gold text-brand-navy dark:text-brand-gold flex items-center justify-center mx-auto mb-4 md:mb-0 md:mr-6">
                  <MapPin size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 dark:text-gray-500 mb-2">{project.status}</h4>
                  <h2 className="text-3xl font-serif text-brand-navy dark:text-gray-100 mb-4">{project.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{project.location}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-base mb-6 leading-relaxed">
                    {project.description}
                  </p>
                  <Link to="/registration" className="bg-brand-navy dark:bg-gray-700 hover:bg-brand-gold text-brand-gold hover:text-brand-navy font-bold uppercase text-xs tracking-widest px-6 py-3 transition-colors inline-flex items-center justify-center gap-2 border border-brand-navy dark:border-gray-600">
                    Get Notified First <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Fallback message if no projects */}
          {currentProjectsData.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 p-16 max-w-2xl mx-auto shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="w-20 h-20 border border-brand-gold text-brand-navy dark:text-brand-gold flex items-center justify-center mx-auto mb-8 relative">
                <Construction size={32} />
                <div className="absolute inset-0 bg-brand-navy scale-0 group-hover:scale-100 transition-transform -z-10 origin-bottom-right opacity-5"></div>
              </div>
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 dark:text-gray-500 mb-4">Under Development</h4>
              <h2 className="text-3xl font-serif text-brand-navy dark:text-gray-100 mb-6">Coming Soon</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-10 leading-relaxed">
                We are currently working on exciting new residential and commercial projects in prime locations. Check back soon for detailed layouts, pricing, and availability.
              </p>
              <Link to="/registration" className="bg-brand-navy dark:bg-gray-700 hover:bg-brand-gold text-brand-gold hover:text-brand-navy font-bold uppercase text-xs tracking-widest px-8 py-4 transition-colors flex items-center justify-center gap-2 border border-brand-navy dark:border-gray-600 inline-flex w-full sm:w-auto">
                Get Notified First
              </Link>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
