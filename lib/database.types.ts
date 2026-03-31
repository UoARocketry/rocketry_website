export type Database = {
  public: {
    Tables: {
      Event: {
        Row: {
          id: number;
          title: string;
          slug: string;
          image: string | null;
          description: string | null;
          date: string;
          eventTag: string | null;
          signupUrl: string | null;
          isPast: boolean;
          location: string | null;
        };
      };
      Rocket: {
        Row: {
          id: number;
          name: string;
          slug: string;
          image: string | null;
          description: string | null;
          launchedAt: string | null;
        };
      };
      Exec: {
        Row: {
          id: number;
          name: string;
          role: string;
          bio: string;
          photo: string;
          year: number;
          order: number;
          linkedinUrl: string | null;
        };
      };
      Sponsor: {
        Row: {
          id: number;
          name: string;
          logo: string;
          url: string;
          description: string | null;
          tier: string | null;
        };
      };
      WhatWeDo: {
        Row: {
          id: number;
          title: string;
          body: string | null;
          image: string | null;
          variant: "background" | "surface" | null;
        };
      };
      JourneyItem: {
        Row: {
          id: number;
          title: string;
          body: string | null;
          image: string | null;
          variant: "background" | "surface" | null;
        };
      };
      TeamRole: {
        Row: {
          id: number;
          title: string;
          body: string | null;
          bullets: string[] | null;
          variant: "background" | "surface" | null;
        };
      };
      Stat: {
        Row: {
          id: number;
          value: string;
          label: string;
        };
      };
      SiteSettings: {
        Row: {
          id: number;
          memberJoinUrl: string | null;
          execTeamImageUrl: string | null;
        };
      };
    };
  };
};
