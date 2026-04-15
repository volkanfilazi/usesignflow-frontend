import { EditMode } from './auth.model';

export enum FormElementsEnum {
  ColSpan = 'dynamicFormColSpan',
  Required = 'dynamicFormRequired',
  Type = 'dynamicFormType',
  Label = 'dynamicFormLabel',
  SelectOptions = 'dynamicFormSelectOptions',
  AssignedTo = 'dynamicFormAssignedTo',
  ValidationMin = 'validationMin',
  ValidationMax = 'validationMax',
  ValidationMinLength = 'validationMinLength',
  ValidationMaxLength = 'validationMaxLength',
}

export const FieldTypes = {
  ShortText: 'ShortText',
  LongText: 'LongText',
  Email: 'Email',
  Number: 'Number',
  Checkbox: 'Checkbox',
  Dropdown: 'Dropdown',
  Signature: 'Signature',
  Agreement: 'Agreement',
} as const;

export const options: FieldType[] = Object.values(FieldTypes);
export type FieldType = (typeof FieldTypes)[keyof typeof FieldTypes];

export type BuilderItem =
  | { type: 'Field'; id: string }
  | { type: typeof FieldTypes.Agreement; id: string; agreement: Agreements };

export const FIELD_CONFIG: Record<
  FieldType,
  {
    label: string;
    colSpan: string;
    required?: boolean;
  }
> = {
  [FieldTypes.ShortText]: {
    label: 'Short text',
    colSpan: '4',
  },
  [FieldTypes.LongText]: {
    label: 'Long text',
    colSpan: '4',
  },
  [FieldTypes.Email]: {
    label: 'Email',
    colSpan: '2',
    required: true,
  },
  [FieldTypes.Number]: {
    label: 'Number',
    colSpan: '2',
  },
  [FieldTypes.Checkbox]: {
    label: 'Checkbox',
    colSpan: '2',
  },
  [FieldTypes.Dropdown]: {
    label: 'Dropdown',
    colSpan: '4',
  },
  [FieldTypes.Signature]: {
    label: 'Signature',
    colSpan: '2',
    required: true,
  },
  [FieldTypes.Agreement]: {
    label: 'Agreement',
    colSpan: '4',
  },
};

export enum AssignedToEnum {
  You = 0,
  Client = 1,
}

export const AssignedToOptions = ['You', 'Client'] as const;
export type AssignedTo = (typeof AssignedToOptions)[number];
export const assignedToMap: Record<AssignedTo, AssignedToEnum> = {
  You: AssignedToEnum.You,
  Client: AssignedToEnum.Client,
};

export type ComboboxOption = {
  label: string;
  value: FieldType;
};

export interface Agreements {
  id?: string;
  title: string;
  content: string;
}

export interface FieldDefinition {
  fieldId: string;
  label: string;
  type: FieldType;
  required: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  assignedTo?: AssignedTo;
  pattern?: string;
  options?: string[];
  agreement?: Agreements;
  colSpan: number;
}

export interface FormDefinition {
  id?: string;
  ownerUserId: string;
  formName: string;
  requiresVerification?: boolean;
  agreementContentHtml?: string;
  expanded: boolean;
  version: string;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  fields: FieldDefinition[];
}

export interface PagedResult<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
}

export interface FormSubmission {
  id?: string;
  formId: string;
  formName: string;
  agreementContentHtml?: string;
  formVersion: string;
  createdByUserId: string;
  hasClientStep: boolean;
  externalConfirmed: boolean;
  ownerConfirmed: boolean;
  status: SubmissionStatus;
  createdAtUtc: string;
  updatedAtUtc: string;
  rowVersion: number;
  answers: FormAnswer[];
  signatures: FormSignature[];
  agreementAcceptances: FormAgreementAcceptance[];
  fieldsSnapshot: FieldDefinition[];
  externalRecipientEmail?: string;
}

export interface FormSignature {
  fieldId: string;
  signedByUserId?: string | null;
  signedByEmail?: string | null;
  signatureUrl?: string | null;
  signedAtUtc?: string | null;
  signedFromIpAddress?: string | null;
  signedUserAgent?: string | null;
}

export interface FormAgreementAcceptance {
  fieldId: string;
  acceptedByUserId?: string | null;
  acceptedByEmail?: string | null;
  acceptedAtUtc?: string | null;
  acceptedFromIpAddress?: string | null;
  acceptedUserAgent?: string | null;
}

export interface CreateFormDefinitionRequest {
  formName: string;
  agreementContentHtml?: string;
  expanded?: boolean;
  version?: string;
  fields: FieldDefinition[];
}

export interface GoogleLoginRequest {
  credential: string;
}

export interface FormAnswer {
  fieldId: string;
  value: string | null;
}

export interface FormSignature {
  fieldId: string;
  signedByUserId?: string | null;
  signedByEmail?: string | null;
  signatureUrl?: string | null;
  signedAtUtc?: string | null;
}

export enum SubmissionStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Expired = 'Expired',
  Drafted = 'Drafted',
}

export interface AgreementTemplate {
  id?: string;
  ownerUserId?: string;
  name: string;
  title: string;
  content: string;
  createdAtUtc?: string;
  updatedAtUtc?: string | null;
}

export function statusCheck(submission: FormSubmission, isExternal: boolean): boolean {
  if (isExternal) {
    return submission.status === 'Pending';
  }

  return submission.status === 'Drafted';
}

export function getSubmissionStatusColors(row: FormSubmission) {
  switch (row.status) {
    case SubmissionStatus.Drafted:
      return 'status-blue';
    case SubmissionStatus.Pending:
      return 'status-yellow';
    case SubmissionStatus.Completed:
      return 'status-green';
    case SubmissionStatus.Cancelled:
    case SubmissionStatus.Expired:
    default:
      return 'status-red';
  }
}

export function getSubmissionMode(row: FormSubmission): EditMode {
  switch (row.status) {
    case SubmissionStatus.Pending:
      return EditMode.EDIT;

    case SubmissionStatus.Completed:
    case SubmissionStatus.Cancelled:
    case SubmissionStatus.Expired:
    default:
      return EditMode.VIEW;
  }
}

export interface CreateFormSubmissionRequest {
  formId: string;
  answers: FormAnswer[];
}

export interface UpdateFormSubmissionRequest {
  answers: FormAnswer[];
  rowVersion: number;
}

export interface UpdateSubmissionByAccessTokenRequest {
  token: string;
  rowVersion: number;
  answers: FormAnswer[];
}

export interface SendForSignatureRequest {
  subject: string;
  email: string;
}

export interface SignSubmissionRequest {
  signatureDataBase64: string;
  signedByEmail?: string | null;
}

export interface ResolveSubmissionAccessRequest {
  token: string;
}

export interface ResolveSubmissionAccessResponse {
  submissionId: string;
  email: string;
  isAuthenticated: boolean;
  requiresVerification: boolean;
  isEmailMatch: boolean;
}

export interface ResolveVerifyTokenResponse {
  submissionId: string;
  requiresVerification: boolean;
}

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
