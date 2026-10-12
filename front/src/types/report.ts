export interface CommonRide {
    id: number;
    departure: string;
    arrival: string;
    date: string;
}

export interface CreateReportPayload {
    subjectType: string;
    reason: string;
    reporterId: number;
    reportedUserId: number;
    reportedRideId?: number;
    proof?: File;
}

export interface ReportFormProps {
    reporterId: number;
    reporterName: string;
    reporterEmail: string;
    reportedUser: {
        id: number;
        name: string;
        lastName: string;
        email: string;
    };
}

export interface User {
    id: string;
    name: string;
    lastName: string;
    imageUrl: string;
}

export interface Ride {
    id: string;
    departure: string;
    arrival: string;
    date: string;
    time: string;
}

export interface Report {
    id: number;
    subjectType: string;
    reason: string;
    proofPath: string;
    proofUrl: string;
    status: string;
    createdAt: string;
    reporter: User;
    reportedUser: User ;
    reportedRide?: Ride | null;
}
export interface ReportPaginated{
    data: Report[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
}

export interface ReportDetailsProps {
    report: Report;
    onClose: () => void;
    onChange?: () => void;
}
export type StatusType = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface StatusConfig {
    icon: React.ReactNode;
    lightClass: string;
    darkClass: string;
    label: string;
}

export type StatusConfigMap = {
    [key in StatusType | 'default']: StatusConfig;
};



