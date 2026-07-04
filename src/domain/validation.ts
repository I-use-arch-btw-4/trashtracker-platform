import { ZodError } from "zod";
import { AppError } from "../shared/errors/AppError";

function validate(schema, input) {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError(400, "Datos de entrada invalidos.", error.flatten());
    }

    throw error;
  }
}

export { validate };

