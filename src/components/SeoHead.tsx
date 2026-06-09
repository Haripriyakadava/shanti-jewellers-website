import { Helmet } from 'react-helmet-async';

export function SeoHead() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "JewelryStore",
        "@id": "https://shanti-jewellers-website.vercel.app/#organization",
        "name": "SHANTI JEWELLERY",
        "alternateName": "Shanthi Jewellers Nellore",
        "url": "https://shanti-jewellers-website.vercel.app/",
        "logo": "https://shanti-jewellers-website.vercel.app/shantilogo.png",
        "image": "https://shanti-jewellers-website.vercel.app/hero-model.jpg",
        "description": "Best Jewellery Shop in Nellore since 1960. We specialize in Gold Jewellery, Diamond Jewellery, Silver Jewellery, Bridal Jewellery, and Wedding Collections.",
        "telephone": ["+919039039056", "+919039039057"],
        "priceRange": "$$$",
        "foundingDate": "1960",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "2-148, Barkas Center, 17, Achari St, Beside SBI, VRC Centre",
          "addressLocality": "Nellore",
          "addressRegion": "Andhra Pradesh",
          "postalCode": "524001",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "14.4426",
          "longitude": "79.9772"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "245"
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "opens": "10:00",
            "closes": "20:30"
          }
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://shanti-jewellers-website.vercel.app/#website",
        "url": "https://shanti-jewellers-website.vercel.app/",
        "name": "SHANTI JEWELLERY",
        "publisher": {
          "@id": "https://shanti-jewellers-website.vercel.app/#organization"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is the best jewellery shop in Nellore?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "SHANTI JEWELLERY is widely recognized as the best jewellery shop in Nellore, serving customers since 1960 with premium gold, diamond, and bridal collections."
            }
          },
          {
            "@type": "Question",
            "name": "Does SHANTI JEWELLERY provide BIS Hallmarked jewellery?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, every gold ornament at SHANTI JEWELLERY carries the authentic BIS 916 Hallmark guarantee."
            }
          },
          {
            "@type": "Question",
            "name": "Where is SHANTI JEWELLERY located in Nellore?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We are located at 2-148, Barkas Center, 17, Achari St, Beside SBI, VRC Centre, Nellore, Andhra Pradesh 524001."
            }
          },
          {
            "@type": "Question",
            "name": "Does SHANTI JEWELLERY offer bridal jewellery?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, we specialize in exclusive Bridal Jewellery in Nellore, offering custom wedding jewellery collections, gold necklaces, bangles, and lightweight designs."
            }
          },
          {
            "@type": "Question",
            "name": "What are the store timings?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our store is open from Monday to Saturday, 10:00 AM to 8:30 PM. We are closed on Sundays."
            }
          }
        ]
      }
    ]
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>Best Jewellery Shop in Nellore | Gold & Diamond | Shanti Jewellers</title>
      <meta name="title" content="Best Jewellery Shop in Nellore | Gold & Diamond | Shanti Jewellers" />
      <meta name="description" content="Established in 1960, SHANTI JEWELLERY is the best gold and diamond jewellery store near VRC Centre, Nellore. Explore BIS Hallmarked wedding & bridal collections." />
      <meta name="keywords" content="Shanti Jewellery Nellore, Shanthi Jewellers Nellore, Best Jewellery Shop in Nellore, Gold Jewellery Shop Nellore, Diamond Jewellery Nellore, Wedding Jewellery Nellore, Gold Chains Nellore, Gold Bangles Shop Nellore, Bridal Gold Jewellery Nellore, BIS Hallmarked Gold Jewellery, Lightweight Gold Jewellery Nellore" />
      
      {/* Canonical URL */}
      <link rel="canonical" href="https://shanti-jewellers-website.vercel.app/" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://shanti-jewellers-website.vercel.app/" />
      <meta property="og:title" content="Best Jewellery Shop in Nellore | Shanti Jewellers" />
      <meta property="og:description" content="Explore exclusive BIS 916 gold and IGI certified diamond jewellery at Nellore's most trusted store since 1960." />
      <meta property="og:image" content="https://shanti-jewellers-website.vercel.app/hero-model.jpg" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://shanti-jewellers-website.vercel.app/" />
      <meta property="twitter:title" content="Best Jewellery Shop in Nellore | Shanti Jewellers" />
      <meta property="twitter:description" content="Explore exclusive BIS 916 gold and IGI certified diamond jewellery at Nellore's most trusted store since 1960." />
      <meta property="twitter:image" content="https://shanti-jewellers-website.vercel.app/hero-model.jpg" />

      {/* Core Web Vitals - Preconnect & DNS Prefetch */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}