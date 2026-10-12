import {registerEnumType} from "@nestjs/graphql";
import {ReportSubjectType} from "src/enums/report-subject-type.enum";

export enum ReportStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
}
registerEnumType(ReportStatus, {
    name: 'ReportStatus',
});