import gql from 'graphql-tag';

export const Get_DashboardData = gql`
  query {
    getDashboardData {
      stats {
        userCount
        rideCount
        postCount
        reviewCount
        reportCount
        commentCount
      }
      ridesPerMonth {
        month
        count
      }
      recentRides {
        id
        departure
        arrival
        date
        time
        price
        nbPassengers
        state
      }
      recentUsers {
        id
        name
        lastName
        email
        dateOfBirth
        phoneNumber
        imageUrl
        
      }
    }
        
  }
`;