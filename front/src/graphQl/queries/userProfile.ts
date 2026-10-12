import { gql } from '@apollo/client';

export const GET_APPUSER_INFO = gql`
  query getAppUserInfo {
    getAppUserInfo {
      id
      name
      lastName
      email
      phoneNumber
      dateOfBirth
      imageUrl
    }
  }
`;

export const GET_APPUSER_PHOTO = gql`
  query getAppUserPhoto {
    getAppUserInfo {
      imageUrl
      name
      lastName
    }
  }
`;

export const GET_APPUSER_BY_ID = gql`
  query getAppUserById($id: Int!) {
    getAppUserById(id: $id) {
      id
      name
      lastName
      imageUrl
      email
    }
  }
`;