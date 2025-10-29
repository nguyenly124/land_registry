var DataTypes = require("sequelize").DataTypes;
var _Account = require("./account");
var _BlockchainTransaction = require("./blockchainTransaction");
var _HoSo = require("./hoSo");
var _HoSoDocument = require("./hoSoDocument");
var _LandParcel = require("./landParcel");
var _Notification = require("./notification");
var _PasswordHistory = require("./passwordHistory");
var _UserProfile = require("./userProfile");
var _PlayingWithNeon = require("./playingWithNeon");
var _UsersSync = require("./usersSync");

function initModels(sequelize) {
  var Account = _Account(sequelize, DataTypes);
  var BlockchainTransaction = _BlockchainTransaction(sequelize, DataTypes);
  var HoSo = _HoSo(sequelize, DataTypes);
  var HoSoDocument = _HoSoDocument(sequelize, DataTypes);
  var LandParcel = _LandParcel(sequelize, DataTypes);
  var Notification = _Notification(sequelize, DataTypes);
  var PasswordHistory = _PasswordHistory(sequelize, DataTypes);
  var UserProfile = _UserProfile(sequelize, DataTypes);
  var PlayingWithNeon = _PlayingWithNeon(sequelize, DataTypes);
  var UsersSync = _UsersSync(sequelize, DataTypes);

  HoSo.belongsTo(Account, { as: "account", foreignKey: "account_id"});
  Account.hasMany(HoSo, { as: "HoSos", foreignKey: "account_id"});
  LandParcel.belongsTo(Account, { as: "owner", foreignKey: "owner_id"});
  Account.hasMany(LandParcel, { as: "LandParcels", foreignKey: "owner_id"});
  Notification.belongsTo(Account, { as: "account", foreignKey: "account_id"});
  Account.hasMany(Notification, { as: "Notifications", foreignKey: "account_id"});
  PasswordHistory.belongsTo(Account, { as: "account", foreignKey: "account_id"});
  Account.hasMany(PasswordHistory, { as: "PasswordHistories", foreignKey: "account_id"});
  UserProfile.belongsTo(Account, { as: "account", foreignKey: "account_id"});
  Account.hasMany(UserProfile, { as: "UserProfiles", foreignKey: "account_id"});
  BlockchainTransaction.belongsTo(HoSo, { as: "hoso", foreignKey: "hoso_id"});
  HoSo.hasMany(BlockchainTransaction, { as: "BlockchainTransactions", foreignKey: "hoso_id"});
  HoSoDocument.belongsTo(HoSo, { as: "hoso", foreignKey: "hoso_id"});
  HoSo.hasMany(HoSoDocument, { as: "HoSoDocuments", foreignKey: "hoso_id"});
  HoSo.belongsTo(LandParcel, { as: "parcel", foreignKey: "parcel_id"});
  LandParcel.hasMany(HoSo, { as: "HoSos", foreignKey: "parcel_id"});

  return {
    Account,
    BlockchainTransaction,
    HoSo,
    HoSoDocument,
    LandParcel,
    Notification,
    PasswordHistory,
    UserProfile,
    PlayingWithNeon,
    UsersSync,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
