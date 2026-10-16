/** Purpose-built editorial imagery. Each image interprets the actual business
 * question in the related model; none represents a data observation or client.
 * The numerical charts and supporting sources remain HTML and interactive. */
import type {LabId} from "./workbench-data";

type EditorialAsset = {src:string; alt:string; subject:string};
export const editorialAssets:Record<LabId,EditorialAsset> = {
 finance:{
  src:"/media/editorial/finance-decision-cover.webp",
  alt:"Sculptural paper ledgers, coins and a discount tag cutting through layered revenue sheets, illustrating margin erosion.",
  subject:"Margin erosion and discount decisions",
 },
 supply:{
  src:"/media/editorial/supply-decision-cover.webp",
  alt:"An isometric distribution centre with delivery vehicles and a visible parcel bottleneck, illustrating operational delivery delays.",
  subject:"Distribution bottlenecks and delivery exposure",
 },
 saas:{
  src:"/media/editorial/saas-decision-cover.webp",
  alt:"Unequal glowing subscriber towers surrounded by mobile subscription tiles, illustrating concentration of recurring revenue and churn.",
  subject:"Customer retention and revenue concentration",
 },
 fuel:{
  src:"/media/editorial/fuel-decision-cover.webp",
  alt:"Fuel pump and a delivery tanker at the centre of branching amber roads, illustrating varying fuel distribution costs.",
  subject:"Regional petrol costs and distribution decisions",
 },
 telecom:{
  src:"/media/editorial/telecom-decision-cover.webp",
  alt:"A dominant mobile communications tower and three smaller towers directing SIM-like signals across an urban landscape, illustrating network concentration.",
  subject:"Telecom market concentration",
 },
 diet:{
  src:"/media/editorial/diet-decision-cover.webp",
  alt:"A basket of produce, legumes, eggs and fruit beside a balancing scale and coins, illustrating minimum-cost healthy diets.",
  subject:"Healthy-food basket affordability",
 },
};
