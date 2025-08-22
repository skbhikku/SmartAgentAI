export const CATEGORIES = [
  { id: 'technical', name: 'Technical Support', description: 'Hardware, software, and system issues' },
  { id: 'billing', name: 'Billing & Payment', description: 'Payment issues and billing inquiries' },
  { id: 'account', name: 'Account Management', description: 'Account setup, profile changes, and access issues' },
  { id: 'general', name: 'General Inquiry', description: 'General questions and information requests' },
  { id: 'feature', name: 'Feature Request', description: 'Suggestions for new features or improvements' },
  { id: 'bug', name: 'Bug Report', description: 'Software bugs and unexpected behavior' },
  { id: 'shipping', name: 'Shipping & Delivery', description: 'Issues related to shipping and delivery of products' }
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];