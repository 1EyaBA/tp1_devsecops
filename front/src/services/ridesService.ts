import { useQuery } from "@apollo/client";
import { GET_RIDE_USERS, GET_RIDES_DRIVER_PAGINATED, GET_RIDES_PASSENGER_PAGINATED } from "../graphQl/queries/rides";
import { GET_Rides_BY_USER } from "../graphQl/queries/calendar";
import client from "../graphQl/client";
export const useRidesPaginatedByDriver = (page: number, limit: number,id?: number) => {
    const { loading, error, data, refetch } = useQuery(GET_RIDES_DRIVER_PAGINATED, {
      variables: { page, limit , id},
      fetchPolicy: 'network-only',
    });
  
    return { loading, error, data, refetch };
  };


  export const useRidesPaginatedByPassenger = (page: number, limit: number, id?: number) => {
    const { loading, error, data, refetch } = useQuery(GET_RIDES_PASSENGER_PAGINATED, {
      variables: { page, limit ,id},
      fetchPolicy: 'network-only',
    });
  
    return { loading, error, data, refetch };
  };


  export const useRidesByUser = async () => {
    try {
      console.log("Fetching rides by user...");
      const { loading, error, data } = await client.query({
        query: GET_Rides_BY_USER,
        fetchPolicy: 'network-only',
      });
      console.log("Rides by user fetched successfully:", data);
      return { 
        loading, 
        error, 
        data, 
        refetch: () => client.query({ query: GET_Rides_BY_USER }) 
      };
    } catch (error) {
      return { 
        loading: false, 
        error, 
        data: null, 
        refetch: () => client.query({ query: GET_Rides_BY_USER }) 
      };
    }




    
  };




  export interface RideUser {
    id: number;
    name: string;
    lastName: string;
    imageUrl: string;
    roleInRide: string;
  }
  
  export const getRideUsers = async (rideId: number): Promise<RideUser[]> => {
    try {
      const { data } = await client.query({
        query: GET_RIDE_USERS,
        variables: { rideId }
      });
  
      return data.getUsersForRide;
    } catch (error) {
      console.error('Error fetching ride users:', error);
      return [];
    }
  };