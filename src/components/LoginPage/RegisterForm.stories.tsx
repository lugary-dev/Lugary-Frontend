import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from './RegisterForm';

const meta: Meta<typeof RegisterForm> = {
  title: 'Autenticación/RegisterForm',
  component: RegisterForm,
  decorators: [
    (Story) => (
      <MemoryRouter>
        {/* Contenedor para centrar y limitar el ancho, simulando un modal o columna */}
        <div className="max-w-md mx-auto my-10 shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
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
type Story = StoryObj<typeof RegisterForm>;

// 1. Estado inicial (Vacío)
export const PorDefecto: Story = {
  args: {
    onSwitchToLogin: () => console.log("Cambiar a Login"),
    onOpenTerms: () => console.log("Abrir Términos"),
  },
};

// 2. Vista en Modo Oscuro
export const ModoOscuro: Story = {
  args: { ...PorDefecto.args },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};