import { ObjectId } from "mongodb";

type SeedData = Record<string, any[]>;

class InMemoryCursor {
  private rows: any[];

  constructor(rows: any[]) {
    this.rows = rows;
  }

  sort(sortSpec: Record<string, 1 | -1>) {
    const entries = Object.entries(sortSpec);
    this.rows = [...this.rows].sort((left, right) => {
      for (const [field, direction] of entries) {
        const leftValue = comparableValue(getByPath(left, field));
        const rightValue = comparableValue(getByPath(right, field));

        if (leftValue < rightValue) return direction === 1 ? -1 : 1;
        if (leftValue > rightValue) return direction === 1 ? 1 : -1;
      }

      return 0;
    });

    return this;
  }

  skip(count: number) {
    this.rows = this.rows.slice(count);
    return this;
  }

  limit(count: number) {
    this.rows = this.rows.slice(0, count);
    return this;
  }

  async toArray() {
    return cloneValue(this.rows);
  }

  toArraySync() {
    return cloneValue(this.rows);
  }
}

class InMemoryCollection {
  private documents: any[];

  constructor(documents: any[]) {
    this.documents = documents;
  }

  find(filter: Record<string, any> = {}, options: any = {}) {
    const rows = this.documents
      .filter((document) => matchesFilter(document, filter))
      .map((document) => projectDocument(document, options.projection));

    return new InMemoryCursor(rows);
  }

  async findOne(filter: Record<string, any> = {}, options: any = {}) {
    const document = this.documents.find((item) => matchesFilter(item, filter));
    return document ? cloneValue(projectDocument(document, options.projection)) : null;
  }

  async countDocuments(filter: Record<string, any> = {}) {
    return this.documents.filter((document) => matchesFilter(document, filter)).length;
  }

  async insertOne(document: any) {
    const documentToInsert = cloneValue(document);
    if (!documentToInsert._id) {
      documentToInsert._id = new ObjectId();
    }

    this.documents.push(documentToInsert);
    return { insertedId: cloneValue(documentToInsert._id) };
  }

  async updateOne(filter: Record<string, any>, update: Record<string, any>) {
    const document = this.documents.find((item) => matchesFilter(item, filter));
    if (!document) {
      return { matchedCount: 0, modifiedCount: 0 };
    }

    applyUpdate(document, update);
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async deleteOne(filter: Record<string, any>) {
    const index = this.documents.findIndex((item) => matchesFilter(item, filter));
    if (index === -1) {
      return { deletedCount: 0 };
    }

    this.documents.splice(index, 1);
    return { deletedCount: 1 };
  }

  async findOneAndUpdate(filter: Record<string, any>, update: Record<string, any>, options: any = {}) {
    const document = this.documents.find((item) => matchesFilter(item, filter));
    if (!document) return null;

    const before = cloneValue(document);
    applyUpdate(document, update);

    if (options.returnDocument === "before") {
      return before;
    }

    return cloneValue(document);
  }

  aggregate(pipeline: any[] = []) {
    let rows = cloneValue(this.documents);

    for (const stage of pipeline) {
      if (stage.$group) {
        rows = groupRows(rows, stage.$group);
      }

      if (stage.$sort) {
        rows = new InMemoryCursor(rows).sort(stage.$sort).toArraySync();
      }
    }

    return {
      async toArray() {
        return cloneValue(rows);
      }
    };
  }
}

function createInMemoryDb(seedData: SeedData = {}) {
  const collections = new Map<string, any[]>();

  for (const [collectionName, documents] of Object.entries(seedData)) {
    collections.set(collectionName, cloneValue(documents));
  }

  return {
    async command(command: Record<string, any>) {
      if (command.ping) {
        return { ok: 1 };
      }

      return { ok: 1 };
    },
    collection(collectionName: string) {
      if (!collections.has(collectionName)) {
        collections.set(collectionName, []);
      }

      return new InMemoryCollection(collections.get(collectionName) || []);
    }
  };
}

function cloneValue<T>(value: T): T {
  if (value instanceof ObjectId) {
    return new ObjectId(value.toHexString()) as T;
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item)) as T;
  }

  if (value && typeof value === "object") {
    const copy: Record<string, any> = {};
    for (const [key, item] of Object.entries(value)) {
      copy[key] = cloneValue(item);
    }

    return copy as T;
  }

  return value;
}

function getByPath(document: any, path: string) {
  return path.split(".").reduce((value, segment) => value?.[segment], document);
}

function setByPath(document: any, path: string, value: any) {
  const segments = path.split(".");
  const lastSegment = segments.pop();
  let cursor = document;

  for (const segment of segments) {
    if (!cursor[segment] || typeof cursor[segment] !== "object") {
      cursor[segment] = {};
    }

    cursor = cursor[segment];
  }

  if (lastSegment) {
    cursor[lastSegment] = cloneValue(value);
  }
}

function comparableValue(value: any) {
  if (value instanceof Date) return value.getTime();
  if (value instanceof ObjectId) return value.toHexString();
  if (value === undefined || value === null) return "";
  return value;
}

function valuesAreEqual(left: any, right: any) {
  if (left instanceof ObjectId || right instanceof ObjectId) {
    return String(left) === String(right);
  }

  if (left instanceof Date || right instanceof Date) {
    return new Date(left).getTime() === new Date(right).getTime();
  }

  return left === right;
}

function matchesFilter(document: any, filter: Record<string, any>) {
  return Object.entries(filter).every(([field, expected]) => {
    const actual = getByPath(document, field);

    if (expected && typeof expected === "object" && !(expected instanceof ObjectId) && !(expected instanceof Date) && !Array.isArray(expected)) {
      if ("$in" in expected) {
        return expected.$in.some((value: any) => valuesAreEqual(actual, value));
      }

      if ("$ne" in expected) {
        return !valuesAreEqual(actual, expected.$ne);
      }
    }

    return valuesAreEqual(actual, expected);
  });
}

function projectDocument(document: any, projection?: Record<string, 0 | 1>) {
  if (!projection) {
    return cloneValue(document);
  }

  const includedFields = Object.entries(projection)
    .filter(([, value]) => value === 1)
    .map(([field]) => field);

  if (includedFields.length === 0) {
    return cloneValue(document);
  }

  const projected: Record<string, any> = {};
  for (const field of includedFields) {
    const value = getByPath(document, field);
    if (value !== undefined) {
      setByPath(projected, field, value);
    }
  }

  if (projection._id !== 0 && document._id) {
    projected._id = cloneValue(document._id);
  }

  return projected;
}

function applyUpdate(document: any, update: Record<string, any>) {
  if (update.$set) {
    for (const [field, value] of Object.entries(update.$set)) {
      setByPath(document, field, value);
    }
  }

  if (update.$inc) {
    for (const [field, value] of Object.entries(update.$inc)) {
      const current = Number(getByPath(document, field) || 0);
      setByPath(document, field, current + Number(value));
    }
  }

  if (update.$push) {
    for (const [field, value] of Object.entries(update.$push)) {
      const current = getByPath(document, field);
      if (!Array.isArray(current)) {
        setByPath(document, field, []);
      }

      getByPath(document, field).push(cloneValue(value));
    }
  }
}

function groupRows(rows: any[], groupSpec: Record<string, any>) {
  const groupField = typeof groupSpec._id === "string" && groupSpec._id.startsWith("$")
    ? groupSpec._id.slice(1)
    : null;
  const groups = new Map<string, any>();

  for (const row of rows) {
    const groupValue = groupField ? getByPath(row, groupField) : groupSpec._id;
    const groupKey = String(groupValue);

    if (!groups.has(groupKey)) {
      groups.set(groupKey, { _id: groupValue });
    }

    const aggregate = groups.get(groupKey);

    for (const [field, expression] of Object.entries(groupSpec)) {
      if (field === "_id") continue;

      if (expression?.$sum !== undefined) {
        aggregate[field] = Number(aggregate[field] || 0) + sumValue(row, expression.$sum);
      }

      if (expression?.$avg) {
        const trackerKey = `__avg_${field}`;
        const tracker = aggregate[trackerKey] || { sum: 0, count: 0 };
        const value = Number(getByPath(row, String(expression.$avg).slice(1)) || 0);
        aggregate[trackerKey] = {
          sum: tracker.sum + value,
          count: tracker.count + 1
        };
      }
    }
  }

  return [...groups.values()].map((aggregate) => {
    for (const key of Object.keys(aggregate)) {
      if (!key.startsWith("__avg_")) continue;

      const targetField = key.replace("__avg_", "");
      aggregate[targetField] = aggregate[key].count === 0
        ? 0
        : aggregate[key].sum / aggregate[key].count;
      delete aggregate[key];
    }

    return aggregate;
  });
}

function sumValue(row: any, expression: any) {
  if (typeof expression === "number") return expression;
  if (typeof expression === "string" && expression.startsWith("$")) {
    return Number(getByPath(row, expression.slice(1)) || 0);
  }

  return 0;
}

export { createInMemoryDb };
