// src/pages/UsersPage.tsx
import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LockIcon from "@mui/icons-material/Lock";
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

function UsersPage() {
  const [token, setToken] = useState<string>(
    localStorage.getItem("jwt_token") ||
      "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhbmEiLCJyb2xlIjoiUk9MRV9VU0VSIiwiaWF0IjoxNzg4NDcwODIxLCJleHAiOjE3ODg0NzQ0MjF9.V3BURwF0T9HashnAYve_5hFoSr2gmjEL9ByHHZF2Rj9zwt473WqKTAsk7uHVLduXIAJ3nNHRdjtKal8z4x_29w"
  );
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [projectId, setProjectId] = useState("1");

  const getHeaders = () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token.trim()) {
      headers["Authorization"] = `Bearer ${token.trim()}`;
    }
    return headers;
  };

  const fetchTasks = async () => {
    if (!token.trim()) {
      setTasks([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(tasksUrl, { headers: getHeaders() });
      if (response.status === 401) {
        throw new Error("Token inválido o expirado (401 Unauthorized)");
      }
      if (!response.ok) throw new Error("Error al cargar las tareas");
      const data = await response.json();
      setTasks(data);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToken = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("jwt_token", newToken);
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleGetById = async (id: number | string) => {
    try {
      const response = await fetch(`${tasksUrl}/${id}`, { headers: getHeaders() });
      if (!response.ok) throw new Error("Error al obtener la tarea");
      const taskData = await response.json();
      alert(`Información (GET ID):\n${JSON.stringify(taskData, null, 2)}`);
    } catch (err) {
      console.error(err);
      alert("No se pudo obtener la tarea por ID");
    }
  };

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
      alert("Tarea creada con éxito (POST)");
    } catch (err) {
      console.error(err);
      alert("No se pudo crear la tarea");
    }
  };

  const handleUpdatePut = async (taskToUpdate: Task) => {
    try {
      const completeData = {
        ...taskToUpdate,
        title: taskToUpdate.title ? `${taskToUpdate.title} (Actualizada)` : "Tarea Actualizada",
        description: "Modificada mediante PUT completo",
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
      alert("No se pudo reemplazar la tarea");
    }
  };

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
      alert("Estado cambiado a COMPLETED (PATCH)");
    } catch (err) {
      console.error(err);
      alert("No se pudo cambiar el estado");
    }
  };

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
      <Typography variant="h3" component="h1">Gestión de Tareas</Typography>

      <Box sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2, backgroundColor: "#fafafa" }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <LockIcon fontSize="small" /> Token JWT Activo
        </Typography>
        <TextField
          label="Token JWT (puedes cambiarlo aquí si expira)"
          size="small"
          fullWidth
          value={token}
          onChange={(e) => handleSaveToken(e.target.value)}
        />
      </Box>

      <Box component="form" onSubmit={handleCreatePost} sx={{ p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>Crear Tarea en Proyecto (POST)</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="ID Proyecto"
            size="small"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            sx={{ width: { sm: "130px" } }}
          />
          <TextField
            label="Título"
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

      <TextField
        fullWidth
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

      {loading && (
        <Stack sx={{ alignItems: "center", padding: 5 }}>
          <CircularProgress aria-label="Cargando tareas" />
        </Stack>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && filteredTasks.length === 0 && (
        <Alert severity="info">No hay tareas disponibles o no coinciden con la búsqueda.</Alert>
      )}

      {!loading && filteredTasks.length > 0 && (
        <>
          <Stack spacing={2}>
            {visibleTasks.map((task) => (
              <Card key={task.id} variant="outlined">
                <CardContent>
                  <Typography variant="h6">{task.title || task.name || "Sin título"}</Typography>
                  <Typography color="text.secondary">{task.description || "Sin descripción"}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Estado: <strong>{task.status || "PENDING"}</strong> | ID: {task.id}
                  </Typography>
                  
                  <Stack direction="row" spacing={1.5} sx={{ mt: 2, flexWrap: "wrap" }}>
                    <Button variant="outlined" size="small" color="info" startIcon={<VisibilityIcon />} onClick={() => handleGetById(task.id)}>
                      GET ID
                    </Button>
                    <Button variant="outlined" size="small" color="primary" startIcon={<EditIcon />} onClick={() => handleUpdatePatchStatus(task.id)}>
                      Estado (PATCH)
                    </Button>
                    <Button variant="outlined" size="small" color="secondary" startIcon={<EditIcon />} onClick={() => handleUpdatePut(task)}>
                      Reemplazar (PUT)
                    </Button>
                    <Button variant="outlined" size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(task.id)}>
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

export default UsersPage;