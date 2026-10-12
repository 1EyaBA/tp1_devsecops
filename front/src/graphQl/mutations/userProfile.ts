import { gql } from '@apollo/client';

export const UPDATE_USER = gql`
  mutation UpdateUser($updateAppUserInput: UpdateAppUserInput!) {
    updateAppUser(updateAppUserInput: $updateAppUserInput) {
      id
      name
      lastName
      email
      phoneNumber
      dateOfBirth
      password
    }
  }
`;


export const UPDATE_USER_PHOTO = gql`
  mutation UpdatePhoto($updatePhotoInput: UploadPhotoInput!) {
    updatePhoto(updatePhotoInput: $updatePhotoInput){
      imageUrl
    }
  }
`;
