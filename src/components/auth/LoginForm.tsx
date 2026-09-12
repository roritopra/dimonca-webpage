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
				<input
					id="login-email"
					type="email"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="Correo electrónico"
					aria-label="Correo electrónico"
					className="h-12 w-full rounded-lg border-2 border-brown-300 bg-beige px-5 font-sans text-sm text-brown outline-none transition-colors placeholder:text-brown-400 focus:border-pink focus:ring-2 focus:ring-pink/15"
				/>
			</div>

			<div>
				<input
					id="login-password"
					type="password"
					required
					minLength={6}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="Contraseña"
					aria-label="Contraseña"
					className="h-12 w-full rounded-lg border-2 border-brown-300 bg-beige px-5 font-sans text-sm text-brown outline-none transition-colors placeholder:text-brown-400 focus:border-pink focus:ring-2 focus:ring-pink/15"
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

		{/* Separador "o continúa con" */}
		<div className="my-1 flex items-center gap-3">
			<span className="h-0.5 flex-1 rounded-full bg-pink/25" />
			<span className="font-sans text-xs font-semibold text-pink/80">
				o continúa con
			</span>
			<span className="h-0.5 flex-1 rounded-full bg-pink/25" />
		</div>

		{/* Continuar con Google: píldora outline rosa con logo en stroke */}
		<button
			type="button"
			onClick={handleGoogleSignIn}
			disabled={status === 'loading'}
			className="flex h-12 items-center justify-center gap-3 rounded-full border-2 border-pink bg-white px-6 font-sans text-sm font-bold text-pink transition-all hover:bg-pink/5 active:scale-95 cursor-pointer disabled:opacity-70 disabled:hover:scale-100"
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

// Logo de Google en versión stroke (trazo monocolor rosa, hereda currentColor)
function GoogleIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			className="h-5 w-5 text-pink"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
		<path d="M20.4 12.4a8.4 8.4 0 1 1-2.9-6.5" />
		<path d="M20.4 12.4h-8.4" />
		</svg>
	);
}
