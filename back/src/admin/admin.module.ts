import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import {DashboardResolver} from "src/dashboard/dashboard.resolver";
import {AppUserModule} from "src/app-user/app-user.module";
import {RideModule} from "src/ride/ride.module";
import {PostModule} from "src/post/post.module";
import {ReviewModule} from "src/review/review.module";
import {ReportModule} from "src/report/report.module";
import {CommentModule} from "src/comment/comment.module";

@Module({
  imports: [ TypeOrmModule.forFeature([Admin]) ,
    AppUserModule,
    RideModule,
    PostModule,
    ReviewModule,
    ReportModule,
    CommentModule
  ],
  controllers: [AdminController],
  providers: [AdminService,DashboardResolver],
  exports: [AdminService]
})
export class AdminModule {}
