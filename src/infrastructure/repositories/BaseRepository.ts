class BaseRepository {
  collection: any;

  constructor(db: any, collectionName: string) {
    this.collection = db.collection(collectionName);
  }

  async list({ filter = {}, sort = { _id: -1 }, skip = 0, limit = 20 }: any = {}) {
    const [items, total] = await Promise.all([
      this.collection.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
      this.collection.countDocuments(filter)
    ]);

    return { items, total };
  }

  async findById(id: any) {
    return this.collection.findOne({ _id: id });
  }

  async findOne(filter: any) {
    return this.collection.findOne(filter);
  }

  async create(document: any) {
    const result = await this.collection.insertOne(document);
    return this.findById(result.insertedId);
  }

  async updateById(id: any, patch: any) {
    await this.collection.updateOne({ _id: id }, { $set: patch });
    return this.findById(id);
  }

  async deleteById(id: any) {
    const document = await this.findById(id);
    if (!document) return null;
    await this.collection.deleteOne({ _id: id });
    return document;
  }
}

export { BaseRepository };

