import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useFetch } from "../hooks/useFetch";

const baseUrl = "https://d3ujwk09smrk9z.cloudfront.net";
const tasksUrl = `${baseUrl}/tasks`;
const tasksPerPage = 4;

interface Task {
  id: number | string;
  title?: string;
  description?: string;
  status?: string;
  projectId?: number | string;
  [key: string]: any;
}

function TasksPage() {
  // Token de autorización por si la API lo requiere (Bearer Token)
  const [token, setToken] = useState<string>("");
  
  const { data: fetchedTasks, loading, error } = useFetch<Task[]>(tasksUrl);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  // Estados para el formulario POST (Crear tarea bajo un proyecto)
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [projectId, setProjectId] = useState("1"); // ID de proyecto por defecto para el POST

  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const getHeaders = () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token.trim()) {
      headers["Authorization"] = `Bearer ${token.trim()}`;
    }
    return headers;
  };

  // 1. GET /tasks/{id} (Obtiene una tarea por id de forma individual)
  const handleGetById = async (id: number | string) => {
    try {
      const response = await fetch(`${tasksUrl}/${id}`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("Error al obtener la tarea");
      const taskData = await response.json();
      alert(`Información obtenida (GET ID):\nTítulo: ${taskData.title || taskData.name || JSON.stringify(taskData)}`);
    } catch (err) {
      console.error(err);
      alert("No se pudo obtener la tarea por ID (Verifica permisos o token)");
    }
  };

  // 2. POST /projects/{projectId}/tasks (Crea una tarea dentro de un proyecto)
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert("Escribe un título para la tarea");
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/projects/${projectId}/tasks`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          status: "PENDING",
        }),
      });
      if (!response.ok) throw new Error("Error al crear la tarea");
      const createdTask = await response.json();

      setTasks((prev) => [createdTask, ...prev]);
      setNewTitle("");
      setNewDesc("");
      alert("Tarea creada con éxito bajo el proyecto (POST)");
    } catch (err) {
      console.error(err);
      alert("No se pudo crear la tarea (Verifica el ID del proyecto y token)");
    }
  };

  // 3. PUT /tasks/{id} (Reemplaza una tarea por completo)
  const handleUpdatePut = async (taskToUpdate: Task) => {
    try {
      const completeData = {
        ...taskToUpdate,
        title: taskToUpdate.title ? `${taskToUpdate.title} (Reemplazada PUT)` : "Tarea Reemplazada",
        description: "Actualización completa vía PUT",
      };

      const response = await fetch(`${tasksUrl}/${taskToUpdate.id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(completeData),
      });
      if (!response.ok) throw new Error("Error al reemplazar la tarea");
      const updatedTask = await response.json();

      setTasks((prev) =>
        prev.map((t) => (t.id === taskToUpdate.id ? { ...t, ...completeData, ...updatedTask } : t))
      );
      alert("Tarea reemplazada por completo (PUT)");
    } catch (err) {
      console.error(err);
      alert("No se pudo reemplazar la tarea (PUT)");
    }
  };

  // 4. PATCH /tasks/{id}/status (Cambia el estado de una tarea)
  const handleUpdatePatchStatus = async (id: number | string) => {
    try {
      const response = await fetch(`${tasksUrl}/${id}/status`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (!response.ok) throw new Error("Error al cambiar estado");
      const updatedTask = await response.json();

      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updatedTask, status: "COMPLETED" } : t))
      );
      alert("Estado de tarea cambiado a COMPLETED (PATCH)");
    } catch (err) {
      console.error(err);
      alert("No se pudo cambiar el estado (PATCH)");
    }
  };

  // 5. DELETE /tasks/{id} (Borra una tarea)
  const handleDelete = async (id: number | string) => {
    try {
      const response = await fetch(`${tasksUrl}/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("Error al eliminar la tarea");
      
      setTasks((prev) => prev.filter((t) => t.id !== id));
      alert("Tarea borrada correctamente (DELETE)");
    } catch (err) {
      console.error(err);
      alert("No se pudo borrar la tarea");
    }
  };

  if (loading) {
    return (
      <Stack sx={{ alignItems: "center", padding: 5 }}>
        <CircularProgress aria-label="Cargando tareas" />
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const normalizedSearch = debouncedSearch.trim().toLocaleLowerCase();
  const filteredTasks = tasks.filter((task) => {
    const title = task.title || task.name || "";
    const desc = task.description || "";
    const searchableText = `${title} ${desc}`.toLocaleLowerCase();
    return searchableText.includes(normalizedSearch);
  });

  const pageCount = Math.ceil(filteredTasks.length / tasksPerPage);
  const startIndex = (page - 1) * tasksPerPage;
  const visibleTasks = filteredTasks.slice(startIndex, startIndex + tasksPerPage);

  return (
    <Stack spacing={3}>
      <Typography variant="h3" component="h1">Gestión de Tareas (Swagger)</Typography>

      {/* Input opcional para el Token si la API requiere autenticación */}
      <TextField
        label="Token de Autenticación (Bearer Token opcional si da error 401)"
        size="small"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />

      {/* Formulario POST para crear tarea bajo un proyecto */}
      <Box component="form" onSubmit={handleCreatePost} sx={{ p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>Crear Tarea en Proyecto (POST)</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="ID de Proyecto"
            size="small"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            sx={{ width: { sm: "150px" } }}
          />
          <TextField
            label="Título de la tarea"
            size="small"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            fullWidth
          />
          <TextField
            label="Descripción"
            size="small"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            fullWidth
          />
          <Button type="submit" variant="contained" startIcon={<AddIcon />}>
            Crear
          </Button>
        </Stack>
      </Box>

      {/* Barra de búsqueda */}
      <TextField
        label="Buscar tarea por título o descripción"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start"><SearchIcon /></InputAdornment>
            ),
          },
        }}
      />

      {/* Listado de tareas */}
      {filteredTasks.length === 0 ? (
        <Alert severity="info">No hay tareas disponibles o no coinciden con la búsqueda.</Alert>
      ) : (
        <>
          <Stack spacing={2}>
            {visibleTasks.map((task) => (
              <Card key={task.id} variant="outlined">
                <CardContent>
                  <Typography variant="h6">{task.title || task.name || "Sin título"}</Typography>
                  <Typography color="text.secondary">{task.description || "Sin descripción"}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>Estado: <strong>{task.status || "PENDING"}</strong> | ID: {task.id}</Typography>
                  
                  {/* Botones para GET ID, PATCH, PUT y DELETE */}
                  <Stack direction="row" spacing={1.5} sx={{ mt: 2, flexWrap: "wrap" }}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      color="info" 
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleGetById(task.id)}
                    >
                      GET ID
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      color="primary" 
                      startIcon={<EditIcon />}
                      onClick={() => handleUpdatePatchStatus(task.id)}
                    >
                      Estado (PATCH)
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      color="secondary" 
                      startIcon={<EditIcon />}
                      onClick={() => handleUpdatePut(task)}
                    >
                      Reemplazar (PUT)
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      color="error" 
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(task.id)}
                    >
                      Borrar (DELETE)
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
          {pageCount > 1 && (
            <Pagination count={pageCount} page={page} onChange={(_e, p) => setPage(p)} color="primary" />
          )}
        </>
      )}
    </Stack>
  );
}

export default TasksPage;