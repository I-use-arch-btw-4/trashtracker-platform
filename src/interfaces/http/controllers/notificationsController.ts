import { asyncHandler } from "../../../shared/http/asyncHandler";
import { sendCreated, sendList, sendOk } from "./controllerUtils";

function createNotificationsController(useCases) {
  return {
    list: asyncHandler(async (req, res) => sendList(req, res, useCases.notifications.listNotifications)),
    getById: asyncHandler(async (req, res) => sendOk(res, await useCases.notifications.getNotification(req.params.id))),
    create: asyncHandler(async (req, res) => sendCreated(res, await useCases.notifications.createNotification(req.body))),
    markAsRead: asyncHandler(async (req, res) => sendOk(res, await useCases.notifications.markAsRead(req.params.id))),
    remove: asyncHandler(async (req, res) => sendOk(res, await useCases.notifications.deleteNotification(req.params.id)))
  };
}

export { createNotificationsController };

