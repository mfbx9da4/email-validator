import { ElementType } from '../types'

const OrderedLevels = ['sanitization', 'regex', 'typo', 'disposable', 'mx', 'smtp'] as const

export type SubOutputFormat = {
  valid: boolean
  reason?: string
}

type Level = ElementType<typeof OrderedLevels>

export interface GeneralOutputFormat extends SubOutputFormat {
  reason?: Level
}

export type OutputFormat = GeneralOutputFormat & {
  validators: {
    [K in Level]?: SubOutputFormat
  }
}

export const createOutput = (failLevel?: Level, failReason?: string): OutputFormat => {
  const out: OutputFormat = { valid: true, validators: {} }
  if (failLevel) {
    out.reason = failLevel
    out.valid = false
  }
  let valid = true
  for (let i = 0; i < OrderedLevels.length; i++) {
    const level = OrderedLevels[i]
    const levelOut: SubOutputFormat = { valid }
    if (level === failLevel) {
      valid = false
      levelOut.valid = false
      levelOut.reason = failReason
    }
    out.validators[level] = levelOut
  }
  return out
}
