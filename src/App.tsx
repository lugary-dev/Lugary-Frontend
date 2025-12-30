import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import EspaciosPage from "./pages/EspaciosPage";
import EspacioDetallePage from "./pages/EspacioDetallePage";
import CrearEspacioPage from "./pages/CrearEspacioPage";
import MisEspaciosPage from "./pages/MisEspaciosPage";
import MisReservasPage from "./pages/MisReservasPage";
import PerfilPage from "./pages/PerfilPage";
import EspacioReservasPage from "./pages/EspacioReservasPage";
import AppLayout from "./layout/AppLayout"; // <--- Aquí ocurre la magia ahora

// Se definen las rutas
const router = createBrowserRouter([
  // Rutas protegidas / Principales (Usan Layout con Navbar y Chat)
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <EspaciosPage /> },
      { path: "espacios/:id", element: <EspacioDetallePage /> },
      { path: "espacios/nuevo", element: <CrearEspacioPage /> },
      { path: "espacios/editar/:id", element: <CrearEspacioPage /> },
      { path: "mis-espacios", element: <MisEspaciosPage /> },
      { path: "mis-reservas", element: <MisReservasPage /> },
      { path: "perfil", element: <PerfilPage /> },
      { path: "espacios/:id/reservas", element: <EspacioReservasPage /> },
    ],
  },
  // Rutas públicas (Sin Navbar, Sin Chat)
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/registro",
    element: <LoginPage />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;