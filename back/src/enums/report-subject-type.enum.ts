import {registerEnumType} from "@nestjs/graphql";

export enum ReportSubjectType {
    BEHAVIOR = 'BEHAVIOR',
    LATE_ARRIVAL = 'LATE_ARRIVAL',
    NO_SHOW = 'NO_SHOW',
    DANGEROUS_DRIVING = 'DANGEROUS_DRIVING',
    RIDE = 'RIDE', // New type added
    OTHER = 'OTHER',
    VEHICLE_MALFUNCTION = 'VEHICLE_MALFUNCTION', // Possible additional type
    IMPROPER_CONDUCT = 'IMPROPER_CONDUCT', // Possible additional type
    POOR_COMMUNICATION = 'POOR_COMMUNICATION', // Possible additional type
    TRAFFIC_VIOLATION = 'TRAFFIC_VIOLATION', // Possible additional type
}
registerEnumType(ReportSubjectType, {
    name: 'ReportSubjectType',
});