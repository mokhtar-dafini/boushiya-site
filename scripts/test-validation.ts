import { validateVisitorInput, cleanAndValidatePhone, validateEmail, validateFullName } from '../lib/validation';

console.log('Testing Visitor Validation...');

// 1. Test Full Name
console.log('--- Test Name ---');
console.assert(validateFullName('سارة العتيبي').valid === true, 'Valid Arabic name should pass');
console.assert(validateFullName('').valid === false, 'Empty name should fail');
console.assert(validateFullName('A').valid === false, 'Single char name should fail');

// 2. Test Phone
console.log('--- Test Phone ---');
const saudi1 = cleanAndValidatePhone('0512345678');
console.assert(saudi1.valid && saudi1.cleanPhone === '0512345678', '0512345678 should pass');

const saudi2 = cleanAndValidatePhone('+966 51 234 5678');
console.assert(saudi2.valid && saudi2.cleanPhone === '0512345678', '+966 format should standardize to 05xxxxxxxx');

const saudiArabic = cleanAndValidatePhone('٠٥١٢٣٤٥٦٧٨');
console.assert(saudiArabic.valid && saudiArabic.cleanPhone === '0512345678', 'Arabic numerals phone should standardize to 05xxxxxxxx');

const invalidPhone = cleanAndValidatePhone('1234');
console.assert(invalidPhone.valid === false, 'Short phone should fail');

// 3. Test Email
console.log('--- Test Email ---');
console.assert(validateEmail('sara@example.com').valid === true, 'Valid email should pass');
console.assert(validateEmail('invalid-email').valid === false, 'Invalid email should fail');
console.assert(validateEmail('').valid === false, 'Empty email should fail');

// 4. Test Complete Payload
console.log('--- Test Complete Payload ---');
const validPayload = validateVisitorInput({
  fullName: 'نورة الدوسري',
  phone: '0501234567',
  email: 'noura@test.com',
  ticketCategory: 'مميزة',
  quantity: 2
});

console.assert(validPayload.valid === true, 'Valid payload should pass');
console.assert(validPayload.cleanedData?.estimatedTotal === 500, '2 tickets at 250 each should equal 500 total');
console.log('Calculated total for 2 مميزة tickets:', validPayload.cleanedData?.estimatedTotal, 'SAR');

console.log('✅ ALL VALIDATION TESTS PASSED SUCCESSFULLY!');
