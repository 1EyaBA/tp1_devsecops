import { gql } from "@apollo/client";

export const GET_Rides_BY_USER = gql`
  query GetRidesByUserId {
    getRidesByUserId {
      id
      date
      departure
      arrival
    }
  }
`;