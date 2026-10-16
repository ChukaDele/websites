/**
 * Bredge Writing OS: first answer a consequential decision for a global B2B
 * reader, then prove it with observed figures, reveal how it was calculated,
 * and explicitly separate facts from decisions / hypothetical scenarios.
 */
export type StorySection={eyebrow:string;heading:string;paragraphs:string[]};
export type ResearchStory={
 slug:string;lab:"fuel"|"diet"|"telecom";eyebrow:string;headline:string;
 deck:string;period:string;readTime:string;audience:string;
 thesis:string;factLabel:string;fact:string;
 sectors:string[];
 sections:StorySection[];
 decisionPaths:{role:string;question:string;action:string}[];
 method:string[];
 caveats:string[];
 conclusion:string;
};
export const researchStories:readonly ResearchStory[]=[
 {
  slug:"nigeria-pms-may-2026",lab:"fuel",eyebrow:"01 / DISTRIBUTION ECONOMICS",
  headline:"Nigeria is one country. It is not one fuel budget.",
  deck:"A U.S. manufacturer planning distribution in Nigeria can build a convincing national business case—and still get the unit economics wrong state by state. Here is what the May 2026 petrol-price data tells us, what it cannot tell us, and how we would stress-test a market-entry plan.",
  period:"May 2026",readTime:"7-minute analysis",audience:"Global operators · logistics leaders · investment teams",
  thesis:"A national mean is useful for briefing a board. A location-based operating model is useful for deciding where to put inventory, allocate vehicles and price deliveries.",
  factLabel:"Price gap between reported high and low states",fact:"₦253.08 / litre",
  sectors:["International distribution","Retail supply chains","Manufacturing","Investment screening"],
  sections:[
   {eyebrow:"THE QUESTION",heading:"Which Nigeria is your distribution model pricing?",
    paragraphs:[
     "Suppose a U.S. consumer-goods company is deciding whether to launch with a single national distributor or build regional routes. A financial model might begin with the May 2026 average petrol price of ₦1,596.25 per litre. That is a legitimate published observation. It is not necessarily the price its delivery network will actually face.",
     "In the same NBS release, Edo averaged ₦1,722.91 while Adamawa averaged ₦1,469.83. The ₦253.08 gap is about 17.2% of the lower-state price. At an illustrative 10,000 litres per month, that difference alone represents ₦2.53 million in monthly fuel expense. Those are arithmetic sensitivities, not a forecast or a claim about an actual fleet.",
     "This is why the dashboard below lets you change the geographic lens and your assumed monthly fuel consumption. The right question is not whether Nigeria is expensive. It is where your actual route exposure sits."
    ]},
   {eyebrow:"THE EVIDENCE",heading:"The regional average smooths away the local exception.",
    paragraphs:[
     "The South South had the highest reported zonal mean at ₦1,623.84 per litre. The North West was lowest at ₦1,564.11. That zonal gap, ₦59.73, is materially smaller than the ₦253.08 difference between Edo and Adamawa. Region-level planning can therefore conceal state-level outliers.",
     "Time matters as much as place. The national reported mean was ₦1,027.76 in May 2025, ₦1,532.93 in April 2026, and ₦1,596.25 in May 2026. A twelve-month supply-chain forecast built without cost sensitivity would fail to reflect that historical volatility.",
     "Choose State, Region or Price history in the live evidence panel. Select a point and change the fuel-volume assumption. Every shown historical observation comes from the original Bredge report's NBS figures."
    ]},
   {eyebrow:"THE BUSINESS DECISION",heading:"Site selection starts with an exposure map—not a single price.",
    paragraphs:[
     "For an importer or distributor, this analysis points to a better diligence checklist: forecast litres by route, identify the states where vehicles and generators actually operate, separate contracted rates from retail pump prices, and test what the economics look like across high-, midpoint- and low-cost cases.",
     "For an investor, the same discipline changes what to ask management. Can the company explain why distribution costs vary by geography? Can it reconcile its operating data with official reference prices? And is margin erosion caused by fuel exposure, route design, pricing power or something else?",
     "Fuel is only one input. Vehicle efficiency, downtime, freight contracts, regulatory charges, exchange rates and demand density may dominate the eventual investment decision. Treat this as a model input—not a location recommendation."
    ]},
   {eyebrow:"THE BREDGE METHOD",heading:"Put the calculation where the decision maker can challenge it.",
    paragraphs:[
     "We separate observed figures from the assumptions a team controls. The reported state and zone means are historical evidence. Monthly litres is a user-controlled hypothetical input. Their product is a scenario, not an audited company forecast.",
     "A decision-ready business dashboard should make that distinction impossible to miss. The source belongs next to the chart; the assumption belongs next to the slider; the limitation belongs next to the conclusion. That is the difference between a striking visual and an analytical tool someone can actually use."
    ]},
  ],
  decisionPaths:[
   {role:"U.S. company expanding into Nigeria",question:"Where would fuel costs concentrate?",action:"Model actual route-level litres and compare the states on your distribution footprint."},
   {role:"Private equity or investment team",question:"How resilient are operating margins?",action:"Ask for a fuel sensitivity bridge between planned volume, realized pump price and delivered unit cost."},
   {role:"Local operations leader",question:"What should change this quarter?",action:"Compare the budgeted per-litre assumption with observed fleet consumption and route outcomes."},
  ],
  method:[
   "Source: NBS Premium Motor Spirit Price Watch, May 2026; analysed and visualised in the original Bredge report.",
   "The State view uses five highest and five lowest figures explicitly shown in the source report. It is NOT a fabricated ranking of all states.",
   "The Region view reproduces six geopolitical-zone published averages. The history view shows three report-cited national observations.",
   "The business scenario multiplies a selected historical average pump price by user-entered hypothetical litres. It does not convert currencies or infer actual fleet expenses.",
  ],
  caveats:[
   "Prices are dated May 2026 and are not current quotations, fuel contracts, FX-adjusted prices or forecasts.",
   "Sampled average prices do not describe every filling station, fleet or route.",
   "Cost of distribution also depends on route design, fleet efficiency, labor, security, depreciation, taxes and demand.",
  ],
  conclusion:"A confident expansion decision does not start by picking the lowest bar. It starts by linking location, volume and operating assumptions to a model whose inputs can be challenged.",
 },
 {
  slug:"nigeria-telecoms-q4-2025",lab:"telecom",eyebrow:"02 / MARKET SIZING",
  headline:"179 million mobile subscriptions. How many potential customers?",
  deck:"The headline size of a market is almost never the size of your addressable market. Nigeria's Q4 2025 telecoms data shows why network concentration, regional demand and the difference between connections and people matter to a company planning entry or investment.",
  period:"Q4 2025",readTime:"8-minute analysis",audience:"Software companies · telecom operators · growth investors",
  thesis:"A SIM subscription counts a connection, not necessarily a unique person, a household, an app user or someone prepared to pay.",
  factLabel:"Active voice subscriptions at Q4 2025",fact:"179.64 million",
  sectors:["Market entry","Telecom partnerships","Consumer technology","Digital distribution"],
  sections:[
   {eyebrow:"THE ASSUMPTION",heading:"Your addressable market is not a subscriber counter.",
    paragraphs:[
      "Imagine a U.S. digital service planning a Nigerian launch. Someone presents a slide: nearly 180 million active voice subscriptions. The natural next sentence is, 'We only need one percent.' That is where a market-sizing error begins.",
      "The NBS/NCC recorded 179.64 million active voice subscriptions and 148.17 million active internet subscriptions in Q4 2025. Both are substantial. Neither is the number of distinct people, verified smartphone owners, potential paid customers, nor corporate accounts. Multi-SIM usage and differences in data access make those distinctions commercially important.",
      "A useful addressable-market estimate must narrow from connections to individual users, relevant geography, actual device capability, need, purchasing power and distribution access. The published telecom totals establish a useful outer reference, not the final calculation."
    ]},
   {eyebrow:"THE STRUCTURE",heading:"Control of distribution is not evenly divided.",
    paragraphs:[
      "MTN ended Q4 2025 with around 93.06 million voice subscriptions and 79.87 million internet subscriptions, representing more than half of both measures. Airtel was the next-largest operator. For a company relying on telco partnerships, this can shape acquisition channels, negotiation leverage and network-reach assumptions.",
      "Geography tells another part of the story. Lagos accounted for approximately 21.58 million active voice and 18.60 million internet subscriptions. Kano and Ogun followed. The concentration means that the geographic demand question is different from the national subscriber headline.",
      "Use the live model to compare operators, explore the ten leading state markets, inspect the Q3 2024-to-Q4 2025 reported endpoints and see the much smaller number-porting figures. Those are separate commercial questions and should not be collapsed into one indicator."
    ]},
   {eyebrow:"THE SIGNAL",heading:"Porting tells you movement. It does not tell you churn.",
    paragraphs:[
      "In Q4 2025, MTN recorded 964 port-ins against 157 port-outs—a net gain of 807. 9mobile had 6 port-ins against 945 port-outs—a net loss of 939 ported numbers. These are real observed flows, but tiny relative to subscriber bases measured in millions.",
      "It would be tempting to describe the figures as evidence of mass consumer switching. They are better treated as a directional indicator. Users can acquire, abandon or retain connections without porting a number. Market structure needs multiple measures and correctly matched denominators.",
      "Good data work does not make every chart say something dramatic. It finds the signal that is actually defensible. An investment committee needs a denominator and an explanation of what the dataset leaves out, not just a number surrounded by an upward arrow."
    ]},
   {eyebrow:"THE DECISION",heading:"Build distribution and product assumptions from the bottom up.",
    paragraphs:[
      "For a software company, test realistic users by segment, city, device and use case. For an infrastructure investor, examine capacity, concentration and the cost of reaching underserved markets. For an operating team, distinguish acquired subscribers from active, revenue-generating customers.",
      "The scenario tool multiplies the published voice-subscription total by a hypothetical reach percentage. Use it to show the scale of an assumption, not as a customer forecast. To get a real addressable market, you would need additional evidence: de-duplicated users, income, device capabilities, app adoption and actual willingness to pay.",
      "When those layers are brought together, the market-entry discussion changes from 'How large is Nigeria?' to 'Which customer can this business reliably reach and serve?' That distinction is the difference between a marketing slide and an acquisition plan a finance team can defend."
    ]},
  ],
  decisionPaths:[
   {role:"International SaaS or fintech entrant",question:"How large is the reachable paid segment?",action:"Separate connections from distinct internet-capable users and verify payment, geography and adoption."},
   {role:"Infrastructure investor",question:"Where is the connectivity opportunity?",action:"Compare concentration by operator and state with quality-of-service and coverage evidence."},
   {role:"Telecom partnership team",question:"Which channels offer leverage?",action:"Model dependency on the largest operators before negotiating distribution."},
  ],
  method:[
   "Source: NBS Telecoms Data, Q2 2024–Q4 2025, using NCC administrative records; figures checked against the Bredge quarterly report.",
   "Market totals and operator comparisons are rounded as published in the original report. Charts are observed subscriptions, not distinct individuals.",
   "The state chart shows ten leading markets reported in Q4 2025; the recovery chart shows selected historical endpoints, not an interpolated quarterly time series.",
   "Porting compares observed port-ins and port-outs; no churn percentage is derived from these values.",
  ],
  caveats:[
   "Voice and internet subscriptions are connections, not unique consumers, payers or device owners.",
   "Porting is not total churn; the count of ported numbers is tiny compared with subscription stocks.",
   "The information is a historic Q4 2025 snapshot and not a current market estimate or entry recommendation.",
  ],
  conclusion:"The interesting number is not the one that makes the market sound largest. It is the one you can connect to a real customer, acquisition channel and sustainable unit economics.",
 },
 {
  slug:"nigeria-cohd-april-2026",lab:"diet",eyebrow:"03 / AFFORDABILITY & CONSUMER MARKETS",
  headline:"A healthy diet costs 78% more in Ekiti than Adamawa.",
  deck:"A global food brand, retailer or development investor cannot treat affordability as a single national statistic. Nigeria's April 2026 healthy-diet reference data shows where a standard pricing assumption can break—and why a basket-cost index is not the same as actual household spending.",
  period:"April 2026",readTime:"7-minute analysis",audience:"Consumer businesses · food systems investors · development finance",
  thesis:"Affordability needs location, basket composition and income context. A nationwide reference price reveals none of those differences on its own.",
  factLabel:"Highest–lowest state daily reference gap",fact:"₦893 per adult",
  sectors:["Consumer goods","Food retail","Agricultural logistics","Development finance"],
  sections:[
   {eyebrow:"THE BUSINESS PROBLEM",heading:"Your national price point may be the wrong local price point.",
    paragraphs:[
      "An international food producer considering Nigeria might begin with a national market model. The NBS/GAIN reported an average minimum cost of ₦1,589 per adult per day for a healthy diet in April 2026. It is a useful reference for nutritional affordability. It is not a receipt from a typical household.",
      "The figure conceals a wide range. Ekiti recorded ₦2,036 per adult per day; Adamawa recorded ₦1,143. That is a ₦893 difference, about 78% of the lower state's measure. A business serving both markets with one affordability assumption could misunderstand who has room in the household budget for its products.",
      "The interactive model lets you compare observed state and zonal costs, change an illustrative adult count and see how the minimum-cost benchmark changes. It does not guess local wages, consumer demand or the price consumers are willing to pay."
    ]},
   {eyebrow:"THE BASKET",heading:"What drives the cost matters as much as the total.",
    paragraphs:[
      "Animal-source foods accounted for ₦643 of the national ₦1,589 reference basket, around 40.5%. Starchy staples were ₦259, fruits ₦248, vegetables ₦216, oils and fats ₦117, and legumes, nuts and seeds ₦106.",
      "For a food producer or investor, that composition poses a different question from the headline cost. Which parts of the supply chain drive the highest nutritional cost? What processing, cold chain or distribution improvements might matter? And can supply reliability be improved without simply assuming every price change passes through to consumers?",
      "The food-group view presents the observed reference basket. It is a least-cost model, not proof of actual consumption by household, retail category sales or dietary preferences."
    ]},
   {eyebrow:"THE GEOGRAPHY",heading:"Even the urban premium has exceptions.",
    paragraphs:[
      "The South East reported a ₦1,830 zonal daily average and the North East ₦1,415. In the selected urban/rural pairs, some urban costs are higher and some rural costs are higher; there is no universal premium.",
      "In Ekiti, the reported urban reference cost was ₦2,218 versus ₦1,853 rural. In Adamawa, the rural cost of ₦1,247 exceeded the urban estimate of ₦1,039. Supply-chain, agricultural geography and local-market structure are possibilities worth investigating, not causes proven by the chart alone.",
      "Use the Urban vs rural panel to challenge a simple assumption. What works as a pricing or supply-chain strategy in one state may not transfer neatly to another. Test the exception before extrapolating an average to an operating region."
    ]},
   {eyebrow:"THE INVESTMENT LENS",heading:"Affordability is a signal. It is not a forecast of demand.",
    paragraphs:[
      "For a global retailer, the next step would connect cost-of-diet indicators to income distributions, price sensitivity, retail footprint and basket-level transaction data. For an agricultural investor, it would connect the nutritional reference cost to sourcing, spoilage, transport networks and seasonal availability.",
      "This is where Bredge's discipline matters. Different sources describe different things. A household survey, an NBS modelled diet reference and a supermarket transaction system cannot be substituted for one another simply because each has a price field.",
      "The goal is an evidence chain that allows a management team to see what is known, what is assumed and what would need to be measured before investing. Good analytics makes the next question observable and measurable, rather than offering a false sense of certainty."
    ]},
  ],
  decisionPaths:[
   {role:"International consumer-goods company",question:"How should our pricing and market rollout vary?",action:"Combine regional diet reference cost with transaction data, wages and local household expenditure."},
   {role:"Agriculture or cold-chain investor",question:"Where might food logistics improve access?",action:"Investigate where basket composition and transport bottlenecks coincide with high local reference costs."},
   {role:"Development finance institution",question:"Where should a pilot be tested?",action:"Compare zones and urban/rural exceptions, then test the intervention against measured affordability outcomes."},
  ],
  method:[
   "Source: NBS and GAIN Cost of a Healthy Diet, April 2026; figures reproduced from the Bredge public-statistics brief.",
   "CoHD is a modelled least-cost combination of locally available foods meeting nutritional requirements for one adult; it is not surveyed food expenditure.",
   "The state view shows five high and five low cases in the original report. Zonal averages, food groups and six urban/rural pairs are direct report references.",
   "The scenario tool multiplies the modelled daily reference by an assumed number of adults and 30 days. It is not a household budget prediction.",
  ],
  caveats:[
   "The reference does not measure wages, household budgets, willingness to pay, food consumption or nutritional outcomes.",
   "The original draft's month-on-month and year-on-year percentage changes did not match the contemporaneous NBS release; they are intentionally excluded pending reconciliation.",
   "Urban/rural pairs are selected examples; no causal explanation is established by the comparative chart.",
  ],
  conclusion:"The opportunity is not automatically where a bar is tallest. It is where a business can connect local needs, a viable product and a measurable operating improvement.",
 },
] as const;
export const researchBySlug=Object.fromEntries(researchStories.map(x=>[x.slug,x])) as Record<string,ResearchStory>;
