import { ApolloClient, InMemoryCache } from '@apollo/client';
import { Get_DashboardData } from '../graphQl/queries/dashboardData';

const client = new ApolloClient({
    uri: 'http://localhost:3000/graphql',
    cache: new InMemoryCache(),
});

export const DashboardService = {
    getDashboardData: async () => {
        try {
            console.log('Fetching dashboard data...'); // Log when starting
            const { data } = await client.query({
                query: Get_DashboardData,
                fetchPolicy: 'network-only',
            });

            console.log('Dashboard data received:', data.getDashboardData); // Log the result
            return data.getDashboardData;
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    },
};