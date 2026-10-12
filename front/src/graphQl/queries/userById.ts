// src/graphql/queries/userById.ts
import { gql } from '@apollo/client';

export const GET_USER_BY_ID = gql`
    query GetUserById($id: Int!) {
        getUserById(id: $id) {
            id
            name
            lastName
            email
        }
    }
`;
