import { isEmail, parseEmail } from './regex/regex'
import { checkTypo } from './typo/typo'
import { getBestMx } from './dns/dns'
import { checkSMTP } from './smtp/smtp'
import { checkDisposable } from './disposable/disposable'
import { getOptions, ValidatorOptions } from './options/options'
import { OutputFormat, createOutput } from './output/output'
import './types'

export async function validate(emailOrOptions: string | ValidatorOptions): Promise<OutputFormat> {
  const options = getOptions(emailOrOptions)
  const emailRaw = options.email

  const regexResponse = parseEmail(emailRaw, {
    allowQuoted: options.allowQuoted,
    allowAngle: options.allowAngle,
    rejectSubaddressing: options.rejectSubaddressing,
  })
  if (options.validateRegex && 'error' in regexResponse) return createOutput('regex', regexResponse.error)
  // fallback to the naive domain extraction if the user specifically opted out of format validation
  const domain = 'domain' in regexResponse ? regexResponse.domain : emailRaw.split('@')[1]
  const email = 'effectiveAddr' in regexResponse ? regexResponse.effectiveAddr : emailRaw.trim()

  // prevent SMTP injection
  if (email.indexOf('\r') !== -1 || email.indexOf('\n') !== -1) {
    return createOutput('sanitization', 'Email cannot contain newlines')
  }

  if (options.validateTypo) {
    const typoResponse = await checkTypo(email, options.additionalTopLevelDomains)
    if (typoResponse) return createOutput('typo', typoResponse)
  }

  if (options.validateDisposable) {
    const disposableResponse = await checkDisposable(domain)
    if (disposableResponse) return createOutput('disposable', disposableResponse)
  }

  if (options.validateMx) {
    const mx = await getBestMx(domain)
    if (!mx) return createOutput('mx', 'MX record not found')
    if (options.validateSMTP) {
      return checkSMTP(options.sender, email, mx.exchange)
    }
  }

  return createOutput()
}

export default validate
