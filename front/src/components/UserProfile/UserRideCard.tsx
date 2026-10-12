import { Ride} from "../../types";

interface UserHistoryCardProps {
  ride: Ride;
}

export default function UserHistoryCard({ ride }: UserHistoryCardProps) {

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6" style={{marginBottom: "10px"}}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  From
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {ride.from}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  To
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {ride.to}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Date
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {ride.date}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Time
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {ride.time}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  State
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {ride.state}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Driver
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {ride.driver}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    
    </>
  );
}
