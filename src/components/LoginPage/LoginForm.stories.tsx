import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from './LoginForm';

const meta: Meta<typeof LoginForm> = {
  title: 'Autenticación/LoginForm', // Carpeta en Storybook
  component: LoginForm,
  decorators: [
    (Story) => (
      // Usamos MemoryRouter para simular las rutas de navegación
      <MemoryRouter>
        <div className="max-w-md mx-auto mt-10 shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof LoginForm>;

// 1. Vista por defecto
export const Default: Story = {
  args: {
    onSwitchToRegister: () => console.log("Navegar a Registro"),
    onSwitchToForgotPassword: () => console.log("Navegar a Recuperar Contraseña"),
  },
};

// 2. Vista con fondo oscuro (Simulado)
export const ModoOscuro: Story = {
  args: { ...Default.args },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};