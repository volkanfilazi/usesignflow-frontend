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

export const FIELD_CONFIG: Record<
  FieldType,
  {
    label: string;
    colSpan: string;
    required?: boolean;
  }
> = {
  ShortText: {
    label: 'ShortText',
    colSpan: '4',
  },
  LongText: {
    label: 'LongText',
    colSpan: '4',
  },
  Email: {
    label: 'Email',
    colSpan: '2',
    required: true,
  },
  Number: {
    label: 'Number',
    colSpan: '2',
  },
  Checkbox: {
    label: 'Checkbox',
    colSpan: '2',
  },
  Dropdown: {
    label: 'Dropdown',
    colSpan: '4',
  },
  Signature: {
    label: 'Signature',
    colSpan: '2',
    required: true,
  },
  Agreement: {
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
export const options = [
  'ShortText',
  'LongText',
  'Email',
  'Number',
  'Checkbox',
  'Dropdown',
  'Signature',
  'Agreement',
] as const;
export type FormFieldType = (typeof options)[number];
export type FieldType = (typeof options)[number];

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
  options?: string[] | [];
  agreement?: Agreements;
  colSpan: number;
}

export interface FormDefinition {
  id?: string;
  ownerUserId: string;
  formName: string;
  agreementContentHtml?: string;
  expanded: boolean;
  version: string;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  fields: FieldDefinition[];
}

export interface FormSubmission {
  id?: string;
  formId: string;
  formName: string;
  agreementContentHtml?: string;
  formVersion: string;
  createdByUserId: string;
  status: SubmissionStatus;
  createdAtUtc: string;
  updatedAtUtc: string;
  rowVersion: number;
  answers: FormAnswer[];
  signatures: FormSignature[];
  fieldsSnapshot: FieldDefinition[];
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
  isEmailMatch: boolean;
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
