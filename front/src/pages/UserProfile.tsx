import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { Drive, Ride, User } from "../types";
import UserDriveCard from "../components/UserProfile/UserDriveCard";
import UserRideCard from "../components/UserProfile/UserRideCard";
import ReviewCarousel from "../components/UserProfile/ReviewCarousel";
import { useEffect, useState } from "react";
import { useRidesPaginatedByDriver, useRidesPaginatedByPassenger } from "../services/ridesService";
import { useNavigate, useParams } from 'react-router-dom';
import UserInfo from "../components/UserProfile/UserInfo";
import { getUserById } from "../services/userService";
import { useQuery } from "@apollo/client";
import { GET_AVERAGE_RATING_BY_ID } from "../graphQl/queries/reviews";

    const UserProfiles = () => {
      const navigate = useNavigate();
      const { id } = useParams();
      const userId = Number(id);
      const [page] = useState(1);
      const limit = 2;
      useEffect(() => {
        if (!id || !/^\d+$/.test(id)) {
          navigate('/404', { replace: true });
        }
      }, [id, navigate]);
        const [user, setUser] = useState<User | null>(null);
        
        useEffect(() => {
          const fetchUser = async () => {
            try {
              const fetchedUser = await getUserById(userId);
              console.log("Fetched user:", fetchedUser);
              setUser(fetchedUser);
            } catch (error) {
              console.error("Failed to fetch user", error);
            }
          };
      
          fetchUser();
        }, [userId]);
  const { data } = useQuery(GET_AVERAGE_RATING_BY_ID, {
    variables: { id: userId },
    skip: !userId,
  });
      
      const {
        loading: loadingDriver,
        error: errorDriver,
        data: driverData,
      }= useRidesPaginatedByDriver(page, limit, userId);
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
      }= useRidesPaginatedByPassenger(page, limit, userId);
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
    
    
      return (
        <>
          <PageMeta title="Profile" description="" />
          <PageBreadcrumb pageTitle="Profile" />
    
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <div className="space-y-6">
              <UserInfo user={user} rating= {data?.getAverageRating} />
    
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
      <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
         My Reviews
          </h2>  
      <ReviewCarousel userId={userId} />
        </div>
      </div>
    </>
  );
}
export default UserProfiles;