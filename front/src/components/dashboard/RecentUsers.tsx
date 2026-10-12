import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import { User } from "../../types.tsx";
import {
    ExternalLink
} from "lucide-react";
import  { useState } from "react";
import {useNavigate} from "react-router";

interface Props {
    users: User[];
}

// Enhanced avatar placeholder with brand colors
const getAvatarPlaceholder = (name: string): string => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=ffffff&size=128`;
};

export default function RecentUsers({ users }: Props) {
    const [searchQuery] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const navigate = useNavigate();

    const toggleUserSelection = (index: number): void => {
        setSelectedUsers(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };


    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-lg">
            {/* Enhanced Header Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">Recent Users</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <button       onClick={() => navigate('/users')}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md text-xs font-medium transition-colors">
                            <ExternalLink size={14} />
                            <span>View All Users</span>
                        </button>

                    </div>
                </div>
            </div>

            {/* Table with fixed column widths and better alignment */}
            <div className="max-w-full overflow-x-auto p-2">
                <Table className="table-fixed">
                    <TableHeader className="bg-gray-50 dark:bg-gray-800/20">
                        <TableRow className="border-none">
                            <TableCell isHeader className="w-24 py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-center">
                                Avatar
                            </TableCell>
                            <TableCell isHeader className="w-1/5 py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-left">
                                First Name
                            </TableCell>
                            <TableCell isHeader className="w-1/5 py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-left">
                                Last Name
                            </TableCell>
                            <TableCell isHeader className="w-2/5 py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-left">
                                Email
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredUsers.slice(0, 5).map((user, index) => {
                            const isSelected = selectedUsers.includes(index);

                            return (
                                <TableRow
                                    key={index}
                                    className={`
                                        transition-colors cursor-pointer
                                        ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}
                                        hover:bg-gray-50 dark:hover:bg-gray-800/30
                                    `}
                                >
                                    <TableCell className="w-24 py-4 px-4 align-middle" onClick={() => toggleUserSelection(index)}>
                                        <div className="relative flex justify-center">
                                            <img
                                                src={user.imageUrl?.trim() ? user.imageUrl : getAvatarPlaceholder(`${user.name} ${user.lastName}`)}
                                                alt={`${user.name} ${user.lastName}`}
                                                className={`
                                                    w-10 h-10 rounded-full object-cover 
                                                    ${isSelected ? 'ring-2 ring-indigo-500' : 'border border-gray-200 dark:border-gray-700'}
                                                `}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-1/5 py-4 px-4 text-sm font-medium text-gray-800 dark:text-white/90 text-left" onClick={() => toggleUserSelection(index)}>
                                        {user.name}
                                    </TableCell>
                                    <TableCell className="w-1/5 py-4 px-4 text-sm text-gray-800 dark:text-white/90 text-left" onClick={() => toggleUserSelection(index)}>
                                        {user.lastName}
                                    </TableCell>
                                    <TableCell className="w-2/5 py-4 px-4 text-sm text-gray-500 dark:text-gray-400 text-left" onClick={() => toggleUserSelection(index)}>
                                        {user.email}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>


        </div>
    );
}