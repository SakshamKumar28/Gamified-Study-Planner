import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import {
  fetchTasks,
  addTask,
  deleteTask,
  completeTask,
  reorderTasks,
} from "@/redux/taskSlice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarIcon,
  FlagIcon,
  CheckCircle2,
  Trash2,
  GripVertical,
  StarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const priorityColors: Record<string, string> = {
  High: "text-red-500",
  Medium: "text-yellow-500",
  Low: "text-green-500",
};

interface Task {
  _id: string;
  title: string;
  dueDate?: string;
  priority?: "High" | "Medium" | "Low";
  isCompleted: boolean;
  order?: number;
}

const SortableTask = ({ task, children }: { task: Task; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </li>
  );
};

const XPCard = ({ xp }: { xp: number }) => (
  <Card className="mb-6 p-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-bold">🌟 XP</h3>
        <p className="text-2xl font-semibold">{xp} XP</p>
      </div>
      <StarIcon className="w-10 h-10 text-yellow-300" />
    </div>
  </Card>
);

const Tasks = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, isLoading } = useSelector((state: RootState) => state.tasks);
  const user = useSelector((state: RootState) => state.auth.user);
  const [taskTitle, setTaskTitle] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleAddTask = () => {
    if (taskTitle.trim()) {
      const dueDate = new Date();
      const xp = Math.floor(Math.random() * 20) + 1;
      dueDate.setDate(dueDate.getDate() + 1);
      dispatch(
        addTask({
          title: taskTitle,
          xp,
          dueDate: dueDate.toISOString(),
          priority: "Medium",
        })
      );
      setTaskTitle("");
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t._id === active.id);
    const newIndex = tasks.findIndex((t) => t._id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(tasks, oldIndex, newIndex);
      dispatch(reorderTasks(reordered.map((task, index) => ({ ...task, order: index }))));
    }
  };

  const filteredTasks = tasks.filter((t) =>
    filter === "completed" ? t.isCompleted : filter === "pending" ? !t.isCompleted : true
  );

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;
  const progressValue = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="p-4 min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">
      <h2 className="text-3xl font-bold mb-2">📚 Your Tasks</h2>

      {user && <XPCard xp={user?.xp ?? 0} />}

      <Progress value={progressValue} className="h-2 mb-2" />
      <p className="text-sm text-muted-foreground mb-4">
        {completedCount} of {totalCount} tasks completed
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
        <Input
          placeholder="New Task"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          className="w-full sm:w-auto"
        />
        <Button onClick={handleAddTask}>➕ Add</Button>
      </div>

      <Tabs defaultValue="all" onValueChange={setFilter} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <p>Loading tasks...</p>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredTasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
            <AnimatePresence>
              <ul className="grid gap-2">
                {filteredTasks.map((task) => (
                  <SortableTask key={task._id} task={task}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card
                        className={`p-3 flex items-center justify-between ${
                          task.isCompleted ? "opacity-50 line-through" : ""
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="w-4 h-4 mt-1 cursor-grab" />
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium block">{task.title}</span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {task.dueDate && (
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="w-3 h-3" />
                                  {format(new Date(task.dueDate), "MMM d, yyyy")}
                                </span>
                              )}
                              {task.priority && (
                                <span className={`flex items-center gap-1 ${priorityColors[task.priority]}`}>
                                  <FlagIcon className="w-3 h-3" />
                                  {task.priority}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!task.isCompleted && (
                            <Button variant="ghost" onClick={() => dispatch(completeTask(task._id))}>
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" onClick={() => dispatch(deleteTask(task._id))}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  </SortableTask>
                ))}
              </ul>
            </AnimatePresence>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default Tasks;
