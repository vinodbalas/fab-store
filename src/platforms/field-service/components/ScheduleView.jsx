import { Calendar, Clock, MapPin, User } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Schedule View Component
 * Displays technician schedules and work order assignments
 */
export default function ScheduleView({ schedule, technicians, onWorkOrderSelect }) {
  const getTechnicianName = (techId) => {
    const tech = technicians?.find((t) => t.id === techId);
    return tech?.name || techId;
  };

  const getTechnicianAvatar = (techId) => {
    const tech = technicians?.find((t) => t.id === techId);
    return tech?.avatar || `/api/placeholder/32/32`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-[#612D91]" />
        <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
      </div>

      <div className="space-y-3">
        {schedule?.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <img
                  src={getTechnicianAvatar(item.technicianId)}
                  alt={getTechnicianName(item.technicianId)}
                  className="w-10 h-10 rounded-full border-2 border-gray-200"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{getTechnicianName(item.technicianId)}</h4>
                  <span className="text-xs text-gray-500">
                    {item.startTime ? new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                  </span>
                </div>
                {item.workOrder && (
                  <div
                    onClick={() => onWorkOrderSelect?.(item.workOrder)}
                    className="cursor-pointer space-y-1"
                  >
                    <p className="text-sm font-medium text-gray-900">{item.workOrder.id}</p>
                    <p className="text-xs text-gray-600">{item.workOrder.serviceType}</p>
                    {item.workOrder.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{item.workOrder.location.address || item.workOrder.location}</span>
                      </div>
                    )}
                  </div>
                )}
                {item.route && (
                  <div className="mt-2 text-xs text-gray-500">
                    Route: {item.route.distance?.toFixed(1)}km, {item.route.duration}min
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {(!schedule || schedule.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No schedule items for today</p>
        </div>
      )}
    </div>
  );
}

