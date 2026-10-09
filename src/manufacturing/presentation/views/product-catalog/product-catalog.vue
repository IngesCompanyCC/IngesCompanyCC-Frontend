
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
 * Product catalog, new product form and the master formula of the selected product.
 */


  const store = inject(ManufacturingStore);

  /**
   * Code of the product whose formula is shown.
   */
  const selectedCode = signal('AC500');

  /**
   * Effective master formula of the selected product.
   */
  const formula = computed(() =>
    this.store.formulas.find(item => item.productCode === this.selectedCode() && item.status === 'approved')
    ?? this.store.formulas.find(item => item.productCode === this.selectedCode()));

  /**
   * Components of the selected formula.
   */
  const components = computed(() =>
    this.store.formulaItems.filter(item => item.formulaId === this.formula()?.id && item.kind === 'component'));

  /**
   * Whether the code entered already exists.
   */
  const duplicateCode = signal<string | null>(null);

  /**
   * New product form.
   */
  const form = new FormGroup({
    code: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(/^[A-Za-z]{2}\d{3}$/)]}),
    name: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    dosageForm: new FormControl('Tablet', {nonNullable: true, validators: [Validators.required]})
  });

  /**
   * Dosage forms offered in the form.
   */
  const dosageForms = ['Tablet', 'Capsule', 'Syrup', 'Injectable'];

  /**
   * Color of the formula status chip.
   * @param status - Formula status.
   */
  const toneOf(status) {
    return status === 'approved' ? 'chip-success' : status === 'pending' ? 'chip-warning' : 'chip-neutral';}
  /**
   * Registers the product when the form is valid and the code is unique.
   */
  const register(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;}
    const value = this.form.getRawValue();
    const code = value.code.toUpperCase();
    const added = this.store.addProduct(new Product({
      id: 0, code, name: value.name.trim(), dosageForm: value.dosageForm, formulaVersion: '', formulaStatus: 'none'
    }));
    this.duplicateCode.set(added ? null : code);
    if (added) this.form.reset({code: '', name: '', dosageForm: 'Tablet'});}
  /**
   * Whether a control is invalid and touched.
   * @param controlName - Name of the control.
   */
  const isInvalid(controlName: 'code' | 'name') {
    return this.isInvalidControl(this.form, controlName);}

</script>
