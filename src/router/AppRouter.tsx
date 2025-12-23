import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegistroPage from "../pages/RegistroPage";
import EspaciosPage from "../pages/EspaciosPage";
import CrearEspacioPage from "../pages/CrearEspacioPage";
import EspacioDetallePage from "../pages/EspacioDetallePage";
import MisReservasPage from "../pages/MisReservasPage";
import MisEspaciosPage from "../pages/MisEspaciosPage";
import EditarEspacioPage from "../pages/EditarEspacioPage";
import EspacioReservasPage from "../pages/EspacioReservasPage";
import PerfilPage from "../pages/PerfilPage";
import AppLayout from "../layout/AppLayout";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas (sin navbar) */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />

        {/* Rutas privadas (con navbar compartida) */}
        <Route element={<AppLayout />}>
          <Route path="/espacios" element={<EspaciosPage />} />
          <Route path="/espacios/nuevo" element={<CrearEspacioPage />} />
          <Route path="/espacios/:id" element={<EspacioDetallePage />} />
          <Route path="/espacios/editar/:id" element={<EditarEspacioPage />} />
          <Route path="/espacios/:id/reservas" element={<EspacioReservasPage />} />

          <Route path="/mis-reservas" element={<MisReservasPage />} />
          <Route path="/mis-espacios" element={<MisEspaciosPage />} />

          <Route path="/perfil" element={<PerfilPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}