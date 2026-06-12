import type { Organization, WithContext } from "schema-dts";

export const createOrganizationSchema = (
  siteUrl?: string,
): WithContext<Organization> => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Next Universe",
    ...(siteUrl && {
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
    }),
  };
};
