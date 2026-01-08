import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react';

const GOLD = '#d4af37';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          {/* Brand Section */}
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-white tracking-tight">
              Mutiara <span style={{ color: GOLD }}>Hotel</span>
            </h3>
            <p className="text-gray-400 leading-relaxed font-light">
              Experience the epitome of luxury on the shores of Lake Toba.
              Where Balige's heritage meets world-class comfort.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Facebook, href: "https://www.facebook.com/mutiarabaligehotel" },
                { icon: Instagram, href: "https://www.instagram.com/mutiarabaligehotel" }
              ].map((Social, i) => (
                <a
                  key={i}
                  href={Social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-black hover:bg-white transition-all duration-300"
                >
                  <Social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Explore</h4>
            <ul className="space-y-4">
              {[
                { label: "Rooms & Suites", href: "/user/rooms" },
                { label: "Our Facilities", href: "/user/facilities" },
                { label: "Gallery", href: "/user/gallery" },
                { label: "News & Events", href: "/user/news" },
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Services</h4>
            <ul className="space-y-4">
              {[
                "24/7 Room Service",
                "Spa & Wellness",
                "Lake View Café",
                "Concierge",
                "Airport Transfer"
              ].map((item, i) => (
                <li key={i} className="text-gray-400 text-sm font-light">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Contact Us</h4>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <MapPin className="w-5 h-5 flex-shrink-0" style={{ color: GOLD }} />
                <span className="text-gray-400 text-sm leading-relaxed">
                  Jl. Tarutung No. 120<br />Balige, Sumatera Utara, 22312
                </span>
              </li>
              <li className="flex gap-4">
                <Phone className="w-5 h-5 flex-shrink-0" style={{ color: GOLD }} />
                <span className="text-gray-400 text-sm">+62 632 322111</span>
              </li>
              <li className="flex gap-4">
                <Mail className="w-5 h-5 flex-shrink-0" style={{ color: GOLD }} />
                <span className="text-gray-400 text-sm">info@mutiarabaligehotel.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-xs">
            © 2025 Mutiara Hotel Balige. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Sitemap"].map((item, i) => (
              <Link key={i} href="#" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}