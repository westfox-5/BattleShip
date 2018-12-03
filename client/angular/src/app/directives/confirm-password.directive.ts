import { Directive } from '@angular/core';
import {NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn, FormGroup, AbstractControl } from '@angular/forms';


@Directive({
    selector: '[appConfirmPassword]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ConfirmPasswordDirective, multi: true }]
  })
  export class ConfirmPasswordDirective implements Validator {
    validate(control: AbstractControl): ValidationErrors {
      return matchPasswordValidator(control);
    }
  }

  export const matchPasswordValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const password = control.get('password');
    const cpassword = control.get('cpassword');

    return password && cpassword && password.value !== cpassword.value && password.value !== '' ? { 'failedMatchPasswords': true } : null;
  };
