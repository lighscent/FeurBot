function containsQuoi(content) {
  if (typeof content !== 'string') return false;
  const normalized = content.toLowerCase();
  return /(?<![a-z])(pour)?(q\s*u*\s*o+\s*i+|k\s*o+\s*i+|q\s*u*\s*a+|k\s*o+\s*a+|k\s*w+\s*a+|q\s*w+\s*a+)(?![a-z])/.test(normalized);
}

module.exports = { containsQuoi };
