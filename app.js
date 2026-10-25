/**
 * Proyecto CRUD Personajes
 * Universidad La Salle Bajío
 */

const STORAGE_KEY = 'personajes_multiverso_v1';

// Estado global en memoria
let personajes = [];

// Selección de elementos del DOM
const gridEl = document.getElementById('characters-grid');
const emptyStateEl = document.getElementById('empty-state');
const emptyTitleEl = document.getElementById('empty-title');
const emptyMsgEl = document.getElementById('empty-msg');
const searchInput = document.getElementById('search-input');
const searchCountEl = document.getElementById('search-count');
const btnClearSearch = document.getElementById('btn-clear-search');
const btnResetData = document.getElementById('btn-reset-data');
const btnOpenCreateModal = document.getElementById('btn-open-create-modal');

// Modales
const modalDetail = document.getElementById('modal-detail');
const modalForm = document.getElementById('modal-form');
const characterForm = document.getElementById('character-form');
const btnSaveCharacter = document.getElementById('btn-save-character');

// Pagina PRINCIPAL
document.addEventListener('DOMContentLoaded', () => {
  cargarPersonajes();
  setupEventListeners();
  renderizarGrid();
});

// LOCALSTORAGE 

function cargarPersonajes() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData) {
      personajes = JSON.parse(rawData);
      if (!Array.isArray(personajes)) throw new Error("JSON no es un arreglo");
    } else {
      personajes = window.PERSONAJES_EJEMPLO.map(personaje => ({ ...personaje }));
    }
  } catch (error) {
    console.error("Error al leer de localStorage / JSON Corrupto:", error);
    // Manejo defensivo (CA-02, Pregunta 4)
    personajes = [];
    localStorage.removeItem(STORAGE_KEY);
  }
}

function guardarPersonajes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(personajes));
}


function renderizarGrid(filtroTexto = '') {
  gridEl.innerHTML = '';
  
  const query = filtroTexto.trim().toLowerCase();
  let resultados = [];

  // Implementación del filtrado con un ciclo let y const
  let idx = 0;
  while (idx < personajes.length) {
    const p = personajes[idx];
    const matchName = p.nombre.toLowerCase().includes(query);
    const matchRole = p.rol.toLowerCase().includes(query);
    const matchOrigin = (p.origen || '').toLowerCase().includes(query);

    if (matchName || matchRole || matchOrigin) {
      resultados.push(p);
    }
    idx++;
  }

  // Actualizar contador
  searchCountEl.textContent = `${resultados.length} de ${personajes.length} mostrados`;

  // Manejo de registros (si es que están vacios)
  if (personajes.length === 0) {
    gridEl.classList.add('is-hidden');
    emptyStateEl.classList.remove('is-hidden');
    emptyTitleEl.textContent = 'Registro(s) vacio(s)';
    emptyMsgEl.textContent = 'No hay personajes guardados actualmente (Registre uno nuevo arriba).';
    return;
  }

  if (resultados.length === 0) {
    gridEl.classList.add('is-hidden');
    emptyStateEl.classList.remove('is-hidden');
    emptyTitleEl.textContent = 'Sin Coincidencias';
    emptyMsgEl.textContent = `No se encontró ningun personaje para "${filtroTexto}".`;
    return;
  }

  // Mostrar Grid
  emptyStateEl.classList.add('is-hidden');
  gridEl.classList.remove('is-hidden');

 
  resultados.forEach(p => {
    const col = document.createElement('div');
    col.className = 'column is-12-mobile is-6-tablet is-4-desktop';

    const fallbackImg = `https://via.placeholder.com/300x375/209cee/ffffff?text=${encodeURIComponent(p.nombre)}`;

    col.innerHTML = `
      <div class="card">
        <div class="card-image">
          <figure class="image is-4by3">
            <img src="${p.imagen || fallbackImg}" alt="${p.nombre}" class="rounded-img" onerror="this.src='${fallbackImg}'">
          </figure>
        </div>
        <div class="card-content">
          <span class="tag is-primary mb-2">${p.rol}</span>
          <h4 class="title is-4 mb-1">${p.nombre}</h4>
          <p class="subtitle is-7 has-text-white mb-2"><i class="fas fa-globe"></i> ${p.origen || 'Universo Desconocido'}</p>
          <p class="has-text-white-dark is-size-7 mb-3 line-clamp-2">${p.descripcion}</p>
        </div>
        <footer class="card-footer">
          <button class="card-footer-item button is-white has-text-info" onclick="verDetalle('${p.id}')">
            <i class="fas fa-eye mr-1"></i> Detalle
          </button>
          <button class="card-footer-item button is-white has-text-warning-dark" onclick="abrirModalEditar('${p.id}')">
            <i class="fas fa-edit mr-1"></i> Editar
          </button>
          <button class="card-footer-item button is-white has-text-danger" onclick="eliminarPersonaje('${p.id}')">
            <i class="fas fa-trash mr-1"></i> Borrar
          </button>
        </footer>
      </div>
    `;

    gridEl.appendChild(col);
  });
}

//  CRUD
window.verDetalle = function(id) {
  const p = personajes.find(item => item.id === id);
  if (!p) return;

  document.getElementById('detail-title').textContent = `Detalle: ${p.nombre}`;
  document.getElementById('detail-name').textContent = p.nombre;
  document.getElementById('detail-role').textContent = p.rol;
  document.getElementById('detail-origin').textContent = p.origen || 'Desconocido';
  document.getElementById('detail-desc').textContent = p.descripcion;
  document.getElementById('detail-img').src = p.imagen || 'https://via.placeholder.com/300x375?text=Sin+Imagen';
  
  const fecha = p.fechaCreacion ? new Date(p.fechaCreacion).toLocaleString('es-MX') : 'N/A';
  document.getElementById('detail-date').textContent = fecha;

  modalDetail.classList.add('is-active');
};
//Agregar personaje con function
function abrirModalCrear() {
  characterForm.reset();
  document.getElementById('form-id').value = '';
  document.getElementById('form-modal-title').textContent = 'Agregar Nuevo Personaje';
  limpiarErroresFormulario();
  modalForm.classList.add('is-active');
}
//Categorias de personaje con const y eso :p
window.abrirModalEditar = function(id) {
  const p = personajes.find(item => item.id === id);
  if (!p) return;

  characterForm.reset();
  limpiarErroresFormulario();

  document.getElementById('form-id').value = p.id;
  document.getElementById('form-name').value = p.nombre;
  document.getElementById('form-role').value = p.rol;
  document.getElementById('form-origin').value = p.origen || '';
  document.getElementById('form-image').value = p.imagen || '';
  document.getElementById('form-desc').value = p.descripcion;

  document.getElementById('form-modal-title').textContent = `Editar Personaje: ${p.nombre}`;
  modalForm.classList.add('is-active');
};

function guardarFormulario() {
  if (!validarFormulario()) return;

  const id = document.getElementById('form-id').value;
  const nombre = document.getElementById('form-name').value.trim();
  const rol = document.getElementById('form-role').value;
  const Franquicia = document.getElementById('form-origin').value.trim();
  const imagen = document.getElementById('form-image').value.trim();
  const descripcion = document.getElementById('form-desc').value.trim();

  if (id) {
    // Editar
    const index = personajes.findIndex(c => c.id === id);
    if (index !== -1) {
      personajes[index] = {
        ...personajes[index],
        nombre, rol, Franquicia, imagen, descripcion
      };
    }
  } else {
    // Crear nuevo con ID nuevo xd
    const nuevo = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'c-' + Date.now(),
      nombre,
      rol,
      Franquicia,
      imagen,
      descripcion,
      fechaCreacion: new Date().toISOString()
    };
    personajes.unshift(nuevo);
  }

  guardarPersonajes();
  renderizarGrid(searchInput.value);
  cerrarModales();
}

window.eliminarPersonaje = function(id) {
  const p = personajes.find(c => c.id === id);
  if (!p) return;

  if (confirm(`¿Neta vas a eliminar a "${p.nombre}" de Mi colección?`)) {
    personajes = personajes.filter(c => c.id !== id);
    guardarPersonajes();
    renderizarGrid(searchInput.value);
  }
};



function validarFormulario() {
  let esValido = true;
  limpiarErroresFormulario();

  const nombre = document.getElementById('form-name').value.trim();
  const rol = document.getElementById('form-role').value;
  const origen = document.getElementById('form-origin').value.trim();
  const desc = document.getElementById('form-desc').value.trim();

  if (!nombre) {
    document.getElementById('err-name').classList.remove('is-hidden');
    esValido = false;
  }

  if (!rol) {
    document.getElementById('err-role').classList.remove('is-hidden');
    esValido = false;
  }

  if (!origen) {
    document.getElementById('err-origin').classList.remove('is-hidden');
    esValido = false;
  }

  if (!desc) {
    document.getElementById('err-desc').classList.remove('is-hidden');
    esValido = false;
  }

  return esValido;
}

function limpiarErroresFormulario() {
  document.querySelectorAll('.help.is-danger').forEach(el => el.classList.add('is-hidden'));
}

function cerrarModales() {
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('is-active'));
}

// --- EVENT LISTENERS ---

function setupEventListeners() {
  searchInput.addEventListener('input', (e) => renderizarGrid(e.target.value));

  btnClearSearch.addEventListener('click', () => {
    searchInput.value = '';
    renderizarGrid();
  });

  btnOpenCreateModal.addEventListener('click', abrirModalCrear);
  btnSaveCharacter.addEventListener('click', guardarFormulario);

  document.querySelectorAll('.btn-close-modal, .modal-background').forEach(btn => {
    btn.addEventListener('click', cerrarModales);
  });

  btnResetData.addEventListener('click', () => {
    personajes = window.PERSONAJES_EJEMPLO.map(personaje => ({ ...personaje }));
    guardarPersonajes();
    renderizarGrid();
  });
}