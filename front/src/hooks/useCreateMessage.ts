import { useMutation } from "@apollo/client";
import { SEND_MESSAGE  } from "../graphQl/queries/chat"; // import your CREATE_MESSAGE mutation

export const useCreateMessage = () => {
  const [createMessage, { loading, error, data }] = useMutation(SEND_MESSAGE );

  const sendMessage = (text: string, senderId: number, chatId: number) => {
    return createMessage({
variables: {
        createMessageInput: { text, senderId, chatId }, 
      },    });
  };

  return { sendMessage, loading, error, data };
};
