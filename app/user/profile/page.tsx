'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit3,
  Save,
  X,
  Shield,
  Bell,
  CreditCard,
  History,
  Star,
  Camera,
  LogOut
} from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import axios from 'axios';
import { useRouter } from 'next/navigation';

type UserProfile = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  date_of_birth: string | null;
  avatar: string | null;
  created_at: string;
  updated_at: string;
};

type Reservation = {
  id: number;
  check_in: string;
  check_out: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  room: {
    type: string;
    number: string;
  };
  guests_count: number;
};

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
  });

  // ================== Fetch User Data ==================
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get<{ data: UserProfile }>('/user/profile');
        const userData = data.data;
        setUser(userData);
        setFormData({
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          address: userData.address || '',
          date_of_birth: userData.date_of_birth || '',
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // ================== Fetch Reservations ==================
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const { data } = await axios.get<{ data: Reservation[] }>('/user/reservations');
        setReservations(data.data || []);
      } catch (error) {
        console.error('Failed to fetch reservations:', error);
      }
    };

    if (activeTab === 'reservations') {
      fetchReservations();
    }
  }, [activeTab]);

  // ================== Handlers ==================
  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await axios.put<{ data: UserProfile }>('/user/profile', formData);
      setUser(data.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        date_of_birth: user.date_of_birth || '',
      });
    }
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
      confirmed: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      checked_in: 'bg-green-500/20 text-green-300 border-green-500/50',
      checked_out: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
      cancelled: 'bg-red-500/20 text-red-300 border-red-500/50',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Menunggu Konfirmasi',
      confirmed: 'Terkonfirmasi',
      checked_in: 'Check-in',
      checked_out: 'Check-out',
      cancelled: 'Dibatalkan',
    };
    return texts[status as keyof typeof texts] || status;
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-black flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-b from-amber-950/50 to-black overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-amber-600 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-600 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <div className="inline-flex items-center space-x-2 bg-amber-900/80 px-6 py-3 rounded-full border-2 border-amber-600 mb-6 backdrop-blur-sm">
              <User className="w-5 h-5 text-amber-400" />
              <span className="text-amber-300 font-semibold">Profile Management</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500">
              My Profile
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Kelola informasi pribadi dan riwayat reservasi Anda
            </p>
          </div>
        </section>

        {/* Profile Content */}
        <section className="py-16 relative">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <Card className="lg:col-span-1 bg-gray-900 border-2 border-amber-700 overflow-hidden">
                <CardContent className="p-6">
                  {/* User Avatar & Basic Info */}
                  <div className="text-center mb-8">
                    <div className="relative inline-block mb-4">
                      <div className="w-24 h-24 rounded-full bg-amber-500 flex items-center justify-center border-4 border-amber-400 shadow-lg shadow-amber-500/25">
                        {user?.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-10 h-10 text-white" />
                        )}
                      </div>
                      <button className="absolute bottom-0 right-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center border-2 border-amber-300 hover:bg-amber-600 transition-colors">
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-1">{user?.name}</h3>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                    
                    <div className="flex items-center justify-center space-x-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                      ))}
                      <span className="text-gray-400 text-sm ml-1">Member</span>
                    </div>
                  </div>

                  {/* Navigation */}
                  <nav className="space-y-2">
                    {[
                      { id: 'profile', icon: User, label: 'Profile' },
                      { id: 'reservations', icon: History, label: 'Reservations' },
                      { id: 'security', icon: Shield, label: 'Security' },
                      { id: 'notifications', icon: Bell, label: 'Notifications' },
                      { id: 'billing', icon: CreditCard, label: 'Billing' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                          activeTab === item.id
                            ? 'bg-amber-500/20 text-amber-300 border-r-2 border-amber-500'
                            : 'text-gray-400 hover:text-amber-300 hover:bg-amber-500/10'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </nav>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 mt-8 border border-red-500/30"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </CardContent>
              </Card>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                  
                  {/* Profile Tab */}
                  <TabsContent value="profile" className="space-y-6">
                    <Card className="bg-gray-900 border-2 border-amber-700">
                      <CardHeader className="border-b border-amber-700/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                              Personal Information
                            </CardTitle>
                            <CardDescription className="text-gray-400 mt-2">
                              Kelola informasi profil dan bagaimana data Anda digunakan
                            </CardDescription>
                          </div>
                          
                          {!isEditing ? (
                            <Button
                              onClick={() => setIsEditing(true)}
                              className="bg-amber-500 hover:bg-amber-600 border-2 border-amber-400"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit Profile
                            </Button>
                          ) : (
                            <div className="space-x-2">
                              <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-green-500 hover:bg-green-600 border-2 border-green-400"
                              >
                                <Save className="w-4 h-4 mr-2" />
                                {saving ? 'Saving...' : 'Save Changes'}
                              </Button>
                              <Button
                                onClick={handleCancel}
                                variant="outline"
                                className="border-2 border-red-500 text-red-400 hover:bg-red-500/10"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Name */}
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-300 flex items-center space-x-2">
                              <User className="w-4 h-4" />
                              <span>Full Name</span>
                            </Label>
                            {isEditing ? (
                              <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-gray-800 border-amber-600 text-white"
                              />
                            ) : (
                              <p className="text-white text-lg font-medium">{user?.name}</p>
                            )}
                          </div>

                          {/* Email */}
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300 flex items-center space-x-2">
                              <Mail className="w-4 h-4" />
                              <span>Email Address</span>
                            </Label>
                            {isEditing ? (
                              <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="bg-gray-800 border-amber-600 text-white"
                              />
                            ) : (
                              <p className="text-white text-lg font-medium">{user?.email}</p>
                            )}
                          </div>

                          {/* Phone */}
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-gray-300 flex items-center space-x-2">
                              <Phone className="w-4 h-4" />
                              <span>Phone Number</span>
                            </Label>
                            {isEditing ? (
                              <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="bg-gray-800 border-amber-600 text-white"
                                placeholder="+62 XXX-XXXX-XXXX"
                              />
                            ) : (
                              <p className="text-white text-lg font-medium">
                                {user?.phone || 'Not provided'}
                              </p>
                            )}
                          </div>

                          {/* Date of Birth */}
                          <div className="space-y-2">
                            <Label htmlFor="date_of_birth" className="text-gray-300 flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>Date of Birth</span>
                            </Label>
                            {isEditing ? (
                              <Input
                                id="date_of_birth"
                                type="date"
                                value={formData.date_of_birth}
                                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                className="bg-gray-800 border-amber-600 text-white"
                              />
                            ) : (
                              <p className="text-white text-lg font-medium">
                                {user?.date_of_birth ? formatDate(user.date_of_birth) : 'Not provided'}
                              </p>
                            )}
                          </div>

                          {/* Address */}
                          <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="address" className="text-gray-300 flex items-center space-x-2">
                              <MapPin className="w-4 h-4" />
                              <span>Address</span>
                            </Label>
                            {isEditing ? (
                              <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="bg-gray-800 border-amber-600 text-white"
                                placeholder="Enter your complete address"
                              />
                            ) : (
                              <p className="text-white text-lg font-medium">
                                {user?.address || 'Not provided'}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Member Since */}
                        {!isEditing && user?.created_at && (
                          <div className="mt-8 pt-6 border-t border-amber-700/50">
                            <p className="text-gray-400 text-sm">
                              Member since {formatDate(user.created_at)}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Reservations Tab */}
                  <TabsContent value="reservations" className="space-y-6">
                    <Card className="bg-gray-900 border-2 border-amber-700">
                      <CardHeader>
                        <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                          My Reservations
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Riwayat dan status reservasi Anda
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="p-6">
                        {reservations.length === 0 ? (
                          <div className="text-center py-12">
                            <History className="w-16 h-16 text-amber-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-300 mb-2">
                              No Reservations Yet
                            </h3>
                            <p className="text-gray-500 mb-6">
                              You haven't made any reservations yet.
                            </p>
                            <Button
                              className="bg-amber-500 hover:bg-amber-600 border-2 border-amber-400"
                              onClick={() => router.push('/user/rooms')}
                            >
                              Book Your First Stay
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {reservations.map((reservation) => (
                              <Card 
                                key={reservation.id}
                                className="bg-gray-800 border-2 border-amber-700/50 hover:border-amber-600 transition-all duration-300"
                              >
                                <CardContent className="p-6">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-4">
                                        <h4 className="text-lg font-semibold text-white">
                                          {reservation.room.type} - Room {reservation.room.number}
                                        </h4>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(reservation.status)}`}>
                                          {getStatusText(reservation.status)}
                                        </span>
                                      </div>
                                      
                                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                        <div className="flex items-center space-x-2">
                                          <Calendar className="w-4 h-4" />
                                          <span>Check-in: {formatDate(reservation.check_in)}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Calendar className="w-4 h-4" />
                                          <span>Check-out: {formatDate(reservation.check_out)}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <User className="w-4 h-4" />
                                          <span>{reservation.guests_count} Guests</span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="text-right">
                                      <p className="text-2xl font-bold text-amber-400">
                                        {formatPrice(reservation.total_price)}
                                      </p>
                                      <p className="text-sm text-gray-400">Total</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Other Tabs - Placeholder */}
                  {['security', 'notifications', 'billing'].map((tab) => (
                    <TabsContent key={tab} value={tab} className="space-y-6">
                      <Card className="bg-gray-900 border-2 border-amber-700">
                        <CardHeader>
                          <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 capitalize">
                            {tab}
                          </CardTitle>
                          <CardDescription className="text-gray-400">
                            Manage your {tab} settings
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="p-6">
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                              {tab === 'security' && <Shield className="w-8 h-8 text-amber-400" />}
                              {tab === 'notifications' && <Bell className="w-8 h-8 text-amber-400" />}
                              {tab === 'billing' && <CreditCard className="w-8 h-8 text-amber-400" />}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-300 mb-2 capitalize">
                              {tab} Settings
                            </h3>
                            <p className="text-gray-500">
                              This section is under development and will be available soon.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}