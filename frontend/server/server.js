require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Supabase Setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ===============================
// 🔐 AUTH ROUTES
// ===============================

// Register
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "User registered", user: data.user });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Login successful", session: data.session });
});

// ===============================
// 🤖 AI RESPONSE
// ===============================

app.post('/ai-response', upload.single('image'), async (req, res) => {
  const { message, language } = req.body;

  let response;

  if (language === 'ne') {
    response = `तपाईंले भन्नुभयो: ${message}. म तपाईंलाई कृषि सम्बन्धि सहयोग गर्न तयार छु।`;
  } else {
    response = `You said: ${message}. I am ready to help you with agricultural support.`;
  }

  res.json({ reply: response });
});

// ===============================
// 👨‍🌾 GET EXPERTS
// ===============================

app.get('/experts', async (req, res) => {
  const { data, error } = await supabase
    .from('experts')
    .select('*');

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

// ===============================
// 📞 CONTACT EXPERT
// ===============================

app.post('/contact-expert', async (req, res) => {
  const { user_name, expert_id, message } = req.body;

  const { data, error } = await supabase
    .from('expert_messages')
    .insert([
      { user_name, expert_id, message }
    ]);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Message sent successfully" });
});

// ===============================

app.listen(5000, () => {
  console.log("🔥 Server running on http://localhost:5000");
});
