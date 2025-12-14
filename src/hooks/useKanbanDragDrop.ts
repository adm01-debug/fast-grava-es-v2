import { useState, useCallback } from 'react';
import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { DbJob } from '@/hooks/useJobs';
import { JobStatus } from '@/types/scheduling';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseKanbanDragDropProps {
  jobs: DbJob[];
  onJobsUpdate: () => void;
}

export function useKanbanDragDrop({ jobs, onJobsUpdate }: UseKanbanDragDropProps) {
  const [activeJob, setActiveJob] = useState<DbJob | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const draggedJob = jobs.find(job => job.id === active.id);
    if (draggedJob) {
      setActiveJob(draggedJob);
    }
  }, [jobs]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Visual feedback is handled by DroppableColumn component
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveJob(null);
    
    if (!over) return;
    
    const activeJobId = active.id as string;
    const overData = over.data.current;
    
    // Determine target status
    let targetStatus: JobStatus | null = null;
    
    if (overData?.type === 'column') {
      targetStatus = overData.status as JobStatus;
    } else if (overData?.type === 'job') {
      // Dropped on another job - get its status
      const targetJob = jobs.find(job => job.id === over.id);
      if (targetJob) {
        targetStatus = targetJob.status as JobStatus;
      }
    }
    
    if (!targetStatus) return;
    
    const draggedJob = jobs.find(job => job.id === activeJobId);
    if (!draggedJob) return;
    
    // If same status, no update needed
    if (draggedJob.status === targetStatus) return;
    
    // Validate status transitions
    const validTransitions: Record<string, JobStatus[]> = {
      'queue': ['ready', 'cancelled'],
      'ready': ['queue', 'scheduled', 'cancelled'],
      'scheduled': ['ready', 'production', 'cancelled'],
      'production': ['paused', 'finished', 'delayed', 'rework'],
      'paused': ['production', 'cancelled'],
      'delayed': ['production', 'cancelled'],
      'rework': ['production', 'finished', 'cancelled'],
      'finished': [], // Cannot transition from finished
      'cancelled': [], // Cannot transition from cancelled
    };
    
    const currentStatus = draggedJob.status as JobStatus;
    const allowedTransitions = validTransitions[currentStatus] || [];
    
    if (!allowedTransitions.includes(targetStatus)) {
      toast.error('Transição de status não permitida', {
        description: `Não é possível mover de "${getStatusLabel(currentStatus)}" para "${getStatusLabel(targetStatus)}"`
      });
      return;
    }
    
    // Update job status in database
    setIsUpdating(true);
    
    try {
      const updateData: Record<string, string | null> = {
        status: targetStatus,
        updated_at: new Date().toISOString(),
      };
      
      // Set actual_start_time when moving to production
      if (targetStatus === 'production' && !draggedJob.actual_start_time) {
        updateData.actual_start_time = new Date().toISOString();
      }
      
      // Set actual_end_time when moving to finished
      if (targetStatus === 'finished' && !draggedJob.actual_end_time) {
        updateData.actual_end_time = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', activeJobId);
      
      if (error) throw error;
      
      toast.success('Status atualizado', {
        description: `Job movido para "${getStatusLabel(targetStatus)}"`
      });
      
      onJobsUpdate();
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Erro ao atualizar status', {
        description: 'Não foi possível mover o job. Tente novamente.'
      });
    } finally {
      setIsUpdating(false);
    }
  }, [jobs, onJobsUpdate]);

  const handleDragCancel = useCallback(() => {
    setActiveJob(null);
  }, []);

  return {
    activeJob,
    isUpdating,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}

function getStatusLabel(status: JobStatus): string {
  const labels: Record<JobStatus, string> = {
    'queue': 'Na Fila',
    'ready': 'No Jeito',
    'scheduled': 'Agendado',
    'production': 'Em Produção',
    'finished': 'Finalizado',
    'paused': 'Pausado',
    'cancelled': 'Cancelado',
    'delayed': 'Atrasado',
    'rework': 'Retrabalho',
  };
  return labels[status] || status;
}
