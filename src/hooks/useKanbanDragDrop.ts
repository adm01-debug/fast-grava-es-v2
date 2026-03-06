import { useState, useCallback } from 'react';
import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { DbJob } from '@/hooks/useJobs';
import { JobStatus } from '@/types/scheduling';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseKanbanDragDropProps {
  jobs: DbJob[];
  onJobsUpdate: () => void;
}

// Priority order for sorting (higher = more priority)
const priorityOrder: Record<string, number> = {
  'urgent': 4,
  'high': 3,
  'medium': 2,
  'low': 1,
};

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

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Visual feedback is handled by DroppableColumn component
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveJob(null);
    
    if (!over) return;
    
    const activeJobId = active.id as string;
    const overId = over.id as string;
    const overData = over.data.current;
    
    const draggedJob = jobs.find(job => job.id === activeJobId);
    if (!draggedJob) return;
    
    // Check if dropping on a column or another job
    const isColumn = overData?.type === 'column';
    const isJob = overData?.type === 'job';
    
    // Determine target status
    let targetStatus: JobStatus | null = null;
    
    if (isColumn) {
      targetStatus = overData.status as JobStatus;
    } else if (isJob) {
      const targetJob = jobs.find(job => job.id === overId);
      if (targetJob) {
        targetStatus = targetJob.status as JobStatus;
      }
    }
    
    if (!targetStatus) return;
    
    const currentStatus = draggedJob.status as JobStatus;
    
    // Same status - reorder within column
    if (currentStatus === targetStatus && isJob && activeJobId !== overId) {
      await handleReorderWithinColumn(activeJobId, overId, targetStatus);
      return;
    }
    
    // Different status - change status
    if (currentStatus !== targetStatus) {
      await handleStatusChange(draggedJob, targetStatus);
    }
  }, [jobs, onJobsUpdate]);

  const handleReorderWithinColumn = async (
    activeJobId: string, 
    overJobId: string, 
    status: JobStatus
  ) => {
    // Get jobs in this column, sorted by priority then date
    const columnJobs = jobs
      .filter(job => job.status === status)
      .sort((a, b) => {
        // First by priority
        const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        if (priorityDiff !== 0) return priorityDiff;
        // Then by created date
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
    
    const oldIndex = columnJobs.findIndex(job => job.id === activeJobId);
    const newIndex = columnJobs.findIndex(job => job.id === overJobId);
    
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
    
    const reorderedJobs = arrayMove(columnJobs, oldIndex, newIndex);
    
    setIsUpdating(true);
    
    try {
      // Update priorities based on new order
      // Jobs at the top get higher priority
      const priorityValues = ['urgent', 'high', 'medium', 'low'];
      const updates = reorderedJobs.map((job, index) => {
        // Calculate new priority based on position
        // Top positions get urgent/high, bottom get medium/low
        const totalJobs = reorderedJobs.length;
        const priorityIndex = Math.min(
          Math.floor((index / totalJobs) * priorityValues.length),
          priorityValues.length - 1
        );
        const newPriority = priorityValues[priorityIndex];
        
        return supabase
          .from('jobs')
          .update({ 
            priority: newPriority,
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);
      });
      
      await Promise.all(updates);
      
      toast.success('Cards reordenados', {
        description: 'A ordem dos jobs foi atualizada'
      });
      
      onJobsUpdate();
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error reordering jobs:', error);
      toast.error('Erro ao reordenar', {
        description: 'Não foi possível reordenar os cards. Tente novamente.'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (draggedJob: DbJob, targetStatus: JobStatus) => {
    const currentStatus = draggedJob.status as JobStatus;
    
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
    
    const allowedTransitions = validTransitions[currentStatus] || [];
    
    if (!allowedTransitions.includes(targetStatus)) {
      toast.error('Transição de status não permitida', {
        description: `Não é possível mover de "${getStatusLabel(currentStatus)}" para "${getStatusLabel(targetStatus)}"`
      });
      return;
    }
    
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
        .eq('id', draggedJob.id);
      
      if (error) throw error;
      
      toast.success('Status atualizado', {
        description: `Job movido para "${getStatusLabel(targetStatus)}"`
      });
      
      onJobsUpdate();
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error updating job status:', error);
      toast.error('Erro ao atualizar status', {
        description: 'Não foi possível mover o job. Tente novamente.'
      });
    } finally {
      setIsUpdating(false);
    }
  };

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
