import { useMemo } from 'react';
import { useJobs, useTechniques, useMachines, DbJob, DbTechnique } from './useJobs';

export interface OrphanedTechnique {
  technique: DbTechnique;
  jobCount: number;
  activeJobCount: number;
  issue: string;
}

export interface DataIntegrityIssue {
  type: 'orphaned_technique' | 'job_without_machine' | 'production_without_machine';
  severity: 'warning' | 'error';
  message: string;
  affectedIds: string[];
}

export function useOrphanedDataDetection() {
  const { data: jobs } = useJobs();
  const { data: techniques } = useTechniques();
  const { data: machines } = useMachines();

  const analysis = useMemo(() => {
    if (!jobs || !techniques || !machines) {
      return { 
        orphanedTechniques: [], 
        issues: [], 
        isLoading: true 
      };
    }

    const orphanedTechniques: OrphanedTechnique[] = [];
    const issues: DataIntegrityIssue[] = [];

    // Check for techniques with jobs but no machines
    techniques.forEach(technique => {
      const techniqueMachines = machines.filter(m => m.technique_id === technique.id);
      const techniqueJobs = jobs.filter(j => j.technique_id === technique.id);
      const activeJobs = techniqueJobs.filter(j => 
        !['finished', 'cancelled'].includes(j.status)
      );

      if (techniqueMachines.length === 0 && techniqueJobs.length > 0) {
        orphanedTechniques.push({
          technique,
          jobCount: techniqueJobs.length,
          activeJobCount: activeJobs.length,
          issue: `Técnica "${technique.name}" tem ${techniqueJobs.length} job(s) mas nenhuma máquina cadastrada`
        });

        if (activeJobs.length > 0) {
          issues.push({
            type: 'orphaned_technique',
            severity: 'error',
            message: `Técnica "${technique.name}" tem ${activeJobs.length} job(s) ativo(s) sem máquina disponível`,
            affectedIds: activeJobs.map(j => j.id)
          });
        }
      }
    });

    // Check for jobs in production without assigned machine
    const productionWithoutMachine = jobs.filter(j => 
      j.status === 'production' && !j.machine_id
    );

    if (productionWithoutMachine.length > 0) {
      issues.push({
        type: 'production_without_machine',
        severity: 'warning',
        message: `${productionWithoutMachine.length} job(s) em produção sem máquina atribuída`,
        affectedIds: productionWithoutMachine.map(j => j.id)
      });
    }

    return {
      orphanedTechniques,
      issues,
      isLoading: false,
      errorCount: issues.filter(i => i.severity === 'error').length,
      warningCount: issues.filter(i => i.severity === 'warning').length,
    };
  }, [jobs, techniques, machines]);

  return analysis;
}
