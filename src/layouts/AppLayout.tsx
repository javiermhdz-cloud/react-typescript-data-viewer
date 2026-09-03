import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { NavLink, Outlet } from "react-router-dom";

function AppLayout() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Explorador de datos
          </Typography>

          <Stack direction="row" spacing={1}>
            <NavLink to="/users" style={{ textDecoration: "none" }}>
              {({ isActive }) => (
                <Button color="inherit" variant={isActive ? "outlined" : "text"}>
                  Usuarios
                </Button>
              )}
            </NavLink>

            <NavLink to="/posts" style={{ textDecoration: "none" }}>
              {({ isActive }) => (
                <Button color="inherit" variant={isActive ? "outlined" : "text"}>
                  Publicaciones
                </Button>
              )}
            </NavLink>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ paddingY: 4 }}>
        <Container maxWidth="md">
          <Outlet />
        </Container>
      </Box>
    </>
  );
}

export default AppLayout;