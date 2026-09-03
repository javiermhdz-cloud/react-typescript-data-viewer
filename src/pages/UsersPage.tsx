import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
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
import { useFetch } from "../hooks/useFetch";
import type { User } from "../types/User";

const usersUrl = "https://jsonplaceholder.typicode.com/users";
const usersPerPage = 4;

function UsersPage() {
  const { data: fetchedUsers, loading, error } = useFetch<User[]>(usersUrl);

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    if (fetchedUsers) {
      setUsers(fetchedUsers);
    }
  }, [fetchedUsers]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${usersUrl}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Error al eliminar");
      
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      alert("Usuario eliminado correctamente (DELETE)");
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el usuario");
    }
  };

  const handleUpdatePatch = async (id: number) => {
    try {
      const response = await fetch(`${usersUrl}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Actualizado (PATCH)" }),
      });
      if (!response.ok) throw new Error("Error al actualizar");
      const updatedUser = await response.json();

      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === id ? { ...user, ...updatedUser } : user))
      );
      alert("Usuario actualizado parcialmente (PATCH)");
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el usuario");
    }
  };

  // --- IMPLEMENTACIÓN DE PUT ---
  const handleUpdatePut = async (userToUpdate: User) => {
    try {
      const completeData = {
        ...userToUpdate,
        name: "Nombre Completo (PUT)",
      };

      const response = await fetch(`${usersUrl}/${userToUpdate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completeData),
      });
      if (!response.ok) throw new Error("Error al actualizar con PUT");
      const updatedUser = await response.json();

      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userToUpdate.id ? updatedUser : user))
      );
      alert("Usuario actualizado por completo (PUT)");
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el usuario con PUT");
    }
  };

  if (loading) {
    return (
      <Stack sx={{ alignItems: "center", padding: 5 }}>
        <CircularProgress aria-label="Cargando usuarios" />
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!users || users.length === 0) {
    return <Alert severity="info">La API no devolvió usuarios.</Alert>;
  }

  const normalizedSearch = debouncedSearch.trim().toLocaleLowerCase();
  const filteredUsers = users.filter((user) => {
    const searchableText = `${user.name} ${user.username} ${user.email}`.toLocaleLowerCase();
    return searchableText.includes(normalizedSearch);
  });

  const pageCount = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (page - 1) * usersPerPage;
  const visibleUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  return (
    <Stack spacing={3}>
      <Typography variant="h3" component="h1">Usuarios</Typography>
      <TextField
        label="Buscar por nombre, usuario o correo"
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
      {filteredUsers.length === 0 ? (
        <Alert severity="info">No hay usuarios que coincidan con la búsqueda.</Alert>
      ) : (
        <>
          <Stack spacing={2}>
            {visibleUsers.map((user) => (
              <Card key={user.id} variant="outlined">
                <CardContent>
                  <Typography variant="h6">{user.name}</Typography>
                  <Typography color="text.secondary">@{user.username}</Typography>
                  <Typography>{user.email}</Typography>
                  <Typography>{user.phone}</Typography>
                  
                  <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: "wrap" }}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      color="primary" 
                      startIcon={<EditIcon />}
                      onClick={() => handleUpdatePatch(user.id)}
                    >
                      Editar (PATCH)
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      color="secondary" 
                      startIcon={<EditIcon />}
                      onClick={() => handleUpdatePut(user)}
                    >
                      Editar (PUT)
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      color="error" 
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(user.id)}
                    >
                      Eliminar (DELETE)
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