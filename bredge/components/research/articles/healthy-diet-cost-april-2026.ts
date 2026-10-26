import type { Article } from "../types";

export const article: Article = {
  slug: "healthy-diet-cost-april-2026",
  series: "Cost of a Healthy Diet",
  issue: "Monthly data brief",
  published: "2026-08-27",
  period: "April 2026",
  title: "A healthy diet now costs 68% of Nigeria's minimum wage, for one person",
  dek: "Eating well cost ₦1,589 per person per day in April 2026, and the bill has risen every month this year. For employers, that turns food prices into a pay, welfare and location question.",
  readingMinutes: 7,
  hero: { value: "₦1,589", label: "Cost of a healthy diet per person per day, April 2026" },
  takeaways: [
    "A healthy diet cost ₦1,589 per person per day in April 2026, about ₦47,670 a month. That is 68% of the ₦70,000 national minimum wage, for a single person.",
    "The cost rose in every month of 2026 so far, from ₦1,458 a day in January to ₦1,589 in April, a 9.0% climb in three months. April alone added 3.11%.",
    "Animal-source foods are the biggest line in the basket at ₦643 a day, about 40% of the total. Staples, fruits and vegetables together make up another 45%.",
    "Location matters: a healthy diet cost ₦2,036 a day in Ekiti and ₦1,143 in Adamawa, a gap of ₦893. By zone, the South East (₦1,830) sits ₦415 above the North East (₦1,415).",
    "Cities are not always dearer. In Adamawa, Jigawa and the FCT, rural costs were higher than urban costs in April.",
  ],
  sections: [
    {
      id: "the-arithmetic-of-a-plate",
      heading: "The arithmetic of a plate",
      body: [
        "Take Nigeria's national minimum wage of ₦70,000 a month and spread it across 30 days. It comes to about ₦2,333 a day.",
        "In April 2026, the average cost of a healthy diet in Nigeria was ₦1,589 per person per day, according to the National Bureau of Statistics (NBS). Pay that bill and a minimum-wage earner has roughly ₦744 a day left for rent, transport, power, school fees and everything else.",
        "Over a month the numbers are starker. A healthy diet for one person costs about ₦47,670, or 68% of the minimum wage. Add a second person and the bill reaches ₦95,340, more than the whole wage. A worker on the legal floor cannot feed even one dependant a healthy diet from salary alone.",
        "The measure is the Cost of a Healthy Diet (CoHD), which the NBS prices across six food groups and publishes monthly by state and zone. It is the price of eating well, not a record of what households actually spend. The distance between the two is why the figure matters to anyone who employs, sells to or invests in Nigerian households.",
      ],
      pull: "A healthy diet for one person costs about ₦47,670 a month, or 68% of the minimum wage.",
    },
    {
      id: "four-months-four-rises",
      heading: "Four months, four rises",
      body: [
        "The April figure is not a one-off. The national daily cost has gone up in every month of 2026 so far: ₦1,458 in January, ₦1,513 in February, ₦1,541 in March and ₦1,589 in April. That is a rise of ₦131 a day, or 9.0%, in three months.",
        "For a business, that is the equivalent of a supplier raising prices four months running. Most finance teams would notice that within a quarter. Household food bills deserve the same attention, because they flow straight into wage demands and spending power.",
        "The pace has wobbled. Prices jumped 5.64% in January from ₦1,380 in December 2025, then rose 3.76% in February and 1.89% in March. April broke the slowdown with a 3.11% increase. Measured from December, a healthy diet now costs 15.1% more.",
        "In monthly terms, the per-person cost climbed from ₦43,727 in January to ₦47,670 in April. That is almost ₦3,950 more each month for the same basket, per person, inside a single quarter.",
        "The year-on-year figure tells a calmer story. April's cost was 4.68% above April 2025 (₦1,518), down from an 11.22% annual rise in January. The April brief's trend chart shows why: costs eased through the second half of 2025 before turning up again in January. The annual rate flatters the present. The month-on-month run is the signal to watch.",
      ],
      exhibit: {
        title: "The daily cost of a healthy diet has risen every month in 2026",
        kind: "line",
        unit: "₦/day",
        points: [
          ["Jan 2026", 1458],
          ["Feb 2026", 1513],
          ["Mar 2026", 1541],
          ["Apr 2026", 1589],
        ],
        highlight: "Apr 2026",
        note: "National average cost per person per day. Source: NBS, NGA-NBS-COHD January to April 2026; The Bredge monthly CoHD briefs.",
      },
    },
    {
      id: "protein-sets-the-price",
      heading: "Protein sets the price",
      body: [
        "What does ₦1,589 buy? The NBS splits the basket into six food groups, and one of them dominates.",
        "Animal-source foods, such as meat, fish, eggs and milk, cost ₦643 per person per day in April. That is about 40% of the total, more than the next two groups combined.",
        "Starchy staples (₦259), fruits (₦248) and vegetables (₦216) together account for ₦723, or about 45%. Oils and fats (₦117) and legumes, nuts and seeds (₦106) make up the rest.",
        "The practical point is that the cost of eating well in Nigeria is mainly the cost of protein. When budgets tighten, the largest line is the hardest to protect. For companies selling into food, the protein chain, from feed and livestock to cold storage and transport, is where pricing pressure concentrates.",
      ],
      exhibit: {
        title: "Animal-source foods make up about 40% of the daily cost",
        kind: "hbars",
        unit: "₦/day",
        points: [
          ["Animal-source foods", 643],
          ["Starchy staples", 259],
          ["Fruits", 248],
          ["Vegetables", 216],
          ["Oils and fats", 117],
          ["Legumes, nuts and seeds", 106],
        ],
        highlight: "Animal-source foods",
        note: "Daily cost contribution per person, April 2026. Groups sum to ₦1,589. Source: NBS, NGA-NBS-COHD April 2026.",
      },
      pull: "The cost of eating well in Nigeria is mainly the cost of protein.",
    },
    {
      id: "an-893-naira-gap",
      heading: "An ₦893 gap between states",
      body: [
        "The national average hides a wide spread. In April, a healthy diet was most expensive in Ekiti at ₦2,036 per person per day, followed by Imo (₦2,018), Bayelsa (₦1,909), Abia (₦1,895) and Lagos (₦1,863).",
        "At the other end sat Adamawa at ₦1,143, with the FCT (₦1,278), Akwa Ibom (₦1,314), Nassarawa (₦1,371) and Borno (₦1,383) also among the five cheapest. The gap between Ekiti and Adamawa is ₦893 a day, or about ₦26,790 a month per person.",
        "Put against the minimum wage, the difference is stark. A month of healthy eating costs about ₦61,080 in Ekiti, 87% of ₦70,000. In Adamawa it is about ₦34,290, or 49%. The same national wage buys very different living standards depending on where it is paid.",
        "By zone, the South East is the most expensive at ₦1,830 a day, then the South West (₦1,753) and South South (₦1,633). The three northern zones are cheaper: North West ₦1,496, North Central ₦1,483 and North East ₦1,415. The gap between the dearest and cheapest zones is ₦415 a day, about ₦12,450 a month per person.",
        "Two details stand out. Lagos, the country's commercial centre, is only fifth on the list, behind Ekiti, Imo, Bayelsa and Abia. And the FCT, home to the federal capital, is among the five cheapest. Assumptions that the big cities are always the costliest places to live do not hold for food.",
      ],
      exhibit: {
        title: "Ekiti is the most expensive state for a healthy diet, Adamawa the cheapest listed",
        kind: "hbars",
        unit: "₦/day",
        points: [
          ["Ekiti", 2036],
          ["Imo", 2018],
          ["Bayelsa", 1909],
          ["Abia", 1895],
          ["Lagos", 1863],
          ["Borno", 1383],
          ["Nassarawa", 1371],
          ["Akwa Ibom", 1314],
          ["FCT", 1278],
          ["Adamawa", 1143],
        ],
        highlight: "Ekiti",
        note: "Five highest and five lowest states by daily cost per person, April 2026, as published. Source: NBS, NGA-NBS-COHD April 2026.",
      },
    },
    {
      id: "cities-are-not-always-dearer",
      heading: "Cities are not always dearer",
      body: [
        "In most states, eating well costs more in urban areas. Ekiti shows the widest gap in the April brief: ₦2,218 a day in towns against ₦1,853 in rural areas, a difference of ₦365. Lagos runs ₦1,938 urban against ₦1,787 rural. In Imo the two are almost level, at ₦2,023 and ₦2,012.",
        "Some states flip the pattern. In Adamawa, the rural cost (₦1,247) is ₦208 above the urban cost (₦1,039). Jigawa (₦1,487 rural, ₦1,337 urban) and the FCT (₦1,318 rural, ₦1,238 urban) show the same reversal. The NBS brief links this to local supply chain and transport conditions.",
        "For businesses, this is a reminder that distribution, not just geography, shapes what people pay. A rural workforce or customer base is not automatically a cheaper one.",
      ],
    },
    {
      id: "what-it-means-for-business",
      heading: "What it means for business",
      body: [
        "Four implications stand out for companies operating in Nigeria.",
        "First, pay floors and food costs are colliding. When one person's healthy diet takes 68% of the minimum wage, staff at or near the floor are making hard trade-offs at home. That pressure does not stay at home. Meal support, food allowances and transport help are now part of the real cost of keeping a team.",
        "Second, a single national number is the wrong benchmark. A ₦893 daily gap between states, and ₦415 between zones, means a flat allowance overpays in some locations and underpays in others. Companies with staff in several states should price welfare support by location.",
        "Third, the direction of travel matters more than the annual rate. A 4.68% year-on-year rise looks modest. A 9.0% climb between January and April does not. Firms that review pay and benefits once a year against annual figures will find the gap opening between reviews. Monthly tracking closes it.",
        "Fourth, consumer demand is being reshaped from the bottom. Every extra naira a household needs for food is a naira it cannot spend elsewhere. Between January and April, the healthy basket for one person grew by almost ₦3,950 a month. For a family, multiply that. Businesses selling everyday goods to mass-market households should expect sharper price sensitivity, smaller pack sizes and more trading down, and should plan promotions and pricing with the food bill in mind.",
        "None of this calls for alarm. It calls for better inputs. The CoHD series gives companies a monthly, state-level read on the single largest pressure on household budgets. Used well, it can anchor pay reviews, welfare budgets, regional pricing and market entry decisions on evidence rather than anecdote.",
      ],
      pull: "A flat allowance overpays in some locations and underpays in others.",
    },
  ],
  readers: {
    operator: {
      title: "Running a business in Nigeria",
      points: [
        "Benchmark the lowest pay grades against ₦47,670, the monthly cost of a healthy diet for one person. At the ₦70,000 minimum wage, that takes 68% of take-home pay before any dependant is fed, so consider meal support or a food allowance for those grades.",
        "Set welfare allowances by location, not nationally. A healthy diet costs about ₦61,080 a month in Ekiti and ₦34,290 in Adamawa, and the South East runs ₦12,450 a month per person above the North East.",
        "Review staff welfare against the monthly CoHD figure rather than the annual rate. Costs rose 9.0% between January and April 2026, while the year-on-year figure showed only 4.68%.",
      ],
    },
    investor: {
      title: "Investing from abroad",
      points: [
        "Read the annual and monthly rates together. The 4.68% year-on-year rise in April understates momentum: the daily cost is up 15.1% since December 2025 (₦1,380), which points to building wage pressure in labour-heavy portfolio companies.",
        "Stress-test consumer revenue assumptions. When a healthy diet for one person costs 68% of the minimum wage, mass-market households have little room for discretionary spending, and food takes priority.",
        "Model costs by state, not on the national average. The ₦893 daily spread between Ekiti (₦2,036) and Adamawa (₦1,143) changes staff costs and local price points enough to matter for site and market selection.",
      ],
    },
    seller: {
      title: "Selling to Nigerian businesses",
      points: [
        "Employers with large workforces near the minimum wage are under welfare pressure. Lead with offers that cut their operating costs or stretch their benefits budget, such as staff meal schemes, payroll tools or procurement savings.",
        "In food and agribusiness, follow the protein. Animal-source foods cost ₦643 per person per day, about 40% of the basket, so suppliers of feed, cold storage and logistics have a clear, data-backed pitch.",
        "Segment territories with state and zone data. Prices differ by ₦415 a day between the South East and North East, and rural costs exceed urban ones in Adamawa, Jigawa and the FCT, so distribution strength can matter more than city presence.",
      ],
    },
  },
  scenario: "diet",
  method: [
    "Figures are read directly from the National Bureau of Statistics (NBS) Cost of a Healthy Diet release. Every rate is independently recomputed and cross-checked before publication.",
    "Monthly costs are estimated from the daily cost using a 30-day month (₦1,589 × 30 = ₦47,670 for April 2026).",
    "The January to April trend uses the headline daily cost, month-on-month and year-on-year changes reported in each monthly brief.",
    "State rankings show the five highest and five lowest states as published. Urban and rural comparisons use the published values for selected states only.",
    "Comparisons with the minimum wage are The Bredge's arithmetic, using the ₦70,000 monthly national minimum wage set in 2024 and a 30-day month.",
  ],
  faq: [
    [
      "How much does a healthy diet cost in Nigeria?",
      "In April 2026, a healthy diet cost ₦1,589 per person per day on average, or about ₦47,670 per month, according to NBS data. That was 3.11% higher than March and 4.68% higher than April 2025.",
    ],
    [
      "How does the cost of a healthy diet compare with Nigeria's minimum wage?",
      "A month of healthy eating for one person (about ₦47,670) takes 68% of the ₦70,000 national minimum wage. For two people the cost is ₦95,340, more than the whole wage.",
    ],
    [
      "Which state has the most expensive healthy diet in Nigeria?",
      "Ekiti, at ₦2,036 per person per day in April 2026, followed by Imo (₦2,018). Adamawa was the cheapest of the published states at ₦1,143. By zone, the South East (₦1,830) was highest and the North East (₦1,415) lowest.",
    ],
    [
      "What is driving the cost of a healthy diet in Nigeria?",
      "Animal-source foods are the largest component at ₦643 per person per day, about 40% of the total. Starchy staples, fruits and vegetables together add about 45%.",
    ],
  ],
  sources: [
    { label: "National Bureau of Statistics, NGA-NBS-COHD April 2026, NADA catalog" },
    { label: "National Bureau of Statistics, NGA-NBS-COHD January, February and March 2026, NADA catalog" },
    {
      label: "The Bredge, Healthy Diet Cost Report (CoHD data brief), April 2026",
      href: "https://drive.google.com/file/d/1zJ1KfCJl-Ha7w9KhpzENE0LTWyUbq8Zs/view",
    },
    { label: "National Minimum Wage (Amendment) Act 2024" },
  ],
  pdf: "https://drive.google.com/file/d/1zJ1KfCJl-Ha7w9KhpzENE0LTWyUbq8Zs/view",
  seoDescription: "A healthy diet cost ₦1,589 per person a day in Nigeria in April 2026, 68% of the minimum wage. What the NBS data means for pay, welfare and demand.",
};
