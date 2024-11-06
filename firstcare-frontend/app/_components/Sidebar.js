// firstcare-frontend/app/_components/Sidebar.js
// Define the categories with their respective titles, URLs, and icons

"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider
} from "@/components/ui/sidebar";
import { Calendar, Heart, User, Home, Eye, ClipboardList } from "lucide-react";
import Link from 'next/link';

const categories = [
  { title: "Cardiologist", url: "/category/cardiologist", icon: Heart },
  { title: "Dentists", url: "/category/dentists", icon: User },
  { title: "GP Doctors", url: "/category/gp-doctors", icon: Home },
  { title: "Gynecologists", url: "/category/gynecologists", icon: User },
  { title: "Ophthalmologist", url: "/category/ophthalmologist", icon: Eye },
  { title: "Psychologists", url: "/category/psychologists", icon: User },
];

export function AppSidebar() {
  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <SidebarMenuItem key={category.title}>
                    <SidebarMenuButton asChild>
                      <Link href={category.url}>
                        <div className="flex items-center cursor-pointer">
                          <Icon className="w-5 h-5 text-[#F5A15B]" aria-hidden="true" />
                          <span className="ml-2 text-[#003E65]">{category.title}</span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>

          {/* Booking Feature with Calendar Integration */}
          <SidebarGroup>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/booking">
                  <div className="flex items-center bg-[#E8DBDB] text-[#F06255] px-4 py-2 rounded-lg hover:bg-[#e05045] transition mt-4 cursor-pointer">
                    <Calendar className="w-5 h-5 text-[#F5A15B]" aria-hidden="true" />
                    <span className="ml-2 text-[#003E65]">Book an Appointment</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarGroup>

          {/* Registration Feature */}
          <SidebarGroup>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/registerform">
                  <div className="flex items-center bg-[#E8DBDB] text-[#F06255] px-4 py-2 rounded-lg hover:bg-[#e05045] transition mt-4 cursor-pointer">
                    <ClipboardList className="w-5 h-5 text-[#F5A15B]" aria-hidden="true" />
                    <span className="ml-2 text-[#003E65]">Patient Register Form</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}