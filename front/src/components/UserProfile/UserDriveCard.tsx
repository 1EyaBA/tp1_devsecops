import { Drive} from "../../types";

interface UserHistoryCardProps {
  drive: Drive;
}

export default function UserHistoryCard({ drive }: UserHistoryCardProps) {
  
  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6"style={{marginBottom: "10px"}}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  From
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {drive.from}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  To
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {drive.to}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Date
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {drive.date}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Time
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {drive.time}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  State
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {drive.state}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Riders
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {drive.riders}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    
    </>
  );
}
