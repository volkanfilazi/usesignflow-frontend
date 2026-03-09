export interface FormDefinitionDto {
  id?: string;
  formName: string;
  expanded?: boolean;
  version: string;
  fields: FieldDto[];
  ownerUserId: string;
}

export interface FieldDto {
  fieldId: string;
  label: string;
  type: 'Text' | 'Email' | 'Number' | 'Select' | 'Checkbox' | 'SignaturePad';
  required: boolean;
  options?: string[];
  colSpan?: 1 | 2 | 3 | 4;
}

enum ContractStatus {
  Draft = 'Draft',
  PendingSignature = 'PendingSignature',
  Signed = 'Signed',
  Cancelled = 'Cancelled',
}
