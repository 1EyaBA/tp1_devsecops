import { gql } from "@apollo/client";

export const GET_USERS = gql`

  query GetUsers($searchTerm: String!, $page: Int, $limit: Int) {
    getUsers(searchTerm: $searchTerm, page: $page, limit: $limit) {
      data {
        id
        name
        lastName
        imageUrl
        rating
      }
      totalItems
      currentPage
    }
  }
`;


