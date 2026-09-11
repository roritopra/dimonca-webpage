import React, { useEffect } from 'react';
import { initAuth } from '../../stores/authStore';
import { initCartSync } from '../../stores/cartStore';

/**
 * Inicializa la escucha del estado de autenticación de Supabase y la
 * sincronización del carrito una sola vez.
 * Debe montarse en el Layout para que la sesión y el carrito estén disponibles
 * en todas las páginas (persistencia: Supabase restaura la sesión desde
 * localStorage y la auto-renueva mientras el usuario no cierre sesión).
 */
export default function AuthProvider() {
	useEffect(() => {
		initAuth();
		initCartSync();
	}, []);

	return null;
}
