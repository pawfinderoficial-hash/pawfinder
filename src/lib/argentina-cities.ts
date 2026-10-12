export interface ArgentinaCity {
  name: string;
  province: string;
  lat: number;
  lng: number;
}

export const ARGENTINA_CITIES: ArgentinaCity[] = [
  { name: "Posadas", province: "Misiones", lat: -27.3621, lng: -55.9009 },
  { name: "Oberá", province: "Misiones", lat: -27.4871, lng: -55.1199 },
  { name: "Eldorado", province: "Misiones", lat: -26.4084, lng: -54.6946 },
  { name: "Puerto Iguazú", province: "Misiones", lat: -25.5972, lng: -54.5786 },
  { name: "Buenos Aires", province: "CABA", lat: -34.6037, lng: -58.3816 },
  { name: "La Plata", province: "Buenos Aires", lat: -34.9205, lng: -57.9536 },
  { name: "Mar del Plata", province: "Buenos Aires", lat: -38.0055, lng: -57.5426 },
  { name: "Córdoba", province: "Córdoba", lat: -31.4201, lng: -64.1888 },
  { name: "Rosario", province: "Santa Fe", lat: -32.9442, lng: -60.6505 },
  { name: "Santa Fe", province: "Santa Fe", lat: -31.6107, lng: -60.6973 },
  { name: "Mendoza", province: "Mendoza", lat: -32.8895, lng: -68.8458 },
  { name: "San Juan", province: "San Juan", lat: -31.5375, lng: -68.5364 },
  { name: "San Luis", province: "San Luis", lat: -33.3017, lng: -66.3378 },
  { name: "Paraná", province: "Entre Ríos", lat: -31.7413, lng: -60.5115 },
  { name: "Corrientes", province: "Corrientes", lat: -27.4692, lng: -58.8306 },
  { name: "Resistencia", province: "Chaco", lat: -27.4514, lng: -58.9867 },
  { name: "Formosa", province: "Formosa", lat: -26.1775, lng: -58.1781 },
  { name: "Salta", province: "Salta", lat: -24.7821, lng: -65.4232 },
  { name: "San Miguel de Tucumán", province: "Tucumán", lat: -26.8083, lng: -65.2176 },
  { name: "San Salvador de Jujuy", province: "Jujuy", lat: -24.1858, lng: -65.2995 },
  { name: "Santiago del Estero", province: "Santiago del Estero", lat: -27.7951, lng: -64.2615 },
  { name: "Catamarca", province: "Catamarca", lat: -28.4696, lng: -65.7852 },
  { name: "La Rioja", province: "La Rioja", lat: -29.4131, lng: -66.8558 },
  { name: "Neuquén", province: "Neuquén", lat: -38.9516, lng: -68.0591 },
  { name: "Santa Rosa", province: "La Pampa", lat: -36.6203, lng: -64.2906 },
  { name: "Viedma", province: "Río Negro", lat: -40.8135, lng: -62.9967 },
  { name: "Rawson", province: "Chubut", lat: -43.3002, lng: -65.1023 },
  { name: "Río Gallegos", province: "Santa Cruz", lat: -51.623, lng: -69.2168 },
  { name: "Ushuaia", province: "Tierra del Fuego", lat: -54.8019, lng: -68.303 },
];

export function nearestCity(lat: number, lng: number) {
  return ARGENTINA_CITIES.reduce((nearest, city) => {
    const distance = Math.hypot(city.lat - lat, city.lng - lng);
    const nearestDistance = Math.hypot(nearest.lat - lat, nearest.lng - lng);
    return distance < nearestDistance ? city : nearest;
  });
}
