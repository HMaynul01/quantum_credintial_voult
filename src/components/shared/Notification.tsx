import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface NotificationProps {
  message: string;
  type: NotificationType;
}

interface NotificationDisplayProps {
  notifications: (NotificationProps & { id: number })[];
}

const icons: Record<NotificationType, React.ElementType> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const colors: Record<NotificationType, string> = {
  info: 'bg-blue-950/80 border-blue-500/50 text-blue-300',
  success: 'bg-green-950/80 border-green-500/50 text-green-300',
  warning: 'bg-yellow-950/80 border-yellow-500/50 text-yellow-300',
  error: 'bg-red-950/80 border-red-500/50 text-red-300',
};

export const Notification: React.FC<NotificationProps> = ({ message, type }) => {
  const Icon = icons[type];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.5 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.7 }}
      transition={{ duration: 0.4, type: 'spring' }}
      className={`flex items-center gap-4 w-full max-w-sm p-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${colors[type]}`}
    >
      <Icon className="w-6 h-6 shrink-0" />
      <p className="text-sm font-semibold">{message}</p>
    </motion.div>
  );
};


export const NotificationDisplay: React.FC<NotificationDisplayProps> = ({ notifications }) => {
    return (
        <div className="fixed bottom-5 right-5 z-[9999] space-y-3">
             <AnimatePresence>
                {notifications.map((n) => (
                    <Notification key={n.id} {...n} />
                ))}
            </AnimatePresence>
        </div>
    )
}
