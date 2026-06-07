/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MigrationObject {
  id: number;
  stream: string;
  object_type: string;
  data_object: string;
  dependency: string;
  comment: string;
  data_load_responsible: string;
  functional_responsible: string;
  coe_responsible: string;
  success_rate: number;
  status: string;
  overall_progress: number;
  extract_progress: number;
  extract_date: string;
  preload_progress: number;
  preload_date: string;
  preload_reviewed_by: string;
  load_progress: number;
  load_date: string;
  loaded_by: string;
  postload_progress: number;
  postload_date: string;
  postload_reviewed_by: string;
  records_to_load: number;
  records_loaded: number;
  errors: number;
}

export interface DashboardStats {
  total_objects: number;
  completed_objects: number;
  wip_objects: number;
  open_objects: number;
  total_records_to_load: number;
  total_records_loaded: number;
  total_errors: number;
  load_completion_pct: number;
  error_rate_pct: number;
  average_progress: number;
}
