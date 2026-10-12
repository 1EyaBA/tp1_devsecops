import { ApolloClient } from "@apollo/client";
import client from "../graphQl/client";
import { UPDATE_USER, UPDATE_USER_PHOTO } from "../graphQl/mutations/userProfile";
import { GET_APPUSER_BY_ID, GET_APPUSER_INFO, GET_APPUSER_PHOTO } from "../graphQl/queries/userProfile";
import { UpdateAppUserInput } from "../types";

export const fetchUserById = async () => {
    const { data } = await client.query({
      query: GET_APPUSER_INFO,
    });
    return data.getAppUserInfo;

}
export const fetchUserPhoto= async () => {
  const { data } = await client.query({
    query: GET_APPUSER_PHOTO,
     fetchPolicy: "network-only",
  });
    return data.getAppUserInfo;
  };
  
  export const updateUser = async (updateAppUserInput: UpdateAppUserInput) => {
  
    const { data } = await client.mutate({
      mutation: UPDATE_USER,
      variables: { updateAppUserInput }, 
      
    });
  
    return data.updateAppUser;
  };

  export async function uploadUserPhoto(client: ApolloClient<object>, base64File: string) {
    try {
      const result = await client.mutate({
        mutation: UPDATE_USER_PHOTO,
        variables: {
          updatePhotoInput: {
            file: base64File,  
          },
        },
      });
  
      return result.data;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }

    
  }
  export const getUserById = async (id: number) => {
  const { data } = await client.query({
    query: GET_APPUSER_BY_ID,
    variables: { id },
    fetchPolicy: 'network-only', 
  });
  return data.getAppUserById;
};