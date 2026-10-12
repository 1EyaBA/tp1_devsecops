
import { Resolver, Query, Args } from '@nestjs/graphql';
import { ReportService } from './report.service';
import { Report } from './entities/report.entity';
import { ReportPagination } from '../graphql/types/ReportPagination';
import { Int } from 'type-graphql';
import { CurrentUser } from 'src/auth/user.decorator';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/auth.Guard';
import { AppUser } from 'src/app-user/entities/app-user.entity';
import { SelectQueryBuilder, Brackets } from 'typeorm';

@Resolver(() => Report)
export class ReportResolver {
    constructor(
        private readonly reportService: ReportService,
    ) {}

    @UseGuards(GqlAuthGuard)
    @Query(() => ReportPagination)
    async getMyReports(
        @CurrentUser() user: AppUser,
        @Args('page',  { type: () => Int, defaultValue: 1 }) page: number,
        @Args('limit', { type: () => Int, defaultValue:  6}) limit: number,
        @Args('search', { type: () => String, nullable: true }) search?: string,
        @Args('status', { type: () => String, nullable: true }) status?: string,
    ): Promise<ReportPagination> {

        const qb: SelectQueryBuilder<Report> = this.reportService
            .createQueryBuilder('report')
            .leftJoinAndSelect('report.reporter', 'reporter')
            .leftJoinAndSelect('report.reportedUser', 'reportedUser')
            .leftJoinAndSelect('report.reportedRide', 'reportedRide')
            .orderBy('report.createdAt', 'DESC')
            // Filtre indispensable : on ne veut que les rapports du user courant (sauf si admin)
            .where(user.role === 'admin'
                    ? '1=1'
                    : 'report.reporterId = :userId',
                { userId: user.id }
            );

        if (status) {
            qb.andWhere('report.status = :status', { status });
        }

        if (search) {
            qb.andWhere(new Brackets(qb1 => {
                qb1
                    .where('LOWER(report.subjectType) LIKE LOWER(:s)', { s: `%${search}%` })
                    .orWhere('LOWER(report.reason)      LIKE LOWER(:s)', { s: `%${search}%` });
            }));
        }

        const [data, totalItems] = await qb
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return {
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
        };
    }
}
