import { useQuery } from "@apollo/client";
import { GET_CHAT_MESSAGES } from "../graphQl/queries/chat"; 

export const useMessagesByChat = (chatId: number, page: number, limit: number) => {
  const { loading, error, data, refetch } = useQuery(GET_CHAT_MESSAGES, {
    variables: { chatId, page, limit },
    fetchPolicy: "network-only", // ensure the freshest data
  });

  return { loading, error, data, refetch };
};
