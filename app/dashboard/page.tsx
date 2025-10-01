import Link from "next/link";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";

// ✅ Force full static generation (no runtime auth/middleware checks)
export const dynamic = "force-static";

// Local, minimal type used by this static page
// (decoupled from your app-wide types so this file compiles standalone)
type Reservation = {
  id: string;
  roomType: string;
  status: "pending" | "confirmed" | "cancelled";
  totalAmount: number;
  checkIn: string; // e.g. "2025-10-04"
  checkOut: string; // e.g. "2025-10-07"
  guests: number;
  specialRequests?: string;
  createdAt: string; // ISO date string
};

// 🔒 No API calls, no tokens — just static mock data for UI work
const RESERVATIONS: Reservation[] = [
  {
    id: "rsv_001",
    roomType: "Deluxe Ocean View",
    status: "confirmed",
    totalAmount: 1299,
    checkIn: "2025-10-10",
    checkOut: "2025-10-14",
    guests: 2,
    specialRequests: "High floor, late check-in",
    createdAt: "2025-09-12T09:21:00.000Z",
  },
  {
    id: "rsv_002",
    roomType: "Premier Suite",
    status: "pending",
    totalAmount: 2150,
    checkIn: "2025-11-01",
    checkOut: "2025-11-05",
    guests: 3,
    createdAt: "2025-09-18T12:02:00.000Z",
  },
  {
    id: "rsv_003",
    roomType: "Garden Villa",
    status: "cancelled",
    totalAmount: 780,
    checkIn: "2025-08-20",
    checkOut: "2025-08-22",
    guests: 2,
    specialRequests: "Near spa if possible",
    createdAt: "2025-08-01T15:44:00.000Z",
  },
];

function getStatusIcon(status: Reservation["status"]) {
  switch (status) {
    case "confirmed":
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case "cancelled":
      return <XCircle className="w-5 h-5 text-red-500" />;
    default:
      return <Clock className="w-5 h-5 text-yellow-500" />;
  }
}

function getStatusColor(status: Reservation["status"]) {
  switch (status) {
    case "confirmed":
      return "text-green-600 bg-green-50 border-green-200";
    case "cancelled":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
  }
}

export default function Dashboard() {
  const userName = "Guest"; // Static placeholder — no auth, no localStorage
  const reservations = RESERVATIONS;

  const totalSpent = reservations
    .reduce((total, r) => total + r.totalAmount, 0)
    .toLocaleString();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {userName}!
            </h1>
            <p className="text-gray-600">
              Manage your reservations and account settings
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-yellow-100">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{reservations.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-100">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Confirmed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reservations.filter((r) => r.status === "confirmed").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-100">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">${totalSpent}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reservations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-yellow-600" />
                My Reservations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reservations.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations yet</h3>
                  <p className="text-gray-600 mb-6">Start planning your luxury getaway!</p>
                  <Link href="/rooms">
                    <Button className="bg-yellow-600 hover:bg-yellow-700">
                      Book Your First Stay
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {reservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {reservation.roomType}
                          </h3>
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                              reservation.status
                            )}`}
                          >
                            {getStatusIcon(reservation.status)}
                            <span className="ml-1 capitalize">{reservation.status}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-yellow-600">
                            ${reservation.totalAmount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">Total Amount</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <div>
                            <p className="text-sm">Check-in</p>
                            <p className="font-medium text-gray-900">{reservation.checkIn}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <div>
                            <p className="text-sm">Check-out</p>
                            <p className="font-medium text-gray-900">{reservation.checkOut}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <div>
                            <p className="text-sm">Guests</p>
                            <p className="font-medium text-gray-900">{reservation.guests}</p>
                          </div>
                        </div>
                      </div>

                      {reservation.specialRequests && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <p className="text-sm font-medium text-gray-900 mb-1">Special Requests</p>
                          <p className="text-gray-700">{reservation.specialRequests}</p>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <p>
                          Booking Date: {new Date(reservation.createdAt).toLocaleDateString()}
                        </p>
                        {reservation.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            disabled
                            aria-disabled
                            title="Disabled in static mode"
                          >
                            Cancel Booking
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
