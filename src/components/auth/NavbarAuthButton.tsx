import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $authStatus, signOut } from '../../stores/authStore';

/**
 * Botón de auth del navbar:
 * - Sin sesión: botón de texto pequeño "Iniciar sesión" → /login
 * - Con sesión: icono de usuario circular que abre un dropdown hacia la
 *   izquierda con Mi Cuenta / Mis Pedidos / Cerrar sesión.
 *   El panel no redondea su esquina superior derecha (queda pegada al icono).
 *   "Mi Cuenta" se muestra como link activo (relleno rosa) SOLO en /perfil.
 */
const CLOSE_ANIMATION_MS = 220;

export default function NavbarAuthButton() {
	const authStatus = useStore($authStatus);
	const [isOpen, setIsOpen] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [currentPath, setCurrentPath] = useState('/perfil');
	const containerRef = useRef<HTMLDivElement>(null);
	const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Link activo: solo /perfil resalta "Mi Cuenta". Se actualiza en cada
	// navegación (view transitions) y al montar.
	useEffect(() => {
		setCurrentPath(window.location.pathname);
		function onPageLoad() {
			setCurrentPath(window.location.pathname);
		}
		document.addEventListener('astro:page-load', onPageLoad);
		return () => document.removeEventListener('astro:page-load', onPageLoad);
	}, []);

	const isAccountActive = currentPath === '/perfil' || currentPath.startsWith('/perfil/');

	function closeDropdown() {
		if (!isOpen || isClosing) return;
		setIsClosing(true);
		if (closeTimer.current) clearTimeout(closeTimer.current);
		closeTimer.current = setTimeout(() => {
			setIsOpen(false);
			setIsClosing(false);
		}, CLOSE_ANIMATION_MS);
	}

	function toggleDropdown() {
		if (isOpen) {
			closeDropdown();
		} else {
			if (closeTimer.current) clearTimeout(closeTimer.current);
			setIsClosing(false);
			setIsOpen(true);
		}
	}

	// Cierra el dropdown al hacer click fuera o con Escape
	useEffect(() => {
		if (!isOpen) return;

		function handleClickOutside(e: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				closeDropdown();
			}
		}

		function handleEscape(e: KeyboardEvent) {
			if (e.key === 'Escape') closeDropdown();
		}

		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('keydown', handleEscape);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen, isClosing]);

	useEffect(() => {
		return () => {
			if (closeTimer.current) clearTimeout(closeTimer.current);
		};
	}, []);

	if (authStatus === 'initializing') {
		return (
			<span aria-hidden="true" className="flex h-9 w-9 items-center justify-center opacity-0">
				<UserIcon />
			</span>
		);
	}

	if (authStatus === 'loggedOut') {
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

	// Logueado: icono de usuario circular + dropdown hacia la izquierda
	return (
		<div ref={containerRef} className="relative">
			{/* El <style> viaja con la isla: sobrevive a los swaps de <head> del ClientRouter */}
			<style>{NAV_DROPDOWN_STYLES}</style>
			<button
				type="button"
				onClick={toggleDropdown}
				aria-haspopup="menu"
				aria-expanded={isOpen}
				aria-label="Abrir menú de mi cuenta"
				className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 transition-transform hover:scale-110 active:scale-95"
			>
				<UserIcon />
			</button>

			{isOpen && (
				<div
					role="menu"
					className={`nav-user-dropdown absolute right-0 top-[calc(100%+10px)] z-[10001] w-44 overflow-hidden rounded-tl-[18px] rounded-bl-[18px] rounded-br-[18px] border-2 border-pink bg-beige shadow-[0_10px_30px_rgba(58,32,14,0.18)] ${
						isClosing ? 'nav-user-dropdown-out' : 'nav-user-dropdown-in'
					}`}
				>
					<a
						href="/perfil"
						role="menuitem"
						aria-current={isAccountActive ? 'page' : undefined}
						className={
							isAccountActive
								? 'm-1.5 flex items-center rounded-[12px] bg-pink px-4 py-2.5 font-sans text-sm font-bold text-white no-underline'
								: 'm-1.5 flex items-center rounded-[12px] px-4 py-2.5 font-sans text-sm font-semibold text-brown no-underline transition-colors hover:bg-pink/10'
						}
					>
						Mi Cuenta
					</a>
					<a
						href="/mis-pedidos"
						role="menuitem"
						className="mx-1.5 mb-1.5 flex items-center rounded-[12px] px-4 py-2.5 font-sans text-sm font-semibold text-brown no-underline transition-colors hover:bg-pink/10"
					>
						Mis Pedidos
					</a>
					<button
						type="button"
						role="menuitem"
						onClick={() => {
							closeDropdown();
							void signOut().then(() => {
								window.location.href = '/menu';
							});
						}}
						className="mx-1.5 mb-1.5 flex w-[calc(100%-12px)] cursor-pointer items-center rounded-[12px] border-0 bg-transparent px-4 py-2.5 font-sans text-sm font-semibold text-brown transition-colors hover:bg-pink/10"
					>
						Cerrar sesión
					</button>
				</div>
			)}
		</div>
	);
}

// Icono de usuario dentro de círculo (lucide circle-user-round)
function UserIcon() {
	return (
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
			<circle cx="12" cy="12" r="10" />
			<circle cx="12" cy="10" r="3" />
			<path d="M7 20.66V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.66" />
		</svg>
	);
}

// Estilos del dropdown como constante: se renderizan dentro del componente
// (en JSX) para que siempre estén presentes en el DOM de la isla, sin importar
// cuántas navegaciones con view transitions haga el usuario.
const NAV_DROPDOWN_STYLES = `
	@keyframes nav-user-dropdown-in {
		from { opacity: 0; transform: translateX(10px) scale(0.95); }
		to { opacity: 1; transform: translateX(0) scale(1); }
	}
	@keyframes nav-user-dropdown-out {
		from { opacity: 1; transform: translateX(0) scale(1); }
		to { opacity: 0; transform: translateX(10px) scale(0.95); }
	}
	.nav-user-dropdown {
		transform-origin: top right;
	}
	.nav-user-dropdown-in {
		animation: nav-user-dropdown-in 0.22s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.nav-user-dropdown-out {
		animation: nav-user-dropdown-out 0.22s cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}
	@media (prefers-reduced-motion: reduce) {
		.nav-user-dropdown-in, .nav-user-dropdown-out { animation: none; }
	}
`;
