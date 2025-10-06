import api from './api'

export type Flight = {
  id: number;
  company_name: string;
  flight_number: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  stops: number;
  price: number;
  seats_available: number;
  seats_total?: number;
  active?: boolean;
}

export async function fetchFlights(params?: {
  origin?: string;
  destination?: string;
  date?: string;
  passengers?: number;
  min_price?: number;
  max_price?: number;
  stops?: number;
  airline?: string;
  sort?: string;
}): Promise<Flight[]> {
  const res = await api.get('/api/flights', { params })
  return res.data
}

export async function fetchFlight(id: string | number): Promise<Flight | null> {
  const res = await api.get(`/api/flights/${id}`)
  return res.data
}

export type Ticket = {
  id: number
  user_id: number
  flight_id: number
  status: 'PAID' | 'CANCELED' | 'REFUNDED'
  confirmation_id: string
  price_paid: number
  purchased_at: string
  canceled_at?: string | null
}

export async function fetchMyBookings(): Promise<any[]> {
  // map tickets into booking-like groups by confirmation_id
  const { data } = await api.get('/api/tickets/me')
  const byConf: Record<string, any> = {}
  for (const t of data as Ticket[]) {
    const key = t.confirmation_id
    if (!byConf[key]) byConf[key] = { id: key, flightId: t.flight_id, total: 0, tickets: [], createdAt: t.purchased_at }
    byConf[key].tickets.push(t)
    byConf[key].total += t.price_paid || 0
    if (new Date(t.purchased_at) < new Date(byConf[key].createdAt)) byConf[key].createdAt = t.purchased_at
  }
  return Object.values(byConf)
}

export async function cancelTicket(ticketId: number): Promise<Ticket> {
  const { data } = await api.post(`/api/tickets/${ticketId}/cancel`)
  return data
}
