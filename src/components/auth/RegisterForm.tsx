import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

type AuthStatus = 'idle' | 'loading' | 'success' | 'error';

export default function RegisterForm() {
	const [fullName, setFullName] = useState('');
	const [phone, setPhone] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [status, setStatus] = useState<AuthStatus>('idle');
	const [errorMessage, setErrorMessage] = useState('');
	const [needsConfirmation, setNeedsConfirmation] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setStatus('loading');
		setErrorMessage('');
		setNeedsConfirmation(false);

		// full_name y phone van en los metadatos: el trigger on_auth_user_created
		// los copia a la tabla profiles automáticamente.
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					full_name: fullName,
					phone: phone,
				},
			},
		});

		if (error) {
			setErrorMessage(
				error.message === 'User already registered'
					? 'Ya existe una cuenta con este correo. Inicia sesión.'
					: `Error: ${error.message}`
			);
			setStatus('error');
			return;
		}

		if (data.session) {
			// Confirmación de email desactivada: sesión inmediata
			setStatus('success');
			window.location.href = '/menu';
		} else {
			// Confirmación de email activada: pedir verificar antes de entrar
			setStatus('success');
			setNeedsConfirmation(true);
		}
	}

	// OAuth con Google: registra/inicia sesión y vuelve con la sesión creada.
	// El trigger on_auth_user_created crea el perfil con los datos de Google.
	async function handleGoogleSignUp() {
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

	if (needsConfirmation) {
		return (
			<div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
				<div className="flex h-14 w-14 items-center justify-center rounded-full bg-pink/10">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="h-7 w-7 text-pink"
						aria-hidden="true"
					>
						<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
						<path d="m22 6-10 7L2 6" />
					</svg>
				</div>
				<h2 className="font-sans text-xl font-extrabold text-brown">¡Verifica tu correo!</h2>
				<p className="font-sans text-sm text-brown/70">
					Te enviamos un enlace de confirmación a <strong>{email}</strong>. Ábrelo para activar tu
					cuenta y luego inicia sesión.
				</p>
				<a
					href="/login"
					className="mt-2 flex h-11 items-center justify-center rounded-full bg-pink px-6 font-sans text-sm font-bold text-white shadow-xs transition-transform hover:scale-105 active:scale-95 no-underline"
				>
					Ir a iniciar sesión
				</a>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
			<div>
				<label htmlFor="reg-name" className="font-sans text-sm font-bold text-brown">
					Nombre completo
				</label>
				<input
					id="reg-name"
					type="text"
					required
					value={fullName}
					onChange={(e) => setFullName(e.target.value)}
					placeholder="Tu nombre"
					className="mt-1.5 h-12 w-full rounded-2xl border border-brown/20 bg-white px-4 font-sans text-sm text-brown outline-none transition-colors placeholder:text-brown/40 focus:border-pink"
				/>
			</div>

			<div>
				<label htmlFor="reg-phone" className="font-sans text-sm font-bold text-brown">
					Teléfono
				</label>
				<input
					id="reg-phone"
					type="tel"
					required
					value={phone}
					onChange={(e) => setPhone(e.target.value)}
					placeholder="+57 300 000 0000"
					className="mt-1.5 h-12 w-full rounded-2xl border border-brown/20 bg-white px-4 font-sans text-sm text-brown outline-none transition-colors placeholder:text-brown/40 focus:border-pink"
				/>
			</div>

			<div>
				<label htmlFor="reg-email" className="font-sans text-sm font-bold text-brown">
					Correo electrónico
				</label>
				<input
					id="reg-email"
					type="email"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="tu@correo.com"
					className="mt-1.5 h-12 w-full rounded-2xl border border-brown/20 bg-white px-4 font-sans text-sm text-brown outline-none transition-colors placeholder:text-brown/40 focus:border-pink"
				/>
			</div>

			<div>
				<label htmlFor="reg-password" className="font-sans text-sm font-bold text-brown">
					Contraseña
				</label>
				<input
					id="reg-password"
					type="password"
					required
					minLength={6}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="Mínimo 6 caracteres"
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
				{status === 'loading' ? 'Creando cuenta...' : 'Crear cuenta'}
			</button>

			{/* Separador */}
			<div className="my-1 flex items-center gap-3">
				<span className="h-px flex-1 bg-brown/15" />
				<span className="font-sans text-xs font-semibold uppercase tracking-wide text-brown/40">
					o
				</span>
				<span className="h-px flex-1 bg-brown/15" />
			</div>

			{/* Registrarse con Google */}
			<button
				type="button"
				onClick={handleGoogleSignUp}
				disabled={status === 'loading'}
				className="flex h-12 items-center justify-center gap-3 rounded-full border border-brown/20 bg-white px-6 font-sans text-sm font-bold text-brown shadow-xs transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-70 disabled:hover:scale-100"
			>
				<GoogleIcon />
				Continuar con Google
			</button>

			<p className="text-center font-sans text-sm text-brown/70">
				¿Ya tienes cuenta?{' '}
				<a href="/login" className="font-bold text-pink no-underline hover:underline">
					Inicia sesión
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
