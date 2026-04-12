import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/Context/AuthContext';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function LoginAPI() {
    const navigate = useNavigate();
    const { login, loading, error, setError } = useAuth();

    const [formData, setFormData] = useState({
        email: 'admin@vmovies.com',
        password: 'password',
    });

    const [formErrors, setFormErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field when user starts typing
        if (formErrors[name]) {
            setFormErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});
        setError(null);

        // Basic validation
        const errors = {};
        if (!formData.email) errors.email = 'Email is required';
        if (!formData.password) errors.password = 'Password is required';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        const result = await login(formData.email, formData.password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setFormErrors({ submit: result.error });
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
            <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
                <div className="border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-8">
                    <h1 className="text-3xl font-bold text-white">VMovies</h1>
                    <p className="mt-2 text-blue-100">Admin Login</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 p-8">
                    {/* Server error message */}
                    {(error || formErrors.submit) && (
                        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                            {error || formErrors.submit}
                        </div>
                    )}

                    {/* Email field */}
                    <div>
                        <InputLabel htmlFor="email" value="Email Address" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full"
                            placeholder="admin@example.com"
                            disabled={loading}
                            autoComplete="email"
                        />
                        <InputError message={formErrors.email} className="mt-2" />
                    </div>

                    {/* Password field */}
                    <div>
                        <InputLabel htmlFor="password" value="Password" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="mt-1 block w-full"
                            placeholder="••••••••"
                            disabled={loading}
                            autoComplete="current-password"
                        />
                        <InputError message={formErrors.password} className="mt-2" />
                    </div>

                    {/* Submit button */}
                    <div>
                        <PrimaryButton
                            className="w-full justify-center"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Log In'}
                        </PrimaryButton>
                    </div>

                    {/* Register link */}
                    <div className="text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            Sign up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

