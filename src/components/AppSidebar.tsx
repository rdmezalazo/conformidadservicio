import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FileText,
  Plus,
  List,
  Upload,
  Settings,
  Users,
  BarChart3,
  Building,
  Calendar,
  Shield,
  Home,
  Palette
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    group: "Principal",
    roles: ["admin", "supervisor", "usuario_responsable"]
  },
  {
    title: "Nueva Conformidad",
    url: "/nueva-conformidad",
    icon: Plus,
    group: "Conformidades",
    roles: ["admin", "supervisor", "usuario_responsable"]
  },
  {
    title: "Lista de Conformidades",
    url: "/conformidades",
    icon: List,
    group: "Conformidades",
    roles: ["admin", "supervisor", "usuario_responsable"]
  },
  {
    title: "Carga Masiva",
    url: "/carga-masiva",
    icon: Upload,
    group: "Conformidades",
    roles: ["admin"]
  },
  {
    title: "Diseñador PDF",
    url: "/pdf-designer",
    icon: Palette,
    group: "Conformidades",
    roles: ["admin"]
  },
  {
    title: "Usuarios",
    url: "/usuarios",
    icon: Users,
    group: "Administración",
    roles: ["admin", "supervisor"]
  },
  {
    title: "Configuración",
    url: "/configuracion",
    icon: Settings,
    group: "Administración",
    roles: ["admin", "supervisor", "usuario_responsable"]
  }
];

// Función para filtrar menús por rol
const getMenuItemsForRole = (userRole: string | null) => {
  if (!userRole) return [];
  
  return menuItems.filter(item => item.roles.includes(userRole));
};

export function AppSidebar() {
  const { state } = useSidebar();
  const { userRole } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  // Filtrar menús según el rol del usuario
  const allowedMenuItems = getMenuItemsForRole(userRole);

  // Agrupar elementos filtrados por categoría
  const groupedItems = allowedMenuItems.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof allowedMenuItems>);

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  const getNavClasses = (path: string) => {
    const baseClasses = "flex items-center gap-3 transition-colors";
    return isActive(path) 
      ? `${baseClasses} bg-primary text-primary-foreground font-medium` 
      : `${baseClasses} hover:bg-muted/50`;
  };

  return (
    <Sidebar collapsible="icon">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          {!collapsed && (
            <span className="font-bold text-lg">Conformidades</span>
          )}
        </div>
      </div>

      <SidebarContent>
        {Object.entries(groupedItems).map(([groupName, items]) => {
          const hasActiveItem = items.some(item => isActive(item.url));
          
          return (
            <SidebarGroup key={groupName}>
              {!collapsed && (
                <SidebarGroupLabel>{groupName}</SidebarGroupLabel>
              )}
              
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={getNavClasses(item.url)}>
                          <item.icon className="h-4 w-4 min-w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}