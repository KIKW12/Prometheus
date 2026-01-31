"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Dashboard from "@/components/dashboard";
import { supabase } from "@/lib/supabase";
import { getCurrentUserAsync, isAuthenticatedAsync } from "@/lib/auth";

interface CompanyDetails {
  companyName: string;
  userName: string;
  userRole: string;
  companySize: string;
  industry: string;
  description: string;
}

export default function FindPage() {
  const router = useRouter();
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Check authentication first
      const authenticated = await isAuthenticatedAsync();
      if (!authenticated) {
        router.push("/find/sign-up");
        return;
      }

      const user = await getCurrentUserAsync();
      if (!user) {
        router.push("/find/sign-up");
        return;
      }

      // Load company details from Supabase using user ID
      try {
        const { data, error } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('user_id', user.userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error loading company details:", error);
          router.push("/find/company-details");
          return;
        }

        if (data) {
          setCompanyDetails({
            companyName: data.company_name || "",
            userName: data.user_name || "",
            userRole: data.user_role || "",
            companySize: data.company_size || "",
            industry: data.industry || "",
            description: data.description || "",
          });
          setIsLoading(false);
        } else {
          // Redirect to company-details if no profile found
          router.push("/find/company-details");
          return;
        }
      } catch (error) {
        console.error("Error loading company details:", error);
        router.push("/find/company-details");
      }
    };

    loadData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <Dashboard />
    </>
  );
}
