export default function WebsiteSchema() {
  const schemaData = {
    "@context": "https://schema.org/",
    "@type": "WebSite",
    "name": "Mudralaya Fintech",
    "url": "https://www.mudralaya.com/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.mudralaya.com/{search_term_string}https://www.mudralaya.com/",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
