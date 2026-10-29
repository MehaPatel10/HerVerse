const COST_PER_MESSAGE = 1; // 1 token per Luna message, for every paid/free tier

// platinum = unlimited access, never deducts and never blocks.
function isUnlimited(user) {
  return user.tier === 'platinum';
}

function hasTokens(user) {
  return isUnlimited(user) || user.tokenBalance >= COST_PER_MESSAGE;
}

async function deductToken(user) {
  if (isUnlimited(user)) return user;
  user.tokenBalance = Math.max(0, user.tokenBalance - COST_PER_MESSAGE);
  await user.save();
  return user;
}

module.exports = { COST_PER_MESSAGE, isUnlimited, hasTokens, deductToken };
