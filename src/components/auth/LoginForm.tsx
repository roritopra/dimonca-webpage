import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

type AuthStatus = 'idle' | 'loading' | 'success' | 'error';

export default function LoginForm() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [status, setStatus] = useState<AuthStatus>('idle');
	const [errorMessage, setErrorMessage] = useState('');

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setStatus('loading');
		setErrorMessage('');

		const { error } = await supabase.auth.signInWithPassword({ email, password });

		if (error) {
			setErrorMessage(
				error.message === 'Invalid login credentials'
					? 'Correo o contraseña incorrectos.'
					: `Error: ${error.message}`
			);
			setStatus('error');
			return;
		}

		setStatus('success');
		window.location.href = '/menu';
	}

	return (
		<form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
			<div>
				<label htmlFor="login-email" className="font-sans text-sm font-bold text-brown">
					Correo electrónico
				</label>
				<input
					id="login-email"
					type="email"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="tu@correo.com"
					className="mt-1.5 h-12 w-full rounded-2xl border border-brown/20 bg-white px-4 font-sans text-sm text-brown outline-none transition-colors placeholder:text-brown/40 focus:border-pink"
				/>
			</div>

			<div>
				<label htmlFor="login-password" className="font-sans text-sm font-bold text-brown">
					Contraseña
				</label>
				<input
					id="login-password"
					type="password"
					required
					minLength={6}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="••••••••"
					className="mt-1.5 h-12 w-full rounded-2xl border border-brown/20 bg-white px-4 font-sans text-sm text-brown outline-none transition-colors placeholder:text-brown/40 focus:border-pink"
				/>
			</div>

			{status === 'error' && (
				<p className="rounded-xl bg-red-50 px-4 py-2.5 font-sans text-sm font-semibold text-red-600">
					{errorMessage}
				</p>
			)}

			<button
				type="submit"
				disabled={status === 'loading'}
				className="mt-2 flex h-12 items-center justify-center rounded-full bg-pink px-6 font-sans text-base font-bold text-white shadow-xs transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-70 disabled:hover:scale-100"
			>
				{status === 'loading' ? 'Ingresando...' : 'Ingresar'}
			</button>

			<p className="text-center font-sans text-sm text-brown/70">
				¿No tienes cuenta?{' '}
				<a href="/registro" className="font-bold text-pink no-underline hover:underline">
					Regístrate
				</a>
			</p>
		</form>
	);
}
