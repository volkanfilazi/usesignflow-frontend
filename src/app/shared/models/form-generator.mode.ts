export enum FormElementsEnum {
  DynamicFormRequired = 'dynamicFormRequired',
  DynamicFormType = 'dynamicFormType',
  DynamicFormLabel = 'dynamicFormLabel',
  DynamicFormSelectOptions = 'dynamicFormSelectOptions',
  DynamicFormColSpan = 'dynamicFormColSpan',
}

export const options = ['text', 'number', 'checkbox', 'select', 'email', 'signaturePad'] as const;
export type FormFieldType = (typeof options)[number];

export type FieldType = (typeof options)[number];

export interface FieldDefinition {
  fieldId: string;
  label: string;
  type: FieldType;
  required: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  options?: string[] | [];
  colSpan: number;
}

export interface FormDefinition {
  id?: string;
  ownerUserId: string;
  formName: string;
  expanded: boolean;
  version: string;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  fields: FieldDefinition[];
}

/**
 * Kullanıcının formu doldurup kaydettiği gerçek kayıt
 */
export interface FormSubmission {
  id?: string;
  formId: string;
  formVersion: string;
  createdByUserId: string;
  status: SubmissionStatus;
  createdAtUtc: string;
  updatedAtUtc: string;
  rowVersion: number;
  answers: FormAnswer[];
  signatures: FormSignature[];
}

export interface CreateFormDefinitionRequest {
  formName: string;
  expanded?: boolean;
  version?: string;
  fields: FieldDefinition[];
}

/**
 * Normal field cevapları
 */
export interface FormAnswer {
  fieldId: string;
  value: string | null;
}

/**
 * Signature alanlarının ayrı tutulması daha temiz
 */
export interface FormSignature {
  fieldId: string;
  signedByUserId?: string | null;
  signedByEmail?: string | null;
  signatureUrl?: string | null;
  signedAtUtc?: string | null;
}

/**
 * Formun workflow durumu
 */
export enum SubmissionStatus {
  Draft = 'Draft',
  PendingSignature = 'PendingSignature',
  PartiallySigned = 'PartiallySigned',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Expired = 'Expired',
}

/**
 * İlk kayıt için request modeli
 */
export interface CreateFormSubmissionRequest {
  formId: string;
  answers: FormAnswer[];
}

/**
 * Edit/save için request modeli
 */
export interface UpdateFormSubmissionRequest {
  answers: FormAnswer[];
  rowVersion: number;
}

/**
 * İmzaya gönderirken kullanılacak model
 */
export interface SendForSignatureRequest {
  recipientEmail: string;
  signatureFieldId: string;
}

/**
 * Mail ile gelen kişi imza attığında kullanılacak model
 */
export interface SignSubmissionRequest {
  signatureDataBase64: string;
  signedByEmail?: string | null;
}

/**
 * İmza isteği kaydı
 */
export interface SignatureRequest {
  id?: string;
  submissionId: string;
  recipientEmail: string;
  signatureFieldId: string;
  status: SignatureRequestStatus;
  createdAtUtc: string;
  expiresAtUtc: string;
  openedAtUtc?: string | null;
  signedAtUtc?: string | null;
}

export enum SignatureRequestStatus {
  Pending = 'Pending',
  Opened = 'Opened',
  Signed = 'Signed',
  Expired = 'Expired',
  Cancelled = 'Cancelled',
}
