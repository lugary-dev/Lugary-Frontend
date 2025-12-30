import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../../context/ThemeContext'; // Ajustá la ruta si es necesario
import Navbar from './Navbar';

const meta: Meta<typeof Navbar> = {
  title: 'Global/Navbar', // Así aparecerá en tu barra lateral
  component: Navbar,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <ThemeProvider>
          <Story />
        </ThemeProvider>
      </BrowserRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Navbar>;

// Historia 1: Usuario No Logueado (Invitado)
export const Invitado: Story = {
  args: {
    onOpenChat: () => alert("Abrir Chat"),
  },
  play: () => {
    localStorage.removeItem("userEmail"); // Forzamos estado desconectado
  }
};

// Historia 2: Usuario Logueado
export const Logueado: Story = {
  args: {
    onOpenChat: () => alert("Abrir Chat"),
  },
  play: () => {
    localStorage.setItem("userEmail", "enzo@lugary.com"); // Simulamos sesión
  }
};