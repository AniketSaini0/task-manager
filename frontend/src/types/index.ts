export interface ValidationErrors {
  email?: string; // Optional property
  password?: string; // Optional property
  confirmPassword?: string; // Optional property
}

export enum StatusEnum {
  TODO = "TODO",
  PROGRESS = "PROGRESS",
  COMPLETED = "COMPLETED",
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: StatusEnum;
  isCompleted: boolean;
}

export interface LoginProps {
  onLogin: (email: string) => void;
}

export interface RegisterProps {
  username?: string;
  email?: string;
  password?: string;
}

export interface TaskDashboardProps {
  tasks: Task[];
  onLoadTasks: (task: Task[]) => void;
  onAddTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTaskCompletion: (taskId: string) => void;
  onLogout: () => void;
  userEmail: string;
}

export interface TaskFormProps {
  task?: Task;
  onAddTask?: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onCancel: () => void;
  reloadTasks?: () => void;
}

export interface TaskItemProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onToggleCompletion: () => void;
  reloadTasks: () => void;
}
