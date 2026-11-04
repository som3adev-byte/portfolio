import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/cv", ...projects.map((p) => `/work/${p.slug}`)].map((path) => ({ url: site.url + path }));
}
