import { useSEO } from "../hooks/useSEO";

type SEOProps = Parameters<typeof useSEO>[0];

const SEO = (props: SEOProps) => {
  useSEO(props);
  return null; // Không cần render gì cả
};

export default SEO;
