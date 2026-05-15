import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Download, ArrowRight, MapPin } from 'lucide-react';

const HoverZoomImage = ({ src, alt }: { src: string; alt: string }) => {
  const [backgroundPosition, setBackgroundPosition] = useState('50% 50%');
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  };

  return (
    <div 
      className="w-full h-full relative cursor-zoom-in overflow-hidden group/zoom"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setBackgroundPosition('50% 50%')}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-opacity duration-300 group-hover/zoom:opacity-0 relative z-0"
      />
      <div 
        className="absolute inset-0 bg-no-repeat pointer-events-none opacity-0 group-hover/zoom:opacity-100 z-10 transition-opacity duration-300 bg-gray-100"
        style={{
          backgroundImage: `url(${src})`,
          backgroundPosition,
          backgroundSize: '200%',
        }}
      />
    </div>
  );
};

const completedProjectsData = [
  {
    title: 'Shree Shyam Residency',
    location: 'Jaipur (near Hope Farm Junction)',
    type: '3BHK/4BHK (Ready-to-move)',
    description: 'A premium residential complex offering spacious 3BHK and 4BHK apartments with modern amenities, designed for those who appreciate luxury and comfort.',
    status: 'Completed',
    img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    pdf: true
  },
  {
    title: 'Shivani City',
    location: 'Manpura Machedi',
    type: 'Premier Residential Development',
    description: 'An elegantly planned residential development that completely sold out due to its unmatched quality, strategic location, and lifestyle offerings.',
    status: 'Sold Out',
    img: 'https://images.unsplash.com/photo-1600607687931-cecebd802404?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Shyam Aangan',
    location: 'Basri Khurd near Jaipur',
    type: 'Integrated Township',
    description: 'JDA-approved integrated township on NH-12 (Tonk Road), perfectly positioned near the upcoming Inner Ring Road, IT corridors, and SEZs. Offers affordable pricing and flexible plans.',
    status: 'Completed',
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Shivani Vatika',
    location: 'Nayla',
    type: 'Modern Living',
    description: 'A modern living space that redefines community living. A fully sold-out project that stands as a testament to our quality commitment.',
    status: 'Sold Out',
    img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Shivani Residency',
    location: 'Dobadi near Sambhar & Fulera, Jaipur district',
    type: 'Residential',
    description: 'Nestled in a peaceful environment near Sambhar Lake, offering competitive pricing and a serene lifestyle away from the city hustle.',
    status: 'Completed',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  }
];

export default function CompletedProjects() {
  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-brand-bg py-20 text-center border-b border-gray-200">
        <div className="container mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-brand-navy leading-tight mb-6"
          >
            Completed Projects
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-px bg-brand-gold mx-auto mb-6"
          ></motion.div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Explore our portfolio of successfully delivered projects. Each property is a testament to our commitment to excellence, timely delivery, and unmatched quality.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {completedProjectsData.map((project, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white group overflow-hidden border border-gray-200 flex flex-col h-full hover:shadow-2xl transition-shadow duration-500"
              >
                <div className="relative h-64 overflow-hidden bg-gray-100 flex items-center justify-center">
                  <div className="absolute inset-0 bg-brand-navy/10 z-10 pointer-events-none group-hover:opacity-0 transition-opacity duration-500"></div>
                  <HoverZoomImage src={project.img} alt={project.title} />
                  <div className="absolute top-4 right-4 z-20 text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-white text-brand-navy shadow-sm pointer-events-none">
                    {project.status}
                  </div>
                </div>
                
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex flex-col mb-4">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{project.location}</span>
                    <span className="text-xs font-bold text-brand-gold uppercase tracking-widest mt-1">{project.type}</span>
                  </div>
                  
                  <h3 className="text-2xl font-serif text-brand-navy mb-4">{project.title}</h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-8 flex-grow">
                    {project.description}
                  </p>
                  
                  {project.pdf && (
                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Status</span>
                        <span className="text-xs font-bold text-brand-gold uppercase tracking-widest mt-1">{project.status}</span>
                      </div>
                      <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b border-brand-gold pb-1 text-brand-navy hover:text-brand-gold transition-colors">
                        Download PDF
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20 text-center">
         <div className="bg-brand-navy p-16 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)', backgroundSize: '40px 40px' }}></div>
           <div className="relative z-10">
             <h2 className="text-4xl font-serif text-white mb-6">Interested in our Upcoming Projects?</h2>
             <p className="text-gray-300 mb-10 text-lg">Register your interest today to get early access and exclusive offers.</p>
             <Link to="/registration" className="inline-block bg-brand-gold text-brand-navy font-bold uppercase text-xs tracking-widest px-8 py-4 shadow-xl transition-colors hover:bg-brand-gold-light">
                Register interest
             </Link>
           </div>
         </div>
      </section>
    </div>
  );
}
