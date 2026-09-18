import { supabase } from './supabase';

// ============================================================================
// Libreta de direcciones del usuario (tabla addresses).
// - La PRIMERA dirección que guarda un usuario queda como predeterminada.
// - Al guardar otra como predeterminada, se desmarca la anterior automáticamente.
// Alimenta el prellenado del checkout para usuarios recurrentes.
// ============================================================================

export interface SavedAddress {
	id: string;
	label: string | null;
	full_name: string;
	phone: string;
	department: string;
	city: string;
	neighborhood: string;
	street_type: string;
	street_number: string;
	house_number: string;
	interior: string | null;
	address_line: string;
	notes: string | null;
	is_default: boolean;
}

// Lee todas las direcciones del usuario, predeterminada primero y por recencia
export async function fetchMyAddresses(): Promise<SavedAddress[]> {
	const { data, error } = await supabase
		.from('addresses')
		.select('*')
		.order('is_default', { ascending: false })
		.order('created_at', { ascending: false });

	if (error) {
		throw new Error(`No se pudieron cargar tus direcciones: ${error.message}`);
	}

	return (data ?? []) as SavedAddress[];
}

export function composeAddressLine(input: {
	street_type: string;
	street_number: string;
	house_number: string;
	interior?: string | null;
}): string {
	const base = `${input.street_type} ${input.street_number} #${input.house_number}`;
	return input.interior && input.interior.trim() !== '' ? `${base} - ${input.interior.trim()}` : base;
}

export interface SaveAddressInput {
	label?: string;
	full_name: string;
	phone: string;
	department: string;
	city: string;
	neighborhood: string;
	street_type: string;
	street_number: string;
	house_number: string;
	interior?: string | null;
	notes?: string | null;
	makeDefault: boolean;
}

// Guarda una dirección. Si es la PRIMERA del usuario, queda predeterminada
// automáticamente (decisión de UX: la primera dirección es la default).
// Si makeDefault y ya tenía predeterminada, la anterior se desmarca.
export async function saveAddress(input: SaveAddressInput): Promise<SavedAddress> {
	const existing = await fetchMyAddresses();
	const isFirst = existing.length === 0;
	const makeDefault = isFirst || input.makeDefault;

	// Desmarcar la predeterminada anterior si esta pasará a serla
	if (makeDefault && !isFirst) {
		await supabase
			.from('addresses')
			.update({ is_default: false })
			.eq('is_default', true);
	}

	const { data, error } = await supabase
		.from('addresses')
		.insert({
			label: input.label?.trim() !== '' ? input.label : null,
			full_name: input.full_name,
			phone: input.phone,
			department: input.department,
			city: input.city,
			neighborhood: input.neighborhood,
			street_type: input.street_type,
			street_number: input.street_number,
			house_number: input.house_number,
			interior: input.interior?.trim() !== '' && input.interior ? input.interior : null,
			address_line: composeAddressLine(input),
			notes: input.notes?.trim() !== '' && input.notes ? input.notes : null,
			is_default: makeDefault,
		})
		.select('*')
		.single();

	if (error || !data) {
		throw new Error(`No se pudo guardar la dirección: ${error?.message ?? 'sin respuesta'}`);
	}

	return data as SavedAddress;
}

// Marca una dirección guardada como predeterminada (y desmarca la anterior)
export async function setDefaultAddress(addressId: string): Promise<void> {
	const { error: unsetError } = await supabase
		.from('addresses')
		.update({ is_default: false })
		.eq('is_default', true);

	if (unsetError) {
		throw new Error(`No se pudo cambiar la dirección predeterminada: ${unsetError.message}`);
	}

	const { error: setError } = await supabase
		.from('addresses')
		.update({ is_default: true })
		.eq('id', addressId);

	if (setError) {
		throw new Error(`No se pudo cambiar la dirección predeterminada: ${setError.message}`);
	}
}

// Elimina una dirección de la libreta
export async function deleteAddress(addressId: string): Promise<void> {
	const { error } = await supabase.from('addresses').delete().eq('id', addressId);

	if (error) {
		throw new Error(`No se pudo eliminar la dirección: ${error.message}`);
	}
}
