export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPhoneNumber(phone: string): boolean {
  // Supports Indonesian and international telephone formats
  return /^(\+62|62|0)8[1-9][0-9]{6,10}$/.test(phone.replace(/[\s-]/g, ''))
}

export function isValidNIK(nik: string): boolean {
  // Indonesian 16-digit National Identification Number
  return /^[0-9]{16}$/.test(nik)
}

export function isValidNPWP(npwp: string): boolean {
  // Indonesian NPWP (15 or 16 digits without formatting)
  const clean = npwp.replace(/[\s.-]/g, '')
  return /^[0-9]{15,16}$/.test(clean)
}
