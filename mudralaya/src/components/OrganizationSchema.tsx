export default function OrganizationSchema() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Mudralaya Fintech",
    "alternateName": "Mudralaya",
    "url": "https://www.mudralaya.com/",
    "logo": "https://www.mudralaya.com/_next/image?url=%2Fimages%2Fmudralya_logo.webp&w=384&q=75&dpl=dpl_J7yQbx4tnjFfbrqZKn7wLULDnSX3",
    "sameAs": [
      "https://www.instagram.com/mudralaya",
      "https://www.linkedin.com/company/mudralaya/",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
