import { EditMode } from '../../models/auth.model';
import { SubmissionStatus } from '../../models/form-generator.mode';

export type AssignedTo = 'You' | 'Client';

export interface CanEditFieldParams {
  editMode: EditMode;
  isExternalUser: boolean;
  assignedTo?: AssignedTo | string | null;
  submissionStatus?: SubmissionStatus | string | null;
}

export function canEditField(params: CanEditFieldParams): boolean {
  const assignedTo = (params.assignedTo ?? 'You') as string;

  if (params.editMode === EditMode.VIEW) {
    return false;
  }

  if (params.submissionStatus) {
    if (params.isExternalUser) {
      return params.submissionStatus === 'Pending' && assignedTo === 'Client';
    }

    return params.submissionStatus === 'Drafted' && assignedTo === 'You';
  }

  return !params.isExternalUser && assignedTo === 'You';
}
