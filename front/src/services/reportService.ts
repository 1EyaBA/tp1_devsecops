import axios from "axios";
import { Report } from "../types/report";

const API_BASE = 'http://localhost:3000';

export async function handleReportAction(
    id: number,
    action: 'approve' | 'decline' | 'delete'
): Promise<Report | void> {
    const url = `${API_BASE}/reports/${id}`;
    const token = localStorage.getItem('auth_token');
    const config = {
        params: { action },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    switch (action) {
        case 'approve':
        case 'decline': {
            const response = await axios.put<Report>(url, {}, config);
            return response.data;
        }

        case 'delete': {
            await axios.put(url, {}, config);
            return;
        }

        default:
            throw new Error(`Unknown action: ${action}`);
    }
}

export function setProofUrl(report: Report): Report {
    if (report.proofUrl) {
        const isAbsolute = report.proofUrl.startsWith('http://') || report.proofUrl.startsWith('https://');
        if (!isAbsolute) {
            report.proofUrl = `${API_BASE}${report.proofUrl}`;
        }
    }
    return report;
}
