// Navigation Types
import { ReactNode } from 'react';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string | number;
  children?: NavItem[];
  permissions?: string[];
  disabled?: boolean;
}

export interface Breadcrumb {
  label: string;
  href?: string;
  icon?: ReactNode;
  current?: boolean;
}

export interface RouteConfig {
  path: string;
  element: ReactNode;
  layout?: 'default' | 'auth' | 'minimal';
  title?: string;
  permissions?: string[];
  redirectTo?: string;
  children?: RouteConfig[];
}

export interface NavigationState {
  currentPath: string;
  previousPath: string | null;
  breadcrumbs: Breadcrumb[];
  isNavigating: boolean;
}

export type NavigateOptions = {
  replace?: boolean;
  state?: any;
};
