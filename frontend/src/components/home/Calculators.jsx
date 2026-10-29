import { useState } from 'react';

function BmiCalc() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState(null);

  function calc() {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (!h || !w) return;
    const bmi = w / (h * h);
    let category = 'Normal';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi >= 25 && bmi < 30) category = 'Overweight';
    else if (bmi >= 30) category = 'Obese';
    setResult({ bmi: bmi.toFixed(1), category });
  }

  return (
    <div className="card calc-card">
      <h3>🧮 BMI Calculator</h3>
      <div className="field"><label>Height (cm)</label><input value={height} onChange={(e) => setHeight(e.target.value)} type="number" placeholder="165" /></div>
      <div className="field"><label>Weight (kg)</label><input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" placeholder="58" /></div>
      <button className="btn btn-primary btn-block" onClick={calc}>Calculate BMI</button>
      {result && <div className="calc-result">BMI: {result.bmi} — {result.category} <span className="muted" style={{ display: 'block', marginTop: 4 }}>Estimate only, not a diagnosis.</span></div>}
    </div>
  );
}

function WaterCalc() {
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('moderate');
  const [result, setResult] = useState(null);

  function calc() {
    const w = parseFloat(weight);
    if (!w) return;
    const base = w * 0.033; // litres
    const factor = activity === 'low' ? 1 : activity === 'moderate' ? 1.15 : 1.3;
    setResult((base * factor).toFixed(1));
  }

  return (
    <div className="card calc-card">
      <h3>💧 Daily Water Intake</h3>
      <div className="field"><label>Weight (kg)</label><input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" placeholder="58" /></div>
      <div className="field">
        <label>Activity level</label>
        <select value={activity} onChange={(e) => setActivity(e.target.value)}>
          <option value="low">Low</option>
          <option value="moderate">Moderate</option>
          <option value="high">High</option>
        </select>
      </div>
      <button className="btn btn-primary btn-block" onClick={calc}>Calculate Intake</button>
      {result && <div className="calc-result">≈ {result} litres / day <span className="muted" style={{ display: 'block', marginTop: 4 }}>Estimate only — adjust for climate and health conditions.</span></div>}
    </div>
  );
}

function CalorieCalc() {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('female');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('1.375');
  const [result, setResult] = useState(null);

  function calc() {
    const a = parseFloat(age), h = parseFloat(height), w = parseFloat(weight);
    if (!a || !h || !w) return;
    // Mifflin-St Jeor
    let bmr = 10 * w + 6.25 * h - 5 * a;
    bmr += gender === 'female' ? -161 : 5;
    setResult(Math.round(bmr * parseFloat(activity)));
  }

  return (
    <div className="card calc-card">
      <h3>🔥 Calorie Calculator</h3>
      <div className="grid2">
        <div className="field"><label>Age</label><input value={age} onChange={(e) => setAge(e.target.value)} type="number" placeholder="26" /></div>
        <div className="field">
          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>
      </div>
      <div className="grid2">
        <div className="field"><label>Height (cm)</label><input value={height} onChange={(e) => setHeight(e.target.value)} type="number" placeholder="165" /></div>
        <div className="field"><label>Weight (kg)</label><input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" placeholder="58" /></div>
      </div>
      <div className="field">
        <label>Activity level</label>
        <select value={activity} onChange={(e) => setActivity(e.target.value)}>
          <option value="1.2">Sedentary</option>
          <option value="1.375">Lightly active</option>
          <option value="1.55">Moderately active</option>
          <option value="1.725">Very active</option>
        </select>
      </div>
      <button className="btn btn-primary btn-block" onClick={calc}>Calculate Calories</button>
      {result && <div className="calc-result">≈ {result} kcal / day <span className="muted" style={{ display: 'block', marginTop: 4 }}>Estimate only, not medical advice.</span></div>}
    </div>
  );
}

export default function Calculators() {
  return (
    <section className="section" id="calculators">
      <div className="section-head">
        <div className="eyebrow">Free Tools</div>
        <h2 className="section-title">Free Health Calculators</h2>
        <p className="section-sub">No login needed. Quick estimates to help you understand your body better.</p>
      </div>
      <div className="calc-grid">
        <BmiCalc />
        <WaterCalc />
        <CalorieCalc />
      </div>
    </section>
  );
}
