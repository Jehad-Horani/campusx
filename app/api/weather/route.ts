import { NextResponse } from 'next/server';

const ASU_LAT = 32.0403;
const ASU_LNG = 35.9014;

function describeWmoCode(code: number, isDay: boolean): { condition: string; advisory: string } {
  if (code === 0) {
    return {
      condition: isDay ? 'Clear & Sunny' : 'Clear Night',
      advisory: isDay
        ? 'Clear skies across Shafa Badran — great visibility for walking between ASU buildings.'
        : 'Clear evening sky over ASU Shafa Badran campus.',
    };
  }
  if (code === 1 || code === 2) {
    return {
      condition: isDay ? 'Partly Cloudy' : 'Partly Cloudy Night',
      advisory: 'Comfortable walking conditions across ASU campus walkways.',
    };
  }
  if (code === 3) {
    return {
      condition: 'Overcast',
      advisory: 'Cloudy sky over Shafa Badran — ideal temperatures for campus walks.',
    };
  }
  if (code === 45 || code === 48) {
    return {
      condition: 'Foggy / Misty',
      advisory: 'Reduced visibility around Shafa Badran hilltops; allow an extra minute between classes.',
    };
  }
  if (code >= 51 && code <= 57) {
    return {
      condition: 'Light Drizzle',
      advisory: 'Light drizzle reported near ASU — stick to covered paths between buildings.',
    };
  }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return {
      condition: code >= 65 || code === 82 ? 'Heavy Rain' : 'Rain Showers',
      advisory: 'Rain on ASU campus — carry an umbrella and allow +2 mins walking buffer.',
    };
  }
  if (code >= 71 && code <= 77) {
    return {
      condition: 'Snow / Sleet',
      advisory: 'Cold wintry precipitation in Shafa Badran — take extra care on outdoor stairs.',
    };
  }
  if (code >= 95) {
    return {
      condition: 'Thunderstorm',
      advisory: 'Stormy weather alert — stay inside college buildings until showers ease.',
    };
  }
  return {
    condition: 'Mild Campus Weather',
    advisory: 'Current conditions at ASU Shafa Badran campus.',
  };
}

export async function GET() {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${ASU_LAT}&longitude=${ASU_LNG}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day` +
      `&timezone=Asia%2FAmman`;

    const response = await fetch(url, {
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo returned ${response.status}`);
    }

    const data = await response.json();
    const cur = data?.current;

    if (!cur || typeof cur.temperature_2m !== 'number') {
      throw new Error('Malformed Open-Meteo response');
    }

    const wmoCode = typeof cur.weather_code === 'number' ? cur.weather_code : 0;
    const isDay = cur.is_day !== 0;
    const { condition, advisory } = describeWmoCode(wmoCode, isDay);

    return NextResponse.json({
      temperatureC: Math.round(cur.temperature_2m),
      feelsLikeC:
        typeof cur.apparent_temperature === 'number'
          ? Math.round(cur.apparent_temperature)
          : undefined,
      humidity:
        typeof cur.relative_humidity_2m === 'number'
          ? Math.round(cur.relative_humidity_2m)
          : undefined,
      windKmh:
        typeof cur.wind_speed_10m === 'number' ? Math.round(cur.wind_speed_10m) : undefined,
      weatherCode: wmoCode,
      isDay,
      condition,
      advisory,
      updatedAt: cur.time || new Date().toISOString(),
      isLive: true,
    });
  } catch (err) {
    console.warn('Live weather fetch failed:', err);
    return NextResponse.json(
      {
        temperatureC: 19,
        condition: 'ASU Campus Weather',
        advisory: 'Live weather telemetry temporarily unavailable — check connection.',
        updatedAt: new Date().toISOString(),
        isLive: false,
      },
      { status: 200 }
    );
  }
}
