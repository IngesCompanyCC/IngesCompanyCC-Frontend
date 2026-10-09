<template>
@if (rejection().length) {
  <mat-dialog-content class="rejected">
    <span class="dialog-icon"><mat-icon>error_outline</mat-icon></span>
    <h2>{{ $t('manufacturing.batches.rejected-title') }}</h2>
    <p class="muted">
      <template v-for="reason in rejection()" :key="reason">
        {{ 'manufacturing.batches.rejected.' + reason, {code: form.controls.code.value, product: form.controls.productCode.value}) }}</template>
    </p>
  </mat-dialog-content>
  <mat-dialog-actions class="actions">
    <button mat-stroked-button type="button" mat-dialog-close>{{ $t('shell.cancel') }}</button>
    <button mat-flat-button type="button" (click)="changeData()">{{ $t('manufacturing.batches.change-data') }}</button>
  </mat-dialog-actions>
} @else {
  <h2 mat-dialog-title>{{ $t('manufacturing.batches.create') }}</h2>
  <form [formGroup]="form" (ngSubmit)="saveBatch()" novalidate>
    <mat-dialog-content class="form">
      <mat-form-field appearance="outline">
        <mat-label>{{ $t('manufacturing.batches.batch-code') }}</mat-label>
        <input matInput formControlName="code" placeholder="B-26045" required>
        <mat-error>{{ $t('manufacturing.batches.code-error') }}</mat-error>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>{{ $t('manufacturing.products.product') }}</mat-label>
        <mat-select formControlName="productCode" required>
          <template v-for="product in store.products" :key="product.id">
            <mat-option [value]="product.code">{{ product.code }} · {{ product.name }}</mat-option></template>
        </mat-select>
      </mat-form-field>
      <div class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>{{ $t('manufacturing.batches.quantity') }}</mat-label>
          <input matInput type="number" formControlName="quantity" min="1" required>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ $t('manufacturing.batches.line') }}</mat-label>
          <mat-select formControlName="line" required>
            <template v-for="line in lines" :key="line">
              <mat-option [value]="line">{{ line }}</mat-option></template>
          </mat-select>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions class="actions">
      <button mat-stroked-button type="button" mat-dialog-close>{{ $t('shell.cancel') }}</button>
      <button mat-flat-button type="submit">{{ $t('manufacturing.batches.create') }}</button>
    </mat-dialog-actions>
  </form></template>
</template>

<script setup>
/**
 * Dialog that registers a new batch. A batch is rejected when its number already exists or when
 * the master formula of the product is not approved.
 */

  const store = inject(ManufacturingStore);
  iamStore = inject(IamStore);
  dialogRef = inject(MatDialogRef<BatchForm, string>);

  /**
   * Production lines of the plant.
   */
  const lines = ['Line 01', 'Line 02', 'Line 03'];

  /**
   * Reasons why the last batch could not be registered.
   */
  const rejection = signal<BatchRejection[]>([]);

  /**
   * Create batch form.
   */
  form = new FormGroup({
    code: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(/^B-\d{5}$/)]}),
    productCode: new FormControl('AC500', {nonNullable: true, validators: [Validators.required]}),
    quantity: new FormControl(120000, {nonNullable: true, validators: [Validators.required, Validators.min(1)]}),
    line: new FormControl('Line 01', {nonNullable: true, validators: [Validators.required]})
  });

  /**
   * Registers the batch and closes the dialog with its code, or shows why it cannot be registered.
   */
  saveBatch = () => {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;</template>
    const value = this.form.getRawValue();
    const reasons = this.store.validateBatch(value.code, value.productCode);
    this.rejection.set(reasons);
    if (reasons.length) return;
    this.store.addBatch(new Batch({
      id: 0, code: value.code, productCode: value.productCode, orderCode: value.code.replace('B-', 'PO-'),
      quantity: value.quantity, line: value.line, owner: this.iamStore.currentUser?.fullName ?? '', status: 'planned',
      progress: 0, incident: '', lastActivity: 'Created', lastActivityAt: new Date().toISOString()
    }));
    this.dialogRef.close(value.code);
  };

  /**
   * Returns to the form to change the batch number.
   */
  const changeData(): void {
    this.rejection.set([]);</template>
</script>

<style scoped>
.rejected {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 28px;</template>
.rejected h2 {
  font-size: 20px;</template>
.dialog-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--danger-bg);
  color: var(--danger);</template>
.form {
  min-width: 420px;
  padding-top: 8px;</template>
.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 8px 24px 24px;</template>
@media (max-width: 600px) {
  .form {
    min-width: 0;</template></template>
</style>