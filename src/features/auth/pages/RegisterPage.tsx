import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';
import { AuthLayout, AuthCard } from '../components/AuthLayout';
import { RoleSelectCard } from '../components/RoleSelectCard';
import { ROUTES } from '@/router/routes';

type RoleOption = 'PILOT' | null;

export function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<RoleOption>(null);
  const navigate = useNavigate();

  const footer = (label: string) => (
    <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
      {label}{' '}
      <Link
        to={ROUTES.LOGIN}
        className="font-semibold text-orange-600 transition-colors hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-200"
      >
        Sign in
      </Link>
    </p>
  );

  if (selectedRole === 'PILOT') {
    return (
      <AuthLayout
        title="Create rider account"
        subtitle="Book tracks and lessons in a few steps."
        maxWidth="md"
        footer={footer('Already registered?')}
      >
        <button
          type="button"
          onClick={() => setSelectedRole(null)}
          className="mb-4 text-sm font-semibold text-slate-500 transition-colors hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-300"
        >
          Back to account types
        </button>
        <AuthCard>
          <RegisterForm />
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Pick how you will use the platform. You can sign in later with the same email."
      maxWidth="2xl"
      footer={footer('Already have an account?')}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <RoleSelectCard
          title="Rider"
          description="Find tracks on the map and book sessions with or without a coach."
          actionLabel="Register as rider"
          accent="orange"
          onClick={() => setSelectedRole('PILOT')}
        />
        <RoleSelectCard
          title="Company"
          description="Publish your tracks, set availability, and manage bookings."
          actionLabel="Register company"
          accent="blue"
          onClick={() => navigate(ROUTES.REGISTER_COMPANY)}
        />
        <RoleSelectCard
          title="Coach"
          description="Offer lessons, set your rates, and manage your schedule."
          actionLabel="Register as coach"
          accent="green"
          onClick={() => navigate(ROUTES.REGISTER_COACH)}
        />
      </div>
    </AuthLayout>
  );
}
