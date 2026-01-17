"use client";

import { useState, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical } from "lucide-react";
import { createTaskAction, getTasksAction } from "@/app/actions/tasks";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface Task {
    id: string;
    title: string;
    estimatedDuration: number | null;
}

function DraggableTask({ task }: { task: Task }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: { type: 'task', task }
    });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="flex items-center gap-2 p-3 bg-card border rounded-md hover:bg-accent cursor-grab active:cursor-grabbing touch-none select-none"
        >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
                <div className="font-medium text-sm">{task.title}</div>
                <div className="text-xs text-muted-foreground">{task.estimatedDuration || 30} min</div>
            </div>
        </div>
    );
}

export function TaskSidebar() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.user?.id) {
            loadTasks();
        }
    }, [session]);

    const loadTasks = async () => {
        if (!session?.user?.id) return;

        const result = await getTasksAction(session.user.id);
        if (result.success && result.tasks) {
            setTasks(result.tasks as Task[]);
        }
    };

    const handleAddTask = async () => {
        if (!newTaskTitle.trim() || !session?.user?.id) return;

        const result = await createTaskAction(session.user.id, newTaskTitle);
        if (result.success) {
            toast.success("Task added");
            setNewTaskTitle("");
            loadTasks();
        } else {
            toast.error(result.error || "Failed to add task");
        }
    };

    if (!session) {
        return (
            <div className="w-80 border-l bg-muted/5 p-4 flex flex-col gap-4">
                <div className="text-center text-sm text-muted-foreground py-8">
                    Sign in to manage tasks
                </div>
            </div>
        );
    }

    return (
        <div className="w-80 border-l bg-muted/5 p-4 flex flex-col gap-4">
            <div>
                <h3 className="font-semibold text-lg mb-2">Tasks</h3>
                <p className="text-xs text-muted-foreground mb-4">
                    Drag tasks to your calendar to schedule them
                </p>
            </div>

            <div className="flex gap-2">
                <Input
                    placeholder="Add new task..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                />
                <Button size="icon" onClick={handleAddTask}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex-1 overflow-auto space-y-2">
                {tasks.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-8">
                        No tasks yet. Add one above!
                    </div>
                ) : (
                    tasks.map((task) => (
                        <DraggableTask key={task.id} task={task} />
                    ))
                )}
            </div>
        </div>
    );
}
