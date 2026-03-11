export default function LocalBusinessSchema() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Mudralaya Fintech",
    "image": "https://www.mudralaya.com/_next/image?url=%2Fimages%2Fmudralya_logo.webp&w=384&q=75&dpl=dpl_J7yQbx4tnjFfbrqZKn7wLULDnSX3",
    "@id": "contact@mudralaya.com",
    "url": "https://www.mudralaya.com/",
    "telephone": "+91 8899883638",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Sikanderpur",
      "addressLocality": "Gurugram",
      "postalCode": "",
      "addressCountry": "IN",
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      "opens": "00:00",
      "closes": "23:59",
    },
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
