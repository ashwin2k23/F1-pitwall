// Utility to match driver names from various APIs (Ergast) to official Formula 1 driver headshots.

export const DRIVER_IMAGES = {
  "lando norris": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/2024-08-25_Motorsport%2C_Formel_1%2C_Gro%C3%9Fer_Preis_der_Niederlande_2024_STP_3968_by_Stepro_%28cropped2%29.jpg/500px-2024-08-25_Motorsport%2C_Formel_1%2C_Gro%C3%9Fer_Preis_der_Niederlande_2024_STP_3968_by_Stepro_%28cropped2%29.jpg",
  "oscar piastri": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/2026_Chinese_GP_-_Oscar_Piastri_%28cropped%29_%28cropped%29.jpg/500px-2026_Chinese_GP_-_Oscar_Piastri_%28cropped%29_%28cropped%29.jpg",
  "charles leclerc": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/2024-08-25_Motorsport%2C_Formel_1%2C_Gro%C3%9Fer_Preis_der_Niederlande_2024_STP_3978_by_Stepro_%28cropped2%29.jpg/500px-2024-08-25_Motorsport%2C_Formel_1%2C_Gro%C3%9Fer_Preis_der_Niederlande_2024_STP_3978_by_Stepro_%28cropped2%29.jpg",
  "lewis hamilton": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Prime_Minister_Keir_Starmer_meets_Sir_Lewis_Hamilton_%2854566928382%29_%28cropped%29.jpg/500px-Prime_Minister_Keir_Starmer_meets_Sir_Lewis_Hamilton_%2854566928382%29_%28cropped%29.jpg",
  "max verstappen": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/2024-08-25_Motorsport%2C_Formel_1%2C_Gro%C3%9Fer_Preis_der_Niederlande_2024_STP_3973_by_Stepro_%28medium_crop%29.jpg/500px-2024-08-25_Motorsport%2C_Formel_1%2C_Gro%C3%9Fer_Preis_der_Niederlande_2024_STP_3973_by_Stepro_%28medium_crop%29.jpg",
  "carlos sainz": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Formula1Gabelhofen2022_%2804%29_%28cropped2%29.jpg/500px-Formula1Gabelhofen2022_%2804%29_%28cropped2%29.jpg",
  "george russell": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/KingsLeonSilverstne040724_%2828_of_112%29_%2853838006028%29_%28cropped%29.jpg/500px-KingsLeonSilverstne040724_%2828_of_112%29_%2853838006028%29_%28cropped%29.jpg",
  "fernando alonso": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Alonso-68_%2824710447098%29.jpg/500px-Alonso-68_%2824710447098%29.jpg",
  "sergio perez": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/2021_US_GP_driver_parade_%28cropped2%29.jpg/500px-2021_US_GP_driver_parade_%28cropped2%29.jpg",
  "lance stroll": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2025_Japan_GP_-_Aston_Martin_-_Lance_Stroll_-_Fanzone_Stage_%28cropped%29.jpg/500px-2025_Japan_GP_-_Aston_Martin_-_Lance_Stroll_-_Fanzone_Stage_%28cropped%29.jpg",
  "pierre gasly": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/2022_French_Grand_Prix_%2852279065728%29_%28midcrop%29.png/500px-2022_French_Grand_Prix_%2852279065728%29_%28midcrop%29.png",
  "esteban ocon": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Esteban_Ocon_2024_Suzuka_%28cropped%29.jpg/500px-Esteban_Ocon_2024_Suzuka_%28cropped%29.jpg",
  "alex albon": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Alex_Albon_at_the_Melbourne_Walk_during_the_2026_Australian_Grand_Prix_%28028A8626%29_%28cropped%29.jpg/500px-Alex_Albon_at_the_Melbourne_Walk_during_the_2026_Australian_Grand_Prix_%28028A8626%29_%28cropped%29.jpg",
  "alexander albon": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Alex_Albon_at_the_Melbourne_Walk_during_the_2026_Australian_Grand_Prix_%28028A8626%29_%28cropped%29.jpg/500px-Alex_Albon_at_the_Melbourne_Walk_during_the_2026_Australian_Grand_Prix_%28028A8626%29_%28cropped%29.jpg",
  "yuki tsunoda": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Yuki_Tsunoda_at_the_Melbourne_Walk_during_the_2026_Australian_Grand_Prix_%28028A8096%29.jpg/500px-Yuki_Tsunoda_at_the_Melbourne_Walk_during_the_2026_Australian_Grand_Prix_%28028A8096%29.jpg",
  "nico hulkenberg": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/2019_Formula_One_tests_Barcelona%2C_Hulkenberg_%2840287128313%29.jpg/500px-2019_Formula_One_tests_Barcelona%2C_Hulkenberg_%2840287128313%29.jpg",
  "kevin magnussen": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Kevin_Magnussen%2C_2019_Formula_One_Tests_Barcelona_%28cropped%29.jpg/500px-Kevin_Magnussen%2C_2019_Formula_One_Tests_Barcelona_%28cropped%29.jpg",
  "valtteri bottas": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Valtteri_Bottas_at_the_2026_Adelaide_Motorsport_Festival_%28028A7567%29.jpg/500px-Valtteri_Bottas_at_the_2026_Adelaide_Motorsport_Festival_%28028A7567%29.jpg",
  "zhou guanyu": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Zhou_Guanyu_at_the_Melbourne_Walk_during_the_2026_Australian_Grand_Prix_%28028A7999%29.jpg/500px-Zhou_Guanyu_at_the_Melbourne_Walk_during_the_2026_Australian_Grand_Prix_%28028A7999%29.jpg",
  "guanyu zhou": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Zhou_Guanyu_at_the_Melbourne_Walk_during_the_2026_Australian_Grand_Prix_%28028A7999%29.jpg/500px-Zhou_Guanyu_at_the_Melbourne_Walk_during_the_2026_Australian_Grand_Prix_%28028A7999%29.jpg",
  "andrea kimi antonelli": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Kimi_Antonelli_at_the_2025_US_Grand_Prix_in_Austin%2C_TX_%28cropped%29.jpg/500px-Kimi_Antonelli_at_the_2025_US_Grand_Prix_in_Austin%2C_TX_%28cropped%29.jpg",
  "oliver bearman": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2025_Japan_GP_-_Haas_-_Oliver_Bearman_-_Thursday_%28cropped%29.jpg/500px-2025_Japan_GP_-_Haas_-_Oliver_Bearman_-_Thursday_%28cropped%29.jpg",
  "franco colapinto": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Franco_Colapinto_at_the_Melbourne_Walk_during_the_2026_Australian_Grand_Prix_%28028A8704%29_%28cropped%29.jpg/500px-Franco_Colapinto_at_the_Melbourne_Walk_during_the_2026_Australian_Grand_Prix_%28028A8704%29_%28cropped%29.jpg",
  "liam lawson": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Liam_Lawson_at_the_Red_Bull_Fan_Zone_%E2%80%93_Crown_Riverwalk%2C_Melbourne_%28028A7793%29.jpg/500px-Liam_Lawson_at_the_Red_Bull_Fan_Zone_%E2%80%93_Crown_Riverwalk%2C_Melbourne_%28028A7793%29.jpg",
  "jack doohan": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Jack_Doohan_2023.jpg/500px-Jack_Doohan_2023.jpg",
  "gabriel bortoleto": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Gabriel_Bortoleto_%28cropped%29.jpg/500px-Gabriel_Bortoleto_%28cropped%29.jpg",
  "isack hadjar": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Isack_Hadjar_at_the_Melbourne_Walk_during_the_2026_Australian_Grand_Prix_%28028A8753%29_%28cropped%29.jpg/500px-Isack_Hadjar_at_the_Melbourne_Walk_during_the_2026_Australian_Grand_Prix_%28028A8753%29_%28cropped%29.jpg",
  "daniel ricciardo": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Daniel_Ricciardo_at_the_2026_Adelaide_Motorsport_Festival_%28028A7761%29_%28cropped%29.jpg/500px-Daniel_Ricciardo_at_the_2026_Adelaide_Motorsport_Festival_%28028A7761%29_%28cropped%29.jpg"
};

// Fallback image if driver is not found
const FALLBACK_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/2024-08-25_Motorsport%2C_Formel_1%2C_Gro%C3%9Fer_Preis_der_Niederlande_2024_STP_3973_by_Stepro_%28medium_crop%29.jpg/500px-2024-08-25_Motorsport%2C_Formel_1%2C_Gro%C3%9Fer_Preis_der_Niederlande_2024_STP_3973_by_Stepro_%28medium_crop%29.jpg';

export const getDriverImage = (driverName) => {
  if (!driverName) return FALLBACK_IMAGE;
  
  // Normalize string: Remove accents/diacritics and convert to lowercase
  // e.g., "Sergio Pérez" -> "sergio perez"
  const normalizedName = driverName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  // Try direct match
  if (DRIVER_IMAGES[normalizedName]) {
    return DRIVER_IMAGES[normalizedName];
  }

  // Handle special cases (e.g. Ergast might return "Alexander Albon" but name is "Alex Albon")
  for (const [key, value] of Object.entries(DRIVER_IMAGES)) {
    if (normalizedName.includes(key.split(' ')[1])) {
       // Matched by last name
       return value;
    }
  }

  return FALLBACK_IMAGE;
};
