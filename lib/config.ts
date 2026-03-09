export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  },
  googleAds: {
    clientId: process.env.GOOGLE_ADS_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET ?? '',
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? '',
    refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN ?? '',
    customerId: process.env.GOOGLE_ADS_CUSTOMER_ID ?? '',
    /** MCC (manager) account ID — sent as login-customer-id header. */
    loginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID ?? '',
  },
} as const;
