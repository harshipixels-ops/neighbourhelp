// Safety middleware for emergency prevention and inappropriate content check

const EMERGENCY_KEYWORDS = [
  '911',
  'ambulance',
  'emergency room',
  'severe bleeding',
  'cardiac arrest',
  'heart attack',
  'unconscious',
  'choking',
  'stroke',
  'house fire',
  'firefighter',
  'active crime',
  'gunshot',
  'poisoning',
  'overdose',
  'suicide',
  'self harm',
  'kill myself',
  'life threatening'
];

function checkEmergencyContent(req, res, next) {
  const { title = '', description = '', additionalInstructions = '', message = '' } = req.body;
  const combined = `${title} ${description} ${additionalInstructions} ${message}`.toLowerCase();

  const matched = EMERGENCY_KEYWORDS.find(keyword => {
    // Word boundary or explicit match
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(combined);
  });

  if (matched) {
    return res.status(400).json({
      error: 'EMERGENCY_DETECTED',
      message: 'NeighbourHelp is strictly for everyday, non-emergency neighbourhood tasks. If you or someone else is in immediate danger or in need of medical, fire, or police assistance, please immediately contact your local emergency hotline (such as 911 / 112 / 999).'
    });
  }

  next;
  next();
}

module.exports = {
  checkEmergencyContent,
  EMERGENCY_KEYWORDS
};

