import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { $user, $profile, $authStatus, signOut } from '../../stores/authStore';

export default function ProfileView() {
	const user = useStore($user);
	const profile = useStore($profile);
	const authStatus = useStore($authStatus);
	const [isSigningOut, setIsSigningOut] = useState(false);

	async function handleSignOut() {
		setIsSigningOut(true);
		await signOut();
		window.location.href = '/menu';
	}

	if (authStatus === 'initializing') {
		return (
			<div className="flex w-full max-w-sm flex-col items-center gap-4 py-10">
				<div className="h-20 w-20 animate-pulse rounded-full bg-pink/15" />
				<div className="h-5 w-40 animate-pulse rounded-full bg-pink/15" />
				<div className="h-4 w-56 animate-pulse rounded-full bg-pink/15" />
			</div>
		);
	}

	if (authStatus === 'loggedOut' || !user) {
		return (
			<div className="flex w-full max-w-sm flex-col items-center gap-5 py-10 text-center">
				<p className="font-sans text-lg font-bold text-brown">No has iniciado sesión</p>
				<p className="font-sans text-sm text-brown/70">
					Inicia sesión para ver tu perfil y tus pedidos.
				</p>
				<div className="flex flex-col gap-3 sm:flex-row">
					<a
						href="/login"
						className="flex h-11 items-center justify-center rounded-full bg-pink px-6 font-sans text-sm font-bold text-white shadow-xs transition-transform hover:scale-105 active:scale-95 no-underline"
					>
						Iniciar sesión
					</a>
					<a
						href="/registro"
						className="flex h-11 items-center justify-center rounded-full border-2 border-pink px-6 font-sans text-sm font-bold text-pink transition-transform hover:scale-105 active:scale-95 no-underline"
					>
						Crear cuenta
					</a>
				</div>
			</div>
		);
	}

	const displayName = profile?.full_name || user.email?.split('@')[0] || 'Usuario';
	const initials = displayName
		.split(' ')
		.map((part) => part[0])
		.filter(Boolean)
		.slice(0, 2)
		.join('')
		.toUpperCase();

	return (
		<div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
			{/* Avatar con iniciales */}
			<div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink font-sans text-2xl font-black text-white shadow-md">
				{initials}
			</div>

			<div>
				<h2 className="font-sans text-xl font-extrabold text-brown">{displayName}</h2>
				<p className="mt-0.5 font-sans text-sm text-brown/70">{user.email}</p>
			</div>

			{/* Datos del perfil */}
			<div className="w-full rounded-3xl border border-brown/10 bg-white p-5 shadow-[0_4px_16px_rgba(58,32,14,0.05)]">
				<dl className="flex flex-col gap-3 text-left">
					<div className="flex items-center justify-between gap-4">
						<dt className="font-sans text-xs font-bold uppercase tracking-wide text-brown/50">
							Nombre
						</dt>
						<dd className="font-sans text-sm font-semibold text-brown">
							{profile?.full_name ?? '—'}
						</dd>
					</div>
					<div className="flex items-center justify-between gap-4">
						<dt className="font-sans text-xs font-bold uppercase tracking-wide text-brown/50">
							Teléfono
						</dt>
						<dd className="font-sans text-sm font-semibold text-brown">
							{profile?.phone ?? '—'}
						</dd>
					</div>
					<div className="flex items-center justify-between gap-4">
						<dt className="font-sans text-xs font-bold uppercase tracking-wide text-brown/50">
							Miembro desde
						</dt>
						<dd className="font-sans text-sm font-semibold text-brown">
							{profile?.created_at
								? new Date(profile.created_at).toLocaleDateString('es-CO', {
										day: 'numeric',
										month: 'long',
										year: 'numeric',
									})
								: '—'}
						</dd>
					</div>
				</dl>
			</div>

			<button
				type="button"
				onClick={handleSignOut}
				disabled={isSigningOut}
				className="flex h-11 w-full items-center justify-center gap-2 rounded-full border-2 border-red-200 px-6 font-sans text-sm font-bold text-red-500 transition-transform hover:scale-[1.02] hover:border-red-300 active:scale-95 cursor-pointer disabled:opacity-60 disabled:hover:scale-100"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="h-4 w-4"
					aria-hidden="true"
				>
					<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
					<polyline points="16 17 21 12 16 7" />
					<line x1="21" x2="9" y1="12" y2="12" />
				</svg>
				{isSigningOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
			</button>
		</div>
	);
}
