import { gql } from '@apollo/client';
/*
export const GET_POSTS = gql`
  query {
  getPosts {
    id
      destination
      departure
      date
      time
      seatCount
      frequency
      description
      price
      contactInfo
      status
      postOwner {
        id
        name
        lastName
        imageUrl
      }
      comments{
        text
        date
        commenter{
          name
          lastName
          imageUrl
        }
      }
  }
}
`;
*/export const GET_POSTS = gql`
  query GetPosts($searchTerm: String, $page: Int, $limit: Int, $filter: String) {
    getPosts(searchTerm: $searchTerm, page: $page, limit: $limit, filter: $filter) {
      data {
        id
        destination
        departure
        date
        time
        seatCount
        frequency
        description
        price
        contactInfo
        status
        postOwner {
          id
          name
          lastName
          imageUrl
        }
        comments {
          text
          date
          commenter {
            name
            lastName
            imageUrl
          }
        }
      }
      totalItems
      currentPage
    }
  }
`;

export const GET_POST_BY_ID = gql`
  query GetPostById($id: String!) {
    getPostById(id: $id) {
      id
      destination
      departure
      date
      time
      seatCount
      frequency
      description
      price
      contactInfo
      status
      postOwner {
        id
        name
        lastName
      }
      comments {
        id
        text
        date
        commenter{
          id
          name
          lastName
        }
      }
      listRide {
        id
      }
    }
  }
`;

export const CREATE_POST = gql`
  mutation CreatePost($createPostInput: CreatePostInput!) {
    createPost(createPostInput: $createPostInput) {
      id
      destination
      departure
      date
      time
      seatCount
      frequency
      description
      price
      contactInfo
    }
  }
`;
export const CREATE_COMMENT = gql`
  mutation createComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      commenter {
        id
        name
        lastName
      }
      text
      post {
        id
      }
      date
    }
  }
`;


export const GET_RIDE = gql`
query GetMatchingRide($postId: Int!) {
  matchingRide(postId: $postId) {
    ride {
      id
    }
    postOwnerId
  }
}
  `;
  export const GET_JOIN_REQUESTS = gql`
  query GetJoinRequestsByRideUser($rideId: Int!, $userId: Int!) {
    getJoinRequestsByRideUser(rideId: $rideId, userId: $userId) {
      id
    }
  }
`;



export const DELETE_POST = gql`
  mutation DeletePost($postId: Int!) {
    deletePost(id: $postId)
  }
`;

export const CLOSE_POST = gql`
  mutation closepost($postId: Int!) {
    closepost(id: $postId)
  }
`;

export const IS_USER_IN_RIDE = gql`
  query IsUserInRide($userId: Int!, $rideId: Int!) {
    isUserInRide(userId: $userId, rideId: $rideId)
  }
`;