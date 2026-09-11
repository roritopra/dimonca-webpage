import React from 'react';
import { useStore } from '@nanostores/react';
import { $authStatus } from '../../stores/authStore';

/**
 * Botón de auth del navbar:
 * - Sin sesión: botón de texto pequeño "Iniciar sesión" → /login
 * - Con sesión: icono de perfil → /perfil
 * - Mientras se restaura la sesión: icono neutro (mismo espacio, sin salto)
 */
export default function NavbarAuthButton() {
	const authStatus = useStore($authStatus);

	if (authStatus === 'loggedIn') {
		return (
			<a
				href="/perfil"
				aria-label="Ver mi perfil"
				className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.75"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="h-7 w-7 sm:h-8 sm:w-8"
					aria-hidden="true"
				>
					<circle cx="12" cy="8" r="5" />
					<path d="M20 21a8 8 0 0 0-16 0" />
				</svg>
			</a>
		);
	}

	if (authStatus === 'initializing') {
		// Mismo tamaño que el icono para evitar salto de layout mientras se restaura la sesión
		return (
			<span
				aria-hidden="true"
				className="flex h-9 w-9 items-center justify-center opacity-0"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.75"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="h-7 w-7 sm:h-8 sm:w-8"
				>
					<circle cx="12" cy="8" r="5" />
					<path d="M20 21a8 8 0 0 0-16 0" />
				</svg>
			</span>
		);
	}

	return (
		<a
			href="/login"
			aria-label="Iniciar sesión"
			className="flex h-9 items-center justify-center rounded-full border border-current px-3 font-sans text-xs font-bold whitespace-nowrap transition-transform hover:scale-105 active:scale-95 sm:px-3.5 sm:text-[13px]"
		>
			Iniciar sesión
		</a>
	);
}
