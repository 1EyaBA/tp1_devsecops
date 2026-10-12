import { gql } from '@apollo/client';
export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($chatId: Int!) {
    getChatMessages(chatId: $chatId) {
      id
      text
      createdAt
      sender {
        id
        name
      }
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation CreateMessage($createMessageInput: CreateMessageInput!) {
    createMessage(createMessageInput: $createMessageInput) {
      id
      text
      createdAt
      sender {
        id
        name
      }
    }
  }
`;
/*
export const MESSAGE_SUBSCRIPTION = gql`
  subscription OnMessageAdded($chatId: Int!) {
    messageAdded(chatId: $chatId) {
      id
      text
      createdAt
      sender {
        id
        name
      }
    }
  }
`;
*/
export const GET_CHATS=gql`
  query GetChats($userId: Int!) {
    getChats(userId: $userId) {
      id
      driver {
        id
        name
        lastName
      }
      rider {
        id
        name
        lastName
      }
      messages {
        id
        text
        createdAt
        sender {
          id
          name
        }
      }
    }
  }
`;

export const GET_CHAT=gql`
  query GetChat($chatId: Int!) {
    getChat(chatId: $chatId) {
      id
      messages {
        id
        text
        createdAt
        sender {
          id
          name
        }
      }
    }
  }
`;
export const GET_CHAT_BY_RIDE_ID=gql`
  query GetChatByRideId($rideId: Int!) {
    getChatByRideId(rideId: $rideId) {
      id
      name
      messages {
        id
        text
        createdAt
        sender {
          id
          name
        }
      }
    }
  }
`;
export const CREATE_CHAT=gql`
 mutation CreateChat($createChatInput: CreateChatInput!) {
  CreateChat(createChatInput: $createChatInput) {
    id
  }
}
`;
export const REMOVE_CHAT=gql`
  mutation RemoveChat($chatId: Int!) {
    removeChat(chatId: $chatId)
  }
`;
