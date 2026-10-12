import { gql } from '@apollo/client';

export const GET_COMMON_RIDES = gql`
    query GetCommonRides($userId1: Int!, $userId2: Int!) {
        getCommonRides(userId1: $userId1, userId2: $userId2) {
            id
            departure
            arrival
            date
        }
    }
`;
