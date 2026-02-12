
export interface Patient {
  id: string;
  full_name: string;
  age: number;
  phone: string;
  created_at?: string;
}

export interface Encounter {
  id: string;
  patient_id: string;
  token: string;
  status: 'active' | 'completed';
  created_at: string;
  patient?: Patient;
  doctor_id?: string;
  department?: string;
}

export interface Task {
  id: string;
  encounter_id: string;
  type: string;
  title: string;
  assigned_to: string;
  status: string;
  created_at: string;
  encounter?: Encounter;
  task_updates?: TaskUpdate[];
}

export interface TaskUpdate {
  id: string;
  task_id: string;
  message: string;
  updated_by: string;
  status: string;
  created_at: string;
  task?: Task;
}
