export type User = {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  is_staff: boolean
  date_joined: string
}
export type RecordStatus = 'draft' | 'active' | 'archived'
export type RecordItem = {
  id: number
  title: string
  category: string
  status: RecordStatus
  notes: string
  created_at: string
  updated_at: string
}
export type RecordInput = Pick<RecordItem, 'title' | 'category' | 'status' | 'notes'>
export type ActivityItem = { id: number; verb: string; target: string; created_at: string }
export type Page<T> = { count: number; next: string | null; previous: string | null; results: T[] }
export type Dashboard = {
  total: number
  active: number
  draft: number
  archived: number
  activity: ActivityItem[]
}
