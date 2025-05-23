import { useEffect, useMemo } from "react";

type AlternateHrefLang = {
  href: string;
  hrefLang: string;
};

type UseSEOProps = {
  title?: string;
  description?: string;
  keywords?: string;
  robots?: string;
  canonical?: string;
  image?: string;
  jsonLd?: Record<string, any>; // JSON-LD Schema
  alternateHrefs?: AlternateHrefLang[]; // hreflang tags
};

// Cập nhật hoặc tạo mới meta tag, đảm bảo không bị trùng
const setMetaTag = (name: string, content: string, attr: "name" | "property" = "name") => {
  const all = document.querySelectorAll(`meta[${attr}="${name}"]`);
  if (all.length > 1) {
    // Xóa trùng lặp
    all.forEach((el, i) => {
      if (i > 0) el.remove();
    });
  }

  let element = all[0] as HTMLMetaElement | undefined;
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
};

// Tạo hoặc cập nhật link (canonical, alternate)
const setOrCreateLinkTag = (
  rel: string,
  href: string,
  attributes: Record<string, string> = {}
) => {
  const selectorParts = [`link[rel="${rel}"]`];
  if (attributes.hreflang) {
    selectorParts.push(`[hreflang="${attributes.hreflang}"]`);
  }
  let link = document.querySelector(selectorParts.join("")) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    Object.entries(attributes).forEach(([key, value]) => {
      link?.setAttribute(key, value);
    });
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
};

export const useSEO = ({
  title,
  description,
  keywords,
  robots = "index, follow",
  canonical,
  image,
  jsonLd,
  alternateHrefs,
}: UseSEOProps) => {
  const jsonLdStr = useMemo(() => JSON.stringify(jsonLd), [jsonLd]);

  useEffect(() => {
    if (title) {
      document.title = title;
      setMetaTag("og:title", title, "property");
    }

    if (description) {
      setMetaTag("description", description);
      setMetaTag("og:description", description, "property");
    }

    if (keywords) {
      setMetaTag("keywords", keywords);
    }

    if (robots) {
      setMetaTag("robots", robots);
    }

    if (canonical) {
      setOrCreateLinkTag("canonical", canonical);
      setMetaTag("og:url", canonical, "property");
    }

    if (image) {
      setMetaTag("og:image", image, "property");
    }

    // JSON-LD structured data
    if (jsonLdStr) {
      const scriptId = "seo-json-ld";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = scriptId;
        document.head.appendChild(script);
      }
      script.textContent = jsonLdStr;
    }

    // Hreflang alternate URLs
    alternateHrefs?.forEach(({ href, hrefLang }) => {
      setOrCreateLinkTag("alternate", href, { hreflang: hrefLang });
    });

    return () => {
      const script = document.getElementById("seo-json-ld");
      if (script) {
        document.head.removeChild(script);
      }

      alternateHrefs?.forEach(({ hrefLang }) => {
        const link = document.querySelector(`link[rel="alternate"][hreflang="${hrefLang}"]`);
        if (link) {
          document.head.removeChild(link);
        }
      });
    };
  }, [
    title,
    description,
    keywords,
    robots,
    canonical,
    image,
    jsonLdStr,
    alternateHrefs,
  ]);
};
