import { atom, onMount } from 'nanostores';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

// Estado global de sesión (equivalente al Context de React en este stack).
// Supabase persiste la sesión en localStorage (clave sb-<ref>-auth-token) y la
// auto-renueva: al recargar la página el cliente la restaura y onAuthStateChange
// emite INITIAL_SESSION con el usuario ya logueado.
export const $user = atom<User | null>(null);
export const $authStatus = atom<'initializing' | 'loggedOut' | 'loggedIn'>('initializing');

// Perfil de la tabla profiles del usuario logueado
export interface Profile {
	id: string;
	email: string | null;
	full_name: string | null;
	phone: string | null;
	created_at: string;
	updated_at: string;
}

export const $profile = atom<Profile | null>(null);

// Suscripción única al estado de auth de Supabase.
// Se llama una sola vez por página (desde el AuthProvider).
let initialized = false;

export function initAuth(): void {
	if (initialized) return;
	initialized = true;

	supabase.auth.getSession().then(({ data }) => {
		setSession(data.session);
	});

	supabase.auth.onAuthStateChange((_event, session) => {
		setSession(session);
	});
}

function setSession(session: Session | null): void {
	if (session?.user) {
		$user.set(session.user);
		$authStatus.set('loggedIn');
		loadProfile(session.user.id);
	} else {
		$user.set(null);
		$profile.set(null);
		$authStatus.set('loggedOut');
	}
}

// Recarga el perfil desde la BD (tras editar datos en el perfil)
export async function refreshProfile(): Promise<void> {
	const userId = $user.get()?.id;
	if (userId) await loadProfile(userId);
}

// Carga el perfil (profiles) del usuario logueado desde Supabase
async function loadProfile(userId: string): Promise<void> {
	const { data, error } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', userId)
		.maybeSingle();

	if (error) {
		console.error('[authStore] Error al cargar el perfil:', error.message);
		return;
	}

	$profile.set((data as Profile) ?? null);
}

// Cierra sesión (revoca el token y limpia el localStorage de Supabase)
export async function signOut(): Promise<void> {
	await supabase.auth.signOut();
}
