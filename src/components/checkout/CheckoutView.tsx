import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $authStatus, $profile, $user } from '../../stores/authStore';
import { $cart, $cartTotal, clearCart, formatCurrency } from '../../stores/cartStore';
import { createOrder, type DeliveryMethod } from '../../lib/ordersApi';
import {
	fetchMyAddresses,
	saveAddress,
	type SavedAddress,
} from '../../lib/addressesApi';
import CheckoutSummary from './CheckoutSummary';

// Cobertura de entregas: por ahora solo Cali (Valle del Cauca)
const DELIVERY_FEE = 8000;
const COVERAGE_DEPARTMENT = 'Valle del Cauca';
const COVERAGE_CITY = 'Cali';

const DEPARTMENTS: Record<string, string[]> = {
	'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Buga', 'Jamundí', 'Yumbo', 'Cartago'],
	Antioquia: ['Medellín', 'Envigado', 'Itagüí', 'Bello', 'Rionegro'],
	'Cundinamarca': ['Bogotá D.C.', 'Chía', 'Zipaquirá', 'Soacha'],
	Atlántico: ['Barranquilla', 'Soledad', 'Puerto Colombia'],
	Bolívar: ['Cartagena', 'Magangué'],
	Santander: ['Bucaramanga', 'Floridablanca', 'Girón', 'Barrancabermeja'],
	Risaralda: ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal'],
	Quindío: ['Armenia', 'Calarcá', 'Montenegro'],
	Caldas: ['Manizales', 'Villamaría'],
	Nariño: ['Pasto', 'Ipiales'],
	Cauca: ['Popayán', 'Santander de Quilichao'],
	Tolima: ['Ibagué', 'Espinal'],
};

const STREET_TYPES = ['Calle', 'Carrera', 'Avenida', 'Transversal', 'Diagonal', 'Circular', 'Vía'];

type SubmitStatus = 'idle' | 'submitting' | 'error';

export default function CheckoutView() {
	const authStatus = useStore($authStatus);
	const profile = useStore($profile);
	const user = useStore($user);
	const cart = useStore($cart);

	const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('domicilio');

	// Información de contacto
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [phone, setPhone] = useState('');
	const [email, setEmail] = useState('');

	// Dirección (solo domicilio)
	const [department, setDepartment] = useState('');
	const [city, setCity] = useState('');
	const [neighborhood, setNeighborhood] = useState('');
	const [streetType, setStreetType] = useState('Calle');
	const [streetNumber, setStreetNumber] = useState('');
	const [houseNumber, setHouseNumber] = useState('');
	const [interior, setInterior] = useState('');
	const [notes, setNotes] = useState('');

	const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
	const [submitError, setSubmitError] = useState('');

	// Libreta de direcciones (usuarios recurrentes): prellenado + selector
	const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
	// '' = sin libreta / primera vez; 'nueva' = escribir una nueva dirección;
	// <id> = usar la dirección guardada (campos prellenados y editables)
	const [selectedAddressId, setSelectedAddressId] = useState('nueva');
	const [doSaveAddress, setDoSaveAddress] = useState(true); // checkbox guardar
	const [addressesError, setAddressesError] = useState('');

	// Prellenar contacto con el perfil del usuario logueado
	useEffect(() => {
		if (!profile) return;
		if (!firstName && profile.full_name) {
			const parts = profile.full_name.trim().split(/\s+/);
			setFirstName(parts.slice(0, -1).join(' ') || parts[0]);
			if (parts.length > 1) setLastName(parts[parts.length - 1]);
		}
		if (!phone && profile.phone) setPhone(profile.phone);
		if (!email && profile.email) setEmail(profile.email);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [profile]);

	// Cargar la libreta al entrar logueado: prellenar con la predeterminada.
	// Si es la primera compra, el usuario escribe su primera dirección y esa
	// queda guardada como predeterminada (decisión de UX).
	useEffect(() => {
		if (authStatus !== 'loggedIn') return;

		let cancelled = false;
		(async () => {
			try {
				const addresses = await fetchMyAddresses();
				if (cancelled) return;
				setSavedAddresses(addresses);
				setDoSaveAddress(addresses.length === 0);

				const preferred = addresses.find((a) => a.is_default) ?? addresses[0];
				if (preferred) {
					setSelectedAddressId(preferred.id);
					prefillFromAddress(preferred);
				}
			} catch (err) {
				if (!cancelled) {
					console.error('[Checkout] Error al cargar direcciones guardadas:', err);
					setAddressesError(err instanceof Error ? err.message : 'Error al cargar direcciones');
				}
			}
		})();
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [authStatus]);

	function prefillFromAddress(address: SavedAddress) {
		setDepartment(address.department);
		setCity(address.city);
		setNeighborhood(address.neighborhood);
		setStreetType(address.street_type || 'Calle');
		setStreetNumber(address.street_number);
		setHouseNumber(address.house_number);
		setInterior(address.interior ?? '');
		setNotes(address.notes ?? '');

		// Contacto: prellenar desde el destinatario si los campos están vacíos
		if (!phone && address.phone) setPhone(address.phone);
	}

	function handleSelectSavedAddress(id: string) {
		setSelectedAddressId(id);
		const address = savedAddresses.find((a) => a.id === id);
		if (address) prefillFromAddress(address);
	}

	function handleNewAddress() {
		setSelectedAddressId('nueva');
		setDepartment('');
		setCity('');
		setNeighborhood('');
		setStreetType('Calle');
		setStreetNumber('');
		setHouseNumber('');
		setInterior('');
		setNotes('');
	}

	const cities = department ? DEPARTMENTS[department] ?? [] : [];
	const hasCoverage = department === COVERAGE_DEPARTMENT && city === COVERAGE_CITY;
	// Sin selección aún no se muestra la alerta (solo cuando eligió algo fuera de cobertura)
	const coverageChecked = department !== '' && city !== '';
	const outOfCoverage = deliveryMethod === 'domicilio' && coverageChecked && !hasCoverage;

	const subtotal = useStore($cartTotal);
	const deliveryFee = deliveryMethod === 'domicilio' ? DELIVERY_FEE : 0;
	const total = subtotal + deliveryFee;

	const canSubmit =
		cart.length > 0 &&
		authStatus === 'loggedIn' &&
		!outOfCoverage &&
		firstName.trim() !== '' &&
		lastName.trim() !== '' &&
		phone.trim() !== '' &&
		email.trim() !== '' &&
		(deliveryMethod === 'tienda' ||
			(neighborhood.trim() !== '' &&
				streetNumber.trim() !== '' &&
				houseNumber.trim() !== ''));

	async function handleConfirmOrder() {
		if (!user) return;
		setSubmitStatus('submitting');
		setSubmitError('');

		try {
			const isDelivery = deliveryMethod === 'domicilio';
			const order = await createOrder({
				userId: user.id,
				contact: { firstName, lastName, phone, email },
				delivery: {
					method: deliveryMethod,
					neighborhood: isDelivery ? neighborhood : undefined,
					addressLine: isDelivery
						? `${streetType} ${streetNumber} #${houseNumber}${interior ? ` - ${interior}` : ''}`
						: undefined,
					city: isDelivery ? city : undefined,
					department: isDelivery ? department : undefined,
					notes: notes.trim() !== '' ? notes : undefined,
				},
				deliveryFee,
				items: cart,
			});

			// Guardar la dirección en la libreta (si el usuario lo pidió).
			// La primera dirección que guarde queda como predeterminada automáticamente.
			if (deliveryMethod === 'domicilio' && doSaveAddress) {
				try {
					await saveAddress({
						full_name: `${firstName} ${lastName}`.trim(),
						phone,
						department,
						city,
						neighborhood,
						street_type: streetType,
						street_number: streetNumber,
						house_number: houseNumber,
						interior: interior,
						notes: notes.trim() !== '' ? notes : null,
						makeDefault: false, // la primera va sola por ser primera; el resto solo si el usuario la marca
					});
				} catch (saveErr) {
					// La dirección es secundaria: no bloquear el pedido por su fallo
					console.error('[Checkout] No se pudo guardar la dirección:', saveErr);
				}
			}

			clearCart();
			window.location.href = `/mis-pedidos?nuevo=${order.orderNumber}`;
		} catch (err) {
			console.error('[Checkout] Error al confirmar el pedido:', err);
			setSubmitError(err instanceof Error ? err.message : 'Error inesperado al confirmar el pedido');
			setSubmitStatus('error');
		}
	}

	return (
		<div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">
			{/* ==================== COLUMNA IZQUIERDA: FORMULARIO ==================== */}
			<div className="flex flex-col gap-5">
				{/* Alerta de cobertura fuera de Cali */}
				{outOfCoverage && (
					<div className="rounded-2xl border-2 border-red-400 bg-red-50 p-5">
						<div className="flex items-start gap-3">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden="true">
								<circle cx="12" cy="12" r="10" />
								<line x1="12" x2="12" y1="8" y2="12" />
								<line x1="12" x2="12.01" y1="16" y2="16" />
							</svg>
							<div>
								<h3 className="font-sans text-base font-extrabold text-red-600">
									No tenemos cobertura fuera de Cali
								</h3>
								<p className="mt-1 font-sans text-sm leading-relaxed text-red-500/90">
									Por el momento, nuestros domicilios están disponibles únicamente dentro de la
									ciudad de Cali. Ingresa una dirección dentro de nuestra zona de cobertura para
									continuar con tu pedido.
								</p>
								<div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-sans text-sm font-bold text-red-500">
									<button
										type="button"
										onClick={() => {
											setDepartment('');
											setCity('');
										}}
										className="cursor-pointer underline-offset-2 hover:underline"
									>
										Cambiar dirección
									</button>
									<a href="/menu" className="underline-offset-2 hover:underline">
										Volver al menú
									</a>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Banner de cuenta (solo si no está logueado) */}
				{authStatus !== 'loggedIn' && (
					<div className="rounded-2xl bg-pink/15 p-5">
						<h2 className="font-sans text-xl font-black text-pink">¿Ya tienes una cuenta?</h2>
						<p className="mt-1 font-sans text-sm leading-relaxed text-brown/80">
							Al iniciar sesión tu información quedará guardada en nuestra base de datos para
							próximos pedidos.
						</p>
						<a
							href="/login?redirect=/checkout"
							className="mt-3 inline-flex h-10 items-center gap-2 rounded-full bg-pink px-5 font-sans text-sm font-bold text-white shadow-xs transition-transform hover:scale-105 active:scale-95 no-underline"
						>
							Iniciar sesión
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
								<path d="M7 17 17 7M7 7h10v10" />
							</svg>
						</a>
					</div>
				)}

				{/* Método de entrega */}
				<section>
					<h2 className="font-sans text-lg font-extrabold text-brown">
						¿Cómo prefieres recibir tu pedido?
					</h2>
					<div className="mt-3 grid grid-cols-2 overflow-hidden rounded-2xl border-2 border-pink">
						<button
							type="button"
							onClick={() => setDeliveryMethod('domicilio')}
							aria-pressed={deliveryMethod === 'domicilio'}
							className={`flex h-12 cursor-pointer items-center justify-center gap-2 border-0 font-sans text-sm font-bold transition-colors ${
								deliveryMethod === 'domicilio' ? 'bg-pink text-white' : 'bg-pink/15 text-pink'
							}`}
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
								<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
								<path d="M15 18h-5" />
								<path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
								<circle cx="17" cy="18" r="2" />
								<circle cx="7" cy="18" r="2" />
							</svg>
							Domicilio
						</button>
						<button
							type="button"
							onClick={() => setDeliveryMethod('tienda')}
							aria-pressed={deliveryMethod === 'tienda'}
							className={`flex h-12 cursor-pointer items-center justify-center gap-2 border-0 font-sans text-sm font-bold transition-colors ${
								deliveryMethod === 'tienda' ? 'bg-pink text-white' : 'bg-pink/15 text-pink'
							}`}
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
								<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
								<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
								<path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
								<path d="M2 7h20" />
								<path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7" />
							</svg>
							Recoger en tienda
						</button>
					</div>
				</section>

				{/* Información de contacto */}
				<section className="rounded-3xl border border-brown/15 bg-beige p-5 sm:p-6">
					<h2 className="font-sans text-lg font-extrabold text-brown">Información de contacto</h2>
					<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Field id="co-first-name" label="Nombre">
							<input id="co-first-name" type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Nombre" className={inputClass} />
						</Field>
						<Field id="co-last-name" label="Apellido">
							<input id="co-last-name" type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Apellido" className={inputClass} />
						</Field>
						<Field id="co-phone" label="Número de teléfono">
							<input id="co-phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Número de teléfono" className={inputClass} />
						</Field>
						<Field id="co-email" label="Correo">
							<input id="co-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo" className={inputClass} />
						</Field>
					</div>
				</section>

				{/* Dirección (solo domicilio) */}
				{deliveryMethod === 'domicilio' && (
					<section className="rounded-3xl border border-brown/15 bg-beige p-5 sm:p-6">
						<h2 className="font-sans text-lg font-extrabold text-brown">Dirección</h2>

						{/* Selector de libreta (solo si hay direcciones guardadas) */}
						{savedAddresses.length > 0 && (
							<div className="mt-4 flex flex-col gap-2">
								<p className="font-sans text-sm font-bold text-brown/80">Tus direcciones guardadas:</p>
								<div className="flex flex-col gap-2">
									{savedAddresses.map((address) => (
										<button
											key={address.id}
											type="button"
											onClick={() => handleSelectSavedAddress(address.id)}
											className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 bg-white p-3.5 text-left transition-colors ${
												selectedAddressId === address.id
													? 'border-pink bg-pink/5'
													: 'border-brown/15 hover:border-pink/50'
											}`}
										>
											<span
												className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
													selectedAddressId === address.id ? 'border-pink' : 'border-brown/30'
												}`}
												aria-hidden="true"
											>
												{selectedAddressId === address.id && (
													<span className="h-2 w-2 rounded-full bg-pink" />
												)}
											</span>
											<span className="min-w-0 flex-1">
												<span className="flex items-center gap-2">
													<span className="font-sans text-sm font-extrabold text-brown">
														{address.label ?? 'Dirección'}
													</span>
													{address.is_default && (
														<span className="rounded-full bg-pink/15 px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wide text-pink">
															Predeterminada
														</span>
													)}
												</span>
												<span className="block truncate font-sans text-xs text-brown/70">
													{address.address_line}, {address.neighborhood}, {address.city}
												</span>
											</span>
										</button>
									))}

									<button
										type="button"
										onClick={handleNewAddress}
										className={`flex cursor-pointer items-center gap-2 rounded-2xl border-2 bg-white p-3.5 font-sans text-sm font-bold transition-colors ${
											selectedAddressId === 'nueva'
												? 'border-pink bg-pink/5 text-pink'
												: 'border-brown/15 text-brown hover:border-pink/50'
										}`}
									>
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
											<path d="M5 12h14M12 5v14" />
										</svg>
										Usar una nueva dirección
									</button>
								</div>
							</div>
						)}

						{addressesError && (
							<p className="mt-2 rounded-xl bg-amber-50 px-4 py-2 font-sans text-xs text-amber-700">
								{addressesError}
							</p>
						)}

						<div className={savedAddresses.length > 0 ? 'mt-5 flex flex-col gap-4' : 'mt-4 flex flex-col gap-4'}>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<Field id="co-department" label="Departamento">
									<select
										id="co-department"
										required
										value={department}
										onChange={(e) => {
											setDepartment(e.target.value);
											setCity('');
										}}
										className={inputClass}
									>
										<option value="" disabled>Departamento</option>
										{Object.keys(DEPARTMENTS).map((dept) => (
											<option key={dept} value={dept}>{dept}</option>
										))}
									</select>
								</Field>
								<Field id="co-city" label="Ciudad">
									<select
										id="co-city"
										required
										value={city}
										onChange={(e) => setCity(e.target.value)}
										disabled={!department}
										className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}
									>
										<option value="" disabled>Ciudad</option>
										{cities.map((c) => (
											<option key={c} value={c}>{c}</option>
										))}
									</select>
								</Field>
							</div>

							<Field id="co-neighborhood" label="Barrio">
								<input id="co-neighborhood" type="text" required value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Nombre del barrio" className={inputClass} />
							</Field>

							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<Field id="co-street-type" label="Tipo de vía">
									<select id="co-street-type" required value={streetType} onChange={(e) => setStreetType(e.target.value)} className={inputClass}>
										{STREET_TYPES.map((t) => (
											<option key={t} value={t}>{t}</option>
										))}
									</select>
								</Field>
								<Field id="co-street-number" label="Vía">
									<input id="co-street-number" type="text" required value={streetNumber} onChange={(e) => setStreetNumber(e.target.value)} placeholder="Ej: 12A" className={inputClass} />
								</Field>
							</div>

							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<Field id="co-house-number" label="Número">
									<input id="co-house-number" type="text" required value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} placeholder="Ej: 34-56" className={inputClass} />
								</Field>
								<Field id="co-interior" label="Interior / apto (opcional)">
									<input id="co-interior" type="text" value={interior} onChange={(e) => setInterior(e.target.value)} placeholder="Ej: Apt 302" className={inputClass} />
								</Field>
							</div>

							<Field id="co-notes" label="Notas para el domiciliario (opcional)">
								<input id="co-notes" type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: portón verde, llamar al llegar" className={inputClass} />
							</Field>

							{/* Guardar en la libreta (aparece en próximos pedidos; la primera queda predeterminada) */}
							<label className="flex cursor-pointer items-start gap-3 pt-1">
								<input
									type="checkbox"
									checked={doSaveAddress}
									onChange={(e) => {
										setDoSaveAddress(e.target.checked);
										if (!e.target.checked) setSelectedAddressId('nueva');
									}}
									className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-pink"
								/>
								<span className="font-sans text-sm leading-relaxed text-brown/80">
									Guardar esta dirección en mi libreta
									{savedAddresses.length === 0 && (
										<span className="block font-sans text-xs text-brown/50">
											Será tu dirección predeterminada para próximas compras
										</span>
									)}
								</span>
							</label>
						</div>
					</section>
				)}

				{/* Confirmación */}
				{submitStatus === 'error' && (
					<p className="rounded-2xl bg-red-50 px-5 py-3 font-sans text-sm font-semibold text-red-600">
						{submitError}
					</p>
				)}

				{authStatus !== 'loggedIn' ? (
					<a
						href="/login?redirect=/checkout"
						className="flex h-14 items-center justify-center rounded-full bg-pink px-8 font-sans text-base font-bold text-white shadow-[0_4px_14px_rgba(244,93,140,0.35)] transition-transform hover:scale-[1.02] active:scale-95 no-underline"
					>
						Inicia sesión para confirmar tu pedido
					</a>
				) : (
					<button
						type="button"
						onClick={handleConfirmOrder}
						disabled={!canSubmit || submitStatus === 'submitting'}
						className="flex h-14 cursor-pointer items-center justify-center rounded-full bg-pink px-8 font-sans text-base font-bold text-white shadow-[0_4px_14px_rgba(244,93,140,0.35)] transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
					>
						{submitStatus === 'submitting' ? 'Confirmando pedido...' : `Confirmar pedido · ${formatCurrency(total)}`}
					</button>
				)}
			</div>

			{/* ==================== COLUMNA DERECHA: RESUMEN ==================== */}
			<CheckoutSummary deliveryFee={deliveryFee} />
		</div>
	);
}

const inputClass =
	'h-12 w-full rounded-lg border-2 border-brown-300 bg-beige px-5 font-sans text-sm text-brown outline-none transition-colors placeholder:text-brown-400 focus:border-pink focus:ring-2 focus:ring-pink/15';

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-1.5">
			<label htmlFor={id} className="font-sans text-sm font-bold text-brown">
				{label}
			</label>
			{children}
		</div>
	);
}
