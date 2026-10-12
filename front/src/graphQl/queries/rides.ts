import { gql } from '@apollo/client';

export const GET_RIDES_BY_DRIVER = gql`
query {
    getRidesByDriver {
      id
      departure
      arrival
      date
      state
      post {
        id
        postOwner {
          id
          name
          lastName
        }
      }
      appUserRides {
      appUser {
        id
        name
        lastName
      } 
      }
    }
  }
`;

export const GET_RIDES_BY_PASSENGER = gql`
query {
  getRidesByPassenger {
    id
    departure
    arrival
    date
    post {
      id
      postOwner {
        id
        name
        lastName
      }
    }
    appUserRides {
      appUser {
        id
        name
        lastName
      }
    }
  }
}
`;
export const GET_USER = gql`
query {
  getAppUserInfo {
    id
    name
    lastName
      
  }
}
  `;

export const GET_RIDES_DRIVER_PAGINATED = gql`
query GetRidesPaginatedByDriver($page: Int!, $limit: Int!, $id: Int) {
  getRidesPaginatedByDriver(page: $page, limit: $limit, id: $id) {
    data {
      date
      departure
      arrival
      time
      state
      appUserRides {
      appUser {
        name
        lastName
        id
      }
    }

    }
    totalItems
    totalPages
    currentPage
  }
}
`;

export const GET_RIDES_PASSENGER_PAGINATED = gql`
query GetRidesPaginatedByPassenger($page: Int!, $limit: Int!,$id: Int) {
  getRidesPaginatedByPassenger(page: $page, limit: $limit, id: $id) {
    data {
      date
      departure
      arrival
      time
      state
      driver{
        id
        name
        lastName
        id
      
      }
    }
    totalItems
    totalPages
    currentPage
  }
}
`;

export const GET_RIDE_USERS = gql`
  query GetRideUsers($rideId: Int!) {
    getUsersForRide(rideId: $rideId) {
      id
      name
      lastName
      imageUrl
      roleInRide
    }
  }
`;
  export const CREATE_JOIN_REQUEST = gql`
  mutation CreateJoinRequest($postId: Int!) {
    createJoinRequest(postId: $postId) {
      id
      date
      ride {
        id
        departure
        arrival
      }
      user {
        id
        name
        lastName
      }
    }
  }
`;

export const DELETE_JOIN_REQUEST = gql`
  mutation DeleteJoinRequest($postId: Int!) {
    deleteJoinRequest(postId: $postId)
  }
`;


export const GET_JOIN_REQUESTS_BY_RIDE = gql`
  query GetJoinRequestsByRide($rideId: Int!) {
    getJoinRequestsByRide(rideId: $rideId) {
      id
      user {
        id
        name
        lastName
        imageUrl
      }
    }
  }
`;

export const DELETE_REQUEST = gql`
  mutation DeleteJoinRequestById($id: Int!) {
    deleteJoinRequestById(id: $id)
  }
`;

export const ACCEPT_REQUEST = gql`
mutation AcceptJoinRequest($requestId: Int!,$rideId: Int!, $userId: Int!) {
  acceptJoinRequest(requestId:$requestId,rideId: $rideId, userId: $userId) {
    id
    appUser {
      id
      name
      lastName
    }
    ride {
      id
      departure
      arrival
    }
  }
}
  `;

export const END_RIDE = gql`
mutation closeRide($rideId: Int!) {
  closeRide(rideId: $rideId) {
    id
    state
  }
}
    `;

  export const SEARCH_RIDES_BY_USER = gql`
  query SearchRidesByUser(
    $searchTerm: String!
    $page: Int
    $limit: Int
    $filterType: String
  ) {
    searchRidesByUser(
      searchTerm: $searchTerm
      page: $page
      limit: $limit
      filterType: $filterType
    ) {
      data {
        id
        departure
        arrival
        date
        price
        nbPassengers
        state
        post {
          id
          postOwner {
            id
            name
            lastName
          }
        }
        appUserRides {
          appUser {
            id
            name
            lastName
          }
        }
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;
