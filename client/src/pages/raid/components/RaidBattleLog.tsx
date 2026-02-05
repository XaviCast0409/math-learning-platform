import { motion, AnimatePresence } from 'framer-motion';
import { Swords } from 'lucide-react';
import type { RaidLog } from '../../../types/raid.types';

interface Props {
  logs: RaidLog[];
}

export const RaidBattleLog = ({ logs }: Props) => {
  return (
    <div className="absolute top-24 right-4 w-48 pointer-events-none hidden md:block">
      <div className="flex items-center gap-2 mb-2 opacity-50">
        <Swords size={14} className="text-white" />
        <span className="text-[10px] font-bold text-white uppercase">Battle Log</span>
      </div>
      
      <div className="flex flex-col gap-1 items-end">
        <AnimatePresence>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="bg-black/60 text-white text-[10px] px-3 py-1.5 rounded-l-lg border-r-2 border-red-500 backdrop-blur-sm font-mono shadow-sm"
            >
              {log.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};