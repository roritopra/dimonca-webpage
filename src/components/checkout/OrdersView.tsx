import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { $authStatus } from '../../stores/authStore';
import { fetchMyOrders, type OrderSummary } from '../../lib/ordersApi';
import { formatCurrency } from '../../stores/cartStore';

type OrdersStatus = 'loading' | 'ready' | 'error';

// Etiqueta y color por estado del pedido
const STATUS_META: Record<string, { label: string; className: string }> = {
	pending: { label: 'Pendiente', className: 'bg-amber-100 text-amber-700' },
	confirmed: { label: 'Confirmado', className: 'bg-blue-100 text-blue-700' },
	preparing: { label: 'En preparación', className: 'bg-[#cfe0f5] text-blue-700' },
	delivered: { label: 'Entregado', className: 'bg-green-100 text-green-700' },
	cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-600' },
};

function statusMeta(status: string) {
	return STATUS_META[status] ?? { label: status, className: 'bg-brown/10 text-brown' };
}

function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString('es-CO', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

function OrderCardSkeleton() {
	return (
		<article
			aria-hidden="true"
			className="rounded-3xl border border-brown/10 bg-white p-5 shadow-[0_4px_16px_rgba(58,32,14,0.05)]"
		>
			<div className="flex items-center justify-between gap-4">
				<div className="h-5 w-32 animate-pulse rounded-full bg-pink/15" />
				<div className="h-6 w-24 animate-pulse rounded-full bg-pink/15" />
			</div>
			<div className="mt-3 flex items-center justify-between gap-4">
				<div className="h-4 w-40 animate-pulse rounded-full bg-pink/15" />
				<div className="h-5 w-24 animate-pulse rounded-full bg-pink/15" />
			</div>
		</article>
	);
}

export default function OrdersView() {
	const authStatus = useStore($authStatus);
	const [orders, setOrders] = useState<OrderSummary[]>([]);
	const [status, setStatus] = useState<OrdersStatus>('loading');
	const [errorMessage, setErrorMessage] = useState('');

	const loadOrders = useCallback(async () => {
		setStatus('loading');
		setErrorMessage('');
		try {
			const data = await fetchMyOrders();
			setOrders(data);
			setStatus('ready');
		} catch (err) {
			console.error('[OrdersView] Error al cargar pedidos:', err);
			setErrorMessage(err instanceof Error ? err.message : 'Error inesperado al cargar tus pedidos');
			setStatus('error');
		}
	}, []);

	useEffect(() => {
		// Solo cargar cuando la sesión esté resuelta: si no está logueado no hay
		// pedidos que mostrar (RLS los bloquea de todos modos).
		if (authStatus === 'loggedIn') {
			void loadOrders();
		} else if (authStatus === 'loggedOut') {
			setStatus('ready');
			setOrders([]);
		}
	}, [authStatus, loadOrders]);

	// ---- Sin sesión ----
	if (authStatus === 'loggedOut') {
		return (
			<div className="flex w-full max-w-sm flex-col items-center gap-5 py-10 text-center">
				<div className="flex h-14 w-14 items-center justify-center rounded-full bg-pink/10">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-pink" aria-hidden="true">
						<path d="M16 11V7a4 4 0 0 0-8 0v4" />
						<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
					</svg>
				</div>
				<p className="font-sans text-lg font-bold text-brown">Inicia sesión para ver tus pedidos</p>
				<p className="font-sans text-sm text-brown/70">
					Tu historial de pedidos está asociado a tu cuenta.
				</p>
				<div className="flex flex-col gap-3 sm:flex-row">
					<a
						href="/login?redirect=/mis-pedidos"
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

	// ---- Cargando ----
	if (authStatus === 'initializing' || status === 'loading') {
		return (
			<div className="flex w-full flex-col gap-3" aria-busy="true">
				<OrderCardSkeleton />
				<OrderCardSkeleton />
				<OrderCardSkeleton />
			</div>
		);
	}

	// ---- Error ----
	if (status === 'error') {
		return (
			<div className="flex flex-col items-center gap-4 py-12 text-center">
				<div className="flex h-14 w-14 items-center justify-center rounded-full bg-pink/10">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-pink" aria-hidden="true">
						<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
						<path d="M12 9v4" />
						<path d="M12 17h.01" />
					</svg>
				</div>
				<div>
					<p className="font-sans text-lg font-bold text-brown">Ups, algo salió mal</p>
					<p className="mt-1 font-sans text-sm text-brown/70">{errorMessage}</p>
				</div>
				<button
					type="button"
					onClick={loadOrders}
					className="cursor-pointer rounded-full bg-pink px-6 py-2.5 font-sans text-sm font-bold text-white shadow-xs transition-transform hover:scale-105 active:scale-95"
				>
					Reintentar
				</button>
			</div>
		);
	}

	// ---- Sin pedidos ----
	if (orders.length === 0) {
		return (
			<div className="flex flex-col items-center gap-5 py-12 text-center">
				<div className="flex h-14 w-14 items-center justify-center rounded-full bg-pink/10">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-pink" aria-hidden="true">
						<path d="M21 8v13H3V8" />
						<path d="M1 3h22v5H1z" />
						<path d="M10 12h4" />
					</svg>
				</div>
				<p className="font-sans text-lg font-bold text-brown">Aún no tienes pedidos</p>
				<p className="max-w-xs font-sans text-sm text-brown/70">
					Cuando hagas tu primer pedido aparecerá aquí con su estado y detalles.
				</p>
				<a
					href="/menu"
					className="flex h-11 items-center justify-center rounded-full bg-pink px-6 font-sans text-sm font-bold text-white shadow-xs transition-transform hover:scale-105 active:scale-95 no-underline"
				>
					Ir al menú
				</a>
			</div>
		);
	}

	// ---- Lista de pedidos ----
	return (
		<div className="flex w-full flex-col gap-3">
			{orders.map((order) => {
				const meta = statusMeta(order.status);
				return (
					<article
						key={order.id}
						className="flex items-center justify-between gap-4 rounded-3xl border border-brown/10 bg-white p-5 shadow-[0_4px_16px_rgba(58,32,14,0.05)]"
					>
						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-2">
								<h3 className="font-sans text-base font-extrabold text-brown">
									Pedido #{order.order_number}
								</h3>
								<span className={`rounded-full px-2.5 py-0.5 font-sans text-xs font-bold ${meta.className}`}>
									{meta.label}
								</span>
							</div>
							<p className="mt-1 font-sans text-sm text-brown/70">
								{formatDate(order.created_at)} · {order.item_count}{' '}
								{order.item_count === 1 ? 'producto' : 'productos'}
							</p>
						</div>
						<span className="shrink-0 font-sans text-lg font-black text-pink">
							{formatCurrency(order.total)}
						</span>
					</article>
				);
			})}
		</div>
	);
}
