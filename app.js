// ========================================
// DATOS DE VIAJES (MOCK DATA)
// ========================================

// Array que contiene todos los viajes disponibles
// Al inicio cargamos datos de ejemplo
let rides = [
    {
        id: 1,
        nombre: "María",
        origen: "Villarcayo",
        destino: "Burgos",
        fecha: obtenerFechaFormateada(0), // Hoy
        hora: "09:00",
        plazas: 3,
        contacto: "612345678",
        notas: "Paso por Medina de Pomar"
    },
    {
        id: 2,
        nombre: "Carlos",
        origen: "Aguilar de Campoo",
        destino: "Santander",
        fecha: obtenerFechaFormateada(0), // Hoy
        hora: "10:30",
        plazas: 2,
        contacto: "654321987",
        notas: ""
    },
    {
        id: 3,
        nombre: "Ana",
        origen: "Espinosa de los Monteros",
        destino: "Bilbao",
        fecha: obtenerFechaFormateada(1), // Mañana
        hora: "08:00",
        plazas: 1,
        contacto: "623456789",
        notas: "Voy al hospital, salgo temprano"
    },
    {
        id: 4,
        nombre: "Javier",
        origen: "Reinosa",
        destino: "Palencia",
        fecha: obtenerFechaFormateada(1), // Mañana
        hora: "11:00",
        plazas: 2,
        contacto: "698765432",
        notas: ""
    },
    {
        id: 5,
        nombre: "Isabel",
        origen: "Villasana de Mena",
        destino: "Miranda de Ebro",
        fecha: obtenerFechaFormateada(2), // Pasado mañana
        hora: "07:30",
        plazas: 3,
        contacto: "645678901",
        notas: "Paso por Espinosa"
    },
    {
        id: 6,
        nombre: "Antonio",
        origen: "Medina de Pomar",
        destino: "Burgos",
        fecha: obtenerFechaFormateada(0), // Hoy
        hora: "16:00",
        plazas: 2,
        contacto: "687654321",
        notas: "Vuelvo sobre las 20h"
    },
    {
        id: 7,
        nombre: "Carmen",
        origen: "Trespaderne",
        destino: "Vitoria",
        fecha: obtenerFechaFormateada(3), // Dentro de 3 días
        hora: "09:30",
        plazas: 1,
        contacto: "634567890",
        notas: ""
    },
    {
        id: 8,
        nombre: "Luis",
        origen: "Aranda de Duero",
        destino: "Valladolid",
        fecha: obtenerFechaFormateada(2), // Pasado mañana
        hora: "12:00",
        plazas: 3,
        contacto: "656789012",
        notas: "Voy al mercado semanal"
    }
];

// ========================================
// FUNCIONES AUXILIARES
// ========================================

/**
 * Obtiene una fecha formateada en formato YYYY-MM-DD
 * @param {number} diasAdelante - Días a sumar desde hoy (0 = hoy, 1 = mañana, etc.)
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
function obtenerFechaFormateada(diasAdelante) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + diasAdelante);
    return fecha.toISOString().split('T')[0];
}

/**
 * Formatea una fecha de YYYY-MM-DD a un formato más legible
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha formateada (ej: "17 de noviembre de 2025")
 */
function formatearFecha(fecha) {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    const fechaObj = new Date(fecha + 'T00:00:00');
    return fechaObj.toLocaleDateString('es-ES', opciones);
}

/**
 * Determina si una fecha es hoy, mañana o próximos días
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {string} "hoy", "mañana" o "proximos"
 */
function categorizarFecha(fecha) {
    const hoy = obtenerFechaFormateada(0);
    const mañana = obtenerFechaFormateada(1);

    if (fecha === hoy) return "hoy";
    if (fecha === mañana) return "mañana";
    return "proximos";
}

// ========================================
// GESTIÓN DE LOCALSTORAGE
// ========================================

/**
 * Carga los viajes desde localStorage
 * Si no hay datos guardados, usa los datos de ejemplo
 */
function cargarViajesDesdeLocalStorage() {
    const viajesGuardados = localStorage.getItem('vavoy-rides');
    if (viajesGuardados) {
        rides = JSON.parse(viajesGuardados);
    }
}

/**
 * Guarda los viajes en localStorage
 */
function guardarViajesEnLocalStorage() {
    localStorage.setItem('vavoy-rides', JSON.stringify(rides));
}

// ========================================
// RENDERIZADO DE VIAJES
// ========================================

/**
 * Renderiza la lista de viajes en el DOM
 * @param {Array} viajesAMostrar - Array de viajes a mostrar
 */
function renderizarViajes(viajesAMostrar) {
    const contenedor = document.getElementById('rides-list');

    // Si no hay viajes, mostrar mensaje
    if (viajesAMostrar.length === 0) {
        contenedor.innerHTML = `
            <div class="no-rides">
                No hay viajes disponibles con estos filtros.
                <br><br>
                <a href="#publicar-viaje" class="btn btn-primary">Publica el primero</a>
            </div>
        `;
        return;
    }

    // Ordenar viajes por fecha y hora
    viajesAMostrar.sort((a, b) => {
        const fechaHoraA = new Date(a.fecha + ' ' + a.hora);
        const fechaHoraB = new Date(b.fecha + ' ' + b.hora);
        return fechaHoraA - fechaHoraB;
    });

    // Generar HTML para cada viaje
    const html = viajesAMostrar.map(viaje => `
        <div class="ride-card">
            <h3>${viaje.origen} → ${viaje.destino}</h3>
            <div class="ride-info">
                <div class="ride-info-item">
                    <span class="ride-info-label">📅 Fecha:</span>
                    <span class="ride-info-value">${formatearFecha(viaje.fecha)}</span>
                </div>
                <div class="ride-info-item">
                    <span class="ride-info-label">🕐 Hora:</span>
                    <span class="ride-info-value">${viaje.hora}</span>
                </div>
                <div class="ride-info-item">
                    <span class="ride-info-label">👤 Conductor/a:</span>
                    <span class="ride-info-value">${viaje.nombre}</span>
                </div>
                <div class="ride-info-item">
                    <span class="ride-info-label">🪑 Plazas libres:</span>
                    <span class="ride-info-value">${viaje.plazas}</span>
                </div>
            </div>
            <div class="ride-contact">
                <strong>📱 Contacto:</strong> Escríbeme por WhatsApp o llámame al ${viaje.contacto}
            </div>
            ${viaje.notas ? `
                <div class="ride-notes">
                    💬 ${viaje.notas}
                </div>
            ` : ''}
        </div>
    `).join('');

    contenedor.innerHTML = html;
}

// ========================================
// FILTRADO DE VIAJES
// ========================================

/**
 * Filtra los viajes según los criterios seleccionados
 */
function filtrarViajes() {
    const origen = document.getElementById('filter-origen').value.toLowerCase().trim();
    const destino = document.getElementById('filter-destino').value.toLowerCase().trim();
    const fecha = document.getElementById('filter-fecha').value;

    let viajesFiltrados = rides;

    // Filtrar por origen
    if (origen) {
        viajesFiltrados = viajesFiltrados.filter(viaje =>
            viaje.origen.toLowerCase().includes(origen)
        );
    }

    // Filtrar por destino
    if (destino) {
        viajesFiltrados = viajesFiltrados.filter(viaje =>
            viaje.destino.toLowerCase().includes(destino)
        );
    }

    // Filtrar por fecha
    if (fecha) {
        viajesFiltrados = viajesFiltrados.filter(viaje =>
            categorizarFecha(viaje.fecha) === fecha
        );
    }

    renderizarViajes(viajesFiltrados);
}

/**
 * Limpia todos los filtros y muestra todos los viajes
 */
function limpiarFiltros() {
    document.getElementById('filter-origen').value = '';
    document.getElementById('filter-destino').value = '';
    document.getElementById('filter-fecha').value = '';
    renderizarViajes(rides);
}

// ========================================
// PUBLICACIÓN DE VIAJES
// ========================================

/**
 * Maneja el envío del formulario de publicación
 * @param {Event} e - Evento del formulario
 */
function manejarPublicacion(e) {
    e.preventDefault();

    // Obtener valores del formulario
    const nombre = document.getElementById('nombre').value.trim();
    const origen = document.getElementById('origen').value.trim();
    const destino = document.getElementById('destino').value.trim();
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const plazas = parseInt(document.getElementById('plazas').value);
    const contacto = document.getElementById('contacto').value.trim();
    const notas = document.getElementById('notas').value.trim();

    // Validación básica
    if (!nombre || !origen || !destino || !fecha || !hora || !plazas || !contacto) {
        alert('Por favor, rellena todos los campos obligatorios.');
        return;
    }

    // Crear nuevo viaje
    const nuevoViaje = {
        id: Date.now(), // ID único usando timestamp
        nombre,
        origen,
        destino,
        fecha,
        hora,
        plazas,
        contacto,
        notas
    };

    // Añadir el viaje al array
    rides.push(nuevoViaje);

    // Guardar en localStorage
    guardarViajesEnLocalStorage();

    // Re-renderizar la lista de viajes
    renderizarViajes(rides);

    // Mostrar mensaje de éxito
    const mensajeExito = document.getElementById('mensaje-exito');
    mensajeExito.style.display = 'block';

    // Limpiar el formulario
    document.getElementById('form-publicar').reset();

    // Scroll suave a la sección de ver viajes
    setTimeout(() => {
        document.getElementById('ver-viajes').scrollIntoView({ behavior: 'smooth' });

        // Ocultar mensaje de éxito después de 5 segundos
        setTimeout(() => {
            mensajeExito.style.display = 'none';
        }, 5000);
    }, 1000);
}

// ========================================
// INICIALIZACIÓN
// ========================================

/**
 * Inicializa la aplicación cuando el DOM está listo
 */
function inicializar() {
    // Cargar viajes desde localStorage (o usar datos de ejemplo)
    cargarViajesDesdeLocalStorage();

    // Renderizar viajes iniciales
    renderizarViajes(rides);

    // Event listeners para filtros
    document.getElementById('btn-filtrar').addEventListener('click', filtrarViajes);
    document.getElementById('btn-limpiar').addEventListener('click', limpiarFiltros);

    // Filtrar también al presionar Enter en los campos de texto
    document.getElementById('filter-origen').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') filtrarViajes();
    });
    document.getElementById('filter-destino').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') filtrarViajes();
    });

    // Event listener para el formulario de publicación
    document.getElementById('form-publicar').addEventListener('submit', manejarPublicacion);

    // Establecer fecha mínima en el formulario (hoy)
    const inputFecha = document.getElementById('fecha');
    inputFecha.min = obtenerFechaFormateada(0);

    console.log('✅ Vavoy inicializado correctamente');
    console.log(`📊 ${rides.length} viajes cargados`);
}

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}
