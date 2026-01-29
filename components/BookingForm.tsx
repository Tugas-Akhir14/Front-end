'use client';

import React from 'react';

interface BookingFormProps {
  roomId: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
}

const BookingForm: React.FC<BookingFormProps> = ({
  roomId,
  roomNumber,
  roomType,
  pricePerNight,
}) => {
  return (
    <div>
      <h2>Booking Kamar {roomNumber}</h2>
      <p>Tipe: {roomType}</p>
      <p>Harga per malam: {pricePerNight}</p>
    </div>
  );
};

export default BookingForm;
