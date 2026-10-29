const careDirectory = [
  { name: 'Dr. Priya Nair', role: 'Gynaecologist', type: 'doctor', specialty: 'Gynaecologist', area: 'Navrangpura', pincode: '380009', distance: '2.1 km', rating: 4.9, reviews: 210, icon: '👩‍⚕️' },
  { name: 'Dr. Kavya Shah', role: 'Gynaecologist', type: 'doctor', specialty: 'Gynaecologist', area: 'Satellite', pincode: '380015', distance: '3.2 km', rating: 4.8, reviews: 176, icon: '👩‍⚕️' },
  { name: 'Dr. Meera Iyer', role: 'General Physician', type: 'doctor', specialty: 'General Physician', area: 'Paldi', pincode: '380007', distance: '1.5 km', rating: 4.8, reviews: 150, icon: '👩‍⚕️' },
  { name: 'Dr. Arvind Trivedi', role: 'General Physician', type: 'doctor', specialty: 'General Physician', area: 'Maninagar', pincode: '380008', distance: '2.9 km', rating: 4.6, reviews: 132, icon: '🧑‍⚕️' },
  { name: 'Dr. Rohan Kapoor', role: 'Orthopedician', type: 'doctor', specialty: 'Orthopedician', area: 'Naranpura', pincode: '380013', distance: '2.8 km', rating: 4.7, reviews: 98, icon: '🧑‍⚕️' },
  { name: 'Dr. Ayesha Khan', role: 'Dermatologist', type: 'doctor', specialty: 'Dermatologist', area: 'Vastrapur', pincode: '380015', distance: '3.0 km', rating: 4.6, reviews: 120, icon: '👩‍⚕️' },
  { name: 'Dr. Arjun Verma', role: 'Gastroenterologist', type: 'doctor', specialty: 'Gastroenterologist', area: 'Bodakdev', pincode: '380054', distance: '2.6 km', rating: 4.7, reviews: 134, icon: '🧑‍⚕️' },
  { name: 'Dr. Kabir Malhotra', role: 'ENT Specialist', type: 'doctor', specialty: 'ENT Specialist', area: 'Ellisbridge', pincode: '380006', distance: '3.3 km', rating: 4.6, reviews: 88, icon: '🧑‍⚕️' },
  { name: 'Dr. Sana Sheikh', role: 'Ophthalmologist', type: 'doctor', specialty: 'Ophthalmologist', area: 'CG Road', pincode: '380006', distance: '2.4 km', rating: 4.8, reviews: 102, icon: '👩‍⚕️' },
  { name: 'Dr. Vikram Rao', role: 'Pulmonologist', type: 'doctor', specialty: 'Pulmonologist', area: 'Shahibaug', pincode: '380004', distance: '4.0 km', rating: 4.7, reviews: 76, icon: '🧑‍⚕️' },
  { name: 'Dr. Kavita Desai', role: 'Urologist', type: 'doctor', specialty: 'Urologist', area: 'Thaltej', pincode: '380054', distance: '3.6 km', rating: 4.6, reviews: 91, icon: '👩‍⚕️' },
  { name: 'Dr. Ritu Malhotra', role: 'Dentist', type: 'doctor', specialty: 'Dentist', area: 'Vastrapur', pincode: '380015', distance: '1.8 km', rating: 4.8, reviews: 205, icon: '👩‍⚕️' },
  { name: 'Dr. Sameera Joshi', role: 'Endocrinologist', type: 'doctor', specialty: 'Endocrinologist', area: 'Ambawadi', pincode: '380006', distance: '3.9 km', rating: 4.7, reviews: 118, icon: '👩‍⚕️' },
  { name: 'Dr. Neha Bhatt', role: 'Psychologist / Counselor', type: 'doctor', specialty: 'Psychologist / Counselor', area: 'Prahladnagar', pincode: '380015', distance: '2.2 km', rating: 4.9, reviews: 143, icon: '👩‍⚕️' },
  { name: 'Dr. Harshad Patel', role: 'General Surgeon', type: 'doctor', specialty: 'General Surgeon', area: 'Ashram Road', pincode: '380009', distance: '2.0 km', rating: 4.7, reviews: 164, icon: '🧑‍⚕️' },
  { name: 'Dr. Falguni Mehta', role: 'General Surgeon', type: 'doctor', specialty: 'General Surgeon', area: 'Ghatlodia', pincode: '380061', distance: '3.5 km', rating: 4.6, reviews: 87, icon: '👩‍⚕️' },
  { name: 'Dr. Sameer Pandya', role: 'Cardiologist', type: 'doctor', specialty: 'Cardiologist', area: 'Shahibaug', pincode: '380004', distance: '3.1 km', rating: 4.8, reviews: 199, icon: '🧑‍⚕️' },
  { name: 'Dr. Ishaan Oza', role: 'Pediatrician', type: 'doctor', specialty: 'Pediatrician', area: 'Bopal', pincode: '380058', distance: '4.4 km', rating: 4.7, reviews: 121, icon: '🧑‍⚕️' },

  { name: 'Civil Hospital Asarwa', role: 'Government Multispecialty & Trauma Centre', type: 'hospital', specialty: 'Hospital', area: 'Asarwa', pincode: '380016', distance: '5.1 km', rating: 4.3, reviews: 1450, icon: '🏥' },
  { name: "Sunrise Women's Hospital", role: 'Multispecialty Hospital', type: 'hospital', specialty: 'Hospital', area: 'Shahibaug', pincode: '380004', distance: '3.4 km', rating: 4.6, reviews: 860, icon: '🏥' },
  { name: 'CityCare Multispecialty Hospital', role: 'General & Emergency', type: 'hospital', specialty: 'Hospital', area: 'Naranpura', pincode: '380013', distance: '4.2 km', rating: 4.5, reviews: 620, icon: '🏥' },
  { name: 'Sterling Hospital', role: 'Multispecialty & Emergency', type: 'hospital', specialty: 'Hospital', area: 'Gurukul, Memnagar', pincode: '380052', distance: '4.8 km', rating: 4.6, reviews: 980, icon: '🏥' },
  { name: 'Apollo Hospitals Ahmedabad', role: 'Multispecialty & Emergency', type: 'hospital', specialty: 'Hospital', area: 'Bhat, Gandhinagar Rd', pincode: '382428', distance: '9.5 km', rating: 4.7, reviews: 1120, icon: '🏥' },
  { name: 'Zydus Hospital', role: 'Multispecialty & Trauma Centre', type: 'hospital', specialty: 'Hospital', area: 'Thaltej', pincode: '380054', distance: '5.6 km', rating: 4.6, reviews: 745, icon: '🏥' },
  { name: 'CIMS Hospital', role: 'Multispecialty & Cardiac Emergency', type: 'hospital', specialty: 'Hospital', area: 'Science City Road', pincode: '380060', distance: '6.9 km', rating: 4.7, reviews: 690, icon: '🏥' },
  { name: 'Shalby Hospital', role: 'Multispecialty & Emergency', type: 'hospital', specialty: 'Hospital', area: 'S.G. Highway', pincode: '380015', distance: '5.3 km', rating: 4.5, reviews: 812, icon: '🏥' },
  { name: 'SAL Hospital', role: 'Multispecialty & Trauma Centre', type: 'hospital', specialty: 'Hospital', area: 'Drive-in Road, Thaltej', pincode: '380054', distance: '5.8 km', rating: 4.5, reviews: 560, icon: '🏥' }
];

const AHMEDABAD_PINCODES = [
  { area: 'Navrangpura', pincode: '380009' },
  { area: 'Ellisbridge / CG Road', pincode: '380006' },
  { area: 'Paldi', pincode: '380007' },
  { area: 'Maninagar', pincode: '380008' },
  { area: 'Naranpura', pincode: '380013' },
  { area: 'Ambawadi', pincode: '380006' },
  { area: 'Satellite', pincode: '380015' },
  { area: 'Vastrapur', pincode: '380015' },
  { area: 'Prahladnagar', pincode: '380015' },
  { area: 'Bodakdev', pincode: '380054' },
  { area: 'Thaltej', pincode: '380054' },
  { area: 'S.G. Highway', pincode: '380015' },
  { area: 'Memnagar / Gurukul', pincode: '380052' },
  { area: 'Ghatlodia', pincode: '380061' },
  { area: 'Sabarmati', pincode: '380019' },
  { area: 'Shahibaug', pincode: '380004' },
  { area: 'Asarwa', pincode: '380016' },
  { area: 'Ashram Road', pincode: '380009' },
  { area: 'Vejalpur', pincode: '380051' },
  { area: 'Isanpur', pincode: '380050' },
  { area: 'Ranip', pincode: '382480' },
  { area: 'Gota', pincode: '382481' },
  { area: 'Chandkheda', pincode: '382424' },
  { area: 'Nikol', pincode: '382350' },
  { area: 'Vastral', pincode: '382418' },
  { area: 'Bopal', pincode: '380058' },
  { area: 'South Bopal', pincode: '380058' },
  { area: 'Science City Road', pincode: '380060' },
  { area: 'Nirnay Nagar', pincode: '382481' },
  { area: 'Bapunagar', pincode: '380024' },
  { area: 'Odhav', pincode: '382415' },
  { area: 'Vatva', pincode: '382445' },
  { area: 'Jodhpur', pincode: '380015' },
  { area: 'Ranna Park / Ghatlodia', pincode: '380061' },
  { area: 'Chandlodia', pincode: '382481' },
  { area: 'Gandhinagar Highway / Bhat', pincode: '382428' },
  { area: 'Lal Darwaja / City Centre', pincode: '380001' },
  { area: 'Kalupur', pincode: '380002' },
  { area: 'Shahpur', pincode: '380001' },
  { area: 'Khadia', pincode: '380001' },
  { area: 'Dariapur', pincode: '380001' },
  { area: 'Raikhad', pincode: '380001' },
  { area: 'Jamalpur', pincode: '380022' },
  { area: 'Girdharnagar', pincode: '380004' },
  { area: 'Saraspur', pincode: '380018' },
  { area: 'Rakhial', pincode: '380023' },
  { area: 'Amraiwadi', pincode: '380026' },
  { area: 'Vatwa GIDC', pincode: '382445' },
  { area: 'Kankaria', pincode: '380022' },
  { area: 'Ghodasar', pincode: '380050' },
  { area: 'Vinzol', pincode: '382418' },
  { area: 'Hatkeshwar', pincode: '380026' },
  { area: 'Narol', pincode: '382405' },
  { area: 'Vatva Industrial Estate', pincode: '382440' },
  { area: 'Danilimda', pincode: '380022' },
  { area: 'Behrampura', pincode: '380022' },
  { area: 'Usmanpura', pincode: '380013' },
  { area: 'Ranip / New CG Road', pincode: '382480' },
  { area: 'Sabarmati Central Jail area', pincode: '380019' },
  { area: 'Chandranagar', pincode: '380013' },
  { area: 'Vasna', pincode: '380007' },
  { area: 'Paldi Ellisbridge', pincode: '380006' },
  { area: 'Juhapura', pincode: '380055' },
  { area: 'Sarkhej', pincode: '382210' },
  { area: 'Makarba', pincode: '380051' },
  { area: 'South Bopal / Ambli', pincode: '380058' },
  { area: 'Shela', pincode: '380058' },
  { area: 'Vaishnodevi Circle', pincode: '382421' },
  { area: 'Motera', pincode: '380005' },
  { area: 'Sabarmati Riverfront', pincode: '380019' },
  { area: 'New Ranip', pincode: '382480' },
  { area: 'Chandkheda Gam', pincode: '382424' },
  { area: 'Tragad', pincode: '382470' },
  { area: 'Adalaj Road', pincode: '382421' },
  { area: 'Airport Road / Hansol', pincode: '382475' },
  { area: 'Nava Naroda', pincode: '382346' },
  { area: 'Naroda', pincode: '382330' },
  { area: 'Naroda GIDC', pincode: '382330' },
  { area: 'Thakkarbapa Nagar', pincode: '382350' },
  { area: 'Krishnanagar', pincode: '382345' },
  { area: 'Vastral GIDC', pincode: '382418' },
  { area: 'Nava Vadaj', pincode: '380013' },
  { area: 'Old Vadaj', pincode: '380013' },
  { area: 'Sola', pincode: '380063' },
  { area: 'Science City', pincode: '380060' },
  { area: 'Vejalpur / Sarkhej Road', pincode: '380051' },
  { area: 'Judges Bungalow Road', pincode: '380015' },
  { area: 'Shilaj', pincode: '380059' },
  { area: 'Ghuma', pincode: '380058' }
];

// Set of every 6-digit PIN code covered above, for O(1) validation.
const AHMEDABAD_PINCODE_SET = new Set(AHMEDABAD_PINCODES.map((p) => p.pincode));

// Pulls the first 6-digit number that looks like an Indian PIN code out of
// free text (e.g. a LUNA chat message). Returns null if none is present.
function extractPincode(text) {
  const match = (text || '').match(/\b(\d{6})\b/);
  return match ? match[1] : null;
}

// True if the given 6-digit string is one of our known Ahmedabad PIN codes.
function isAhmedabadPincode(pincode) {
  return AHMEDABAD_PINCODE_SET.has(String(pincode || '').trim());
}

// Returns the locality name(s) for a known Ahmedabad PIN code, e.g.
// "Ranip" for 382480 - used so LUNA/the symptom checker can say
// "PIN 382480 is in the Ranip area" instead of just echoing the number back.
function areaForPincode(pincode) {
  const clean = String(pincode || '').trim();
  const match = AHMEDABAD_PINCODES.find((p) => p.pincode === clean);
  return match ? match.area : null;
}

// If the text contains a PIN code, returns a short note to append to a
// reply when that PIN code is NOT in Ahmedabad - otherwise returns ''.
function pincodeNoteFor(text) {
  const pin = extractPincode(text);
  if (!pin) return '';
  if (isAhmedabadPincode(pin)) return '';
  return `\n\n(Note: ${pin} doesn't match any Ahmedabad PIN code we have on file - doctor and hospital recommendations here currently only cover Ahmedabad. If you're elsewhere, please use a local directory or emergency number for nearby care.)`;
}

function findCareFor(specialists = [], severity = 'mild') {
  let pool = careDirectory.filter((c) => specialists.includes(c.specialty));

  if (severity === 'severe') {
    pool = pool.concat(careDirectory.filter((c) => c.type === 'hospital'));
  }

  const seen = new Set();
  pool = pool.filter((c) => !seen.has(c.name) && seen.add(c.name));

  if (pool.length === 0) {
    pool = careDirectory.filter((c) => c.specialty === 'General Physician');
  }
  if (pool.length === 0) {
    pool = careDirectory.slice(0, 4);
  }

  pool.sort((a, b) => b.rating - a.rating);
  return pool.slice(0, 4);
}

module.exports = { careDirectory, findCareFor, AHMEDABAD_PINCODES, isAhmedabadPincode, areaForPincode, extractPincode, pincodeNoteFor };
