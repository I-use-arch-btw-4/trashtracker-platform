import { createUsersUseCases } from "./usersUseCases";
import { createReportsUseCases } from "./reportsUseCases";
import { createCommunitiesUseCases } from "./communitiesUseCases";
import { createEventsUseCases } from "./eventsUseCases";
import { createRewardsUseCases } from "./rewardsUseCases";
import { createRedemptionsUseCases } from "./redemptionsUseCases";
import { createNotificationsUseCases } from "./notificationsUseCases";
import { createDashboardUseCases } from "./dashboardUseCases";
import { createStoresUseCases } from "./storesUseCases";
import { createMessagesUseCases } from "./messagesUseCases";

function createUseCases(dependencies) {
  return {
    users: createUsersUseCases(dependencies),
    reports: createReportsUseCases(dependencies),
    communities: createCommunitiesUseCases(dependencies),
    events: createEventsUseCases(dependencies),
    stores: createStoresUseCases(dependencies),
    rewards: createRewardsUseCases(dependencies),
    redemptions: createRedemptionsUseCases(dependencies),
    messages: createMessagesUseCases(dependencies),
    notifications: createNotificationsUseCases(dependencies),
    dashboard: createDashboardUseCases(dependencies)
  };
}

export { createUseCases };

