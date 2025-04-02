export interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export enum StatusEnum {
  TODO = "TODO",
  PROGRESS = "PROGRESS",
  COMPLETED = "COMPLETED",
}

export interface Task {
  _id: string;
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

export interface TaskFormProps {
  task?: Task;
  onSubmit: (task: Task) => void;
  onCancel: () => void;
}

export interface TaskItemProps {
  task: Task;
}
