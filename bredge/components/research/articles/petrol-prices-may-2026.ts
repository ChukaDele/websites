import type { Article } from "../types";

export const article: Article = {
  slug: "petrol-prices-may-2026",
  series: "PMS Price Watch",
  issue: "Data Brief No. 031",
  published: "2026-08-29",
  period: "May 2026",
  title: "Petrol at ₦1,596 a litre: the ₦253 gap that matters more than region",
  dek:
    "Nigeria's average pump price rose 55.31% in a year to ₦1,596.25 a litre in May 2026. For businesses, the bigger planning question is which state you buy in, not which zone.",
  readingMinutes: 7,
  hero: {
    value: "₦1,596.25",
    label: "National average petrol (PMS) price per litre, May 2026",
  },
  takeaways: [
    "Petrol averaged ₦1,596.25 a litre nationally in May 2026, up 55.31% on May 2025 (₦1,027.76) and 4.13% on April 2026 (₦1,532.93).",
    "Edo was the most expensive state at ₦1,722.91 a litre and Adamawa the cheapest at ₦1,469.83, a spread of ₦253.08.",
    "The five dearest states all priced above ₦1,660 and the five cheapest all below ₦1,535: a split, not a smooth slope.",
    "The six geopolitical zones sat only ₦59.73 apart, so state-level factors, not regions, explain most of the variation.",
  ],
  sections: [
    {
      id: "the-fill-up",
      heading: "A tank that costs ₦28,424.50 more",
      body: [
        "Fill a 50-litre tank at Nigeria's national average pump price in May 2026 and the bill comes to ₦79,812.50. Twelve months earlier the same tank cost ₦51,388. That ₦28,424.50 difference, on a single fill-up, is the past year in one transaction.",
        "The National Bureau of Statistics puts the average price of Premium Motor Spirit, or petrol, at ₦1,596.25 a litre in May 2026. That is 55.31% above May 2025, when a litre averaged ₦1,027.76, or ₦568.49 more on every litre.",
        "The move did not stop in the spring. Between April and May 2026 the average climbed another 4.13%, from ₦1,532.93 to ₦1,596.25, adding ₦63.32 a litre in a single month. Most of the annual rise was already in place by April, but the direction of travel in the latest month was still up.",
        "For a business, the useful unit is not the tank but the thousand litres. At May's average, every 1,000 litres of petrol costs ₦1,596,250, against ₦1,027,760 a year earlier. A fleet, a generator bank or a last-mile delivery operation that burns the same volume as last year is paying ₦568,490 more for each thousand litres it buys.",
      ],
      exhibit: {
        title: "The national average petrol price has risen by more than half in a year",
        kind: "bars",
        unit: "₦/litre",
        points: [
          ["May 2025", 1027.76],
          ["Apr 2026", 1532.93],
          ["May 2026", 1596.25],
        ],
        highlight: "May 2026",
        note: "Source: National Bureau of Statistics, NGA-NBS-PMS May2026. National average price per litre.",
      },
      pull: "A business burning the same fuel as last year is paying ₦568,490 more for every thousand litres.",
    },
    {
      id: "state-split",
      heading: "The state map is a split, not a slope",
      body: [
        "The national average hides a wide range. Edo posted the highest price in May at ₦1,722.91 a litre. Adamawa posted the lowest at ₦1,469.83. The gap between them is ₦253.08 a litre, which makes Edo petrol roughly 17% dearer than Adamawa petrol.",
        "The two ends sit almost symmetrically around the middle. Edo is ₦126.66 above the national average and Adamawa ₦126.42 below it.",
        "What stands out is the shape. The five most expensive states, Edo, Bauchi (₦1,715.47), Benue (₦1,698.57), Gombe (₦1,686.37) and Delta (₦1,667.68), all priced above ₦1,660. The five cheapest, Kogi (₦1,534.32), Anambra (₦1,519.72), Sokoto (₦1,489.33), Katsina (₦1,470.63) and Adamawa, all sat below ₦1,535. The brief describes this as a clear split rather than a smooth spread.",
        "On a 50-litre fill-up, the Edo to Adamawa gap is worth ₦12,654. On 1,000 litres it is ₦253,080. For an operator running vehicles or generators in several states, that is a cost difference driven purely by where the fuel is bought.",
        "The middle of the chart is just as telling. Among the states shown, the cheapest of the top five, Delta, still sat ₦133.36 a litre above the dearest of the bottom five, Kogi. There is no gentle gradient from one end to the other. States fall into a high-price group and a low-price group, with the national average running between them.",
      ],
      exhibit: {
        title: "Five states price above ₦1,660 a litre, five below ₦1,535",
        kind: "hbars",
        unit: "₦/litre",
        points: [
          ["Edo", 1722.91],
          ["Bauchi", 1715.47],
          ["Benue", 1698.57],
          ["Gombe", 1686.37],
          ["Delta", 1667.68],
          ["Kogi", 1534.32],
          ["Anambra", 1519.72],
          ["Sokoto", 1489.33],
          ["Katsina", 1470.63],
          ["Adamawa", 1469.83],
        ],
        highlight: "Edo",
        note: "Source: National Bureau of Statistics, NGA-NBS-PMS May2026. Selected states spanning the full range; national average ₦1,596.25.",
      },
      pull: "Edo petrol cost ₦253.08 a litre more than Adamawa petrol in the same month.",
    },
    {
      id: "zones-cluster",
      heading: "Zones barely move the needle",
      body: [
        "Step back to Nigeria's six geopolitical zones and the picture flattens. The South South had the highest zonal average at ₦1,623.84 a litre. The North West had the lowest at ₦1,564.11. The gap is just ₦59.73.",
        "The other four zones bunch in between: the North East at ₦1,622.76, the South East at ₦1,593.91, North Central at ₦1,589.92 and the South West at ₦1,588.96. Even the extremes sit close to the national average, with the South South ₦27.59 above it and the North West ₦32.14 below.",
        "Put the two spreads side by side and the conclusion is plain. The gap between the dearest and cheapest state is more than four times the gap between the dearest and cheapest zone. The brief's reading is that price differences are driven more by specific states than by broad regional patterns.",
        "The state list makes the same point from another angle. Bauchi and Gombe, two of the five most expensive states, share the North East with Adamawa, the cheapest. Bauchi petrol cost ₦245.64 a litre more than Adamawa petrol in the same zone. Benue and Kogi, both North Central, sat ₦164.25 apart. A zone label tells a planner very little about what fuel will cost in a given state.",
      ],
      exhibit: {
        title: "The six zones sit within ₦59.73 of each other",
        kind: "hbars",
        unit: "₦/litre",
        points: [
          ["South South", 1623.84],
          ["North East", 1622.76],
          ["South East", 1593.91],
          ["North Central", 1589.92],
          ["South West", 1588.96],
          ["North West", 1564.11],
        ],
        highlight: "South South",
        note: "Source: National Bureau of Statistics, NGA-NBS-PMS May2026. Zonal average price per litre; national average ₦1,596.25.",
      },
      pull: "The state spread is more than four times the zone gap.",
    },
    {
      id: "what-the-data-says",
      heading: "What the data does and does not tell us",
      body: [
        "The NBS figures are prices, not explanations. They show where petrol was dearer or cheaper in May 2026 and how the national average has moved. They do not say why Edo priced higher than Adamawa, or why the national average kept rising between April and May. Anyone attributing the pattern to a single cause is going beyond what this release supports.",
        "The data also covers a point in time. The state ranking is for one month, and the brief shows the extremes rather than every state. A business planning around a specific location should check that state's own figure, and watch whether it holds from month to month, before treating it as structural.",
        "What the data does establish is enough to act on. Petrol is materially more expensive than a year ago, the latest month moved higher again, and the variation that matters for planning sits at state level.",
        "That last point changes how fuel risk should be read. A national number is the right tool for judging the overall cost shock. It is the wrong tool for judging any one site, route or customer, because the same national average sits between a state ₦126.66 above it and one ₦126.42 below it.",
      ],
      exhibit: {
        title: "State-level variation dwarfs the regional gap",
        kind: "bars",
        unit: "₦/litre",
        points: [
          ["State spread (Edo vs Adamawa)", 253.08],
          ["Zone gap (South South vs North West)", 59.73],
        ],
        highlight: "State spread (Edo vs Adamawa)",
        note: "Source: National Bureau of Statistics, NGA-NBS-PMS May2026. Highest minus lowest average price per litre.",
      },
    },
    {
      id: "implications",
      heading: "Turning a pump price into a budget",
      body: [
        "Rebase fuel budgets on May's numbers, not last year's. A cost line built on ₦1,027.76 a litre understates today's spend by more than half. Using ₦1,596.25 as the national planning baseline, and adjusting for each state's own price, gives a more honest baseline.",
        "Budget by state, not by zone. A single regional fuel assumption will be close enough on average and wrong in the places that matter. A network with depots or vehicles in both Edo and Adamawa faces a ₦253.08 difference on every litre, while the zonal view would suggest a gap of under ₦60.",
        "Price delivery and service contracts with the spread in mind. Where fuel is a large share of the cost to serve, a flat national rate cross-subsidises the expensive states from the cheaper ones. Location-based surcharges, or fuel clauses indexed to the published state average, keep margins tied to the actual cost.",
        "Track it monthly. A 4.13% move in a single month is large enough to shift quarterly numbers, and a monthly state-level read lets finance and operations teams see a change before it shows up in the accounts.",
        "For investors and lenders, the same logic applies to due diligence. A business model that looked comfortable at ₦1,027.76 a litre deserves a second look at ₦1,596.25, and the answer may differ sharply depending on which states carry its fleet, its plants or its customers.",
      ],
    },
  ],
  readers: {
    operator: {
      title: "Running a business in Nigeria",
      points: [
        "Reset fuel budgets to the May 2026 average of ₦1,596.25 a litre: every 1,000 litres now costs ₦568,490 more than at May 2025 prices.",
        "Plan routes, depots and generator fuel by state. Edo and Adamawa were ₦253.08 a litre apart, while zones differed by only ₦59.73.",
        "Where you can choose where vehicles refuel, the five cheapest states shown (all below ₦1,535) are worth factoring into routing and refill schedules.",
      ],
    },
    investor: {
      title: "Investing from abroad",
      points: [
        "Stress-test portfolio companies' fuel, logistics and power costs against a 55.31% annual rise in petrol and a further 4.13% in the latest month.",
        "Ask management for fuel costs by state, not region: a zonal average can hide a gap of more than four times the regional spread.",
        "When comparing locations for new operations, treat state-level fuel pricing as a site-selection input alongside rent and labour.",
      ],
    },
    seller: {
      title: "Selling to Nigerian businesses",
      points: [
        "Expect customers with fleets or generators to be under cost pressure: their petrol bill is up by more than half on a year earlier.",
        "If you deliver, review flat national delivery rates. Serving Edo cost ₦253.08 a litre more in fuel than serving Adamawa in May.",
        "Offers that cut fuel use or make fuel spend visible by state speak directly to a cost line that moved 4.13% in a single month.",
      ],
    },
  },
  scenario: "pms",
  method: [
    "Figures are read directly from the National Bureau of Statistics PMS price release for May 2026 (NGA-NBS-PMS May2026, NADA catalog, download 1632476).",
    "Every rate is independently recomputed and cross-checked before publication.",
    "The state exhibit shows selected states spanning the full range (the five highest and five lowest), not every state. Zonal figures are the six geopolitical zone averages as published.",
    "Fill-up and per-1,000-litre costs in this article are simple multiplications of the published per-litre averages and are illustrative only.",
  ],
  faq: [
    [
      "What is the price of petrol in Nigeria in May 2026?",
      "The NBS national average price of petrol (PMS) was ₦1,596.25 per litre in May 2026.",
    ],
    [
      "How much has petrol gone up in Nigeria in the past year?",
      "The national average rose 55.31% from ₦1,027.76 a litre in May 2025 to ₦1,596.25 in May 2026, and 4.13% from April 2026 (₦1,532.93).",
    ],
    [
      "Which Nigerian state has the most expensive petrol?",
      "Edo, at ₦1,722.91 a litre in May 2026. Adamawa was the cheapest at ₦1,469.83, a difference of ₦253.08.",
    ],
    [
      "Do petrol prices differ much between Nigeria's regions?",
      "Not much. The six zones were only ₦59.73 apart, from the South South (₦1,623.84) to the North West (₦1,564.11). Differences are driven more by individual states than by region.",
    ],
  ],
  sources: [
    {
      label:
        "National Bureau of Statistics, NGA-NBS-PMS May2026, NADA catalog, download 1632476",
    },
    {
      label: "The Bredge, PMS Price Watch: Nigeria's Petrol Price in May 2026 (Data Brief No. 031)",
      href: "https://drive.google.com/file/d/1s_kuW37_u_kcyM3ykuxRcB4o9Aoa27SE/view",
    },
  ],
  pdf: "https://drive.google.com/file/d/1s_kuW37_u_kcyM3ykuxRcB4o9Aoa27SE/view",
  seoDescription:
    "Nigeria petrol price May 2026: ₦1,596.25 a litre, up 55.31% in a year. Edo highest, Adamawa lowest, and why state gaps matter more than regions.",
};
