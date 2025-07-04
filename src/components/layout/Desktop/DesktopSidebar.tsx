"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useBusiness } from "@/hooks/swrHooks";
import { useTranslations } from "next-intl";

type NavigationItem = {
  name: string;
  href: string;
  icon: string;
  current: boolean;
};

export default function DesktopSidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const [isExpanded, setIsExpanded] = useState(false);

  const { isLoaded, user } = useUser();
  const shouldFetchBusiness = isLoaded && user?.publicMetadata?.role === "business";
  const clerkId = shouldFetchBusiness ? user?.id : null;
  const { business } = useBusiness(clerkId);
  const userRole = user?.publicMetadata?.role as string;

  // Default logo to use if no business logo is available
  const defaultLogo = "/logo/HBA_NoBack_NoWords.png";
  const businessLogo = shouldFetchBusiness && business?.logoUrl ? business.logoUrl : defaultLogo;

  if (!isLoaded) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const navigationItems: Record<string, NavigationItem[]> = {
    business: [
      {
        name: t("dashboard"),
        href: "/business",
        icon: "/icons/DesktopSidebar/Home.png",
        current: pathname === "/business" || pathname.startsWith("/business/"),
      },
    ],
    admin: [
      {
        name: t("dashboard"),
        href: "/admin",
        icon: "/icons/DesktopSidebar/Home.png",
        current: pathname === "/admin",
      },
      {
        name: t("analytics"),
        href: "/admin/analytics",
        icon: "/icons/DesktopSidebar/Analytics.png",
        current: pathname === "/admin/analytics" || pathname.startsWith("/admin/analytics/"),
      },
      {
        name: t("reqs"),
        href: "/admin/requests",
        icon: "/icons/DesktopSidebar/Requests.png",
        current: pathname === "/admin/requests" || pathname.startsWith("/admin/requests/"),
      },
      {
        name: t("automations"),
        href: "/admin/automations",
        icon: "/icons/DesktopSidebar/Automation.png",
        current: pathname === "/admin/automations" || pathname.startsWith("/admin/automations/"),
      },
    ],
  };

  const navigation = navigationItems[userRole] || navigationItems.business;

  return (
    <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0">
      <div
        className={cn(
          "flex flex-col h-screen transition-all duration-300",
          isExpanded ? "w-[359px]" : "w-[99px]",
          "bg-[#293241]",
        )}
      >
        {isExpanded && (
          <div className="absolute top-[23px] left-[10px]">
            <Image src="/logo/HBA_No_Back.png" alt="HBA Logo" width={129} height={68} className="w-[129px] h-[68px]" />
          </div>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "transition-all duration-300 flex items-center justify-center rounded-full hover:bg[#1F2530]",
            isExpanded
              ? "w-[60px] h-[45px] mt-[25px] ml-[288px] bg-[#1F2530] rounded-[5px]"
              : "w-[30px] h-[30px] mt-[29px] mx-auto",
          )}
        >
          <Image src="/icons/DesktopSidebar/Menu.png" alt="Menu" width={30} height={30} />
        </button>

        {/* Navigation items + Sign Out */}
        <div
          className={cn(
            "flex flex-col mt-[40px]",
            !isExpanded && "items-center space-y-[40px]",
            isExpanded && "ml-0 space-y-[30px]",
          )}
        >
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center transition-all duration-300",
                isExpanded
                  ? "ml-[16px] w-[328px] h-[45px] rounded-[5px] pl-[18px]"
                  : "w-[40px] h-[40px] justify-center rounded-full",
                isExpanded && item.current && "bg-[#3E495C]",
                isExpanded && !item.current && "bg-[#293241]",
                "hover:bg-[#1F2530]",
              )}
            >
              <Image src={item.icon} alt={item.name} width={30} height={30} className="shrink-0" />
              {isExpanded && (
                <span className="ml-[18px] text-white font-futura text-base font-medium leading-[21.25px]">
                  {item.name}
                </span>
              )}
            </Link>
          ))}

          {/* Sign Out Button below the nav items */}
          <button
            onClick={handleSignOut}
            className={cn(
              "flex items-center transition-all duration-300 mt-[10px] text-white",
              isExpanded
                ? "ml-[18px] w-[328px] h-[45px] pl-[18px] font-futura text-base font-medium hover:bg-[#1F2530] rounded-[5px]"
                : "w-[40px] h-[40px] justify-center rounded-full hover:bg-[#1F2530] mx-auto mt-[40px]",
            )}
          >
            <Image src="/icons/DesktopSidebar/Logout.png" alt="Sign Out" width={30} height={30} className="shrink-0" />
            {isExpanded && <span className="ml-[18px]">{t("signOut")}</span>}
          </button>
        </div>

        {/* Bottom logo bar */}
        <div
          className={cn(
            "mt-auto flex flex-col items-center justify-center",
            isExpanded ? "bg-[#1F2530] h-[100px]" : "h-[90px]",
          )}
        >
          <div className={cn("flex", isExpanded ? "items-center pl-[12px] h-[66px]" : "p-[18px]")}>
            <Image
              src={userRole === "business" ? businessLogo : defaultLogo}
              alt="Business Logo"
              width={62}
              height={57}
              className="object-contain"
              onError={(e) => {
                // Fallback to default on error
                const target = e.target as HTMLImageElement;
                target.src = defaultLogo;
              }}
            />
            {isExpanded && (
              <span className="ml-[18px] text-white font-futura text-base font-medium leading-[21.25px]">
                {userRole === "admin" ? "Hispanic Business Association" : (business?.businessName ?? t("businessName"))}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
