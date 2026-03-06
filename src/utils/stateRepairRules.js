const RAW_STATE_REPAIR_RULES = {
  AL: { name: 'Alabama', deadline: '14 days after written notice', process: 'Send written notice with photos. Follow up on day 7. Escalate if no action by day 14.', followUpDays: [7, 14] },
  AK: { name: 'Alaska', deadline: '10 days after written notice', process: 'Send written notice with clear issue details. Follow up on day 5. Escalate if no action by day 10.', followUpDays: [5, 10] },
  AZ: { name: 'Arizona', deadline: '10 days (5 days for health/safety issues)', process: 'Send written notice and mark health/safety risks clearly. Follow up at day 3 for urgent issues and day 5 otherwise.', followUpDays: [3, 5, 10] },
  AR: { name: 'Arkansas', deadline: '30 days after certified-mail notice', process: 'Send certified written notice with issue list and photos. Follow up on day 14 and day 30.', followUpDays: [14, 30] },
  CA: { name: 'California', deadline: '30 days in most cases', process: 'Send written notice with specific defects and photos. Follow up on day 7 and day 14; request completion date by day 30.', followUpDays: [7, 14, 30] },
  CO: { name: 'Colorado', deadline: 'Begin in 24 hours (up to 96 hours depending on conditions)', process: 'Send written or electronic notice and state urgency. Follow up same day for urgent issues and again by day 4.', followUpDays: [1, 4] },
  CT: {
    name: 'Connecticut',
    deadline: '15 days after written notice',
    urgencyDeadlines: {
      emergency: '24-72 hours for essential emergency repairs',
    },
    process: 'Send written notice with photos and timeline. Follow up on day 7 and day 15.',
    followUpDays: [7, 15],
    urgencyFollowUpDays: {
      emergency: [1, 3],
    },
  },
  DE: { name: 'Delaware', deadline: '15 days after notice', process: 'Send written notice with issue details. Follow up on day 7 and day 15.', followUpDays: [7, 15] },
  FL: { name: 'Florida', deadline: '7 days after written notice', process: 'Send written notice, include all known issues, and attach photos. Follow up on day 3 and day 7.', followUpDays: [3, 7] },
  GA: { name: 'Georgia', deadline: 'Reasonable time (case-by-case)', process: 'Send written notice with a requested response date. Follow up on day 3 and day 7, then continue weekly.', followUpDays: [3, 7, 14] },
  HI: { name: 'Hawaii', deadline: '12 business days (1 week for substantial issues, 3 business days for essential utilities/appliances)', process: 'Send written notice listing every known defect. Follow up quickly for essential-service issues and track by business day.', followUpDays: [3, 7, 12] },
  ID: { name: 'Idaho', deadline: '3 days after written notice', process: 'Send written notice describing the issue clearly. Follow up on day 2 and day 3.', followUpDays: [2, 3] },
  IL: { name: 'Illinois', deadline: '14 days after registered/certified written notice', process: 'Send notice by registered or certified mail and keep proof. Follow up on day 7 and day 14.', followUpDays: [7, 14] },
  IN: { name: 'Indiana', deadline: 'Reasonable time (case-by-case)', process: 'Send written notice and request a concrete completion date. Follow up on day 3 and day 7, then weekly.', followUpDays: [3, 7, 14] },
  IA: { name: 'Iowa', deadline: '7 days after written notice', process: 'Send written notice with photos and exact locations. Follow up on day 3 and day 7.', followUpDays: [3, 7] },
  KS: { name: 'Kansas', deadline: '14 days to begin good-faith repairs', process: 'Send written notice and ask for a start date. Follow up on day 7 and day 14.', followUpDays: [7, 14] },
  KY: { name: 'Kentucky', deadline: '14 days in URLTA jurisdictions', process: 'Send written notice and request start/completion dates. Follow up on day 7 and day 14.', followUpDays: [7, 14] },
  LA: { name: 'Louisiana', deadline: 'Reasonable time (case-by-case)', process: 'Send written notice with photos and a requested deadline. Follow up on day 3 and day 7, then weekly.', followUpDays: [3, 7, 14] },
  ME: { name: 'Maine', deadline: 'Reasonable time (prompt action expected)', process: 'Send written notice with specific defects and photos. Follow up on day 3 and day 7, then weekly.', followUpDays: [3, 7, 14] },
  MD: { name: 'Maryland', deadline: 'Reasonable time (over 30 days is generally unreasonable)', process: 'Send written notice with evidence and requested completion date. Follow up on day 7, day 14, and day 30.', followUpDays: [7, 14, 30] },
  MA: { name: 'Massachusetts', deadline: 'Reasonable time (typically around 14 days)', process: 'Send written notice and include citations/photos if available. Follow up on day 7 and day 14.', followUpDays: [7, 14] },
  MI: { name: 'Michigan', deadline: 'Reasonable time (case-by-case)', process: 'Send written notice with issue details and evidence. Follow up on day 7 and then weekly.', followUpDays: [7, 14] },
  MN: { name: 'Minnesota', deadline: '14 days after written notice', process: 'Send written notice and request a completion timeline. Follow up on day 7 and day 14.', followUpDays: [7, 14] },
  MS: { name: 'Mississippi', deadline: '14 days after written notice', process: 'Send written notice listing each defect clearly. Follow up on day 7 and day 14.', followUpDays: [7, 14] },
  MO: { name: 'Missouri', deadline: 'Reasonable time (often treated as about 14 days)', process: 'Send written notice and request a repair start date. Follow up on day 7 and day 14.', followUpDays: [7, 14] },
  MT: { name: 'Montana', deadline: '14 days (3 business days for emergencies)', process: 'Send written notice and mark emergency conditions clearly. Follow up on day 3 for emergencies and day 7/day14 for standard issues.', followUpDays: [3, 7, 14] },
  NE: { name: 'Nebraska', deadline: '14 days after written notice', process: 'Send written notice with supporting photos. Follow up on day 7 and day 14.', followUpDays: [7, 14] },
  NV: { name: 'Nevada', deadline: '14 days to use best effort after written notice', process: 'Send written notice and ask for immediate scheduling. Follow up on day 7 and day 14.', followUpDays: [7, 14] },
  NH: { name: 'New Hampshire', deadline: '14 days after written notice', process: 'Send written notice and request dates for access and completion. Follow up on day 7 and day 14.', followUpDays: [7, 14] },
  NJ: { name: 'New Jersey', deadline: 'Adequate time under circumstances', process: 'Send certified written notice with photos. Follow up on day 3 and day 7, then weekly.', followUpDays: [3, 7, 14] },
  NM: { name: 'New Mexico', deadline: '7 days to reasonably attempt repairs', process: 'Send written notice and ask for confirmation and schedule. Follow up on day 3 and day 7.', followUpDays: [3, 7] },
  NY: { name: 'New York', deadline: 'Reasonable time (emergencies immediately; many non-emergencies within about 30 days)', process: 'Send written notice with urgency and photos. Follow up on day 3 for urgent issues and day 7/day30 for standard issues.', followUpDays: [3, 7, 30] },
  NC: { name: 'North Carolina', deadline: 'Reasonable time (case-by-case)', process: 'Send written notice and request a written schedule. Follow up on day 3 and day 7, then weekly.', followUpDays: [3, 7, 14] },
  ND: { name: 'North Dakota', deadline: 'Reasonable time (case-by-case)', process: 'Send written notice with detailed evidence. Follow up on day 7 and day 14, then weekly.', followUpDays: [7, 14] },
  OH: { name: 'Ohio', deadline: 'Reasonable time (max 30 days in statute)', process: 'Send written notice with date and defects list. Follow up on day 7, day 14, and day 30.', followUpDays: [7, 14, 30] },
  OK: { name: 'Oklahoma', deadline: '14 days after written notice (except emergencies)', process: 'Send written notice and mark emergency risks clearly. Follow up on day 3 for emergencies and day 7/day14 for standard issues.', followUpDays: [3, 7, 14] },
  OR: { name: 'Oregon', deadline: '30 days for most issues (7 days for essential services)', process: 'Send written notice and clearly identify essential-service failures. Follow up on day 3/day7 for essential issues and day 14/day30 otherwise.', followUpDays: [3, 7, 14, 30] },
  PA: { name: 'Pennsylvania', deadline: 'Reasonable time (case-by-case)', process: 'Send written notice with detailed impact and photos. Follow up on day 3 and day 7, then weekly.', followUpDays: [3, 7, 14] },
  RI: { name: 'Rhode Island', deadline: '30 days after written notice', process: 'Send written notice with issue timeline and evidence. Follow up on day 14 and day 30.', followUpDays: [14, 30] },
  SC: { name: 'South Carolina', deadline: '14 days after written notice', process: 'Send written notice and request start/completion dates. Follow up on day 7 and day 14.', followUpDays: [7, 14] },
  SD: { name: 'South Dakota', deadline: 'Reasonable time (can be set by agreement)', process: 'Send written notice with a specific requested deadline. Follow up on day 3 and day 7, then weekly.', followUpDays: [3, 7, 14] },
  TN: { name: 'Tennessee', deadline: '14 days after written notice', process: 'Send written notice and ask for scheduling confirmation. Follow up on day 7 and day 14.', followUpDays: [7, 14] },
  TX: { name: 'Texas', deadline: 'Usually 7 days after proper notice (often requires tracked notice or a second notice)', process: 'Send written tracked notice, keep delivery proof, and send follow-up notice if needed. Follow up on day 7.', followUpDays: [3, 7, 14] },
  UT: { name: 'Utah', deadline: '1-10 days depending on issue type', process: 'Send written notice and classify issue urgency clearly. Follow up quickly based on issue type.', followUpDays: [1, 3, 10] },
  VT: { name: 'Vermont', deadline: 'Reasonable time (generally not more than 30 days)', process: 'Send written notice with photos and date discovered. Follow up on day 7, day 14, and day 30.', followUpDays: [7, 14, 30] },
  VA: { name: 'Virginia', deadline: '21 days for most issues (14 days for serious health/safety)', process: 'Send written notice and mark health/safety conditions clearly. Follow up on day 7, day 14, and day 21.', followUpDays: [7, 14, 21] },
  WA: { name: 'Washington', deadline: '1-10 days depending on issue type', process: 'Send written notice with exact defect type and urgency. Follow up on day 1/day3/day10 based on severity.', followUpDays: [1, 3, 10] },
  WV: { name: 'West Virginia', deadline: 'Reasonable time under circumstances', process: 'Send written notice with supporting photos and requested deadline. Follow up on day 3 and day 7, then weekly.', followUpDays: [3, 7, 14] },
  WI: { name: 'Wisconsin', deadline: 'Promptly after written notice', process: 'Send written notice and ask for immediate scheduling. Follow up on day 3 and day 7.', followUpDays: [3, 7, 14] },
  WY: { name: 'Wyoming', deadline: 'Reasonable time after notice (3 days after properly executed notice for suit pathway)', process: 'Send written notice and keep delivery proof. Follow up on day 3 and day 7.', followUpDays: [3, 7] },
};

const STATE_REPAIR_RULES = Object.fromEntries(
  Object.entries(RAW_STATE_REPAIR_RULES).map(([code, rule]) => [
    code,
    {
      verified: false,
      sources: [],
      ...rule,
    },
  ])
);

const STATE_OPTIONS = Object.entries(STATE_REPAIR_RULES).map(([code, rule]) => ({
  code,
  name: rule.name,
}));

const ADDRESS_STATE_REGEX = /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/i;

export function normalizeStateCode(input) {
  if (!input) return '';
  const upper = String(input).trim().toUpperCase();
  if (STATE_REPAIR_RULES[upper]) return upper;

  const byName = Object.entries(STATE_REPAIR_RULES).find(([, value]) => value.name.toUpperCase() === upper);
  return byName ? byName[0] : '';
}

export function inferStateCodeFromAddress(address) {
  if (!address) return '';
  const match = String(address).toUpperCase().match(ADDRESS_STATE_REGEX);
  return match ? match[1] : '';
}

export function getStateRepairRule(stateCode) {
  return STATE_REPAIR_RULES[normalizeStateCode(stateCode)] || null;
}

export function getStateTimelineForUrgency(stateCode, urgency = 'normal') {
  const rule = getStateRepairRule(stateCode);
  if (!rule || !rule.verified) return null;

  const deadline = rule.urgencyDeadlines?.[urgency] || rule.deadline;
  const followUpDays = rule.urgencyFollowUpDays?.[urgency] || rule.followUpDays || [];

  return {
    ...rule,
    deadline,
    followUpDays,
  };
}

export function getStateOptions() {
  return STATE_OPTIONS;
}

export default STATE_REPAIR_RULES;
