import Alert from "@mui/material/Alert";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import PostsPage from "./pages/PostsPage";
import UsersPage from "./pages/UsersPage";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/users" replace />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="posts" element={<PostsPage />} />
        <Route
          path="*"
          element={<Alert severity="warning">La página solicitada no existe.</Alert>}
        />
      </Route>
    </Routes>
  );
}

export default App;