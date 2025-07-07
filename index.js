const URL_API = 'https://rickandmortyapi.com/api/character';
const contenedorResultados = document.getElementById('contenedorResultados');
const botonObtenerTodos = document.getElementById('botonObtenerTodos');
const formularioFiltros = document.getElementById('formularioFiltros');
const botonAnterior = document.getElementById('botonAnterior');
const botonSiguiente = document.getElementById('botonSiguiente');
const informacionPagina = document.getElementById('informacionPagina');

// Estado global
let paginaActual = 1;
let totalPaginas = 1;
let filtrosActuales = {};

// Lista los personajes en tarjetas
function listarPersonajes(personajes = []) {
  contenedorResultados.innerHTML = '';
  
  if (!personajes.length) {
    contenedorResultados.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No se encontraron personajes.</p>';
    return;
  }
  
  personajes.forEach(personaje => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-personaje';
    
    tarjeta.innerHTML = `
      <img src="${personaje.image}" alt="${personaje.name}">
      <h3>${personaje.name}</h3>
      <p><b>Estado:</b> ${personaje.status}</p>
      <p><b>Especie:</b> ${personaje.species}</p>
      <p><b>Tipo:</b> ${personaje.type || 'N/A'}</p>
      <p><b>Género:</b> ${personaje.gender}</p>
      <p><b>Origen:</b> ${personaje.origin.name}</p>
    `;
    
    contenedorResultados.appendChild(tarjeta);
  });
}

// Actualiza los controles de paginación
function actualizarPaginacion(informacion) {
  paginaActual = informacion.paginaActual || 1;
  totalPaginas = informacion.paginas || 1;
  
  informacionPagina.textContent = `Página ${paginaActual} de ${totalPaginas}`;
  botonAnterior.disabled = paginaActual <= 1;
  botonSiguiente.disabled = paginaActual >= totalPaginas;
}

// Obtiene personajes de la API (con o sin filtros)
async function obtenerPersonajes(parametros = {}, pagina = 1) {
  let url = URL_API;
  const parametrosConsulta = { ...parametros, page: pagina };
  const consulta = new URLSearchParams(parametrosConsulta).toString();
  
  if (consulta) {
    url += `?${consulta}`;
  }
  
  contenedorResultados.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Cargando...</p>';
  
  try {
    const respuesta = await fetch(url);
    
    if (!respuesta.ok) {
      throw new Error('No se encontraron personajes');
    }
    
    const datos = await respuesta.json();
    
    listarPersonajes(datos.results);
    actualizarPaginacion({
      paginaActual: pagina,
      paginas: datos.info.pages,
      cantidad: datos.info.count
    });
    
  } catch (error) {
    contenedorResultados.innerHTML = `<p style="text-align: center; grid-column: 1/-1; color: #ff6b6b;">${error.message}</p>`;
    actualizarPaginacion({ paginaActual: 1, paginas: 1 });
  }
}

// Obtiene los filtros del formulario
function obtenerFiltros() {
  return {
    name: document.getElementById('nombre').value.trim(),
    status: document.getElementById('estado').value.trim(),
    species: document.getElementById('especie').value.trim(),
    type: document.getElementById('tipo').value.trim(),
    gender: document.getElementById('genero').value.trim(),
  };
}

// Limpia filtros vacíos
function limpiarFiltros(filtros) {
  const filtrosLimpios = {};
  
  Object.keys(filtros).forEach(clave => {
    if (filtros[clave]) {
      filtrosLimpios[clave] = filtros[clave];
    }
  });
  
  return filtrosLimpios;
}

// Evento: Obtener todos los personajes (primera página)
botonObtenerTodos.addEventListener('click', (evento) => {
  evento.preventDefault();
  
  filtrosActuales = {};
  paginaActual = 1;
  obtenerPersonajes({}, 1);
});

// Evento: Filtrar personajes
formularioFiltros.addEventListener('submit', (evento) => {
  evento.preventDefault();
  
  filtrosActuales = limpiarFiltros(obtenerFiltros());
  paginaActual = 1;
  obtenerPersonajes(filtrosActuales, 1);
});

// Evento: Página anterior
botonAnterior.addEventListener('click', () => {
  if (paginaActual > 1) {
    paginaActual--;
    obtenerPersonajes(filtrosActuales, paginaActual);
  }
});

// Evento: Página siguiente
botonSiguiente.addEventListener('click', () => {
  if (paginaActual < totalPaginas) {
    paginaActual++;
    obtenerPersonajes(filtrosActuales, paginaActual);
  }
});

// Cargar personajes iniciales
obtenerPersonajes({}, 1);
