import { gql } from "@apollo/client";

export const GET_REVIEW_FORM_DATA = gql`
  query GetReviewFormData($rideId: Int!, $reviewedUserId: Int!) {
    reviewFormData(rideId: $rideId, reviewedUserId: $reviewedUserId) {
      reviewedUser {
        id
        name
        imageUrl
      }
      ride {
        id
        departure
        date
        arrival
        price
        time
      }
    }
  }
`;

export const GET_MY_REVIEWS = gql`
  query GetMyReviews($page: Int, $limit: Int) {
    getMyReviews(page: $page, limit: $limit) {
      data {
        id
        stars
        comment
        date
        ride {
          id
          departure
          arrival
          date
          time
        }
        reviewedUser {
          id
          name
          lastName
          imageUrl
        }
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;

export const GET_USER_REVIEWS = gql`
  query GetUserReviews($userId: Int!, $page: Int, $limit: Int) {
    getUserReviews(userId: $userId, page: $page, limit: $limit) {
      data {
        id
        stars
        comment
        date
        ride {
          id
          departure
          arrival
          date
          time
        }
        reviewer {
          id
          name
          lastName
          imageUrl
        }
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;

export const GET_PAGINATED_REVIEWS_BY_USER = gql`
  query GetPaginatedMyReviews(
    $page: Int
    $limit: Int
    $sortField: String
    $sortOrder: String
  ) {
    getPaginatedMyReviews(
      page: $page
      limit: $limit
      sortField: $sortField
      sortOrder: $sortOrder
    ) {
      data {
        id
        stars
        comment
        date
        reviewer {
          name
          lastName
        }
      }

    }
  }
`;

export const GET_AVERAGE_RATING = gql`
  query GetAverageRating {
    getAverageRating 
  }
`;

export const GET_AVERAGE_RATING_BY_ID = gql`
  query getAverageRatingById($id: Int!) {
    getAverageRatingById(id: $id) 
  }
`;


export const SEARCH_REVIEWS = gql`
  query SearchMyReviews(
    $searchTerm: String!
    $page: Int
    $limit: Int
    $isMyReviews: Boolean
  ) {
    searchMyReviews(
      searchTerm: $searchTerm
      page: $page
      limit: $limit
      isMyReviews: $isMyReviews
    ) {
      data {
        id
        stars
        comment
        date
        reviewer {
          id
          name
          lastName
          imageUrl
        }
        reviewedUser {
           id
          name
          lastName
          imageUrl
        }
        ride {
           id
        departure
        date
        arrival
        price
        time
        }
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;