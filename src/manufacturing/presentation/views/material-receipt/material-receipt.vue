
<template>
  <div class="p-4">
    <pv-card>
      <template #title>Migration Status</template>
      <template #content>
        <p>This view has been stubbed because the automated Angular-to-Vue template migration produced incompatible ASTs.</p>
      </template>
    </pv-card>
  </div>
</template>

<script setup>

/**
 * Raw-material receipt: lots in quarantine, receipt form, inspection checklist and disposition.
 */


  const store = inject(ManufacturingStore);

  /**
   * Steps of the receipt flow.
   */
  const steps = ['receipt', 'sampling', 'inspection', 'disposition'];

  /**
   * Code of the lot shown in the checklist.
   */
  const selectedCode = signal<string | null>(null);

  /**
   * Lot shown in the checklist: the selected one or the newest.
   */
  const selected = computed(() =>
    this.store.materialLots.find(lot => lot.code === this.selectedCode()) ?? this.newestLot());

  /**
   * Newest lot that is not approved yet.
   */
  newestLot = computed(() =>
    [...this.store.materialLots].sort((a, b) => b.code.localeCompare(a.code)).find(lot => lot.status !== 'approved'));

  /**
   * Index of the current step of the selected lot.
   */
  const stepIndex = computed(() => {
    const status = this.selected()?.status;
    return status === 'quarantine' ? 0 : status === 'sampling' ? 1 : status === 'inspection' ? 2 : 3;
  });

  /**
   * Receipt form.
   */
  const form = new FormGroup({
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
  const duplicateLot = signal(false);

  /**
   * Stores the name of the attached certificate of analysis.
   * @param event - Change event of the file input.
   */
  const attachCertificate(event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.form.controls.certificate.setValue(file?.name ?? '');}
  /**
   * Records the receipt: the lot enters quarantine and moves to sampling.
   */
  const record(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;}
    const value = this.form.getRawValue();
    this.duplicateLot.set(this.store.materialLots.some(lot => lot.code === value.code));
    if (this.duplicateLot()) return;
    this.store.addMaterialLot(new MaterialLot({
      id: 0, code: value.code, receiptCode: value.code.replace('RM-', 'RCV-'), material: value.material,
      category: value.material.includes('API') ? 'api' : 'excipient', supplier: value.supplier, supplierLot: value.supplierLot,
      quantity: value.quantity, expiryDate: value.expiryDate, storageLocation: value.storageLocation, certificate: value.certificate,
      status: 'sampling', packagingVerified: true, identityVerified: true, samplingStatus: 'pending', allocatedBatch: ''
    }));
    this.selectedCode.set(value.code);
    this.form.reset();}
  /**
   * Whether a control is invalid and touched.
   * @param controlName - Name of the control.
   */
  const isInvalid(controlName: keyof typeof this.form.controls) {
    return this.isInvalidControl(this.form, controlName);}

</script>
