import { Component, OnDestroy, OnInit } from '@angular/core';
import { BillingApiService } from '../../../shared/services/billing-api-service';
import { Router } from '@angular/router';
import { BillingOverviewResponse } from '../../../shared/models/payment.model';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { BrandingApiService } from '../../../shared/services/branding-api.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToolsService } from '../../../shared/services/tools.service';
import { PendingChangesAware } from '../../guard/pending-changes-guard';
import { EditMode } from '../../../shared/models/auth.model';
import { normalizeFormValue } from '../../../shared/utility/helper/form-helper';
import { ValidationService } from '../../../shared/services/validation.service';
import { PageActionService } from '../../../shared/services/header/page-action.service';

type PlanCode = 'Free' | 'Pro' | 'Business';
type PreviewMode = 'free' | 'pro' | 'business';

@Component({
  selector: 'app-pdf-branding-page',
  standalone: false,
  templateUrl: './branding-pdf.component.html',
  styleUrl: './branding-pdf.component.scss',
})
export class BrandingPdfComponent implements OnInit, OnDestroy, PendingChangesAware {
  loading$ = new BehaviorSubject(false);
  saving$ = new BehaviorSubject(false);
  brandingForm!: FormGroup;
  overviewResponse: BillingOverviewResponse | null = null;
  editMode = EditMode.EDIT;
  validationErrors: ValidationIssue[] | undefined;
  pageOwner = 'branding-pdf';
  updateLoading$ = new BehaviorSubject(false);

  private initialFormValue: any = null;
  readonly sampleAgreementTitle = 'Freelancer Contract — Ready for signature';
  readonly sampleReferenceNo = 'REF-69303F5F060795D69CDE8D';
  readonly sampleStatus = 'Completed';

  readonly sampleAgreementLines = [
    'This Freelance Services Agreement (“Agreement”) is entered into between SignFlow Studio and John Doe.',
    'The purpose of this Agreement is to establish a clear understanding of expectations, deliverables, and compensation.',
  ];

  readonly sampleFields = [
    { label: 'Fullname of owner', value: 'SignFlow Studio' },
    { label: 'Fullname of client', value: 'John Doe' },
    { label: 'Email', value: 'john.doe@example.com' },
  ];

  constructor(
    private readonly billingApiService: BillingApiService,
    private readonly router: Router,
    private readonly brandingApiService: BrandingApiService,
    private readonly toolsService: ToolsService,
    private readonly validationService: ValidationService,
    private readonly pageActionService: PageActionService,
  ) {}

  public hasPendingChanges(): boolean {
    if (this.editMode === EditMode.VIEW) {
      return false;
    }

    return this.hasFormChanged();
  }

  public saveBeforeLeave(): Observable<boolean> {
    if (this.editMode === EditMode.VIEW) {
      return of(true);
    }

    return this.saveBranding();
  }

  ngOnInit(): void {
    this.loading$.next(true);
    this.initForm();
    this.setActions();
    this.loadOverview();
    this.getBranding();
  }

  initForm(): void {
    this.brandingForm = new FormGroup({
      companyName: new FormControl(''),
      website: new FormControl(''),
      email: new FormControl('', [Validators.email]),
      phone: new FormControl(''),
      address: new FormControl(''),
      brandColorHex: new FormControl({ value: '#8FE3A8', disabled: true }, [
        Validators.pattern(/^#[0-9A-Fa-f]{6}$/),
      ]),
      logoFileUrl: new FormControl(''),
    });

    this.captureInitialFormValue();
  }

  private updateBrandColorControlState(): void {
    const companyName = this.brandingForm.get('companyName');
    const website = this.brandingForm.get('website');
    const email = this.brandingForm.get('email');
    const phone = this.brandingForm.get('phone');
    const address = this.brandingForm.get('address');
    const brandColorHex = this.brandingForm.get('brandColorHex');

    if (this.canUseBrandColor) {
      companyName?.enable({ emitEvent: false });
      website?.enable({ emitEvent: false });
      email?.enable({ emitEvent: false });
      phone?.enable({ emitEvent: false });
      address?.enable({ emitEvent: false });
      brandColorHex?.enable({ emitEvent: false });
    } else {
      companyName?.disable({ emitEvent: false });
      website?.disable({ emitEvent: false });
      email?.disable({ emitEvent: false });
      phone?.disable({ emitEvent: false });
      address?.disable({ emitEvent: false });
      brandColorHex?.disable({ emitEvent: false });
    }
  }

  loadOverview(): void {
    this.billingApiService.getOverview().subscribe({
      next: (response) => {
        this.overviewResponse = response;
        this.updateBrandColorControlState();
      },
      error: (err) => {},
    });
  }

  getBranding(): void {
    this.brandingApiService.getBranding().subscribe({
      next: (response) => {
        this.brandingForm.patchValue(response);
        this.captureInitialFormValue();
        this.loading$.next(false);
      },
      error: () => this.loading$.next(false),
    });
  }

  // ===== Plan helpers =====

  get currentPlan(): PlanCode {
    return this.overviewResponse?.planCode ?? 'Free';
  }

  get isFree(): boolean {
    return this.currentPlan === 'Free';
  }

  get isPro(): boolean {
    return this.currentPlan === 'Pro';
  }

  get isBusiness(): boolean {
    return this.currentPlan === 'Business';
  }

  get previewMode(): PreviewMode {
    if (this.isBusiness) return 'business';
    if (this.isPro) return 'pro';
    return 'free';
  }

  // ===== Capability helpers =====
  // Şimdilik backend entitlement genişlemediği için plan bazlı ilerliyoruz.
  // Sonradan bunları overviewResponse.entitlements içinden okuyabilirsin.

  get canUploadLogo(): boolean {
    return this.isPro || this.isBusiness;
  }

  get canEditCompanyInfo(): boolean {
    return this.isBusiness;
  }

  get canUseBrandColor(): boolean {
    return this.isBusiness;
  }

  get canRemoveWatermark(): boolean {
    return this.isPro || this.isBusiness;
  }

  // ===== UI labels =====

  get brandingLevelTitle(): string {
    if (this.isBusiness) return 'Business branding';
    if (this.isPro) return 'Pro branding';
    return 'Free branding';
  }

  get brandingLevelDescription(): string {
    if (this.isBusiness) {
      return 'Your PDFs can include logo, company details, custom brand color, and no SignFlow watermark.';
    }

    if (this.isPro) {
      return 'Your PDFs can include your logo and no watermark. Full company header and custom brand color require Business.';
    }

    return 'Your PDFs use default SignFlow styling with watermark. Upgrade to unlock custom branding.';
  }

  get currentPlanBadge(): string {
    return `Current plan: ${this.currentPlan}`;
  }

  // ===== Preview style helpers =====
  get brandColorValue(): string {
    return this.brandingForm?.get('brandColorHex')?.value || '#8FE3A8';
  }

  get logoUrlValue(): string {
    return this.brandingForm?.get('logoFileUrl')?.value || '';
  }

  get previewHeaderBackground(): string {
    if (this.isBusiness) {
      return this.brandColorValue;
    }

    if (this.isPro) {
      return '#f8fafc';
    }

    return '#f8fafc';
  }

  get previewAccentColor(): string {
    if (this.isBusiness) {
      return this.brandColorValue;
    }

    if (this.isPro) {
      return '#0f172a';
    }

    return '#2563eb';
  }

  get previewBorderColor(): string {
    if (this.isBusiness) {
      return this.brandColorValue;
    }

    return '#e2e8f0';
  }

  get previewLogoBackground(): string {
    if (this.isBusiness) {
      return this.brandColorValue;
    }

    return '#bbf7d0';
  }

  get previewPlaceholderBackground(): string {
    if (this.isBusiness) {
      return this.brandColorValue;
    }

    return '#dcfce7';
  }

  get previewLogoText(): string {
    const source = this.brandingForm?.get('companyName')?.value || 'S';
    return String(source).trim().charAt(0).toUpperCase() || 'S';
  }

  get visibleCompanyName(): string {
    return this.brandingForm?.value?.companyName || 'Your Company';
  }

  get visibleWebsite(): string {
    return this.brandingForm?.value?.website || 'yourcompany.com';
  }

  get visibleEmail(): string {
    return this.brandingForm?.value?.email || 'hello@yourcompany.com';
  }

  get visiblePhone(): string {
    return this.brandingForm?.value?.phone || '+00 000 000 00 00';
  }

  get visibleAddress(): string {
    return this.brandingForm?.value?.address || 'Your City, Country';
  }

  get previewOwnerName(): string {
    if (this.isBusiness) {
      return this.visibleCompanyName;
    }

    return 'SignFlow Studio';
  }

  get showLogoInPreview(): boolean {
    return this.canUploadLogo;
  }

  get showCompanyDetailsInPreview(): boolean {
    return this.canEditCompanyInfo;
  }

  get showBrandColorInPreview(): boolean {
    return this.canUseBrandColor;
  }

  get showWatermarkInPreview(): boolean {
    return !this.canRemoveWatermark;
  }

  get uploadHint(): string {
    if (this.canUploadLogo) {
      return 'PNG or SVG recommended. Transparent background works best.';
    }

    return 'Available on Pro and Business plans.';
  }

  // ===== Actions =====

  changePlan(): void {
    this.router.navigate(['/dashboard/billing']);
  }

  private saveBranding(): Observable<boolean> {
    this.validationErrors = [];

    if (this.brandingForm.invalid) {
      this.brandingForm.markAllAsTouched();
      this.validationErrors = this.validationService.collectValidationIssues(this.brandingForm);
      return of(false);
    }

    if (!this.hasPendingChanges()) {
      this.toolsService.showSnackbar('No changes', 'success-snackbar');

      return of(false);
    }

    this.updateLoading$.next(true);

    const payload: PdfBrandingForm = this.brandingForm.getRawValue();

    return this.brandingApiService.updateBranding(payload).pipe(
      tap(() => {
        this.captureInitialFormValue();
        this.toolsService.showSnackbar('Branding updated successfully', 'success-snackbar');
        this.updateLoading$.next(false);
      }),
      map(() => true),
      catchError((err) => {
        this.toolsService.showSnackbar('Failed to update branding', 'error-snackbar');
        this.updateLoading$.next(false);
        return of(false);
      }),
    );
  }

  onLogoChange(event: Event): void {
    if (!this.canUploadLogo) return;

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.brandingForm.patchValue({
        logoFileUrl: String(reader.result ?? ''),
      });
    };
    reader.readAsDataURL(file);
  }

  removeLogo(): void {
    if (!this.canUploadLogo) return;

    this.brandingForm.patchValue({
      logoFileUrl: '',
    });
  }

  private setActions() {
    this.pageActionService.addAction({
      id: 'save-ui',
      text: 'Save branding',
      loading$: this.updateLoading$,
      owner: this.pageOwner,
      handler: () => this.saveBranding().subscribe(),
    });
  }

  private hasFormChanged(): boolean {
    const currentValue = normalizeFormValue(this.brandingForm.getRawValue());
    const initialValue = normalizeFormValue(this.initialFormValue);

    return JSON.stringify(currentValue) !== JSON.stringify(initialValue);
  }

  private captureInitialFormValue(): void {
    this.initialFormValue = this.brandingForm.getRawValue();
    this.brandingForm.markAsPristine();
  }

  ngOnDestroy() {
    this.pageActionService.clearActionsByOwner(this.pageOwner);
  }
}
