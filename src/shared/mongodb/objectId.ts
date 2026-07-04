import { ObjectId } from "mongodb";
import { AppError } from "../errors/AppError";

function toObjectId(value, fieldName = "id") {
  if (value instanceof ObjectId) {
    return value;
  }

  if (typeof value === "string" && ObjectId.isValid(value)) {
    return new ObjectId(value);
  }

  throw new AppError(400, `${fieldName} debe ser un ObjectId valido.`);
}

function toOptionalObjectId(value, fieldName = "id") {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return toObjectId(value, fieldName);
}

export { toObjectId, toOptionalObjectId };

