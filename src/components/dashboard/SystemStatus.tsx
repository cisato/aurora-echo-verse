
import { MemorySystemCard } from "./MemorySystemCard";
import { RemindersCard } from "./RemindersCard";

interface SystemStatusProps {
  onViewAllReminders: () => void;
}

export function SystemStatus({ onViewAllReminders }: SystemStatusProps) {
  return (
    <>
      <h2 className="text-xl font-bold mb-4">System Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MemorySystemCard />
        <RemindersCard onViewAllReminders={onViewAllReminders} />
      </div>
    </>
  );
}
