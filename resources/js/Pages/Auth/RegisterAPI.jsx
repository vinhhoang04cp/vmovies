import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/Context/AuthContext';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function RegisterAPI() {
    const navigate = useNavigate();
    const { register, loading, error, setError } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
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

        // Validation
        const errors = {};
        if (!formData.name) errors.name = 'Name is required';
        if (!formData.email) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Email is invalid';
        }
        if (!formData.password) errors.password = 'Password is required';
        else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        if (!formData.password_confirmation) {
            errors.password_confirmation = 'Password confirmation is required';
        } else if (formData.password !== formData.password_confirmation) {
            errors.password_confirmation = 'Passwords do not match';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        const result = await register(
            formData.name,
            formData.email,
            formData.password,
            formData.password_confirmation
        );

        if (result.success) {
            navigate('/dashboard');
        } else {
            setFormErrors({ submit: result.error });
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md bg-white border border-black">
                <div className="border-b border-black bg-black px-8 py-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">VMovies</h1>
                    <p className="mt-2 text-gray-400 text-sm tracking-wide uppercase">Create Account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-8">
                    {/* Server error message */}
                    {(error || formErrors.submit) && (
                        <div className="bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                            {error || formErrors.submit}
                        </div>
                    )}

                    {/* Name field */}
                    <div>
                        <InputLabel htmlFor="name" value="Full Name" />
                        <TextInput
                            id="name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-2 block w-full"
                            placeholder="John Doe"
                            disabled={loading}
                            autoComplete="name"
                        />
                        <InputError message={formErrors.name} className="mt-2" />
                    </div>

                    {/* Email field */}
                    <div>
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-2 block w-full"
                            placeholder="john@example.com"
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
                            className="mt-2 block w-full"
                            placeholder="••••••••"
                            disabled={loading}
                            autoComplete="new-password"
                        />
                        <InputError message={formErrors.password} className="mt-2" />
                    </div>

                    {/* Confirm password field */}
                    <div>
                        <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            className="mt-2 block w-full"
                            placeholder="••••••••"
                            disabled={loading}
                            autoComplete="new-password"
                        />
                        <InputError message={formErrors.password_confirmation} className="mt-2" />
                    </div>

                    {/* Submit button */}
                    <div className="pt-2">
                        <PrimaryButton
                            className="w-full justify-center"
                            disabled={loading}
                        >
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </PrimaryButton>
                    </div>

                    {/* Login link */}
                    <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-100">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="font-bold text-black hover:underline"
                        >
                            Log in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

