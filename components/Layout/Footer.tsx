import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Sparkles, Star } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-yellow-200 relative overflow-hidden">
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>

      {/* Background subtle pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.15),transparent_70%)]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <Sparkles className="w-6 h-6 text-yellow-500 mr-2" />
              <h3 className="text-3xl font-bold text-transparent bg-gradient-to-r from-yellow-600 via-yellow-500 to-amber-600 bg-clip-text">
                MutiaraStay
              </h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Experience luxury and comfort at its finest. Your perfect getaway awaits at Mutiara.
            </p>
            <div className="flex items-center space-x-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              ))}
              <span className="ml-2 text-gray-600 text-sm">5-Star Excellence</span>
            </div>
            <div className="flex space-x-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-300 flex items-center justify-center hover:border-yellow-500 hover:shadow-lg hover:scale-110 transition-all cursor-pointer group">
                <Facebook className="w-5 h-5 text-gray-500 group-hover:text-yellow-600 transition-colors" />
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-300 flex items-center justify-center hover:border-yellow-500 hover:shadow-lg hover:scale-110 transition-all cursor-pointer group">
                <Twitter className="w-5 h-5 text-gray-500 group-hover:text-yellow-600 transition-colors" />
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-300 flex items-center justify-center hover:border-yellow-500 hover:shadow-lg hover:scale-110 transition-all cursor-pointer group">
                <Instagram className="w-5 h-5 text-gray-500 group-hover:text-yellow-600 transition-colors" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-yellow-600 mb-6 uppercase tracking-wider flex items-center">
              <div className="w-1 h-6 bg-yellow-500 mr-3 rounded-full"></div>
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/rooms" className="text-gray-600 hover:text-yellow-600 transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-yellow-300 rounded-full mr-3 group-hover:bg-yellow-500 transition-colors"></span>
                  Rooms & Suites
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-600 hover:text-yellow-600 transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-yellow-300 rounded-full mr-3 group-hover:bg-yellow-500 transition-colors"></span>
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-gray-600 hover:text-yellow-600 transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-yellow-300 rounded-full mr-3 group-hover:bg-yellow-500 transition-colors"></span>
                  News & Events
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-yellow-600 transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-yellow-300 rounded-full mr-3 group-hover:bg-yellow-500 transition-colors"></span>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold text-yellow-600 mb-6 uppercase tracking-wider flex items-center">
              <div className="w-1 h-6 bg-yellow-500 mr-3 rounded-full"></div>
              Services
            </h4>
            <ul className="space-y-3">
              <li className="text-gray-600 flex items-center">
                <span className="w-2 h-2 bg-yellow-300 rounded-full mr-3"></span>
                24/7 Room Service
              </li>
              <li className="text-gray-600 flex items-center">
                <span className="w-2 h-2 bg-yellow-300 rounded-full mr-3"></span>
                Spa & Wellness Center
              </li>
              <li className="text-gray-600 flex items-center">
                <span className="w-2 h-2 bg-yellow-300 rounded-full mr-3"></span>
                Fine Dining Restaurant
              </li>
              <li className="text-gray-600 flex items-center">
                <span className="w-2 h-2 bg-yellow-300 rounded-full mr-3"></span>
                Business Center
              </li>
              <li className="text-gray-600 flex items-center">
                <span className="w-2 h-2 bg-yellow-300 rounded-full mr-3"></span>
                Concierge Service
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold text-yellow-600 mb-6 uppercase tracking-wider flex items-center">
              <div className="w-1 h-6 bg-yellow-500 mr-3 rounded-full"></div>
              Contact
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 group">
                <div className="mt-1 p-2 rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-300 group-hover:border-yellow-500 transition-all shadow-sm">
                  <MapPin className="w-4 h-4 text-yellow-600" />
                </div>
                <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-800 transition-colors">
                  123 Mutiara Avenue<br />
                  Paradise City, PC 12345
                </p>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-300 group-hover:border-yellow-500 transition-all shadow-sm">
                  <Phone className="w-4 h-4 text-yellow-600" />
                </div>
                <p className="text-gray-600 text-sm group-hover:text-gray-800 transition-colors">
                  +1 (555) 123-4567
                </p>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-300 group-hover:border-yellow-500 transition-all shadow-sm">
                  <Mail className="w-4 h-4 text-yellow-600" />
                </div>
                <p className="text-gray-600 text-sm group-hover:text-gray-800 transition-colors">
                  info@mutiarastay.com
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="relative mt-12 pt-8">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-200 to-transparent"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              &copy; 2025 MutiaraStay Hotel. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-500 hover:text-yellow-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-yellow-600 transition-colors">
                Terms of Service
              </Link>
              <Link href="/sitemap" className="text-gray-500 hover:text-yellow-600 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
    </footer>
  );
}