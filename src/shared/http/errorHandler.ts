import { AppError } from "../errors/AppError";

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        message: error.message,
        details: error.details
      }
    });
  }

  if (error && error.code === 11000) {
    return res.status(409).json({
      error: {
        message: "Ya existe un documento con un valor unico repetido.",
        details: error.keyValue
      }
    });
  }

  return res.status(500).json({
    error: {
      message: "Error interno del servidor."
    }
  });
}

export { errorHandler };

