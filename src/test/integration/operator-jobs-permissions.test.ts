import { describe, it, expect, beforeEach } from 'vitest';

// Types
type AppRole = 'coordinator' | 'operator' | 'manager';

interface User {
  id: string;
  role: AppRole;
}

interface MachineAssignment {
  operatorId: string;
  machineId: string;
}

interface Job {
  id: string;
  machine_id: string | null;
  order_number: string;
  client: string;
  product: string;
  quantity: number;
  technique_id: string;
  status: string;
  priority: string;
  scheduled_date: string | null;
  start_time: string | null;
  end_time: string | null;
  produced_quantity: number | null;
  lost_pieces: number | null;
  actual_start_time: string | null;
  actual_end_time: string | null;
  notes: string | null;
}

// Fields that operators are allowed to update for production registration
const OPERATOR_ALLOWED_FIELDS = [
  'produced_quantity',
  'lost_pieces',
  'actual_start_time',
  'actual_end_time',
] as const;

type OperatorAllowedField = typeof OPERATOR_ALLOWED_FIELDS[number];

// Fields that operators should NOT be able to update
const OPERATOR_RESTRICTED_FIELDS = [
  'order_number',
  'client',
  'product',
  'quantity',
  'technique_id',
  'machine_id',
  'status',
  'priority',
  'scheduled_date',
  'start_time',
  'end_time',
  'notes',
] as const;

type OperatorRestrictedField = typeof OPERATOR_RESTRICTED_FIELDS[number];

/**
 * Simulates RLS policy evaluation for operator job updates
 * This mirrors the actual RLS policy:
 * - Operator must have 'operator' role
 * - Job must be on a machine assigned to this operator
 */
class OperatorJobsRLSEvaluator {
  private user: User | null;
  private machineAssignments: MachineAssignment[];

  constructor(user: User | null, machineAssignments: MachineAssignment[] = []) {
    this.user = user;
    this.machineAssignments = machineAssignments;
  }

  /**
   * Check if operator can update a specific job based on RLS policy
   */
  canUpdateJob(job: Job): boolean {
    // Must be authenticated
    if (!this.user) return false;

    // Must be an operator
    if (this.user.role !== 'operator') {
      // Coordinators and managers can update any job
      return this.user.role === 'coordinator' || this.user.role === 'manager';
    }

    // Job must have a machine assigned
    if (!job.machine_id) return false;

    // Machine must be assigned to this operator
    return this.machineAssignments.some(
      (assignment) =>
        assignment.operatorId === this.user!.id &&
        assignment.machineId === job.machine_id
    );
  }

  /**
   * Get list of machines assigned to current operator
   */
  getAssignedMachines(): string[] {
    if (!this.user) return [];
    return this.machineAssignments
      .filter((a) => a.operatorId === this.user!.id)
      .map((a) => a.machineId);
  }
}

/**
 * Application-level field validation for operator updates
 * RLS only controls row-level access; field restrictions are enforced at application layer
 */
class OperatorFieldValidator {
  /**
   * Check if a field is allowed for operator updates
   */
  static isFieldAllowed(field: string): boolean {
    return (OPERATOR_ALLOWED_FIELDS as readonly string[]).includes(field);
  }

  /**
   * Check if a field is restricted for operators
   */
  static isFieldRestricted(field: string): boolean {
    return (OPERATOR_RESTRICTED_FIELDS as readonly string[]).includes(field);
  }

  /**
   * Validate an update payload - returns only allowed fields
   */
  static sanitizeUpdatePayload(
    payload: Partial<Job>,
    userRole: AppRole
  ): Partial<Job> {
    // Coordinators and managers can update any field
    if (userRole === 'coordinator' || userRole === 'manager') {
      return payload;
    }

    // Operators can only update allowed fields
    const sanitized: Partial<Job> = {};
    for (const [key, value] of Object.entries(payload)) {
      if (this.isFieldAllowed(key)) {
        (sanitized as Record<string, unknown>)[key] = value;
      }
    }
    return sanitized;
  }

  /**
   * Validate that an update payload only contains allowed fields
   */
  static validateOperatorPayload(payload: Partial<Job>): {
    valid: boolean;
    invalidFields: string[];
  } {
    const invalidFields: string[] = [];
    
    for (const key of Object.keys(payload)) {
      if (!this.isFieldAllowed(key)) {
        invalidFields.push(key);
      }
    }

    return {
      valid: invalidFields.length === 0,
      invalidFields,
    };
  }
}

describe('Operator Jobs Permissions', () => {
  // Test users
  let coordinator: User;
  let operator1: User;
  let operator2: User;
  let manager: User;

  // Machine assignments
  let machineAssignments: MachineAssignment[];

  // Sample jobs
  let jobOnMachine1: Job;
  let jobOnMachine2: Job;
  let jobWithoutMachine: Job;

  beforeEach(() => {
    // Setup users
    coordinator = { id: 'coord-1', role: 'coordinator' };
    operator1 = { id: 'op-1', role: 'operator' };
    operator2 = { id: 'op-2', role: 'operator' };
    manager = { id: 'mgr-1', role: 'manager' };

    // Setup machine assignments
    // Operator 1 is assigned to machine-1 and machine-2
    // Operator 2 is assigned to machine-3
    machineAssignments = [
      { operatorId: 'op-1', machineId: 'machine-1' },
      { operatorId: 'op-1', machineId: 'machine-2' },
      { operatorId: 'op-2', machineId: 'machine-3' },
    ];

    // Setup sample jobs
    jobOnMachine1 = {
      id: 'job-1',
      machine_id: 'machine-1',
      order_number: 'ORD-001',
      client: 'Client A',
      product: 'Product X',
      quantity: 100,
      technique_id: 'silk',
      status: 'production',
      priority: 'medium',
      scheduled_date: '2024-01-15',
      start_time: '08:00',
      end_time: '10:00',
      produced_quantity: null,
      lost_pieces: null,
      actual_start_time: null,
      actual_end_time: null,
      notes: 'Test job',
    };

    jobOnMachine2 = {
      ...jobOnMachine1,
      id: 'job-2',
      machine_id: 'machine-2',
      order_number: 'ORD-002',
    };

    jobWithoutMachine = {
      ...jobOnMachine1,
      id: 'job-3',
      machine_id: null,
      order_number: 'ORD-003',
    };
  });

  describe('RLS Policy - Machine Assignment Validation', () => {
    it('should allow operator to update jobs on their assigned machines', () => {
      const evaluator = new OperatorJobsRLSEvaluator(operator1, machineAssignments);
      
      // Operator 1 can update jobs on machine-1 and machine-2
      expect(evaluator.canUpdateJob(jobOnMachine1)).toBe(true);
      expect(evaluator.canUpdateJob(jobOnMachine2)).toBe(true);
    });

    it('should deny operator from updating jobs on unassigned machines', () => {
      const evaluator = new OperatorJobsRLSEvaluator(operator1, machineAssignments);
      
      // Job on machine-3 (assigned to operator2, not operator1)
      const jobOnMachine3: Job = {
        ...jobOnMachine1,
        id: 'job-4',
        machine_id: 'machine-3',
      };
      
      expect(evaluator.canUpdateJob(jobOnMachine3)).toBe(false);
    });

    it('should deny operator from updating jobs without machine assignment', () => {
      const evaluator = new OperatorJobsRLSEvaluator(operator1, machineAssignments);
      
      expect(evaluator.canUpdateJob(jobWithoutMachine)).toBe(false);
    });

    it('should allow different operators to update only their assigned jobs', () => {
      const evaluator1 = new OperatorJobsRLSEvaluator(operator1, machineAssignments);
      const evaluator2 = new OperatorJobsRLSEvaluator(operator2, machineAssignments);

      const jobOnMachine3: Job = {
        ...jobOnMachine1,
        id: 'job-4',
        machine_id: 'machine-3',
      };

      // Operator 1 can update machine-1, machine-2
      expect(evaluator1.canUpdateJob(jobOnMachine1)).toBe(true);
      expect(evaluator1.canUpdateJob(jobOnMachine2)).toBe(true);
      expect(evaluator1.canUpdateJob(jobOnMachine3)).toBe(false);

      // Operator 2 can only update machine-3
      expect(evaluator2.canUpdateJob(jobOnMachine1)).toBe(false);
      expect(evaluator2.canUpdateJob(jobOnMachine2)).toBe(false);
      expect(evaluator2.canUpdateJob(jobOnMachine3)).toBe(true);
    });

    it('should deny unauthenticated users from updating any jobs', () => {
      const evaluator = new OperatorJobsRLSEvaluator(null, machineAssignments);
      
      expect(evaluator.canUpdateJob(jobOnMachine1)).toBe(false);
      expect(evaluator.canUpdateJob(jobOnMachine2)).toBe(false);
      expect(evaluator.canUpdateJob(jobWithoutMachine)).toBe(false);
    });

    it('should allow coordinator to update any job', () => {
      const evaluator = new OperatorJobsRLSEvaluator(coordinator, machineAssignments);
      
      expect(evaluator.canUpdateJob(jobOnMachine1)).toBe(true);
      expect(evaluator.canUpdateJob(jobOnMachine2)).toBe(true);
      expect(evaluator.canUpdateJob(jobWithoutMachine)).toBe(true);
    });

    it('should allow manager to update any job', () => {
      const evaluator = new OperatorJobsRLSEvaluator(manager, machineAssignments);
      
      expect(evaluator.canUpdateJob(jobOnMachine1)).toBe(true);
      expect(evaluator.canUpdateJob(jobOnMachine2)).toBe(true);
      expect(evaluator.canUpdateJob(jobWithoutMachine)).toBe(true);
    });

    it('should correctly list assigned machines for an operator', () => {
      const evaluator1 = new OperatorJobsRLSEvaluator(operator1, machineAssignments);
      const evaluator2 = new OperatorJobsRLSEvaluator(operator2, machineAssignments);

      expect(evaluator1.getAssignedMachines()).toEqual(['machine-1', 'machine-2']);
      expect(evaluator2.getAssignedMachines()).toEqual(['machine-3']);
    });

    it('should handle operator with no machine assignments', () => {
      const operatorNoMachines: User = { id: 'op-no-machines', role: 'operator' };
      const evaluator = new OperatorJobsRLSEvaluator(operatorNoMachines, machineAssignments);

      expect(evaluator.canUpdateJob(jobOnMachine1)).toBe(false);
      expect(evaluator.getAssignedMachines()).toEqual([]);
    });
  });

  describe('Field Validation - Allowed Fields', () => {
    it('should identify production registration fields as allowed', () => {
      expect(OperatorFieldValidator.isFieldAllowed('produced_quantity')).toBe(true);
      expect(OperatorFieldValidator.isFieldAllowed('lost_pieces')).toBe(true);
      expect(OperatorFieldValidator.isFieldAllowed('actual_start_time')).toBe(true);
      expect(OperatorFieldValidator.isFieldAllowed('actual_end_time')).toBe(true);
    });

    it('should identify scheduling fields as restricted', () => {
      expect(OperatorFieldValidator.isFieldRestricted('scheduled_date')).toBe(true);
      expect(OperatorFieldValidator.isFieldRestricted('start_time')).toBe(true);
      expect(OperatorFieldValidator.isFieldRestricted('end_time')).toBe(true);
      expect(OperatorFieldValidator.isFieldRestricted('machine_id')).toBe(true);
    });

    it('should identify job metadata fields as restricted', () => {
      expect(OperatorFieldValidator.isFieldRestricted('order_number')).toBe(true);
      expect(OperatorFieldValidator.isFieldRestricted('client')).toBe(true);
      expect(OperatorFieldValidator.isFieldRestricted('product')).toBe(true);
      expect(OperatorFieldValidator.isFieldRestricted('quantity')).toBe(true);
      expect(OperatorFieldValidator.isFieldRestricted('technique_id')).toBe(true);
    });

    it('should identify status and priority as restricted', () => {
      expect(OperatorFieldValidator.isFieldRestricted('status')).toBe(true);
      expect(OperatorFieldValidator.isFieldRestricted('priority')).toBe(true);
    });
  });

  describe('Field Validation - Payload Sanitization', () => {
    it('should sanitize operator payload to only allowed fields', () => {
      const payload: Partial<Job> = {
        produced_quantity: 95,
        lost_pieces: 5,
        actual_start_time: '2024-01-15T08:00:00Z',
        actual_end_time: '2024-01-15T10:30:00Z',
        status: 'finished', // Should be removed
        priority: 'high', // Should be removed
      };

      const sanitized = OperatorFieldValidator.sanitizeUpdatePayload(payload, 'operator');

      expect(sanitized).toEqual({
        produced_quantity: 95,
        lost_pieces: 5,
        actual_start_time: '2024-01-15T08:00:00Z',
        actual_end_time: '2024-01-15T10:30:00Z',
      });
      expect(sanitized).not.toHaveProperty('status');
      expect(sanitized).not.toHaveProperty('priority');
    });

    it('should allow coordinator to update any fields', () => {
      const payload: Partial<Job> = {
        produced_quantity: 95,
        status: 'finished',
        priority: 'high',
        scheduled_date: '2024-01-20',
        machine_id: 'new-machine',
      };

      const sanitized = OperatorFieldValidator.sanitizeUpdatePayload(payload, 'coordinator');

      expect(sanitized).toEqual(payload);
    });

    it('should allow manager to update any fields', () => {
      const payload: Partial<Job> = {
        produced_quantity: 95,
        status: 'finished',
        client: 'New Client',
      };

      const sanitized = OperatorFieldValidator.sanitizeUpdatePayload(payload, 'manager');

      expect(sanitized).toEqual(payload);
    });

    it('should return empty object if operator tries to update only restricted fields', () => {
      const payload: Partial<Job> = {
        status: 'finished',
        priority: 'high',
        client: 'Hacked Client',
      };

      const sanitized = OperatorFieldValidator.sanitizeUpdatePayload(payload, 'operator');

      expect(sanitized).toEqual({});
    });
  });

  describe('Field Validation - Payload Validation', () => {
    it('should validate operator payload with only allowed fields', () => {
      const validPayload: Partial<Job> = {
        produced_quantity: 95,
        lost_pieces: 5,
        actual_start_time: '2024-01-15T08:00:00Z',
        actual_end_time: '2024-01-15T10:30:00Z',
      };

      const result = OperatorFieldValidator.validateOperatorPayload(validPayload);

      expect(result.valid).toBe(true);
      expect(result.invalidFields).toEqual([]);
    });

    it('should detect invalid fields in operator payload', () => {
      const invalidPayload: Partial<Job> = {
        produced_quantity: 95,
        status: 'finished', // Invalid
        client: 'Hacked', // Invalid
        machine_id: 'hacked-machine', // Invalid
      };

      const result = OperatorFieldValidator.validateOperatorPayload(invalidPayload);

      expect(result.valid).toBe(false);
      expect(result.invalidFields).toContain('status');
      expect(result.invalidFields).toContain('client');
      expect(result.invalidFields).toContain('machine_id');
      expect(result.invalidFields).not.toContain('produced_quantity');
    });

    it('should validate partial updates with allowed fields', () => {
      // Only updating produced_quantity
      const partialPayload1: Partial<Job> = { produced_quantity: 50 };
      expect(OperatorFieldValidator.validateOperatorPayload(partialPayload1).valid).toBe(true);

      // Only updating lost_pieces
      const partialPayload2: Partial<Job> = { lost_pieces: 3 };
      expect(OperatorFieldValidator.validateOperatorPayload(partialPayload2).valid).toBe(true);

      // Only updating actual_start_time
      const partialPayload3: Partial<Job> = { actual_start_time: '2024-01-15T08:00:00Z' };
      expect(OperatorFieldValidator.validateOperatorPayload(partialPayload3).valid).toBe(true);
    });
  });

  describe('Combined RLS + Field Validation', () => {
    it('should allow operator to register production on assigned machine', () => {
      const evaluator = new OperatorJobsRLSEvaluator(operator1, machineAssignments);
      
      const productionUpdate: Partial<Job> = {
        produced_quantity: 95,
        lost_pieces: 5,
        actual_start_time: '2024-01-15T08:00:00Z',
        actual_end_time: '2024-01-15T10:30:00Z',
      };

      // RLS check passes
      expect(evaluator.canUpdateJob(jobOnMachine1)).toBe(true);
      
      // Field validation passes
      const fieldValidation = OperatorFieldValidator.validateOperatorPayload(productionUpdate);
      expect(fieldValidation.valid).toBe(true);
    });

    it('should block operator from updating job on unassigned machine even with valid fields', () => {
      const evaluator = new OperatorJobsRLSEvaluator(operator1, machineAssignments);
      
      const jobOnMachine3: Job = {
        ...jobOnMachine1,
        machine_id: 'machine-3', // Assigned to operator2
      };

      const productionUpdate: Partial<Job> = {
        produced_quantity: 95,
        lost_pieces: 5,
      };

      // RLS check fails (machine not assigned)
      expect(evaluator.canUpdateJob(jobOnMachine3)).toBe(false);
      
      // Field validation passes (but RLS would block)
      const fieldValidation = OperatorFieldValidator.validateOperatorPayload(productionUpdate);
      expect(fieldValidation.valid).toBe(true);
    });

    it('should block operator from updating restricted fields even on assigned machine', () => {
      const evaluator = new OperatorJobsRLSEvaluator(operator1, machineAssignments);
      
      const maliciousUpdate: Partial<Job> = {
        produced_quantity: 95,
        status: 'finished', // Not allowed for operator
        machine_id: 'other-machine', // Not allowed for operator
      };

      // RLS check passes (machine is assigned)
      expect(evaluator.canUpdateJob(jobOnMachine1)).toBe(true);
      
      // Field validation fails
      const fieldValidation = OperatorFieldValidator.validateOperatorPayload(maliciousUpdate);
      expect(fieldValidation.valid).toBe(false);
      expect(fieldValidation.invalidFields).toContain('status');
      expect(fieldValidation.invalidFields).toContain('machine_id');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty update payload', () => {
      const emptyPayload: Partial<Job> = {};
      
      const result = OperatorFieldValidator.validateOperatorPayload(emptyPayload);
      expect(result.valid).toBe(true);
      expect(result.invalidFields).toEqual([]);
    });

    it('should handle null values in allowed fields', () => {
      const payloadWithNulls: Partial<Job> = {
        produced_quantity: null,
        lost_pieces: null,
        actual_start_time: null,
        actual_end_time: null,
      };

      const result = OperatorFieldValidator.validateOperatorPayload(payloadWithNulls);
      expect(result.valid).toBe(true);
    });

    it('should handle zero values in production fields', () => {
      const payloadWithZeros: Partial<Job> = {
        produced_quantity: 0,
        lost_pieces: 0,
      };

      const result = OperatorFieldValidator.validateOperatorPayload(payloadWithZeros);
      expect(result.valid).toBe(true);
      
      const sanitized = OperatorFieldValidator.sanitizeUpdatePayload(payloadWithZeros, 'operator');
      expect(sanitized.produced_quantity).toBe(0);
      expect(sanitized.lost_pieces).toBe(0);
    });

    it('should handle machine assignment changes', () => {
      // Initial state: operator1 has machine-1
      let currentAssignments: MachineAssignment[] = [
        { operatorId: 'op-1', machineId: 'machine-1' },
      ];

      let evaluator = new OperatorJobsRLSEvaluator(operator1, currentAssignments);
      expect(evaluator.canUpdateJob(jobOnMachine1)).toBe(true);
      expect(evaluator.canUpdateJob(jobOnMachine2)).toBe(false);

      // Assignment changed: machine-1 removed, machine-2 added
      currentAssignments = [
        { operatorId: 'op-1', machineId: 'machine-2' },
      ];

      evaluator = new OperatorJobsRLSEvaluator(operator1, currentAssignments);
      expect(evaluator.canUpdateJob(jobOnMachine1)).toBe(false);
      expect(evaluator.canUpdateJob(jobOnMachine2)).toBe(true);
    });
  });
});
