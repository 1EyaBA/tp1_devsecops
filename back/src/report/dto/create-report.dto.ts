import { IsEnum, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportSubjectType } from '../../enums/report-subject-type.enum';

export class CreateReportDto {
    @IsEnum(ReportSubjectType)
    subjectType: ReportSubjectType;

    @IsNotEmpty()
    reason: string;

    @IsNumber()
    @Type(() => Number)
    reporterId: number;

    @IsNumber()
    @Type(() => Number)
    reportedUserId: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    reportedRideId?: number;
}
