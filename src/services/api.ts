const API_URL = "https://jsonplaceholder.typicode.com/users";

// Actualización completa (PUT)
export async function updateUserPut(id: number, userData: any) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error("Error al actualizar el usuario (PUT)");
  return response.json();
}

// Actualización parcial (PATCH)
export async function updateUserPatch(id: number, partialData: any) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partialData),
  });
  if (!response.ok) throw new Error("Error al actualizar parcialmente el usuario (PATCH)");
  return response.json();
}

// Eliminación (DELETE)
export async function deleteUser(id: number) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Error al eliminar el usuario");
  return true; // JSONPlaceholder devuelve un objeto vacío en DELETE exitoso
}