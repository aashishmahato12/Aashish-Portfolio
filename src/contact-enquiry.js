export const contactEmail = 'mahatoaashish5@gmail.com';

export function buildProjectEnquiry(fields) {
  const value = key => String(fields[key] || '').trim();
  const service = value('service') || 'Not sure yet';
  const lines = [
    `Name: ${value('name')}`,
    `Email: ${value('email')}`,
    `Service: ${service}`,
    '',
    'Project details:',
    value('project'),
  ];
  if (value('budget')) lines.push('', `Budget: ${value('budget')}`);
  if (value('timeline')) lines.push('', `Timeline: ${value('timeline')}`);
  const subject = `Project enquiry — ${service}`;
  const body = lines.join('\r\n');
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildGmailEnquiry(fields) {
  const draft = new URL(buildProjectEnquiry(fields));
  const params = new URLSearchParams({ view: 'cm', fs: '1', to: contactEmail, su: draft.searchParams.get('subject'), body: draft.searchParams.get('body') });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function buildOutlookEnquiry(fields) {
  const draft = new URL(buildProjectEnquiry(fields));
  const params = new URLSearchParams({ to: contactEmail, subject: draft.searchParams.get('subject'), body: draft.searchParams.get('body') });
  return `https://outlook.live.com/mail/0/deeplink/compose?${params.toString()}`;
}
