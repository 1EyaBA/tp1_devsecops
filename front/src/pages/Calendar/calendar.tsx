import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { EventInput, EventClickArg } from "@fullcalendar/core";
import { useModal } from "../../hooks/useModal";
import { Calendar as CalendarIcon, MapPin, Clock } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import EventFormModal from "./CalendarEvent";
import { useRidesByUser } from "../../services/ridesService"; 
interface CalendarRide extends EventInput {
  extendedProps: {
    status: string;
    departure?: string;
    destination?: string;
    rideId?: string;
    calendar: string; 
  };
}

enum RideStatus {
  NOT_STARTED = 'NotStarted',
  STARTED = 'Started',
  CLOSED = 'Closed',
}

const RideCalendar: React.FC = () => {
  const [rideTitle, setRideTitle] = useState("");
  const [rideDate, setRideDate] = useState("");
  const [rideStatus, setRideStatus] = useState(RideStatus.NOT_STARTED);
  const [rideDeparture, setRideDeparture] = useState("");
  const [rideDestination, setRideDestination] = useState("");
  const [rides, setRides] = useState<CalendarRide[]>([]);
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [upcomingRides, setUpcomingRides] = useState<CalendarRide[]>([]);
  const [loading, setLoading] = useState(true);

  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const {  data } = await useRidesByUser();
      
      if (data && data.getRidesByUserId) {
        const formattedRides = data.getRidesByUserId.map((ride: any) => {
          const rideDate = new Date(ride.date);
          const today = new Date();
          let status = RideStatus.NOT_STARTED;
  
          if (rideDate < today) {
            status = RideStatus.CLOSED;
          } else if (rideDate.toDateString() === today.toDateString()) {
            status = RideStatus.STARTED;
          }
  
          return {
            id: ride.id,
            title: `${ride.departure} → ${ride.arrival}`, 
            date: ride.date,
            extendedProps: {
              status: status,
              departure: ride.departure,
              rideId: ride.id,
              destination: ride.arrival 
            }
          };
        });
        console.log("Formatted rides:", formattedRides);
        setRides(formattedRides);
        updateUpcomingRides(formattedRides);
      }
    } catch (error) {
      console.error("Error fetching rides:", error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    updateUpcomingRides(rides);
  }, [rides]);

  const updateUpcomingRides = (allRides: CalendarRide[]) => {
    const now = new Date();
    const upcoming = allRides
    .filter(ride => {
      const rideStart = new Date(ride.date as string);
      return rideStart >= now;
    })
      .sort((a, b) => {
        return new Date(a.start as string).getTime() - new Date(b.start as string).getTime();
      })
      .slice(0, 5);
    setUpcomingRides(upcoming);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const ride = clickInfo.event;
    setRideTitle(ride.title);
    setRideDate(ride.start?.toISOString().split("T")[0] || "");
    setRideStatus(ride.extendedProps.status);
    setRideDeparture(ride.extendedProps.departure || "");
    setRideDestination(ride.extendedProps.destination || "");
    openModal();
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(view);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const colorMap: Record<string, string> = {
      [RideStatus.NOT_STARTED]: "bg-blue-300 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
[RideStatus.STARTED]: "bg-yellow-300 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
[RideStatus.CLOSED]: "bg-green-300 text-green-800 dark:bg-green-900 dark:text-green-300",

    };
    
    return colorMap[status] || "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  console.log("rides", rides);
  console.log("upcomingRides", upcomingRides);
  console.log("loading", loading);
  return (
    <>
      <PageMeta
        title="Ride Calendar Dashboard | Ride Scheduling View"
        description="Interactive calendar dashboard for viewing scheduled rides"
      />
      
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Ride Calendar</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        {/* Sidebar */}
        <div className="flex flex-col gap-5 xl:col-span-1">
          {/* View Selector */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 font-semibold text-gray-800 dark:text-white/90">Views</h3>
            <div className="flex flex-col space-y-2">
              <button 
                onClick={() => handleViewChange('dayGridMonth')}
                className={`flex items-center rounded-lg px-3 py-2 text-sm ${currentView === 'dayGridMonth' ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Month
              </button>
              
            
            </div>
          </div>

          {/* Ride Status Categories */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 font-semibold text-gray-800 dark:text-white/90">Ride Status</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="mr-2 h-3 w-3 rounded-full bg-blue-500"></span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{RideStatus.NOT_STARTED}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2 h-3 w-3 rounded-full bg-yellow-500"></span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{RideStatus.STARTED}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2 h-3 w-3 rounded-full bg-green-500"></span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{RideStatus.CLOSED}</span>
              </div>
            </div>
          </div>

          {/* Upcoming Rides */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 font-semibold text-gray-800 dark:text-white/90">Upcoming Rides</h3>
            {loading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading rides...</p>
            ) : upcomingRides.length > 0 ? (
              <div className="space-y-3">
                {upcomingRides.map((ride) => (
                  <div 
                    key={ride.id} 
                    className="cursor-pointer rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    onClick={() => {
                      const rideObj = rides.find(r => r.id === ride.id);
                      if (rideObj) {
                        handleEventClick({
                          event: {
                            id: rideObj.id as string,
                            title: rideObj.title as string,
                            start: new Date(rideObj.start as string),
                            extendedProps: rideObj.extendedProps
                          }
                        } as any);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">{ride.title}</h4>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${getStatusBadgeClass(ride.extendedProps.status)}`}>
                        {ride.extendedProps.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>{formatDate(ride.date as string)}</span>
                    </div>
                    <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="mr-1 h-3 w-3" />
                      <span>{ride.extendedProps.departure} → {ride.extendedProps.destination}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming rides</p>
            )}
          </div>
        </div>

        {/* Main Calendar */}
        <div className="xl:col-span-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Loading rides calendar...</p>
              </div>
            ) : (
              <div className="calendar-container">
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,listWeek",
                  }}
                  events={rides}
                  eventClick={handleEventClick}
                  height="auto"
                  nowIndicator={true}
                  editable={false}
                  dayMaxEvents={true}
                  weekends={true}
                  slotEventOverlap={false}
                  allDaySlot={true}
                  stickyHeaderDates={true}
                  viewDidMount={(view) => setCurrentView(view.view.type)}
                  eventClassNames={(arg) => {
                    const status = arg.event.extendedProps.status as RideStatus;
                    
                    const baseClasses = "border p-1 rounded text-sm !text-black"; // Force black text for all
                    const statusClasses: Record<RideStatus, string> = {
                      [RideStatus.NOT_STARTED]: "bg-blue-200 border-blue-300",
                      [RideStatus.STARTED]: "bg-pink-200 border-pink-300", 
                      [RideStatus.CLOSED]: "bg-green-200 border-green-300"
                    };
                    
                    return `${baseClasses} ${statusClasses[status] || "bg-gray-200 border-gray-300"}`;
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ride View Modal */}
      <EventFormModal
        isOpen={isOpen}
        closeModal={closeModal}
        eventTitle={rideTitle}
        eventDescription={`From ${rideDeparture} to ${rideDestination}`}
        eventLocation={`${rideDeparture} → ${rideDestination}`}
        eventDate={rideDate}      
        eventLevel={rideStatus}
      
      />
    </>
  );
};


export default RideCalendar;