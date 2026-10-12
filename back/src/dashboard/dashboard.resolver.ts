import {Query, Resolver} from "@nestjs/graphql";
import {RideService} from "src/ride/ride.service";
import {PostService} from "src/post/post.service";
import {ReviewService} from "src/review/review.service";
import {CommentService} from "src/comment/comment.service";
import {DashboardData} from "src/graphql/types/dashboard/dashboard-data.type";
import {AppUserService} from "src/app-user/app-user.service";
import {ReportService} from "src/report/report.service";

@Resolver()
export class DashboardResolver {
    constructor(
        private readonly appUserService: AppUserService,
        private readonly rideService: RideService,
        private readonly postService: PostService,
        private readonly reviewService: ReviewService,
        private readonly reportService: ReportService,
        private readonly commentService: CommentService,
    ) {}

    @Query(() => DashboardData)
    async getDashboardData(): Promise<DashboardData> {
        const [
            userCount,
            rideCount,
            postCount,
            reviewCount,
            reportCount,
            commentCount,
            ridesPerMonth,
            recentRides,
            recentUsers
        ] = await Promise.all([
            this.appUserService.countAll(),
            this.rideService.countAll(),
            this.postService.countAll(),
            this.reviewService.countAll(),
            this.reportService.countAll(),
            this.commentService.countAll(),
            this.rideService.countRidesPerMonth(),
            this.rideService.findRecent(5),
            this.appUserService.findRecent(5),
        ]);
        console.log(userCount, rideCount, postCount, reviewCount, reportCount, commentCount, ridesPerMonth, recentRides, recentUsers);


        const dashboardData = new DashboardData();
        dashboardData.stats = {
            userCount,
            rideCount,
            postCount,
            reviewCount,
            reportCount,
            commentCount,
        };
        dashboardData.ridesPerMonth = ridesPerMonth;
        dashboardData.recentRides = recentRides;
        dashboardData.recentUsers = recentUsers;

        return dashboardData;
    }
}