import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeConfig, ThemeProvider } from 'flowbite-react/theme';
import type { CustomFlowbiteTheme } from 'flowbite-react/types';
import { AuthProvider } from './AuthProvider';
import { queryClient } from '@/lib/react-query';

const flowbiteTheme: CustomFlowbiteTheme = {
  button: {
    base: 'relative inline-flex items-center justify-center rounded-xl text-center font-semibold tracking-tight transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950',
    disabled: 'pointer-events-none opacity-55',
    fullSized: 'w-full',
    size: {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-5 text-base',
    },
    color: {
      primary:
        'border border-orange-500/70 bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-200/60 hover:from-orange-400 hover:to-red-500 focus:ring-orange-400 active:scale-[0.98] dark:shadow-orange-950/25',
      secondary:
        'border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50 focus:ring-slate-300 active:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:focus:ring-slate-500 dark:active:bg-slate-900',
      outline:
        'border border-orange-500/80 bg-white/70 text-orange-700 hover:bg-orange-500 hover:text-white focus:ring-orange-400 active:bg-orange-600 dark:bg-transparent dark:text-orange-200',
      ghost:
        'border border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus:ring-slate-300 active:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800/90 dark:hover:text-white dark:focus:ring-slate-600 dark:active:bg-slate-900',
      danger:
        'border border-red-500/70 bg-red-600 text-white hover:bg-red-500 focus:ring-red-400 active:bg-red-700',
      default:
        'border border-orange-500/70 bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-200/60 hover:from-orange-400 hover:to-red-500 focus:ring-orange-400 active:scale-[0.98] dark:shadow-orange-950/25',
    },
  },
  textInput: {
    base: 'flex',
    field: {
      input: {
        base: 'block w-full border transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60',
        sizes: {
          sm: 'px-3 py-2 text-sm',
          md: 'px-3.5 py-2.5 text-sm',
          lg: 'px-4 py-3 text-base',
        },
        colors: {
          gray:
            'border-slate-300 bg-white text-slate-950 placeholder-slate-400 shadow-sm hover:border-slate-400 focus:border-orange-500 focus:ring-orange-500/25 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder-slate-500 dark:hover:border-slate-600 dark:focus:ring-orange-500/30',
          failure:
            'border-red-500 bg-red-50 text-red-950 placeholder-red-400 focus:border-red-500 focus:ring-red-500/25 dark:bg-red-950/30 dark:text-white dark:placeholder-red-300 dark:focus:border-red-400 dark:focus:ring-red-500/30',
          success:
            'border-emerald-500 bg-emerald-50 text-emerald-950 placeholder-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/25 dark:bg-emerald-950/30 dark:text-white dark:placeholder-emerald-300 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/30',
          warning:
            'border-amber-500 bg-amber-50 text-amber-950 placeholder-amber-400 focus:border-amber-500 focus:ring-amber-500/25 dark:bg-amber-950/30 dark:text-white dark:placeholder-amber-300 dark:focus:border-amber-400 dark:focus:ring-amber-500/30',
          info:
            'border-sky-500 bg-sky-50 text-sky-950 placeholder-sky-400 focus:border-sky-500 focus:ring-sky-500/25 dark:bg-sky-950/30 dark:text-white dark:placeholder-sky-300 dark:focus:border-sky-400 dark:focus:ring-sky-500/30',
        },
      },
    },
  },
};

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeConfig mode="auto" />
      <ThemeProvider theme={flowbiteTheme} root>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
