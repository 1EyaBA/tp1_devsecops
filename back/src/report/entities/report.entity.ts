// src/report/entities/report.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { AppUser } from '../../app-user/entities/app-user.entity';
import { Ride } from '../../ride/entities/ride.entity';
import { ReportSubjectType } from '../../enums/report-subject-type.enum';
import { ReportStatus } from '../../enums/report-status.enum';

@ObjectType()
@Entity()
export class Report {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => String)
    @Column({ type: 'enum', enum: ReportSubjectType })
    subjectType: ReportSubjectType;

    @Field(() => AppUser)
    @ManyToOne(() => AppUser, { nullable: false })
    reporter: AppUser;

    @Field(() => AppUser)
    @ManyToOne(() => AppUser, { nullable: false })
    reportedUser: AppUser;

    @Field(() => Ride, { nullable: true })
    @ManyToOne(() => Ride, { nullable: true })
    reportedRide?: Ride;

    @Field()
    @Column('text')
    reason: string;

    @Field({ nullable: true })
    @Column('text', { nullable: true })
    proofPath?: string;

    @Field({ nullable: true })
    @Column('text', { nullable: true })
    proofUrl?: string;

    @Field(() => ReportStatus)
    @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
    status: ReportStatus;

    @Field(() => Date)
    @CreateDateColumn()
    createdAt: Date;
}
