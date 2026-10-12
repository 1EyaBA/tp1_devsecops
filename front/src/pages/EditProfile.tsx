import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import PageMeta from "../components/common/PageMeta";
import { Drive, Ride, User } from "../types";
import UserDriveCard from "../components/UserProfile/UserDriveCard";
import UserRideCard from "../components/UserProfile/UserRideCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import { useRidesPaginatedByDriver, useRidesPaginatedByPassenger } from "../services/ridesService";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Review from "../components/UserProfile/Review";
import { fetchUserById } from "../services/userService";


const UserProfiles= () => { 
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [page] = useState(1);
  const limit = 2;
  
  const {
          loading: loadingDriver,
          error: errorDriver,
          data: driverData,
        }= useRidesPaginatedByDriver(page, limit);
        const driverRides = driverData?.getRidesPaginatedByDriver?.data ?? [];
        const drives: Drive[] = driverRides.map((ride: any) => ({
          from: ride.departure,
          to: ride.arrival,
          date: new Date(ride.date).toLocaleDateString('en-CA'),
          time: ride.time,
          state: ride.state,
          riders: ride.appUserRides?.map((r: any) =>
            `${r.appUser?.name ?? ''} ${r.appUser?.lastName ?? ''}`.trim()
          ).filter(Boolean) ?? [],
        }));
  
        const {
          loading: loadingPassenger,
          error: errorPassenger,
          data: passengerData,
        }= useRidesPaginatedByPassenger(page, limit);
        const passengerRides = passengerData?.getRidesPaginatedByPassenger?.data ?? [];
        const rides: Ride[] = passengerRides.map((ride: any) => ({
          from: ride.departure,
          to: ride.arrival,
          date: new Date(ride.date).toLocaleDateString('en-CA'),
          time: ride.time,
          state: ride.state,
          driver: 
            `${ride.driver?.name ?? ''} ${ride.driver?.lastName ?? ''}`.trim(),
        }));
        const getUserData = async () => {
      try {
        const fetchedUser = await fetchUserById();
        setUser(fetchedUser); 
      } catch (error) {
        console.error(error);
      }
    };
    useEffect(() => {
      getUserData();
    }, [])
      
  return (
    <>
      <PageMeta
        title="Profile"
        description=""
      />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        
        <div className="space-y-6">
          <UserMetaCard user={user} isReportable={false} isEditable={true} />
          <UserInfoCard user={user} isEditable={true} />
          <div className="container flex gap-6">
  <div className="w-1/2">
          <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          History as a driver
          </h2>
          {loadingDriver ? (
          <p>Loading driver history...</p>
        ) : errorDriver ? (
          <p>Error loading driver rides</p>
        ) : rides.length > 0 ?(
          drives.map((ride: any) => (
            <UserDriveCard key={ride.id} drive={ride} />
          ))
        ) : (
          <p className="text-gray-500 " >No drives</p>
        )
        }
          
        <div style={{justifySelf: "center"}}>
        
        </div>
        
      </div>
      <div className="w-1/2">
      <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          History as a rider
      </h2>         
      {loadingPassenger ? (
  <p>Loading rider history...</p>
) : errorPassenger ? (
  <p>Error loading rider rides</p>
) : rides.length > 0 ? (
  rides.map((ride, index) => (
    <UserRideCard key={index} ride={ride} />
  ))
) : (
  <p className="text-gray-500 " >No rides</p>
)}

      </div>
      </div>
      {(drives.length > 0 || rides.length > 0) && (
  <div className="flex w-full items-center justify-center">
    <button onClick={() => navigate('/rides')}
      className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto">
      view more
    </button>
  </div>
)}
            <Review />
      
          
        </div>
      </div>
    </>
  );
}
export default UserProfiles;