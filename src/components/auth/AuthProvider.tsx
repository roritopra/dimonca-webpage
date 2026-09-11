import React, { useEffect } from 'react';
import { initAuth } from '../../stores/authStore';

/**
 * Inicializa la escucha del estado de autenticación de Supabase una sola vez.
 * Debe montarse en el Layout para que la sesión esté disponible en todas las
 * páginas (persistencia: Supabase restaura la sesión desde localStorage y la
 * auto-renueva mientras el usuario no cierre sesión).
 */
export default function AuthProvider() {
	useEffect(() => {
		initAuth();
	}, []);

	return null;
}
