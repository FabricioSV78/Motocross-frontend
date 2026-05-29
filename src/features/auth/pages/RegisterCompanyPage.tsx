import { Link } from 'react-router-dom';
import { RegisterCompanyForm } from '../components/RegisterCompanyForm';
import { AuthLayout, AuthCard } from '../components/AuthLayout';
import { AuthAlert } from '../components/AuthAlert';
import { ROUTES } from '@/router/routes';

export function RegisterCompanyPage() {
  return (
    <AuthLayout
      title="Register your company"
      subtitle="List your motocross tracks and receive bookings from riders."
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
        <RegisterCompanyForm />
      </AuthCard>

      <AuthAlert variant="info" title="Approval required">
        Company accounts are reviewed by an administrator. You will receive access after approval.
      </AuthAlert>
    </AuthLayout>
  );
}
