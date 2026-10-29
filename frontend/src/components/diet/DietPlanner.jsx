import { useState, useEffect } from 'react';
import api from '../../api/axiosClient.js';

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const INDIAN_CUISINES = ['North Indian', 'Punjabi', 'Gujarati', 'South Indian', 'Bengali', 'Maharashtrian', 'Rajasthani', 'Hyderabadi', 'Goan'];
const GLOBAL_CUISINES = ['Italian', 'Mexican', 'Chinese', 'Thai', 'Japanese', 'Mediterranean', 'Continental'];

export default function DietPlanner() {
  const [dietType, setDietType] = useState('Vegetarian');
  const [goal, setGoal] = useState('General wellness');
  const [cuisines, setCuisines] = useState([]);
  const [plan, setPlan] = useState(null);
  const [targets, setTargets] = useState(null);
  const [activeTab, setActiveTab] = useState('Breakfast');
  const [foods, setFoods] = useState([]);
  const [logMeal, setLogMeal] = useState('Breakfast');
  const [selectedFood, setSelectedFood] = useState('');
  const [qty, setQty] = useState(1);
  const [todayLogs, setTodayLogs] = useState([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [error, setError] = useState('');

  function toggleCuisine(c) {
    setCuisines((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  async function loadPlan() {
    const { data } = await api.get('/diet/plan', { params: { dietType, goal, cuisines: cuisines.join(',') } });
    setPlan(data.plan);
    setTargets(data.targets);
  }
  async function loadFoods() {
    const { data } = await api.get('/diet/foods', { params: { dietType, cuisines: cuisines.join(',') } });
    setFoods(data);
    if (data.length > 0) setSelectedFood(data[0].name);
  }
  async function loadTodayLog() {
    const { data } = await api.get('/diet/log/today');
    setTodayLogs(data.logs);
    setTotals(data.totals);
  }

  useEffect(() => { loadPlan(); loadFoods(); loadTodayLog(); }, []);

  async function handleGenerate() {
    await loadPlan();
    await loadFoods();
  }

  async function handleAddLog() {
    const food = foods.find((f) => f.name === selectedFood);
    if (!food) { setError('Pick a food to log.'); return; }
    setError('');
    await api.post('/diet/log', { meal: logMeal, name: food.name, qty: Number(qty), calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat });
    setQty(1);
    await loadTodayLog();
  }

  async function handleDeleteLog(id) {
    await api.delete(`/diet/log/${id}`);
    await loadTodayLog();
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <h3>Your plan preferences</h3>
        <p className="muted" style={{ marginBottom: 14 }}>LUNA tailors suggestions to your diet type, goal, and favorite cuisines.</p>
        <div className="grid2">
          <div className="field">
            <label>Diet type</label>
            <select value={dietType} onChange={(e) => setDietType(e.target.value)}>
              <option>Vegetarian</option><option>Vegan</option><option>Eggetarian</option><option>Non-vegetarian</option>
            </select>
          </div>
          <div className="field">
            <label>Goal</label>
            <select value={goal} onChange={(e) => setGoal(e.target.value)}>
              <option>General wellness</option><option>Weight loss</option><option>Muscle gain</option><option>PCOS support</option>
            </select>
          </div>
        </div>

        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-soft)', marginBottom: 2 }}>Food cuisines (pick as many as you like)</label>
        <p className="muted" style={{ marginBottom: 4 }}>Leave blank for suggestions across all cuisines.</p>

        <div className="cuisine-group-label">Indian cuisines</div>
        <div className="chips">
          {INDIAN_CUISINES.map((c) => (
            <div key={c} className={`chip ${cuisines.includes(c) ? 'sel' : ''}`} onClick={() => toggleCuisine(c)}>{c}</div>
          ))}
        </div>

        <div className="cuisine-group-label">Cuisines outside India</div>
        <div className="chips" style={{ marginBottom: 18 }}>
          {GLOBAL_CUISINES.map((c) => (
            <div key={c} className={`chip ${cuisines.includes(c) ? 'sel' : ''}`} onClick={() => toggleCuisine(c)}>{c}</div>
          ))}
        </div>

        <button className="btn btn-primary" onClick={handleGenerate}>✨ Generate AI plan</button>
      </div>

      <div className="two-col">
        <div className="card">
          <h3>Today's AI diet plan</h3>
          <p className="muted" style={{ marginBottom: 14 }}>
            Tuned for {goal} · {dietType}{cuisines.length > 0 ? ` · ${cuisines.join(', ')}` : ''}
          </p>
          <div className="chips" style={{ marginBottom: 16 }}>
            {MEALS.map((m) => (
              <div key={m} className={`chip ${activeTab === m ? 'sel' : ''}`} onClick={() => setActiveTab(m)}>{m === 'Snack' ? 'Snacks' : m}</div>
            ))}
          </div>
          {plan && plan[activeTab]?.length === 0 && (
            <p className="muted" style={{ padding: '8px 0' }}>No {activeTab.toLowerCase()} options yet for this diet type + cuisine combo — try adding another cuisine.</p>
          )}
          {plan && plan[activeTab]?.map((f) => (
            <div key={f.name} className="list-row" style={{ alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{f.icon} {f.name}</div>
                <div className="muted">{f.cuisine} · {f.calories} kcal · {f.protein}g protein · {f.carbs}g carbs · {f.fat}g fat</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3>Today's nutrition</h3>
          {targets && (
            <>
              <p className="muted" style={{ marginBottom: 14 }}>{Math.round(totals.calories)} / {targets.calories} kcal</p>
              {['protein', 'carbs', 'fat'].map((macro) => (
                <div key={macro} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5, textTransform: 'capitalize' }}>
                    <span>{macro}</span><span>{Math.round(totals[macro])}g / {targets[macro]}g</span>
                  </div>
                  <div className="track-bar" style={{ margin: 0 }}>
                    <div className="track-fill" style={{ width: `${Math.min(100, Math.round((totals[macro] / targets[macro]) * 100))}%`, background: 'var(--rose-600)' }} />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h3>Log what you ate today</h3>
        <p className="muted" style={{ marginBottom: 16 }}>Add each meal or snack and we'll keep your nutrition totals updated.</p>
        <div className="grid2">
          <div className="field">
            <label>Meal</label>
            <select value={logMeal} onChange={(e) => setLogMeal(e.target.value)}>
              {MEALS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Food</label>
            <select value={selectedFood} onChange={(e) => setSelectedFood(e.target.value)}>
              {foods.map((f) => <option key={f.name} value={f.name}>{f.icon} {f.name} · {f.calories} kcal</option>)}
            </select>
          </div>
        </div>
        <div className="field" style={{ maxWidth: 150 }}>
          <label>Servings</label>
          <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} min="0.5" step="0.5" />
        </div>
        {error && <div className="error-text">{error}</div>}
        <button className="btn btn-primary" onClick={handleAddLog}>+ Add to log</button>

        <div style={{ marginTop: 20 }}>
          {todayLogs.map((l) => (
            <div key={l._id} className="list-row">
              <div>
                <div style={{ fontSize: 10.5, textTransform: 'uppercase', color: 'var(--rose-600)', fontWeight: 600 }}>{l.meal}</div>
                <div>{l.name}{l.qty !== 1 ? ` × ${l.qty}` : ''}</div>
                <div className="muted">{Math.round(l.calories)} kcal · {Math.round(l.protein)}g P · {Math.round(l.carbs)}g C · {Math.round(l.fat)}g F</div>
              </div>
              <button className="del-btn" onClick={() => handleDeleteLog(l._id)}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
