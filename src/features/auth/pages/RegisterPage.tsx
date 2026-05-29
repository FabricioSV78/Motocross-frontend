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

  if (selectedRole === 'PILOT') {
    return (
      <AuthLayout
        title="Create rider account"
        subtitle="Book tracks and lessons in a few steps."
        maxWidth="md"
        footer={
          <p className="text-center text-gray-500 text-sm mt-8">
            Already registered?{' '}
            <Link to={ROUTES.LOGIN} className="text-orange-400 hover:text-orange-300 font-medium">
              Sign in
            </Link>
          </p>
        }
      >
        <button
          type="button"
          onClick={() => setSelectedRole(null)}
          className="text-sm text-gray-400 hover:text-orange-400 mb-4 transition-colors"
        >
          ← Choose another account type
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
      footer={
        <p className="text-center text-gray-500 text-sm mt-8">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-orange-400 hover:text-orange-300 font-medium">
            Sign in
          </Link>
        </p>
      }
    >
      <div className="grid sm:grid-cols-3 gap-4">
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
