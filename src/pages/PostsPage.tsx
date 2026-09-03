import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
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
import { useToggle } from "../hooks/useToggle";
import type { Post } from "../types/Post";

const postsUrl = "https://jsonplaceholder.typicode.com/posts";
const postsPerPage = 10;

function PostsPage() {
  const { data: posts, loading, error } = useFetch<Post[]>(postsUrl);

  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [showBodies, toggleBodies] = useToggle(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

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

  if (!posts || posts.length === 0) {
    return <Alert severity="info">La API no devolvió publicaciones.</Alert>;
  }

  const normalizedSearch = debouncedSearch.trim().toLocaleLowerCase();
  const filteredPosts = posts.filter((post) => {
    const searchableText = `${post.title} ${post.body}`.toLocaleLowerCase();
    return searchableText.includes(normalizedSearch);
  });

  const pageCount = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (page - 1) * postsPerPage;
  const visiblePosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  return (
    <Stack spacing={3}>
      <Typography variant="h3" component="h1">Publicaciones</Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <TextField
          fullWidth
          label="Buscar en título o contenido"
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
        <Button variant="outlined" onClick={toggleBodies}>
          {showBodies ? "Ocultar textos" : "Mostrar textos"}
        </Button>
      </Stack>
      {filteredPosts.length === 0 ? (
        <Alert severity="info">No hay publicaciones que coincidan con la búsqueda.</Alert>
      ) : (
        <>
          <Stack spacing={2}>
            {visiblePosts.map((post) => (
              <Card key={post.id} variant="outlined">
                <CardContent>
                  <Typography variant="h6">{post.title}</Typography>
                  {showBodies && <Typography color="text.secondary">{post.body}</Typography>}
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

export default PostsPage;