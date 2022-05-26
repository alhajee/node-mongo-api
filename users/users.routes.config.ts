import express from "express";

import { CommonRoutesConfig } from "../common/common.routes.config";
import UsersController from "./controllers/users.controller";
import UsersMiddleware from "./middleware/users.middleware";
import jwtMiddleware from "../auth/middleware/jwt.middleware";
import permissionMiddleware from "../common/middleware/common.permission.middleware";
import { PermissionFlag } from "../common/middleware/common.permissionFlag.enum";

import BodyValidationMiddleware from "../common/middleware/body.validation.middleware";
import { body } from "express-validator";

export class UsersRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, "UsersRoutes");
  }

  configureRoutes(): express.Application {
    this.app
      .route(`/users`)
      .get(
        jwtMiddleware.validJWTNeeded,
        permissionMiddleware.permissionFlagRequired(
          PermissionFlag.ADMIN_PERMISSION
        ),
        UsersController.listUsers
      )
      .post(
        body("email").isEmail(),
        body("password")
          .isLength({ min: 8 })
          .withMessage("Must include password (8+ characters)"),
        BodyValidationMiddleware.verifyBodyFieldsErrors,
        UsersMiddleware.validateSameEmailDoesntExist,
        UsersController.createUser
      );

    this.app.param(`userId`, UsersMiddleware.extractUserId);
    this.app
      .route(`/users/:userId`)
      .all(
        UsersMiddleware.validateUserExists,
        jwtMiddleware.validJWTNeeded,
        permissionMiddleware.onlySameUserOrAdminCanDoThisAction
      )
      .get(UsersController.getUserById)
      .delete(UsersController.removeUser);

    this.app.put(`/users/:userId`, [
      body("email").isEmail(),
      body("password")
        .isLength({ min: 8 })
        .withMessage("Must include password (8+ characters)"),
      body("firstName").isString(),
      body("lastName").isString(),
      body("permissionFlags").isInt(),
      BodyValidationMiddleware.verifyBodyFieldsErrors,
      UsersMiddleware.validateSameEmailBelongToSameUser,
      UsersController.put,
      UsersMiddleware.userCantChangePermission,
      permissionMiddleware.permissionFlagRequired(
        PermissionFlag.VERIFIED_PERMISSION
      ),
    ]);

    this.app.patch(`/users/:userId`, [
      body("email").isEmail().optional(),
      body("password")
        .isLength({ min: 8 })
        .withMessage("Must include password (8+ characters)")
        .optional(),
      body("firstName").isString().optional(),
      body("lastName").isString().optional(),
      body("permissionFlags").isInt().optional(),
      BodyValidationMiddleware.verifyBodyFieldsErrors,
      UsersMiddleware.validatePatchEmail,
      UsersController.patch,
      UsersMiddleware.userCantChangePermission,
      permissionMiddleware.permissionFlagRequired(
        PermissionFlag.VERIFIED_PERMISSION
      ),
    ]);

    return this.app;
  }
}
