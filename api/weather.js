export default async function handler(request, response) {
  const city = request.query.city?.trim();
  const type = request.query.type === 'forecast' ? 'forecast' : 'weather';
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!city) {
    return response.status(400).json({ message: 'A city is required.' });
  }

  if (!apiKey) {
    return response.status(500).json({ message: 'Weather service is not configured.' });
  }

  try {
    const url = new URL(`https://api.openweathermap.org/data/2.5/${type}`);
    url.searchParams.set('q', city);
    url.searchParams.set('appid', apiKey);
    url.searchParams.set('units', 'metric');

    const weatherResponse = await fetch(url);
    const data = await weatherResponse.json();
    return response.status(weatherResponse.status).json(data);
  } catch {
    return response.status(502).json({ message: 'Weather service is unavailable.' });
  }
}