import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { AppUser } from '../app-user/entities/app-user.entity';
import { Ride } from '../ride/entities/ride.entity';
import { GenericService } from '../services/genericService';
import { ReportStatus } from '../enums/report-status.enum';
//import { ReportPayload } from '../SSE/ReportPayload';
import {User} from "src/user/entities/user.entity";
import { EventStreamService, EventType } from 'src/SSE/sse-subscription.service';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class ReportService extends GenericService {
    constructor(
        @InjectRepository(AppUser) private readonly appUserRepo: Repository<AppUser>,
        
        @InjectRepository(Report)
        private readonly reportRepo: Repository<Report>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Ride)
        private readonly rideRepo: Repository<Ride>,
        private readonly notificationService: NotificationService,
    ) {
        super(reportRepo);
    }


    async createReport(createDto: CreateReportDto, proofPath: string | null): Promise<Report> {
        const reporter = await this.appUserRepo.findOneBy({ id: createDto.reporterId });
        if (!reporter) throw new NotFoundException('Reporter not found');

        const reportedUser = await this.appUserRepo.findOneBy({ id: createDto.reportedUserId });
        if (!reportedUser) throw new NotFoundException('Reported user not found');

        const report = this.reportRepo.create({
            subjectType: createDto.subjectType,
            reason: createDto.reason,
            reporter,
            reportedUser,
            status: ReportStatus.PENDING,
        });

        if (createDto.reportedRideId) {
            const ride = await this.rideRepo.findOneBy({ id: createDto.reportedRideId });
            if (!ride) throw new NotFoundException('Reported ride not found');
            report.reportedRide = ride;
        }

        if (proofPath) {
            report.proofPath = proofPath;
            report.proofUrl = `/uploads/proofs/${proofPath.split('\\').pop()}`;
        }
        const reportPayload = {
            id: report.id,
            subjectType: report.subjectType,
            reason: report.reason,
            reporter: {
                id: reporter.id,
                name: reporter.name,
            },
            reportedUser: {
                id: reportedUser.id,
                name: reportedUser.name,
            },
            
        };
        //added notification logic
        // Notify the admin user about the new report

        const saved = await this.reportRepo.save(report);

        const admin = await this.userRepo.findOne({ where: { role: 'admin' } });
        if (admin) {
            const payload = {
                reportId: saved.id,
                subjectType: saved.subjectType,
                reporterId: reporter.id,
                reason: saved.reason,
                status: saved.status,
            };
            
 
            await this.notificationService.reportNotification(
                admin.id,
                saved.id,
                'New Report',
                `A new report has been filed by ${reporter.name} against ${reportedUser.name}.`,
                `/myReports`,
                {
                    subjectType: saved.subjectType,
                    reporterId: reporter.id,
                    reason: saved.reason,
                    status: saved.status,
                }
            );

        }

        return saved;
    }

    async findAll(): Promise<Report[]> {
        return this.reportRepo.find({
            relations: ['reporter', 'reportedUser', 'reportedRide'],
            order: { createdAt: 'DESC' },
        });
    }


    async approve(id: number): Promise<Report> {
        const report = await this.reportRepo.findOne({
            where: { id },
            relations: ['reporter', 'reportedUser'],
        });
        if (!report) throw new NotFoundException(`Report ${id} not found`);

        report.status = ReportStatus.ACCEPTED;
        const saved = await this.reportRepo.save(report);

        if ((report.reportedUser as any).rating > 1) {
            (report.reportedUser as any).rating -= 1;
            await this.appUserRepo.save(report.reportedUser);
        }

        const payload= {
            reportId: saved.id,
            reporterId: report.reporter.id,
            reason: saved.reason,
            subjectType: saved.subjectType,
            status: saved.status,
        };

       // this.eventStream.emitReportApproved(report.reporter.id, payload);

        //this.eventStream.emitReportApproved(report.reportedUser.id, payload);
        console.log('Report approved:', payload);
        return saved;
    }


    async decline(id: number): Promise<Report> {
        const report = await this.reportRepo.findOne({
            where: { id },
            relations: ['reporter'],
        });
        if (!report) throw new NotFoundException(`Report ${id} not found`);

        report.status = ReportStatus.REJECTED;
        const saved = await this.reportRepo.save(report);

        const payload= {
            reportId: saved.id,
            subjectType: saved.subjectType,
            status: saved.status,
            reporterId: report.reporter.id,
            reason: saved.reason,
        };
       // this.eventStream.emitReportDeclined(report.reporter.id, payload);
        console.log('Report declined:', payload);
        return saved;
    }

    async remove(id: number): Promise<void> {
        const result = await this.reportRepo.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Report ${id} not found`);
        }
    }

    createQueryBuilder(alias: string) {
        return this.reportRepo.createQueryBuilder(alias);
    }
}
