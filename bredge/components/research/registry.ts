import type { Article } from "./types";
import { article as inflation } from "./articles/inflation-july-2026";
import { article as diet } from "./articles/healthy-diet-cost-april-2026";
import { article as pms } from "./articles/petrol-prices-may-2026";

/** Every published research article, newest first. */
export const ARTICLES: Article[] = [pms, inflation, diet];

export const articleBySlug = (slug: string) => ARTICLES.find((a) => a.slug === slug);
