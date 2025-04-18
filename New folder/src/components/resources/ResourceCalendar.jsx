import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Plus, Info } from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    parseISO,
    isPast,
    startOfDay
} from 'date-fns';
import { toast } from 'react-hot-toast';

import { VenueBookingModal } from './modals/VenueBookingModal';
import { resourceService } from '../../services/resourceService';

// Fixed time slots from 6:00 to 20:00
export const TIME_SLOTS = [
    '06:00-07:00',
    '07:00-08:00',
    '08:00-09:00',
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-13:00',
    '13:00-14:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
    '17:00-18:00',
    '18:00-19:00',
    '19:00-20:00'
];

const isToday = (date) => {
    const today = new Date();
    return isSameDay(date, today);
};

const ResourceCalendar = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [selectedVenue] = useState('D24');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [normalizedBookings, setNormalizedBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [hoveredDate, setHoveredDate] = useState(null);
    const [isViewingBookings, setIsViewingBookings] = useState(false);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const data = await resourceService.getBookings();
            setBookings(data);
        } catch (error) {
            toast.error('Failed to load bookings');
        }
    };

    const handleDateSelect = (date) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const dayBookings = bookings.filter(
            b => format(new Date(b.date), 'yyyy-MM-dd') === formattedDate && b.venue === selectedVenue
        );

        setSelectedDate(date);
        
        if (dayBookings.length > 0) {
            setIsViewingBookings(true);
        } else {
            setIsViewingBookings(false);
            setSelectedTimeSlot({
                date,
                venue: selectedVenue
            });
        }
        setIsModalOpen(true);
    };

    const handleBookingSubmit = async (bookingData) => {
        try {
            if (bookingData.action === 'edit' && bookingData.id) {
                // Update existing booking
                await resourceService.updateBooking(bookingData.id, bookingData);
                toast.success('Booking updated successfully');
            } else {
                // Create new booking
                await resourceService.createBooking(bookingData);
                toast.success('Booking completed successfully');
            }
            setIsModalOpen(false);
            setIsViewingBookings(false);
            loadBookings();
        } catch (error) {
            toast.error('Failed to save booking');
            console.error(error);
        }
    };

    const getWeekDays = (date) => {
        const start = startOfWeek(date, { weekStartsOn: 1 });
        const end = endOfWeek(start, { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    };

    useEffect(() => {
        const normalized = bookings.map(booking => ({
            ...booking,
            date: booking.date instanceof Date
                ? booking.date
                : booking.date?.toDate?.()
                    ? booking.date.toDate()
                    : typeof booking.date === 'string'
                        ? parseISO(booking.date)
                        : new Date(booking.date),
        }));
        setNormalizedBookings(normalized);
    }, [bookings]);

    
    









    

    // Filter bookings for the selected venue
    const venueBookings = bookings.filter(booking => booking.venue === selectedVenue);

    const BookingDetailsDialog = ({ booking, onClose }) => {
        if (!booking) return null;
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
                <div className="bg-white rounded-lg p-6 max-w-md w-full m-4" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold">Booking Details</h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p>{format(booking.date, 'MMMM d, yyyy')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Time Slots</p>
                            <p>{booking.affectedTimeSlots?.join(', ')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Purpose</p>
                            <p>{booking.purpose}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Attendees</p>
                            <p>{booking.attendees} people</p>
                        </div>
                        
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                onClick={() => {
                                    setSelectedTimeSlot({ ...booking, action: 'edit' });
                                    onClose();
                                }}
                                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedTimeSlot({ ...booking, action: 'delete' });
                                    onClose();
                                }}
                                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                Cancel Booking
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const WeeklyView = () => {
        if (!selectedWeek) return null;

        const weekDays = eachDayOfInterval({
            start: selectedWeek,
            end: endOfWeek(selectedWeek, { weekStartsOn: 1 })
        });

        const handleTimeSlotClick = (day, timeSlot, booking = null) => {
            if (isPast(startOfDay(day))) {
                toast.error("Cannot book past dates");
                return;
            }
            
            if (booking) {
                setSelectedTimeSlot({
                    date: day,
                    timeSlot,
                    venue: selectedVenue,
                    booking: booking
                });
                setIsModalOpen(true);
            } else {
                setSelectedDate(day);
                setSelectedTimeSlot({
                    date: day,
                    timeSlot,
                    venue: selectedVenue
                });
                setIsModalOpen(true);
            }
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 m-4 max-h-[90vh] w-full max-w-7xl overflow-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold">
                            {format(selectedWeek, 'MMMM d')} - {format(endOfWeek(selectedWeek), 'MMMM d, yyyy')}
                        </h3>
                        <button
                            onClick={() => setSelectedWeek(null)}
                            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Close
                        </button>
                    </div>

                    <div className="border rounded-lg">
                        <div className="grid grid-cols-[100px_repeat(7,1fr)] divide-y">
                            {/* Header */}
                            <div className="col-span-full grid grid-cols-[100px_repeat(7,1fr)] bg-gray-50">
                                <div className="p-2 font-medium border-r">Time</div>
                                {weekDays.map(day => (
                                    <div key={day.toString()} className="p-2 font-medium text-center border-r last:border-r-0">
                                        <div>{format(day, 'EEE')}</div>
                                        <div className="text-sm text-gray-500">{format(day, 'MMM d')}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Time slots */}
                            {TIME_SLOTS.map((currentTimeSlot, rowIndex) => (
                                <div key={currentTimeSlot} 
                                     className="col-span-full grid grid-cols-[100px_repeat(7,1fr)] hover:bg-gray-50/50">
                                    <div className="p-2 font-medium text-sm border-r">
                                        {currentTimeSlot}
                                    </div>
                                    {weekDays.map(day => {
                                        const booking = normalizedBookings.find(b => {
                                            const sameDay = isSameDay(b.date, day);
                                            const hasTimeSlot = b.affectedTimeSlots?.includes(currentTimeSlot);
                                            const correctVenue = b.venue === selectedVenue;
                                            return sameDay && hasTimeSlot && correctVenue;
                                        });

                                        const isFirstSlot = booking?.affectedTimeSlots?.[0] === currentTimeSlot;

                                        return (
                                            <div
                                                key={day.toString()}
                                                className={`
                                                    p-2 border-r last:border-r-0 relative min-h-[4rem]
                                                    ${booking ? 'bg-blue-100' : ''}
                                                    ${isPast(startOfDay(day)) ? 'bg-gray-50' : 'cursor-pointer'}
                                                `}
                                                onClick={() => handleTimeSlotClick(day, currentTimeSlot, booking)}
                                            >
                                                {booking ? (
                                                    <>
                                                        {isFirstSlot && (
                                                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 
                                                                          bg-white px-2 py-1 rounded-full text-xs shadow-sm 
                                                                          whitespace-nowrap">
                                                                {booking.purpose}
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <button
                                                                className="p-1 bg-blue-600 text-white rounded-full opacity-0 
                                                                           hover:bg-blue-700 group-hover:opacity-100 
                                                                           transition-opacity"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedBooking(booking);
                                                                }}
                                                            >
                                                                <Info size={16} />
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : !isPast(startOfDay(day)) && (
                                                    <div className="absolute inset-0 flex items-center justify-center 
                                                                  opacity-0 hover:opacity-100 transition-opacity">
                                                        <Plus size={20} className="text-blue-600" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Monthly calendar view renderer
    const calendarDays = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
    });

    const DayBookingsModal = ({ date, venue, onClose, onAddBooking }) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const dayBookings = bookings.filter(
            b => format(new Date(b.date), 'yyyy-MM-dd') === formattedDate && b.venue === venue
        );

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg w-full max-w-2xl p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">
                            Bookings for {format(date, 'MMMM d, yyyy')}
                        </h2>
                        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
                            ×
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            setIsViewingBookings(false);
                            setSelectedTimeSlot({
                                date,
                                venue,
                                timeSlots: []
                            });
                            setIsModalOpen(true);
                        }}
                        className="w-full mb-4 flex items-center justify-center gap-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={18} />
                        Add New Booking
                    </button>

                    <div className="grid grid-cols-4 gap-2">
                        {TIME_SLOTS.map((timeSlot) => {
                            const booking = dayBookings.find(b => 
                                (b.affectedTimeSlots?.includes(timeSlot) || b.timeSlots?.includes(timeSlot))
                            );
                            
                            return (
                                <div
                                    key={timeSlot}
                                    className={`
                                        p-3 border rounded-lg
                                        ${booking ? 'bg-blue-50 border-blue-200' : ''}
                                    `}
                                >
                                    <div className="font-medium text-sm mb-1">{timeSlot}</div>
                                    {booking ? (
                                        <div className="space-y-1">
                                            <div className="text-sm text-gray-600">
                                                {booking.attendees} attendee{booking.attendees !== 1 ? 's' : ''}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {booking.purpose}
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedTimeSlot({
                                                            date,
                                                            venue,
                                                            timeSlots: booking.affectedTimeSlots || booking.timeSlots || [timeSlot],
                                                            attendees: booking.attendees,
                                                            purpose: booking.purpose,
                                                            id: booking.id,
                                                            action: 'edit'
                                                        });
                                                        setIsViewingBookings(false);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="text-xs text-blue-600 hover:text-blue-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await resourceService.deleteBooking(booking.id);
                                                            toast.success('Booking deleted successfully');
                                                            loadBookings();
                                                        } catch (error) {
                                                            toast.error('Failed to delete booking');
                                                        }
                                                    }}
                                                    className="text-xs text-red-600 hover:text-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-400">Available</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">{format(currentDate, 'MMMM yyyy')}</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="text-center font-medium text-sm py-2">
                            {day}
                        </div>
                    ))}

                    {calendarDays.map(day => {
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const hasBookings = venueBookings.some(booking =>
                            isSameDay(booking.date, day) && booking.venue === selectedVenue
                        );
                        
                        const hoveredWeekDays = hoveredDate ? 
                            getWeekDays(hoveredDate).map(d => d.getTime()) : [];
                        
                        const isInHoveredWeek = hoveredWeekDays.includes(day.getTime());

                        return (
                            <button
                                key={day.toString()}
                                onClick={() => handleDateSelect(day)}
                                onMouseEnter={() => setHoveredDate(day)}
                                onMouseLeave={() => setHoveredDate(null)}
                                disabled={isPast(startOfDay(day))}
                                className={`
                                    p-2 rounded-lg relative
                                    ${!isCurrentMonth ? 'text-gray-400' : ''}
                                    ${isToday(day) ? 'bg-blue-100' : ''} 
                                    ${hasBookings ? 'bg-blue-50' : ''}
                                    ${isInHoveredWeek ? 'bg-gray-100' : ''}
                                    ${isPast(startOfDay(day)) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
                                    transition-colors duration-150
                                `}
                            >
                                <span className="text-sm">{format(day, 'd')}</span>
                                {hasBookings && (
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mx-auto mt-1" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {selectedWeek && <WeeklyView />}
            {selectedBooking && (
                <BookingDetailsDialog
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                />
            )}

            {isModalOpen && (
                isViewingBookings ? (
                    <DayBookingsModal
                        date={selectedDate}
                        venue={selectedVenue}
                        onClose={() => {
                            setIsModalOpen(false);
                            setIsViewingBookings(false);
                        }}
                        onAddBooking={() => {
                            setSelectedTimeSlot({
                                date: selectedDate,
                                venue: selectedVenue
                            });
                        }}
                    />
                ) : (
                    <VenueBookingModal
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false);
                            setSelectedTimeSlot(null);
                        }}
                        onSave={handleBookingSubmit}
                        selectedTimeSlot={selectedTimeSlot}
                        existingBookings={bookings}
                    />
                )
            )}
        </div>
    );
};

export default ResourceCalendar;