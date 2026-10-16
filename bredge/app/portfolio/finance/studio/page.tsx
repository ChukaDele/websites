import type {Metadata} from "next";
import {pageMetadata} from "../../../../lib/seo";
import FinanceStudio from "../../../../components/finance-studio/FinanceStudio";
export const metadata:Metadata={
 ...pageMetadata({
  title:"Finance Studio | Interactive BI Workbench | The Bredge",
  description:"Cross-filter, drill down, compare profitability, explore 700 Microsoft Financial Sample records, and test scenarios in The Bredge's interactive Finance Studio.",
  path:"/portfolio/finance/studio",
 }),
 robots:{index:false,follow:false},
};
export default function FinanceStudioPage(){return <FinanceStudio/>;}
