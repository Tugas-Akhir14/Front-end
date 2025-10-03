'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, X, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLIFrameElement>(null);

  const galleryImages = [
    {
      id: 1,
      type: 'image',
      url: 'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg',
      title: 'Junior Suite',
      description: 'Cozy and comfortable junior suite room'
    },
    {
      id: 2,
      type: 'image',
      url: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
      title: 'Medium Suite',
      description: 'Spacious medium suite with sitting area'
    },
    {
      id: 3,
      type: 'image',
      url: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
      title: 'Luxury Suite',
      description: 'Elegant luxury suite with premium amenities'
    },
    {
      id: 4,
      type: 'image',
      url: 'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg',
      title: 'Master Suite',
      description: 'Exclusive master suite with private terrace'
    },
    {
      id: 5,
      type: 'image',
      url: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg',
      title: 'Infinity Pool',
      description: 'Stunning infinity pool with ocean view'
    },
    {
      id: 6,
      type: 'image',
      url: 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg',
      title: 'Luxury Spa',
      description: 'Relaxing spa area for ultimate rejuvenation'
    },
    {
      id: 7,
      type: 'image',
      url: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
      title: 'Fine Dining Restaurant',
      description: 'Award-winning restaurant with gourmet cuisine'
    },
    {
      id: 8,
      type: 'image',
      url: 'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg',
      title: 'Hotel Lobby',
      description: 'Grand lobby with elegant interior design'
    },
    {
      id: 9,
      type: 'image',
      url: 'https://images.pexels.com/photos/2373201/pexels-photo-2373201.jpeg',
      title: 'Ocean View',
      description: 'Breathtaking ocean view from our suites'
    },
    {
      id: 10,
      type: 'image',
      url: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg',
      title: 'Pool Area',
      description: 'Beautiful pool area surrounded by nature'
    },
    {
      id: 11,
      type: 'image',
      url: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg',
      title: 'Executive Lounge',
      description: 'Exclusive executive lounge for guests'
    },
    {
      id: 12,
      type: 'image',
      url: 'https://images.pexels.com/photos/261169/pexels-photo-261169.jpeg',
      title: 'Bedroom Detail',
      description: 'Luxurious bedroom with premium bedding'
    }
  ];

  // Auto play video when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (videoRef.current) {
        // YouTube iframe API would be needed for full control
        // This is a workaround to ensure video plays
        const iframe = videoRef.current;
        iframe.src = `https://www.youtube.com/embed/4PLYhb7Wq7Y?autoplay=1&mute=${isMuted ? 1 : 0}&controls=1&modestbranding=1&rel=0&loop=1&playlist=4PLYhb7Wq7Y`;
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isMuted]);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % galleryImages.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + galleryImages.length) % galleryImages.length);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      const iframe = videoRef.current;
      iframe.src = `https://www.youtube.com/embed/4PLYhb7Wq7Y?autoplay=1&mute=${!isMuted ? 1 : 0}&controls=1&modestbranding=1&rel=0&loop=1&playlist=4PLYhb7Wq7Y`;
    }
  };

  return (
    <>
      <Header />
      <main className="pt-16"> {/* Tambahkan padding top untuk header fixed */}
        
        {/* Hero Section dengan Background Image */}
        <section className="relative h-96 bg-gray-900">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          
          {/* Background Image */}
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg)'
            }}
          />

          {/* Overlay Content */}
          <div className="relative z-20 flex h-full items-center justify-center">
            <div className="text-center text-white max-w-4xl px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Our <span className="text-yellow-400">Gallery</span>
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-200 font-light">
                Discover the beauty and luxury of Mutiara Hotel through our visual journey
              </p>
              <Button 
                size="lg" 
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 text-lg"
                onClick={() => document.getElementById('video-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Watch Virtual Tour
              </Button>
            </div>
          </div>
        </section>

        {/* Video Section - Dipindahkan ke bawah header */}
        <section id="video-section" className="relative bg-black py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Virtual Tour</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Take a virtual journey through our luxurious facilities and breathtaking spaces
              </p>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              {/* YouTube Video */}
              <div className="relative aspect-video w-full">
                <iframe
                  ref={videoRef}
                  src={`https://www.youtube.com/embed/4PLYhb7Wq7Y?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0&loop=1&playlist=4PLYhb7Wq7Y`}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="Mutiara Hotel Virtual Tour"
                />
              </div>

              {/* Video Controls */}
              <div className="absolute bottom-6 right-6 z-20 flex items-center space-x-4">
                <button
                  onClick={toggleMute}
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all duration-200 backdrop-blur-sm"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <div className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                  Virtual Tour
                </div>
              </div>
            </div>

            {/* Video Description */}
            <div className="text-center mt-8">
              <p className="text-gray-400 text-lg">
                Explore our world-class amenities, elegant rooms, and stunning surroundings
              </p>
            </div>
          </div>
        </section>

        {/* Gallery Grid Section */}
        <section id="gallery-section" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Photo Gallery</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover the exquisite details and breathtaking views that await you at Mutiara Hotel
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((item, index) => (
                <Card 
                  key={item.id} 
                  className="overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
                  onClick={() => openLightbox(index)}
                >
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    <div className="absolute top-4 left-4 bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Photo
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                      <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
                      <p className="text-gray-200 text-sm opacity-90">
                        {item.description}
                      </p>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-yellow-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-8 h-8 text-white fill-current" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* CTA Section */}
            <div className="text-center mt-16">
              <Card className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white p-12">
                <CardContent className="p-0">
                  <h3 className="text-3xl font-bold mb-4">Ready to Experience It Yourself?</h3>
                  <p className="text-yellow-100 text-xl mb-8 max-w-2xl mx-auto">
                    Book your stay now and create your own beautiful memories at Mutiara Hotel.
                  </p>
                  <div className="space-x-4">
                    <Button size="lg" className="bg-white text-yellow-600 hover:bg-gray-100 text-lg px-8 py-3">
                      Book Your Stay
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-white text-white hover:bg-white hover:text-yellow-600 text-lg px-8 py-3"
                    >
                      Contact Us
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-6xl max-h-full w-full">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-colors duration-200 backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-colors duration-200 backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-colors duration-200 backdrop-blur-sm"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Content */}
            <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
              <img
                src={galleryImages[selectedImage].url}
                alt={galleryImages[selectedImage].title}
                className="w-full h-auto max-h-[70vh] object-contain"
              />

              {/* Caption */}
              <div className="p-6 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {galleryImages[selectedImage].title}
                </h3>
                <p className="text-gray-600 text-lg">
                  {galleryImages[selectedImage].description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}