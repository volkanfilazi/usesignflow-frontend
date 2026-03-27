import { EditMode } from '../../models/auth.model';
import { canEditField } from '../../utility/form-permission/form-permission-helper';

describe('canEditField', () => {
  describe('view mode', () => {
    it('should always return false in view mode for builder', () => {
      const result = canEditField({
        editMode: EditMode.VIEW,
        isExternalUser: false,
        assignedTo: 'You',
        submissionStatus: 'Drafted',
      });

      expect(result).toBe(false);
    });

    it('should always return false in view mode for external user', () => {
      const result = canEditField({
        editMode: EditMode.VIEW,
        isExternalUser: true,
        assignedTo: 'Client',
        submissionStatus: 'Pending',
      });

      expect(result).toBe(false);
    });
  });

  describe('create mode - builder', () => {
    it('should allow builder to edit own fields', () => {
      const result = canEditField({
        editMode: EditMode.CREATE,
        isExternalUser: false,
        assignedTo: 'You',
      });

      expect(result).toBe(true);
    });

    it('should not allow builder to edit client fields', () => {
      const result = canEditField({
        editMode: EditMode.CREATE,
        isExternalUser: false,
        assignedTo: 'Client',
      });

      expect(result).toBe(false);
    });
  });

  describe('create mode - external', () => {
    it('should not allow external user in create mode', () => {
      const result = canEditField({
        editMode: EditMode.CREATE,
        isExternalUser: true,
        assignedTo: 'Client',
      });

      expect(result).toBe(false);
    });
  });

  describe('edit mode - builder', () => {
    it('should allow builder to edit own field when status is Drafted', () => {
      const result = canEditField({
        editMode: EditMode.EDIT,
        isExternalUser: false,
        assignedTo: 'You',
        submissionStatus: 'Drafted',
      });

      expect(result).toBe(true);
    });

    it('should not allow builder to edit client field when status is Drafted', () => {
      const result = canEditField({
        editMode: EditMode.EDIT,
        isExternalUser: false,
        assignedTo: 'Client',
        submissionStatus: 'Drafted',
      });

      expect(result).toBe(false);
    });

    it('should not allow builder to edit own field when status is Pending', () => {
      const result = canEditField({
        editMode: EditMode.EDIT,
        isExternalUser: false,
        assignedTo: 'You',
        submissionStatus: 'Pending',
      });

      expect(result).toBe(false);
    });

    it('should not allow builder to edit own field when status is Completed', () => {
      const result = canEditField({
        editMode: EditMode.EDIT,
        isExternalUser: false,
        assignedTo: 'You',
        submissionStatus: 'Completed',
      });

      expect(result).toBe(false);
    });

    it('should not allow builder to edit own field when status is Expired', () => {
      const result = canEditField({
        editMode: EditMode.EDIT,
        isExternalUser: false,
        assignedTo: 'You',
        submissionStatus: 'Expired',
      });

      expect(result).toBe(false);
    });

    it('should not allow builder to edit own field when status is Canceled', () => {
      const result = canEditField({
        editMode: EditMode.EDIT,
        isExternalUser: false,
        assignedTo: 'You',
        submissionStatus: 'Canceled',
      });

      expect(result).toBe(false);
    });
  });

  describe('edit mode - external user', () => {
    it('should allow external user to edit own field when status is Pending', () => {
      const result = canEditField({
        editMode: EditMode.EDIT,
        isExternalUser: true,
        assignedTo: 'Client',
        submissionStatus: 'Pending',
      });

      expect(result).toBe(true);
    });

    it('should not allow external user to edit builder field when status is Pending', () => {
      const result = canEditField({
        editMode: EditMode.EDIT,
        isExternalUser: true,
        assignedTo: 'You',
        submissionStatus: 'Pending',
      });

      expect(result).toBe(false);
    });

    it('should not allow external user to edit own field when status is Drafted', () => {
      const result = canEditField({
        editMode: EditMode.EDIT,
        isExternalUser: true,
        assignedTo: 'Client',
        submissionStatus: 'Drafted',
      });

      expect(result).toBe(false);
    });

    it('should not allow external user to edit own field when status is Completed', () => {
      const result = canEditField({
        editMode: EditMode.EDIT,
        isExternalUser: true,
        assignedTo: 'Client',
        submissionStatus: 'Completed',
      });

      expect(result).toBe(false);
    });

    it('should not allow external user to edit own field when status is Expired', () => {
      const result = canEditField({
        editMode: EditMode.EDIT,
        isExternalUser: true,
        assignedTo: 'Client',
        submissionStatus: 'Expired',
      });

      expect(result).toBe(false);
    });

    it('should not allow external user to edit own field when status is Canceled', () => {
      const result = canEditField({
        editMode: EditMode.EDIT,
        isExternalUser: true,
        assignedTo: 'Client',
        submissionStatus: 'Canceled',
      });

      expect(result).toBe(false);
    });
  });

  describe('default assignedTo behavior', () => {
    it('should default assignedTo to You', () => {
      const result = canEditField({
        editMode: EditMode.CREATE,
        isExternalUser: false,
      });

      expect(result).toBe(true);
    });
  });
});
