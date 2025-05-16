interface Task {
  id: number;
  title: string;
}

interface CreateTaskRequest {
  title: string;
}

let tasks: Task[] = [
  { id: 1, title: "first" },
  { id: 2, title: "second" },
];

export async function GET() {
  return Response.json(tasks);
}

export async function POST(request: Request) {
  try {
    const body: CreateTaskRequest = await request.json();

    if (!body.title) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    const newTask: Task = {
      id: tasks.length + 1,
      title: body.title,
    };

    tasks.push(newTask);

    return Response.json(newTask, { status: 201 });
  } catch (error) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
}
