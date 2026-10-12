import { Ride } from 'src/ride/entities/ride.entity';
import {DashboardStatsType} from "src/graphql/types/dashboard/dashboard-stats.type";
import {Field, ObjectType} from "@nestjs/graphql";
import {RidesPerMonth} from "src/graphql/types/dashboard/rides-per-month.type";
import {AppUser} from "src/app-user/entities/app-user.entity";

@ObjectType()
export class DashboardData {
    @Field(() => DashboardStatsType)
    stats: DashboardStatsType;

    @Field(() => [RidesPerMonth])
    ridesPerMonth: RidesPerMonth[];

    @Field(() => [Ride])
    recentRides: Ride[];

    @Field(() => [AppUser])
    recentUsers: AppUser[];
}
