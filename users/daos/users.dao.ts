import { CreateUserDto } from "../dto/create.user.dto";
import { PatchUserDto } from "../dto/patch.user.dto";
import { PutUserDto } from "../dto/put.user.dto";
import mongooseService from "../../common/services/mongoose.service";
import { PermissionFlag } from "../../common/middleware/common.permissionFlag.enum";

import shortid from "shortid";
import debug from "debug";

const log: debug.IDebugger = debug("app:in-memory-dao");

class UsersDao {
  Schema = mongooseService.getMongoose().Schema;

  userSchema = new this.Schema(
    {
      _id: String,
      email: String,
      password: {
        type: String,
        select: false,
      },
      firstName: String,
      lastName: String,
      permissionFlags: Number,
    },
    { id: false }
  );

  User = mongooseService.getMongoose().model("Users", this.userSchema);

  constructor() {
    log("Created new instance of UsersDao");
  }

  async addUser(userFields: CreateUserDto) {
    const userId = shortid.generate();
    const user = new this.User({
      _id: userId,
      ...userFields,
      permissionFlags: PermissionFlag.UNVERIFIED_PERMISSION,
    });
    await user.save();
    return {
      id: userId,
    };
  }

  async getUserByEmail(email: string) {
    return this.User.findOne({ email: email }).exec();
  }

  async getUserById(userId: string) {
    return this.User.findOne({ _id: userId }).exec();
  }

  async getUsers(limit = 25, page = 0) {
    return this.User.find()
      .limit(limit)
      .skip(page * limit)
      .exec();
  }

  async updateUserById(userId: string, userFields: PatchUserDto) {
    const existingUser = await this.User.findOneAndUpdate(
      { _id: userId },
      { $set: userFields },
      { new: true }
    ).exec();

    return existingUser;
  }

  async getUserByEmailWithPassword(email: string) {
    return this.User.findOne({ email: email })
      .select("_id email permissionFlags +password")
      .exec();
  }

  async deleteUserById(userId: string) {
    return this.User.deleteOne({ _id: userId }).exec();
  }
}

export default new UsersDao();
