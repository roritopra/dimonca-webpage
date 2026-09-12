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

	// OAuth con Google: redirige a la pantalla de consentimiento de Google y
	// vuelve a la app con la sesión ya creada (el trigger crea el perfil).
	async function handleGoogleSignIn() {
		setStatus('loading');
		setErrorMessage('');

		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${window.location.origin}/menu`,
			},
		});

		if (error) {
			setErrorMessage(`Error: ${error.message}`);
			setStatus('error');
		}
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

			{/* Separador */}
			<div className="my-1 flex items-center gap-3">
				<span className="h-px flex-1 bg-brown/15" />
				<span className="font-sans text-xs font-semibold uppercase tracking-wide text-brown/40">
					o
				</span>
				<span className="h-px flex-1 bg-brown/15" />
			</div>

			{/* Iniciar sesión con Google */}
			<button
				type="button"
				onClick={handleGoogleSignIn}
				disabled={status === 'loading'}
				className="flex h-12 items-center justify-center gap-3 rounded-full border border-brown/20 bg-white px-6 font-sans text-sm font-bold text-brown shadow-xs transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-70 disabled:hover:scale-100"
			>
				<GoogleIcon />
				Continuar con Google
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

// Logo oficial de Google (multicolor)
function GoogleIcon() {
	return (
		<svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
			<path
				fill="#4285F4"
				d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
			/>
			<path
				fill="#34A853"
				d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z"
			/>
			<path
				fill="#FBBC05"
				d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.97 11.97 0 0 0 0 10.76l3.98-3.09z"
			/>
			<path
				fill="#EA4335"
				d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
			/>
		</svg>
	);
}
