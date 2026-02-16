# 🌤️ Modern Weather App Boilerplate

A stunning, premium weather application built with React and Vite. This template features a glassmorphism design, smooth animations, and a responsive layout.

## 🚀 Features
- **Glassmorphism UI**: Beautiful frosted glass effects with clean typography.
- **Lucide Icons**: Premium vector icons for weather states and stats.
- **Animated Background**: Dynamic gradients and smooth entry animations.
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop.
- **Simulated API**: Ready to go with mock data, easily connectable to real services.

## 🛠️ Tech Stack
- **React 19**
- **Vite**
- **Lucide React** (Icons)
- **Vanilla CSS** (Next-gen styling)

## 🚦 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open the browser**:
   Navigate to `http://localhost:5173`

## 🔌 Connecting a Real API

To fetch real-time data, you can use the [OpenWeatherMap API](https://openweathermap.org/api):

1. Get an API key from OpenWeatherMap.
2. Update the `handleSearch` function in `src/App.jsx`:

```javascript
const handleSearch = async (e) => {
  e.preventDefault();
  if (!city.trim()) return;

  setLoading(true);
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=YOUR_API_KEY`
    );
    const data = await response.json();
    if (data.cod !== 200) throw new Error(data.message);
    setWeatherData(data);
    setError(null);
  } catch (err) {
    setError(err.message);
    setWeatherData(null);
  } finally {
    setLoading(false);
  }
};
```

## 🎨 Customization
- **Colors**: Adjust the CSS variables and gradients in `index.css`.
- **Icons**: Explore more icons at [lucide.dev](https://lucide.dev).
- **Fonts**: The app uses the 'Outfit' font from Google Fonts.
