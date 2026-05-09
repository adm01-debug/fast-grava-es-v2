import { useState, useCallback } from 'react';
import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { DbJob } from '@/hooks/useJobs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseWeeklyDragDropProps {
  onUpdate: () => void;
}

export function useWeeklyDragDrop({ onUpdate }: UseWeeklyDragDropProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const jobId = active.id as string;
    const overId = over.id as string; // format: "machineId|date"

    const [machineId, date] = overId.split('|');

    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          machine_id: machineId,
          scheduled_date: date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      if (error) throw error;

      toast.success('Agendamento atualizado');
      onUpdate();
    } catch (err) {
      console.error('Error updating job:', err);
      toast.error('Erro ao mover agendamento');
    }
  };

  return {
    activeId,
    handleDragStart,
    handleDragEnd,
  };
}
