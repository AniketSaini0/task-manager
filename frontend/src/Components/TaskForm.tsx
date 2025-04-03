import { useState } from "react";
import { Task, TaskFormProps, StatusEnum } from "../types/index";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/store";
import { addTask, editTask } from "../redux/slices/task.slice";

export default function TaskForm({ task, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [dueDate, setDueDate] = useState(task?.dueDate || "");
  const [taskStatus, setStatus] = useState<StatusEnum>(
    task?.status || StatusEnum.TODO
  );

  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (task) {
        // If editing, include `_id`
        // const updatedTask: Task = {
        //   _id: task._id, // Ensure `_id` is passed
        //   title,
        //   description,
        //   dueDate,
        //   status: taskStatus,
        //   isCompleted: taskStatus === StatusEnum.COMPLETED,
        // };
        const updatedFields: Partial<Task> = {};
        updatedFields._id = task._id;
        if (title !== task.title) updatedFields.title = title;
        if (description !== task.description)
          updatedFields.description = description;
        if (dueDate !== task.dueDate) updatedFields.dueDate = dueDate;
        if (taskStatus !== task.status) updatedFields.status = taskStatus;
        updatedFields.isCompleted = taskStatus === StatusEnum.COMPLETED;
        console.log("This is updated fields ", updatedFields);
        // If task exists, we are editing
        await dispatch(editTask(updatedFields)).unwrap();
        toast.success("Task Updated!");
      } else {
        // If adding a new task, omit `_id`
        const newTask: Omit<Task, "_id"> = {
          title,
          description,
          dueDate,
          status: taskStatus,
          isCompleted: taskStatus === StatusEnum.COMPLETED,
        };

        const response = await dispatch(addTask(newTask)).unwrap(); // 🚀 Get `taskId` from backend
        toast.success("Task Created!");

        console.log("Created Task:", response); // Debugging: Ensure the `id` is coming from backend
      }
    } catch (error) {
      console.error("Task creation error:", error);
      toast.error("Failed to create task!");
    }

    onCancel(); // Close the form after submission
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-bold mb-4">
        {task ? "Edit Task" : "Add Task"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Due Date
          </label>
          <input
            id="description"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Task Status
          </label>
          <select
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            onChange={(e) => setStatus(e.target.value as StatusEnum)}
            defaultValue={taskStatus}
          >
            {/* <option defaultValue={taskStatus}>{taskStatus}</option> */}
            <option value={StatusEnum.TODO}>TODO</option>
            <option value={StatusEnum.PROGRESS}>PROGRESS</option>
            <option value={StatusEnum.COMPLETED}>COMPLETED</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {task ? "Save Changes" : "Add Task"}
          </button>
        </div>
      </form>
    </div>
  );
}
