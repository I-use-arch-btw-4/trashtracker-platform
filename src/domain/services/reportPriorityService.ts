const basePriorityByWasteType = {
  desmonte: 5,
  peligroso: 5,
  organico: 3,
  plastico: 3,
  reciclable: 2,
  mixto: 4
};

function calculateInitialPriority({ tipoResiduo, multimedia = [], priority }) {
  if (priority !== undefined && priority !== null) {
    return Math.min(Math.max(Number(priority), 1), 5);
  }

  const base = basePriorityByWasteType[String(tipoResiduo || "").toLowerCase()] || 3;
  const multimediaBoost = multimedia.length > 0 ? 1 : 0;

  return Math.min(base + multimediaBoost, 5);
}

function increasePriority(currentPriority, amount = 1) {
  return Math.min(Number(currentPriority || 1) + amount, 5);
}

export { calculateInitialPriority, increasePriority };

