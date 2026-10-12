
import client from "../graphQl/client";
import { LOGIN_MUTATION, REGISTER_MUTATION } from "../graphQl/mutations/auth";

export const login = async (email: string, password: string) => {
  const { data } = await client.mutate({
    mutation: LOGIN_MUTATION,
    variables: { input: { email, password } }
  });
   const token = data.login.accessToken;
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user', JSON.stringify(data.login.user));
  
  return data.login;
};


export async function getCurrentUserId(): Promise<number | null> {

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  console.log(user);
  console.log("the id is", user?.id);
  return user?.id || null;
}
export interface CurrentUser {
  id: number;
  email: string;
  role: 'admin' | 'user';
  __typename?: 'User';
}


export async function getCurrentUser(): Promise<CurrentUser> {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user;
}

export async function signup(email: string, password: string, name: string, lastName: string) {
  try {
    const response = await client.mutate({
      mutation: REGISTER_MUTATION,
      variables: {
        input: { email, password, name, lastName }
      }
    });

    if (!response || !response.data.register) {
      throw new Error("Signup failed");
    }

    return response.data.register;
  } catch (error) {
    throw new Error("Signup failed");
  }

 
}

export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  window.location.href = '/signIn'; 

};