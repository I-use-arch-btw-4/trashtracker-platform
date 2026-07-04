import { collections } from "../../domain/collections";
import { BaseRepository } from "./BaseRepository";

function createRepositories(db) {
  return {
    users: new BaseRepository(db, collections.users),
    reports: new BaseRepository(db, collections.reports),
    communities: new BaseRepository(db, collections.communities),
    communityMessages: new BaseRepository(db, collections.communityMessages),
    cleanupEvents: new BaseRepository(db, collections.cleanupEvents),
    stores: new BaseRepository(db, collections.stores),
    rewards: new BaseRepository(db, collections.rewards),
    redemptions: new BaseRepository(db, collections.redemptions),
    pointMovements: new BaseRepository(db, collections.pointMovements),
    notifications: new BaseRepository(db, collections.notifications)
  };
}

export { createRepositories };

