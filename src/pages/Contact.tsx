import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { MapPin, PhoneIcon, Mail, Clock, AlertCircle } from 'lucide-react';

export default function Contact() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    else if (!/^[a-zA-Z\s]+$/.test(formData.name)) newErrors.name = 'Name can only contain letters and spaces';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Please enter a valid email address';

    // Allow optional +, followed by 10-15 digits, ignoring spaces and dashes
    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    const digitCount = (formData.phone.match(/\d/g) || []).length;
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!phoneRegex.test(formData.phone) || digitCount < 10 || digitCount > 15) {
      newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
    }

    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    else if (formData.subject.length < 3) newErrors.subject = 'Subject must be at least 3 characters';

    if (!formData.message.trim()) newErrors.message = 'Message is required';
    else if (formData.message.length < 10) newErrors.message = 'Message must be at least 10 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/thank-you');
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="pt-24 pb-20 bg-brand-bg relative">
      {/* Header */}
      <section className="bg-brand-bg py-20 text-center border-b border-gray-200">
        <div className="container mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-brand-navy mb-6"
          >
            Contact Us
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-px bg-brand-gold mx-auto"
          ></motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            
            {/* Contact Info */}
            <div className="lg:w-1/3">
              <div className="bg-white p-10 border border-gray-200 h-full shadow-sm hover:shadow-xl transition-shadow duration-500">
                <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-4">Reach Out</h4>
                <h3 className="text-3xl font-serif text-brand-navy mb-10">Get In Touch</h3>
                
                <div className="space-y-10">
                  <div className="flex items-start gap-5">
                    <div className="w-10 h-10 border border-brand-gold text-brand-gold flex flex-shrink-0 items-center justify-center pt-1 shadow-sm">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Our Office</h4>
                      <p className="text-gray-600 font-medium text-sm">A-61 Sector 65,<br />Noida, Uttar Pradesh 201309</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-5">
                    <div className="w-10 h-10 border border-brand-gold text-brand-gold flex flex-shrink-0 items-center justify-center rounded-sm">
                      <PhoneIcon size={20} />
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Phone</h4>
                      <p className="text-gray-600 font-medium text-sm">+91 73000 07643</p>
                      <p className="text-xs text-brand-gold mt-2 uppercase tracking-widest font-bold">Main Office / Sales</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-5">
                    <div className="w-10 h-10 border border-brand-gold text-brand-gold flex flex-shrink-0 items-center justify-center rounded-sm">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Emails</h4>
                      <a href="mailto:info@sviinfrasolutions.com" className="text-brand-navy font-medium text-sm hover:text-brand-gold block transition-colors">info@sviinfrasolutions.com</a>
                      <a href="mailto:sales@sviinfrasolutions.com" className="text-brand-navy font-medium text-sm hover:text-brand-gold block mt-2 transition-colors">sales@sviinfrasolutions.com</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="w-10 h-10 border border-brand-gold text-brand-gold flex flex-shrink-0 items-center justify-center rounded-sm">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Business Hours</h4>
                      <p className="text-gray-600 font-medium text-sm mb-1">Mon-Fri: 9AM - 7PM</p>
                      <p className="text-gray-600 font-medium text-sm mb-1">Sat: 9AM - 5PM</p>
                      <p className="text-gray-600 font-medium text-sm">Sun: 10AM - 4PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form & Map */}
            <div className="lg:w-2/3 flex flex-col gap-8">
              <div className="bg-white p-10 border border-gray-200 shadow-sm">
                <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-4">Inquiries</h4>
                <h3 className="text-3xl font-serif text-brand-navy mb-8">Send a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-2">Your Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border focus:ring-0 outline-none transition-colors text-sm bg-gray-50/50 ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-brand-gold'}`}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border focus:ring-0 outline-none transition-colors text-sm bg-gray-50/50 ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-brand-gold'}`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border focus:ring-0 outline-none transition-colors text-sm bg-gray-50/50 ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-brand-gold'}`}
                        placeholder="+91"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.phone}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-2">Subject</label>
                      <input 
                        type="text" 
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        maxLength={100}
                        className={`w-full px-4 py-3 border focus:ring-0 outline-none transition-colors text-sm bg-gray-50/50 ${errors.subject ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-brand-gold'}`}
                      />
                      <div className="flex justify-between items-center mt-1">
                        {errors.subject ? (
                          <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.subject}</p>
                        ) : <span></span>}
                        <span className="text-gray-400 text-[10px]">{formData.subject.length}/100</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-2">Message</label>
                    <textarea 
                      rows={5}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      maxLength={1000}
                      className={`w-full px-4 py-3 border focus:ring-0 outline-none transition-colors text-sm bg-gray-50/50 resize-none ${errors.message ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-brand-gold'}`}
                    ></textarea>
                    <div className="flex justify-between items-center mt-1">
                      {errors.message ? (
                        <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.message}</p>
                      ) : <span></span>}
                      <span className="text-gray-400 text-[10px]">{formData.message.length}/1000</span>
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-brand-navy hover:bg-brand-gold text-brand-gold hover:text-brand-navy font-bold uppercase text-xs tracking-widest py-4 transition-colors flex items-center justify-center gap-2 border border-brand-navy disabled:opacity-70 disabled:cursor-not-allowed w-full"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin"></div>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </form>
              </div>

              {/* Map */}
              <div className="bg-white p-2 shadow-sm border border-gray-200 overflow-hidden h-[400px]">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.2847551460337!2d77.38202521508168!3d28.61123488242598!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5b2104bd709%3A0x6b6c2a4cb8c16053!2sSector%2065%2C%20Noida%2C%20Uttar%20Pradesh%20201301%2C%20India!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy">
                </iframe>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
