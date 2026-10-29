const CUISINES = [
  'North Indian', 'Punjabi', 'Gujarati', 'South Indian', 'Bengali',
  'Maharashtrian', 'Rajasthani', 'Hyderabadi', 'Goan',
  'Italian', 'Mexican', 'Chinese', 'Thai', 'Japanese', 'Mediterranean', 'Continental'
];

// Every cuisine below has real coverage across all four meal slots
// (Breakfast/Lunch/Dinner/Snack) so the diet planner never has to borrow
// dishes from a cuisine the person didn't pick. Cuisines outside India
// have extra variety per meal, as requested.
const foodDatabase = [
  // ---------------- North Indian ----------------
  { name: 'Moong dal chilla with mint chutney', meal: 'Breakfast', icon: '🥣', tags: ['veg', 'vegan'], cuisine: 'North Indian', calories: 320, protein: 18, carbs: 40, fat: 8 },
  { name: 'Vegetable stuffed paratha with curd', meal: 'Breakfast', icon: '🫓', tags: ['veg'], cuisine: 'North Indian', calories: 340, protein: 12, carbs: 46, fat: 11 },
  { name: 'Besan cheela with tomato chutney', meal: 'Breakfast', icon: '🥞', tags: ['veg', 'vegan'], cuisine: 'North Indian', calories: 300, protein: 16, carbs: 34, fat: 9 },
  { name: 'Rajma chawal', meal: 'Lunch', icon: '🍚', tags: ['veg', 'vegan'], cuisine: 'North Indian', calories: 480, protein: 16, carbs: 80, fat: 8 },
  { name: 'Dal, roti, sabzi & salad', meal: 'Lunch', icon: '🍛', tags: ['veg', 'vegan'], cuisine: 'North Indian', calories: 450, protein: 18, carbs: 65, fat: 10 },
  { name: 'Chana masala with jeera rice', meal: 'Lunch', icon: '🍛', tags: ['veg', 'vegan'], cuisine: 'North Indian', calories: 460, protein: 16, carbs: 72, fat: 10 },
  { name: 'Palak paneer with roti', meal: 'Dinner', icon: '🍛', tags: ['veg'], cuisine: 'North Indian', calories: 400, protein: 20, carbs: 35, fat: 18 },
  { name: 'Egg curry with roti', meal: 'Dinner', icon: '🍳', tags: ['egg'], cuisine: 'North Indian', calories: 420, protein: 22, carbs: 32, fat: 20 },
  { name: 'Chicken curry with roti (North Indian style)', meal: 'Dinner', icon: '🍗', tags: ['nonveg'], cuisine: 'North Indian', calories: 460, protein: 32, carbs: 30, fat: 20 },
  { name: 'Mixed vegetable curry with roti', meal: 'Dinner', icon: '🥘', tags: ['veg', 'vegan'], cuisine: 'North Indian', calories: 360, protein: 12, carbs: 48, fat: 12 },
  { name: 'Roasted makhana', meal: 'Snack', icon: '🍿', tags: ['veg', 'vegan'], cuisine: 'North Indian', calories: 130, protein: 4, carbs: 18, fat: 4 },
  { name: 'Sprouts chaat', meal: 'Snack', icon: '🥗', tags: ['veg', 'vegan'], cuisine: 'North Indian', calories: 150, protein: 9, carbs: 22, fat: 3 },
  { name: 'Buttermilk (chaas)', meal: 'Snack', icon: '🥛', tags: ['veg'], cuisine: 'North Indian', calories: 60, protein: 3, carbs: 5, fat: 2 },

  // ---------------- Punjabi ----------------
  { name: 'Paneer stuffed paratha', meal: 'Breakfast', icon: '🫓', tags: ['veg'], cuisine: 'Punjabi', calories: 350, protein: 14, carbs: 45, fat: 12 },
  { name: 'Chole bhature', meal: 'Breakfast', icon: '🍽️', tags: ['veg', 'vegan'], cuisine: 'Punjabi', calories: 420, protein: 14, carbs: 55, fat: 16 },
  { name: 'Amritsari kulcha with chole', meal: 'Breakfast', icon: '🫓', tags: ['veg'], cuisine: 'Punjabi', calories: 400, protein: 13, carbs: 52, fat: 14 },
  { name: 'Dal makhani with roti', meal: 'Lunch', icon: '🍛', tags: ['veg'], cuisine: 'Punjabi', calories: 480, protein: 18, carbs: 55, fat: 20 },
  { name: 'Sarson ka saag with makki roti', meal: 'Lunch', icon: '🥬', tags: ['veg'], cuisine: 'Punjabi', calories: 440, protein: 14, carbs: 50, fat: 18 },
  { name: 'Kadhi pakora with rice', meal: 'Lunch', icon: '🍛', tags: ['veg'], cuisine: 'Punjabi', calories: 420, protein: 12, carbs: 58, fat: 14 },
  { name: 'Punjabi chana masala (vegan) with rice', meal: 'Lunch', icon: '🍛', tags: ['veg', 'vegan'], cuisine: 'Punjabi', calories: 400, protein: 15, carbs: 60, fat: 10 },
  { name: 'Butter chicken with roti', meal: 'Dinner', icon: '🍗', tags: ['nonveg'], cuisine: 'Punjabi', calories: 520, protein: 34, carbs: 35, fat: 26 },
  { name: 'Tandoori chicken with salad', meal: 'Dinner', icon: '🍗', tags: ['nonveg'], cuisine: 'Punjabi', calories: 400, protein: 40, carbs: 8, fat: 20 },
  { name: 'Paneer bhurji with roti', meal: 'Dinner', icon: '🧀', tags: ['veg'], cuisine: 'Punjabi', calories: 420, protein: 22, carbs: 30, fat: 20 },
  { name: 'Punjabi mixed vegetable curry (no butter/cream) with roti', meal: 'Dinner', icon: '🥘', tags: ['veg', 'vegan'], cuisine: 'Punjabi', calories: 360, protein: 12, carbs: 46, fat: 11 },
  { name: 'Amritsari lassi', meal: 'Snack', icon: '🥛', tags: ['veg'], cuisine: 'Punjabi', calories: 220, protein: 7, carbs: 28, fat: 9 },
  { name: 'Punjabi samosa with mint chutney (occasional)', meal: 'Snack', icon: '🥟', tags: ['veg', 'vegan'], cuisine: 'Punjabi', calories: 260, protein: 5, carbs: 30, fat: 13 },
  { name: 'Roasted chana masala', meal: 'Snack', icon: '🥜', tags: ['veg', 'vegan'], cuisine: 'Punjabi', calories: 160, protein: 9, carbs: 24, fat: 4 },

  // ---------------- Gujarati ----------------
  { name: 'Khaman dhokla', meal: 'Breakfast', icon: '🟨', tags: ['veg', 'vegan'], cuisine: 'Gujarati', calories: 220, protein: 9, carbs: 32, fat: 6 },
  { name: 'Thepla with curd', meal: 'Breakfast', icon: '🫓', tags: ['veg'], cuisine: 'Gujarati', calories: 300, protein: 8, carbs: 40, fat: 12 },
  { name: 'Handvo', meal: 'Breakfast', icon: '🥘', tags: ['veg', 'vegan'], cuisine: 'Gujarati', calories: 280, protein: 10, carbs: 36, fat: 10 },
  { name: 'Gujarati thali (dal, kadhi, sabzi, roti, rice)', meal: 'Lunch', icon: '🍽️', tags: ['veg'], cuisine: 'Gujarati', calories: 520, protein: 18, carbs: 78, fat: 14 },
  { name: 'Undhiyu with puri', meal: 'Lunch', icon: '🍛', tags: ['veg', 'vegan'], cuisine: 'Gujarati', calories: 480, protein: 12, carbs: 60, fat: 20 },
  { name: 'Khichdi with kadhi', meal: 'Dinner', icon: '🍚', tags: ['veg'], cuisine: 'Gujarati', calories: 360, protein: 12, carbs: 55, fat: 9 },
  { name: 'Dal dhokli', meal: 'Dinner', icon: '🍲', tags: ['veg'], cuisine: 'Gujarati', calories: 380, protein: 14, carbs: 58, fat: 8 },
  { name: 'Gujarati mixed vegetable sabzi with rotla', meal: 'Dinner', icon: '🥘', tags: ['veg', 'vegan'], cuisine: 'Gujarati', calories: 340, protein: 11, carbs: 50, fat: 9 },
  { name: 'Fafda with jalebi (occasional treat)', meal: 'Snack', icon: '🥨', tags: ['veg', 'vegan'], cuisine: 'Gujarati', calories: 350, protein: 6, carbs: 45, fat: 16 },
  { name: 'Khakhra with chutney', meal: 'Snack', icon: '🫓', tags: ['veg', 'vegan'], cuisine: 'Gujarati', calories: 140, protein: 4, carbs: 20, fat: 4 },
  { name: 'Dhokla with green chutney', meal: 'Snack', icon: '🟨', tags: ['veg', 'vegan'], cuisine: 'Gujarati', calories: 180, protein: 7, carbs: 26, fat: 5 },

  // ---------------- South Indian ----------------
  { name: 'Idli sambar', meal: 'Breakfast', icon: '⚪', tags: ['veg', 'vegan'], cuisine: 'South Indian', calories: 260, protein: 9, carbs: 48, fat: 3 },
  { name: 'Masala dosa', meal: 'Breakfast', icon: '🥞', tags: ['veg'], cuisine: 'South Indian', calories: 340, protein: 8, carbs: 52, fat: 10 },
  { name: 'Upma with coconut chutney', meal: 'Breakfast', icon: '🥣', tags: ['veg', 'vegan'], cuisine: 'South Indian', calories: 270, protein: 7, carbs: 42, fat: 8 },
  { name: 'Curd rice with pickle', meal: 'Lunch', icon: '🍚', tags: ['veg'], cuisine: 'South Indian', calories: 380, protein: 10, carbs: 60, fat: 9 },
  { name: 'Sambar rice with papad', meal: 'Lunch', icon: '🍛', tags: ['veg', 'vegan'], cuisine: 'South Indian', calories: 440, protein: 13, carbs: 72, fat: 9 },
  { name: 'Chettinad chicken curry with rice', meal: 'Lunch', icon: '🍗', tags: ['nonveg'], cuisine: 'South Indian', calories: 520, protein: 34, carbs: 55, fat: 18 },
  { name: 'Fish curry with brown rice', meal: 'Dinner', icon: '🐟', tags: ['nonveg'], cuisine: 'South Indian', calories: 500, protein: 32, carbs: 55, fat: 14 },
  { name: 'Ragi dosa with chutney', meal: 'Dinner', icon: '🥞', tags: ['veg', 'vegan'], cuisine: 'South Indian', calories: 320, protein: 9, carbs: 48, fat: 8 },
  { name: 'Sundal (chana chaat)', meal: 'Snack', icon: '🥗', tags: ['veg', 'vegan'], cuisine: 'South Indian', calories: 160, protein: 8, carbs: 22, fat: 4 },
  { name: 'Banana chips (small portion)', meal: 'Snack', icon: '🍌', tags: ['veg', 'vegan'], cuisine: 'South Indian', calories: 150, protein: 1, carbs: 18, fat: 9 },
  { name: 'Murukku (small portion)', meal: 'Snack', icon: '🌀', tags: ['veg', 'vegan'], cuisine: 'South Indian', calories: 170, protein: 3, carbs: 20, fat: 9 },

  // ---------------- Bengali ----------------
  { name: 'Luchi with aloo dum', meal: 'Breakfast', icon: '🫓', tags: ['veg'], cuisine: 'Bengali', calories: 360, protein: 8, carbs: 48, fat: 16 },
  { name: 'Chirer pulao (flattened rice pulao)', meal: 'Breakfast', icon: '🍚', tags: ['veg', 'vegan'], cuisine: 'Bengali', calories: 300, protein: 7, carbs: 50, fat: 8 },
  { name: 'Cholar dal with rice', meal: 'Lunch', icon: '🍛', tags: ['veg', 'vegan'], cuisine: 'Bengali', calories: 420, protein: 16, carbs: 65, fat: 9 },
  { name: 'Machher jhol (fish curry) with rice', meal: 'Lunch', icon: '🐟', tags: ['nonveg'], cuisine: 'Bengali', calories: 480, protein: 30, carbs: 55, fat: 14 },
  { name: 'Shukto with rice', meal: 'Dinner', icon: '🍲', tags: ['veg', 'vegan'], cuisine: 'Bengali', calories: 320, protein: 9, carbs: 48, fat: 8 },
  { name: 'Chingri malai curry with rice', meal: 'Dinner', icon: '🍤', tags: ['nonveg'], cuisine: 'Bengali', calories: 460, protein: 28, carbs: 45, fat: 18 },
  { name: 'Jhalmuri', meal: 'Snack', icon: '🥗', tags: ['veg', 'vegan'], cuisine: 'Bengali', calories: 180, protein: 5, carbs: 30, fat: 5 },
  { name: 'Beguni (fried eggplant fritters, occasional)', meal: 'Snack', icon: '🍆', tags: ['veg', 'vegan'], cuisine: 'Bengali', calories: 220, protein: 4, carbs: 24, fat: 12 },

  // ---------------- Maharashtrian ----------------
  { name: 'Poha with sev', meal: 'Breakfast', icon: '🍚', tags: ['veg', 'vegan'], cuisine: 'Maharashtrian', calories: 260, protein: 6, carbs: 44, fat: 7 },
  { name: 'Misal pav', meal: 'Breakfast', icon: '🍲', tags: ['veg', 'vegan'], cuisine: 'Maharashtrian', calories: 400, protein: 15, carbs: 55, fat: 14 },
  { name: 'Puran poli with katachi amti', meal: 'Lunch', icon: '🫓', tags: ['veg'], cuisine: 'Maharashtrian', calories: 460, protein: 12, carbs: 70, fat: 14 },
  { name: 'Pithla bhakri', meal: 'Lunch', icon: '🍲', tags: ['veg', 'vegan'], cuisine: 'Maharashtrian', calories: 380, protein: 14, carbs: 52, fat: 12 },
  { name: 'Varan bhaat with bhaji', meal: 'Dinner', icon: '🍚', tags: ['veg', 'vegan'], cuisine: 'Maharashtrian', calories: 380, protein: 14, carbs: 58, fat: 9 },
  { name: 'Kolhapuri chicken with bhakri', meal: 'Dinner', icon: '🍗', tags: ['nonveg'], cuisine: 'Maharashtrian', calories: 480, protein: 32, carbs: 40, fat: 20 },
  { name: 'Sabudana khichdi', meal: 'Snack', icon: '🍚', tags: ['veg', 'vegan'], cuisine: 'Maharashtrian', calories: 260, protein: 5, carbs: 42, fat: 8 },
  { name: 'Kothimbir vadi', meal: 'Snack', icon: '🥗', tags: ['veg', 'vegan'], cuisine: 'Maharashtrian', calories: 200, protein: 7, carbs: 24, fat: 8 },

  // ---------------- Rajasthani ----------------
  { name: 'Bajre ki roti with chaas', meal: 'Breakfast', icon: '🫓', tags: ['veg'], cuisine: 'Rajasthani', calories: 280, protein: 8, carbs: 42, fat: 8 },
  { name: 'Moong dal pancake with chutney', meal: 'Breakfast', icon: '🥞', tags: ['veg', 'vegan'], cuisine: 'Rajasthani', calories: 300, protein: 14, carbs: 38, fat: 8 },
  { name: 'Dal baati churma', meal: 'Lunch', icon: '🍛', tags: ['veg'], cuisine: 'Rajasthani', calories: 550, protein: 16, carbs: 70, fat: 22 },
  { name: 'Gatte ki sabzi with rice', meal: 'Lunch', icon: '🍛', tags: ['veg'], cuisine: 'Rajasthani', calories: 440, protein: 15, carbs: 58, fat: 16 },
  { name: 'Vegan gatta pulao (curd-free)', meal: 'Lunch', icon: '🍚', tags: ['veg', 'vegan'], cuisine: 'Rajasthani', calories: 420, protein: 13, carbs: 62, fat: 12 },
  { name: 'Gatte ki sabzi with roti', meal: 'Dinner', icon: '🍲', tags: ['veg'], cuisine: 'Rajasthani', calories: 400, protein: 14, carbs: 52, fat: 14 },
  { name: 'Ker sangri with bajra roti', meal: 'Dinner', icon: '🫓', tags: ['veg', 'vegan'], cuisine: 'Rajasthani', calories: 340, protein: 10, carbs: 50, fat: 10 },
  { name: 'Roasted chana (Rajasthani masala)', meal: 'Snack', icon: '🥜', tags: ['veg', 'vegan'], cuisine: 'Rajasthani', calories: 170, protein: 9, carbs: 22, fat: 5 },
  { name: 'Pyaaz kachori (occasional treat)', meal: 'Snack', icon: '🥟', tags: ['veg', 'vegan'], cuisine: 'Rajasthani', calories: 280, protein: 5, carbs: 32, fat: 14 },

  // ---------------- Hyderabadi ----------------
  { name: 'Khagina (spiced scrambled eggs) with roti', meal: 'Breakfast', icon: '🍳', tags: ['egg'], cuisine: 'Hyderabadi', calories: 320, protein: 18, carbs: 30, fat: 14 },
  { name: 'Sheer khurma (small portion, occasional)', meal: 'Breakfast', icon: '🥣', tags: ['veg'], cuisine: 'Hyderabadi', calories: 260, protein: 6, carbs: 34, fat: 10 },
  { name: 'Vegetable upma, Hyderabadi style', meal: 'Breakfast', icon: '🥣', tags: ['veg', 'vegan'], cuisine: 'Hyderabadi', calories: 280, protein: 8, carbs: 44, fat: 8 },
  { name: 'Vegetable dum biryani', meal: 'Lunch', icon: '🍚', tags: ['veg'], cuisine: 'Hyderabadi', calories: 480, protein: 12, carbs: 70, fat: 16 },
  { name: 'Vegan tofu biryani (Hyderabadi spices)', meal: 'Lunch', icon: '🍚', tags: ['veg', 'vegan'], cuisine: 'Hyderabadi', calories: 460, protein: 16, carbs: 64, fat: 14 },
  { name: 'Chicken biryani', meal: 'Lunch', icon: '🍗', tags: ['nonveg'], cuisine: 'Hyderabadi', calories: 580, protein: 32, carbs: 65, fat: 20 },
  { name: 'Mirchi ka salan with roti', meal: 'Dinner', icon: '🌶️', tags: ['veg', 'vegan'], cuisine: 'Hyderabadi', calories: 340, protein: 8, carbs: 42, fat: 15 },
  { name: 'Hyderabadi chicken curry with roti', meal: 'Dinner', icon: '🍗', tags: ['nonveg'], cuisine: 'Hyderabadi', calories: 460, protein: 30, carbs: 35, fat: 20 },
  { name: 'Dahi vada', meal: 'Snack', icon: '🥗', tags: ['veg'], cuisine: 'Hyderabadi', calories: 220, protein: 8, carbs: 28, fat: 8 },
  { name: 'Roasted makhana with Hyderabadi masala', meal: 'Snack', icon: '🍿', tags: ['veg', 'vegan'], cuisine: 'Hyderabadi', calories: 140, protein: 4, carbs: 18, fat: 5 },

  // ---------------- Goan ----------------
  { name: 'Poee with vegetable stew', meal: 'Breakfast', icon: '🫓', tags: ['veg', 'vegan'], cuisine: 'Goan', calories: 300, protein: 8, carbs: 46, fat: 8 },
  { name: 'Goan-style egg drop curry with bread', meal: 'Breakfast', icon: '🍳', tags: ['egg'], cuisine: 'Goan', calories: 320, protein: 16, carbs: 32, fat: 14 },
  { name: 'Goan fish curry with rice', meal: 'Lunch', icon: '🐟', tags: ['nonveg'], cuisine: 'Goan', calories: 470, protein: 30, carbs: 50, fat: 16 },
  { name: 'Goan vegetable xacuti with rice', meal: 'Lunch', icon: '🍛', tags: ['veg', 'vegan'], cuisine: 'Goan', calories: 440, protein: 12, carbs: 62, fat: 16 },
  { name: 'Prawn balchao with rice', meal: 'Dinner', icon: '🍤', tags: ['nonveg'], cuisine: 'Goan', calories: 440, protein: 26, carbs: 42, fat: 18 },
  { name: 'Goan mushroom curry with rice', meal: 'Dinner', icon: '🍲', tags: ['veg', 'vegan'], cuisine: 'Goan', calories: 380, protein: 10, carbs: 55, fat: 12 },
  { name: 'Banana chips (Goan style)', meal: 'Snack', icon: '🍌', tags: ['veg', 'vegan'], cuisine: 'Goan', calories: 150, protein: 1, carbs: 18, fat: 9 },
  { name: 'Goan sausage (chorizo) pav, small portion', meal: 'Snack', icon: '🥖', tags: ['nonveg'], cuisine: 'Goan', calories: 260, protein: 12, carbs: 24, fat: 14 },

  // ---------------- Italian ----------------
  { name: 'Avocado bruschetta on whole-wheat toast', meal: 'Breakfast', icon: '🍞', tags: ['veg', 'vegan'], cuisine: 'Italian', calories: 280, protein: 8, carbs: 34, fat: 12 },
  { name: 'Italian veggie frittata', meal: 'Breakfast', icon: '🍳', tags: ['egg'], cuisine: 'Italian', calories: 300, protein: 20, carbs: 12, fat: 18 },
  { name: 'Ricotta & berry toast', meal: 'Breakfast', icon: '🍓', tags: ['veg'], cuisine: 'Italian', calories: 260, protein: 14, carbs: 32, fat: 8 },
  { name: 'Whole-wheat pasta arrabbiata', meal: 'Lunch', icon: '🍝', tags: ['veg', 'vegan'], cuisine: 'Italian', calories: 420, protein: 12, carbs: 68, fat: 10 },
  { name: 'Caprese salad with whole-wheat bread', meal: 'Lunch', icon: '🥗', tags: ['veg'], cuisine: 'Italian', calories: 380, protein: 16, carbs: 40, fat: 16 },
  { name: 'Minestrone soup with grilled chicken', meal: 'Lunch', icon: '🍲', tags: ['nonveg'], cuisine: 'Italian', calories: 400, protein: 28, carbs: 40, fat: 12 },
  { name: 'Grilled chicken with pesto pasta', meal: 'Dinner', icon: '🍝', tags: ['nonveg'], cuisine: 'Italian', calories: 520, protein: 34, carbs: 50, fat: 18 },
  { name: 'Margherita pizza (thin crust)', meal: 'Dinner', icon: '🍕', tags: ['veg'], cuisine: 'Italian', calories: 480, protein: 18, carbs: 55, fat: 18 },
  { name: 'Chicken piccata with sautéed veggies', meal: 'Dinner', icon: '🍗', tags: ['nonveg'], cuisine: 'Italian', calories: 440, protein: 36, carbs: 20, fat: 20 },
  { name: 'Vegan pasta primavera', meal: 'Dinner', icon: '🍝', tags: ['veg', 'vegan'], cuisine: 'Italian', calories: 420, protein: 13, carbs: 65, fat: 11 },
  { name: 'Minestrone soup', meal: 'Snack', icon: '🍲', tags: ['veg', 'vegan'], cuisine: 'Italian', calories: 180, protein: 6, carbs: 28, fat: 4 },
  { name: 'Bruschetta bites', meal: 'Snack', icon: '🍅', tags: ['veg', 'vegan'], cuisine: 'Italian', calories: 150, protein: 4, carbs: 22, fat: 5 },
  { name: 'Roasted chickpeas, Italian herbs', meal: 'Snack', icon: '🥜', tags: ['veg', 'vegan'], cuisine: 'Italian', calories: 170, protein: 8, carbs: 22, fat: 5 },

  // ---------------- Mexican ----------------
  { name: 'Huevos rancheros', meal: 'Breakfast', icon: '🍳', tags: ['egg'], cuisine: 'Mexican', calories: 320, protein: 18, carbs: 28, fat: 16 },
  { name: 'Breakfast burrito with beans & eggs', meal: 'Breakfast', icon: '🌯', tags: ['egg'], cuisine: 'Mexican', calories: 380, protein: 22, carbs: 36, fat: 16 },
  { name: 'Black bean & veggie breakfast bowl', meal: 'Breakfast', icon: '🥣', tags: ['veg', 'vegan'], cuisine: 'Mexican', calories: 300, protein: 14, carbs: 42, fat: 8 },
  { name: 'Bean & veggie burrito bowl', meal: 'Lunch', icon: '🌯', tags: ['veg', 'vegan'], cuisine: 'Mexican', calories: 460, protein: 16, carbs: 62, fat: 14 },
  { name: 'Chicken fajita bowl', meal: 'Lunch', icon: '🍗', tags: ['nonveg'], cuisine: 'Mexican', calories: 480, protein: 34, carbs: 45, fat: 16 },
  { name: 'Black bean quesadilla', meal: 'Lunch', icon: '🫓', tags: ['veg'], cuisine: 'Mexican', calories: 420, protein: 18, carbs: 48, fat: 16 },
  { name: 'Grilled chicken tacos', meal: 'Dinner', icon: '🌮', tags: ['nonveg'], cuisine: 'Mexican', calories: 420, protein: 30, carbs: 40, fat: 14 },
  { name: 'Veggie enchiladas', meal: 'Dinner', icon: '🌯', tags: ['veg'], cuisine: 'Mexican', calories: 440, protein: 16, carbs: 52, fat: 16 },
  { name: 'Grilled fish tacos with slaw', meal: 'Dinner', icon: '🌮', tags: ['nonveg'], cuisine: 'Mexican', calories: 400, protein: 28, carbs: 38, fat: 14 },
  { name: 'Vegan bean & veggie tacos', meal: 'Dinner', icon: '🌮', tags: ['veg', 'vegan'], cuisine: 'Mexican', calories: 380, protein: 14, carbs: 50, fat: 12 },
  { name: 'Guacamole with veggie sticks', meal: 'Snack', icon: '🥑', tags: ['veg', 'vegan'], cuisine: 'Mexican', calories: 190, protein: 3, carbs: 14, fat: 15 },
  { name: 'Salsa with baked tortilla chips', meal: 'Snack', icon: '🌶️', tags: ['veg', 'vegan'], cuisine: 'Mexican', calories: 160, protein: 3, carbs: 26, fat: 5 },

  // ---------------- Chinese ----------------
  { name: 'Vegetable congee', meal: 'Breakfast', icon: '🥣', tags: ['veg', 'vegan'], cuisine: 'Chinese', calories: 260, protein: 8, carbs: 46, fat: 4 },
  { name: 'Steamed veg momos with chili sauce', meal: 'Breakfast', icon: '🥟', tags: ['veg', 'vegan'], cuisine: 'Chinese', calories: 300, protein: 10, carbs: 40, fat: 9 },
  { name: 'Egg fried rice (light)', meal: 'Breakfast', icon: '🍳', tags: ['egg'], cuisine: 'Chinese', calories: 320, protein: 14, carbs: 42, fat: 10 },
  { name: 'Veg hakka noodles', meal: 'Lunch', icon: '🍜', tags: ['veg', 'vegan'], cuisine: 'Chinese', calories: 420, protein: 10, carbs: 68, fat: 12 },
  { name: 'Chicken fried rice', meal: 'Lunch', icon: '🍚', tags: ['nonveg'], cuisine: 'Chinese', calories: 480, protein: 28, carbs: 60, fat: 14 },
  { name: 'Schezwan tofu with veggies', meal: 'Lunch', icon: '🥢', tags: ['veg', 'vegan'], cuisine: 'Chinese', calories: 380, protein: 18, carbs: 35, fat: 16 },
  { name: 'Chicken stir fry with veggies', meal: 'Dinner', icon: '🍗', tags: ['nonveg'], cuisine: 'Chinese', calories: 400, protein: 32, carbs: 25, fat: 15 },
  { name: 'Tofu & vegetable stir fry', meal: 'Dinner', icon: '🥢', tags: ['veg', 'vegan'], cuisine: 'Chinese', calories: 340, protein: 20, carbs: 28, fat: 14 },
  { name: 'Steamed fish with ginger & scallion', meal: 'Dinner', icon: '🐟', tags: ['nonveg'], cuisine: 'Chinese', calories: 380, protein: 34, carbs: 15, fat: 16 },
  { name: 'Sweet corn soup', meal: 'Snack', icon: '🍲', tags: ['veg', 'vegan'], cuisine: 'Chinese', calories: 150, protein: 5, carbs: 24, fat: 3 },
  { name: 'Veg spring rolls (baked)', meal: 'Snack', icon: '🌯', tags: ['veg', 'vegan'], cuisine: 'Chinese', calories: 190, protein: 4, carbs: 26, fat: 8 },

  // ---------------- Thai ----------------
  { name: 'Thai rice porridge (jok) with egg', meal: 'Breakfast', icon: '🥣', tags: ['egg'], cuisine: 'Thai', calories: 280, protein: 14, carbs: 40, fat: 7 },
  { name: 'Coconut sticky rice with mango (small portion)', meal: 'Breakfast', icon: '🥭', tags: ['veg', 'vegan'], cuisine: 'Thai', calories: 300, protein: 4, carbs: 55, fat: 8 },
  { name: 'Thai green curry with rice (veg)', meal: 'Lunch', icon: '🍛', tags: ['veg', 'vegan'], cuisine: 'Thai', calories: 460, protein: 10, carbs: 60, fat: 18 },
  { name: 'Pad Thai with tofu', meal: 'Lunch', icon: '🍜', tags: ['veg', 'vegan'], cuisine: 'Thai', calories: 480, protein: 16, carbs: 62, fat: 16 },
  { name: 'Thai red curry with chicken', meal: 'Lunch', icon: '🍛', tags: ['nonveg'], cuisine: 'Thai', calories: 500, protein: 30, carbs: 45, fat: 22 },
  { name: 'Thai basil chicken', meal: 'Dinner', icon: '🍗', tags: ['nonveg'], cuisine: 'Thai', calories: 430, protein: 32, carbs: 30, fat: 18 },
  { name: 'Grilled lemongrass fish with veggies', meal: 'Dinner', icon: '🐟', tags: ['nonveg'], cuisine: 'Thai', calories: 400, protein: 32, carbs: 20, fat: 18 },
  { name: 'Thai vegetable & tofu green curry', meal: 'Dinner', icon: '🍛', tags: ['veg', 'vegan'], cuisine: 'Thai', calories: 400, protein: 16, carbs: 40, fat: 16 },
  { name: 'Tom yum soup', meal: 'Snack', icon: '🍲', tags: ['veg', 'nonveg'], cuisine: 'Thai', calories: 140, protein: 8, carbs: 12, fat: 6 },
  { name: "Thai papaya salad (som tum)", meal: 'Snack', icon: '🥗', tags: ['veg', 'vegan'], cuisine: 'Thai', calories: 150, protein: 4, carbs: 22, fat: 5 },

  // ---------------- Japanese ----------------
  { name: 'Tamagoyaki (rolled omelette) with rice', meal: 'Breakfast', icon: '🍳', tags: ['egg'], cuisine: 'Japanese', calories: 310, protein: 18, carbs: 34, fat: 10 },
  { name: 'Japanese-style oatmeal with miso & scallion', meal: 'Breakfast', icon: '🥣', tags: ['veg', 'vegan'], cuisine: 'Japanese', calories: 260, protein: 9, carbs: 40, fat: 6 },
  { name: 'Vegetable sushi rolls', meal: 'Lunch', icon: '🍣', tags: ['veg', 'vegan'], cuisine: 'Japanese', calories: 380, protein: 8, carbs: 65, fat: 6 },
  { name: 'Chicken teriyaki donburi', meal: 'Lunch', icon: '🍚', tags: ['nonveg'], cuisine: 'Japanese', calories: 500, protein: 32, carbs: 60, fat: 14 },
  { name: 'Soba noodle salad with edamame', meal: 'Lunch', icon: '🍜', tags: ['veg', 'vegan'], cuisine: 'Japanese', calories: 420, protein: 16, carbs: 60, fat: 10 },
  { name: 'Grilled salmon teriyaki with rice', meal: 'Dinner', icon: '🍣', tags: ['nonveg'], cuisine: 'Japanese', calories: 480, protein: 34, carbs: 48, fat: 16 },
  { name: 'Yakitori skewers with grilled veggies', meal: 'Dinner', icon: '🍢', tags: ['nonveg'], cuisine: 'Japanese', calories: 400, protein: 34, carbs: 20, fat: 18 },
  { name: 'Grilled tofu teriyaki with rice', meal: 'Dinner', icon: '🍱', tags: ['veg', 'vegan'], cuisine: 'Japanese', calories: 420, protein: 20, carbs: 55, fat: 12 },
  { name: 'Miso soup with tofu', meal: 'Snack', icon: '🍲', tags: ['veg', 'vegan'], cuisine: 'Japanese', calories: 100, protein: 7, carbs: 8, fat: 4 },
  { name: 'Edamame with sea salt', meal: 'Snack', icon: '🫛', tags: ['veg', 'vegan'], cuisine: 'Japanese', calories: 130, protein: 11, carbs: 10, fat: 5 },

  // ---------------- Mediterranean ----------------
  { name: 'Greek yogurt with honey & walnuts', meal: 'Breakfast', icon: '🍯', tags: ['veg'], cuisine: 'Mediterranean', calories: 300, protein: 18, carbs: 30, fat: 12 },
  { name: 'Shakshuka with whole-wheat pita', meal: 'Breakfast', icon: '🍳', tags: ['egg'], cuisine: 'Mediterranean', calories: 340, protein: 18, carbs: 32, fat: 16 },
  { name: 'Overnight oats with tahini & fruit', meal: 'Breakfast', icon: '🥣', tags: ['veg', 'vegan'], cuisine: 'Mediterranean', calories: 300, protein: 10, carbs: 45, fat: 10 },
  { name: 'Falafel with hummus & pita', meal: 'Lunch', icon: '🧆', tags: ['veg', 'vegan'], cuisine: 'Mediterranean', calories: 460, protein: 16, carbs: 55, fat: 18 },
  { name: 'Grilled chicken shawarma bowl', meal: 'Lunch', icon: '🍗', tags: ['nonveg'], cuisine: 'Mediterranean', calories: 480, protein: 36, carbs: 40, fat: 18 },
  { name: 'Tabbouleh with chickpeas', meal: 'Lunch', icon: '🥗', tags: ['veg', 'vegan'], cuisine: 'Mediterranean', calories: 380, protein: 14, carbs: 48, fat: 12 },
  { name: 'Grilled chicken Greek salad', meal: 'Dinner', icon: '🥗', tags: ['nonveg'], cuisine: 'Mediterranean', calories: 420, protein: 34, carbs: 20, fat: 22 },
  { name: 'Baked fish with lemon & herbs', meal: 'Dinner', icon: '🐟', tags: ['nonveg'], cuisine: 'Mediterranean', calories: 400, protein: 34, carbs: 15, fat: 18 },
  { name: 'Grilled vegetable & chickpea platter', meal: 'Dinner', icon: '🥗', tags: ['veg', 'vegan'], cuisine: 'Mediterranean', calories: 380, protein: 15, carbs: 45, fat: 14 },
  { name: 'Hummus with veggie sticks', meal: 'Snack', icon: '🥕', tags: ['veg', 'vegan'], cuisine: 'Mediterranean', calories: 180, protein: 6, carbs: 18, fat: 10 },
  { name: 'Olives & feta plate', meal: 'Snack', icon: '🫒', tags: ['veg'], cuisine: 'Mediterranean', calories: 190, protein: 7, carbs: 6, fat: 15 },

  // ---------------- Continental ----------------
  { name: '2 egg whites + spinach saute', meal: 'Breakfast', icon: '🍳', tags: ['egg'], cuisine: 'Continental', calories: 210, protein: 16, carbs: 4, fat: 10 },
  { name: 'Oats with fruits & seeds', meal: 'Breakfast', icon: '🥣', tags: ['veg', 'vegan'], cuisine: 'Continental', calories: 280, protein: 9, carbs: 52, fat: 5 },
  { name: 'Greek yogurt with berries', meal: 'Breakfast', icon: '🍓', tags: ['veg'], cuisine: 'Continental', calories: 220, protein: 15, carbs: 25, fat: 6 },
  { name: 'Boiled eggs with toast', meal: 'Breakfast', icon: '🍳', tags: ['egg'], cuisine: 'Continental', calories: 300, protein: 20, carbs: 25, fat: 12 },
  { name: 'Grilled paneer salad', meal: 'Lunch', icon: '🥗', tags: ['veg'], cuisine: 'Continental', calories: 400, protein: 24, carbs: 25, fat: 20 },
  { name: 'Grilled chicken with quinoa', meal: 'Lunch', icon: '🍗', tags: ['nonveg'], cuisine: 'Continental', calories: 520, protein: 38, carbs: 45, fat: 15 },
  { name: 'Chickpea salad bowl', meal: 'Lunch', icon: '🥗', tags: ['veg', 'vegan'], cuisine: 'Continental', calories: 380, protein: 16, carbs: 50, fat: 10 },
  { name: 'Vegetable soup with grilled tofu', meal: 'Dinner', icon: '🍲', tags: ['veg', 'vegan'], cuisine: 'Continental', calories: 320, protein: 20, carbs: 25, fat: 12 },
  { name: 'Grilled fish with sauteed veggies', meal: 'Dinner', icon: '🐟', tags: ['nonveg'], cuisine: 'Continental', calories: 420, protein: 35, carbs: 20, fat: 18 },
  { name: 'Roast chicken breast with steamed veggies', meal: 'Dinner', icon: '🍗', tags: ['nonveg'], cuisine: 'Continental', calories: 440, protein: 40, carbs: 18, fat: 18 },
  { name: 'Mixed nuts (small handful)', meal: 'Snack', icon: '🥜', tags: ['veg', 'vegan'], cuisine: 'Continental', calories: 170, protein: 5, carbs: 6, fat: 15 },
  { name: 'Fruit bowl', meal: 'Snack', icon: '🍎', tags: ['veg', 'vegan'], cuisine: 'Continental', calories: 100, protein: 1, carbs: 25, fat: 0 },
  { name: 'Boiled egg', meal: 'Snack', icon: '🥚', tags: ['egg'], cuisine: 'Continental', calories: 78, protein: 6, carbs: 1, fat: 5 }
];

const goalTargets = {
  'Weight loss': { calories: 1500, proteinPct: 0.3, carbPct: 0.4, fatPct: 0.3 },
  'Muscle gain': { calories: 2200, proteinPct: 0.3, carbPct: 0.45, fatPct: 0.25 },
  'General wellness': { calories: 1800, proteinPct: 0.25, carbPct: 0.45, fatPct: 0.3 },
  'PCOS support': { calories: 1700, proteinPct: 0.28, carbPct: 0.4, fatPct: 0.32 }
};

function matchesDiet(item, dietType) {
  if (dietType === 'Vegan') return item.tags.includes('vegan');
  if (dietType === 'Vegetarian') return item.tags.includes('veg') || item.tags.includes('vegan');
  if (dietType === 'Eggetarian') return item.tags.includes('veg') || item.tags.includes('vegan') || item.tags.includes('egg');
  return true; // Non-vegetarian: everything, including meat/fish
}

// Strict cuisine match - if the person picked cuisines, ONLY those
// cuisines are shown. No falling back to "everything" if a cuisine runs
// thin for a given meal - the food database above is built to have real
// coverage across all meals for every cuisine instead.
function matchesCuisine(item, cuisines) {
  if (!cuisines || cuisines.length === 0) return true;
  return cuisines.includes(item.cuisine);
}

function getGramTargets(goal) {
  const t = goalTargets[goal] || goalTargets['General wellness'];
  return {
    calories: t.calories,
    protein: Math.round((t.calories * t.proteinPct) / 4),
    carbs: Math.round((t.calories * t.carbPct) / 4),
    fat: Math.round((t.calories * t.fatPct) / 9)
  };
}

// Ranks dishes within a meal slot according to the person's health goal,
// so "based on health goal" actually changes which dishes come out on top
// - not just the calorie/macro targets shown alongside the plan.
function scoreForGoal(item, goal) {
  switch (goal) {
    case 'Weight loss':
      return item.protein * 1.5 - item.calories / 40; // filling, lower-calorie first
    case 'Muscle gain':
      return item.protein * 2 - item.fat * 0.2; // protein-forward
    case 'PCOS support':
      return item.protein * 1.3 - item.carbs * 0.25; // higher protein, lower carb load
    default:
      return item.protein - Math.abs(item.carbs - 45) * 0.05; // balanced, General wellness
  }
}

// Builds a 4-meal plan strictly within the chosen diet type + cuisines.
// Never borrows dishes from a cuisine the person didn't pick - if a
// combination genuinely has no matches, that meal slot comes back empty
// rather than silently mixing in something else.
function generatePlan(dietType, goal, cuisines = []) {
  const plan = {};
  ['Breakfast', 'Lunch', 'Dinner', 'Snack'].forEach((meal) => {
    const options = foodDatabase.filter((f) => f.meal === meal && matchesDiet(f, dietType) && matchesCuisine(f, cuisines));
    plan[meal] = [...options].sort((a, b) => scoreForGoal(b, goal) - scoreForGoal(a, goal)).slice(0, 4);
  });
  return { plan, targets: getGramTargets(goal) };
}

module.exports = { foodDatabase, goalTargets, CUISINES, matchesDiet, matchesCuisine, getGramTargets, generatePlan, scoreForGoal };
