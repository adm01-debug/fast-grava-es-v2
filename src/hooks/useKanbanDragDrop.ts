import { useState, useCallback } from 'react';
import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { DbJob } from '@/hooks/useJobs';
import { JobStatus } from '@/types/scheduling';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

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
    // Reordering within a column updates the sort_order in the database
    const columnJobs = jobs
      .filter(j => j.status === status)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    const oldIndex = columnJobs.findIndex(j => j.id === activeJobId);
    const newIndex = columnJobs.findIndex(j => j.id === overJobId);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(columnJobs, oldIndex, newIndex);

    setIsUpdating(true);
    try {
      // Update sort_order for all affected jobs in the column
      const updates = newOrder.map((job, index) => ({
        ...job,
        sort_order: index,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('jobs')
        .upsert(updates);

      if (error) throw error;

      toast.success('Ordem atualizada', {
        description: 'A nova sequência foi salva com sucesso.'
      });
      
      onJobsUpdate();
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error reordering jobs:', error);
      toast.error('Erro ao reordenar', {
        description: 'Não foi possível salvar a nova ordem.'
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
      'buffer': ['ready', 'scheduled', 'cancelled'],
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
    'buffer': 'Buffer',
  };
  return labels[status] || status;
}
