function calculateLevel(points) {
  return Math.max(1, Math.floor(Math.max(points, 0) / 50) + 1);
}

const pointReasons = {
  reportCreated: { points: 10, reason: "Reporte ambiental publicado" },
  reportValidated: { points: 5, reason: "Validacion de reporte ciudadano" },
  reportCommented: { points: 2, reason: "Comentario en reporte ambiental" },
  eventOrganized: { points: 20, reason: "Organizacion de evento de limpieza" },
  eventAttendance: { points: 15, reason: "Confirmacion de asistencia a evento" }
};

export { calculateLevel, pointReasons };

