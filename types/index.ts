export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface Reservation {
  id: number;
  userId: number;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  specialRequests?: string;
  createdAt: string;
}

export interface SiteContent {
  id: number;
  type: 'vision' | 'mission' | 'about';
  title: string;
  content: string;
  updatedAt: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  imageUrl: string;
  description?: string;
  category?: string;
  createdAt: string;
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}