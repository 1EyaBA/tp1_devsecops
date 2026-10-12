import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class DashboardStatsType {
    @Field(() => Int)
    userCount: number;

    @Field(() => Int)
    rideCount: number;

    @Field(() => Int)
    postCount: number;

    @Field(() => Int)
    reviewCount: number;

    @Field(() => Int)
    reportCount: number;

    @Field(() => Int)
    commentCount: number;
}
