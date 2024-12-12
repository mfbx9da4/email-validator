import { ParseEmailOptions } from '../regex/regex'

const defaultOptions: ValidatorOptionsFinal = {
  email: 'name@example.org',
  sender: 'name@example.org',
  validateRegex: true,
  validateMx: true,
  validateTypo: true,
  validateDisposable: true,
  validateSMTP: true,
}

type Options = {
  sender: string
  validateRegex: boolean
  validateMx: boolean
  validateTypo: boolean
  validateDisposable: boolean
  validateSMTP: boolean
} & ParseEmailOptions

type MailCheckOptions = {
  additionalTopLevelDomains?: string[]
}

export type ValidatorOptions = Partial<Options> & { email: string } & MailCheckOptions
type ValidatorOptionsFinal = Options & { email: string } & MailCheckOptions

export function getOptions(emailOrOptions: string | ValidatorOptions): ValidatorOptionsFinal {
  let options: ValidatorOptionsFinal = defaultOptions

  if (typeof emailOrOptions === 'string') {
    options = { ...options, email: emailOrOptions }
  } else {
    options = { ...options, ...emailOrOptions }
  }
  return options
}
