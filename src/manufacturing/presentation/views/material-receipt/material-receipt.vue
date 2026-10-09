<template>
<section class="page">
  <app-page-header
    [breadcrumb]="['shell.workspace' | translate, 'environments.production.short' | translate, 'manufacturing.receipt.title' | translate]"
    [title]="'manufacturing.receipt.title' | translate"
    [subtitle]="selected() ? selected()!.receiptCode + ' · ' + selected()!.material + ' · ' + ('manufacturing.receipt.subtitle' | translate) : ''"/>

  <div class="alert" role="status"><mat-icon>warning_amber</mat-icon><div><strong>{{ 'manufacturing.receipt.alert' | translate }}</strong></div></div>

  <ol class="stepper">
    @for (step of steps; track step; let i = $index) {
      <li [class.done]="i < stepIndex()" [class.current]="i === stepIndex()">
        <span>@if (i < stepIndex()) { <mat-icon>check</mat-icon> } @else { {{ i + 1 }} }</span>{{ 'manufacturing.receipt.step.' + step | translate }}
      </li>
    }
  </ol>

  <div class="columns">
    <div class="stack">
      <mat-card appearance="outlined" class="panel receipt"><form [formGroup]="form" (ngSubmit)="record()" novalidate>
        <h2>{{ 'manufacturing.receipt.details' | translate }}</h2>
        <p class="small muted">* {{ 'manufacturing.receipt.required' | translate }}</p>
        <div class="form-grid">
          <div class="field"><mat-form-field appearance="outline"><mat-label>{{ 'manufacturing.receipt.material' | translate }}</mat-label><input matInput type="text" formControlName="material"></mat-form-field></div>
          <div class="field"><mat-form-field appearance="outline"><mat-label>{{ 'manufacturing.receipt.supplier' | translate }}</mat-label><input matInput type="text" formControlName="supplier"></mat-form-field></div>
          <div class="field"><mat-form-field appearance="outline"><mat-label>{{ 'manufacturing.receipt.supplier-lot' | translate }}</mat-label><input matInput type="text" formControlName="supplierLot" placeholder="MI-AC-0926"></mat-form-field></div>
          <div class="field"><mat-form-field appearance="outline"><mat-label>{{ 'manufacturing.receipt.internal-lot' | translate }}</mat-label><input matInput type="text" formControlName="code" placeholder="RM-26105" (input)="duplicateLot.set(false)"></mat-form-field>
@if (isInvalid('code')) { <p class="field-error">{{ 'manufacturing.receipt.lot-error' | translate }}</p> }
@if (duplicateLot()) { <p class="field-error">{{ 'manufacturing.receipt.lot-duplicate' | translate }}</p> }</div>
          <div class="field"><mat-form-field appearance="outline"><mat-label>{{ 'manufacturing.receipt.quantity' | translate }}</mat-label><input matInput type="text" formControlName="quantity" placeholder="500 kg · 20 sealed drums"></mat-form-field></div>
          <div class="field"><mat-form-field appearance="outline"><mat-label>{{ 'manufacturing.receipt.expiry' | translate }}</mat-label><input matInput type="date" formControlName="expiryDate"></mat-form-field></div>
          <div class="field full"><mat-form-field appearance="outline"><mat-label>{{ 'manufacturing.receipt.location' | translate }}</mat-label><input matInput type="text" formControlName="storageLocation"></mat-form-field></div>
          <div class="field full upload" [class.invalid]="isInvalid('certificate')">
            <span class="upload-label">{{ 'manufacturing.receipt.certificate' | translate }} *</span>
            <input #certificate type="file" accept=".pdf" hidden (change)="attachCertificate($event)">
            <div class="row">
              <button mat-stroked-button type="button" (click)="certificate.click()"><mat-icon>upload_file</mat-icon>PDF</button>
              @if (form.controls.certificate.value) {
                <span class="attached"><mat-icon class="inline">attach_file</mat-icon>{{ form.controls.certificate.value }} <span class="chip chip-success">{{ 'manufacturing.receipt.attached' | translate }}</span></span>
              }
            </div>
          </div>
        </div>
        <div class="row">
          <button mat-flat-button type="submit" [disabled]="store.loading()">{{ 'manufacturing.receipt.record' | translate }}</button>
          <span class="small muted">{{ 'manufacturing.receipt.record-note' | translate }}</span>
        </div>
      </form></mat-card>

      <mat-card appearance="outlined">
        <h2 class="card-title">{{ 'manufacturing.receipt.lots' | translate }}</h2>
        <div class="table-scroll"><table mat-table [dataSource]="store.materialLots()" [attr.aria-label]="'manufacturing.receipt.lots' | translate">
  <ng-container matColumnDef="c0">
    <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.receipt.internal-lot' | translate }}</th>
    <td mat-cell *matCellDef="let lot"><strong>{{ lot.code }}</strong><span class="sub">{{ lot.receiptCode }}</span></td>
  </ng-container>
  <ng-container matColumnDef="c1">
    <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.receipt.material' | translate }}</th>
    <td mat-cell *matCellDef="let lot">{{ lot.material }}<span class="sub">{{ lot.supplier }}</span></td>
  </ng-container>
  <ng-container matColumnDef="c2">
    <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.receipt.expiry' | translate }}</th>
    <td mat-cell *matCellDef="let lot">{{ lot.expiryDate | date: 'MMM dd, yyyy' }}</td>
  </ng-container>
  <ng-container matColumnDef="c3">
    <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.receipt.disposition' | translate }}</th>
    <td mat-cell *matCellDef="let lot"><span class="chip chip-dot" [class]="lot.status === 'approved' ? 'chip-success' : lot.status === 'rejected' ? 'chip-danger' : 'chip-warning'">{{ 'manufacturing.lot-status.' + lot.status | translate }}</span></td>
  </ng-container>
  <tr mat-header-row *matHeaderRowDef="['c0', 'c1', 'c2', 'c3']"></tr>
  <tr mat-row *matRowDef="let lot; columns: ['c0', 'c1', 'c2', 'c3']" class="clickable" [class.highlight]="lot.code === selected()?.code" (click)="selectedCode.set(lot.code)"></tr>
</table></div>
      </mat-card>
    </div>

    <aside class="stack">
      @if (selected(); as lot) {
        <mat-card appearance="outlined" class="panel side">
          <h2>{{ 'manufacturing.receipt.checklist' | translate }} · {{ lot.code }}</h2>
          <div class="check">
            <span><strong>{{ 'manufacturing.receipt.packaging' | translate }}</strong></span>
            <span class="chip chip-dot" [class]="lot.packagingVerified ? 'chip-success' : 'chip-warning'">{{ (lot.packagingVerified ? 'manufacturing.receipt.verified' : 'manufacturing.receipt.pending') | translate }}</span>
          </div>
          <div class="check">
            <span><strong>{{ 'manufacturing.receipt.identity' | translate }}</strong></span>
            <span class="chip chip-dot" [class]="lot.identityVerified ? 'chip-success' : 'chip-warning'">{{ (lot.identityVerified ? 'manufacturing.receipt.verified' : 'manufacturing.receipt.pending') | translate }}</span>
          </div>
          <div class="check">
            <span><strong>{{ 'manufacturing.receipt.sampling' | translate }}</strong></span>
            <span class="chip chip-dot" [class]="lot.samplingStatus === 'done' ? 'chip-success' : 'chip-warning'">{{ 'manufacturing.sampling-status.' + lot.samplingStatus | translate }}</span>
          </div>
          <div class="check">
            <span><strong>{{ 'manufacturing.receipt.quality-approval' | translate }}</strong><span class="small muted">{{ 'manufacturing.receipt.quality-approval-text' | translate }}</span></span>
            <span class="chip chip-dot chip-neutral">{{ 'manufacturing.lot-status.' + lot.status | translate }}</span>
          </div>
          <button mat-flat-button type="button" class="block" (click)="store.requestInspection(lot)"
                  [disabled]="lot.samplingStatus !== 'pending' || lot.status === 'approved' || lot.status === 'rejected'">
            {{ 'manufacturing.receipt.request-inspection' | translate }}
          </button>
        </mat-card>
        <mat-card appearance="outlined" class="panel side">
          <h2>{{ 'manufacturing.receipt.disposition' | translate }}</h2>
          <span class="chip chip-dot chip-warning">{{ 'manufacturing.lot-status.' + lot.status | translate }}</span>
          <p class="small muted">{{ 'manufacturing.receipt.disposition-text' | translate }}</p>
        </mat-card>
      }
    </aside>
  </div>
</section>

</template>

<script setup>
/**
 * Raw-material receipt: lots in quarantine, receipt form, inspection checklist and disposition.
 */


  protected store = inject(ManufacturingStore);

  /**
   * Steps of the receipt flow.
   */
  protected steps = ['receipt', 'sampling', 'inspection', 'disposition'];

  /**
   * Code of the lot shown in the checklist.
   */
  protected selectedCode = signal<string | null>(null);

  /**
   * Lot shown in the checklist: the selected one or the newest.
   */
  protected selected = computed(() =>
    this.store.materialLots().find(lot => lot.code === this.selectedCode()) ?? this.newestLot());

  /**
   * Newest lot that is not approved yet.
   */
  newestLot = computed(() =>
    [...this.store.materialLots()].sort((a, b) => b.code.localeCompare(a.code)).find(lot => lot.status !== 'approved'));

  /**
   * Index of the current step of the selected lot.
   */
  protected stepIndex = computed(() => {
    const status = this.selected()?.status;
    return status === 'quarantine' ? 0 : status === 'sampling' ? 1 : status === 'inspection' ? 2 : 3;
  });

  /**
   * Receipt form.
   */
  protected form = new FormGroup({
    material: new FormControl('Paracetamol (API)', {nonNullable: true, validators: [Validators.required]}),
    supplier: new FormControl('Meridian Ingredients', {nonNullable: true, validators: [Validators.required]}),
    supplierLot: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    code: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(/^RM-\d{5}$/)]}),
    quantity: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    expiryDate: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    storageLocation: new FormControl('Q-A12 · Quarantine zone', {nonNullable: true, validators: [Validators.required]}),
    certificate: new FormControl('', {nonNullable: true, validators: [Validators.required]})
  });

  /**
   * Whether the internal lot code already exists.
   */
  protected duplicateLot = signal(false);

  /**
   * Stores the name of the attached certificate of analysis.
   * @param event - Change event of the file input.
   */
  protected attachCertificate(event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.form.controls.certificate.setValue(file?.name ?? '');
  }

  /**
   * Records the receipt: the lot enters quarantine and moves to sampling.
   */
  protected record(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.duplicateLot.set(this.store.materialLots().some(lot => lot.code === value.code));
    if (this.duplicateLot()) return;
    this.store.addMaterialLot(new MaterialLot({
      id: 0, code: value.code, receiptCode: value.code.replace('RM-', 'RCV-'), material: value.material,
      category: value.material.includes('API') ? 'api' : 'excipient', supplier: value.supplier, supplierLot: value.supplierLot,
      quantity: value.quantity, expiryDate: value.expiryDate, storageLocation: value.storageLocation, certificate: value.certificate,
      status: 'sampling', packagingVerified: true, identityVerified: true, samplingStatus: 'pending', allocatedBatch: ''
    }));
    this.selectedCode.set(value.code);
    this.form.reset();
  }

  /**
   * Whether a control is invalid and touched.
   * @param controlName - Name of the control.
   */
  protected isInvalid(controlName: keyof typeof this.form.controls) {
    return this.isInvalidControl(this.form, controlName);
  }
</script>

<style scoped>
.stepper {
  display: flex;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.stepper li {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 10px;
  color: var(--slate);
}

.stepper li span {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1.5px solid #cbd5e1;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
}

.stepper li.done span {
  border-color: var(--teal);
  background: var(--teal);
  color: #fff;
}

.stepper li.current {
  color: var(--teal);
  font-weight: 600;
}

.stepper li.current span {
  border-color: var(--teal);
}

.receipt,
.side {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
}

.attached {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border: 1px solid #99f6e4;
  border-radius: 8px;
  background: var(--mint);
  font-weight: 500;
}

.clickable {
  cursor: pointer;
}

.check {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.check > span:first-child {
  display: flex;
  flex-direction: column;
}

@media (max-width: 800px) {
  .stepper {
    flex-direction: column;
  }
}

.side > .chip {
  align-self: flex-start;
}

.upload {
  gap: 8px;
  margin-bottom: 16px;
}

.upload-label {
  color: var(--slate);
  font-size: 13px;
  font-weight: 600;
}

.upload.invalid .upload-label {
  color: var(--danger-dark);
}

[class*="step"] span .mat-icon {
  width: 16px;
  height: 16px;
  font-size: 16px;
}

</style>