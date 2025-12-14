// Mock data for testing

export const mockTechniques = [
  { id: 'fiber-laser', name: 'Fiber Laser', short_name: 'FL', color: '#22c55e', setup_time: 5, created_at: new Date().toISOString() },
  { id: 'silk-textile', name: 'Silk Têxtil', short_name: 'ST', color: '#f97316', setup_time: 20, created_at: new Date().toISOString() },
  { id: 'tampo', name: 'Tampografia', short_name: 'TP', color: '#8b5cf6', setup_time: 15, created_at: new Date().toISOString() },
];

export const mockMachines = [
  { id: 'machine-1', code: 'FL-01', name: 'Fiber Laser 01', technique_id: 'fiber-laser', is_active: true, created_at: new Date().toISOString() },
  { id: 'machine-2', code: 'FL-02', name: 'Fiber Laser 02', technique_id: 'fiber-laser', is_active: true, created_at: new Date().toISOString() },
  { id: 'machine-3', code: 'ST-01', name: 'Silk Têxtil 01', technique_id: 'silk-textile', is_active: true, created_at: new Date().toISOString() },
];

export const mockJobs = [
  {
    id: 'job-1',
    order_number: 'OS-001',
    client: 'Cliente A',
    product: 'Caneta Executiva',
    quantity: 500,
    technique_id: 'fiber-laser',
    machine_id: 'machine-1',
    scheduled_date: new Date().toISOString().split('T')[0],
    start_time: '08:00',
    end_time: '10:00',
    estimated_duration: 120,
    status: 'scheduled',
    priority: 'medium',
    gravure_color: null,
    notes: null,
    actual_start_time: null,
    actual_end_time: null,
    lost_pieces: 0,
    produced_quantity: 0,
    production_photos: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'job-2',
    order_number: 'OS-002',
    client: 'Cliente B',
    product: 'Camiseta Algodão',
    quantity: 100,
    technique_id: 'silk-textile',
    machine_id: 'machine-3',
    scheduled_date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '11:00',
    estimated_duration: 120,
    status: 'production',
    priority: 'high',
    gravure_color: 'Azul Royal',
    notes: 'Cliente VIP',
    actual_start_time: new Date().toISOString(),
    actual_end_time: null,
    lost_pieces: 0,
    produced_quantity: 50,
    production_photos: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockProfiles = [
  { id: 'user-1', full_name: 'João Silva', avatar_url: null, phone: '11999999999', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'user-2', full_name: 'Maria Santos', avatar_url: null, phone: '11888888888', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export const mockUserRoles = [
  { id: 'role-1', user_id: 'user-1', role: 'coordinator' as const, is_active: true, created_at: new Date().toISOString() },
  { id: 'role-2', user_id: 'user-2', role: 'operator' as const, is_active: true, created_at: new Date().toISOString() },
];

export const mockOperatorGoals = [
  {
    id: 'goal-1',
    operator_id: 'user-2',
    goal_type: 'jobs_completed',
    target_value: 50,
    period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
    created_by: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockScanHistory = [
  {
    id: 'scan-1',
    job_id: 'job-1',
    operator_id: 'user-2',
    action: 'start',
    scanned_at: new Date().toISOString(),
    device_info: 'Chrome Mobile',
    notes: null,
  },
];
