'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Home, MapPin, Clock, Wifi, Car, Coffee, Waves, Phone, ChevronRight } from 'lucide-react';

export default function ChatBotMutiara() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    {
      id: 'welcome',
      type: 'bot',
      content: "Horas! Selamat datang di Hotel Mutiara Balige 🏨✨\n\nSilakan pilih informasi yang Anda butuhkan:",
      buttons: [
        { text: "Lokasi & Alamat", icon: MapPin, action: "alamat" },
        { text: "Jam Check-in / Check-out", icon: Clock, action: "jam" },
        { text: "Fasilitas Hotel", icon: Home, action: "fasilitas" },
        { text: "Harga Kamar & Tipe", icon: Coffee, action: "harga" },
        { text: "Kolam Renang & View Danau Toba", icon: Waves, action: "kolam" },
        { text: "Restoran & Menu Khas Batak", icon: Coffee, action: "resto" },
        { text: "Parkir & Wi-Fi", icon: Wifi, action: "parkir" },
        { text: "Hubungi Kami Langsung", icon: Phone, action: "kontak" },
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const addMessage = (content: string, type: 'bot' | 'user', buttons?: any[], userText?: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type,
      content,
      buttons: buttons || null,
      userText: type === 'user' ? userText : null, // simpan teks asli yang dipilih user
      timestamp: new Date()
    }]);
  };

  const sendMenu = (menuType: string) => {
    if (menuType === "main") {
      addMessage("Pilih lagi informasi yang Anda inginkan ya Horas!", "bot", [
        { text: "Lokasi & Alamat", icon: MapPin, action: "alamat" },
        { text: "Jam Check-in / Check-out", icon: Clock, action: "jam" },
        { text: "Fasilitas Hotel", icon: Home, action: "fasilitas" },
        { text: "Harga Kamar & Tipe", icon: Coffee, action: "harga" },
        { text: "Kolam Renang & View", icon: Waves, action: "kolam" },
        { text: "Restoran Khas Batak", icon: Coffee, action: "resto" },
        { text: "Parkir & Wi-Fi", icon: Wifi, action: "parkir" },
        { text: "Hubungi Kami", icon: Phone, action: "kontak" },
      ]);
      return;
    }

    const responses: Record<string, string> = {
      alamat: `Hotel Mutiara Balige\nJalan Balige No. 88, Kel. Balige I\nKec. Balige, Kab. Toba Samosir\nSumatera Utara 22312\n\nLokasi strategis:\n• 3 menit dari Pasar Balige\n• 5 menit dari Pelabuhan Balige\n• 500m dari Pantai Lumban Bul-Bul\n• View langsung Danau Toba dari hotel!\n\nhttps://maps.google.com/?q=Hotel+Mutiara+Balige`,
      
      jam: `Jam Operasional Hotel:\n\nCheck-in : 14.00 WIB\nCheck-out : 12.00 WIB\n\nEarly check-in & late check-out bisa di-request (tergantung ketersediaan)\nSarapan: 06.30 – 10.00 WIB`,
      
      fasilitas: `Fasilitas Hotel Mutiara Balige:\n\n• 42 kamar modern dengan AC\n• Balkon pribadi (Deluxe & Suite)\n• Kolam renang outdoor view Danau Toba\n• Restoran Mutiara (06.00–22.00)\n• Free Wi-Fi kencang seluruh area\n• Parkir luas gratis\n• Room service 24 jam\n• Laundry & tour desk`,
      
      harga: `Tipe Kamar & Harga (per malam):\n\nStandard Room       : Rp650.000\nDeluxe Lake View     : Rp950.000\nFamily Room (4 org)   : Rp1.350.000\nJunior Suite             : Rp1.650.000\n\nSudah termasuk:\n• Sarapan prasmanan\n• Wi-Fi, parkir, kolam renang\n• Welcome drink khas Batak`,
      
      kolam: `Kolam Renang Outdoor buka setiap hari pukul 07.00 – 19.00 WIB\n\nGratis untuk semua tamu\nView langsung Danau Toba + Gunung Pusuk Buhit\nHanduk disediakan • Ada area anak`,
      
      resto: `Restoran Mutiara – Buka 06.00 – 22.00 WIB\n\nMenu spesial khas Batak:\n• Ikan Arsik • Saksang • Naniura\n• Mie Gomak • Tipa-tipa\n\nJuga ada menu Indonesia, Chinese, Western\nMakan sambil nikmati pemandangan Danau Toba!`,
      
      parkir: `Parkir luas & GRATIS untuk mobil/motor\nWi-Fi gratis kencang (30–50 Mbps) di semua area hotel`,
      
      kontak: `Hubungi kami langsung:\n\nWhatsApp/Telepon:\n+62 812-3456-7890 (Reservasi)\n+62 821-7777-8888 (Front Office)\n\nEmail: info@mutiarabalige.com\nInstagram: @hotelmutiarabalige\n\nKami siap 24 jam • Horas!`
    };

    const buttonLabels: Record<string, string> = {
      alamat: "Lokasi & Alamat",
      jam: "Jam Check-in / Check-out",
      fasilitas: "Fasilitas Hotel",
      harga: "Harga Kamar & Tipe",
      kolam: "Kolam Renang & View Danau Toba",
      resto: "Restoran & Menu Khas Batak",
      parkir: "Parkir & Wi-Fi",
      kontak: "Hubungi Kami Langsung"
    };

    addMessage(responses[menuType], "bot", [
      { text: "Kembali ke Menu Utama", icon: Home, action: "main" }
    ], buttonLabels[menuType]);
  };

  const handleButtonClick = (action: string, buttonText: string) => {
    if (action === "main") {
      sendMenu("main");
    } else {
      // Tampilkan pesan user sesuai tombol yang diklik
      addMessage(buttonText, "user");
      setTimeout(() => sendMenu(action), 600);
    }
  };

  return (
    <>
      {/* Tombol Buka Chat */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-yellow-600 hover:bg-yellow-700 shadow-2xl"
        >
          <MessageCircle className="w-8 h-8" />
        </Button>
      )}

      {/* Jendela Chat - Tema PUTIH + EMAS */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-50 w-96 h-[620px] shadow-2xl border border-yellow-200">
          <CardHeader className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-t-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">Hotel Mutiara Balige</CardTitle>
                  <p className="text-xs opacity-90">Online • Balas dalam hitungan detik</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex flex-col h-full bg-white">
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={msg.type === 'user' ? 'text-right' : 'text-left'}>
                  {msg.type === 'user' ? (
                    <div className="inline-block bg-yellow-600 text-white rounded-2xl px-4 py-3 shadow-lg max-w-xs">
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  ) : (
                    <div className="inline-block bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 shadow max-w-full">
                      <p className="text-sm whitespace-pre-line text-gray-800">{msg.content}</p>
                    </div>
                  )}

                  {/* Tombol Pilihan */}
                  {msg.buttons && (
                    <div className={`mt-3 flex flex-wrap gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.buttons.map((btn: any, i: number) => (
                        <Button
                          key={i}
                          onClick={() => handleButtonClick(btn.action, btn.text)}
                          variant="outline"
                          size="sm"
                          className="text-xs h-10 border-yellow-400 text-yellow-800 hover:bg-yellow-50 hover:border-yellow-500 font-medium"
                        >
                          <btn.icon className="w-4 h-4 mr-1" />
                          {btn.text}
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer */}
            <div className="border-t border-yellow-200 p-4 bg-gradient-to-t from-yellow-50 to-white">
              <Button 
                onClick={() => sendMenu("main")} 
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium"
              >
                Kembali ke Menu Utama
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}