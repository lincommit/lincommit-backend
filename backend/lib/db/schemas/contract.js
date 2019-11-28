const { CONTRACTS_TYPES } = require('../../constants');

module.exports = dependencies => {
  const mongoose = dependencies('db').mongo.mongoose;
  const Schema = mongoose.Schema;

  const ContractScheduleSchema = new Schema({
    start: { type: String },
    end: { type: String }
  }, { _id: false});

  const ContractSoftwareSchema = new Schema({
    software: { type: mongoose.Schema.ObjectId, ref: 'Software', required: true },
    critical: { type: String, default: 'standard' },
    generic: Schema.Types.Mixed,
    technicalReferent: { type: String }, // FIXME Store User instead of name
    os: { type: String },
    version: { type: String },
    SupportDate: ContractScheduleSchema
  }, { _id: false});

  const ContactSchema = new Schema({
    commercial: { type: String}, // FIXME Store User instead of name
    technical: { type: String} // FIXME Store User instead of name
  }, { _id: false});

  const MailingListSchema = new Schema({
    internal: [String],
    external: [String]
  }, { _id: false});

  const HumanResourcesSchema = new Schema({
    teams: [Schema.Types.Mixed],
    beneficiaries: [Schema.Types.Mixed]
  }, { _id: false});

  const BusinessHoursSchema = new Schema({
    businessHours: {
      days: { type: Number },
      hours: { type: Number }
    },
    nonBusinessHours: {
      days: { type: Number },
      hours: { type: Number }
    }
  }, { _id: false });

  const EngagementDetailSchema = {
    bypassed: BusinessHoursSchema,
    description: { type: String }, // FIXME Send by frontend but useless (not in UI)
    idOssa: { type: String },
    request: { type: String },
    resolved: BusinessHoursSchema,
    severity: { type: String },
    supported: BusinessHoursSchema
  };

  const EngagementSectionSchema = new Schema({
    engagements: [EngagementDetailSchema]
  }, { _id: false});

  const EngagementsSchema = new Schema({
    critical: EngagementSectionSchema,
    sensible: EngagementSectionSchema,
    standard: EngagementSectionSchema
  }, { _id: false});

  const ContractSchema = new Schema({
    description: { type: String},
    endDate: { type: Date, required: true },
    Engagements: EngagementsSchema,
    businessHours: ContractScheduleSchema,
    features: {
      nonBusinessHours: { type: Boolean, default: false }
    },
    contact: ContactSchema,
    client: { type: String, required: true },
    clientId: { type: Schema.Types.ObjectId, required: true },
    credits: { type: Number },
    govern: { type: String },
    humanResources: HumanResourcesSchema,
    mailingList: MailingListSchema,
    name: { type: String, required: true },
    schedule: ContractScheduleSchema,
    status: { type: Boolean, default: true },
    startDate: { type: Date, required: true },
    software: [ContractSoftwareSchema], // TODO rename field to supportedSoftware
    timestamps: {
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    },
    type: { type: String, default: CONTRACTS_TYPES.UNLIMITED },
    schemaVersion: { type: Number, default: 1 }
  });

  return {
    ContractScheduleSchema,
    ContractSoftwareSchema,
    ContractSchema
  };
};
