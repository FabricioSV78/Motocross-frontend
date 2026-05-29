import { Link } from 'react-router-dom';
import { RegisterCoachForm } from '../components/RegisterCoachForm';
import { AuthLayout, AuthCard } from '../components/AuthLayout';
import { AuthAlert } from '../components/AuthAlert';
import { ROUTES } from '@/router/routes';

export function RegisterCoachPage() {
  return (
    <AuthLayout
      title="Register as coach"
      subtitle="Create your profile and upload your certificate to start teaching."
      backLink={{ to: ROUTES.REGISTER, label: '← Back to account types' }}
      footer={
        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-orange-400 hover:text-orange-300 font-medium">
            Sign in
          </Link>
        </p>
      }
    >
      <AuthCard>
        <RegisterCoachForm />
      </AuthCard>

      <div className="mt-4">
        <AuthAlert variant="info" title="Next step after signup">
          You will upload your coaching certificate. An admin must approve your profile before you
          can accept bookings.
        </AuthAlert>
      </div>
    </AuthLayout>
  );
}
