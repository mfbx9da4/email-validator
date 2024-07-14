const defaultOptions: ValidatorOptionsFinal = {
  email: 'name@example.org',
  sender: 'name@example.org',
  timeout: 10 * 1000,
  port: 25,
  validateRegex: true,
  validateMx: true,
  validateTypo: true,
  validateDisposable: true,
  validateSMTP: true,
}

type Options = {
  sender: string
  port: number
  timeout: number
  validateRegex: boolean
  validateMx: boolean
  validateTypo: boolean
  validateDisposable: boolean
  validateSMTP: boolean
}

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
