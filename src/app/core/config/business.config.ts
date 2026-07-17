/**
 * Single source of truth for public business information used by the UI.
 * Keep these values aligned with Google Business Profile and the backend.
 */
export const BUSINESS_CONFIG = {
  name: 'Neon Barber Club',
  shortName: 'NEON·BARBER',
  url: 'https://neonbarberclub.com/',
  phone: {
    display: '+591 77326305',
    e164: '+59177326305',
    whatsappNumber: '59177326305',
  },
  address: {
    street: 'Av. Principal Plan 3 Mil',
    locality: 'Santa Cruz de la Sierra',
    region: 'Santa Cruz',
    countryCode: 'BO',
  },
  coordinates: {
    latitude: -17.8282691,
    longitude: -63.1373726,
  },
  timezone: 'America/La_Paz',
  openingHours: {
    opens: '10:00',
    closes: '19:00',
    closedWeekday: 3,
    display: 'Lunes, martes y jueves a domingo, de 10:00 a 19:00',
  },
  booking: {
    depositAmountBob: 15,
    maximumAdvanceMonths: 3,
  },
  googleMapsUrl:
    'https://www.google.com/maps/place/Neon+Barber+club/@-17.8282554,-63.1371069,19.83z/data=!4m6!3m5!1s0x93f1e7f18fac57d3:0x5f221055256b4872!8m2!3d-17.8282691!4d-63.1373726!16s%2Fg%2F11lv2gk8_q',
} as const;

export const BUSINESS_LINKS = {
  phone: `tel:${BUSINESS_CONFIG.phone.e164}`,
  whatsapp: `https://wa.me/${BUSINESS_CONFIG.phone.whatsappNumber}`,
  whatsappPayment: `https://wa.me/${BUSINESS_CONFIG.phone.whatsappNumber}?text=Hola%2C%20acabo%20de%20realizar%20una%20pre-reserva%20en%20Neon%20Barber%20Club.%20Les%20env%C3%ADo%20mi%20comprobante%20de%20pago.`,
} as const;
