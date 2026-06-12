import { BaseEntity, Gender, HealthStatus } from './common';

export type AnimalType = 'cattle' | 'sheep' | 'goat' | 'horse' | 'donkey' | 'bird';

export interface CustomField {
  id: string;
  label: string;
  fieldType: 'text' | 'number' | 'date' | 'select';
  options?: string[];
  required: boolean;
}

export interface Profile extends BaseEntity {
  id: string;
  name: string;
  animalType: AnimalType;
  ranchId: string;
  customFields?: CustomField[];
  createdAt: string;
  updatedAt: string;
}

export interface BirdCountRecord {
  id: string;
  profileId: string;
  cageId: string;
  count: number;
  timestamp: string;
}

export interface Animal extends BaseEntity {
  animalId?: string;
  tagNumber?: string;
  internalCode?: string;
  breed: string;
  gender?: Gender;
  sex?: string;
  age?: number;
  weight?: number;
  color?: string;
  dateOfBirth?: string;
  birthDate?: string;
  datePurchased?: string;
  originRanch?: string;
  currentRanch?: string;
  ranchId?: string;
  profileId?: string;
  animalType?: AnimalType;
  photos?: string[];
  tags?: string[];
  notes?: string;
  healthStatus: HealthStatus;
  motherId?: string;
  fatherId?: string;
  offspringIds?: string[];
  ownershipHistory?: OwnershipRecord[];
  lifecycleLogs?: LifecycleLog[];
  feedingPlan?: FeedingPlan;
  medicationRecords?: MedicationRecord[];
  pregnancyRecords?: PregnancyRecord[];
  nursingRecords?: NursingRecord[];
  ownership?: {
    currentOwnerId?: string;
    acquisitionDate?: string;
    acquisitionMethod?: string;
  };
  lifecycle?: {
    status?: string;
    birthLocation?: string;
    currentLocation?: string;
  };
  pregnancyStatus?: string;
  isSpecialFeeding?: boolean;
  specialFeedingName?: string;
  isMedicated?: boolean;
  medicationName?: string;
  medicationDate?: string;
}

export interface OwnershipRecord {
  id: string;
  ranchId: string;
  ownerId: string;
  transferDate: string;
  transferType: 'purchase' | 'birth' | 'gift' | 'other';
  price?: number;
  notes?: string;
}

export interface LifecycleLog {
  id: string;
  eventType: string;
  eventDate: string;
  description: string;
  recordedBy: string;
  attachments?: string[];
}

export interface FeedingPlan {
  id: string;
  feedType: string;
  quantity: number;
  schedule: string;
  purpose: string;
  startDate: string;
  endDate?: string;
}

export interface MedicationRecord {
  id: string;
  animalId?: string;
  medicationName: string;
  type?: string;
  dosage: string;
  administrationRoute?: string;
  reason?: string;
  administeredDate?: string;
  administeredAt?: string;
  administeredBy?: string;
  wearOffTime?: string;
  recoveryNotes?: string;
  nextTreatmentDate?: string;
  nextDueDate?: string;
  wearOffDate?: string;
  notes?: string;
}

export interface PregnancyRecord {
  id: string;
  startDate: string;
  expectedBirthDate?: string;
  actualBirthDate?: string;
  sireId?: string;
  outcome?: 'successful' | 'failed' | 'pending';
  offspringCount?: number;
  notes?: string;
}

export interface NursingRecord {
  id: string;
  startDate: string;
  endDate?: string;
  calfId?: string;
  notes?: string;
}

export interface FeedingRecord {
  id: string;
  animalId?: string;
  feedType: string;
  quantity: number;
  unit: string;
  fedAt: string;
  fedBy?: string;
  nutritionInfo?: {
    protein?: number;
    energy?: number;
    fiber?: number;
  };
  notes?: string;
}
