import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { supabase } from '../../lib/supabase';

type AuthStatus = 'idle' | 'loading' | 'success' | 'error';

const inputClasses =
	'h-12 w-full rounded-lg border-2 border-brown-300 bg-beige px-5 pr-12 font-sans text-sm text-brown outline-none transition-colors placeholder:text-brown-400 focus:border-pink focus:ring-2 focus:ring-pink/15';

export default function RegisterForm() {
	const [fullName, setFullName] = useState('');
	const [phone, setPhone] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [status, setStatus] = useState<AuthStatus>('idle');
	const [errorMessage, setErrorMessage] = useState('');
	const [needsConfirmation, setNeedsConfirmation] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setErrorMessage('');

		if (password !== confirmPassword) {
			setErrorMessage('Las contraseñas no coinciden.');
			setStatus('error');
			return;
		}

		setStatus('loading');
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
			<div className="flex w-full flex-col items-center gap-4 text-center">
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
		<form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
			{/* Abrir cuenta con Google (Apple fuera del flujo) */}
			<div>
				<p className="font-sans text-sm font-bold text-brown">Abrir cuenta con:</p>
				<button
					type="button"
					onClick={handleGoogleSignUp}
					disabled={status === 'loading'}
					className="mt-2 flex h-11 w-full items-center justify-center gap-2.5 rounded-full border-2 border-blue-600 bg- px-6 font-sans text-sm font-bold text-blue-600 transition-all hover:bg-blue-200/40 active:scale-[0.98] cursor-pointer disabled:opacity-70"
				>
					<GoogleIcon />
					Google
				</button>
			</div>

			{/* Divisor */}
			<div className="h-0.5 rounded-full bg-blue-600/50" />

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
					placeholder="Nombre completo"
					className={`mt-1.5 ${inputClasses}`}
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
					placeholder="Teléfono"
					className={`mt-1.5 ${inputClasses}`}
				/>
			</div>

			<div>
				<label htmlFor="reg-email" className="font-sans text-sm font-bold text-brown">
					Correo
				</label>
				<input
					id="reg-email"
					type="email"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="Correo"
					className={`mt-1.5 ${inputClasses}`}
				/>
			</div>

			<div>
				<label htmlFor="reg-password" className="font-sans text-sm font-bold text-brown">
					Contraseña
				</label>
				<div className="relative">
					<input
						id="reg-password"
						type={showPassword ? 'text' : 'password'}
						required
						minLength={6}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Contraseña"
						className={inputClasses}
					/>
					<EyeToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
				</div>
			</div>

			<div>
				<label htmlFor="reg-confirm" className="font-sans text-sm font-bold text-brown">
					Confirmar contraseña
				</label>
				<div className="relative">
					<input
						id="reg-confirm"
						type={showConfirm ? 'text' : 'password'}
						required
						minLength={6}
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						placeholder="Confirmar contraseña"
						className={inputClasses}
					/>
					<EyeToggle show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
				</div>
			</div>

			{status === 'error' && (
				<p className="rounded-xl bg-red-50 px-4 py-2.5 font-sans text-sm font-semibold text-red-600">
					{errorMessage}
				</p>
			)}

			<button
				type="submit"
				disabled={status === 'loading'}
				className="mt-1 flex h-12 items-center justify-center rounded-full bg-blue-600 px-6 font-sans text-base font-bold text-white shadow-[0_3px_12px_rgba(106,167,213,0.45)] transition-all hover:bg-blue-500 active:scale-[0.98] cursor-pointer disabled:opacity-70 disabled:hover:scale-100"
			>
				{status === 'loading' ? 'Creando cuenta...' : 'Registrate'}
			</button>

			<p className="text-center font-sans text-sm text-brown/80">
				¿Ya tienes una cuenta?{' '}
				<a href="/login" className="font-bold text-pink no-underline hover:underline">
					Inicia sesión
				</a>
			</p>
		</form>
	);
}

// Logo de Google en stroke azul (set arcticons:google de Iconify vía @iconify/react)
function GoogleIcon() {
	return <Icon icon="akar-icons:google-fill" className="h-5 w-5" aria-hidden="true" />;
}

// Ojo con/para mostrar y ocultar contraseñas (stroke blue-600 como en el diseño, hereda currentColor)
function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
	return (
		<button
			type="button"
			onClick={onToggle}
			className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-blue-600 transition-opacity hover:opacity-70"
			aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
			aria-pressed={show}
		>
			{show ? (
				<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
					<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
					<circle cx="12" cy="12" r="3" />
				</svg>
			) : (
				<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
					<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
					<line x1="1" y1="1" x2="23" y2="23" />
				</svg>
			)}
		</button>
	);
}
