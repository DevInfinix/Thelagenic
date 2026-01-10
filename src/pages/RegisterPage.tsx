import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, User, FileText, Lock, Mail, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    officerId: '',
    aadhaar: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Real-time validation check for button state
  useEffect(() => {
    const isValid =
      formData.fullName.trim() !== '' &&
      formData.age !== '' && parseInt(formData.age) >= 18 &&
      formData.gender !== '' &&
      formData.officerId.trim() !== '' &&
      formData.aadhaar.replace(/\s/g, '').length === 12 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      formData.password.length >= 8 &&
      formData.password === formData.confirmPassword;

    setIsFormValid(isValid);
  }, [formData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.age || parseInt(formData.age) < 18) newErrors.age = 'Valid age required (18+)';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.officerId.trim()) newErrors.officerId = 'Officer ID is required';

    const aadhaarClean = formData.aadhaar.replace(/\s/g, '');
    if (!/^\d{12}$/.test(aadhaarClean)) newErrors.aadhaar = 'Valid 12-digit Aadhaar required';

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Valid email required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'aadhaar') {
      const clean = value.replace(/[^\d]/g, '').slice(0, 12);
      const formatted = clean.match(/.{1,4}/g)?.join(' ') || clean;
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // if (!validate()) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-emerald-100 p-3">
            <Shield className="h-10 w-10 text-emerald-700" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Officer Registration
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Official Access Request
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-lg sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`block w-full pr-10 sm:text-sm rounded-md py-2 ${errors.fullName ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'}`}
                />
                {errors.fullName && <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><AlertCircle className="h-5 w-5 text-red-500" /></div>}
              </div>
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className={`mt-1 block w-full sm:text-sm rounded-md py-2 ${errors.age ? 'border-red-300' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'}`}
                />
                {errors.age && <p className="mt-1 text-xs text-red-600">{errors.age}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`mt-1 block w-full pl-3 pr-10 py-2 text-base sm:text-sm rounded-md ${errors.gender ? 'border-red-300' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'}`}
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender}</p>}
              </div>
            </div>

            {/* Officer ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700">FSSAI Officer ID</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="officerId"
                  value={formData.officerId}
                  onChange={handleChange}
                  className={`block w-full pl-10 sm:text-sm rounded-md py-2 ${errors.officerId ? 'border-red-300' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'}`}
                />
              </div>
              {errors.officerId && <p className="mt-1 text-sm text-red-600">{errors.officerId}</p>}
            </div>

            {/* Aadhaar Number */}
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 flex justify-between">
                <span>Aadhaar Number</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border">Confidential</span>
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="aadhaar"
                  value={formData.aadhaar}
                  onChange={handleChange}
                  maxLength={14}
                  placeholder="0000 0000 0000"
                  className={`block w-full pl-10 sm:text-sm rounded-md py-2 font-mono tracking-wide ${errors.aadhaar ? 'border-red-300' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'}`}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 flex items-start">
                <Shield className="h-3 w-3 mr-1 mt-0.5 text-gray-400" />
                Your Aadhaar details are encrypted and stored securely in compliance with data privacy regulations.
              </p>
              {errors.aadhaar && <p className="mt-1 text-sm text-red-600">{errors.aadhaar}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Official Email</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 sm:text-sm rounded-md py-2 ${errors.email ? 'border-red-300' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'}`}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 sm:text-sm rounded-md py-2 ${errors.password ? 'border-red-300' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'}`}
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 sm:text-sm rounded-md py-2 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'}`}
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Registering...' : 'Register as Officer'}
              </button>
            </div>

            <div className="text-center mt-4">
              <span className="text-sm text-gray-500">Already registered? </span>
              <Link to="/login" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
