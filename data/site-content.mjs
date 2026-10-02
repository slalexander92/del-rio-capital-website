// Company and investment content lives here so new people and properties can be
// added without changing page templates or presentation code.
export const siteContent = {
  name: "Del Rio Capital",
  description:
    "A premier commercial real estate investment platform focused on value-add and opportunistic industrial acquisitions across the Southwest U.S.",
  domain: "https://www.delriocapital.com",
  email: "gkerrkoppel@delriocapital.com",
  phone: {
    label: "(925) 482-7025",
    href: "tel:+19254827025",
  },
  linkedin: "https://www.linkedin.com/company/del-rio-capital/",
  partners: [
    {
      id: "gaelan-kerr-koppel",
      name: "Gaelan Kerr-Koppel",
      role: "Partner",
      image: "/assets/images/gaelan.webp",
      portrait: {
        scale: 1.22,
        offsetY: -8,
      },
      linkedin: "https://www.linkedin.com/in/gaelan-kerr-koppel-39aaa755/",
    },
    {
      id: "ed-whittemore",
      name: "Ed Whittemore",
      role: "Partner",
      image: "/assets/images/ed.webp",
      linkedin: "https://www.linkedin.com/in/ed-whittemore-40b5535/",
    },
  ],
  properties: [
    {
      slug: "tolleson-94th-avenue",
      address: "700 S. 94th Avenue",
      city: "Tolleson",
      state: "AZ",
      market: "Phoenix metro",
      type: "Single-tenant industrial",
      area: 85718,
      purchasePrice: 11150000,
      pricePerSquareFoot: 130,
      image: "/assets/images/tolleson.webp",
      summary:
        "An 85,718-square-foot manufacturing-oriented industrial building repositioned through speculative capital improvements in an infill Phoenix metro location.",
      strategy:
        "Acquire a vacant, high-quality industrial asset and complete the capital improvements needed to position the building for re-leasing.",
      highlights: [
        "85,718 square feet",
        "Built in 2008",
        "Infill Phoenix metro location",
        "Full-building lease executed within three months of acquisition",
      ],
      story: [
        "Acquisition of a vacant 85,718 square foot industrial building in Tolleson, Arizona. Del Rio Capital identified the opportunity to acquire a high quality manufacturing oriented asset in a desirable infill Phoenix metro location.",
        "The building, built in 2008, was recently vacated by a full building tenant and was in need of significant capital improvements in order to successfully market and re-lease the building. The building seller was unable to comprehensively renovate the property as they had purchased the building as a NNN investment and was unwilling to invest significantly into the asset.",
        "Del Rio's business plan focused on making the building capital improvements speculatively in order to properly position the asset for re-leasing. Building improvements began within weeks of acquisition and proved fruitful as Del Rio was able to execute a full building lease with Fortune 500 company Carvana within three months of building acquisition, a full 12 months ahead of business plan.",
      ],
      outcome: {
        label: "Leasing execution",
        text: "A full-building lease with Carvana within three months of acquisition—12 months ahead of the business plan.",
      },
      facts: [
        { label: "Building area", value: "85,718 SF" },
        { label: "Purchase price", value: "$11,150,000" },
        { label: "Price per square foot", value: "$130/SF" },
        { label: "Year built", value: "2008" },
      ],
    },
    {
      slug: "paramount-orange-avenue",
      address: "14100–14138 Orange Avenue",
      city: "Paramount",
      state: "CA",
      market: "Greater Los Angeles",
      type: "Multi-tenant industrial",
      area: 44387,
      purchasePrice: 8500000,
      pricePerSquareFoot: 191,
      image: "/assets/images/paramount.webp",
      summary:
        "A 44,387-square-foot industrial park with 20 rental units, acquired with a plan to modernize the property and reposition rents through renovation and selective re-tenanting.",
      strategy:
        "Upgrade common areas and individual units, selectively re-tenant the property, and bring unit rents to market as spaces turn over.",
      highlights: [
        "44,387 square feet",
        "20 rental units across two buildings",
        "Approximately 2,200 square feet per unit",
        "Common-area and unit modernization",
      ],
      story: [
        "Purchase and renovation of a 44,387 square foot multi-tenant industrial park in Paramount, California. The property consists of 20 rental units across two buildings with an average unit size of approximately 2,200 square feet.",
        "The property was developed in the early 1970's and had been owned and operated by the same family since inception. The Paramount property had been under invested in to in recent years and was in need of significant capital improvements to modernize the assets.",
        "Del Rio's business plan includes full common area and unit upgrades as well selectively re-tenanting the property in order to bring unit rents to market.",
        "Del Rio delivered significant pickup in leasing activity upon its speculative renovation of the property's lone vacant unit. Del Rio will continue to deliver like new improvements for units as they turnover in order to capture best in class tenants for the business park.",
      ],
      outcome: {
        label: "Renovation-led leasing",
        text: "Speculative renovation of the park’s lone vacant unit delivered a significant pickup in leasing activity.",
      },
      facts: [
        { label: "Building area", value: "44,387 SF" },
        { label: "Purchase price", value: "$8,500,000" },
        { label: "Price per square foot", value: "$191/SF" },
        { label: "Rental units", value: "20" },
      ],
    },
  ],
};
