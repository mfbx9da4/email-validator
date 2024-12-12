// The RFC 5322 3.4.1 quoted flavor of email addresses which accepts more characters
const emailRegexAddrSpecRFC5322Quoted =
  /^"([\x21\x23-\x5B\x5D-\x7E]+)"@([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/

// The WhatWG standard for email addresses, this is usually what you want for web forms.
// https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
const emailRegexAddrSpecWhatWG =
  /^([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+)@([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/

export type ParseEmailOptions = {
  // Allow RFC 5322 angle address such as '"Name" <email@domain>'
  // use this option if you want to parse emails from headers or envelope addresses
  allowAngle?: boolean
  // Allow RFC 5322 quoted email address such as '"this+is+my+personal+email+address@me.invalid"@gmail.com'
  // use this option if you want to accept lesser known email address formats
  allowQuoted?: boolean
  // Reject addresses containing "+", which is used for subaddressing
  // use this option to enforce one email per user
  rejectSubaddressing?: boolean
}

export const parseEmail = (
  email: string,
  options: ParseEmailOptions = {}
): { local: string; domain: string; effectiveAddr: string } | { error: string } => {
  email = email.trim()

  if (email.endsWith('>')) {
    if (!options.allowAngle) {
      return { error: 'Angle address is not allowed' }
    }

    const match = email.match(new RegExp('^[^<]*<([^>]+)>$'))
    if (!match) {
      return { error: 'Invalid angle address' }
    }

    email = match[1]
  }

  if (email.indexOf('@') === -1) {
    return { error: 'Email does not contain "@".' }
  }

  if (email.startsWith('"')) {
    if (!options.allowQuoted) {
      return { error: 'Quoted email addresses are not allowed' }
    }
    const match = email.match(emailRegexAddrSpecRFC5322Quoted)
    if (!match) {
      return { error: 'Invalid quoted email address' }
    }
    const [, local, domain] = match

    if (options.rejectSubaddressing && local.includes('+')) {
      return { error: 'Subaddressing is not allowed' }
    }

    return { local, domain, effectiveAddr: `"${local}"@${domain}` }
  }

  const match = email.match(emailRegexAddrSpecWhatWG)
  if (!match) {
    return { error: 'Invalid email address' }
  }

  const [, local, domain] = match

  if (options.rejectSubaddressing && local.includes('+')) {
    return { error: 'Subaddressing is not allowed' }
  }

  return { local, domain, effectiveAddr: `${local}@${domain}` }
}

// Left for backwards compatibility
export const isEmail = (email: string): string | undefined => {
  const response = parseEmail(email, { allowQuoted: true, allowAngle: true })
  if ('error' in response) {
    return response.error
  }

  return undefined
}
