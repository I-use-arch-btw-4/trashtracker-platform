import { writeFileSync } from "node:fs";
import { join } from "node:path";

type PostmanItem = {
  name: string;
  description?: string;
  event?: unknown[];
  request?: unknown;
  item?: PostmanItem[];
};

const outputPath = join(process.cwd(), "docs/pc4/trashtracker-pc4.postman_collection.json");
const jsonHeader = [{ key: "Content-Type", value: "application/json" }];

const ids = {
  usuarioId: "665000000000000000000001",
  usuarioSecundarioId: "665000000000000000000004",
  liderId: "665000000000000000000003",
  reporteId: "665000000000000000000101",
  comunidadId: "665000000000000000000201",
  eventoId: "665000000000000000000301",
  comercioId: "665000000000000000000401",
  recompensaId: "665000000000000000000501",
  canjeId: "665000000000000000000601",
  mensajeId: "665000000000000000000701",
  notificacionId: "665000000000000000000901"
};

function saveId(variableName: string) {
  return [{
    listen: "test",
    script: {
      type: "text/javascript",
      exec: [
        "const body = pm.response.json();",
        `if (body.data && body.data._id) pm.collectionVariables.set("${variableName}", body.data._id);`
      ]
    }
  }];
}

function request(name: string, method: string, url: string, body?: Record<string, unknown>, event?: unknown[]): PostmanItem {
  const item: PostmanItem = {
    name,
    request: {
      method,
      header: body ? jsonHeader : [],
      url
    }
  };

  if (body) {
    item.request = {
      method,
      header: jsonHeader,
      body: {
        mode: "raw",
        raw: JSON.stringify(body, null, 2),
        options: {
          raw: {
            language: "json"
          }
        }
      },
      url
    };
  }

  if (event) item.event = event;
  return item;
}

function folder(name: string, items: PostmanItem[]): PostmanItem {
  return { name, item: items };
}

const collection = {
  info: {
    name: "TrashTracker PC4 - Application Tier",
    description: "Coleccion organizada por recurso para evidenciar todos los endpoints REST de la capa de aplicacion PC4.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  variable: [
    { key: "serverUrl", value: "http://localhost:3000" },
    { key: "baseUrl", value: "http://localhost:3000/api/v1" },
    ...Object.entries(ids).map(([key, value]) => ({ key, value })),
    { key: "usuarioCreadoId", value: "" },
    { key: "reporteCreadoId", value: "" },
    { key: "comunidadCreadaId", value: "" },
    { key: "eventoCreadoId", value: "" },
    { key: "comercioCreadoId", value: "" },
    { key: "recompensaCreadaId", value: "" },
    { key: "canjeCreadoId", value: "" },
    { key: "mensajeCreadoId", value: "" },
    { key: "notificacionCreadaId", value: "" }
  ],
  item: [
    folder("00 Sistema", [
      request("GET API root", "GET", "{{serverUrl}}/"),
      request("GET Health", "GET", "{{serverUrl}}/api/health")
    ]),
    folder("01 Dashboard", [
      request("GET Resumen", "GET", "{{baseUrl}}/dashboard/resumen")
    ]),
    folder("02 Usuarios", [
      request("GET Listar usuarios", "GET", "{{baseUrl}}/usuarios?page=1&limit=20"),
      request("POST Crear usuario", "POST", "{{baseUrl}}/usuarios", {
        nombre: "Lucia Verde",
        correo: "lucia.verde+{{$timestamp}}@trashtracker.pe",
        distrito: "Comas",
        rol: "ciudadano",
        perfil: {
          biografia: "Voluntaria ambiental",
          intereses: ["reciclaje", "mapas"]
        },
        preferencias: {
          idioma: "es",
          notificaciones: true
        }
      }, saveId("usuarioCreadoId")),
      request("GET Obtener usuario por id", "GET", "{{baseUrl}}/usuarios/{{usuarioId}}"),
      request("PATCH Actualizar usuario", "PATCH", "{{baseUrl}}/usuarios/{{usuarioId}}", {
        distrito: "Comas",
        perfil: {
          biografia: "Perfil actualizado desde Postman",
          intereses: ["reciclaje", "voluntariado"]
        }
      }),
      request("DELETE Eliminar usuario", "DELETE", "{{baseUrl}}/usuarios/{{usuarioCreadoId}}")
    ]),
    folder("03 Reportes", [
      request("GET Listar reportes", "GET", "{{baseUrl}}/reportes?page=1&limit=20&distrito=Comas"),
      request("POST Crear reporte", "POST", "{{baseUrl}}/reportes", {
        usuarioId: "{{usuarioId}}",
        titulo: "Basura acumulada junto a colegio",
        descripcion: "Se observa acumulacion de bolsas y residuos mixtos cerca al ingreso principal.",
        distrito: "Comas",
        tipoResiduo: "mixto",
        ubicacion: {
          coordinates: [-77.052, -11.948],
          direccion: "Av. Tupac Amaru, Comas"
        },
        multimedia: [{
          tipo: "foto",
          url: "https://cdn.trashtracker.pe/reportes/colegio-1.jpg",
          descripcion: "Evidencia del punto critico"
        }]
      }, saveId("reporteCreadoId")),
      request("GET Obtener reporte por id", "GET", "{{baseUrl}}/reportes/{{reporteId}}"),
      request("PATCH Actualizar reporte", "PATCH", "{{baseUrl}}/reportes/{{reporteId}}", {
        estado: "en_proceso",
        prioridad: 4
      }),
      request("DELETE Eliminar reporte", "DELETE", "{{baseUrl}}/reportes/{{reporteCreadoId}}"),
      request("POST Agregar comentario", "POST", "{{baseUrl}}/reportes/{{reporteId}}/comentarios", {
        usuarioId: "{{usuarioSecundarioId}}",
        contenido: "Confirmo que el punto sigue activo."
      }),
      request("POST Validar reporte", "POST", "{{baseUrl}}/reportes/{{reporteId}}/validaciones", {
        usuarioId: "{{usuarioSecundarioId}}",
        tipo: "confirma"
      }),
      request("POST Agregar reaccion", "POST", "{{baseUrl}}/reportes/{{reporteId}}/reacciones", {
        usuarioId: "{{usuarioSecundarioId}}",
        tipo: "importante"
      })
    ]),
    folder("04 Comunidades", [
      request("GET Listar comunidades", "GET", "{{baseUrl}}/comunidades?page=1&limit=20"),
      request("POST Crear comunidad", "POST", "{{baseUrl}}/comunidades", {
        nombre: "Guardianes PC4 {{$timestamp}}",
        distrito: "Comas",
        descripcion: "Comunidad creada desde Postman para validar la capa de aplicacion.",
        liderId: "{{liderId}}"
      }, saveId("comunidadCreadaId")),
      request("GET Obtener comunidad por id", "GET", "{{baseUrl}}/comunidades/{{comunidadId}}"),
      request("PATCH Actualizar comunidad", "PATCH", "{{baseUrl}}/comunidades/{{comunidadId}}", {
        descripcion: "Descripcion actualizada desde Postman",
        estado: "activa"
      }),
      request("DELETE Eliminar comunidad", "DELETE", "{{baseUrl}}/comunidades/{{comunidadCreadaId}}"),
      request("POST Agregar miembro", "POST", "{{baseUrl}}/comunidades/{{comunidadId}}/miembros", {
        usuarioId: "{{usuarioSecundarioId}}",
        rolComunidad: "miembro"
      })
    ]),
    folder("05 Eventos de limpieza", [
      request("GET Listar eventos", "GET", "{{baseUrl}}/eventos-limpieza?page=1&limit=20"),
      request("POST Crear evento", "POST", "{{baseUrl}}/eventos-limpieza", {
        titulo: "Limpieza comunitaria PC4",
        comunidadId: "{{comunidadId}}",
        organizadorId: "{{liderId}}",
        reporteId: "{{reporteId}}",
        descripcion: "Evento creado desde API REST para evidenciar la capa de aplicacion.",
        fechaEvento: "2026-07-20T15:00:00Z",
        ubicacion: {
          coordinates: [-77.047, -11.944],
          direccion: "Parque central, Comas"
        }
      }, saveId("eventoCreadoId")),
      request("GET Obtener evento por id", "GET", "{{baseUrl}}/eventos-limpieza/{{eventoId}}"),
      request("PATCH Actualizar evento", "PATCH", "{{baseUrl}}/eventos-limpieza/{{eventoId}}", {
        estado: "programado",
        descripcion: "Evento actualizado desde Postman"
      }),
      request("DELETE Eliminar evento", "DELETE", "{{baseUrl}}/eventos-limpieza/{{eventoCreadoId}}"),
      request("POST Agregar asistente", "POST", "{{baseUrl}}/eventos-limpieza/{{eventoId}}/asistentes", {
        usuarioId: "{{usuarioSecundarioId}}",
        estadoAsistencia: "confirmado"
      }),
      request("POST Agregar evidencia", "POST", "{{baseUrl}}/eventos-limpieza/{{eventoId}}/evidencias", {
        tipo: "foto",
        url: "https://cdn.trashtracker.pe/eventos/evidencia-pc4.jpg",
        descripcion: "Evidencia de limpieza",
        usuarioId: "{{usuarioId}}"
      })
    ]),
    folder("06 Comercios", [
      request("GET Listar comercios", "GET", "{{baseUrl}}/comercios?page=1&limit=20"),
      request("POST Crear comercio", "POST", "{{baseUrl}}/comercios", {
        nombre: "EcoMarket PC4 {{$timestamp}}",
        rubro: "Tienda sostenible",
        direccion: "Av. Universitaria 123",
        distrito: "Comas",
        contacto: "contacto@ecomarket.pe",
        estado: "activo"
      }, saveId("comercioCreadoId")),
      request("GET Obtener comercio por id", "GET", "{{baseUrl}}/comercios/{{comercioId}}"),
      request("PATCH Actualizar comercio", "PATCH", "{{baseUrl}}/comercios/{{comercioId}}", {
        contacto: "alianzas@ecomarket.pe",
        estado: "activo"
      }),
      request("DELETE Eliminar comercio", "DELETE", "{{baseUrl}}/comercios/{{comercioCreadoId}}")
    ]),
    folder("07 Recompensas", [
      request("GET Listar recompensas", "GET", "{{baseUrl}}/recompensas?page=1&limit=20"),
      request("POST Crear recompensa", "POST", "{{baseUrl}}/recompensas", {
        comercioId: "{{comercioId}}",
        nombre: "Descuento PC4 {{$timestamp}}",
        descripcion: "Beneficio creado para validar recompensas desde Postman.",
        puntosRequeridos: 50,
        stock: 10,
        estado: "disponible"
      }, saveId("recompensaCreadaId")),
      request("GET Obtener recompensa por id", "GET", "{{baseUrl}}/recompensas/{{recompensaId}}"),
      request("PATCH Actualizar recompensa", "PATCH", "{{baseUrl}}/recompensas/{{recompensaId}}", {
        stock: 8,
        estado: "disponible"
      }),
      request("DELETE Eliminar recompensa", "DELETE", "{{baseUrl}}/recompensas/{{recompensaCreadaId}}")
    ]),
    folder("08 Canjes", [
      request("GET Listar canjes", "GET", "{{baseUrl}}/canjes?page=1&limit=20"),
      request("POST Crear canje", "POST", "{{baseUrl}}/canjes", {
        usuarioId: "{{usuarioId}}",
        recompensaId: "{{recompensaId}}"
      }, saveId("canjeCreadoId")),
      request("GET Obtener canje por id", "GET", "{{baseUrl}}/canjes/{{canjeId}}"),
      request("PATCH Actualizar canje", "PATCH", "{{baseUrl}}/canjes/{{canjeId}}", {
        estado: "usado"
      }),
      request("DELETE Eliminar canje", "DELETE", "{{baseUrl}}/canjes/{{canjeCreadoId}}")
    ]),
    folder("09 Mensajes comunidad", [
      request("GET Listar mensajes", "GET", "{{baseUrl}}/mensajes-comunidad?page=1&limit=20&comunidadId={{comunidadId}}"),
      request("POST Crear mensaje", "POST", "{{baseUrl}}/mensajes-comunidad", {
        comunidadId: "{{comunidadId}}",
        usuarioId: "{{usuarioId}}",
        contenido: "Mensaje creado desde Postman para validar el flujo comunitario.",
        tipoMensaje: "texto",
        multimedia: []
      }, saveId("mensajeCreadoId")),
      request("GET Obtener mensaje por id", "GET", "{{baseUrl}}/mensajes-comunidad/{{mensajeId}}"),
      request("PATCH Actualizar mensaje", "PATCH", "{{baseUrl}}/mensajes-comunidad/{{mensajeId}}", {
        contenido: "Mensaje actualizado desde Postman",
        estado: "visible"
      }),
      request("DELETE Eliminar mensaje", "DELETE", "{{baseUrl}}/mensajes-comunidad/{{mensajeCreadoId}}"),
      request("POST Agregar reaccion", "POST", "{{baseUrl}}/mensajes-comunidad/{{mensajeId}}/reacciones", {
        usuarioId: "{{usuarioSecundarioId}}",
        tipo: "apoyo"
      })
    ]),
    folder("10 Notificaciones", [
      request("GET Listar notificaciones", "GET", "{{baseUrl}}/notificaciones?page=1&limit=20&usuarioId={{usuarioId}}"),
      request("POST Crear notificacion", "POST", "{{baseUrl}}/notificaciones", {
        usuarioId: "{{usuarioId}}",
        tipo: "reporte",
        titulo: "Reporte actualizado",
        mensaje: "Tu reporte recibio una nueva validacion.",
        referenciaId: "{{reporteId}}"
      }, saveId("notificacionCreadaId")),
      request("GET Obtener notificacion por id", "GET", "{{baseUrl}}/notificaciones/{{notificacionId}}"),
      request("PATCH Marcar como leida", "PATCH", "{{baseUrl}}/notificaciones/{{notificacionId}}/leida"),
      request("DELETE Eliminar notificacion", "DELETE", "{{baseUrl}}/notificaciones/{{notificacionCreadaId}}")
    ])
  ]
};

writeFileSync(outputPath, `${JSON.stringify(collection, null, 2)}\n`);
console.log(`Postman collection generated at ${outputPath}`);
